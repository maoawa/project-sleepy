export function electricBlanket(data) {
    const electricBlanketStateElement = document.getElementById('electric-blanket-state');
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
}