<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

require_once __DIR__ . '/../src/Controllers/ApiController.php';

$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Basic Router
if (strpos($requestUri, '/api/analyze') !== false && $method === 'POST') {
    $controller = new ApiController();
    $controller->analyzeResume();
} else {
    echo json_encode(["message" => "Resume Analyzer API is Running"]);
}
?>