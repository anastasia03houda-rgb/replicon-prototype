document.addEventListener("DOMContentLoaded", () => {
  // القائمة الجانبية فالشاشات الصغيرة.
  const menuButton = document.querySelector(".menu-button");
  const sidebar = document.querySelector(".sidebar");

  if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // زر الجرس يفتح صفحة التنبيهات.
  const notificationButton = document.querySelector(".notification-button");

  if (notificationButton) {
    notificationButton.addEventListener("click", () => {
      window.location.href = "alerts.html";
    });
  }

  // ما كاينش تسجيل دخول فهاد النسخة؛ ما نورّيوش رسالة "Connectée".
  const profileButton = document.querySelector(".profile-button");

  if (profileButton) {
    profileButton.title = "Profil de démonstration — authentification non configurée";
  }

  // العدد الحقيقي ديال التنبيهات النشيطة فالقائمة الجانبية.
  const alertBadge = document.querySelector(
    'a[href="alerts.html"] .nav-count'
  );

  if (alertBadge) {
    alertBadge.style.display = "none";

    fetch("api_alerts.php", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Alertes indisponibles");
        return response.json();
      })
      .then((data) => {
        const alerts = Array.isArray(data.alerts) ? data.alerts : [];
        alertBadge.textContent = String(alerts.length);
        alertBadge.style.display = alerts.length > 0 ? "" : "none";
      })
      .catch((error) => {
        console.error("Alertes :", error);
      });
  }

  // البحث dans la liste des sites.
  const siteSearch = document.querySelector("#siteSearch");

  if (siteSearch) {
    siteSearch.addEventListener("input", () => {
      const query = siteSearch.value.trim().toLocaleLowerCase();

      document.querySelectorAll(".site-table tbody tr").forEach((row) => {
        row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
      });
    });
  }

  // البحث et filtres dans les alertes.
  const alertSearch = document.querySelector(".alert-search input");
  const alertFilters = document.querySelectorAll(".alert-filter");

  function filterAlerts() {
    const query = alertSearch?.value.trim().toLocaleLowerCase() ?? "";
    const active = document.querySelector(".alert-filter.active-filter");
    const filter = active?.textContent.trim() ?? "Toutes";

    document.querySelectorAll(".alert-record").forEach((record) => {
      const matchesText = record.textContent
        .toLocaleLowerCase()
        .includes(query);

      const matchesType =
        filter === "Toutes" ||
        (filter === "Critiques" && record.classList.contains("critical")) ||
        (filter === "Avertissements" && record.classList.contains("warning")) ||
        (filter === "Informations" && record.classList.contains("info"));

      record.style.display = matchesText && matchesType ? "" : "none";
    });
  }

  alertSearch?.addEventListener("input", filterAlerts);

  alertFilters.forEach((button) => {
    button.addEventListener("click", () => {
      alertFilters.forEach((item) => item.classList.remove("active-filter"));
      button.classList.add("active-filter");
      filterAlerts();
    });
  });
});