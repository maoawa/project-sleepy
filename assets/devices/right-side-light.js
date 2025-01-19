export function rightSideLight(data) {
    const rightSideLightStateElement = document.getElementById('right-side-light-state');
    const rightSideLightIconElement = document.getElementById('right-side-light-icon');
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