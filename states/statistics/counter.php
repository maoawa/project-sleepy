<?php
// Path to the JSON file where data will be stored
$jsonFilePath = __DIR__ . '/requests.json';

// Get the current date
$currentDate = date('Y-m-d');

// Initialize or load the data
if (!file_exists($jsonFilePath)) {
    $data = [
        'total' => 0,
        'daily' => []
    ];
} else {
    $data = json_decode(file_get_contents($jsonFilePath), true);
    if (!is_array($data)) {
        $data = [
            'total' => 0,
            'daily' => []
        ];
    }
}

// Increment the total request count
$data['total']++;

// Increment the daily request count
if (!isset($data['daily'][$currentDate])) {
    $data['daily'][$currentDate] = 0;
}
$data['daily'][$currentDate]++;

// Save the updated data back to the JSON file
file_put_contents($jsonFilePath, json_encode($data, JSON_PRETTY_PRINT));