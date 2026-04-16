/**
 * Form Teams: assign students to projects with checkboxes; persisted in
 * localStorage so completed teams and placed students drop out of options.
 */
(function () {
  var STORAGE_TEAMS = "pf_form_teams_completed_team_ids";
  var STORAGE_STUDENTS = "pf_form_teams_placed_student_ids";

  var TEAMS = [
    {
      id: "prj-402",
      label: "PRJ-402 — Acme Corp Data Migration",
      client: "Acme Corp — jane.doe@acmecorp.example",
      projectId: "PRJ-402",
      info: "Phased migration plan, stakeholder map, and weekly checkpoints with TC.",
    },
    {
      id: "prj-410",
      label: "PRJ-410 — Bloom Retail Inventory",
      client: "Bloom Retail — ops@bloomretail.example",
      projectId: "PRJ-410",
      info: "Inventory accuracy dashboard, POS integration scope, and biweekly client syncs with TC.",
    },
    {
      id: "prj-415",
      label: "PRJ-415 — River City Transit Scheduling",
      client: "River City Transit — planning@rivercitytransit.example",
      projectId: "PRJ-415",
      info: "Route optimization prototype, rider data privacy review, and weekly TC checkpoints.",
    },
  ];

  var STUDENTS = [
    { id: "stu-001", name: "Jordan Lee", email: "jlee@university.example", info: "Senior · Finance" },
    { id: "stu-002", name: "Riley Chen", email: "rchen@university.example", info: "Sophomore · Accounting" },
    { id: "stu-003", name: "Sam Patel", email: "spatel@university.example", info: "Junior · MIS" },
    { id: "stu-004", name: "Alex Kim", email: "akim@university.example", info: "Senior · Operations" },
    { id: "stu-005", name: "Morgan Wu", email: "mwu@university.example", info: "Junior · Marketing" },
    { id: "stu-006", name: "Casey Rivera", email: "crivera@university.example", info: "Sophomore · Finance" },
    { id: "stu-007", name: "Taylor Brooks", email: "tbrooks@university.example", info: "Senior · Business Analytics" },
    { id: "stu-008", name: "Jamie Singh", email: "jsingh@university.example", info: "Junior · Supply Chain" },
  ];

  var form = document.getElementById("form-teams-form");
  var select = document.getElementById("select-project");
  var workspace = document.getElementById("form-teams-workspace");
  var actions = document.getElementById("form-teams-actions");
  var introHint = document.getElementById("form-teams-intro-hint");
  var noTeamsMsg = document.getElementById("form-teams-no-teams");
  var selectRow = document.getElementById("form-teams-select-row");
  var tbody = document.getElementById("form-teams-student-tbody");
  var noStudentsMsg = document.getElementById("form-teams-no-students");
  var errorBox = document.getElementById("form-teams-student-error");
  var clientDetails = document.getElementById("client-details");
  var projectIdDisplay = document.getElementById("project-id-display");
  var projectInfo = document.getElementById("project-info");

  if (!form || !select || !workspace || !tbody) return;

  function readJsonArray(key) {
    try {
      var raw = localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function getCompletedTeamIds() {
    return readJsonArray(STORAGE_TEAMS);
  }

  function getPlacedStudentIds() {
    return readJsonArray(STORAGE_STUDENTS);
  }

  function saveCompletedTeam(teamId) {
    var ids = getCompletedTeamIds();
    if (ids.indexOf(teamId) === -1) ids.push(teamId);
    localStorage.setItem(STORAGE_TEAMS, JSON.stringify(ids));
  }

  function savePlacedStudents(studentIds) {
    var placed = getPlacedStudentIds();
    studentIds.forEach(function (id) {
      if (placed.indexOf(id) === -1) placed.push(id);
    });
    localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(placed));
  }

  function availableTeams() {
    var done = getCompletedTeamIds();
    return TEAMS.filter(function (t) {
      return done.indexOf(t.id) === -1;
    });
  }

  function availableStudents() {
    var placed = getPlacedStudentIds();
    return STUDENTS.filter(function (s) {
      return placed.indexOf(s.id) === -1;
    });
  }

  function findTeam(id) {
    for (var i = 0; i < TEAMS.length; i++) {
      if (TEAMS[i].id === id) return TEAMS[i];
    }
    return null;
  }

  function fillTeamSelect() {
    var teams = availableTeams();
    var current = select.value;
    select.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "— Select —";
    select.appendChild(opt0);
    teams.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.label;
      select.appendChild(opt);
    });
    if (current && teams.some(function (t) { return t.id === current; })) {
      select.value = current;
    } else {
      select.value = "";
    }
  }

  function setError(msg) {
    if (!errorBox) return;
    if (msg) {
      errorBox.textContent = msg;
      errorBox.hidden = false;
    } else {
      errorBox.textContent = "";
      errorBox.hidden = true;
    }
  }

  function syncLeaderDisabled(row) {
    var onTeam = row.querySelector(".ft-on-team");
    var leader = row.querySelector(".ft-leader");
    if (!onTeam || !leader) return;
    leader.disabled = !onTeam.checked;
    if (!onTeam.checked) leader.checked = false;
  }

  function wireRow(row) {
    var onTeam = row.querySelector(".ft-on-team");
    var leader = row.querySelector(".ft-leader");
    if (!onTeam || !leader) return;
    onTeam.addEventListener("change", function () {
      syncLeaderDisabled(row);
      setError("");
    });
    leader.addEventListener("change", function () {
      if (!leader.checked) return;
      tbody.querySelectorAll(".ft-leader").forEach(function (cb) {
        if (cb !== leader) cb.checked = false;
      });
      setError("");
    });
  }

  function renderStudentRows() {
    tbody.innerHTML = "";
    var list = availableStudents();
    if (noStudentsMsg) noStudentsMsg.hidden = list.length > 0;

    list.forEach(function (s) {
      var tr = document.createElement("tr");
      tr.dataset.studentId = s.id;
      tr.innerHTML =
        "<td>" + escapeHtml(s.name) + "</td>" +
        "<td>" + escapeHtml(s.email) + "</td>" +
        "<td>" + escapeHtml(s.info) + "</td>" +
        '<td class="checkbox-col"><input type="checkbox" class="ft-on-team" name="on_team_' + s.id + '" aria-label="On team for ' + escapeAttr(s.name) + '"></td>' +
        '<td class="checkbox-col"><input type="checkbox" class="ft-leader" name="leader_' + s.id + '" aria-label="Team leader: ' + escapeAttr(s.name) + '" disabled></td>';
      tbody.appendChild(tr);
      wireRow(tr);
      syncLeaderDisabled(tr);
    });
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }

  function applyProject(option) {
    if (!option || !option.value) {
      workspace.hidden = true;
      if (actions) actions.hidden = true;
      if (introHint && availableTeams().length > 0) introHint.hidden = false;
      setError("");
      return;
    }
    var t = findTeam(option.value);
    if (!t) return;
    clientDetails.value = t.client;
    projectIdDisplay.value = t.projectId;
    projectInfo.value = t.info;
    workspace.hidden = false;
    if (actions) actions.hidden = false;
    if (introHint) introHint.hidden = true;
    renderStudentRows();
    setError("");
  }

  function updatePageState() {
    fillTeamSelect();
    var teamsLeft = availableTeams().length;
    if (noTeamsMsg) {
      noTeamsMsg.hidden = teamsLeft > 0;
    }
    if (selectRow) {
      selectRow.hidden = teamsLeft === 0;
    }
    if (teamsLeft === 0) {
      select.required = false;
      workspace.hidden = true;
      if (actions) actions.hidden = true;
      if (introHint) introHint.hidden = true;
      return;
    }
    select.required = true;
    if (select.value) {
      applyProject(select.selectedOptions[0]);
    } else {
      workspace.hidden = true;
      if (actions) actions.hidden = true;
      if (introHint) introHint.hidden = false;
    }
  }

  function buildConfirmationUrl() {
    var btn = form.querySelector('button[type="submit"]');
    var title = (btn && btn.getAttribute("data-confirm-title")) || "Saved";
    var message = (btn && btn.getAttribute("data-confirm-message")) || "";
    var returnUrl = form.getAttribute("data-confirm-return") || "form-teams.html";
    var params = new URLSearchParams();
    params.set("title", title);
    if (message) params.set("message", message);
    params.set("return", returnUrl);
    return "confirmation.html?" + params.toString();
  }

  select.addEventListener("change", function () {
    applyProject(select.selectedOptions[0]);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setError("");

    var teamId = select.value;
    if (!teamId) {
      setError("Select a project first.");
      return;
    }

    var rows = tbody.querySelectorAll("tr");
    var onTeamIds = [];
    var leaderId = null;

    rows.forEach(function (row) {
      var sid = row.dataset.studentId;
      var onTeam = row.querySelector(".ft-on-team");
      var leader = row.querySelector(".ft-leader");
      if (onTeam && onTeam.checked) {
        onTeamIds.push(sid);
        if (leader && leader.checked) leaderId = sid;
      }
    });

    if (onTeamIds.length === 0) {
      setError("Select at least one student for this team.");
      return;
    }

    if (leaderId === null) {
      setError("Select exactly one team leader from the students on this team.");
      return;
    }

    var leaderCount = 0;
    rows.forEach(function (row) {
      var onTeam = row.querySelector(".ft-on-team");
      var leader = row.querySelector(".ft-leader");
      if (onTeam && onTeam.checked && leader && leader.checked) leaderCount++;
    });
    if (leaderCount !== 1) {
      setError("Select exactly one team leader from the students on this team.");
      return;
    }

    saveCompletedTeam(teamId);
    savePlacedStudents(onTeamIds);

    window.location.href = buildConfirmationUrl();
  });

  updatePageState();
})();
