document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".reports-header");
  const grid = document.querySelector(".report-grid");
  const history = document.querySelector(".report-history");
  const schedule = document.querySelector(".schedule-panel");
  const exportPanel = document.querySelector(".export-panel");

  function paragraph(text) {
    const p = document.createElement("p");
    p.textContent = text;
    p.style.marginTop = "12px";
    p.style.lineHeight = "1.7";
    return p;
  }

  function heading(text) {
    const h2 = document.createElement("h2");
    h2.textContent = text;
    return h2;
  }

  if (header) {
    const description = header.querySelector("h1 + p");
    if (description) {
      description.textContent =
        "Exportez les données enregistrées dans la base locale.";
    }

    // Le bouton « Créer un rapport » ne créait aucun fichier.
    header.querySelector(".primary-button")?.remove();
  }

  // Remplacer les trois faux rapports PDF/XLSX par un export réel.
  if (grid) {
    grid.replaceChildren();

    const card = document.createElement("article");
    card.className = "report-card";

    const title = heading("Liste des sites configurés");
    const description = paragraph(
      "Export CSV des sites enregistrés : code, pays, serveurs, base de reporting et état enregistré. Aucune mesure SQL Server en direct."
    );

    const footer = document.createElement("div");
    footer.className = "report-card-footer";

    const format = document.createElement("small");
    format.textContent = "Format CSV · données locales";

    const download = document.createElement("a");
    download.className = "generate-button";
    download.href = "export_sites.php";
    download.textContent = "Télécharger le CSV";
    download.style.display = "inline-flex";
    download.style.alignItems = "center";
    download.style.textDecoration = "none";

    footer.append(format, download);
    card.append(title, description, footer);
    grid.appendChild(card);
  }

  if (history) {
    history.replaceChildren();
    history.append(
      heading("Historique des rapports"),
      paragraph(
        "Aucun fichier PDF ou XLSX généré n'est enregistré pour le moment. Le CSV des sites se télécharge avec le bouton ci-dessus."
      )
    );
  }

  if (schedule) {
    schedule.replaceChildren();
    schedule.append(
      heading("Rapports planifiés"),
      paragraph("Aucune génération automatique n'est configurée.")
    );
  }

  if (exportPanel) {
    exportPanel.replaceChildren();
    exportPanel.append(
      heading("Données pour la soutenance"),
      paragraph(
        "Le fichier CSV présente les sites saisis dans l'application. Le site TEST01 est une donnée de test, et son état n'est pas vérifié en direct."
      )
    );
  }

  // Le « 3 » du menu est encore une valeur d'exemple.
  const alertBadge = document.querySelector(
    'a[href="alerts.html"] .nav-count'
  );
  if (alertBadge) {
    alertBadge.style.display = "none";
  }
});