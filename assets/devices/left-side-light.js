export function leftSideLight(data) {
    const leftSideLightStateElement = document.getElementById('left-side-light-state');
    const leftSideLightIconElement = document.getElementById('left-side-light-icon');
    const leftSideLight = data['light.left_side_lights'];
    if (leftSideLight) {
        const leftSideLightState = leftSideLight.state;
        const brightness = leftSideLight['light.brightness'] || 0;
        const color = leftSideLight['light.color'] || 0xFFFFFF; // 默认颜色为白色
        const hexColor = `#${color.toString(16).padStart(6, '0')}`; // 将颜色值转换为 Hex 格式

        if (leftSideLightState === 'on') {
            leftSideLightStateElement.innerHTML = `<span style="color:green;">开启</span> 亮度: <span>${brightness}%</span>`; // 颜色: <span style="color:${hexColor};">${hexColor}</span>
            leftSideLightIconElement.className = 'fa-solid fa-lightbulb';
            leftSideLightIconElement.style.color = hexColor;
            leftSideLightIconElement.style.opacity = 0.5 + (brightness / 200); // 调整明暗变化
        } else {
            leftSideLightStateElement.textContent = '关闭';
            leftSideLightIconElement.className = 'fa-regular fa-lightbulb';
            leftSideLightStateElement.style.color = 'gray';
            leftSideLightIconElement.style.color = 'gray';
        }
    } else {
        leftSideLightStateElement.textContent = '未知';
    }
}