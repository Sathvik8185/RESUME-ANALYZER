<?php
$host = "localhost";
$user = "root";
$pass = ""; 

echo "Attempting to set up database...\n";

try {
    // 1. Connect to MySQL Server (without selecting a DB yet)
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Create Database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS resume_analyzer_db");
    echo "Database 'resume_analyzer_db' created (or already exists).\n";

    // 3. Select the Database
    $pdo->exec("USE resume_analyzer_db");

    // 4. Create the Table
    $sql = "CREATE TABLE IF NOT EXISTS analysis_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jd_title VARCHAR(255),
        jd_text TEXT,
        resume_filename VARCHAR(255),
        match_score DECIMAL(5,2),
        matched_keywords TEXT,
        missing_keywords TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "Table 'analysis_logs' created successfully.\n";
    echo "You are ready to go!";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Tip: Make sure XAMPP MySQL is running (Green light).";
}
?>