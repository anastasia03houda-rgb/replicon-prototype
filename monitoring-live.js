document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".monitoring-header");
  const agentGrid = document.querySelector(".agent-grid");
  const latencyPanel = document.querySelector(".latency-panel");
  const queuePanel = document.querySelector(".queue-panel");
  const statusPanel = document.querySelector(".status-panel");

  if (header) {
    header.querySelector(".eyebrow").textContent =
      "DONNÉES LOCALES · SURVEILLANCE SQL SERVER NON CONNECTÉE";
    header.querySelector("h1").textContent = "Supervision";
    header.querySelector("h1 + p").textContent =
      "Les informations affichées proviennent de la base locale. Aucune mesure en direct n'est encore collectée.";
  }

  // حذف المعلومات التجريبية القديمة
  [agentGrid, latencyPanel, queuePanel, statusPanel].forEach(panel => {
    if (panel) panel.replaceChildren();
  });

  function showPanel(panel, title, message) {
    if (!panel) return;

    const heading = document.createElement("h2");
    heading.textContent = title;

    const description = document.createElement("p");
    description.textContent = message;
    description.style.marginTop = "12px";
    description.style.lineHeight = "1.6";

    panel.replaceChildren(heading, description);
  }

  function showData(data) {
    const sites = Array.isArray(data.sites) ? data.sites : [];
    const agents = Array.isArray(data.agents) ? data.agents : [];

    if (agentGrid) {
      const card = document.createElement("article");
      card.className = "agent-card snapshot";

      const title = document.createElement("h2");
      title.textContent = "Agents de réplication";

      const message = document.createElement("p");
      message.textContent = agents.length === 0
        ? "Aucun agent enregistré. La connexion aux agents SQL Server n'est pas configurée."
        : `${agents.length} agent(s) enregistré(s) localement. Leur état n'est pas vérifié en direct.`;

      const count = document.createElement("div");
      count.className = "agent-bottom";
      count.textContent =
        `${sites.length} site(s) configuré(s) · ${agents.length} agent(s) enregistré(s)`;

      card.append(title, message, count);
      agentGrid.replaceChildren(card);
    }

    showPanel(
      latencyPanel,
      "Latence par site",
      "Aucune mesure de latence en direct n'est disponible pour le moment."
    );

    showPanel(
      queuePanel,
      "File d'attente",
      "Le nombre de commandes en attente n'est pas mesuré en direct. Le zéro enregistré par défaut en base ne constitue pas une mesure."
    );

    showPanel(
      statusPanel,
      "Historique des agents",
      agents.length === 0
        ? "Aucun historique d'agent enregistré."
        : "Des agents sont enregistrés localement, mais leur historique n'est pas vérifié auprès de SQL Server."
    );
  }

  const actions = header?.querySelector(".monitoring-actions");
  let refreshButton;

  if (actions) {
    actions.replaceChildren();

    refreshButton = document.createElement("button");
    refreshButton.className = "primary-button";
    refreshButton.type = "button";
    refreshButton.textContent = "Actualiser les données";

    actions.appendChild(refreshButton);
  }

  async function refreshData() {
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.textContent = "Chargement...";
    }

    try {
      const response = await fetch("api_monitoring.php", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Erreur HTTP " + response.status);
      }

      const data = await response.json();
      showData(data);

      if (refreshButton) {
        const time = new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit"
        });
        refreshButton.textContent = "Actualiser les données";
       refreshButton.title = `Dernière lecture des données locales : ${time}`;
      }
    } catch (error) {
      console.error("Monitoring :", error);

      showPanel(
        agentGrid,
        "Données indisponibles",
        "Impossible de charger les données locales de supervision."
      );
      showPanel(latencyPanel, "Latence indisponible", "Données locales inaccessibles.");
      showPanel(queuePanel, "File d'attente indisponible", "Données locales inaccessibles.");
      showPanel(statusPanel, "Historique indisponible", "Données locales inaccessibles.");

      if (refreshButton) {
        refreshButton.textContent = "Réessayer l'actualisation";
      }
    } finally {
      if (refreshButton) refreshButton.disabled = false;
    }
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", refreshData);
  }

  refreshData();

  const alertBadge = document.querySelector('a[href="alerts.html"] .nav-count');

  if (alertBadge) {
    alertBadge.hidden = true;

    fetch("api_alerts.php", { cache: "no-store" })
      .then(response => response.json())
      .then(data => {
        const count = Array.isArray(data.alerts) ? data.alerts.length : 0;
        alertBadge.textContent = String(count);
        alertBadge.hidden = count === 0;
      })
      .catch(error => console.error("Alertes :", error));
  }

  const oldBell = document.querySelector(".notification-button");

  if (oldBell) {
    const bell = oldBell.cloneNode(true);
    oldBell.replaceWith(bell);

    bell.addEventListener("click", () => {
      window.location.href = "alerts.html";
    });
  }
});