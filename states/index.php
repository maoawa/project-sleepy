<?php
include 'config.php'; 
global $endpoint, $host, $token, $cacheFile, $cacheTTL;

// 指定需要过滤的实体 ID
$target_entities = [
    "input_boolean.private_mode",
    "input_boolean.sleeping",
    "media_player.mars_homepod_right",
    "light.left_side_lights",
    "switch.electric_blanket",
    "sensor.room_temperature",
    "sensor.room_humidity",
    "weather.forecast_home"
];

// 检查缓存是否有效
if (file_exists($cacheFile)) {
    // 从缓存文件读取数据
    $cachedData = json_decode(file_get_contents($cacheFile), true);

    if (isset($cachedData['timestamp']) && (time() - $cachedData['timestamp']) < $cacheTTL) {
        // 缓存未过期，检查 private_mode 状态
        $data = $cachedData['data'];
        $private_mode_state = null;
        $cache_age = time() - $cachedData['timestamp'];

        foreach ($data as $entity) {
            if ($entity['entity_id'] === 'input_boolean.private_mode') {
                $private_mode_state = $entity['state'];
                break;
            }
        }

        // 如果是 private_mode 开启，仅返回 private_mode 数据
        if ($private_mode_state === 'on') {
            $filtered_data = array_filter($data, function ($entity) {
                return $entity['entity_id'] === 'input_boolean.private_mode';
            });

            header("Content-Type: application/json");
            echo json_encode([
                "data" => array_values($filtered_data),
                "cached" => true,
                "timestamp" => $cachedData['timestamp'],
                "cache_age" => $cache_age
            ], JSON_PRETTY_PRINT);
            exit;
        }

        // 否则返回完整的目标实体数据
        header("Content-Type: application/json");
        echo json_encode([
            "data" => $data,
            "cached" => true,
            "timestamp" => $cachedData['timestamp'],
            "cache_age" => $cache_age
        ], JSON_PRETTY_PRINT);
        exit;
    }
}

// 如果缓存不存在或过期，向服务器拉取数据
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $endpoint . "/states");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Content-Type: application/json",
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo "cURL Error: " . curl_error($ch);
} else {
    // 解码数据
    $data = json_decode($response, true);

    // 过滤目标实体
    $filtered_data = array_filter($data, function ($entity) use ($target_entities) {
        return in_array($entity['entity_id'], $target_entities);
    });

    // 将数据存入缓存
    $cacheData = [
        "timestamp" => time(),
        "data" => array_values($filtered_data)
    ];
    file_put_contents($cacheFile, json_encode($cacheData, JSON_PRETTY_PRINT));

    // 检查 private_mode 状态
    $private_mode_state = null;
    foreach ($filtered_data as $entity) {
        if ($entity['entity_id'] === 'input_boolean.private_mode') {
            $private_mode_state = $entity['state'];
            break;
        }
    }

    // 如果 private_mode 开启，仅返回 private_mode 数据
    if ($private_mode_state === 'on') {
        $filtered_data = array_filter($filtered_data, function ($entity) {
            return $entity['entity_id'] === 'input_boolean.private_mode';
        });

        header("Content-Type: application/json");
        echo json_encode([
            "data" => array_values($filtered_data),
            "cached" => false,
            "timestamp" => $cacheData['timestamp'],
            "cache_age" => 0 // 是实时请求，所以缓存时间为 0 秒
        ], JSON_PRETTY_PRINT);
        exit;
    }

    // 否则返回目标实体数据
    header("Content-Type: application/json");
    echo json_encode([
        "data" => array_values($filtered_data),
        "cached" => false,
        "timestamp" => $cacheData['timestamp'],
        "cache_age" => 0 // 缓存刚创建，时间为 0
    ], JSON_PRETTY_PRINT);
}

curl_close($ch);