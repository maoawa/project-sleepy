function updatePage(data) {
    const marsStateElement = document.getElementById('mars-state');
    const cacheStateElement = document.getElementById('cache-state');
    const updateElement = document.getElementById('update');
    const headlightStateElement = document.getElementById('headlight-state'); // 大灯状态元素
    const headlightIconElement = document.querySelector('#headlight-icon'); // 大灯图标元素
    const leftSideLightStateElement = document.getElementById('left-side-light-state'); // 左侧灯状态元素
    const leftSideLightIconElement = document.getElementById('left-side-light-icon'); // 左侧灯图标元素
    const rightSideLightStateElement = document.getElementById('right-side-light-state'); // 右侧灯状态元素
    const rightSideLightIconElement = document.getElementById('right-side-light-icon'); // 右侧灯图标元素

    // 清除已有的倒计时，防止重复运行
    if (window.previousCountdownInterval) {
        clearInterval(window.previousCountdownInterval);
    }
    if (window.previousAgeInterval) {
        clearInterval(window.previousAgeInterval);
    }

    // 更新“毛毛当前应该”状态
    const awakeState = data['input_boolean.awake']?.state === 'on';
    marsStateElement.textContent = awakeState ? '醒着' : '睡着了';
    marsStateElement.style.color = awakeState ? 'green' : 'gray';

    // 根据缓存状态设置文本内容
    let age = data.cache_age || 0; // 获取初始数据年龄
    if (data.cached) {
        cacheStateElement.textContent = `已读取缓存，数据更新于 ${age} 秒前`;
    } else {
        cacheStateElement.textContent = `即时数据，更新于 ${age} 秒前`;
    }

    cacheStateElement.style.display = 'block'; // 显示状态信息

    // 每秒更新数据年龄
    window.previousAgeInterval = setInterval(() => {
        age++;
        if (data.cached) {
            cacheStateElement.textContent = `已读取缓存，数据更新于 ${age} 秒前`;
        } else {
            cacheStateElement.textContent = `即时数据，更新于 ${age} 秒前`;
        }
    }, 1000);

    // 设置下一次自动更新的倒计时
    let nextUpdate = 15; // 自动更新间隔为 15 秒
    updateElement.textContent = `下一次自动更新: ${nextUpdate} 秒后`;

    window.previousCountdownInterval = setInterval(() => {
        nextUpdate--;
        updateElement.textContent = `下一次自动更新: ${nextUpdate} 秒后`;
        if (nextUpdate <= 0) {
            clearInterval(window.previousCountdownInterval); // 停止倒计时
        }
    }, 1000);

    // 更新大灯状态和图标
    const headlightState = data['light.headlight']?.state;
    if (headlightState === 'on') {
        headlightStateElement.textContent = '开启';
        headlightStateElement.style.color = 'green';
        headlightIconElement.className = 'fa-solid fa-lightbulb'; // 设置图标为实心灯泡
    } else if (headlightState === 'off') {
        headlightStateElement.textContent = '关闭';
        headlightStateElement.style.color = 'gray';
        headlightIconElement.className = 'fa-regular fa-lightbulb'; // 设置图标为空心灯泡
    } else {
        headlightStateElement.textContent = '未知';
        headlightStateElement.style.color = 'black';
        headlightIconElement.className = 'fa-regular fa-lightbulb'; // 设置图标为空心灯泡
    }

    // 更新左侧灯状态
    const leftSideLight = data['light.left_side_lights'];
    if (leftSideLight) {
        const leftSideLightState = leftSideLight.state;
        const brightness = leftSideLight['light.brightness'] || 0;
        const color = leftSideLight['light.color'] || 0xFFFFFF;
        const hexColor = `#${color.toString(16).padStart(6, '0')}`;

        if (leftSideLightState === 'on') {
            leftSideLightStateElement.innerHTML = `<span style="color:green;">开启</span> 亮度: <span>${brightness}%</span> 颜色: <span style="color:${hexColor};">${hexColor}</span>`;
            leftSideLightIconElement.className = 'fa-solid fa-lightbulb';
            leftSideLightIconElement.style.color = hexColor;
            leftSideLightIconElement.style.opacity = 0.5 + (brightness / 200);
        } else {
            leftSideLightStateElement.textContent = '关闭';
            leftSideLightIconElement.className = 'fa-regular fa-lightbulb';
            leftSideLightIconElement.style.color = 'gray';
        }
    } else {
        leftSideLightStateElement.textContent = '未知';
    }

    // 更新右侧灯状态
    const rightSideLight = data['light.right_side_lights'];
    if (rightSideLight) {
        const rightSideLightState = rightSideLight.state;
        const brightnessRaw = rightSideLight['light.brightness'] || 0; // 原始亮度
        const brightness = Math.round((brightnessRaw / 65535) * 100); // 转换为百分比
        const colorTemperature = rightSideLight['light.color_temperature'] || 0;

        const colorRGB = colorTempToRGB(colorTemperature); // 根据色温获取颜色
        if (rightSideLightState === 'on') {
            rightSideLightStateElement.innerHTML = `
                <span style="color:green;">开启</span> 
                亮度: <span>${brightness}%</span> 
                色温: <span style="color:${colorRGB};">${colorTemperature}K</span>`;
            rightSideLightIconElement.className = 'fa-solid fa-lightbulb';
            rightSideLightIconElement.style.color = colorRGB; // 图标颜色
        } else {
            rightSideLightStateElement.textContent = '关闭';
            rightSideLightIconElement.className = 'fa-regular fa-lightbulb';
        }
    } else {
        rightSideLightStateElement.textContent = '未知';
    }
}

// 转换色温为颜色 (实际色温范围为 2000K - 6500K)
function colorTempToRGB(temp) {
    const t = temp / 100;
    let r, g, b;

    if (t <= 66) {
        r = 255;
        g = Math.min(99.4708025861 * Math.log(t) - 161.1195681661, 255);
        b = t <= 19 ? 0 : Math.min(138.5177312231 * Math.log(t - 10) - 305.0447927307, 255);
    } else {
        r = Math.min(329.698727446 * Math.pow(t - 60, -0.1332047592), 255);
        g = Math.min(288.1221695283 * Math.pow(t - 60, -0.0755148492), 255);
        b = 255;
    }

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// 定义函数以请求 API 并更新页面
function fetchData() {
    fetch('states/', {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data from Home Assistant:', data);
            updatePage(data);
        })
        .catch(error => {
            console.error('Failed to fetch data from backend:', error);
        });
}

// 页面初始化时立即请求一次数据
fetchData();

// 每隔 15 秒重新请求数据
setInterval(fetchData, 15000);