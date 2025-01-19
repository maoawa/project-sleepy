<?php
// File: read_requests.php

// Path to the JSON file where data is stored
$jsonFilePath = 'requests.json';

// Check if the file exists
if (!file_exists($jsonFilePath)) {
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'File not found.',
        'message' => 'The requests.json file does not exist in the current directory.'
    ]);
    exit;
}

// Load and decode the JSON data
$data = json_decode(file_get_contents($jsonFilePath), true);

// Validate the structure of the JSON data
if (!is_array($data) || !isset($data['total']) || !isset($data['daily'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Invalid data format.',
        'message' => 'The JSON file does not contain the expected structure.'
    ]);
    exit;
}

// Get the latest daily count
$latestDailyCount = 0;
if (!empty($data['daily'])) {
    $latestDate = max(array_keys($data['daily']));
    $latestDailyCount = $data['daily'][$latestDate] ?? 0;
}

// Prepare the response
$response = [
    'total' => $data['total'],
    'daily' => $latestDailyCount
];

// Return the response as JSON
header('Content-Type: application/json');
echo json_encode($response);