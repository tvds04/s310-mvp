/**
 * Accept / Reject Students: pending applicants only; saving a decision removes
 * the applicant from the list (stored in localStorage, same pattern as form-teams).
 */
(function () {
  var STORAGE_DECISIONS = "pf_mc_student_application_decisions";

  var APPLICANTS = [
    {
      id: "app-001",
      name: "Alex Morgan",
      classStanding: "Junior",
      major: "Information Systems",
      statusLabel: "Pending",
      notesFlag: "—",
      email: "amorgan@university.example",
    },
    {
      id: "app-002",
      name: "Jordan Lee",
      classStanding: "Senior",
      major: "Finance",
      statusLabel: "Pending",
      notesFlag: "Interview notes on file",
      email: "jlee@university.example",
    },
    {
      id: "app-003",
      name: "Riley Chen",
      classStanding: "Sophomore",
      major: "Accounting",
      statusLabel: "Pending",
      notesFlag: "—",
      email: "rchen@university.example",
    },
    {
      id: "app-004",
      name: "Sam Patel",
      classStanding: "Grad",
      major: "Information Systems",
      statusLabel: "Pending",
      notesFlag: "—",
      email: "spatel@university.example",
    },
    {
      id: "app-005",
      name: "Morgan Wu",
      classStanding: "Junior",
      major: "Marketing",
      statusLabel: "Pending",
      notesFlag: "—",
      email: "mwu@university.example",
    },
    {
      id: "app-006",
      name: "Casey Rivera",
      classStanding: "Sophomore",
      major: "Finance",
      statusLabel: "Pending",
      notesFlag: "—",
      email: "crivera@university.example",
    },
  ];

  var form = document.getElementById("ar-students-form");
  var tbody = document.getElementById("ar-students-tbody");
  var emptyState = document.getElementById("ar-students-empty");
  var tableWrap = document.getElementById("ar-students-table-wrap");
  var statAccepted = document.getElementById("stat-accepted-applicants");
  var statRejected = document.getElementById("stat-rejected-applicants");
  var statPending = document.getElementById("stat-pending-applicants");
  var dashboard = document.getElementById("ar-dashboard");
  var detailSection = document.getElementById("ar-students-detail");
  var detailTitle = document.getElementById("ar-detail-title");
  var detailEmail = document.getElementById("ar-detail-email");
  var statusSelect = document.getElementById("applicant-status");
  var selectedId = null;

  if (!form || !tbody) return;

  function getDecisions() {
    try {
      var raw = localStorage.getItem(STORAGE_DECISIONS);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveDecision(applicantId, decision) {
    var d = getDecisions();
    d[applicantId] = decision;
    localStorage.setItem(STORAGE_DECISIONS, JSON.stringify(d));
  }

  function pendingApplicants() {
    var decisions = getDecisions();
    return APPLICANTS.filter(function (a) {
      return !decisions[a.id];
    });
  }

  function counts() {
    var decisions = getDecisions();
    var acc = 0;
    var rej = 0;
    Object.keys(decisions).forEach(function (id) {
      if (decisions[id] === "accept") acc++;
      else if (decisions[id] === "reject") rej++;
    });
    return { accepted: acc, rejected: rej };
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function renderStats() {
    var pending = pendingApplicants().length;
    var c = counts();
    if (statPending) statPending.textContent = String(pending);
    if (statAccepted) statAccepted.textContent = String(c.accepted);
    if (statRejected) statRejected.textContent = String(c.rejected);
  }

  function findApplicant(id) {
    for (var i = 0; i < APPLICANTS.length; i++) {
      if (APPLICANTS[i].id === id) return APPLICANTS[i];
    }
    return null;
  }

  function renderDetail() {
    if (!detailSection || !detailTitle || !detailEmail) return;
    var a = selectedId ? findApplicant(selectedId) : null;
    if (!a) {
      detailSection.hidden = true;
      return;
    }
    detailSection.hidden = false;
    detailTitle.textContent = "Selected applicant: " + a.name;
    detailEmail.textContent = a.email;
  }

  function selectApplicant(id) {
    selectedId = id;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.classList.toggle("data-table-row--selected", tr.dataset.applicantId === id);
    });
    if (statusSelect) statusSelect.value = "";
    renderDetail();
  }

  function renderTable() {
    var list = pendingApplicants();
    tbody.innerHTML = "";
    renderStats();

    if (list.length === 0) {
      if (emptyState) emptyState.hidden = false;
      if (tableWrap) tableWrap.hidden = true;
      selectedId = null;
      renderDetail();
      if (detailSection) detailSection.hidden = true;
      if (dashboard) dashboard.hidden = true;
      form.hidden = true;
      return;
    }

    if (emptyState) emptyState.hidden = true;
    if (tableWrap) tableWrap.hidden = false;
    if (dashboard) dashboard.hidden = false;
    form.hidden = false;

    list.forEach(function (a) {
      var tr = document.createElement("tr");
      tr.dataset.applicantId = a.id;
      tr.setAttribute("role", "button");
      tr.setAttribute("tabindex", "0");
      tr.innerHTML =
        "<td>" + escapeHtml(a.name) + "</td>" +
        "<td>" + escapeHtml(a.classStanding) + "</td>" +
        "<td>" + escapeHtml(a.major) + "</td>" +
        "<td>" + escapeHtml(a.statusLabel) + "</td>" +
        "<td>" + escapeHtml(a.notesFlag) + "</td>";
      tr.addEventListener("click", function () {
        selectApplicant(a.id);
      });
      tr.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectApplicant(a.id);
        }
      });
      tbody.appendChild(tr);
    });

    var first = list[0];
    selectApplicant(first.id);
  }

  function buildConfirmationUrl() {
    var btn = form.querySelector('button[type="submit"]');
    var title = (btn && btn.getAttribute("data-confirm-title")) || "Saved";
    var message = (btn && btn.getAttribute("data-confirm-message")) || "";
    var returnUrl = form.getAttribute("data-confirm-return") || "accept-reject-student-applications.html";
    var params = new URLSearchParams();
    params.set("title", title);
    if (message) params.set("message", message);
    params.set("return", returnUrl);
    return "confirmation.html?" + params.toString();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selectedId) return;
    if (typeof form.checkValidity === "function" && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var decision = statusSelect && statusSelect.value;
    if (decision !== "accept" && decision !== "reject") return;
    saveDecision(selectedId, decision);
    window.location.href = buildConfirmationUrl();
  });

  renderTable();
})();
