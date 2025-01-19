export function lightSensor(data) {
    const lightSensorStateElement = document.getElementById('light-sensor-state');
    const lightSensorIconElement = document.querySelector('#light-sensor-icon');
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
}