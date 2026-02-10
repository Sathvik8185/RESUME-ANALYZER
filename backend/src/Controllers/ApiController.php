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

        // Validate Inputs - CHANGED TO ACCEPT TWO FILES
        if (!isset($_FILES['resume']) || !isset($_FILES['jd_file'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing Resume or Job Description file."]);
            return;
        }

        $resumeFile = $_FILES['resume'];
        $jdFile = $_FILES['jd_file'];

        // Validate Resume File Type (PDF Only)
        $resumeFileType = strtolower(pathinfo($resumeFile['name'], PATHINFO_EXTENSION));
        if ($resumeFileType != "pdf") {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Resume: Invalid file type. Only PDF is allowed."]);
            return;
        }

        // Validate JD File Type (PDF Only)
        $jdFileType = strtolower(pathinfo($jdFile['name'], PATHINFO_EXTENSION));
        if ($jdFileType != "pdf") {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Job Description: Invalid file type. Only PDF is allowed."]);
            return;
        }

        // Validate File Sizes (Max 5MB each)
        if ($resumeFile['size'] > 5000000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Resume file is too large. Max limit is 5MB."]);
            return;
        }

        if ($jdFile['size'] > 5000000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Job Description file is too large. Max limit is 5MB."]);
            return;
        }

        // Upload Directory
        $targetDir = __DIR__ . "/../../public/uploads/";
        if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
        
        // Generate unique filenames
        $resumeFileName = uniqid() . "_resume_" . basename($resumeFile['name']);
        $jdFileName = uniqid() . "_jd_" . basename($jdFile['name']);
        
        $resumeFilePath = $targetDir . $resumeFileName;
        $jdFilePath = $targetDir . $jdFileName;

        // Upload both files
        if (!move_uploaded_file($resumeFile['tmp_name'], $resumeFilePath)) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to upload resume file."]);
            return;
        }

        if (!move_uploaded_file($jdFile['tmp_name'], $jdFilePath)) {
            // Clean up uploaded resume file if JD fails
            unlink($resumeFilePath);
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to upload job description file."]);
            return;
        }

        try {
            // Extract text from Resume PDF
            $resumeText = $this->parser->extractText($resumeFilePath);
            if (!$resumeText) {
                throw new Exception("Failed to extract text from Resume PDF.");
            }

            // Extract text from JD PDF
            $jdText = $this->parser->extractText($jdFilePath);
            if (!$jdText) {
                throw new Exception("Failed to extract text from Job Description PDF.");
            }

            // Analyze
            $result = $this->analyzer->analyze($resumeText, $jdText);

            // Save to Database
            $query = "INSERT INTO analysis_logs (jd_text, resume_filename, match_score, matched_keywords, missing_keywords) 
                      VALUES (:jd, :file, :score, :matched, :missing)";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':jd' => substr($jdText, 0, 1000),
                ':file' => $resumeFileName,
                ':score' => $result['score'],
                ':matched' => json_encode($result['matched']),
                ':missing' => json_encode($result['missing'])
            ]);

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "data" => $result,
                "message" => "Analysis completed successfully"
            ]);

        } catch (Exception $e) {
            // Clean up uploaded files on error
            if (file_exists($resumeFilePath)) unlink($resumeFilePath);
            if (file_exists($jdFilePath)) unlink($jdFilePath);
            
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // --- 2. GET: Fetch History ---
    public function getHistory() {
        header("Content-Type: application/json");
        header("Access-Control-Allow-Origin: *");

        try {
            $query = "SELECT id, jd_text, resume_filename, match_score, created_at 
                      FROM analysis_logs 
                      ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success", 
                "data" => $data,
                "count" => count($data)
            ]);
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
                echo json_encode([
                    "status" => "success", 
                    "message" => "Record deleted successfully"
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    "status" => "error", 
                    "message" => "Record not found"
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}
?>