export function weather(data) {
    // 默认值和映射
    const DEFAULT_WEATHER_STATE = '未知';
    const DEFAULT_ICON = 'fa-question';
    const DEFAULT_TEMPERATURE = '未知';
    const DEFAULT_HUMIDITY = '未知';
    const DEFAULT_WIND_SPEED = '未知';

    // https://www.home-assistant.io/integrations/weather/
    const weatherIcons = {
        'clear-night': 'fa-moon',
        'cloudy': 'fa-cloud',
        'fog': 'fa-smog',
        'hail': 'fa-cloud-meatball',
        'lightning': 'fa-bolt',
        'lightning-rainy': 'fa-cloud-bolt',
        'partlycloudy': 'fa-cloud-sun',
        'pouring': 'fa-cloud-showers-heavy',
        'rainy': 'fa-cloud-rain',
        'snowy': 'fa-snowflake',
        'snowy-rainy': 'fa-snowflake',
        'sunny': 'fa-sun',
        'windy': 'fa-wind',
        'windy-variant': 'fa-cloud-wind',
        'exceptional': 'fa-star'
    };

    const weatherTranslations = {
        'clear-night': '晴',
        'cloudy': '多云',
        'fog': '雾',
        'hail': '冰雹',
        'lightning': '雷电',
        'lightning-rainy': '雷雨',
        'partlycloudy': '局部多云',
        'pouring': '大雨',
        'rainy': '雨',
        'snowy': '雪',
        'snowy-rainy': '雨夹雪',
        'sunny': '晴',
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
                ? `${parseInt(weather.temperature)}°C` 
                : DEFAULT_TEMPERATURE;
            const humidity = weather.humidity !== undefined 
                ? `${parseInt(weather.humidity)}%` 
                : DEFAULT_HUMIDITY;
            const windSpeed = weather.wind_speed !== undefined 
                ? `${parseFloat(weather.wind_speed).toFixed(1)}m/s` 
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
}