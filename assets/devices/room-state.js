// Contains Temperature & Humidity
export function roomState(data) {
    const temperatureStateElement = document.getElementById('temperature-state');
    const humidityStateElement = document.getElementById('humidity-state');
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
}