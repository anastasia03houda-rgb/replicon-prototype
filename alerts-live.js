document.addEventListener("DOMContentLoaded", async () => {
  const list = document.querySelector(".alerts-list");
  if (!list) return;

  const stats = document.querySelectorAll(".alert-stat strong");
  const footer = document.querySelector(".alert-footer");
  const search = document.querySelector(".alert-search input");
  const filters = document.querySelectorAll(".alert-filter");

  let alerts = [];
  let activeFilter = "all";

  // نحيدو التنبيهات التجريبية من الصفحة
  list.replaceChildren();

  // هاد الأزرار ما عندهاش عملية حقيقية فقاعدة البيانات دابا
  document.querySelector(".alerts-header .primary-button")?.remove();
  document.querySelector(".alert-control-panel .text-button")?.remove();

  function updateStats() {
    const critical = alerts.filter(
      (alert) => alert.severity === "critical"
    ).length;

    const warning = alerts.filter(
      (alert) => alert.severity === "warning"
    ).length;

    if (stats[0]) stats[0].textContent = `${critical} incident(s)`;
    if (stats[1]) stats[1].textContent = `${warning} alerte(s)`;
    if (stats[2]) stats[2].textContent = `${alerts.length} notification(s)`;

    const navCount = document.querySelector(".nav-count");
    if (navCount) navCount.textContent = alerts.length;
  }

  function showMessage(message) {
    list.replaceChildren();

    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    paragraph.style.padding = "32px";
    paragraph.style.color = "#718096";
    paragraph.style.textAlign = "center";

    list.appendChild(paragraph);
  }

  function render() {
    const term = (search?.value || "").trim().toLowerCase();

    const visible = alerts.filter((alert) => {
      const matchesSearch = [
        alert.title,
        alert.message,
        alert.site_code,
        alert.country,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      );

      const matchesFilter =
        activeFilter === "all" ||
        alert.severity === activeFilter;

      return matchesSearch && matchesFilter;
    });

    list.replaceChildren();

    if (visible.length === 0) {
      showMessage(
        alerts.length === 0
          ? "Aucune alerte active enregistrée."
          : "Aucune alerte ne correspond à votre recherche."
      );
    }

    for (const alert of visible) {
      const severity = ["critical", "warning", "info"].includes(
        alert.severity
      )
        ? alert.severity
        : "info";

      const item = document.createElement("article");
      item.className = `alert-record ${severity}`;

      const icon = document.createElement("span");
      icon.className = "record-icon";

      const iconSymbol = document.createElement("i");
      iconSymbol.className =
        severity === "critical"
          ? "fa-solid fa-circle-exclamation"
          : severity === "warning"
            ? "fa-solid fa-triangle-exclamation"
            : "fa-solid fa-circle-info";
      icon.appendChild(iconSymbol);

      const content = document.createElement("div");
      content.className = "record-content";

      const titleLine = document.createElement("div");
      titleLine.className = "record-title";

      const title = document.createElement("h2");
      title.textContent = alert.title || "Alerte";

      const date = document.createElement("span");
      date.className = "record-date";
      date.textContent = alert.created_at || "—";

      titleLine.append(title, date);

      const description = document.createElement("p");
      description.textContent = alert.message || "Aucun détail disponible.";

      const meta = document.createElement("div");
      meta.className = "record-meta";

      const site = document.createElement("span");
      site.textContent = alert.site_code
        ? `Site ${alert.site_code} · ${alert.country || ""}`
        : "Site non précisé";

      meta.appendChild(site);
      content.append(titleLine, description, meta);

      const actions = document.createElement("div");
      actions.className = "record-actions";

      const badge = document.createElement("span");
      badge.className = `priority-badge ${severity}`;
      badge.textContent =
        severity === "critical"
          ? "Critique"
          : severity === "warning"
            ? "Avertissement"
            : "Information";

      actions.appendChild(badge);
      item.append(icon, content, actions);
      list.appendChild(item);
    }

    if (footer) {
      footer.replaceChildren();

      const count = document.createElement("span");
      count.textContent =
        `${visible.length} alerte(s) affichée(s) sur ${alerts.length}`;

      const source = document.createElement("span");
      source.textContent = "Source : base de données locale";

      footer.append(count, source);
    }
  }

  search?.addEventListener("input", render);

  filters.forEach((button, index) => {
    button.addEventListener("click", () => {
      activeFilter =
        ["all", "critical", "warning", "info"][index] || "all";
      render();
    });
  });

  showMessage("Chargement des alertes...");

  try {
    const response = await fetch("api_alerts.php", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.alerts)) {
      throw new Error("Réponse inattendue");
    }

    alerts = data.alerts;
    updateStats();
    render();
  } catch (error) {
    console.error("Chargement des alertes :", error);
    showMessage("Impossible de charger les alertes.");

    stats.forEach((stat) => {
      stat.textContent = "—";
    });
  }
});