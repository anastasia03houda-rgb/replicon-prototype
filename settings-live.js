document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".settings-header");
  const layout = document.querySelector(".settings-layout");
  const menu = document.querySelector(".settings-menu");
  const content = document.querySelector(".setting-content");
  const dangerZone = document.querySelector(".danger-zone");

  if (header) {
    header.querySelector(".eyebrow").textContent =
      "CONFIGURATION LOCALE";

    header.querySelector("h1 + p").textContent =
      "État de la configuration de cette version locale de Replicon.";
  }

  // Les onglets de profil et les boutons de sauvegarde n'étaient pas connectés.
  menu?.remove();
  dangerZone?.remove();

  if (layout) {
    layout.style.display = "block";
  }

  if (content) {
    content.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = "État de l'application";

    const details = [
      "Application : version locale exécutée avec XAMPP.",
      "Base de données : replicon_db, utilisée pour enregistrer les sites, déploiements et alertes.",
      "Surveillance SQL Server en direct : non connectée.",
      "Compte utilisateur : aucune authentification n'est configurée dans cette version.",
      "Notifications par e-mail et rapports planifiés : non configurés."
    ];

    content.appendChild(title);

    details.forEach((detail) => {
      const line = document.createElement("p");
      line.textContent = detail;
      line.style.marginTop = "16px";
      line.style.lineHeight = "1.7";
      content.appendChild(line);
    });

    const link = document.createElement("a");
    link.href = "sites.html";
    link.textContent = "Voir les sites configurés →";
    link.style.display = "inline-block";
    link.style.marginTop = "24px";

    content.appendChild(link);
  }

  const alertBadge = document.querySelector(
    'a[href="alerts.html"] .nav-count'
  );

  if (alertBadge) {
    alertBadge.style.display = "none";
  }
});