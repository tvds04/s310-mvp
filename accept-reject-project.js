/**
 * Accept / Reject Projects: pending proposals only; saving a decision removes
 * the project from the pending list (localStorage, same pattern as students).
 */
(function () {
  var STORAGE_DECISIONS = "pf_mc_project_application_decisions";

  var PROJECTS = [
    {
      id: "proj-001",
      clientName: "Acme Corp",
      orgType: "B2B",
      projectName: "Data migration readiness",
      submittedDate: "Mar 12, 2026",
      statusLabel: "Pending",
      projectDescription:
        "Assist with planning a phased data migration from legacy systems to cloud storage, including risk assessment and timeline.",
      clientContact: "Jane Doe — jane.doe@acmecorp.example — (555) 100-2000",
      interviewNotes:
        "Client has executive sponsor and realistic 10-week scope. Feasible for student team with TC support.",
    },
    {
      id: "proj-002",
      clientName: "Riverdale Logistics",
      orgType: "B2B",
      projectName: "Route optimization review",
      submittedDate: "Mar 10, 2026",
      statusLabel: "Pending",
      projectDescription:
        "Review current routing heuristics and recommend improvements for last-mile delivery with limited IT changes.",
      clientContact: "Chris Park — cpark@riverdalelogistics.example — (555) 220-0199",
      interviewNotes:
        "Scope fits one semester; data access agreements in progress. Strong client engagement.",
    },
    {
      id: "proj-003",
      clientName: "Bloom Retail Co.",
      orgType: "B2C",
      projectName: "Inventory dashboard",
      submittedDate: "Mar 8, 2026",
      statusLabel: "Pending",
      projectDescription:
        "Design a prototype dashboard for store-level stock accuracy and shrink visibility.",
      clientContact: "Priya Nair — pnair@bloomretail.example — (555) 330-4410",
      interviewNotes:
        "Clear problem statement; client can provide sample (anonymized) extracts for analysis.",
    },
    {
      id: "proj-004",
      clientName: "Northwind Analytics",
      orgType: "B2B",
      projectName: "Full ERP replacement",
      submittedDate: "Mar 5, 2026",
      statusLabel: "Pending",
      projectDescription:
        "Enterprise-wide ERP replacement with custom modules for manufacturing and finance.",
      clientContact: "Pat Lee — plee@northwind.example — (555) 900-1122",
      interviewNotes:
        "Scope far exceeds student capacity; sponsor open to phased discovery only.",
    },
    {
      id: "proj-005",
      clientName: "Green Leaf Co-op",
      orgType: "B2C",
      projectName: "Sustainability metrics",
      submittedDate: "Mar 4, 2026",
      statusLabel: "Pending",
      projectDescription:
        "Define KPIs and a simple reporting pack for supplier sustainability scores.",
      clientContact: "Sam Rivera — srivera@greenleaf.example — (555) 404-8080",
      interviewNotes:
        "Narrow analytics scope; good fit for BA-heavy team with one technical analyst.",
    },
    {
      id: "proj-006",
      clientName: "Harbor Tech",
      orgType: "B2B",
      projectName: "API integration blueprint",
      submittedDate: "Mar 2, 2026",
      statusLabel: "Pending",
      projectDescription:
        "Document integration points between CRM and billing APIs and produce a phased rollout plan.",
      clientContact: "Jordan Blake — jblake@harbortech.example — (555) 707-3030",
      interviewNotes:
        "Client has sandbox access; timeline aligns with term structure.",
    },
  ];

  var form = document.getElementById("ar-projects-form");
  var tbody = document.getElementById("ar-projects-tbody");
  var allTbody = document.getElementById("ar-all-projects-tbody");
  var emptyState = document.getElementById("ar-projects-empty");
  var tableWrap = document.getElementById("ar-projects-table-wrap");
  var statAccepted = document.getElementById("stat-accepted-projects");
  var statRejected = document.getElementById("stat-rejected-projects");
  var statPending = document.getElementById("stat-pending-projects");
  var dashboard = document.getElementById("ar-projects-dashboard");
  var detailSection = document.getElementById("ar-projects-detail");
  var detailTitle = document.getElementById("ar-detail-title");
  var detailMeta = document.getElementById("ar-detail-meta");
  var orgType = document.getElementById("org-type");
  var projDesc = document.getElementById("proj-desc");
  var clientContact = document.getElementById("client-contact");
  var interviewNotes = document.getElementById("interview-notes");
  var statusSelect = document.getElementById("project-decision");
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

  function saveDecision(projectId, decision) {
    var d = getDecisions();
    d[projectId] = decision;
    localStorage.setItem(STORAGE_DECISIONS, JSON.stringify(d));
  }

  function pendingProjects() {
    var decisions = getDecisions();
    return PROJECTS.filter(function (p) {
      return !decisions[p.id];
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

  function displayStatus(id) {
    var decisions = getDecisions();
    var v = decisions[id];
    if (v === "accept") return "Accepted";
    if (v === "reject") return "Rejected";
    return "Pending";
  }

  function renderStats() {
    var pending = pendingProjects().length;
    var c = counts();
    if (statPending) statPending.textContent = String(pending);
    if (statAccepted) statAccepted.textContent = String(c.accepted);
    if (statRejected) statRejected.textContent = String(c.rejected);
  }

  function findProject(id) {
    for (var i = 0; i < PROJECTS.length; i++) {
      if (PROJECTS[i].id === id) return PROJECTS[i];
    }
    return null;
  }

  function fillProjectForm(p) {
    if (!p) return;
    if (orgType) orgType.value = p.orgType;
    if (projDesc) projDesc.value = p.projectDescription;
    if (clientContact) clientContact.value = p.clientContact;
    if (interviewNotes) interviewNotes.value = p.interviewNotes;
  }

  function renderDetail() {
    if (!detailSection || !detailTitle) return;
    var p = selectedId ? findProject(selectedId) : null;
    if (!p) {
      detailSection.hidden = true;
      return;
    }
    detailSection.hidden = false;
    detailTitle.textContent = "Selected project: " + p.clientName;
    if (detailMeta) {
      detailMeta.innerHTML =
        "<dt class=\"hint\">Project</dt><dd style=\"margin:0;\">" +
        escapeHtml(p.projectName) +
        "</dd>" +
        "<dt class=\"hint\">Submitted</dt><dd style=\"margin:0;\">" +
        escapeHtml(p.submittedDate) +
        "</dd>";
    }
  }

  function selectProject(id) {
    selectedId = id;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.classList.toggle("data-table-row--selected", tr.dataset.projectId === id);
    });
    if (statusSelect) statusSelect.value = "";
    var p = findProject(id);
    fillProjectForm(p);
    renderDetail();
  }

  function renderAllApplicationsTable() {
    if (!allTbody) return;
    allTbody.innerHTML = "";
    PROJECTS.forEach(function (p) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(p.clientName) + "</td>" +
        "<td>" + escapeHtml(p.orgType) + "</td>" +
        "<td>" + escapeHtml(p.projectName) + "</td>" +
        "<td>" + escapeHtml(displayStatus(p.id)) + "</td>";
      allTbody.appendChild(tr);
    });
  }

  function renderTable() {
    var list = pendingProjects();
    tbody.innerHTML = "";
    renderStats();
    renderAllApplicationsTable();

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

    list.forEach(function (p) {
      var tr = document.createElement("tr");
      tr.dataset.projectId = p.id;
      tr.setAttribute("role", "button");
      tr.setAttribute("tabindex", "0");
      tr.innerHTML =
        "<td>" + escapeHtml(p.clientName) + "</td>" +
        "<td>" + escapeHtml(p.orgType) + "</td>" +
        "<td>" + escapeHtml(p.projectName) + "</td>" +
        "<td>" + escapeHtml(p.statusLabel) + "</td>";
      tr.addEventListener("click", function () {
        selectProject(p.id);
      });
      tr.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectProject(p.id);
        }
      });
      tbody.appendChild(tr);
    });

    selectProject(list[0].id);
  }

  function buildConfirmationUrl() {
    var btn = form.querySelector('button[type="submit"]');
    var title = (btn && btn.getAttribute("data-confirm-title")) || "Saved";
    var message = (btn && btn.getAttribute("data-confirm-message")) || "";
    var returnUrl = form.getAttribute("data-confirm-return") || "accept-reject-project.html";
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
