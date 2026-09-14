<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/db.php';

try {
    $summary = $pdo->query(
        "SELECT
            COUNT(*) AS total_sites,
            COALESCE(SUM(status = 'running'), 0) AS running_sites,
            COALESCE(SUM(status = 'unknown'), 0) AS unknown_sites,
            COALESCE(SUM(status NOT IN ('running', 'unknown')), 0) AS problem_sites,
            ROUND(AVG(latency_seconds), 2) AS average_latency
         FROM sites"
    )->fetch();

    $recentSites = $pdo->query(
        "SELECT site_code, country, publisher_server, subscriber_server,
                reporting_database, status, latency_seconds, last_sync_at

         FROM sites
         ORDER BY id DESC
         LIMIT 4"
    )->fetchAll();
    $sitesByCountry = $pdo->query(
    "SELECT country, COUNT(*) AS site_count
     FROM sites
     GROUP BY country"
)->fetchAll();

    $alertsStatement = $pdo->query(
        "SELECT a.title, a.message, a.severity, a.created_at,
                s.site_code
         FROM alerts AS a
         LEFT JOIN sites AS s ON s.id = a.site_id
         WHERE a.status = 'active'
         ORDER BY a.created_at DESC
         LIMIT 3"
    );

    $alertCount = $pdo->query(
        "SELECT COUNT(*) FROM alerts WHERE status = 'active'"
    )->fetchColumn();

    echo json_encode(
        [
            'summary' => [
                'total_sites' => (int) $summary['total_sites'],
                'running_sites' => (int) $summary['running_sites'],
                'unknown_sites' => (int) $summary['unknown_sites'],
                'problem_sites' => (int) $summary['problem_sites'],
                'average_latency' => $summary['average_latency'] === null
                    ? null
                    : (float) $summary['average_latency'],
                'active_alerts' => (int) $alertCount,
            ],
            'sites' => $recentSites,
            'alerts' => $alertsStatement->fetchAll(),
            'country_counts' => $sitesByCountry,
        ],
        JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    );
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);

    echo json_encode(
        ['error' => 'Impossible de charger le tableau de bord.'],
        JSON_UNESCAPED_UNICODE
    );
}