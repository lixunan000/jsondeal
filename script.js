// 全局变量
let currentModal = null;
let assertDebounceTimer; // 断言生成的防抖定时器

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeLineNumbers();
});

function initializeApp() {
    // 绑定按钮事件
    document.getElementById('formatBtn').addEventListener('click', () => openModal('formatModal'));
    document.getElementById('compareBtn').addEventListener('click', () => openModal('compareModal'));
    document.getElementById('assertBtn').addEventListener('click', () => openModal('assertModal'));
    document.getElementById('uidBtn').addEventListener('click', () => openModal('uidModal'));
    document.getElementById('idReplaceBtn').addEventListener('click', () => openModal('idReplaceModal'));
    document.getElementById('groovySqlBtn').addEventListener('click', () => openModal('groovySqlModal'));
    
    // 绑定格式化功能事件
    document.getElementById('formatExecute').addEventListener('click', formatJSON);
    document.getElementById('formatCopy').addEventListener('click', copyFormatResult);
    document.getElementById('formatClear').addEventListener('click', clearFormatInput);
    document.getElementById('formatDownload').addEventListener('click', downloadFormatResult);
    
    // 绑定对比功能事件
    document.getElementById('compareExecute').addEventListener('click', compareJSON);
    document.getElementById('compareClear').addEventListener('click', clearHighlights);
    document.getElementById('compareClearAll').addEventListener('click', clearCompareInputs);
    document.getElementById('compareLoadExample1').addEventListener('click', () => loadCompareExample(1));
    document.getElementById('compareLoadExample2').addEventListener('click', () => loadCompareExample(2));
    
    // 绑定断言生成功能事件
    document.getElementById('assertFormat').addEventListener('click', formatAssertJson);
    document.getElementById('assertClear').addEventListener('click', clearAssertJson);
    document.getElementById('assertCopy').addEventListener('click', copyAssertions);
    document.getElementById('assertGenerate').addEventListener('click', generateAssertions);
    
    // 监听断言输入变化
    document.getElementById('assertInput').addEventListener('input', function() {
        clearTimeout(assertDebounceTimer);
        assertDebounceTimer = setTimeout(() => {
            generateAssertions();
        }, 500);
    });
    
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
    
    // 绑定UID提取功能事件
    document.getElementById('uidExtract').addEventListener('click', extractUIDs);
    document.getElementById('uidCopy').addEventListener('click', copyUIDResult);
    document.getElementById('uidClear').addEventListener('click', clearUIDInputs);
    document.getElementById('uidDownload').addEventListener('click', downloadUIDResult);
    
    // 绑定批量ID替换功能事件
    document.getElementById('idReplaceExecute').addEventListener('click', replaceIds);
    document.getElementById('idReplaceCopy').addEventListener('click', copyIdReplaceResult);
    document.getElementById('idReplaceClear').addEventListener('click', clearIdReplaceInputs);
    document.getElementById('idReplaceDownload').addEventListener('click', downloadIdReplaceResult);
    
    // 绑定文件上传事件
    document.getElementById('uploadBtn').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // 绑定groovy文件上传事件
    document.getElementById('groovyUploadBtn').addEventListener('click', function() {
        document.getElementById('groovyFileInput').click();
    });
    
    document.getElementById('groovyFileInput').addEventListener('change', handleGroovyFileSelect);
    
    // 绑定groovy SQL提取功能事件
    document.getElementById('groovyExtract').addEventListener('click', groovyExtractSql);
    document.getElementById('groovyCopy').addEventListener('click', copyGroovyResult);
    document.getElementById('groovyClear').addEventListener('click', clearGroovyInputs);
    document.getElementById('groovyDownload').addEventListener('click', downloadGroovyResult);
    
    // 绑定groovy SQL提取功能事件
    document.getElementById('groovyExtract').addEventListener('click', groovyExtractSql);
    document.getElementById('groovyCopy').addEventListener('click', copyGroovyResult);
    document.getElementById('groovyClear').addEventListener('click', clearGroovyInputs);
    document.getElementById('groovyDownload').addEventListener('click', downloadGroovyResult);
    
    // 绑定拖拽事件
    setupDragAndDrop();
    setupGroovyDragAndDrop();
    
    // 监听UID输入变化
    document.getElementById('uidInput').addEventListener('input', function() {
        updateLineNumbers('uidInput');
    });
    
    // 监听groovy输入变化
    document.getElementById('groovyInput').addEventListener('input', function() {
        updateLineNumbers('groovyInput');
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
        // 更新行号显示
        updateLineNumbers('formatInput');
        updateLineNumbers('formatOutput');
    }
    // 如果是对比模态框，清空所有内容和高亮
    else if (modalId === 'compareModal') {
        document.getElementById('compareInput1').value = '';
        document.getElementById('compareInput2').value = '';
        clearHighlights();
        // 更新行号显示
        updateLineNumbers('compareInput1');
        updateLineNumbers('compareInput2');
    }
    // 如果是断言生成模态框，清空输入输出
    else if (modalId === 'assertModal') {
        document.getElementById('assertInput').value = '';
        document.getElementById('assertOutput').value = '';
        // 重置状态
        updateAssertStatus('就绪', '');
    }
    // 如果是UID提取模态框，清空输入输出
    else if (modalId === 'uidModal') {
        document.getElementById('uidInput').value = '';
        document.getElementById('uidOutput').value = '';
        document.getElementById('fileList').innerHTML = '';
        document.getElementById('uidStats').textContent = '已提取: 0 个UID';
        document.getElementById('fileInput').value = '';
        
        // 更新行号显示
        updateLineNumbers('uidInput');
        updateLineNumbers('uidOutput');
    }
    // 如果是批量ID替换模态框，清空输入输出
    else if (modalId === 'idReplaceModal') {
        document.getElementById('idReplaceInput').value = '';
        document.getElementById('idReplaceOutput').value = '';
        document.getElementById('startSnowflakeId').value = '';
        
        // 更新行号显示
        updateLineNumbers('idReplaceInput');
        updateLineNumbers('idReplaceOutput');
    }
    // 如果是groovy提取sql模态框，清空输入输出
    else if (modalId === 'groovySqlModal') {
        document.getElementById('groovyInput').value = '';
        document.getElementById('groovyOutput').value = '';
        document.getElementById('groovyFileList').innerHTML = '';
        document.getElementById('groovyStats').textContent = '已提取: 0 条SQL';
        document.getElementById('groovyFileInput').value = '';
        
        // 更新行号显示
        updateLineNumbers('groovyInput');
        updateLineNumbers('groovyOutput');
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
function formatJSON() {
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
    
    // 使用setTimeout模拟异步操作，保持UI响应
    setTimeout(() => {
        try {
            // 在前端直接格式化
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 4);
            output.value = formatted;
            showNotification('格式化成功！', 'success');
            
            // 更新输出区域的行号
            updateLineNumbers('formatOutput');
        } catch (error) {
            showNotification('JSON格式错误，请检查输入', 'error');
            console.error('Format error:', error);
        } finally {
            // 恢复按钮状态
            executeBtn.textContent = originalText;
            executeBtn.disabled = false;
        }
    }, 100);
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
function compareJSON() {
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
    
    // 使用setTimeout模拟异步操作
    setTimeout(() => {
        try {
            // 先清除之前的高亮
            clearHighlights();
            
            // 在前端直接对比JSON
            const obj1 = JSON.parse(input1);
            const obj2 = JSON.parse(input2);
            
            // 查找差异
            const differences = findJSONDifferences(obj1, obj2);
            
            // 在文本行上直接高亮显示差异
            highlightDifferences(input1, input2, differences);
            
            // 显示详细对比结果
            const summary = {
                total_differences: differences.length,
                json1_keys: countKeys(obj1),
                json2_keys: countKeys(obj2)
            };
            displayComparisonResult(differences, summary);
            
            showNotification('对比完成，差异已高亮显示', 'success');
        } catch (error) {
            console.error('Compare error:', error);
            showNotification('对比失败，请检查JSON格式', 'error');
        } finally {
            // 恢复按钮状态
            executeBtn.textContent = originalText;
            executeBtn.disabled = false;
        }
    }, 100);
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
    // 获取路径中的最后一个键名
    const pathParts = diff.path.split('.');
    const lastKey = pathParts[pathParts.length - 1];
    
    // 查找包含差异值的行
    lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const trimmedLine = line.trim();
        
        // 方法1：精确键名匹配 - 这是最可靠的方法
        // 检查行是否包含该键名，并且格式正确（"key":）
        const keyPattern = new RegExp(`\\"${lastKey}\\\"\\s*:`);
        if (keyPattern.test(line)) {
            // 根据差异类型和JSON类型正确分配高亮
            assignHighlightClass(diffLineMap, lineNumber, diff.type, jsonType);
            return;
        }
        
        // 方法2：值匹配 - 只在特定情况下使用（已禁用，容易出错）
        // 这个方法被禁用，因为它容易错误匹配相同值的不同键
        // 例如："age": 30 和 "eee": 30 会互相干扰
        
        // 方法3：处理嵌套对象 - 检查路径中的父级键
        if (pathParts.length > 1) {
            const parentKey = pathParts[pathParts.length - 2];
            const parentPattern = new RegExp(`\\"${parentKey}\\\"\\s*:`);
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
            // 新增的字段只在JSON2中显示为绿色
            if (jsonType === 'json2') {
                highlightClass = 'highlight-added'; // 绿色：新增
            }
            break;
        case 'removed':
            // 删除的字段只在JSON1中显示为红色
            if (jsonType === 'json1') {
                highlightClass = 'highlight-removed'; // 红色：删除
            }
            break;
        case 'changed':
        case 'length_changed':
            // 修改的字段在JSON1和JSON2中都显示为黄色
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

// JSON对比核心函数 - 在前端查找JSON差异
function findJSONDifferences(obj1, obj2, path = "") {
    const differences = [];
    
    // 获取所有键的并集
    const allKeys = new Set([
        ...(typeof obj1 === 'object' && obj1 !== null ? Object.keys(obj1) : []),
        ...(typeof obj2 === 'object' && obj2 !== null ? Object.keys(obj2) : [])
    ]);
    
    for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // 检查键是否存在
        if (obj1 && !obj1.hasOwnProperty(key)) {
            differences.push({
                path: currentPath,
                type: 'added',
                value1: null,
                value2: safeStringify(obj2[key])
            });
            continue;
        }
        
        if (obj2 && !obj2.hasOwnProperty(key)) {
            differences.push({
                path: currentPath,
                type: 'removed',
                value1: safeStringify(obj1[key]),
                value2: null
            });
            continue;
        }
        
        // 获取值
        const val1 = obj1[key];
        const val2 = obj2[key];
        
        // 比较值
        if (isObject(val1) && isObject(val2)) {
            // 递归比较对象
            differences.push(...findJSONDifferences(val1, val2, currentPath));
        } else if (Array.isArray(val1) && Array.isArray(val2)) {
            // 比较数组
            const arrayDiffs = compareArrays(val1, val2, currentPath);
            differences.push(...arrayDiffs);
        } else {
            // 比较基本类型
            if (!deepEqual(val1, val2)) {
                differences.push({
                    path: currentPath,
                    type: 'changed',
                    value1: safeStringify(val1),
                    value2: safeStringify(val2)
                });
            }
        }
    }
    
    return differences;
}

// 比较数组
function compareArrays(arr1, arr2, path) {
    const differences = [];
    
    // 检查长度差异
    if (arr1.length !== arr2.length) {
        differences.push({
            path: path,
            type: 'length_changed',
            value1: `长度: ${arr1.length}`,
            value2: `长度: ${arr2.length}`
        });
    }
    
    // 比较每个元素
    const maxLen = Math.max(arr1.length, arr2.length);
    for (let i = 0; i < maxLen; i++) {
        const itemPath = `${path}[${i}]`;
        
        if (i >= arr1.length) {
            differences.push({
                path: itemPath,
                type: 'added',
                value1: null,
                value2: safeStringify(arr2[i])
            });
        } else if (i >= arr2.length) {
            differences.push({
                path: itemPath,
                type: 'removed',
                value1: safeStringify(arr1[i]),
                value2: null
            });
        } else {
            // 递归比较元素
            if (isObject(arr1[i]) && isObject(arr2[i])) {
                differences.push(...findJSONDifferences(arr1[i], arr2[i], itemPath));
            } else if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
                differences.push(...compareArrays(arr1[i], arr2[i], itemPath));
            } else if (!deepEqual(arr1[i], arr2[i])) {
                differences.push({
                    path: itemPath,
                    type: 'changed',
                    value1: safeStringify(arr1[i]),
                    value2: safeStringify(arr2[i])
                });
            }
        }
    }
    
    return differences;
}

// 深度比较两个值是否相等
function deepEqual(a, b) {
    if (a === b) return true;
    
    if (typeof a !== typeof b) return false;
    
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => deepEqual(item, b[index]));
    }
    
    if (isObject(a) && isObject(b)) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => deepEqual(a[key], b[key]));
    }
    
    return false;
}

