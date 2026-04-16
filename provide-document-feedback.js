/**
 * TC document feedback: pending drafts only; submitting final feedback removes
 * the draft from the queue (localStorage, same pattern as accept/reject flows).
 */
(function () {
  var STORAGE_COMPLETED = "pf_tc_document_feedback_completed";

  var DRAFTS = [
    {
      id: "doc-7781",
      submissionDate: "2026-04-04",
      projectId: "PRJ-402",
      documentId: "DOC-7781",
      fileName: "Charter_Draft_v2.docx",
    },
    {
      id: "doc-7802",
      submissionDate: "2026-04-02",
      projectId: "PRJ-410",
      documentId: "DOC-7802",
      fileName: "Report_Draft_v1.pdf",
    },
    {
      id: "doc-7810",
      submissionDate: "2026-03-28",
      projectId: "PRJ-415",
      documentId: "DOC-7810",
      fileName: "Requirements_outline.docx",
    },
    {
      id: "doc-7822",
      submissionDate: "2026-03-25",
      projectId: "PRJ-402",
      documentId: "DOC-7822",
      fileName: "Stakeholder_map_v1.pdf",
    },
  ];

  var form = document.getElementById("df-form");
  var tbody = document.getElementById("df-pending-tbody");
  var emptyState = document.getElementById("df-empty");
  var tableWrap = document.getElementById("df-table-wrap");
  var statPending = document.getElementById("df-stat-pending");
  var statSubmitted = document.getElementById("df-stat-submitted");
  var dashboard = document.getElementById("df-dashboard");
  var detailSection = document.getElementById("df-detail");
  var detailTitle = document.getElementById("df-detail-title");
  var detailMeta = document.getElementById("df-detail-meta");
  var tcFeedback = document.getElementById("tc-feedback");
  var selectedId = null;

  if (!form || !tbody) return;

  function readJsonArray(key) {
    try {
      var raw = localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function getCompleted() {
    return readJsonArray(STORAGE_COMPLETED);
  }

  function saveCompleted(draftId) {
    var arr = getCompleted();
    if (arr.indexOf(draftId) === -1) arr.push(draftId);
    localStorage.setItem(STORAGE_COMPLETED, JSON.stringify(arr));
  }

  function pendingDrafts() {
    var done = getCompleted();
    return DRAFTS.filter(function (d) {
      return done.indexOf(d.id) === -1;
    });
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function renderStats() {
    var pending = pendingDrafts().length;
    var submitted = getCompleted().length;
    if (statPending) statPending.textContent = String(pending);
    if (statSubmitted) statSubmitted.textContent = String(submitted);
  }

  function findDraft(id) {
    for (var i = 0; i < DRAFTS.length; i++) {
      if (DRAFTS[i].id === id) return DRAFTS[i];
    }
    return null;
  }

  function displayStatus(id) {
    return getCompleted().indexOf(id) !== -1 ? "Feedback submitted" : "Pending";
  }

  function renderDetail() {
    if (!detailSection || !detailTitle) return;
    var d = selectedId ? findDraft(selectedId) : null;
    if (!d) {
      detailSection.hidden = true;
      return;
    }
    detailSection.hidden = false;
    detailTitle.textContent = "Selected draft: " + d.documentId;
    if (detailMeta) {
      detailMeta.innerHTML =
        "<dt class=\"hint\">Project</dt><dd style=\"margin:0;\">" +
        escapeHtml(d.projectId) +
        "</dd>" +
        "<dt class=\"hint\">File</dt><dd style=\"margin:0;\">" +
        escapeHtml(d.fileName) +
        "</dd>" +
        "<dt class=\"hint\">Submitted</dt><dd style=\"margin:0;\">" +
        escapeHtml(d.submissionDate) +
        "</dd>" +
        "<dt class=\"hint\">Document</dt><dd style=\"margin:0;\"><a href=\"#\">Open / download</a></dd>";
    }
  }

  function selectDraft(id) {
    selectedId = id;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.classList.toggle("data-table-row--selected", tr.dataset.draftId === id);
    });
    if (tcFeedback) tcFeedback.value = "";
    renderDetail();
  }

  function renderAllTable() {
    var allTbody = document.getElementById("df-all-tbody");
    if (!allTbody) return;
    allTbody.innerHTML = "";
    DRAFTS.forEach(function (d) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(d.submissionDate) + "</td>" +
        "<td>" + escapeHtml(d.projectId) + "</td>" +
        "<td>" + escapeHtml(d.documentId) + "</td>" +
        "<td>" + escapeHtml(d.fileName) + "</td>" +
        "<td>" + escapeHtml(displayStatus(d.id)) + "</td>";
      allTbody.appendChild(tr);
    });
  }

  function renderTable() {
    var list = pendingDrafts();
    tbody.innerHTML = "";
    renderStats();
    renderAllTable();

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

    list.forEach(function (d) {
      var tr = document.createElement("tr");
      tr.dataset.draftId = d.id;
      tr.setAttribute("role", "button");
      tr.setAttribute("tabindex", "0");
      tr.innerHTML =
        "<td>" + escapeHtml(d.submissionDate) + "</td>" +
        "<td>" + escapeHtml(d.projectId) + "</td>" +
        "<td>" + escapeHtml(d.documentId) + "</td>" +
        "<td>" + escapeHtml(d.fileName) + "</td>" +
        "<td><a href=\"#\">Open / download</a></td>";
      tr.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        selectDraft(d.id);
      });
      tr.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectDraft(d.id);
        }
      });
      tbody.appendChild(tr);
    });

    selectDraft(list[0].id);
  }

  function buildConfirmationUrl(submitter) {
    var title = "Saved";
    var message = "";
    if (submitter) {
      title = submitter.getAttribute("data-confirm-title") || title;
      message = submitter.getAttribute("data-confirm-message") || "";
    }
    var returnUrl = form.getAttribute("data-confirm-return") || "provide-document-feedback.html";
    var params = new URLSearchParams();
    params.set("title", title);
    if (message) params.set("message", message);
    params.set("return", returnUrl);
    return "confirmation.html?" + params.toString();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selectedId) return;

    var submitter = e.submitter;
    var action = submitter && submitter.getAttribute("name") === "action" ? submitter.value : "submit";

    if (action === "draft") {
      window.location.href = buildConfirmationUrl(submitter);
      return;
    }

    if (typeof form.checkValidity === "function" && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    saveCompleted(selectedId);
    window.location.href = buildConfirmationUrl(submitter);
  });

  renderTable();
})();
