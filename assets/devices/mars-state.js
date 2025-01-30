export function marsState(data) {
    const marsStateElement = document.getElementById('mars-state');
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
}