// 安全地序列化值
function safeStringify(value) {
    if (value === undefined || value === null) return null;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

// 检查是否为对象
function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

// 计算JSON对象的键数量
function countKeys(obj) {
    if (!obj || typeof obj !== 'object') return 0;
    
    let count = Object.keys(obj).length;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            count += countKeys(obj[key]);
        }
    }
    return count;
}

// 清空格式化输入
function clearFormatInput() {
    document.getElementById('formatInput').value = '';
    document.getElementById('formatOutput').value = '';
    showNotification('输入已清空', 'info');
    
    // 更新行号显示
    updateLineNumbers('formatInput');
    updateLineNumbers('formatOutput');
}

// 下载格式化结果
function downloadFormatResult() {
    const output = document.getElementById('formatOutput').value;
    if (!output) {
        showNotification('没有内容可下载', 'warning');
        return;
    }
    
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('文件已下载', 'success');
}

// 清空对比输入
function clearCompareInputs() {
    document.getElementById('compareInput1').value = '';
    document.getElementById('compareInput2').value = '';
    clearHighlights();
    document.getElementById('compareResult').innerHTML = '';
    showNotification('所有输入已清空', 'info');
    
    // 更新行号显示
    updateLineNumbers('compareInput1');
    updateLineNumbers('compareInput2');
}

