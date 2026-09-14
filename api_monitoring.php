<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/db.php';

try {
    $sites = $pdo->query(
        'SELECT site_code, country, status, last_sync_at,
                latency_seconds, pending_commands
         FROM sites
         ORDER BY site_code'
    )->fetchAll(PDO::FETCH_ASSOC);

    $agents = $pdo->query(
        'SELECT s.site_code, a.agent_type, a.status,
                a.last_run_at, a.last_message
         FROM agents AS a
         INNER JOIN sites AS s ON s.id = a.site_id
         ORDER BY s.site_code, a.agent_type'
    )->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(
        [
            'source' => 'base_locale',
            'surveillance_sql_server_connectee' => false,
            'sites' => $sites,
            'agents' => $agents,
        ],
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);

    echo json_encode([
        'error' => 'Impossible de charger les données de monitoring.',
    ]);
    
}