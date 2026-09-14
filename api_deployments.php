<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/db.php';

try {
    $statement = $pdo->query(
        'SELECT
            d.id,
            d.status,
            d.current_step,
            d.started_at,
            d.completed_at,
            s.site_code,
            s.country,
            s.publisher_server,
            s.subscriber_server,
            s.reporting_database
         FROM deployments AS d
         INNER JOIN sites AS s ON s.id = d.site_id
         ORDER BY d.started_at DESC, d.id DESC'
    );

    echo json_encode(
        ['deployments' => $statement->fetchAll(PDO::FETCH_ASSOC)],
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);

    echo json_encode([
        'error' => 'Impossible de charger les déploiements.'
    ]);
}