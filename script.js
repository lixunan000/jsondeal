// 全局变量
let currentModal = null;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 绑定按钮事件
    document.getElementById('formatBtn').addEventListener('click', () => openModal('formatModal'));
    document.getElementById('compareBtn').addEventListener('click', () => openModal('compareModal'));
    
    // 绑定格式化功能事件
    document.getElementById('formatExecute').addEventListener('click', formatJSON);
    document.getElementById('formatCopy').addEventListener('click', copyFormatResult);
    
    // 绑定对比功能事件
    document.getElementById('compareExecute').addEventListener('click', compareJSON);
    document.getElementById('compareClear').addEventListener('click', clearHighlights);
    
    // 绑定关闭按钮事件
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    
    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentModal) {
            closeModal();
        }
    });
}

// 打开模态框
function openModal(modalId) {
    currentModal = document.getElementById(modalId);
    currentModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 如果是格式化模态框，清空输入输出
    if (modalId === 'formatModal') {
        document.getElementById('formatInput').value = '';
        document.getElementById('formatOutput').value = '';
    }
    // 如果是对比模态框，清空所有内容和高亮
    else if (modalId === 'compareModal') {
        document.getElementById('compareInput1').value = '';
        document.getElementById('compareInput2').value = '';
        clearHighlights();
    }
}

// 关闭模态框
function closeModal() {
    if (currentModal) {
        currentModal.style.display = 'none';
        currentModal = null;
        document.body.style.overflow = 'auto';
    }
}

// JSON格式化功能
async function formatJSON() {
    const input = document.getElementById('formatInput').value.trim();
    const output = document.getElementById('formatOutput');
    const executeBtn = document.getElementById('formatExecute');
    
    if (!input) {
        showNotification('请输入JSON字符串', 'error');
        return;
    }
    
    // 显示加载状态
    const originalText = executeBtn.textContent;
    executeBtn.innerHTML = '<span class="loading"></span> 格式化中...';
    executeBtn.disabled = true;
    
    try {
        // 尝试在前端直接格式化
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 4);
        output.value = formatted;
        showNotification('格式化成功！', 'success');
    } catch (error) {
        // 如果前端格式化失败，尝试调用后端API
        try {
            const response = await fetch('/api/format', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ json_string: input })
            });
            
            if (!response.ok) {
                throw new Error('服务器错误');
            }
            
            const result = await response.json();
            if (result.success) {
                output.value = result.formatted_json;
                showNotification('格式化成功！', 'success');
            } else {
                throw new Error(result.error || '格式化失败');
            }
        } catch (apiError) {
            showNotification('JSON格式错误，请检查输入', 'error');
            console.error('Format error:', apiError);
        }
    } finally {
        // 恢复按钮状态
        executeBtn.textContent = originalText;
        executeBtn.disabled = false;
    }
}

// 复制格式化结果
function copyFormatResult() {
    const output = document.getElementById('formatOutput');
    if (!output.value) {
        showNotification('没有内容可复制', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output.value).then(() => {
        showNotification('已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败', 'error');
    });
}

// JSON对比功能
async function compareJSON() {
    const input1 = document.getElementById('compareInput1').value.trim();
    const input2 = document.getElementById('compareInput2').value.trim();
    const executeBtn = document.getElementById('compareExecute');
    
    if (!input1 || !input2) {
        showNotification('请填写两个JSON进行对比', 'warning');
        return;
    }
    
    // 显示加载状态
    const originalText = executeBtn.textContent;
    executeBtn.innerHTML = '<span class="loading"></span> 对比中...';
    executeBtn.disabled = true;
    
    try {
        // 先清除之前的高亮
        clearHighlights();
        
        // 尝试调用后端API进行对比
        const response = await fetch('/api/compare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                json1: input1,
                json2: input2
            })
        });
        
        if (!response.ok) {
            throw new Error('服务器错误');
        }
        
        const result = await response.json();
        if (result.success) {
            // 在文本行上直接高亮显示差异
            highlightDifferences(input1, input2, result.differences);
            // 显示详细对比结果
            displayComparisonResult(result.differences, result.summary);
            showNotification('对比完成，差异已高亮显示', 'success');
        } else {
            throw new Error(result.error || '对比失败');
        }
    } catch (error) {
        console.error('Compare error:', error);
        showNotification('对比失败，请检查JSON格式', 'error');
    } finally {
        // 恢复按钮状态
        executeBtn.textContent = originalText;
        executeBtn.disabled = false;
    }
}

