import { marsState } from './devices/mars-state.js';
import { lightSensor } from './devices/light-sensor.js';
import { headlight } from './devices/headlight.js';
import { leftSideLight } from './devices/left-side-light.js';
import { rightSideLight } from './devices/right-side-light.js';
import { marsHomePod } from './devices/mars-homepod.js';
import { electricBlanket } from './devices/electric-blanket.js';
import { roomState } from './devices/room-state.js';
import { weather } from './devices/weather.js';

let previousPrivateMode = false;

// 定义显示缓存状态和下一次更新的元素
const cacheStateElement = document.getElementById('cache-state');
const updateElement = document.getElementById('update');

async function fetchData() {
    try {
        const response = await fetch('states/');
        const data = await response.json();

        // 更新页面内容
        updatePage(data);

        // 更新缓存和倒计时信息
        updateCacheInfo(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateCacheInfo(data) {
    clearInterval(window.previousAgeInterval);
    clearInterval(window.previousCountdownInterval);

    // 显示缓存状态
    let age = data.cache_age || 0;
    if (data.cached) {
        cacheStateElement.textContent = `已读取缓存，数据更新于 ${age} 秒前`;
    } else {
        cacheStateElement.textContent = `即时数据，更新于 ${age} 秒前`;
    }
    cacheStateElement.style.display = 'block';

    // 每秒更新缓存年龄
    window.previousAgeInterval = setInterval(() => {
        age++;
        if (data.cached) {
            cacheStateElement.textContent = `已读取缓存，数据更新于 ${age} 秒前`;
        } else {
            cacheStateElement.textContent = `即时数据，更新于 ${age} 秒前`;
        }
    }, 1000);

    // 下一次更新倒计时
    let nextUpdate = 15; // 定时刷新为15秒
    updateElement.textContent = `下一次自动更新: ${nextUpdate} 秒后`;

    window.previousCountdownInterval = setInterval(() => {
        nextUpdate--;
        updateElement.textContent = `下一次自动更新: ${nextUpdate} 秒后`;
        if (nextUpdate <= 0) {
            clearInterval(window.previousCountdownInterval);
        }
    }, 1000);
}

function updatePage(data) {
    const privateModeState = data['input_boolean.private_mode']?.state;

    // 隐私模式检查
    if (privateModeState === 'on') {
        marsState(data);
        document.getElementById('smart-home-info').innerHTML =
            '<i class="fa-solid fa-user-lock"></i> 隐私模式已启用<br>毛毛可能目前正忙，请稍后再回来看看';
        previousPrivateMode = true;
        return;
    } else if (previousPrivateMode && privateModeState === 'off') {
        window.location.reload();
        return;
    }
    previousPrivateMode = false;

    // UPDATE FUNCTIONS
    marsState(data);
    lightSensor(data);
    headlight(data);
    leftSideLight(data);
    rightSideLight(data);
    marsHomePod(data);
    electricBlanket(data);
    roomState(data);
    weather(data);
}

setInterval(fetchData, 15000);
fetchData();