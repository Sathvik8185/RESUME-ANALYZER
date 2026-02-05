<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Services/PdfParserService.php';
require_once __DIR__ . '/../Services/AnalyzerService.php';

class ApiController {
    private $db;
    private $parser;
    private $analyzer;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->parser = new PdfParserService();
        $this->analyzer = new AnalyzerService();
    }

    // --- 1. POST: Upload Resume ---
    public function uploadResume() {
        header("Content-Type: application/json");

        if (!isset($_FILES['resume'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "No resume file uploaded."]);
            return;
        }

        $file = $_FILES['resume'];
        $fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if ($fileType != "pdf") {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid file type. Only PDF is allowed."]);
            return;
        }

        $targetDir = __DIR__ . "/../../public/uploads/";
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        
        $uniqueId = uniqid();
        $fileName = $uniqueId . "_" . basename($file['name']);
        $targetFilePath = $targetDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
            echo json_encode([
                "status" => "success",
                "message" => "File uploaded successfully",
                "resumeId" => $fileName 
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to move uploaded file."]);
        }
    }

    // --- 2. POST: Analyze Resume ---
    public function analyzeResume() {
        header("Content-Type: application/json");

        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        if (!isset($input['resumeId']) || !isset($input['jobDescription'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing resumeId or jobDescription."]);
            return;
        }

        $fileName = $input['resumeId'];
        $jdText = $input['jobDescription'];
        
        // Capture User Details
        $candidateName = $input['name'] ?? "Candidate";
        $candidateEmail = $input['email'] ?? "N/A";

        $filePath = __DIR__ . "/../../public/uploads/" . $fileName;

        if (!file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Resume file not found."]);
            return;
        }

        // Extract Text
        $resumeText = $this->parser->extractText($filePath);
        
        if (!$resumeText) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to read PDF content."]);
            return;
        }

        // Analyze
        $result = $this->analyzer->analyze($resumeText, $jdText);

        // Inject User Data & Experience
        $result['name'] = $candidateName;
        $result['email'] = $candidateEmail;
        $result['experience'] = $this->extractExperience($resumeText);

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
        } catch (Exception $e) {
            // Ignore DB errors
        }

        echo json_encode([
            "status" => "success",
            "data" => $result
        ]);
    }

    // --- Helper: Extract Experience ---
    private function extractExperience($text) {
        $text = strtolower($text);
        
        // Pattern 1: "5+ years", "5 years", "5.5 yrs"
        if (preg_match('/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i', $text, $matches)) {
            return $matches[1] . " Years";
        }

        // Pattern 2: "Experience: 5"
        if (preg_match('/experience\s*[:\-]?\s*(\d+(?:\.\d+)?)/i', $text, $matches)) {
            return $matches[1] . " Years";
        }

        return "Not specified";
    }

    public function getHistory() {
        header("Content-Type: application/json");
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

    public function deleteHistory() {
        header("Content-Type: application/json");
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
            echo json_encode(["status" => "success", "message" => "Deleted"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}
?>