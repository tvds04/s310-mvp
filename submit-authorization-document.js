(function () {
  var STORAGE = "pf_authorization_document_submitted";

  var ITEMS = [
    {
      id: "auth-402",
      projectId: "PRJ-402",
      projectName: "Acme Corp Data Migration",
      clientId: "CLI-001",
      clientName: "Acme Corp",
    },
    {
      id: "auth-410",
      projectId: "PRJ-410",
      projectName: "Bloom Retail Inventory",
      clientId: "CLI-022",
      clientName: "Bloom Retail Co.",
    },
    {
      id: "auth-415",
      projectId: "PRJ-415",
      projectName: "River City Transit Scheduling",
      clientId: "CLI-030",
      clientName: "River City Transit",
    },
  ];

  var form = document.getElementById("sad-form");
  var tbody = document.getElementById("sad-tbody");
  var emptyState = document.getElementById("sad-empty");
  var tableWrap = document.getElementById("sad-table-wrap");
  var statPending = document.getElementById("sad-stat-pending");
  var statDone = document.getElementById("sad-stat-done");
  var dashboard = document.getElementById("sad-dashboard");
  var detailMeta = document.getElementById("sad-detail-meta");
  var projectName = document.getElementById("project-name");
  var projectIdField = document.getElementById("project-id-field");
  var clientId = document.getElementById("client-id");
  var clientName = document.getElementById("client-name");
  var authPdf = document.getElementById("auth-pdf");
  var selectedId = null;

  if (!form || !tbody) return;

  function readArr() {
    try {
      var raw = localStorage.getItem(STORAGE);
      var p = raw ? JSON.parse(raw) : [];
      return Array.isArray(p) ? p : [];
    } catch (e) {
      return [];
    }
  }

  function saveDone(id) {
    var a = readArr();
    if (a.indexOf(id) === -1) a.push(id);
    localStorage.setItem(STORAGE, JSON.stringify(a));
  }

  function pending() {
    var d = readArr();
    return ITEMS.filter(function (x) {
      return d.indexOf(x.id) === -1;
    });
  }

  function escapeHtml(s) {
    var el = document.createElement("div");
    el.textContent = s;
    return el.innerHTML;
  }

  function renderStats() {
    if (statPending) statPending.textContent = String(pending().length);
    if (statDone) statDone.textContent = String(readArr().length);
  }

  function find(id) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }

  function renderAll() {
    var tb = document.getElementById("sad-all-tbody");
    if (!tb) return;
    tb.innerHTML = "";
    ITEMS.forEach(function (it) {
      var done = readArr().indexOf(it.id) !== -1;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(it.projectId) + "</td>" +
        "<td>" + escapeHtml(it.clientName) + "</td>" +
        "<td>" + (done ? "Received" : "Pending") + "</td>";
      tb.appendChild(tr);
    });
  }

  function fillForm(it) {
    if (!it) return;
    if (projectName) projectName.value = it.projectName;
    if (projectIdField) projectIdField.value = it.projectId;
    if (clientId) clientId.value = it.clientId;
    if (clientName) clientName.value = it.clientName;
    if (authPdf) authPdf.value = "";
    if (detailMeta) {
      detailMeta.innerHTML =
        "<dt class=\"hint\">Project</dt><dd style=\"margin:0;\">" +
        escapeHtml(it.projectId) +
        " — " +
        escapeHtml(it.projectName) +
        "</dd>";
    }
  }

  function selectRow(id) {
    selectedId = id;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.classList.toggle("data-table-row--selected", tr.dataset.itemId === id);
    });
    fillForm(find(id));
  }

  function renderTable() {
    var list = pending();
    tbody.innerHTML = "";
    renderStats();
    renderAll();

    if (list.length === 0) {
      if (emptyState) emptyState.hidden = false;
      if (tableWrap) tableWrap.hidden = true;
      selectedId = null;
      if (dashboard) dashboard.hidden = true;
      form.hidden = true;
      return;
    }
    if (emptyState) emptyState.hidden = true;
    if (tableWrap) tableWrap.hidden = false;
    if (dashboard) dashboard.hidden = false;
    form.hidden = false;

    list.forEach(function (it) {
      var tr = document.createElement("tr");
      tr.dataset.itemId = it.id;
      tr.setAttribute("role", "button");
      tr.setAttribute("tabindex", "0");
      tr.innerHTML =
        "<td>" + escapeHtml(it.projectId) + "</td>" +
        "<td>" + escapeHtml(it.clientName) + "</td>" +
        "<td>Pending</td>";
      tr.addEventListener("click", function () {
        selectRow(it.id);
      });
      tr.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectRow(it.id);
        }
      });
      tbody.appendChild(tr);
    });
    selectRow(list[0].id);
  }

  function buildUrl() {
    var btn = form.querySelector('button[type="submit"]');
    var title = (btn && btn.getAttribute("data-confirm-title")) || "Saved";
    var message = (btn && btn.getAttribute("data-confirm-message")) || "";
    var ret = form.getAttribute("data-confirm-return") || "submit-authorization-document.html";
    var p = new URLSearchParams();
    p.set("title", title);
    if (message) p.set("message", message);
    p.set("return", ret);
    return "confirmation.html?" + p.toString();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selectedId) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    saveDone(selectedId);
    window.location.href = buildUrl();
  });

  renderTable();
})();
