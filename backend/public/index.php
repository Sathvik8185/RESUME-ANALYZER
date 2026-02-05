<?php
    // 1. DISABLE HTML ERROR REPORTING (Crucial for API)
    ini_set('display_errors', 0);
    error_reporting(E_ALL);

    // 2. CORS HEADERS
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json"); 

    // Handle Preflight Requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("HTTP/1.1 200 OK");
        exit;
    }

    // 3. GLOBAL ERROR HANDLER (Converts PHP errors to JSON)
    set_error_handler(function($errno, $errstr, $errfile, $errline) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "PHP Error: $errstr",
            "debug" => "File: $errfile on Line: $errline"
        ]);
        exit;
    });

    // 4. ROUTING
    try {
        require_once __DIR__ . '/../src/Controllers/ApiController.php';

        $route = $_GET['route'] ?? $_SERVER['REQUEST_URI'];
        $method = $_SERVER['REQUEST_METHOD'];
        $controller = new ApiController();

        // Health Check
        if (strpos($route, '/api/health') !== false) {
            echo json_encode(["status" => "success", "message" => "Backend is connected!"]);
        }
        // Upload
        elseif (strpos($route, '/api/upload') !== false && $method === 'POST') {
            $controller->uploadResume();
        } 
        // Analyze
        elseif (strpos($route, '/api/analyze') !== false && $method === 'POST') {
            $controller->analyzeResume();
        } 
        // History
        elseif (strpos($route, '/api/history') !== false && $method === 'GET') {
            $controller->getHistory();
        }
        elseif (strpos($route, '/api/history') !== false && $method === 'DELETE') {
            $controller->deleteHistory();
        }
        else {
            // Only return 404 if it's not the root path check
            if ($route != '/' && $route != '') {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Endpoint not found: $route"]);
            } else {
                echo json_encode(["status" => "success", "message" => "Resume Analyzer API Running"]);
            }
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => $e->getMessage()
        ]);
    }
?>