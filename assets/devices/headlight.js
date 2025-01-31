export function headlight(data) {
    const headlightStateElement = document.getElementById('headlight-state');
    const headlightIconElement = document.querySelector('#headlight-icon');
    const headlightState = data['light.headlight']?.state;
    if (headlightState === 'on') {
        headlightStateElement.textContent = '开启';
        headlightStateElement.style.color = 'green';
        headlightIconElement.className = 'fa-solid fa-lightbulb';
    } else if (headlightState === 'off') {
        headlightStateElement.textContent = '关闭';
        headlightStateElement.style.color = 'gray';
        headlightIconElement.className = 'fa-regular fa-lightbulb';
        headlightIconElement.style.color = 'gray';
    } else {
        headlightStateElement.textContent = '未知';
        headlightStateElement.style.color = 'white';
        headlightIconElement.className = 'fa-regular fa-lightbulb';
    }
}