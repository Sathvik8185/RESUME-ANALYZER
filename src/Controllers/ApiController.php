<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Services/PdfParserService.php';
require_once __DIR__ . '/../Services/AnalyzerService.php';

class ApiController {
    private $db;
    private $parser;
    private $analyzer;

    public function __construct() {
        // Initialize Database and Services
        $database = new Database();
        $this->db = $database->getConnection();
        $this->parser = new PdfParserService();
        $this->analyzer = new AnalyzerService();
    }

    public function analyzeResume() {
        // Set Headers for JSON and CORS
        header("Content-Type: application/json");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        // Validates Inputs
        if (!isset($_FILES['resume']) || !isset($_POST['jd_text'])) {
            http_response_code(400); // Bad Request
            echo json_encode(["status" => "error", "message" => "Missing Resume file or Job Description text."]);
            return;
        }

        $jdText = $_POST['jd_text'];
        $file = $_FILES['resume'];

        // Validates File Type (PDF Only)
        $fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if ($fileType != "pdf") {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid file type. Only PDF is allowed."]);
            return;
        }

        // Validates File Size (Max 5MB)
        if ($file['size'] > 5000000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "File is too large. Max limit is 5MB."]);
            return;
        }

        // Upload File
        $targetDir = __DIR__ . "/../../public/uploads/";
        if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
        
        $fileName = uniqid() . "_" . basename($file['name']);
        $targetFilePath = $targetDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
            
            // Extract Text
            $resumeText = $this->parser->extractText($targetFilePath);
            
            if (!$resumeText) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to extract text from PDF."]);
                return;
            }

            // Analyze
            $result = $this->analyzer->analyze($resumeText, $jdText);

            // Save to Database
            try {
                $query = "INSERT INTO analysis_logs (jd_text, resume_filename, match_score, matched_keywords, missing_keywords) VALUES (:jd, :file, :score, :matched, :missing)";
                $stmt = $this->db->prepare($query);
                $stmt->execute([
                    ':jd' => substr($jdText, 0, 1000), // Truncate JD if too long
                    ':file' => $fileName,
                    ':score' => $result['score'],
                    ':matched' => json_encode($result['matched']),
                    ':missing' => json_encode($result['missing'])
                ]);

                // Success Response
                http_response_code(200);
                echo json_encode([
                    "status" => "success",
                    "data" => $result
                ]);

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
            }

        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to upload file to server."]);
        }
    }
}
?>