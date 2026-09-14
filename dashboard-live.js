document.addEventListener("DOMContentLoaded", async () => {
  const cards = document.querySelectorAll(".metric-grid .metric-card");
  const sitesBody = document.querySelector(".sites-panel tbody");
  const alertsList = document.querySelector(".alerts-panel .alert-list");

  // نخفي البيانات التجريبية ريثما تتحمّل بيانات القاعدة
  cards.forEach((card) => {
    const number = card.querySelector("h2");
    if (number) number.textContent = "—";
    const description = card.querySelector("small");
    if (description) description.textContent = "Chargement des données...";
  });

  if (sitesBody) sitesBody.replaceChildren();
  if (alertsList) alertsList.replaceChildren();
const chartPanel = document.querySelector(".replication-overview");

if (chartPanel) {
  const chartTitle = chartPanel.querySelector(".panel-header h2");
  if (chartTitle) chartTitle.textContent = "Sites enregistrés par pays";

  chartPanel.querySelector(".chart-legend")?.remove();
  chartPanel.querySelector(".chart-area")?.remove();
  chartPanel.querySelector(".select-button")?.remove();
}

  function setCard(index, number, unit, description) {
    const card = cards[index];
    if (!card) return;

    const heading = card.querySelector("h2");
    if (heading) {
      heading.textContent = number;
      if (unit) {
        const span = document.createElement("span");
        span.textContent = ` ${unit}`;
        heading.appendChild(span);
      }
    }

    const small = card.querySelector("small");
    if (small) small.textContent = description;
  }

  function tableCell(row, value, elementName = "span") {
    const cell = document.createElement("td");
    const content = document.createElement(elementName);
    content.textContent = value ?? "—";
    cell.appendChild(content);
    row.appendChild(cell);
    return cell;
  }

  function showEmpty(container, message, isTable = false) {
    if (!container) return;

    const element = document.createElement(isTable ? "tr" : "p");
    const text = isTable ? document.createElement("td") : element;

    if (isTable) {
      text.colSpan = 5;
      element.appendChild(text);
    }

    text.textContent = message;
    text.style.padding = "26px";
    text.style.color = "#718096";
    container.appendChild(element);
  }

  try {
    const response = await fetch("api_dashboard.php", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const summary = data.summary;

    if (!summary || !Array.isArray(data.sites) || !Array.isArray(data.alerts)) {
      throw new Error("Réponse inattendue");
    }
if (chartPanel) {
  const counts = new Map();
for (const item of data.country_counts || []) {
  const country = String(item.country || "Non renseigné").trim();
  counts.set(country, Number(item.site_count) || 0);
}
  

  const chart = document.createElement("div");
  chart.className = "country-chart";

  if (counts.size === 0) {
    chart.textContent = "Aucun site enregistré pour le moment.";
  } else {
    const countries = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"));

    const maximum = Math.max(...countries.map(([, count]) => count));

    for (const [country, count] of countries) {
      const row = document.createElement("div");
      row.className = "country-row";

      const label = document.createElement("span");
      label.textContent = country;

      const track = document.createElement("div");
      track.className = "country-track";

      const bar = document.createElement("div");
      bar.className = "country-bar";
      bar.style.width = `${(count / maximum) * 100}%`;

      const value = document.createElement("strong");
      value.textContent = count;

      track.appendChild(bar);
      row.append(label, track, value);
      chart.appendChild(row);
    }
  }

  chartPanel.querySelector(".country-chart")?.remove();
  chartPanel.appendChild(chart);
}
    const total = Number(summary.total_sites) || 0;
    const running = Number(summary.running_sites) || 0;
    const unknown = Number(summary.unknown_sites) || 0;
    const problems = Number(summary.problem_sites) || 0;
    const alerts = Number(summary.active_alerts) || 0;

    setCard(0, total, "sites", `${unknown} état(s) non vérifié(s)`);
    setCard(1, running, "sites", "États déclarés dans la base de données");
    setCard(
      2,
      summary.average_latency == null
        ? "—"
        : Number(summary.average_latency).toLocaleString("fr-FR"),
      summary.average_latency == null ? "" : "sec.",
      summary.average_latency == null
        ? "Aucune mesure disponible"
        : "Moyenne des mesures enregistrées"
    );
    setCard(3, alerts, "alertes", "Alertes actives enregistrées");

    const heroStatus = document.querySelector(".hero-section .eyebrow");
    if (heroStatus) {
      heroStatus.textContent = "Données enregistrées · État non vérifié en direct";
    }

    const heroText = document.querySelector(".hero-text");
    if (heroText) {
      heroText.textContent =
        `${total} site(s) configuré(s). ` +
        "La surveillance SQL Server en direct n'est pas encore connectée.";
    }

    const dateButton = document.querySelector(".hero-actions .secondary-button");
    if (dateButton) {
      dateButton.textContent = new Date().toLocaleDateString("fr-FR");
    }

    document.querySelectorAll(".metric-card .trend, .metric-card .live-dot, .metric-card .alert-tag")
      .forEach((badge) => badge.remove());

    const navCount = document.querySelector(".nav-count");
    if (navCount) navCount.textContent = alerts;

    const donut = document.querySelector(".donut-chart");
    const percentage = total === 0 ? 0 : Math.round((running / total) * 100);

    if (donut) {
      donut.style.background =
        `conic-gradient(#28aa89 0% ${percentage}%, #e8edf4 ${percentage}% 100%)`;
      const value = donut.querySelector("strong");
      const caption = donut.querySelector("span");
      if (value) value.textContent = `${percentage}%`;
      if (caption) caption.textContent = "déclarés actifs";
    }

    const legends = document.querySelectorAll(".health-legend p");
    if (legends[0]) legends[0].innerHTML = `Déclarés actifs <strong>${running}</strong>`;
    if (legends[1]) legends[1].innerHTML = `État inconnu <strong>${unknown}</strong>`;
    if (legends[2]) legends[2].innerHTML = `À vérifier <strong>${problems}</strong>`;

    const sitesLink = document.querySelector(".sites-panel .text-button");
    if (sitesLink) {
      sitesLink.textContent = `Voir les ${total} sites`;
      sitesLink.addEventListener("click", () => {
        window.location.href = "sites.html";
      });
    }

    if (sitesBody) {
      for (const site of data.sites) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const initials = document.createElement("span");
        initials.className = "country-fr";
        initials.textContent = String(site.site_code || "—").slice(0, 2);

        const country = document.createElement("strong");
        country.textContent = site.country || "—";

        const code = document.createElement("small");
        code.textContent = `Site ${site.site_code || "—"}`;

        nameCell.append(initials, country, code);
        row.appendChild(nameCell);

        tableCell(row, site.publisher_server, "code");

        const subscriberCell = tableCell(
          row,
          site.subscriber_server,
          "code"
        );
        const database = document.createElement("small");
        database.textContent = site.reporting_database || "—";
        subscriberCell.appendChild(database);

        const syncCell = tableCell(
          row,
          site.last_sync_at || "Aucune synchronisation",
          "strong"
        );
        const latency = document.createElement("small");
        latency.textContent =
          site.latency_seconds == null
            ? "Latence : non disponible"
            : `Latence : ${site.latency_seconds} sec.`;
        syncCell.appendChild(latency);

        const statusCell = tableCell(
          row,
          site.status || "unknown"
        );
        statusCell.querySelector("span").className =
          `status-badge ${site.status === "running" ? "healthy" : "warning"}`;

        sitesBody.appendChild(row);
      }

      if (data.sites.length === 0) {
        showEmpty(sitesBody, "Aucun site enregistré.", true);
      }
    }

    if (alertsList) {
      for (const alert of data.alerts) {
        const item = document.createElement("article");
        item.className = "alert-item";

        const content = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = alert.title || "Alerte";

        const message = document.createElement("p");
        message.textContent =
          `${alert.site_code || "Site inconnu"} · ${alert.message || ""}`;

        content.append(title, message);
        item.appendChild(content);
        alertsList.appendChild(item);
      }

      if (data.alerts.length === 0) {
        showEmpty(alertsList, "Aucune alerte enregistrée.");
      }
    }

    const alertsLink = document.querySelector(".all-alerts-link");
    if (alertsLink) alertsLink.href = "alerts.html";
  } catch (error) {
    console.error("Tableau de bord :", error);

    cards.forEach((_, index) => {
      setCard(index, "—", "", "Données indisponibles");
    });

    showEmpty(sitesBody, "Impossible de charger les sites.", true);
    showEmpty(alertsList, "Impossible de charger les alertes.");
  }
});