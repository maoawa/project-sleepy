// 添加一个全局变量来跟踪隐私模式状态
let previousPrivateMode = false;

function updatePage(data) {
    const smartHomeInfoElement = document.getElementById('smart-home-info');
    const privateModeState = data['input_boolean.private_mode']?.state;

    // 检查隐私模式状态变化
    if (privateModeState === 'on') {
        smartHomeInfoElement.innerHTML = '<i class="fa-solid fa-user-lock"></i> 隐私模式已启用<br>毛毛可能目前正忙，请稍后再回来看看';
        previousPrivateMode = true;
    } else if (previousPrivateMode && privateModeState === 'off') {
        // 如果隐私模式从开启变为关闭，刷新页面
        window.location.reload();
        return;
    } else {
        previousPrivateMode = false;
    }

    // 继续处理其他状态更新逻辑
    const marsStateElement = document.getElementById('mars-state');
    const cacheStateElement = document.getElementById('cache-state');
    const updateElement = document.getElementById('update');
    const headlightStateElement = document.getElementById('headlight-state');
    const headlightIconElement = document.querySelector('#headlight-icon');
    const leftSideLightStateElement = document.getElementById('left-side-light-state');
    const leftSideLightIconElement = document.getElementById('left-side-light-icon');
    const rightSideLightStateElement = document.getElementById('right-side-light-state');
    const rightSideLightIconElement = document.getElementById('right-side-light-icon');
    const lightSensorStateElement = document.getElementById('light-sensor-state');
    const lightSensorIconElement = document.querySelector('#light-sensor-icon');
    const electricBlanketStateElement = document.getElementById('electric-blanket-state');
    const temperatureStateElement = document.getElementById('temperature-state');
    const humidityStateElement = document.getElementById('humidity-state');


    if (window.previousCountdownInterval) {
        clearInterval(window.previousCountdownInterval);
    }
    if (window.previousAgeInterval) {
        clearInterval(window.previousAgeInterval);
    }

    const marsState = data['input_text.mars_state']?.state;
    if (marsState) {
        if (marsState === 'awake') {
            marsStateElement.textContent = '醒着';
            marsStateElement.style.color = 'green';
        } else if (marsState === 'sleeping') {
            marsStateElement.textContent = '睡似了';
            marsStateElement.style.color = 'gray';
        } else {
            marsStateElement.textContent = marsState;
            marsStateElement.style.color = 'white';
        }
    } else {
        marsStateElement.textContent = '未知';
        marsStateElement.style.color = 'red';
    }

    let age = data.cache_age || 0;
    if (data.cached) {
        cacheStateElement.textContent = `已读取缓存，数据更新于 ${age} 秒前`;
    } else {
        cacheStateElement.textContent = `即时数据，更新于 ${age} 秒前`;
    }

    cacheStateElement.style.display = 'block';

    window.previousAgeInterval = setInterval(() => {
        age++;
        if (data.cached) {
            cacheStateElement.textContent = `已读取缓存，数据更新于 ${age} 秒前`;
        } else {
            cacheStateElement.textContent = `即时数据，更新于 ${age} 秒前`;
        }
    }, 1000);

    let nextUpdate = 15;
    updateElement.textContent = `下一次自动更新: ${nextUpdate} 秒后`;

    window.previousCountdownInterval = setInterval(() => {
        nextUpdate--;
        updateElement.textContent = `下一次自动更新: ${nextUpdate} 秒后`;
        if (nextUpdate <= 0) {
            clearInterval(window.previousCountdownInterval);
        }
    }, 1000);

    const headlightState = data['light.headlight']?.state;
    if (headlightState === 'on') {
        headlightStateElement.textContent = '开启';
        headlightStateElement.style.color = 'green';
        headlightIconElement.className = 'fa-solid fa-lightbulb';
    } else if (headlightState === 'off') {
        headlightStateElement.textContent = '关闭';
        headlightStateElement.style.color = 'gray';
        headlightIconElement.className = 'fa-regular fa-lightbulb';
    } else {
        headlightStateElement.textContent = '未知';
        headlightStateElement.style.color = 'white';
        headlightIconElement.className = 'fa-regular fa-lightbulb';
    }

    const leftSideLight = data['light.left_side_lights'];
    if (leftSideLight) {
        const leftSideLightState = leftSideLight.state;
        const brightness = leftSideLight['light.brightness'] || 0;
        const color = leftSideLight['light.color'] || 0xFFFFFF; // 默认颜色为白色
        const hexColor = `#${color.toString(16).padStart(6, '0')}`; // 将颜色值转换为 Hex 格式
    
        if (leftSideLightState === 'on') {
            leftSideLightStateElement.innerHTML = `<span style="color:green;">开启</span> 亮度: <span>${brightness}%</span> 颜色: <span style="color:${hexColor};">${hexColor}</span>`;
            leftSideLightIconElement.className = 'fa-solid fa-lightbulb';
            leftSideLightIconElement.style.color = hexColor;
            leftSideLightIconElement.style.opacity = 0.5 + (brightness / 200); // 调整明暗变化
        } else {
            leftSideLightStateElement.textContent = '关闭';
            leftSideLightIconElement.className = 'fa-regular fa-lightbulb';
            leftSideLightIconElement.style.color = 'gray';
            leftSideLightIconElement.style.opacity = 0.5; // 关闭时固定明暗
        }
    } else {
        leftSideLightStateElement.textContent = '未知';
    }
    
    const rightSideLight = data['light.right_side_lights'];
    if (rightSideLight) {
        const rightSideLightState = rightSideLight.state;
        const brightnessRaw = rightSideLight['light.brightness'] || 0;
        const brightness = Math.round((brightnessRaw / 65535) * 100); // 将 16-bit 亮度值转换为百分比
        const colorTemperature = rightSideLight['light.color_temperature'] || 0;
    
        const colorRGB = colorTempToRGB(colorTemperature);
        if (rightSideLightState === 'on') {
            rightSideLightStateElement.innerHTML = `
                <span style="color:green;">开启</span> 
                亮度: <span>${brightness}%</span> 
                色温: <span style="color:${colorRGB};">${colorTemperature}K</span>`;
            rightSideLightIconElement.className = 'fa-solid fa-lightbulb';
            rightSideLightIconElement.style.color = colorRGB;
            rightSideLightIconElement.style.opacity = 0.5 + (brightness / 200); // 调整明暗变化
        } else {
            rightSideLightStateElement.textContent = '关闭';
            rightSideLightIconElement.className = 'fa-regular fa-lightbulb';
            rightSideLightIconElement.style.color = 'gray';
            rightSideLightIconElement.style.opacity = 0.5; // 关闭时固定明暗
        }
    } else {
        rightSideLightStateElement.textContent = '未知';
    }

    // 更新环境光亮度状态
    const lightSensorState = data['binary_sensor.light_sensor']?.state;
    if (lightSensorState === 'on') {
        lightSensorStateElement.textContent = '亮';
        lightSensorStateElement.style.color = 'gold';
        lightSensorIconElement.className = 'fa-solid fa-sun'; // 实心太阳图标
        lightSensorIconElement.style.color = 'gold';
    } else if (lightSensorState === 'off') {
        lightSensorStateElement.textContent = '暗';
        lightSensorStateElement.style.color = 'gray';
        lightSensorIconElement.className = 'fa-regular fa-sun'; // 空心太阳图标
        lightSensorIconElement.style.color = 'gray';
    } else {
        lightSensorStateElement.textContent = '未知';
        lightSensorStateElement.style.color = 'white';
        lightSensorIconElement.className = 'fa-regular fa-sun';
    }

    // 更新电热毯状态
    const electricBlanketState = data['switch.electric_blanket']?.state;
    if (electricBlanketState === 'on') {
        electricBlanketStateElement.textContent = '开启';
        electricBlanketStateElement.style.color = 'green';
    } else if (electricBlanketState === 'off') {
        electricBlanketStateElement.textContent = '关闭';
        electricBlanketStateElement.style.color = 'gray';
    } else {
        electricBlanketStateElement.textContent = '未知';
        electricBlanketStateElement.style.color = 'white';
    }

    // 更新温湿度状态
    const roomTemperature = data['sensor.room_temperature']?.state;
    const roomHumidity = data['sensor.room_humidity']?.state;
    if (roomTemperature) {
        temperatureStateElement.textContent = `${parseFloat(roomTemperature).toFixed(1)}°C`;
    } else {
        temperatureStateElement.textContent = '未知';
    }

    if (roomHumidity) {
        humidityStateElement.textContent = `${parseInt(roomHumidity)}%`;
    } else {
        humidityStateElement.textContent = '未知';
    }
    // 更新天气信息
    // 默认值和映射
    const DEFAULT_WEATHER_STATE = '未知';
    const DEFAULT_ICON = 'fa-question';
    const DEFAULT_TEMPERATURE = '未知';
    const DEFAULT_HUMIDITY = '未知';
    const DEFAULT_WIND_SPEED = '未知';

    const weatherIcons = {
        'clear-night': 'fa-moon',
        'cloudy': 'fa-cloud',
        'fog': 'fa-smog',
        'hail': 'fa-cloud-meatball',
        'lightning': 'fa-bolt',
        'partlycloudy': 'fa-cloud-sun',
        'pouring': 'fa-cloud-showers-heavy',
        'rainy': 'fa-cloud-rain',
        'snowy': 'fa-snowflake',
        'sunny': 'fa-sun',
        'windy': 'fa-wind',
        'windy-variant': 'fa-cloud-wind',
        'exceptional': 'fa-star'
    };

    const weatherTranslations = {
        'clear-night': '晴朗的夜晚',
        'cloudy': '多云',
        'fog': '有雾',
        'hail': '冰雹',
        'lightning': '雷电',
        'partlycloudy': '局部多云',
        'pouring': '倾盆大雨',
        'rainy': '下雨',
        'snowy': '下雪',
        'sunny': '晴天',
        'windy': '有风',
        'windy-variant': '多风',
        'exceptional': '特殊天气'
    };

    // 更新天气信息的函数
    function updateWeatherInfo(weather) {
        const weatherStateElement = document.getElementById('weather-state');
        const weatherIconElement = document.getElementById('weather-icon');
        const weatherTemperatureElement = document.getElementById('weather-temperature');
        const weatherHumidityElement = document.getElementById('weather-humidity');
        const weatherWindSpeedElement = document.getElementById('weather-wind-speed');

        if (weather) {
            const state = weather.state || 'unknown';
            const temperature = weather.temperature !== undefined 
                ? `${parseFloat(weather.temperature).toFixed(1)}°C` 
                : DEFAULT_TEMPERATURE;
            const humidity = weather.humidity !== undefined 
                ? `${parseInt(weather.humidity)}%` 
                : DEFAULT_HUMIDITY;
            const windSpeed = weather.wind_speed !== undefined 
                ? `${parseFloat(weather.wind_speed).toFixed(1)} km/h` 
                : DEFAULT_WIND_SPEED;

            // 获取中文翻译和图标
            const translatedState = weatherTranslations[state] || DEFAULT_WEATHER_STATE;
            const iconClass = weatherIcons[state] || DEFAULT_ICON;

            // 更新 DOM
            weatherStateElement.textContent = translatedState;
            weatherIconElement.className = `fa-solid ${iconClass}`;
            weatherTemperatureElement.textContent = temperature;
            weatherHumidityElement.textContent = humidity;
            weatherWindSpeedElement.textContent = windSpeed;
        } else {
            // 如果天气信息不存在，设置为默认值
            weatherStateElement.textContent = DEFAULT_WEATHER_STATE;
            weatherIconElement.className = `fa-solid ${DEFAULT_ICON}`;
            weatherTemperatureElement.textContent = DEFAULT_TEMPERATURE;
            weatherHumidityElement.textContent = DEFAULT_HUMIDITY;
            weatherWindSpeedElement.textContent = DEFAULT_WIND_SPEED;
        }
    }

    // 从数据中提取天气信息并更新
    const weather = data['weather.forecast_home'];
    updateWeatherInfo(weather);

    // 更新 HomePod 状态
    const homePodData = data['media_player.mars_homepod_right'];
    const homePodStateElement = document.getElementById('homepod-state');

    if (homePodData) {
        const mediaTitle = homePodData.media_title;
        const mediaArtist = homePodData.media_artist || '未知艺术家';
        const mediaAlbumName = homePodData.media_album_name || '未知专辑';
        let appName = homePodData.app_name || '未知应用';

        // 如果 appName 是 "Music"，替换为 "Apple Music"
        if (appName === 'Music') {
            appName = 'Apple Music';
        }

        if (mediaTitle) {
            homePodStateElement.innerHTML = `${mediaTitle}<br>${mediaArtist} - ${mediaAlbumName}<br>${appName}`;
            homePodStateElement.style.color = 'green';
        } else {
            homePodStateElement.textContent = '未在播放';
            homePodStateElement.style.color = 'gray';
        }
    } else {
        homePodStateElement.textContent = '未在播放';
        homePodStateElement.style.color = 'gray';
    }
}

function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

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
            const currentTime = new Date();
            const formattedTime = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;
            console.log(`Data at ${formattedTime}`, data);
            updatePage(data);
        })
        .catch(error => {
            console.error('Failed to fetch data from backend:', error);
        });
}

fetchData();
setInterval(fetchData, 15000);