// 加载对比示例
function loadCompareExample(exampleNum) {
    const example1 = `{
    "name": "张三",
    "age": 25,
    "hobbies": ["篮球", "阅读", "编程"],
    "address": {
        "city": "北京",
        "street": "朝阳区"
    }
}`;

    const example2 = `{
    "name": "李四",
    "age": 30,
    "hobbies": ["足球", "音乐"],
    "address": {
        "city": "上海",
        "street": "浦东新区"
    }
}`;

    if (exampleNum === 1) {
        document.getElementById('compareInput1').value = example1;
        showNotification('示例1已加载', 'success');
        updateLineNumbers('compareInput1');
    } else {
        document.getElementById('compareInput2').value = example2;
        showNotification('示例2已加载', 'success');
        updateLineNumbers('compareInput2');
    }
}

// 初始化行号功能
function initializeLineNumbers() {
    // 需要联动行号的文本区域
    const lineNumberTextareas = [
        'formatInput', 'formatOutput',
        'compareInput1', 'compareInput2',
        'uidInput', 'uidOutput',
        'idReplaceInput', 'idReplaceOutput',
        'groovyInput', 'groovyOutput'
    ];

    // 使用事件委托，监听整个文档的输入事件
    document.addEventListener('input', function(e) {
        const target = e.target;
        const textareaId = target.id;

        // 检查是否是目标文本区域
        if (lineNumberTextareas.includes(textareaId)) {
            updateLineNumbers(textareaId);
        }
    });

    // 监听粘贴事件
    document.addEventListener('paste', function(e) {
        const target = e.target;
        const textareaId = target.id;

        // 检查是否是目标文本区域
        if (lineNumberTextareas.includes(textareaId)) {
            // 使用setTimeout确保在粘贴内容后更新行号
            setTimeout(() => {
                updateLineNumbers(textareaId);
            }, 10);
        }
    });

    // 监听滚动事件
    document.addEventListener('scroll', function(e) {
        const target = e.target;
        const textareaId = target.id;

        // 检查是否是目标文本区域
        if (lineNumberTextareas.includes(textareaId)) {
            syncLineNumbers(textareaId);
        }
    }, true); // 使用捕获阶段确保能监听到
    
    // 初始更新所有文本区域的行号
    updateAllLineNumbers();
}

// 更新所有文本区域的行号
function updateAllLineNumbers() {
    const textareas = ['formatInput', 'formatOutput', 'compareInput1', 'compareInput2', 'uidInput', 'uidOutput'];
    textareas.forEach(id => {
        updateLineNumbers(id);
    });
}

// 更新行号显示
function updateLineNumbers(textareaId) {
    const textarea = document.getElementById(textareaId);
    const lineNumbersId = textareaId + 'LineNumbers';
    const lineNumbers = document.getElementById(lineNumbersId);
    
    if (!textarea || !lineNumbers) return;
    
    const content = textarea.value;
    const lines = content.split('\n');
    const lineCount = lines.length;
    
    // 生成行号HTML
    let lineNumbersHtml = '';
    for (let i = 1; i <= lineCount; i++) {
        lineNumbersHtml += `<div>${i}</div>`;
    }
    
    // 如果内容为空，至少显示一行
    if (lineCount === 0) {
        lineNumbersHtml = '<div>1</div>';
    }
    
    lineNumbers.innerHTML = lineNumbersHtml;
    
    // 同步滚动
    syncLineNumbers(textareaId);
}

