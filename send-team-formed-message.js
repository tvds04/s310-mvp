/**
 * Send team formed message: teams awaiting email only; sending removes the team
 * from the queue (localStorage, same pattern as other MC task pages).
 */
(function () {
  var STORAGE_SENT = "pf_team_formed_message_sent";

  var TEAMS = [
    {
      id: "prj-402",
      projectId: "PRJ-402",
      client: "Acme Corp",
      teamFormed: "Apr 6, 2026",
      clientEmail: "jane.doe@acmecorp.example",
      participants:
        "Jordan Lee — jlee@university.example\nRiley Chen — rchen@university.example\nAlex Morgan — amorgan@university.example",
      messageBody:
        "Subject: Project Future — Your team is formed (PRJ-402)\n\nDear Acme Corp team and student participants,\n\nYour Project Future consulting team for PRJ-402 (Acme Corp Data Migration) is now officially formed.\n\nNext steps:\n1. Within one week, schedule a kickoff meeting with your client sponsor and Technology Consultant.\n2. Share agendas in advance and confirm roles (project lead, business analyst, technical analyst).\n3. Establish a recurring check-in cadence and document decisions in your shared workspace.\n\nWe are excited to see your work begin. Reply to this thread if you need scheduling support.\n\n— Project Future Managing Committee",
    },
    {
      id: "prj-410",
      projectId: "PRJ-410",
      client: "Bloom Retail",
      teamFormed: "Apr 1, 2026",
      clientEmail: "ops@bloomretail.example",
      participants:
        "Sam Patel — spatel@university.example\nMorgan Wu — mwu@university.example",
      messageBody:
        "Subject: Project Future — Your team is formed (PRJ-410)\n\nDear Bloom Retail team and student participants,\n\nYour Project Future consulting team for PRJ-410 (Bloom Retail Inventory) is now officially formed.\n\nNext steps:\n1. Within one week, schedule a kickoff meeting with your client sponsor and Technology Consultant.\n2. Share agendas in advance and confirm roles (project lead, business analyst, technical analyst).\n3. Establish a recurring check-in cadence and document decisions in your shared workspace.\n\nWe are excited to see your work begin. Reply to this thread if you need scheduling support.\n\n— Project Future Managing Committee",
    },
    {
      id: "prj-415",
      projectId: "PRJ-415",
      client: "River City Transit",
      teamFormed: "Mar 28, 2026",
      clientEmail: "planning@rivercitytransit.example",
      participants: "Casey Rivera — crivera@university.example\nTaylor Brooks — tbrooks@university.example",
      messageBody:
        "Subject: Project Future — Your team is formed (PRJ-415)\n\nDear River City Transit team and student participants,\n\nYour Project Future consulting team for PRJ-415 (River City Transit Scheduling) is now officially formed.\n\nNext steps:\n1. Within one week, schedule a kickoff meeting with your client sponsor and Technology Consultant.\n2. Share agendas in advance and confirm roles (project lead, business analyst, technical analyst).\n3. Establish a recurring check-in cadence and document decisions in your shared workspace.\n\nWe are excited to see your work begin. Reply to this thread if you need scheduling support.\n\n— Project Future Managing Committee",
    },
  ];

  var form = document.getElementById("stm-form");
  var tbody = document.getElementById("stm-pending-tbody");
  var emptyState = document.getElementById("stm-empty");
  var tableWrap = document.getElementById("stm-table-wrap");
  var statPending = document.getElementById("stm-stat-pending");
  var statSent = document.getElementById("stm-stat-sent");
  var dashboard = document.getElementById("stm-dashboard");
  var detailMeta = document.getElementById("stm-detail-meta");
  var clientName = document.getElementById("client-name");
  var clientEmail = document.getElementById("client-email");
  var participants = document.getElementById("participants");
  var messageBody = document.getElementById("message-body");
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

  function getSent() {
    return readJsonArray(STORAGE_SENT);
  }

  function saveSent(teamId) {
    var arr = getSent();
    if (arr.indexOf(teamId) === -1) arr.push(teamId);
    localStorage.setItem(STORAGE_SENT, JSON.stringify(arr));
  }

  function pendingTeams() {
    var sent = getSent();
    return TEAMS.filter(function (t) {
      return sent.indexOf(t.id) === -1;
    });
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function renderStats() {
    var p = pendingTeams().length;
    var s = getSent().length;
    if (statPending) statPending.textContent = String(p);
    if (statSent) statSent.textContent = String(s);
  }

  function findTeam(id) {
    for (var i = 0; i < TEAMS.length; i++) {
      if (TEAMS[i].id === id) return TEAMS[i];
    }
    return null;
  }

  function displayStatus(id) {
    return getSent().indexOf(id) !== -1 ? "Yes" : "No";
  }

  function renderAllTable() {
    var allTbody = document.getElementById("stm-all-tbody");
    if (!allTbody) return;
    allTbody.innerHTML = "";
    TEAMS.forEach(function (t) {
      var tr = document.createElement("tr");
      var sent = getSent().indexOf(t.id) !== -1;
      tr.innerHTML =
        "<td>" + escapeHtml(t.projectId) + "</td>" +
        "<td>" + escapeHtml(t.client) + "</td>" +
        "<td>" + escapeHtml(t.teamFormed) + "</td>" +
        "<td>" + (sent ? "Yes" : "No") + "</td>";
      allTbody.appendChild(tr);
    });
  }

  function fillForm(t) {
    if (!t) return;
    if (clientName) clientName.value = t.client;
    if (clientEmail) clientEmail.value = t.clientEmail;
    if (participants) participants.value = t.participants;
    if (messageBody) messageBody.value = t.messageBody;
    if (detailMeta) {
      detailMeta.innerHTML =
        "<dt class=\"hint\">Project</dt><dd style=\"margin:0;\">" +
        escapeHtml(t.projectId) +
        "</dd>" +
        "<dt class=\"hint\">Client</dt><dd style=\"margin:0;\">" +
        escapeHtml(t.client) +
        "</dd>" +
        "<dt class=\"hint\">Team formed</dt><dd style=\"margin:0;\">" +
        escapeHtml(t.teamFormed) +
        "</dd>";
    }
  }

  function selectTeam(id) {
    selectedId = id;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.classList.toggle("data-table-row--selected", tr.dataset.teamId === id);
    });
    fillForm(findTeam(id));
  }

  function renderTable() {
    var list = pendingTeams();
    tbody.innerHTML = "";
    renderStats();
    renderAllTable();

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

    list.forEach(function (t) {
      var tr = document.createElement("tr");
      tr.dataset.teamId = t.id;
      tr.setAttribute("role", "button");
      tr.setAttribute("tabindex", "0");
      tr.innerHTML =
        "<td>" + escapeHtml(t.projectId) + "</td>" +
        "<td>" + escapeHtml(t.client) + "</td>" +
        "<td>" + escapeHtml(t.teamFormed) + "</td>" +
        "<td>No</td>";
      tr.addEventListener("click", function () {
        selectTeam(t.id);
      });
      tr.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectTeam(t.id);
        }
      });
      tbody.appendChild(tr);
    });

    selectTeam(list[0].id);
  }

  function buildConfirmationUrl() {
    var btn = form.querySelector('button[type="submit"]');
    var title = (btn && btn.getAttribute("data-confirm-title")) || "Message sent";
    var message = (btn && btn.getAttribute("data-confirm-message")) || "";
    var returnUrl = form.getAttribute("data-confirm-return") || "send-team-formed-message.html";
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
    saveSent(selectedId);
    window.location.href = buildConfirmationUrl();
  });

  renderTable();
})();
