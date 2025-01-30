export function runningApp(data) {
    // 通用更新逻辑
    function updateDeviceState(elementId, state, iconClass, displayName) {
        const element = document.getElementById(elementId);
        if (state && state !== 'unavailable') {
            element.innerHTML = `<i class="${iconClass}"></i>${displayName}: ${state}`;
        } else {
            element.innerHTML = ``; // 状态不可用时清空内容
        }
    }

    // 更新 Mac mini 状态
    updateDeviceState('mars-mac-mini', data['input_text.mars_mac_mini']?.state, 'fa-brands fa-apple', '毛毛的Mac');

    // 更新 Legion 状态
    updateDeviceState('mars-legion', data['input_text.mars_legion']?.state, 'fa-brands fa-microsoft', '毛毛的拯救者');
}