// 同步文本区域和行号的滚动
function syncLineNumbers(textareaId) {
    const textarea = document.getElementById(textareaId);
    const lineNumbersId = textareaId + 'LineNumbers';
    const lineNumbers = document.getElementById(lineNumbersId);

    if (!textarea || !lineNumbers) return;

    lineNumbers.scrollTop = textarea.scrollTop;

    // 同步高亮覆盖层（如JSON对比弹窗），保证高亮位置跟随文本滚动
    const overlay = document.querySelector('#' + textareaId + ' ~ .highlight-overlay')
        || document.getElementById(textareaId.replace('Input', 'Highlight'));
    if (overlay) {
        overlay.scrollTop = textarea.scrollTop;
    }
}

// JSON断言生成功能
function formatAssertJson() {
    const input = document.getElementById('assertInput').value.trim();
    const output = document.getElementById('assertOutput');
    
    if (!input) {
        showNotification('请输入JSON字符串', 'error');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 4);
        document.getElementById('assertInput').value = formatted;
        showNotification('格式化成功！', 'success');
    } catch (error) {
        showNotification('JSON转换失败', 'error');
    }
}

// 清空断言JSON
function clearAssertJson() {
    document.getElementById('assertInput').value = '';
    document.getElementById('assertOutput').value = '';
    updateAssertStatus('就绪', '');
    showNotification('输入已清空', 'info');
}

// 复制断言
function copyAssertions() {
    const output = document.getElementById('assertOutput').value;
    if (!output) {
        showNotification('没有内容可复制', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
        showNotification('已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败', 'error');
    });
}

// 生成断言
function generateAssertions() {
    const input = document.getElementById('assertInput').value.trim();
    
    if (!input) {
        updateAssertStatus('错误', '请输入JSON数据');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        const assertions = generateAssertionsFromJson(parsed);
        document.getElementById('assertOutput').value = assertions;
        updateAssertStatus('完成', `已生成 ${countAssertions(assertions)} 条断言`);
        showNotification('断言生成成功！', 'success');
    } catch (error) {
        updateAssertStatus('错误', 'JSON转换失败');
        showNotification('JSON转换失败', 'error');
    }
}

// 从JSON生成断言
function generateAssertionsFromJson(json, path = 'resBody') {
    let assertions = '';
    
    if (typeof json === 'object' && json !== null) {
        if (Array.isArray(json)) {
            // 数组处理：不再生成 length 断言，只断言数组元素的字段值
            json.forEach((item, index) => {
                const itemPath = `${path}[${index}]`;
                assertions += generateAssertionsFromJson(item, itemPath);
            });
        } else {
            // 对象处理
            Object.keys(json).forEach(key => {
                const value = json[key];
                const fullPath = path === 'resBody' ? `${path}.${key}` : `${path}.${key}`;
                
                // 获取过滤条件
                const includeFilter = getIncludeFilter();
                const excludeFilter = getExcludeFilter();
                
                // 应用过滤规则（考虑嵌套路径）
                if (!shouldIncludeKey(key, fullPath, includeFilter, excludeFilter)) {
                    // 跳过这个键，但如果是对象，继续递归处理其子属性
                    if (typeof value === 'object' && value !== null) {
                        assertions += generateAssertionsFromJson(value, fullPath);
                    }
                    return;
                }
                
                // 基本类型断言
                if (typeof value === 'string') {
                    assertions += `assert("${value}", ${fullPath}, "断言${key}");\n`;
                } else if (typeof value === 'number') {
                    assertions += `assert(${value}, ${fullPath}, "断言${key}");\n`;
                } else if (typeof value === 'boolean') {
                    assertions += `assert(${value}, ${fullPath}, "断言${key}");\n`;
                } else if (value === null) {
                    assertions += `assert(null, ${fullPath}, "断言${key}");\n`;
                } else if (typeof value === 'object') {
                    // 递归处理嵌套对象
                    assertions += generateAssertionsFromJson(value, fullPath);
                }
            });
        }
    }
    
    return assertions;
}

// 获取仅保留过滤条件
function getIncludeFilter() {
    const includeInput = document.getElementById('assertInclude').value.trim();
    if (!includeInput) return [];
    return includeInput.split(',').map(key => key.trim()).filter(key => key);
}

// 获取仅删除过滤条件
function getExcludeFilter() {
    const excludeInput = document.getElementById('assertExclude').value.trim();
    if (!excludeInput) return [];
    return excludeInput.split(',').map(key => key.trim()).filter(key => key);
}

// 判断是否应该包含该键（考虑嵌套路径）
function shouldIncludeKey(key, fullPath, includeFilter, excludeFilter) {
    // 先应用内置过滤规则
    if (key === 'pubts' || key === 'tenant' || key.endsWith('id')) {
        return false;
    }
    
    // 应用仅保留过滤（优先级最高）
    if (includeFilter.length > 0) {
        // 检查当前键名是否在过滤列表中
        if (includeFilter.includes(key)) {
            return true;
        }
        
        // 检查完整路径中是否包含过滤键名
        for (const filterKey of includeFilter) {
            if (fullPath.includes('.' + filterKey + '.') || fullPath.endsWith('.' + filterKey)) {
                return true;
            }
        }
        
        return false;
    }
    
    // 应用仅删除过滤
    if (excludeFilter.length > 0) {
        // 检查当前键名是否在排除列表中
        if (excludeFilter.includes(key)) {
            return false;
        }
        
        // 检查完整路径中是否包含排除键名
        for (const filterKey of excludeFilter) {
            if (fullPath.includes('.' + filterKey + '.') || fullPath.endsWith('.' + filterKey)) {
                return false;
            }
        }
        
        return true;
    }
    
    return true;
}

// 计算断言数量
function countAssertions(assertions) {
    return (assertions.match(/assert\(/g) || []).length;
}

// 更新断言状态
function updateAssertStatus(status, detail) {
    document.getElementById('assertStatusText').textContent = status;
    document.getElementById('assertStatusDetail').textContent = detail;
}

// 设置拖拽功能
function setupDragAndDrop() {
    const uploadArea = document.getElementById('fileUploadArea');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('drag-over');
    }
    
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// 处理文件
function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(function(file) {
        if (isValidFileType(file)) {
            readFileContent(file);
        } else {
            showNotification('不支持的文件类型: ' + file.name, 'warning');
        }
    });
}

