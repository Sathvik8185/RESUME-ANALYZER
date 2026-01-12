<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Smalot\PdfParser\Parser;

class PdfParserService {
    public function extractText($filePath) {
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($filePath);
            return $pdf->getText();
        } catch (Exception $e) {
            return false;
        }
    }
}
?>