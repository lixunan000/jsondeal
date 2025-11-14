from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import difflib
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置
app.config['JSON_AS_ASCII'] = False  # 确保中文字符正确显示

@app.route('/')
def index():
    """主页重定向到静态文件"""
    return app.send_static_file('index.html')

@app.route('/api/format', methods=['POST'])
def format_json():
    """JSON格式化API"""
    try:
        data = request.get_json()
        if not data or 'json_string' not in data:
            return jsonify({
                'success': False,
                'error': '缺少JSON字符串参数'
            }), 400
        
        json_string = data['json_string'].strip()
        
        # 尝试解析JSON
        parsed_json = json.loads(json_string)
        
        # 格式化JSON，使用4个空格缩进，确保中文字符正确处理
        formatted_json = json.dumps(parsed_json, ensure_ascii=False, indent=4)
        
        return jsonify({
            'success': True,
            'formatted_json': formatted_json,
            'timestamp': datetime.now().isoformat()
        })
        
    except json.JSONDecodeError as e:
        return jsonify({
            'success': False,
            'error': f'JSON格式错误: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'服务器错误: {str(e)}'
        }), 500

@app.route('/api/compare', methods=['POST'])
def compare_json():
    """JSON对比API"""
    try:
        data = request.get_json()
        if not data or 'json1' not in data or 'json2' not in data:
            return jsonify({
                'success': False,
                'error': '缺少JSON参数'
            }), 400
        
        json1_str = data['json1'].strip()
        json2_str = data['json2'].strip()
        
        # 解析JSON
        json1 = json.loads(json1_str)
        json2 = json.loads(json2_str)
        
        # 对比JSON并找出差异
        differences = find_json_differences(json1, json2)
        
        return jsonify({
            'success': True,
            'differences': differences,
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_differences': len(differences),
                'json1_keys': count_keys(json1),
                'json2_keys': count_keys(json2)
            }
        })
        
    except json.JSONDecodeError as e:
        return jsonify({
            'success': False,
            'error': f'JSON格式错误: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'服务器错误: {str(e)}'
        }), 500

def find_json_differences(obj1, obj2, path=""):
    """递归查找JSON对象的差异"""
    differences = []
    
    # 获取所有键的并集
    all_keys = set()
    if isinstance(obj1, dict):
        all_keys.update(obj1.keys())
    if isinstance(obj2, dict):
        all_keys.update(obj2.keys())
    
    for key in all_keys:
        current_path = f"{path}.{key}" if path else key
        
        # 检查键是否存在
        if isinstance(obj1, dict) and key not in obj1:
            differences.append({
                'path': current_path,
                'type': 'added',
                'value1': None,
                'value2': json.dumps(obj2[key], ensure_ascii=False) if key in obj2 else None
            })
            continue
        
        if isinstance(obj2, dict) and key not in obj2:
            differences.append({
                'path': current_path,
                'type': 'removed',
                'value1': json.dumps(obj1[key], ensure_ascii=False) if key in obj1 else None,
                'value2': None
            })
            continue
        
        # 获取值
        val1 = obj1[key] if isinstance(obj1, dict) and key in obj1 else obj1
        val2 = obj2[key] if isinstance(obj2, dict) and key in obj2 else obj2
        
        # 比较值
        if isinstance(val1, dict) and isinstance(val2, dict):
            # 递归比较字典
            differences.extend(find_json_differences(val1, val2, current_path))
        elif isinstance(val1, list) and isinstance(val2, list):
            # 比较列表
            list_diffs = compare_lists(val1, val2, current_path)
            differences.extend(list_diffs)
        else:
            # 比较基本类型
            if val1 != val2:
                differences.append({
                    'path': current_path,
                    'type': 'changed',
                    'value1': json.dumps(val1, ensure_ascii=False) if val1 is not None else None,
                    'value2': json.dumps(val2, ensure_ascii=False) if val2 is not None else None
                })
    
    return differences

def compare_lists(list1, list2, path):
    """比较两个列表的差异"""
    differences = []
    
    # 首先检查整个数组是否相同
    if list1 == list2:
        return differences
    
    # 如果数组内容完全不同，直接标记为整个数组不同
    if set(list1) != set(list2):
        differences.append({
            'path': path,
            'type': 'changed',
            'value1': json.dumps(list1, ensure_ascii=False),
            'value2': json.dumps(list2, ensure_ascii=False)
        })
        return differences
    
    # 比较长度差异
    if len(list1) != len(list2):
        differences.append({
            'path': path,
            'type': 'length_changed',
            'value1': f"长度: {len(list1)}",
            'value2': f"长度: {len(list2)}"
        })
    
    # 比较每个元素
    max_len = max(len(list1), len(list2))
    for i in range(max_len):
        item_path = f"{path}[{i}]"
        
        if i >= len(list1):
            differences.append({
                'path': item_path,
                'type': 'added',
                'value1': None,
                'value2': json.dumps(list2[i], ensure_ascii=False) if i < len(list2) else None
            })
        elif i >= len(list2):
            differences.append({
                'path': item_path,
                'type': 'removed',
                'value1': json.dumps(list1[i], ensure_ascii=False) if i < len(list1) else None,
                'value2': None
            })
        else:
            # 递归比较元素
            if isinstance(list1[i], dict) and isinstance(list2[i], dict):
                differences.extend(find_json_differences(list1[i], list2[i], item_path))
            elif isinstance(list1[i], list) and isinstance(list2[i], list):
                differences.extend(compare_lists(list1[i], list2[i], item_path))
            elif list1[i] != list2[i]:
                differences.append({
                    'path': item_path,
                    'type': 'changed',
                    'value1': json.dumps(list1[i], ensure_ascii=False),
                    'value2': json.dumps(list2[i], ensure_ascii=False)
                })
    
    return differences

def count_keys(obj):
    """计算JSON对象中的键数量"""
    if isinstance(obj, dict):
        count = len(obj)
        for value in obj.values():
            count += count_keys(value)
        return count
    elif isinstance(obj, list):
        count = 0
        for item in obj:
            count += count_keys(item)
        return count
    else:
        return 0

@app.route('/api/health')
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# 静态文件服务
@app.route('/<path:filename>')
def static_files(filename):
    """静态文件服务"""
    return app.send_static_file(filename)

# 确保静态文件目录存在
static_dir = os.path.join(os.path.dirname(__file__), 'static')
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

# 设置静态文件目录
app.static_folder = '.'
app.static_url_path = ''

# GitHub Pages兼容性设置
if os.environ.get('GITHUB_ACTIONS'):
    # 在GitHub Actions环境中，使用不同的配置
    app.config['SERVER_NAME'] = None

if __name__ == '__main__':
    print("JSON小工具服务器启动中...")
    print("访问地址: http://localhost:7777")
    print("API文档:")
    print("  - POST /api/format - JSON格式化")
    print("  - POST /api/compare - JSON对比")
    print("  - GET /api/health - 健康检查")
    
    # 生产环境关闭debug模式
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # 在GitHub Pages环境中，不启动Flask服务器
    if not os.environ.get('GITHUB_ACTIONS'):
        app.run(debug=debug_mode, host='0.0.0.0', port=7777)
    else:
        print("GitHub Pages环境检测到，跳过服务器启动")