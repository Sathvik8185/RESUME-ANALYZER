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

    // --- 1. POST: Upload & Analyze Resume ---
    public function analyzeResume() {
        header("Content-Type: application/json");
        header("Access-Control-Allow-Origin: *");

        // Validate Inputs
        if (!isset($_FILES['resume']) || !isset($_POST['jd_text'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing Resume file or Job Description text."]);
            return;
        }

        $jdText = $_POST['jd_text'];
        $file = $_FILES['resume'];

        // Validate File Type (PDF Only)
        $fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if ($fileType != "pdf") {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid file type. Only PDF is allowed."]);
            return;
        }

        // Validate File Size (Max 5MB)
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
                    ':jd' => substr($jdText, 0, 1000),
                    ':file' => $fileName,
                    ':score' => $result['score'],
                    ':matched' => json_encode($result['matched']),
                    ':missing' => json_encode($result['missing'])
                ]);

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

    // --- 2. GET: Fetch History ---
    public function getHistory() {
        header("Content-Type: application/json");
        header("Access-Control-Allow-Origin: *");

        try {
            $query = "SELECT id, jd_text, resume_filename, match_score, created_at FROM analysis_logs ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // --- 3. DELETE: Remove Record ---
    public function deleteHistory() {
        header("Content-Type: application/json");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: DELETE");

        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID is required"]);
            return;
        }

        $id = $_GET['id'];

        try {
            $query = "DELETE FROM analysis_logs WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["status" => "success", "message" => "Record deleted successfully"]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Record not found"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}
?>