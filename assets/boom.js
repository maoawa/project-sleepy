let count = 0;
let timer = null;
let remainingTime = 5;
let started = false;

function handleClick() {
    if (!started) {
        startCounting();
    }
    incrementCount();
}

function startCounting() {
    started = true;
    ended = false;  // 计时开始时重置
    count = 0;
    remainingTime = 5.0; // 设置为浮点数
    document.getElementById("count").textContent = `点击次数: ${count}`;
    document.getElementById("timer").textContent = `剩余时间: ${remainingTime.toFixed(1)}s`;
    document.getElementById("count").style.display = "block";
    document.getElementById("timer").style.display = "block";

    const startTime = performance.now();

    function updateTimer() {
        const elapsed = (performance.now() - startTime) / 1000;
        const newTime = Math.max(5.0 - elapsed, 0);
        document.getElementById("timer").textContent = `剩余时间: ${newTime.toFixed(1)}s`;

        if (newTime > 0) {
            requestAnimationFrame(updateTimer);
        } else {
            ended = true; // 计时结束
            sendRequest();
        }
    }

    requestAnimationFrame(updateTimer);
}

function incrementCount() {
    if (started && !ended) { // 计时未结束才能增加点击数
        count++;
        document.getElementById("count").textContent = `点击次数: ${count}`;
    }
}

function sendRequest() {
    const message = document.getElementById("message").value.trim();
    
    grecaptcha.ready(function() {
        grecaptcha.execute('6Ld0SNgqAAAAAJSHgR96yQysjWUPl_HASSj3SfY7', { action: 'submit' }).then(function(token) {
            let url = `boom/`;
            let data = new URLSearchParams();
            data.append("times", count);
            data.append("message", message);
            data.append("recaptcha", token);  // 添加 reCAPTCHA 令牌

            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: data.toString()
            })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    let result = `提醒已收到!<br>你打了毛毛${count}次`;
                    if (message) {
                        result += `，并且附言:<br>${message}`;
                    }
                    result += `<br>相信毛毛在收到之后一定会去睡觉的 (...吧?)`;
                    document.getElementById("result").innerHTML = result;
                } else {
                    showError(JSON.stringify(data, null, 2));
                }
            })
            .catch(error => showError(error.message));
        });
    });
}

function showError(errorMessage) {
    document.getElementById("result").innerHTML = `
        提醒发送失败!<br>
        错误信息:<br>
        <pre>${errorMessage}</pre>
        <button onclick="sendRequest()">重试</button>
    `;
}