// 在文本行上高亮显示差异
function highlightDifferences(json1, json2, differences) {
    if (!differences || differences.length === 0) {
        showNotification('两个JSON完全相同', 'info');
        return;
    }
    
    // 将JSON字符串分割成行
    const lines1 = json1.split('\n');
    const lines2 = json2.split('\n');
    
    // 创建行级高亮
    const highlight1 = createLineHighlights(lines1, differences, 'json1');
    const highlight2 = createLineHighlights(lines2, differences, 'json2');
    
    // 显示高亮
    document.getElementById('compareHighlight1').innerHTML = highlight1;
    document.getElementById('compareHighlight2').innerHTML = highlight2;
}

// 创建行级高亮HTML
function createLineHighlights(lines, differences, jsonType) {
    let html = '';
    
    // 获取差异行号映射
    const diffLineMap = createDiffLineMap(lines, differences, jsonType);
    
    lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const highlightClass = diffLineMap[lineNumber] || '';
        
        html += `<div class="highlight-line ${highlightClass}" title="行 ${lineNumber}"></div>`;
    });
    
    return html;
}

// 创建差异行号映射
function createDiffLineMap(lines, differences, jsonType) {
    const diffLineMap = {};
    
    differences.forEach(diff => {
        const diffValue = jsonType === 'json1' ? diff.value1 : diff.value2;
        
        // 处理数组类型的差异
        if (diff.path.includes('[') && diff.path.includes(']')) {
            // 这是数组元素的差异
            highlightArrayDifferences(lines, diffLineMap, diff, jsonType);
        } else {
            // 处理普通键值对的差异
            highlightKeyValueDifferences(lines, diffLineMap, diff, jsonType);
        }
    });
    
    return diffLineMap;
}

// 高亮数组差异
function highlightArrayDifferences(lines, diffLineMap, diff, jsonType) {
    const pathParts = diff.path.split('.');
    const arrayPath = pathParts.slice(0, -1).join('.'); // 获取数组路径
    const arrayIndex = pathParts[pathParts.length - 1]; // 获取数组索引
    
    // 查找包含数组的行
    let arrayStartLine = -1;
    let arrayEndLine = -1;
    let bracketCount = 0;
    
    lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        
        // 查找数组开始位置
        if (line.includes(arrayPath) && line.includes('[')) {
            arrayStartLine = lineNumber;
            bracketCount = 1;
        }
        
        // 统计括号数量，确定数组结束位置
        if (arrayStartLine !== -1) {
            bracketCount += (line.match(/\[/g) || []).length;
            bracketCount -= (line.match(/\]/g) || []).length;
            
            if (bracketCount === 0) {
                arrayEndLine = lineNumber;
            }
        }
        
        // 在数组范围内查找具体的数组元素
        if (arrayStartLine !== -1 && arrayEndLine === -1) {
            // 检查是否是数组元素行
            if (line.trim().startsWith('"') || line.trim().startsWith('{') || line.trim().startsWith('[')) {
                // 检查是否包含差异值
                const diffValue = jsonType === 'json1' ? diff.value1 : diff.value2;
                if (diffValue && line.includes(JSON.stringify(diffValue).replace(/"/g, ''))) {
                    assignHighlightClass(diffLineMap, lineNumber, diff.type, jsonType);
                }
            }
        }
    });
}

