<?php
// File: read_requests.php

// Path to the JSON file where data is stored
$jsonFilePath = 'requests.json';

// Set the response header to JSON format
header('Content-Type: application/json');

// Check if the file exists
if (!file_exists($jsonFilePath)) {
    $errorResponse = json_encode([
        'error' => 'File not found.',
        'message' => 'The requests.json file does not exist in the current directory.'
    ]);
    header('Content-Length: ' . strlen($errorResponse));
    echo $errorResponse;
    exit;
}

// Load and decode the JSON data
$data = json_decode(file_get_contents($jsonFilePath), true);

// Validate the structure of the JSON data
if (!is_array($data) || !isset($data['total']) || !isset($data['daily'])) {
    $errorResponse = json_encode([
        'error' => 'Invalid data format.',
        'message' => 'The JSON file does not contain the expected structure.'
    ]);
    header('Content-Length: ' . strlen($errorResponse));
    echo $errorResponse;
    exit;
}

// Get the latest daily count
$latestDailyCount = 0;
if (!empty($data['daily'])) {
    $latestDate = max(array_keys($data['daily']));
    $latestDailyCount = $data['daily'][$latestDate] ?? 0;
}

// Prepare the response
$response = json_encode([
    'total' => $data['total'],
    'daily' => $latestDailyCount
]);

// Set Content-Length header before output
header('Content-Length: ' . strlen($response));
echo $response;
