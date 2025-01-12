<?php
include 'config.php';
global $endpoint, $host, $webhost, $token, $cacheFile, $cacheTTL;

// 指定每个实体需要保留的字段
$entities = [
    "input_boolean.private_mode" => [],
    "input_boolean.awake" => [],
    "light.headlight" => [],
    "light.left_side_lights" => ["light.brightness", "light.color"],
    "light.right_side_lights" => ["light.brightness", "light.color_temperature"],
    "media_player.mars_homepod_right" => ["media_title", "media_artist", "media_album_name", "app_name", "entity_picture"],
    "switch.electric_blanket" => [],
    "sensor.room_temperature" => [],
    "sensor.room_humidity" => [],
    "weather.forecast_home" => ["temperature", "humidity", "wind_speed"]
];

// 动态提取需要的字段
function extract_entity_data($entity, $fields_to_keep, $host, $webhost, $downloadCover) {
    $filtered_data = [
        "state" => $entity['state']
    ];

    foreach ($fields_to_keep as $field) {
        $value = $entity['attributes'][$field] ?? null;

        if ($field === "entity_picture" && !empty($value)) {
            $remoteUrl = rtrim($host, '/') . $value;
            $localFile = __DIR__ . "/mars-homepod-cover.png"; // 本地图片保存路径
            $localUrl = rtrim($webhost, '/') . "/states/mars-homepod-cover.png";

            if ($downloadCover) {
                // 下载图片并保存到本地
                $ch = curl_init($remoteUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $imageData = curl_exec($ch);
                curl_close($ch);

                if ($imageData) {
                    file_put_contents($localFile, $imageData);
                }
            }

            // 无论是否下载，返回源服务器地址
            $value = $remoteUrl;
        }

        $filtered_data[$field] = $value;
    }

    return $filtered_data;
}

// 构造数据
function format_data_by_entity_id($data, $entities, $host, $webhost, $downloadCover) {
    $formatted = [];
    foreach ($data as $entity) {
        if (isset($entities[$entity['entity_id']])) {
            $formatted[$entity['entity_id']] = extract_entity_data($entity, $entities[$entity['entity_id']], $host, $webhost, $downloadCover);
        }
    }
    return $formatted;
}

// 替换 entity_picture 为本地缓存的 URL
function update_cache_urls($filtered_data, $webhost) {
    foreach ($filtered_data as $entity_id => $data) {
        if (isset($data['entity_picture'])) {
            $filtered_data[$entity_id]['entity_picture'] = rtrim($webhost, '/') . "/states/mars-homepod-cover.png";
        }
    }
    return $filtered_data;
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

// 拉取新数据并下载图片
$filtered_data = format_data_by_entity_id($data, $entities, $host, $webhost, true);

// 写入缓存前替换图片为本地 URL
$cached_data = update_cache_urls($filtered_data, $webhost);

// 检查 private_mode
$is_private_mode_on = false;
if (isset($cached_data['input_boolean.private_mode']) && $cached_data['input_boolean.private_mode']['state'] === 'on') {
    $is_private_mode_on = true;
}

if ($is_private_mode_on) {
    $cached_data = array_filter($cached_data, function ($key) {
        return in_array($key, ['input_boolean.private_mode', 'input_boolean.sleeping']);
    }, ARRAY_FILTER_USE_KEY);
}

// 写入缓存文件
$cacheData = [
    "timestamp" => time(),
    "data" => $cached_data
];
file_put_contents($cacheFile, json_encode($cacheData, JSON_PRETTY_PRINT));

// 返回数据（使用源服务器地址）
header("Content-Type: application/json");
echo json_encode(array_merge([
    "cached" => false,
    "timestamp" => $cacheData['timestamp'],
    "cache_age" => 0
], $filtered_data), JSON_PRETTY_PRINT);