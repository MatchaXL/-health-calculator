// 初始化函数
function initApp() {
    setupEventListeners();
    console.log("健康计算器已初始化");
}

// 设置事件监听器
function setupEventListeners() {
    // 标签页切换
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', switchTab);
    });
    
    // 性别选择变化时显示/隐藏臀围输入
    document.getElementById('gender').addEventListener('change', function() {
        const hipGroup = document.getElementById('hip-group');
        if (this.value === 'female') {
            hipGroup.style.display = 'block';
        } else {
            hipGroup.style.display = 'none';
        }
    });
    
    // BMI计算
    document.getElementById('calculate-bmi').addEventListener('click', calculateBMI);
    
    // 体脂率估算
    document.getElementById('calculate-body-fat').addEventListener('click', estimateBodyFat);
    
    // 肌肉量估算
    document.getElementById('calculate-muscle').addEventListener('click', estimateMuscleMass);
    
    // 理想体重范围
    document.getElementById('calculate-ideal-weight').addEventListener('click', calculateIdealWeight);
    
    // 代谢计算
    document.getElementById('calculate-metabolism').addEventListener('click', calculateMetabolism);
    
    // 基础计算器事件监听
    setupCalculatorListeners();
}

// 标签页切换功能
function switchTab(event) {
    // 移除所有标签页按钮的active类
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // 为当前点击的按钮添加active类
    event.target.classList.add('active');
    
    // 获取目标标签页ID
    const tabId = event.target.dataset.tab;
    
    // 隐藏所有内容区域
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 显示目标内容区域
    document.getElementById(tabId).classList.add('active');
}

// 验证输入
function validateInput(id, min, max) {
    const input = document.getElementById(id);
    const value = parseFloat(input.value);
    const errorElement = document.getElementById(`${id}-error`);
    
    if (isNaN(value)) {
        input.classList.add('input-error');
        if (errorElement) {
            errorElement.textContent = '请输入有效的数值';
            errorElement.style.display = 'block';
        }
        return false;
    }
    
    if (value < min || value > max) {
        input.classList.add('input-error');
        if (errorElement) {
            errorElement.textContent = `数值应在${min}到${max}之间`;
            errorElement.style.display = 'block';
        }
        return false;
    }
    
    input.classList.remove('input-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    return true;
}

// BMI计算函数
function calculateBMI() {
    if (!validateInput('height', 100, 250) || !validateInput('weight', 20, 200)) {
        return;
    }
    
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    
    const bmi = weight / Math.pow(height / 100, 2);
    const category = getBMICategory(bmi);
    
    document.getElementById('bmi-value').textContent = `BMI: ${bmi.toFixed(2)}`;
    document.getElementById('bmi-category').textContent = `分类: ${category}`;
    
    // 更新进度条
    const progress = document.getElementById('bmi-progress');
    let width = 0;
    if (bmi < 18.5) width = 20;
    else if (bmi < 24) width = 50;
    else if (bmi < 28) width = 75;
    else width = 90;
    progress.style.width = `${width}%`;
    
    showResult('bmi-result');
}

// BMI分类函数
function getBMICategory(bmi) {
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 24) return '正常';
    if (bmi < 28) return '超重';
    return '肥胖';
}

