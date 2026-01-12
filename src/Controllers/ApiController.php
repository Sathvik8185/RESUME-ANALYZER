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

    public function analyzeResume() {
        header("Content-Type: application/json");

        if (!isset($_FILES['resume']) || !isset($_POST['jd_text'])) {
            echo json_encode(["status" => "error", "message" => "Resume file and JD text are required."]);
            return;
        }

        $jdText = $_POST['jd_text'];
        $file = $_FILES['resume'];

        // Validate PDF
        $fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if ($fileType != "pdf") {
            echo json_encode(["status" => "error", "message" => "Only PDF files are allowed."]);
            return;
        }

        // Upload
        $targetDir = __DIR__ . "/../../public/uploads/";
        if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
        
        $fileName = uniqid() . "_" . basename($file['name']);
        $targetFilePath = $targetDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
            // Extract & Analyze
            $resumeText = $this->parser->extractText($targetFilePath);
            
            if (!$resumeText) {
                echo json_encode(["status" => "error", "message" => "Could not read PDF text."]);
                return;
            }

            $result = $this->analyzer->analyze($resumeText, $jdText);

            // Save to DB
            $stmt = $this->db->prepare("INSERT INTO analysis_logs (jd_text, resume_filename, match_score, matched_keywords, missing_keywords) VALUES (:jd, :file, :score, :matched, :missing)");
            $stmt->execute([
                ':jd' => substr($jdText, 0, 1000),
                ':file' => $fileName,
                ':score' => $result['score'],
                ':matched' => json_encode($result['matched']),
                ':missing' => json_encode($result['missing'])
            ]);

            echo json_encode(["status" => "success", "data" => $result]);
        } else {
            echo json_encode(["status" => "error", "message" => "File upload failed."]);
        }
    }
}
?>