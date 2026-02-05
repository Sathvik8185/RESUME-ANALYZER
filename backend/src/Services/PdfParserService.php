<?php
// 1. Get the absolute path to the 'backend' folder
$backendRoot = dirname(__DIR__, 2);

// 2. Build the full path to autoload.php
$autoloadPath = $backendRoot . '/vendor/autoload.php';

// 3. Robust Check & Load
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
} else {
    // Return JSON error immediately if vendor is missing
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Server Configuration Error: vendor/autoload.php not found.",
        "path_looked_at" => $autoloadPath
    ]);
    exit;
}

use Smalot\PdfParser\Parser;

class PdfParserService {
    public function extractText($filePath) {
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($filePath);
            return $pdf->getText();
        } catch (Exception $e) {
            error_log("PDF Parser Error: " . $e->getMessage());
            return false;
        }
    }
}
?>