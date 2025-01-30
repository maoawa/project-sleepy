# Project Sleepy
Let your friends know if you're sleeping or not, and share the states of your smart home devices.  
让你的朋友们知道你是醒着的还是睡似的，甚至还能和他们分享你智能家居设备的状态

**Smart Home Features are based on** / **智能家居功能基于** [**`Home Assistant REST API`**](https://developers.home-assistant.io/docs/api/rest/)

*****HA***** = **Home Assistant**

# 实现原理

通过 PHP 请求 Home Assistant 的 REST API，获取所有设备信息，然后筛选出需要的设备和信息返回给前端。支持设备状态缓存和实体图片(专辑封面)缓存，来减轻家中运行 HA 的设备的压力。

通过将筛选环节设计在后端，可以避免将敏感设备数据公开。同时筛选后的数据极小，优化性能并方便前端处理，减少不必要的流量开支。

前端请求 PHP 接口并获得状态信息之后，将会解析并在网页上更新 (用 JavaScript 实现)。这部分使用模块化设计，以满足对不同设备使用单独设计的更新内容，减少主脚本大小，使后续添加设备和维护更加方便。

# 大致流程
前端请求后端 `states/index.php`  
后端检查当前缓存是否有效 (缓存是否存在/过期)。缓存有效则返回请求后的数据，若缓存无效，将会请求 HA API 并筛选数据，然后将数据返回给前端并且缓存。

*隐私模式: 如果后端判定缓存无效，需要重新请求 HA API 获取数据，在返回给前端并写入缓存前会检查隐私模式开关状态是否为开启。如果是，则判定启用隐私模式，将会丢弃其他设备，只保留睡眠状态和隐私模式开关状态，将有限的数据传递给前端并储存。

# Sleepy Helper
**Sleepy Helper** ([**maoawa/sleepy-helper**](https://github.com/maoawa/sleepy-helper)) 是 **Project Sleepy** 的扩展。

目前包括如下几个功能:  
1. 通过 Python 脚本定时向 Home Assistant 发送当前 macOS 或 Windows 设备上捕获焦点(前台程序)的标题。
2. 通过快捷指令实现在 Apple 设备上更新网站上展示的消息，同时设置过期时间，亦可使消息立即过期。
3. 将各种传感器和控制器通过 [**ESPHome**](https://esphome.io) 接入 Home Assistant，来控制如**隐私模式**等功能的开关。

## states/config.php
在 `states/config.php` 中需要配置以下变量 (`states/config-example.php` 中有模版):  
1. `endpoint`: 你的 Home Assistant 的 REST API 接入点 (默认为 `<HA DOMAIN>/api`，如 `https://your-home.example.net/api`)
2. `host`: 你的 Home Assistant 域名 (需包含协议，如 `https://your-home.example.net`)
3. `token`: 你的长期访问令牌(在控制台左下角用户面板的底部生成，详见 [**HA 官方文档**](https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token))
4. `cacheFile`: 缓存文件路径，推荐 `__DIR__ . '/cache.json'` (states/cache.json)
5. `cacheTTL`: 缓存过期时间，单位为秒


**此项目的 ChatGPT 含量在60%以上，纯小白代码，请各位大佬轻喷。有任何问题和建议欢迎访问[这里是毛毛](https://maao.cc/)(联系页面)和我交流!**