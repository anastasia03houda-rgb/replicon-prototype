<?php
declare(strict_types=1);

session_start();

if (empty($_SESSION['site_form_token'])) {
    $_SESSION['site_form_token'] = bin2hex(random_bytes(32));
}

$errors = [];
$values = [
    'site_code' => '',
    'country' => '',
    'publisher_server' => '',
    'subscriber_server' => '',
    'reporting_database' => 'FactoryDW',
];

function escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($values as $field => $_) {
        $values[$field] = trim((string) ($_POST[$field] ?? ''));
    }

    $values['site_code'] = strtoupper($values['site_code']);

    $submittedToken = (string) ($_POST['token'] ?? '');

    if (
        $submittedToken === '' ||
        !hash_equals($_SESSION['site_form_token'], $submittedToken)
    ) {
        $errors[] = 'Le formulaire a expiré. Rechargez la page.';
    }

    if (!preg_match('/^[A-Z0-9_-]{2,20}$/', $values['site_code'])) {
        $errors[] = 'Le code site doit contenir 2 à 20 lettres, chiffres, tirets ou _ .';
    }

    foreach ([
        'country' => 100,
        'publisher_server' => 150,
        'subscriber_server' => 150,
        'reporting_database' => 100,
    ] as $field => $maxLength) {
        $length = mb_strlen($values[$field], 'UTF-8');

        if ($length < 1 || $length > $maxLength) {
            $errors[] = "Le champ $field doit contenir entre 1 et $maxLength caractères.";
        }
    }

    if ($errors === []) {
        require __DIR__ . '/db.php';

        try {
            $statement = $pdo->prepare(
                'INSERT INTO sites
                    (site_code, country, publisher_server,
                     subscriber_server, reporting_database, status)
                 VALUES
                    (:site_code, :country, :publisher_server,
                     :subscriber_server, :reporting_database, :status)'
            );

            $statement->execute([
                'site_code' => $values['site_code'],
                'country' => $values['country'],
                'publisher_server' => $values['publisher_server'],
                'subscriber_server' => $values['subscriber_server'],
                'reporting_database' => $values['reporting_database'],
                'status' => 'unknown',
            ]);

            $_SESSION['site_form_token'] = bin2hex(random_bytes(32));
            header('Location: sites.html?added=1');
            exit;
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                $errors[] = 'Ce code site existe déjà.';
            } else {
                error_log($e->getMessage());
                $errors[] = "Impossible d'enregistrer le site.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ajouter un site | Replicon</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            padding: 40px 18px;
            background: #f3f6fb;
            color: #1a2a40;
            font-family: "DM Sans", sans-serif;
        }
        .page { max-width: 690px; margin: 0 auto; }
        .back {
            display: inline-block;
            margin-bottom: 24px;
            color: #3273c5;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
        }
        .back:hover { text-decoration: underline; }
        .eyebrow {
            margin: 0 0 8px;
            color: #208f7e;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        h1 {
            margin: 0 0 8px;
            font-family: "Playfair Display", serif;
            font-size: clamp(30px, 5vw, 42px);
        }
        .intro {
            margin: 0 0 26px;
            color: #718096;
            line-height: 1.7;
        }
        .card {
            padding: clamp(24px, 5vw, 42px);
            border: 1px solid #e3eaf2;
            border-radius: 22px;
            background: white;
            box-shadow: 0 22px 55px rgba(32, 56, 88, .07);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
        }
        .field.wide { grid-column: 1 / -1; }
        label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 700;
        }
        input {
            width: 100%;
            height: 46px;
            padding: 0 14px;
            border: 1px solid #dce5ef;
            border-radius: 10px;
            outline: none;
            background: #fbfcff;
            color: #1a2a40;
            font: inherit;
            font-size: 14px;
        }
        input:focus {
            border-color: #468eeb;
            box-shadow: 0 0 0 3px rgba(70, 142, 235, .12);
        }
        .hint {
            margin: 7px 0 0;
            color: #8090a4;
            font-size: 12px;
        }
        .actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-top: 30px;
        }
        .note { color: #8090a4; font-size: 12px; }
        button {
            min-height: 46px;
            padding: 0 22px;
            border: 0;
            border-radius: 10px;
            background: #2878dc;
            color: white;
            cursor: pointer;
            font: inherit;
            font-weight: 700;
        }
        button:hover { background: #1968c9; }
        .error {
            margin-bottom: 22px;
            padding: 14px 18px;
            border-radius: 10px;
            background: #fff1f1;
            color: #a33445;
            font-size: 13px;
            line-height: 1.7;
        }
        @media (max-width: 540px) {
            .grid { grid-template-columns: 1fr; }
            .field.wide { grid-column: auto; }
            .actions { align-items: stretch; flex-direction: column; }
        }
    </style>
</head>
<body>
    <main class="page">
        <a class="back" href="sites.html">← Retour aux sites</a>
        <p class="eyebrow">Replicon · Configuration</p>
        <h1>Ajouter un site</h1>
        <p class="intro">
            Renseignez les informations du site. Son état restera inconnu
            tant qu'aucune surveillance réelle n'aura été configurée.
        </p>

        <section class="card">
            <?php if ($errors !== []): ?>
                <div class="error" role="alert">
                    <?php foreach ($errors as $error): ?>
                        <div><?= escape($error) ?></div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <form method="post" action="add_site.php">
                <input
                    type="hidden"
                    name="token"
                    value="<?= escape($_SESSION['site_form_token']) ?>"
                >

                <div class="grid">
                    <div class="field">
                        <label for="site_code">Code du site</label>
                        <input
                            id="site_code"
                            name="site_code"
                            maxlength="20"
                            placeholder="Ex. FR01"
                            value="<?= escape($values['site_code']) ?>"
                            required
                        >
                    </div>

                    <div class="field">
                        <label for="country">Pays</label>
                        <input
                            id="country"
                            name="country"
                            maxlength="100"
                            placeholder="Ex. France"
                            value="<?= escape($values['country']) ?>"
                            required
                        >
                    </div>

                    <div class="field wide">
                        <label for="publisher_server">Publisher / Distributor</label>
                        <input
                            id="publisher_server"
                            name="publisher_server"
                            maxlength="150"
                            placeholder="Nom exact du serveur de production"
                            value="<?= escape($values['publisher_server']) ?>"
                            required
                        >
                    </div>

                    <div class="field wide">
                        <label for="subscriber_server">Subscriber</label>
                        <input
                            id="subscriber_server"
                            name="subscriber_server"
                            maxlength="150"
                            placeholder="Nom exact du serveur de reporting"
                            value="<?= escape($values['subscriber_server']) ?>"
                            required
                        >
                    </div>

                    <div class="field wide">
                        <label for="reporting_database">Base de reporting</label>
                        <input
                            id="reporting_database"
                            name="reporting_database"
                            maxlength="100"
                            value="<?= escape($values['reporting_database']) ?>"
                            required
                        >
                        <p class="hint">Vérifiez les noms dans votre rapport avant l'enregistrement.</p>
                    </div>
                </div>

                <div class="actions">
                    <span class="note">État initial : unknown</span>
                    <button type="submit">Enregistrer le site</button>
                </div>
            </form>
        </section>
    </main>
</body>
</html>