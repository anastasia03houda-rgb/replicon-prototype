<?php
declare(strict_types=1);

session_start();
require_once __DIR__ . '/db.php';

if (empty($_SESSION['deployment_csrf'])) {
    $_SESSION['deployment_csrf'] = bin2hex(random_bytes(32));
}

$error = '';
$selectedSite = '';

try {
    $sites = $pdo->query(
        'SELECT id, site_code, country
         FROM sites
         ORDER BY site_code'
    )->fetchAll(PDO::FETCH_ASSOC);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = (string) ($_POST['csrf_token'] ?? '');
        $selectedSite = (string) ($_POST['site_id'] ?? '');

        if (!hash_equals($_SESSION['deployment_csrf'], $token)) {
            $error = 'Session expirée. Rechargez la page et réessayez.';
        } elseif (!ctype_digit($selectedSite)) {
            $error = 'Choisissez un site.';
        } else {
            $siteId = (int) $selectedSite;

            $check = $pdo->prepare('SELECT id FROM sites WHERE id = ?');
            $check->execute([$siteId]);

            if (!$check->fetchColumn()) {
                $error = 'Le site sélectionné est introuvable.';
            } else {
                $insert = $pdo->prepare(
                    "INSERT INTO deployments (site_id, status, current_step)
                     VALUES (?, 'preparation', 'Préparation non vérifiée')"
                );
                $insert->execute([$siteId]);

                $_SESSION['deployment_csrf'] = bin2hex(random_bytes(32));

                header('Location: deployments.html');
                exit;
            }
        }
    }
} catch (Throwable $e) {
    error_log($e->getMessage());
    $error = 'Impossible de charger ou enregistrer les données.';
    $sites = $sites ?? [];
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nouveau déploiement | Replicon</title>
    <style>
        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #f2f6fb;
            color: #172b48;
            font-family: Arial, sans-serif;
        }

        main {
            width: min(100%, 560px);
            padding: 36px;
            border: 1px solid #e3eaf2;
            border-radius: 20px;
            background: white;
            box-shadow: 0 14px 35px rgba(23, 43, 72, .07);
        }

        a { color: #276ec6; text-decoration: none; }
        a:hover { text-decoration: underline; }

        .eyebrow {
            margin: 30px 0 8px;
            color: #25866e;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: .1em;
        }

        h1 { margin: 0 0 12px; font-size: 34px; }
        p { line-height: 1.6; color: #617087; }

        label {
            display: block;
            margin: 28px 0 8px;
            font-weight: bold;
        }

        select {
            width: 100%;
            padding: 14px;
            border: 1px solid #cbd7e5;
            border-radius: 10px;
            background: white;
            font-size: 16px;
        }

        button {
            width: 100%;
            margin-top: 24px;
            padding: 15px;
            border: 0;
            border-radius: 10px;
            background: #2676e2;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }

        button:disabled { background: #9eabba; cursor: not-allowed; }

        .error {
            padding: 12px;
            border-radius: 10px;
            background: #fff0f0;
            color: #ad3030;
        }

        .note { font-size: 13px; }
    </style>
</head>
<body>
<main>
    <a href="deployments.html">← Retour aux déploiements</a>

    <div class="eyebrow">REPLICON · DONNÉES LOCALES</div>
    <h1>Nouveau déploiement</h1>

    <p>Choisissez un site déjà configuré pour enregistrer une préparation de déploiement.</p>

    <p class="note">
        Cette action enregistre une fiche dans la base locale.
        Elle ne configure pas la réplication SQL Server.
    </p>

    <?php if ($error !== ''): ?>
        <p class="error"><?= h($error) ?></p>
    <?php endif; ?>

    <?php if ($sites === []): ?>
        <p>Aucun site disponible. <a href="add_site.php">Ajouter un site</a> d'abord.</p>
    <?php else: ?>
        <form method="post">
            <input
                type="hidden"
                name="csrf_token"
                value="<?= h($_SESSION['deployment_csrf']) ?>"
            >

            <label for="site_id">Site</label>
            <select id="site_id" name="site_id" required>
                <option value="">Choisir un site…</option>

                <?php foreach ($sites as $site): ?>
                    <option
                        value="<?= (int) $site['id'] ?>"
                        <?= $selectedSite === (string) $site['id'] ? 'selected' : '' ?>
                    >
                        <?= h($site['site_code'] . ' — ' . $site['country']) ?>
                    </option>
                <?php endforeach; ?>
            </select>

            <button type="submit">Enregistrer la préparation</button>
        </form>
    <?php endif; ?>
</main>
</body>
</html>