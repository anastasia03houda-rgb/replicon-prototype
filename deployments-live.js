document.addEventListener("DOMContentLoaded", async () => {
  const header = document.querySelector(".deploy-header");
  const layout = document.querySelector(".deploy-layout");
  const prerequisites = document.querySelector(".prerequisites-panel");
  const recent = document.querySelector(".recent-deployments");

  function showMessage(element, title, message) {
    if (!element) return;

    element.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = title;

    const text = document.createElement("p");
    text.textContent = message;
    text.style.marginTop = "12px";
    text.style.lineHeight = "1.7";

    element.append(heading, text);
  }

  // نمسحو المعلومات المكتوبة للتجربة قبل تحميل البيانات.
  if (header) {
    header.querySelector(".eyebrow").textContent = "DONNÉES LOCALES";
    header.querySelector("h1 + p").textContent =
      "Suivi des déploiements enregistrés dans la base locale.";

    const createButton = header.querySelector(".primary-button");

if (createButton) {
  const createLink = document.createElement("a");
  createLink.className = "primary-button";
  createLink.href = "add_deployment.php";
  createLink.textContent = "Nouveau déploiement";
  createLink.style.display = "inline-flex";
  createLink.style.alignItems = "center";
  createLink.style.textDecoration = "none";

  createButton.replaceWith(createLink);
}
  }

  layout?.replaceChildren();
  prerequisites?.replaceChildren();
  recent?.replaceChildren();

  try {
    const response = await fetch("api_deployments.php", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Erreur HTTP " + response.status);
    }

    const data = await response.json();
    const deployments = Array.isArray(data.deployments)
      ? data.deployments
      : [];

    if (deployments.length === 0) {
      showMessage(
        layout,
        "Aucun déploiement enregistré",
        "Le site TEST01 est configuré, mais aucun déploiement n'a encore été créé."
      );

      showMessage(
        prerequisites,
        "Pré-check non effectué",
        "Aucun résultat de contrôle technique n'est enregistré. Les services SQL Server ne sont pas vérifiés par cette application."
      );

      showMessage(
        recent,
        "Historique des déploiements",
        "Aucun déploiement dans l'historique."
      );
    } else {
      showMessage(
        layout,
        `${deployments.length} déploiement(s) enregistré(s)`,
        "Les déploiements ci-dessous proviennent de la base locale. Leur état n'est pas vérifié directement auprès de SQL Server."
      );

      showMessage(
        prerequisites,
        "Pré-check non vérifié",
        "Aucun résultat de contrôle technique en direct n'est disponible."
      );

      recent.replaceChildren();

      const title = document.createElement("h2");
      title.textContent = "Déploiements enregistrés";
      recent.appendChild(title);

      deployments.forEach((deployment) => {
        const item = document.createElement("p");
        item.style.marginTop = "16px";

        item.textContent =
          `${deployment.site_code} — ${deployment.country} · ` +
          `État enregistré : ${deployment.status} · ` +
          `Début : ${deployment.started_at}`;

        recent.appendChild(item);
      });
    }
  } catch (error) {
    console.error("Déploiements :", error);

    showMessage(
      layout,
      "Données indisponibles",
      "Impossible de charger les déploiements depuis la base locale."
    );
  }
});