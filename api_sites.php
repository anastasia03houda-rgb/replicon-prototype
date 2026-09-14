<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/db.php';

try {
    $query = $pdo->query(
        'SELECT id, site_code, country, publisher_server,
                subscriber_server, reporting_database, status,
                latency_seconds, pending_commands, last_sync_at
         FROM sites
         ORDER BY country'
    );

    echo json_encode(
        ['sites' => $query->fetchAll()],
        JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    );
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);

    echo json_encode(
        ['error' => 'تعذّر تحميل بيانات المواقع.'],
        JSON_UNESCAPED_UNICODE
    );
}