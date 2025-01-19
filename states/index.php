<?php
include 'config.php';
global $endpoint, $host, $token, $cacheFile, $cacheTTL;
include 'statistics/counter.php';

// 限制 JSON 编码的浮点数精度
ini_set('serialize_precision', 14);

// 指定每个实体需要保留的字段
$entities = [
    "input_boolean.private_mode" => [],
    "input_text.mars_state" => [],
    "light.headlight" => [],
    "light.left_side_lights" => ["light.brightness", "light.color"],
    "light.right_side_lights" => ["light.brightness", "light.color_temperature"],
    "media_player.mars_homepod_right" => ["media_title", "media_artist", "media_album_name", "app_name", "entity_picture"],
    "switch.electric_blanket" => [],
    "sensor.room_temperature" => [],
    "sensor.room_humidity" => [],
    "weather.forecast_home" => ["temperature", "humidity", "wind_speed"],
    "binary_sensor.light_sensor" => []
];

function extract_entity_data($entity, $fields_to_keep) {
    $filtered_data = [
        "state" => $entity['state'] // 保留原始状态
    ];

    foreach ($fields_to_keep as $field) {
        // 直接筛选需要的字段，不做任何处理
        $filtered_data[$field] = $entity['attributes'][$field] ?? null;
    }

    return $filtered_data;
}

// 检查封面图片并下载
function check_and_download_cover($media_title, $entity_picture) {
    $covers_dir = __DIR__ . '/covers/';
    if (!is_dir($covers_dir)) {
        mkdir($covers_dir, 0755, true);
    }

    $cover_path = $covers_dir . $media_title . '.png';
    if (file_exists($cover_path)) {
        return;
    }

    global $host;
    $image_url = $host . $entity_picture;
    $ch = curl_init($image_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $image_data = curl_exec($ch);
    if (curl_errno($ch)) {
        error_log("Failed to download image: " . curl_error($ch));
        curl_close($ch);
        return;
    }
    curl_close($ch);

    file_put_contents($cover_path, $image_data);
}

// 构造数据
function format_data_by_entity_id($data, $entities) {
    $formatted = [];
    foreach ($data as $entity) {
        if (isset($entities[$entity['entity_id']])) {
            $formatted[$entity['entity_id']] = extract_entity_data($entity, $entities[$entity['entity_id']]);

            // 如果是媒体播放器，检查并处理封面图片
            if ($entity['entity_id'] === 'media_player.mars_homepod_right') {
                $media_title = $entity['attributes']['media_title'] ?? null;
                $entity_picture = $entity['attributes']['entity_picture'] ?? null;
                if ($media_title && $entity_picture) {
                    check_and_download_cover($media_title, $entity_picture);
                }
            }
        }
    }
    return $formatted;
}

// 检查缓存
$cacheValid = false;
if (file_exists($cacheFile)) {
    $cachedData = json_decode(file_get_contents($cacheFile), true);
    if (isset($cachedData['timestamp']) && (time() - $cachedData['timestamp']) < $cacheTTL) {
        $cacheValid = true;
        // 缓存有效，返回缓存数据
        header("Content-Type: application/json");
        echo json_encode(array_merge([
            "cached" => true,
            "timestamp" => $cachedData['timestamp'],
            "cache_age" => time() - $cachedData['timestamp']
        ], $cachedData['data']), JSON_PRETTY_PRINT);
        exit;
    }
}

// 缓存无效，拉取新数据
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
    curl_close($ch);
    exit;
}

$data = json_decode($response, true);
curl_close($ch);

// 拉取新数据并构建格式化数据
$filtered_data = format_data_by_entity_id($data, $entities);

// 检查 private_mode
$is_private_mode_on = false;
if (isset($filtered_data['input_boolean.private_mode']) && $filtered_data['input_boolean.private_mode']['state'] === 'on') {
    $is_private_mode_on = true;
}

if ($is_private_mode_on) {
    $filtered_data = array_filter($filtered_data, function ($key) {
        return in_array($key, ['input_boolean.private_mode', 'input_text.mars_state']);
    }, ARRAY_FILTER_USE_KEY);
}

// 写入缓存文件
$cacheData = [
    "timestamp" => time(),
    "data" => $filtered_data
];
file_put_contents($cacheFile, json_encode($cacheData, JSON_PRETTY_PRINT));

// 返回数据
header("Content-Type: application/json");
echo json_encode(array_merge([
    "cached" => false,
    "timestamp" => $cacheData['timestamp'],
    "cache_age" => 0
], $filtered_data), JSON_PRETTY_PRINT);