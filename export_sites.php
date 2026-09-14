<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

try {
    $rows = $pdo->query(
        'SELECT
            site_code,
            country,
            publisher_server,
            subscriber_server,
            reporting_database,
            status,
            last_sync_at
         FROM sites
         ORDER BY site_code'
    )->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    exit('Impossible de générer le fichier CSV.');
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="replicon_sites_locaux.csv"');
header('Cache-Control: no-store');

$output = fopen('php://output', 'wb');

if ($output === false) {
    exit;
}

// باش الحروف الفرنسية تبان مزيان فـExcel.
fwrite($output, "\xEF\xBB\xBF");

fputcsv($output, [
    'Code site',
    'Pays',
    'Publisher / Distributor',
    'Subscriber',
    'Base reporting',
    'État enregistré',
    'Dernière synchronisation enregistrée'
], ';');

foreach ($rows as $row) {
    $values = array_map(
        static function ($value): string {
            $text = (string) ($value ?? '');

            // يمنع Excel من تفسير محتوى جاي من قاعدة البيانات كصيغة.
            if (preg_match('/^[\s]*[=+\-@]/u', $text)) {
                $text = "'" . $text;
            }

            return $text;
        },
        array_values($row)
    );

    fputcsv($output, $values, ';');
}

fclose($output);