// 体脂率估算函数
function estimateBodyFat() {
    if (!validateInput('height', 100, 250) || 
        !validateInput('weight', 20, 200) || 
        !validateInput('age', 10, 100)) {
        return;
    }
    
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseFloat(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const waist = parseFloat(document.getElementById('waist').value);
    const neck = parseFloat(document.getElementById('neck').value);
    const hip = parseFloat(document.getElementById('hip').value);
    
    let bodyFat, method;
    
    // 如果有腰围和颈围数据，使用海军公式
    if (waist && neck) {
        if (gender === 'male') {
            // 修正男性海军公式
            bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
            method = '使用海军公式（男性）';
        } else if (gender === 'female' && hip) {
            // 女性海军公式
            bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
            method = '使用海军公式（女性）';
        } else {
            // 女性但缺少臀围数据，使用简化公式
            const bmi = weight / Math.pow(height / 100, 2);
            bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
            method = '使用简化公式（女性）';
        }
    } else {
        // 使用简化公式
        const bmi = weight / Math.pow(height / 100, 2);
        if (gender === 'male') {
            bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
        } else {
            bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
        }
        method = '使用简化公式';
    }
    
    // 确保体脂率在合理范围内
    bodyFat = Math.max(5, Math.min(50, bodyFat));
    
    document.getElementById('body-fat-value').textContent = `体脂率: ${bodyFat.toFixed(1)}%`;
    document.getElementById('body-fat-method').textContent = `计算方法: ${method}`;
    
    // 体脂率分类
    let fatCategory = '';
    if (gender === 'male') {
        if (bodyFat < 6) fatCategory = '极低体脂';
        else if (bodyFat < 14) fatCategory = '健康范围';
        else if (bodyFat < 18) fatCategory = '轻度偏高';
        else if (bodyFat < 25) fatCategory = '偏高';
        else fatCategory = '肥胖';
    } else {
        if (bodyFat < 16) fatCategory = '极低体脂';
        else if (bodyFat < 24) fatCategory = '健康范围';
        else if (bodyFat < 28) fatCategory = '轻度偏高';
        else if (bodyFat < 32) fatCategory = '偏高';
        else fatCategory = '肥胖';
    }
    document.getElementById('body-fat-category').textContent = `分类: ${fatCategory}`;
    
    // 更新进度条
    const progress = document.getElementById('body-fat-progress');
    let width = 0;
    if (gender === 'male') {
        if (bodyFat < 10) width = 20;
        else if (bodyFat < 15) width = 40;
        else if (bodyFat < 20) width = 60;
        else if (bodyFat < 25) width = 80;
        else width = 95;
    } else {
        if (bodyFat < 15) width = 20;
        else if (bodyFat < 22) width = 40;
        else if (bodyFat < 26) width = 60;
        else if (bodyFat < 30) width = 80;
        else width = 95;
    }
    progress.style.width = `${width}%`;
    
    showResult('body-fat-result');
}

// 肌肉量估算函数
function estimateMuscleMass() {
    if (!validateInput('weight', 20, 200)) {
        return;
    }
    
    const weight = parseFloat(document.getElementById('weight').value);
    
    // 获取体脂率（如果已计算）
    const bodyFatText = document.getElementById('body-fat-value').textContent;
    let bodyFatPercentage;
    
    if (bodyFatText && bodyFatText.includes('体脂率:')) {
        bodyFatPercentage = parseFloat(bodyFatText.split(':')[1].replace('%', ''));
    } else {
        // 如果没有体脂率数据，使用默认值估算
        const gender = document.getElementById('gender').value;
        bodyFatPercentage = gender === 'male' ? 18 : 25;
    }
    
    const muscleMass = weight * (1 - bodyFatPercentage / 100);
    const musclePercentage = (muscleMass / weight * 100).toFixed(1);
    
    document.getElementById('muscle-mass-value').textContent = `肌肉量: ${muscleMass.toFixed(1)} kg`;
    document.getElementById('muscle-mass-percentage').textContent = `占体重比例: ${musclePercentage}%`;
    
    showResult('muscle-result');
}

// 理想体重范围计算函数
function calculateIdealWeight() {
    if (!validateInput('height', 100, 250)) {
        return;
    }
    
    const height = parseFloat(document.getElementById('height').value);
    
    // 使用世界卫生组织推荐的公式
    const heightM = height / 100;
    const minWeight = 18.5 * Math.pow(heightM, 2);
    const maxWeight = 24.9 * Math.pow(heightM, 2);
    
    document.getElementById('ideal-weight-value').textContent = 
        `理想体重范围: ${minWeight.toFixed(1)} kg - ${maxWeight.toFixed(1)} kg`;
    
    showResult('ideal-weight-result');
}

// 代谢计算函数
function calculateMetabolism() {
    const height = parseFloat(document.getElementById('bmr-height').value);
    const weight = parseFloat(document.getElementById('bmr-weight').value);
    const age = parseFloat(document.getElementById('bmr-age').value);
    const gender = document.getElementById('bmr-gender').value;
    const activityLevel = parseFloat(document.getElementById('activity-level').value);
    
    if (!height || !weight || !age) {
        alert('请输入身高、体重和年龄');
        return;
    }
    
    // 计算基础代谢率(BMR)
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // 计算每日总能量消耗(TDEE)
    const tdee = bmr * activityLevel;
    
    document.getElementById('bmr-value').textContent = `基础代谢率(BMR): ${bmr.toFixed(0)} 千卡/天`;
    document.getElementById('tdee-value').textContent = `每日总能量消耗(TDEE): ${tdee.toFixed(0)} 千卡/天`;
    
    showResult('metabolism-result');
}

// 基础计算器功能
function setupCalculatorListeners() {
    const displayCurrent = document.getElementById('calculator-current');
    const displayPrevious = document.getElementById('calculator-previous');
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    
    // 更新显示
    function updateDisplay() {
        displayCurrent.textContent = currentOperand;
        if (operation != null) {
            displayPrevious.textContent = `${previousOperand} ${operation}`;
        } else {
            displayPrevious.textContent = previousOperand;
        }
    }
    
    // 添加数字
    function appendNumber(number) {
        if (number === '.' && currentOperand.includes('.')) return;
        if (currentOperand === '0' && number !== '.') {
            currentOperand = number.toString();
        } else {
            currentOperand = currentOperand.toString() + number.toString();
        }
    }
    
    // 选择操作符
    function chooseOperation(op) {
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            compute();
        }
        operation = op;
        previousOperand = currentOperand;
        currentOperand = '';
    }
    
    // 计算
    function compute() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            default:
                return;
        }
        
        currentOperand = computation.toString();
        operation = undefined;
        previousOperand = '';
    }
    
    // 清除
    function clear() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
    }
    
    // 事件监听
    document.querySelectorAll('.calculator-button').forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('clear')) {
                clear();
            } else if (button.classList.contains('operator')) {
                chooseOperation(button.textContent);
            } else if (button.classList.contains('equals')) {
                compute();
            } else {
                appendNumber(button.textContent);
            }
            
            updateDisplay();
        });
    });
    
    // 初始显示
    updateDisplay();
}

// 显示结果区域
function showResult(resultId) {
    const resultElement = document.getElementById(resultId);
    resultElement.classList.add('show');
    
    // 滚动到结果区域
    resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);