export function lightBar(data) {
    const lightBarStateElement = document.getElementById('light-bar-state');
    const lightBarIconElement = document.getElementById('light-bar-icon');
    const lightBar = data['light.light_bar'];
    if (lightBar) {
        const lightBarState = lightBar.state;
        const brightness = lightBar['light.brightness'] || 0; // 直接使用 brightness 值
        const colorTemperature = lightBar['light.color_temperature'] || 0;

        const colorRGB = colorTempToRGB(colorTemperature);
        if (lightBarState === 'on') {
            lightBarStateElement.innerHTML = `<span style="color:green;">开启</span> 亮度: <span>${brightness}%</span>`;
            lightBarIconElement.className = 'fa-solid fa-minus fa-lg';
            lightBarIconElement.style.color = colorRGB;
            lightBarIconElement.style.opacity = 0.5 + (brightness / 200); // 调整明暗变化
        } else {
            lightBarStateElement.textContent = '关闭';
            lightBarStateElement.style.color = 'gray';
            lightBarIconElement.className = 'fa-solid fa-minus fa-lg';
            lightBarIconElement.style.color = 'gray';
        }
    } else {
        lightBarStateElement.textContent = '未知';
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