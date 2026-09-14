<?php
declare(strict_types=1);

$host = '127.0.0.1';
$database = 'replicon_db';
$username = 'root';
$password = ''; // الإعداد الافتراضي ديال XAMPP محلياً

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$database;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    exit('تعذّر الاتصال بقاعدة البيانات.');
}