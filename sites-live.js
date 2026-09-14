document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector(".site-table tbody");
  if (!tableBody) return;

  const counters = document.querySelectorAll(".site-summary-card strong");
  const footer = document.querySelector(".site-footer span");
  const search = document.querySelector("#siteSearch");
  const filters = document.querySelectorAll(".filter-button");

  let sites = [];
  let activeFilter = "all";

  // نمسحو السطور التجريبية اللي مكتوبة فـ HTML
  tableBody.replaceChildren();
  updateCounters();
  showMessage("Chargement des sites...");

  function showMessage(message) {
    tableBody.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = message;
    cell.style.textAlign = "center";
    cell.style.padding = "32px";
    row.appendChild(cell);
    tableBody.appendChild(row);
  }

  function isRunning(site) {
    return ["running", "healthy", "active", "operational"].includes(
      String(site.status || "").toLowerCase()
    );
  }

  function updateCounters() {
    const running = sites.filter(isRunning).length;

    if (counters[0]) counters[0].textContent = `${sites.length} sites`;
    if (counters[1]) counters[1].textContent = `${running} sites`;
    if (counters[2]) {
      counters[2].textContent = `${sites.length - running} sites`;
    }
  }

  function addCell(row, value, tag = "span") {
    const cell = document.createElement("td");
    const element = document.createElement(tag);
    element.textContent = value ?? "—";
    cell.appendChild(element);
    row.appendChild(cell);
    return cell;
  }

  function render() {
    const term = (search?.value || "").trim().toLowerCase();

    const visible = sites.filter((site) => {
      const matchesSearch = [site.country, site.site_code]
        .some((value) => String(value || "").toLowerCase().includes(term));

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "running" && isRunning(site)) ||
        (activeFilter === "attention" && !isRunning(site));

      return matchesSearch && matchesFilter;
    });

    tableBody.replaceChildren();

    if (visible.length === 0) {
      showMessage(
        sites.length === 0
          ? "Aucun site enregistré dans la base de données."
          : "Aucun site ne correspond à votre recherche."
      );
    }

    for (const site of visible) {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      const name = document.createElement("div");
      name.className = "site-name";

      const initials = document.createElement("span");
      initials.className = "country-fr";
      initials.textContent = String(site.site_code || "—").slice(0, 2);

      const details = document.createElement("div");
      const country = document.createElement("strong");
      country.textContent = site.country || "—";
      const code = document.createElement("small");
      code.textContent = `Code : ${site.site_code || "—"}`;

      details.append(country, code);
      name.append(initials, details);
      nameCell.appendChild(name);
      row.appendChild(nameCell);

      addCell(row, site.publisher_server, "code");
      addCell(row, site.subscriber_server, "code");
      addCell(row, site.reporting_database, "strong");

      const syncCell = addCell(
        row,
        site.last_sync_at
          ? new Date(String(site.last_sync_at).replace(" ", "T"))
              .toLocaleString("fr-FR")
          : "Aucune synchronisation",
        "strong"
      );

      const latency = document.createElement("small");
      latency.textContent =
        site.latency_seconds == null
          ? "Latence : non disponible"
          : `Latence : ${site.latency_seconds} sec.`;
      syncCell.appendChild(latency);

      const statusCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `status-badge ${
        isRunning(site) ? "healthy" : "warning"
      }`;
      badge.textContent = site.status || "unknown";
      statusCell.appendChild(badge);
      row.appendChild(statusCell);

      addCell(row, "—");
      tableBody.appendChild(row);
    }

    if (footer) {
      footer.textContent = `Affichage de ${visible.length} sites sur ${sites.length}`;
    }
  }

  search?.addEventListener("input", render);

  filters.forEach((button, index) => {
    button.addEventListener("click", () => {
      activeFilter = ["all", "running", "attention"][index] || "all";
      render();
    });
  });

  try {
    const response = await fetch("api_sites.php", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.sites)) {
      throw new Error("Réponse inattendue");
    }

    sites = data.sites;
    updateCounters();
    render();
  } catch (error) {
    console.error("Chargement des sites :", error);
    showMessage("Impossible de charger les sites depuis la base de données.");
    if (footer) footer.textContent = "Données indisponibles";
  }
});