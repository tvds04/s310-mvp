(function () {
  var STORAGE = "pf_client_feedback_submitted";

  var ITEMS = [
    { id: "cfb-402", projectId: "PRJ-402", label: "PRJ-402 — Acme Corp Data Migration" },
    { id: "cfb-410", projectId: "PRJ-410", label: "PRJ-410 — Bloom Retail Inventory" },
    { id: "cfb-415", projectId: "PRJ-415", label: "PRJ-415 — River City Transit Scheduling" },
  ];

  var form = document.getElementById("scf-form");
  var tbody = document.getElementById("scf-tbody");
  var emptyState = document.getElementById("scf-empty");
  var tableWrap = document.getElementById("scf-table-wrap");
  var statPending = document.getElementById("scf-stat-pending");
  var statDone = document.getElementById("scf-stat-done");
  var dashboard = document.getElementById("scf-dashboard");
  var detailMeta = document.getElementById("scf-detail-meta");
  var feedbackProjectId = document.getElementById("feedback-project-id-hidden");
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
    var tb = document.getElementById("scf-all-tbody");
    if (!tb) return;
    tb.innerHTML = "";
    ITEMS.forEach(function (it) {
      var done = readArr().indexOf(it.id) !== -1;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(it.projectId) + "</td>" +
        "<td>" + escapeHtml(it.label) + "</td>" +
        "<td>" + (done ? "Submitted" : "Pending") + "</td>";
      tb.appendChild(tr);
    });
  }

  function resetRatingSelects() {
    ["rate-communication", "rate-quality", "rate-timeliness", "rate-professionalism", "rate-overall"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    });
    var cf = document.getElementById("client-feedback");
    var oc = document.getElementById("other-comments");
    if (cf) cf.value = "";
    if (oc) oc.value = "";
  }

  function syncHiddenProject(it) {
    if (feedbackProjectId && it) feedbackProjectId.value = it.projectId;
  }

  function fillDetail(it) {
    if (detailMeta && it) {
      detailMeta.innerHTML =
        "<dt class=\"hint\">Project</dt><dd style=\"margin:0;\">" + escapeHtml(it.label) + "</dd>";
    }
    syncHiddenProject(it);
  }

  function selectRow(id) {
    selectedId = id;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.classList.toggle("data-table-row--selected", tr.dataset.itemId === id);
    });
    resetRatingSelects();
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

  function buildUrl(submitter) {
    var title = "Saved";
    var message = "";
    if (submitter) {
      title = submitter.getAttribute("data-confirm-title") || title;
      message = submitter.getAttribute("data-confirm-message") || "";
    }
    var ret = form.getAttribute("data-confirm-return") || "submit-client-feedback.html";
    var p = new URLSearchParams();
    p.set("title", title);
    if (message) p.set("message", message);
    p.set("return", ret);
    return "confirmation.html?" + p.toString();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selectedId) return;
    var submitter = e.submitter;
    var action = submitter && submitter.getAttribute("name") === "action" ? submitter.value : "submit";

    if (action === "save") {
      window.location.href = buildUrl(submitter);
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    saveDone(selectedId);
    window.location.href = buildUrl(submitter);
  });

  renderTable();
})();
