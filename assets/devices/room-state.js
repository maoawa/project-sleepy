// Contains Temperature & Humidity
export function roomState(data) {
    const temperatureStateElement = document.getElementById('temperature-state');
    const humidityStateElement = document.getElementById('humidity-state');
    const pressureStateElement = document.getElementById('pressure-state');
    const roomTemperature = data['sensor.room_temperature']?.state;
    const roomHumidity = data['sensor.room_humidity']?.state;
    const roomPressure = data['sensor.room_pressure']?.state;

    if (roomTemperature && roomTemperature !== 'unavailable') {
        temperatureStateElement.textContent = `${parseFloat(roomTemperature).toFixed(1)}°C`;
    } else {
        temperatureStateElement.textContent = '未知';
    }

    if (roomHumidity && roomHumidity !== 'unavailable') {
        humidityStateElement.textContent = `${parseFloat(roomHumidity).toFixed(1)}%`;
    } else {
        humidityStateElement.textContent = '未知';
    }

    if (roomPressure && roomPressure !== 'unavailable') {
        pressureStateElement.textContent = `${parseFloat(roomPressure).toFixed(1)}hPa`;
    } else {
        pressureStateElement.textContent = '未知';
    }
}