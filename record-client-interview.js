(function () {
  var STORAGE = "pf_record_interview_completed";

  var ITEMS = [
    {
      id: "int-402",
      projectId: "PRJ-402",
      clientId: "CLI-001",
      clientName: "Acme Corp",
      projectLine: "Data migration readiness",
      projectDetails:
        "Phased migration assessment; client has IT liaison; 10-week window. Sponsor: VP Operations.",
    },
    {
      id: "int-405",
      projectId: "PRJ-405",
      clientId: "CLI-014",
      clientName: "Riverdale Logistics",
      projectLine: "Route review",
      projectDetails:
        "Focus on last-mile routing; client uses legacy TMS; willing to share anonymized sample data.",
    },
    {
      id: "int-410",
      projectId: "PRJ-410",
      clientId: "CLI-022",
      clientName: "Bloom Retail Co.",
      projectLine: "Inventory dashboard",
      projectDetails:
        "Store-level accuracy KPIs; integration with POS vendor discussed; privacy constraints noted.",
    },
    {
      id: "int-415",
      projectId: "PRJ-415",
      clientId: "CLI-030",
      clientName: "River City Transit",
      projectLine: "Scheduling optimization",
      projectDetails:
        "Public-sector constraints; open data preferences; kickoff timing aligns with semester.",
    },
  ];

  var form = document.getElementById("rci-form");
  var tbody = document.getElementById("rci-tbody");
  var emptyState = document.getElementById("rci-empty");
  var tableWrap = document.getElementById("rci-table-wrap");
  var statPending = document.getElementById("rci-stat-pending");
  var statDone = document.getElementById("rci-stat-done");
  var dashboard = document.getElementById("rci-dashboard");
  var detailMeta = document.getElementById("rci-detail-meta");
  var projectIdField = document.getElementById("project-id");
  var clientIdField = document.getElementById("client-id");
  var projectDetailsField = document.getElementById("project-details");
  var interviewNotes = document.getElementById("interview-notes");
  var statusSelect = document.getElementById("status");
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
    var p = pending().length;
    var done = readArr().length;
    if (statPending) statPending.textContent = String(p);
    if (statDone) statDone.textContent = String(done);
  }

  function find(id) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }

  function renderAll() {
    var tb = document.getElementById("rci-all-tbody");
    if (!tb) return;
    tb.innerHTML = "";
    ITEMS.forEach(function (it) {
      var done = readArr().indexOf(it.id) !== -1;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(it.projectId) + "</td>" +
        "<td>" + escapeHtml(it.clientName) + "</td>" +
        "<td>" + escapeHtml(it.projectLine) + "</td>" +
        "<td>" + (done ? "Recorded" : "Pending") + "</td>";
      tb.appendChild(tr);
    });
  }

  function fillForm(it) {
    if (!it) return;
    if (projectIdField) projectIdField.value = it.projectId;
    if (clientIdField) clientIdField.value = it.clientId;
    if (projectDetailsField) projectDetailsField.value = it.projectDetails;
    if (interviewNotes) interviewNotes.value = "";
    if (statusSelect) statusSelect.value = "";
    if (detailMeta) {
      detailMeta.innerHTML =
        "<dt class=\"hint\">Client</dt><dd style=\"margin:0;\">" +
        escapeHtml(it.clientName) +
        "</dd><dt class=\"hint\">Project</dt><dd style=\"margin:0;\">" +
        escapeHtml(it.projectLine) +
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
        "<td>" + escapeHtml(it.projectLine) + "</td>" +
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
    var ret = form.getAttribute("data-confirm-return") || "record-client-interview.html";
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
