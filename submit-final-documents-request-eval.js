(function () {
  var STORAGE = "pf_final_documents_eval_submitted";

  var ITEMS = [
    { id: "fin-402", projectId: "PRJ-402", label: "PRJ-402 — Acme Corp Data Migration" },
    { id: "fin-410", projectId: "PRJ-410", label: "PRJ-410 — Bloom Retail Inventory" },
    { id: "fin-415", projectId: "PRJ-415", label: "PRJ-415 — River City Transit Scheduling" },
  ];

  var form = document.getElementById("fde-form");
  var tbody = document.getElementById("fde-tbody");
  var emptyState = document.getElementById("fde-empty");
  var tableWrap = document.getElementById("fde-table-wrap");
  var statPending = document.getElementById("fde-stat-pending");
  var statDone = document.getElementById("fde-stat-done");
  var dashboard = document.getElementById("fde-dashboard");
  var detailMeta = document.getElementById("fde-detail-meta");
  var finalCharter = document.getElementById("final-charter");
  var finalReport = document.getElementById("final-report");
  var finalPresentation = document.getElementById("final-presentation");
  var confirmAll = document.getElementById("confirm-all");
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
    var tb = document.getElementById("fde-all-tbody");
    if (!tb) return;
    tb.innerHTML = "";
    ITEMS.forEach(function (it) {
      var done = readArr().indexOf(it.id) !== -1;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(it.projectId) + "</td>" +
        "<td>" + escapeHtml(it.label) + "</td>" +
        "<td>" + (done ? "Evaluation requested" : "Pending") + "</td>";
      tb.appendChild(tr);
    });
  }

  function clearFiles() {
    if (finalCharter) finalCharter.value = "";
    if (finalReport) finalReport.value = "";
    if (finalPresentation) finalPresentation.value = "";
    if (confirmAll) confirmAll.checked = false;
  }

  function fillDetail(it) {
    if (detailMeta && it) {
      detailMeta.innerHTML =
        "<dt class=\"hint\">Project</dt><dd style=\"margin:0;\">" + escapeHtml(it.label) + "</dd>";
    }
  }

  function selectRow(id) {
    selectedId = id;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.classList.toggle("data-table-row--selected", tr.dataset.itemId === id);
    });
    clearFiles();
    fillDetail(find(id));
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
        "<td>" + escapeHtml(it.label) + "</td>" +
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
    var ret = form.getAttribute("data-confirm-return") || "submit-final-documents-request-eval.html";
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
