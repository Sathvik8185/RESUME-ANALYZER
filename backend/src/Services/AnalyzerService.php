<?php
class AnalyzerService {
    
    private $stopWords = [
        "and", "the", "is", "in", "at", "of", "a", "to", "for", "with", "on", "as", "by", 
        "an", "be", "we", "are", "it", "or", "that", "this", "from", "but", "not", "have", 
        "has", "had", "will", "would", "can", "could", "should", "required", "requirements",
        "description", "responsibilities", "job", "work", "experience", "year", "years", 
        "looking", "seeking", "must", "knowledge", "skills", "proficient"
    ];

    public function analyze($resumeText, $jdText) {
        $resumeTokens = $this->tokenize($resumeText);
        $jdTokens = $this->tokenize($jdText);

        // Extract unique keywords from JD
        $keywords = array_diff($jdTokens, $this->stopWords);
        $keywords = array_unique($keywords); 
        $totalKeywords = count($keywords);

        if ($totalKeywords === 0) {
            return [
                'score' => 0, 
                'matched' => [], 
                'missing' => [], 
                'suitability' => 'Invalid JD'
            ];
        }

        $matched = [];
        $missing = [];

        foreach ($keywords as $word) {
            if (in_array($word, $resumeTokens)) {
                $matched[] = $word;
            } else {
                $missing[] = $word;
            }
        }

        $matchCount = count($matched);
        $score = round(($matchCount / $totalKeywords) * 100, 2);

        return [
            'score' => $score,
            'matched' => array_values($matched),
            'missing' => array_values($missing),
            'suitability' => $this->getSuitability($score)
        ];
    }

    private function tokenize($text) {
        $text = strtolower($text);
        // Remove special characters but keep alphanumeric
        $text = preg_replace('/[^a-z0-9\s]/', '', $text); 
        return preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
    }

    private function getSuitability($score) {
        if ($score >= 80) return "Excellent Match";
        if ($score >= 60) return "Good Match";
        if ($score >= 40) return "Average Match";
        return "Low Match";
    }
}
?>