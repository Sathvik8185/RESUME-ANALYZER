<?php
// 1. Handle CORS (Allow Frontend to talk to Backend)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("HTTP/1.1 200 OK");
    exit;
}

require_once __DIR__ . '/../src/Controllers/ApiController.php';

$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$controller = new ApiController();

// 2. ROUTING LOGIC

// Route: POST /api/analyze
if (strpos($requestUri, '/api/analyze') !== false && $method === 'POST') {
    $controller->analyzeResume();
} 

// Route: GET /api/history
elseif (strpos($requestUri, '/api/history') !== false && $method === 'GET') {
    $controller->getHistory();
}

// Route: DELETE /api/history?id=1
elseif (strpos($requestUri, '/api/history') !== false && $method === 'DELETE') {
    $controller->deleteHistory();
}

// Default Route (If no match found)
else {
    header("Content-Type: application/json");
    echo json_encode([
        "message" => "Resume Analyzer API is Running", 
        "debug_uri" => $requestUri,
        "debug_method" => $method
    ]);
}
?>