// 检查文件类型是否有效
function isValidFileType(file) {
    const validTypes = ['.txt', '.json', '.log', '.csv', '.js', '.html', '.xml', '.groovy', '.sql'];
    const fileName = file.name.toLowerCase();
    return validTypes.some(function(type) {
        return fileName.endsWith(type);
    });
}

// 读取文件内容
function readFileContent(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        addFileToList(file, content);
        appendToInputArea(content);
    };
    
    reader.onerror = function() {
        showNotification('读取文件失败: ' + file.name, 'error');
    };
    
    reader.readAsText(file);
}

// 添加文件到文件列表
function addFileToList(file, content) {
    const fileList = document.getElementById('fileList');
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = '<div><span class="file-name">' + file.name + '</span><span class="file-size">(' + formatFileSize(file.size) + ')</span></div><button class="file-remove" onclick="removeFileItem(this)">×</button>';
    
    fileItem.dataset.content = content;
    fileList.appendChild(fileItem);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 移除文件项
function removeFileItem(button) {
    const fileItem = button.parentNode;
    const content = fileItem.dataset.content;
    fileItem.remove();
    
    // 从输入区域移除对应内容
    const inputArea = document.getElementById('uidInput');
    const currentContent = inputArea.value;
    
    if (currentContent.includes(content)) {
        const newContent = currentContent.replace(content, '').replace(/\r\n\n+/g, '').trim();
        inputArea.value = newContent;
        updateLineNumbers('uidInput');
    }
}

// 追加内容到输入区域
function appendToInputArea(content) {
    const inputArea = document.getElementById('uidInput');
    const currentContent = inputArea.value;
    
    if (currentContent) {
        inputArea.value = currentContent + '\r\n\r\n' + content;
    } else {
        inputArea.value = content;
    }
    
    updateLineNumbers('uidInput');
    showNotification('文件已添加到输入区域', 'success');
}

// 提取UID
function extractUIDs() {
    const input = document.getElementById('uidInput').value;
    const output = document.getElementById('uidOutput');
    const stats = document.getElementById('uidStats');
    const extractBtn = document.getElementById('uidExtract');
    
    if (!input.trim()) {
        showNotification('请输入文本内容或上传文件', 'warning');
        return;
    }
    
    // 显示加载状态
    const originalText = extractBtn.textContent;
    extractBtn.innerHTML = '<span class="loading"></span> 提取中...';
    extractBtn.disabled = true;
    
    // 使用setTimeout模拟异步操作
    setTimeout(function() {
        try {
            // 使用正则表达式提取所有以UID开头的字符串
            // UID取值遇到空白、引号、逗号、括号、方括号、花括号、尖括号及 = @ | ; 等分隔符即结束
            const uidRegex = /UID:[^\s,"'`#()\[\]{}<>=@|;]+/gi;
            const matches = input.match(uidRegex);
            
            if (matches && matches.length > 0) {
                // 去重并排序
                const uniqueUIDs = Array.from(new Set(matches)).sort();
                const result = uniqueUIDs.join(',');
                
                output.value = result;
                stats.textContent = '已提取: ' + uniqueUIDs.length + ' 个UID';
                showNotification('成功提取 ' + uniqueUIDs.length + ' 个UID', 'success');
                
                // 更新输出区域的行号
                updateLineNumbers('uidOutput');
            } else {
                output.value = '';
                stats.textContent = '已提取: 0 个UID';
                showNotification('未找到以UID开头的字符串', 'info');
            }
        } catch (error) {
            console.error('UID提取错误:', error);
            showNotification('提取失败，请重试', 'error');
        } finally {
            // 恢复按钮状态
            extractBtn.textContent = originalText;
            extractBtn.disabled = false;
        }
    }, 100);
}

// 复制UID结果
function copyUIDResult() {
    const output = document.getElementById('uidOutput');
    if (!output.value) {
        showNotification('没有内容可复制', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output.value).then(function() {
        showNotification('已复制到剪贴板', 'success');
    }).catch(function(err) {
        console.error('复制失败:', err);
        showNotification('复制失败', 'error');
    });
}

// 下载UID结果
function downloadUIDResult() {
    const output = document.getElementById('uidOutput').value;
    if (!output) {
        showNotification('没有内容可下载', 'warning');
        return;
    }
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_uids.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('文件已下载', 'success');
}

// 清空UID输入
function clearUIDInputs() {
    document.getElementById('uidInput').value = '';
    document.getElementById('uidOutput').value = '';
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('uidStats').textContent = '已提取: 0 个UID';
    document.getElementById('fileInput').value = '';
    
    // 更新行号显示
    updateLineNumbers('uidInput');
    updateLineNumbers('uidOutput');
    
    showNotification('所有输入已清空', 'info');
}

// 批量ID替换功能
async function replaceIds() {
    const input = document.getElementById('idReplaceInput').value.trim();
    const output = document.getElementById('idReplaceOutput');
    const executeBtn = document.getElementById('idReplaceExecute');
    
    if (!input) {
        showNotification('请输入SQL语句', 'warning');
        return;
    }
    
    // 显示加载状态
    const originalText = executeBtn.textContent;
    executeBtn.innerHTML = '<span class="loading"></span> 替换中...';
    executeBtn.disabled = true;
    
    try {
        // 异步替换SQL中的ID
        const replacedSql = await replaceIdsInSql(input);
        output.value = replacedSql;
        showNotification('ID替换成功！', 'success');
        
        // 更新输出区域的行号
        updateLineNumbers('idReplaceOutput');
    } catch (error) {
        console.error('ID替换错误:', error);
        showNotification(`ID替换失败: ${error.message}`, 'error');
    } finally {
        // 恢复按钮状态
        executeBtn.textContent = originalText;
        executeBtn.disabled = false;
    }
}

// 异步替换SQL中的ID
async function replaceIdsInSql(sql) {
    // 使用正则表达式查找所有形如('数字ID', ...)的模式
    const idPattern = /\('(\d+)',[^)]*\)/g;
    
    // 统计需要替换的ID数量
    const matches = [...sql.matchAll(idPattern)];
    const idCount = matches.length;
    
    if (idCount === 0) {
        return sql; // 没有需要替换的ID，直接返回原SQL
    }
    
    try {
        // 获取用户输入的起始雪花ID
        const startSnowflakeIdInput = document.getElementById('startSnowflakeId').value.trim();
        
        if (!startSnowflakeIdInput) {
            throw new Error('请输入起始雪花ID');
        }
        
        // 验证起始雪花ID格式
        if (!/^\d+$/.test(startSnowflakeIdInput)) {
            throw new Error('起始雪花ID必须是数字');
        }
        
        const startId = BigInt(startSnowflakeIdInput);
        
        // 生成连续的雪花ID（从起始ID开始依次递增）
        const snowflakeIds = [];
        for (let i = 0; i < idCount; i++) {
            snowflakeIds.push((startId + BigInt(i)).toString());
        }
        
        console.log('生成的连续雪花ID:', snowflakeIds);
        
        let result = sql;
        let currentIndex = 0;
        
        // 替换所有匹配的数字ID
        result = result.replace(idPattern, (match, originalId) => {
            if (currentIndex >= snowflakeIds.length) {
                throw new Error('雪花ID数量不足，无法完成替换');
            }
            
            // 替换第一个参数为新的雪花ID
            const newId = `'${snowflakeIds[currentIndex]}'`;
            currentIndex++;
            
            // 替换整个匹配的括号内容
            return match.replace(`'${originalId}'`, newId);
        });
        
        return result;
    } catch (error) {
        console.error('ID替换失败:', error);
        throw new Error(`ID替换失败: ${error.message}`);
    }
}



// 简单的雪花ID生成器实现
class SnowflakeIdGenerator {
    constructor() {
        this.epoch = 1609459200000; // 2021-01-01 00:00:00 UTC
        this.sequence = 0;
        this.lastTimestamp = -1;
    }

    generate() {
        let timestamp = Date.now();
        
        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1) & 0xFFF; // 12位序列号
            if (this.sequence === 0) {
                // 等待下一毫秒
                while (timestamp <= this.lastTimestamp) {
                    timestamp = Date.now();
                }
            }
        } else {
            this.sequence = 0;
        }
        
        this.lastTimestamp = timestamp;
        
        // 生成雪花ID：时间戳(41位) + 机器ID(10位) + 序列号(12位)
        const id = ((timestamp - this.epoch) << 22) | (1 << 12) | this.sequence;
        return BigInt(id);
    }

    parse(snowflakeId) {
        const id = BigInt(snowflakeId);
        const timestamp = Number((id >> 22n) + BigInt(this.epoch));
        const machineId = Number((id >> 12n) & 0x3FFn);
        const sequence = Number(id & 0xFFFn);
        
        return {
            timestamp: new Date(timestamp),
            machineId: machineId,
            sequence: sequence
        };
    }
}