// 高亮键值对差异
function highlightKeyValueDifferences(lines, diffLineMap, diff, jsonType) {
    const diffValue = jsonType === 'json1' ? diff.value1 : diff.value2;
    
    // 获取路径中的最后一个键名
    const pathParts = diff.path.split('.');
    const lastKey = pathParts[pathParts.length - 1];
    
    // 查找包含差异值的行
    lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const trimmedLine = line.trim();
        
        // 方法1：精确键名匹配 - 这是最可靠的方法
        // 检查行是否包含该键名，并且格式正确（"key":）
        const keyPattern = new RegExp(`\\"${lastKey}\\"\\s*:`);
        if (keyPattern.test(line)) {
            // 根据差异类型和JSON类型正确分配高亮
            assignHighlightClass(diffLineMap, lineNumber, diff.type, jsonType);
            return;
        }
        
        // 方法2：值匹配 - 只在特定情况下使用
        if (diffValue && diff.type === 'added' && jsonType === 'json2') {
            // 只有当是新增的值且在JSON 2中时才使用值匹配
            const valueStr = typeof diffValue === 'string' ? 
                `"${diffValue}"` : String(diffValue);
            
            // 检查行是否包含该值，并且该行包含一个键名（确保是键值对）
            const valuePattern = new RegExp(`(^|\\s|,)${escapeRegExp(valueStr.replace(/"/g, ''))}(\\s|,|$)`);
            if (valuePattern.test(line)) {
                // 确保这一行包含一个键名（格式："key": value）
                const keyValuePattern = /"[^"]+"\s*:/;
                if (keyValuePattern.test(line)) {
                    // 确保这个键名不是已经存在的键
                    const existingKeyPattern = new RegExp(`\\"${lastKey}\\"\\s*:`);
                    if (!existingKeyPattern.test(line)) {
                        assignHighlightClass(diffLineMap, lineNumber, diff.type, jsonType);
                        return;
                    }
                }
            }
        }
        
        // 方法3：处理嵌套对象 - 检查路径中的父级键
        if (pathParts.length > 1) {
            const parentKey = pathParts[pathParts.length - 2];
            const parentPattern = new RegExp(`\\"${parentKey}\\"\\s*:`);
            if (parentPattern.test(line)) {
                // 检查这一行是否开始一个对象或数组
                if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[')) {
                    // 高亮对象/数组的开始行
                    assignHighlightClass(diffLineMap, lineNumber, diff.type, jsonType);
                    return;
                }
            }
        }
    });
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 分配高亮类
function assignHighlightClass(diffLineMap, lineNumber, diffType, jsonType) {
    let highlightClass = '';
    
    switch (diffType) {
        case 'added':
            if (jsonType === 'json2') {
                highlightClass = 'highlight-added'; // 绿色：新增
            }
            break;
        case 'removed':
            if (jsonType === 'json1') {
                highlightClass = 'highlight-removed'; // 红色：删除
            }
            break;
        case 'changed':
        case 'length_changed':
            highlightClass = 'highlight-changed'; // 黄色：修改
            break;
    }
    
    if (highlightClass) {
        diffLineMap[lineNumber] = highlightClass;
    }
}

// 清除高亮
function clearHighlights() {
    document.getElementById('compareHighlight1').innerHTML = '';
    document.getElementById('compareHighlight2').innerHTML = '';
    document.getElementById('compareResult').innerHTML = '';
}

