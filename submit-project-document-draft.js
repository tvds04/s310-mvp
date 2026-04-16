(function () {
  var STORAGE = "pf_project_draft_queue_submitted";

  var ITEMS = [
    {
      id: "pdq-1",
      projectDisplay: "PRJ-402 — Acme Corp Data Migration",
      milestoneLabel: "Project charter draft",
    },
    {
      id: "pdq-2",
      projectDisplay: "PRJ-402 — Acme Corp Data Migration",
      milestoneLabel: "Mid-term status report",
    },
    {
      id: "pdq-3",
      projectDisplay: "PRJ-410 — Bloom Retail Inventory",
      milestoneLabel: "Requirements and design draft",
    },
    {
      id: "pdq-4",
      projectDisplay: "PRJ-415 — River City Transit Scheduling",
      milestoneLabel: "Final presentation draft",
    },
  ];

  var form = document.getElementById("pdd-form");
  var tbody = document.getElementById("pdd-tbody");
  var emptyState = document.getElementById("pdd-empty");
  var tableWrap = document.getElementById("pdd-table-wrap");
  var statPending = document.getElementById("pdd-stat-pending");
  var statDone = document.getElementById("pdd-stat-done");
  var dashboard = document.getElementById("pdd-dashboard");
  var detailMeta = document.getElementById("pdd-detail-meta");
  var currentProject = document.getElementById("current-project");
  var teamRole = document.getElementById("team-role");
  var draftFile = document.getElementById("draft-file");
  var confirmDraft = document.getElementById("confirm-draft");
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
    var tb = document.getElementById("pdd-all-tbody");
    if (!tb) return;
    tb.innerHTML = "";
    ITEMS.forEach(function (it) {
      var done = readArr().indexOf(it.id) !== -1;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(it.id.toUpperCase()) + "</td>" +
        "<td>" + escapeHtml(it.milestoneLabel) + "</td>" +
        "<td>" + escapeHtml(it.projectDisplay) + "</td>" +
        "<td>" + (done ? "Submitted" : "Pending") + "</td>";
      tb.appendChild(tr);
    });
  }

  function fillForm(it) {
    if (!it) return;
    if (currentProject) currentProject.value = it.projectDisplay;
    if (teamRole) teamRole.value = "";
    if (draftFile) draftFile.value = "";
    if (confirmDraft) confirmDraft.checked = false;
    if (detailMeta) {
      detailMeta.innerHTML =
        "<dt class=\"hint\">Milestone</dt><dd style=\"margin:0;\">" +
        escapeHtml(it.milestoneLabel) +
        "</dd>" +
        "<dt class=\"hint\">Project</dt><dd style=\"margin:0;\">" +
        escapeHtml(it.projectDisplay) +
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
        "<td>" + escapeHtml(it.milestoneLabel) + "</td>" +
        "<td>" + escapeHtml(it.projectDisplay) + "</td>" +
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
    var ret = form.getAttribute("data-confirm-return") || "submit-project-document-draft.html";
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
