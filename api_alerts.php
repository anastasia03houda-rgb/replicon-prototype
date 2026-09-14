<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/db.php';

try {
    $query = $pdo->query(
        "SELECT
            a.id,
            a.title,
            a.message,
            a.severity,
            a.status,
            a.created_at,
            s.site_code,
            s.country
         FROM alerts AS a
         LEFT JOIN sites AS s ON s.id = a.site_id
         WHERE a.status = 'active'
         ORDER BY a.created_at DESC, a.id DESC"
    );

    echo json_encode(
        ['alerts' => $query->fetchAll()],
        JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    );
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);

    echo json_encode(
        ['error' => 'Impossible de charger les alertes.'],
        JSON_UNESCAPED_UNICODE
    );
}