// 显示详细对比结果
function displayComparisonResult(differences, summary) {
    const resultDiv = document.getElementById('compareResult');
    
    if (!differences || differences.length === 0) {
        resultDiv.innerHTML = '<span style="color: #28a745;">✅ 两个JSON完全相同</span>';
        return;
    }
    
    // 按类型分组差异
    const groupedDifferences = groupDifferencesByType(differences);
    
    let html = `<div class="differences-summary">
        <p><strong>对比摘要：</strong></p>
        <ul>
            <li>总差异数: <strong>${summary?.total_differences || differences.length}</strong></li>
            <li>删除项: <strong style="color: #dc3545;">${groupedDifferences.removed.length}</strong></li>
            <li>新增项: <strong style="color: #28a745;">${groupedDifferences.added.length}</strong></li>
            <li>修改项: <strong style="color: #ffc107;">${groupedDifferences.changed.length}</strong></li>
            <li>JSON 1 键数量: <strong>${summary?.json1_keys || 'N/A'}</strong></li>
            <li>JSON 2 键数量: <strong>${summary?.json2_keys || 'N/A'}</strong></li>
        </ul>
    </div>`;
    
    // 显示删除的项
    if (groupedDifferences.removed.length > 0) {
        html += `<div class="differences-group">
            <h4 style="color: #dc3545;">❌ 删除的项 (${groupedDifferences.removed.length})</h4>`;
        
        groupedDifferences.removed.forEach((diff, index) => {
            html += `<div class="difference-item diff-removed">
                <strong>${index + 1}.</strong> <code>${diff.path}</code><br>
                <strong>原值:</strong> <span class="diff-value">${escapeHtml(diff.value1)}</span>
            </div>`;
        });
        
        html += '</div>';
    }
    
    // 显示新增的项
    if (groupedDifferences.added.length > 0) {
        html += `<div class="differences-group">
            <h4 style="color: #28a745;">➕ 新增的项 (${groupedDifferences.added.length})</h4>`;
        
        groupedDifferences.added.forEach((diff, index) => {
            html += `<div class="difference-item diff-added">
                <strong>${index + 1}.</strong> <code>${diff.path}</code><br>
                <strong>新值:</strong> <span class="diff-value">${escapeHtml(diff.value2)}</span>
            </div>`;
        });
        
        html += '</div>';
    }
    
    // 显示修改的项
    if (groupedDifferences.changed.length > 0) {
        html += `<div class="differences-group">
            <h4 style="color: #ffc107;">🔄 修改的项 (${groupedDifferences.changed.length})</h4>`;
        
        groupedDifferences.changed.forEach((diff, index) => {
            html += `<div class="difference-item diff-changed">
                <strong>${index + 1}.</strong> <code>${diff.path}</code><br>
                <strong>原值:</strong> <span class="diff-value">${escapeHtml(diff.value1)}</span><br>
                <strong>新值:</strong> <span class="diff-value">${escapeHtml(diff.value2)}</span>
            </div>`;
        });
        
        html += '</div>';
    }
    
    resultDiv.innerHTML = html;
}

// 按类型分组差异
function groupDifferencesByType(differences) {
    const grouped = {
        removed: [],
        added: [],
        changed: []
    };
    
    differences.forEach(diff => {
        switch (diff.type) {
            case 'removed':
                grouped.removed.push(diff);
                break;
            case 'added':
                grouped.added.push(diff);
                break;
            case 'changed':
            case 'length_changed':
                grouped.changed.push(diff);
                break;
        }
    });
    
    return grouped;
}

// 获取差异类型文本
function getDiffTypeText(type) {
    const typeMap = {
        'added': '新增',
        'removed': '删除',
        'changed': '修改',
        'length_changed': '长度变化'
    };
    return typeMap[type] || type;
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除现有的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // 设置背景颜色
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// 添加通知动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 添加一些实用工具函数
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// 示例JSON数据（用于演示）
function loadExampleData() {
    const exampleJSON = `{
    "name": "张三",
    "age": 25,
    "hobbies": ["篮球", "阅读", "编程"],
    "address": {
        "city": "北京",
        "street": "朝阳区"
    }
}`;
    
    // 为格式化输入框添加示例
    document.getElementById('formatInput').addEventListener('focus', function() {
        if (!this.value) {
            this.value = exampleJSON;
        }
    });
    
    // 为对比输入框添加示例
    const exampleJSON2 = `{
    "name": "李四",
    "age": 30,
    "hobbies": ["足球", "音乐"],
    "address": {
        "city": "上海",
        "street": "浦东新区"
    }
}`;
    
    document.getElementById('compareInput1').addEventListener('focus', function() {
        if (!this.value) {
            this.value = exampleJSON;
        }
    });
    
    document.getElementById('compareInput2').addEventListener('focus', function() {
        if (!this.value) {
            this.value = exampleJSON2;
        }
    });
}

// 页面加载完成后调用示例数据加载
window.addEventListener('load', loadExampleData);