// 创建全局雪花ID生成器实例
const snowflakeGenerator = new SnowflakeIdGenerator();

// 雪花ID生成函数（兼容旧接口）
function generateSnowflakeId() {
    return snowflakeGenerator.generate().toString();
}

// 生成下一个连续的雪花ID（兼容旧接口）
function generateNextSnowflakeId(currentId) {
    return snowflakeGenerator.generate().toString();
}

// 解析雪花ID
function parseSnowflakeId(snowflakeId) {
    return snowflakeGenerator.parse(snowflakeId);
}

// 复制ID替换结果
function copyIdReplaceResult() {
    const output = document.getElementById('idReplaceOutput');
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

// 下载ID替换结果
function downloadIdReplaceResult() {
    const output = document.getElementById('idReplaceOutput').value;
    if (!output) {
        showNotification('没有内容可下载', 'warning');
        return;
    }
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'replaced_sql.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('文件已下载', 'success');
}

// 清空ID替换输入
function clearIdReplaceInputs() {
    document.getElementById('idReplaceInput').value = '';
    document.getElementById('idReplaceOutput').value = '';
    
    // 更新行号显示
    updateLineNumbers('idReplaceInput');
    updateLineNumbers('idReplaceOutput');
    
    showNotification('所有输入已清空', 'info');
}

// 设置groovy拖拽功能
function setupGroovyDragAndDrop() {
    const uploadArea = document.getElementById('groovyFileUploadArea');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('drag-over');
    }
    
    uploadArea.addEventListener('drop', handleGroovyDrop, false);
    
    function handleGroovyDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleGroovyFiles(files);
    }
}

// 处理groovy文件选择
function handleGroovyFileSelect(e) {
    const files = e.target.files;
    handleGroovyFiles(files);
}

// 处理groovy文件
function handleGroovyFiles(files) {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(function(file) {
        if (isValidFileType(file)) {
            readGroovyFileContent(file);
        } else {
            showNotification('不支持的文件类型: ' + file.name, 'warning');
        }
    });
}

// 读取groovy文件内容
function readGroovyFileContent(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        addGroovyFileToList(file, content);
        appendToGroovyInputArea(content);
    };
    
    reader.onerror = function() {
        showNotification('读取文件失败: ' + file.name, 'error');
    };
    
    reader.readAsText(file);
}

// 添加groovy文件到文件列表
function addGroovyFileToList(file, content) {
    const fileList = document.getElementById('groovyFileList');
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = '<div><span class="file-name">' + file.name + '</span><span class="file-size">(' + formatFileSize(file.size) + ')</span></div><button class="file-remove" onclick="removeGroovyFileItem(this)">×</button>';
    
    fileItem.dataset.content = content;
    fileList.appendChild(fileItem);
}

// 移除groovy文件项
function removeGroovyFileItem(button) {
    const fileItem = button.parentNode;
    const content = fileItem.dataset.content;
    fileItem.remove();
    
    // 从输入区域移除对应内容
    const inputArea = document.getElementById('groovyInput');
    const currentContent = inputArea.value;
    
    if (currentContent.includes(content)) {
        const newContent = currentContent.replace(content, '').replace(/\r\n\n+/g, '').trim();
        inputArea.value = newContent;
        updateLineNumbers('groovyInput');
    }
}

// 追加内容到groovy输入区域
function appendToGroovyInputArea(content) {
    const inputArea = document.getElementById('groovyInput');
    const currentContent = inputArea.value;
    
    if (currentContent) {
        inputArea.value = currentContent + '\r\n\r\n' + content;
    } else {
        inputArea.value = content;
    }
    
    updateLineNumbers('groovyInput');
    showNotification('文件已添加到输入区域', 'success');
}

// 检查文件类型是否有效
function isValidFileType(file) {
    const allowedTypes = ['.txt', '.json', '.log', '.csv', '.groovy', '.sql'];
    const fileName = file.name.toLowerCase();
    return allowedTypes.some(type => fileName.endsWith(type));
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 提取SQL语句的核心函数
function extractSQL(groovyText) {
    const sqlStatements = [];
    
    // 模式1：从Groovy代码中提取SQL（helper.execute("""...""")模式）
    const executePattern = /helper\.execute\s*\(\s*"""([\s\S]*?)"""\s*\)/g;
    
    let match;
    while ((match = executePattern.exec(groovyText)) !== null) {
        const sqlContent = match[1].trim();
        
        // 检查SQL内容是否以DELETE或UPDATE开头
        if (sqlContent.match(/^(DELETE|UPDATE)/i)) {
            // 清理SQL语句：移除多余的空格和换行
            const cleanedSQL = cleanSQL(sqlContent);
            sqlStatements.push(cleanedSQL);
        }
    }
    
    // 模式2：直接提取纯SQL语句
    const pureSqlPattern = /(?:^|\n)(DELETE|UPDATE)[\s\S]*?;/gmi;
    let sqlMatch;
    while ((sqlMatch = pureSqlPattern.exec(groovyText)) !== null) {
        const sqlContent = sqlMatch[0].trim();
        // 清理SQL语句
        const cleanedSQL = cleanSQL(sqlContent);
        sqlStatements.push(cleanedSQL);
    }
    
    return sqlStatements;
}

// 清理SQL语句
function cleanSQL(sql) {
    // 移除多余的空格和换行，但保留基本的格式
    return sql
        .replace(/\r\n/g, '\n') // 统一换行符
        .replace(/\n\s+/g, '\n') // 移除行首多余空格
        .replace(/\s+/g, ' ') // 合并多个空格
        .replace(/;\s*$/g, ';') // 清理结尾的分号
        .trim();
}

// Groovy SQL提取功能
function groovyExtractSql() {
    const input = document.getElementById('groovyInput').value;
    const output = document.getElementById('groovyOutput');
    const stats = document.getElementById('groovyStats');
    const extractBtn = document.getElementById('groovyExtract');
    
    if (!input.trim()) {
        showNotification('请输入Groovy代码或SQL语句', 'warning');
        return;
    }
    
    // 显示加载状态
    const originalText = extractBtn.textContent;
    extractBtn.innerHTML = '<span class="loading"></span> 提取中...';
    extractBtn.disabled = true;
    
    // 使用setTimeout模拟异步操作
    setTimeout(function() {
        try {
            // 使用extractSQL函数提取SQL语句
            const sqlStatements = extractSQL(input);
            
            if (sqlStatements && sqlStatements.length > 0) {
                const result = sqlStatements.join('\n\n');
                output.value = result;
                stats.textContent = '已提取: ' + sqlStatements.length + ' 条SQL';
                showNotification('成功提取 ' + sqlStatements.length + ' 条SQL语句', 'success');
                
                // 更新输出区域的行号
                updateLineNumbers('groovyOutput');
            } else {
                output.value = '';
                stats.textContent = '已提取: 0 条SQL';
                showNotification('未找到DELETE或UPDATE语句', 'info');
            }
        } catch (error) {
            console.error('SQL提取错误:', error);
            showNotification('提取失败，请重试', 'error');
        } finally {
            // 恢复按钮状态
            extractBtn.textContent = originalText;
            extractBtn.disabled = false;
        }
    }, 100);
}

// 复制groovy提取结果
function copyGroovyResult() {
    const output = document.getElementById('groovyOutput');
    if (!output.value) {
        showNotification('没有内容可复制', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output.value).then(function() {
        showNotification('已复制到剪贴板', 'success');
    }).catch(function(err) {
        console.error('复制失败:', err);
        showNotification('复制失败', 'error');
    });
}

// 下载groovy提取结果
function downloadGroovyResult() {
    const output = document.getElementById('groovyOutput').value;
    if (!output) {
        showNotification('没有内容可下载', 'warning');
        return;
    }
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_sql.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('文件已下载', 'success');
}

// 清空groovy输入
function clearGroovyInputs() {
    document.getElementById('groovyInput').value = '';
    document.getElementById('groovyOutput').value = '';
    document.getElementById('groovyFileList').innerHTML = '';
    document.getElementById('groovyStats').textContent = '已提取: 0 条SQL';
    document.getElementById('groovyFileInput').value = '';
    
    // 更新行号显示
    updateLineNumbers('groovyInput');
    updateLineNumbers('groovyOutput');
    
    showNotification('所有输入已清空', 'info');
}



// 设置groovy拖拽功能
function setupGroovyDragAndDrop() {
    const uploadArea = document.getElementById('groovyFileUploadArea');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(function(eventName) {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('drag-over');
    }
    
    uploadArea.addEventListener('drop', handleGroovyDrop, false);
    
    function handleGroovyDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleGroovyFiles(files);
    }
}

// 处理groovy文件选择
function handleGroovyFileSelect(e) {
    const files = e.target.files;
    handleGroovyFiles(files);
}

// 处理groovy文件
function handleGroovyFiles(files) {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(function(file) {
        if (isValidFileType(file)) {
            readGroovyFileContent(file);
        } else {
            showNotification('不支持的文件类型: ' + file.name, 'warning');
        }
    });
}

// 读取groovy文件内容
function readGroovyFileContent(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        addGroovyFileToList(file, content);
        appendToGroovyInputArea(content);
    };
    
    reader.onerror = function() {
        showNotification('读取文件失败: ' + file.name, 'error');
    };
    
    reader.readAsText(file);
}

// 添加groovy文件到文件列表
function addGroovyFileToList(file, content) {
    const fileList = document.getElementById('groovyFileList');
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = '<div><span class="file-name">' + file.name + '</span><span class="file-size">(' + formatFileSize(file.size) + ')</span></div><button class="file-remove" onclick="removeGroovyFileItem(this)">×</button>';
    
    fileItem.dataset.content = content;
    fileList.appendChild(fileItem);
}

// 移除groovy文件项
function removeGroovyFileItem(button) {
    const fileItem = button.parentNode;
    const content = fileItem.dataset.content;
    fileItem.remove();
    
    // 从输入区域移除对应内容
    const inputArea = document.getElementById('groovyInput');
    const currentContent = inputArea.value;
    
    if (currentContent.includes(content)) {
        const newContent = currentContent.replace(content, '').replace(/\r\n\n+/g, '').trim();
        inputArea.value = newContent;
        updateLineNumbers('groovyInput');
    }
}

// 追加内容到groovy输入区域
function appendToGroovyInputArea(content) {
    const inputArea = document.getElementById('groovyInput');
    const currentContent = inputArea.value;
    
    if (currentContent) {
        inputArea.value = currentContent + '\r\n\r\n' + content;
    } else {
        inputArea.value = content;
    }
    
    updateLineNumbers('groovyInput');
    showNotification('文件已添加到输入区域', 'success');
}

// 检查文件类型是否有效
function isValidFileType(file) {
    const allowedTypes = ['.txt', '.json', '.log', '.csv', '.groovy', '.sql'];
    const fileName = file.name.toLowerCase();
    return allowedTypes.some(type => fileName.endsWith(type));
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 提取SQL语句的核心函数
function extractSQL(groovyText) {
    const sqlStatements = [];
    
    // 模式1：从Groovy代码中提取SQL（helper.execute("""...""")模式）
    const executePattern = /helper\.execute\s*\(\s*"""([\s\S]*?)"""\s*\)/g;
    
    let match;
    while ((match = executePattern.exec(groovyText)) !== null) {
        const sqlContent = match[1].trim();
        
        // 检查SQL内容是否以DELETE或UPDATE开头
        if (sqlContent.match(/^(DELETE|UPDATE)/i)) {
            // 清理SQL语句：移除多余的空格和换行
            const cleanedSQL = cleanSQL(sqlContent);
            sqlStatements.push(cleanedSQL);
        }
    }
    
    // 模式2：直接提取纯SQL语句
    const pureSqlPattern = /(?:^|\n)(DELETE|UPDATE)[\s\S]*?;/gmi;
    let sqlMatch;
    while ((sqlMatch = pureSqlPattern.exec(groovyText)) !== null) {
        const sqlContent = sqlMatch[0].trim();
        // 清理SQL语句
        const cleanedSQL = cleanSQL(sqlContent);
        sqlStatements.push(cleanedSQL);
    }
    
    return sqlStatements;
}

// 清理SQL语句
function cleanSQL(sql) {
    // 移除多余的空格和换行，但保留基本的格式
    return sql
        .replace(/\r\n/g, '\n') // 统一换行符
        .replace(/\n\s+/g, '\n') // 移除行首多余空格
        .replace(/\s+/g, ' ') // 合并多个空格
        .replace(/;\s*$/g, ';') // 清理结尾的分号
        .trim();
}

// Groovy SQL提取功能
function groovyExtractSql() {
    const input = document.getElementById('groovyInput').value;
    const output = document.getElementById('groovyOutput');
    const stats = document.getElementById('groovyStats');
    const extractBtn = document.getElementById('groovyExtract');
    
    if (!input.trim()) {
        showNotification('请输入Groovy代码或SQL语句', 'warning');
        return;
    }
    
    // 显示加载状态
    const originalText = extractBtn.textContent;
    extractBtn.innerHTML = '<span class="loading"></span> 提取中...';
    extractBtn.disabled = true;
    
    // 使用setTimeout模拟异步操作
    setTimeout(function() {
        try {
            // 使用extractSQL函数提取SQL语句
            const sqlStatements = extractSQL(input);
            
            if (sqlStatements && sqlStatements.length > 0) {
                const result = sqlStatements.join('\n\n');
                output.value = result;
                stats.textContent = '已提取: ' + sqlStatements.length + ' 条SQL';
                showNotification('成功提取 ' + sqlStatements.length + ' 条SQL语句', 'success');
                
                // 更新输出区域的行号
                updateLineNumbers('groovyOutput');
            } else {
                output.value = '';
                stats.textContent = '已提取: 0 条SQL';
                showNotification('未找到DELETE或UPDATE语句', 'info');
            }
        } catch (error) {
            console.error('SQL提取错误:', error);
            showNotification('提取失败，请重试', 'error');
        } finally {
            // 恢复按钮状态
            extractBtn.textContent = originalText;
            extractBtn.disabled = false;
        }
    }, 100);
}

// 复制groovy提取结果
function copyGroovyResult() {
    const output = document.getElementById('groovyOutput');
    if (!output.value) {
        showNotification('没有内容可复制', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output.value).then(function() {
        showNotification('已复制到剪贴板', 'success');
    }).catch(function(err) {
        console.error('复制失败:', err);
        showNotification('复制失败', 'error');
    });
}

// 下载groovy提取结果
function downloadGroovyResult() {
    const output = document.getElementById('groovyOutput').value;
    if (!output) {
        showNotification('没有内容可下载', 'warning');
        return;
    }
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_sql.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('文件已下载', 'success');
}

// 清空groovy输入
function clearGroovyInputs() {
    document.getElementById('groovyInput').value = '';
    document.getElementById('groovyOutput').value = '';
    document.getElementById('groovyFileList').innerHTML = '';
    document.getElementById('groovyStats').textContent = '已提取: 0 条SQL';
    document.getElementById('groovyFileInput').value = '';
    
    // 更新行号显示
    updateLineNumbers('groovyInput');
    updateLineNumbers('groovyOutput');
    
    showNotification('所有输入已清空', 'info');
}

