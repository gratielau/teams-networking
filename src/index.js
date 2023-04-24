//window.teams = []; //nu merge var teams[] din cauza la webpack
let allTeams = [];
let editId;

function getTeamsRequest() {
  return fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then((r) => {
    return r.json();
  });
}

function createTeamsRequest(team) {
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then((r) => r.json());
}

function deleteTeamRequest(id, callback) {
  console.info(arguments[1]);
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  }).then((r) =>
    r.json().then((status) => {
      console.warn("before removed ", status);
      if (typeof callback === "function") {
        callback(status);
      }
      return status;
    })
  );
}

function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then((r) => r.json());
}

//functie pura
function getTeamAsHTML(team) {
  const id = team.id;
  const url = team.url;
  let displayUrl = url;
  if (url.startsWith("https://")) {
    displayUrl = url.substring(8);
  }
  return `
    <tr>
        <td>${team.promotion}</td>
        <td>${team.members}</td>
        <td>${team.name}</td>
        <td><a href ="${url}" target="_blank"> ${displayUrl}</a></td>
        <td>
        <a data-id="${team.id}" class = "link-btn remove-btn">✖</a>
        <a data-id="${team.id}" class = "link-btn edit-btn" >&#9998;</a>
        </td>
    </tr>
    `;
}

let previewDisplayedTeams = [];
function showTeams(teams) {
  if (teams === previewDisplayedTeams) {
    console.info("same teams");
    return;
  }

  //previewDisplayedTeams = teams;
  if (teams.length === previewDisplayedTeams.length) {
    var eqContent = teams.every((team, i) => team === previewDisplayedTeams[i]);
    if (eqContent) {
      console.warn("same content");
      return;
    }
  }
  previewDisplayedTeams = teams;
  const html = teams.map(getTeamAsHTML);
  $("table tbody").innerHTML = html.join("");
}

function $(selector) {
  return document.querySelector(selector);
}

function formSubmit(e) {
  e.preventDefault();

  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("#name").value;
  const url = $("#url").value;

  const team = {
    promotion,
    members,
    name: name,
    url: url
  };

  if (editId) {
    team.id = editId;
    updateTeamRequest(team).then((status) => {
      if (status.success) {
        //v1
        //window.location.reload();
        //v2
        // loadTeams().then(() => {
        //   $("#editForm").reset();
        // });
        //v3
        ////allTeams = JSON.parse(JSON.stringify(allTeams)); deep clone (cloneaza tot array-ul si continutul, dar este costisitor)
        // allTeams = [...allTeams];
        // var oldTeam = allTeams.find((t) => t.id === team.id);
        // oldTeam.promotion = team.promotion;
        // oldTeam.members = team.members;
        // oldTeam.name = team.name;
        // oldTeam.url = team.url;

        // allTeams = allTeams.map((t) => {
        //   if (t.id == team.id) {
        //     return team;
        //   }
        //   return t;
        // });
        allTeams = allTeams.map((t) => {
          if (t.id == team.id) {
            return {
              ...t, //old props(eg. createdBy, CreatedAt)
              ...team //info
            };
          }
          return t;
        });
        showTeams(allTeams);
        $("#editForm").reset();
      }
    });
  } else {
    createTeamsRequest(team).then((status) => {
      if (status.success) {
        //v1
        //window.location.reload();
        //v2
        // loadTeams(() => {
        //   $("#editForm").reset();
        // });
        //V3
        team.id = status.id;
        //allTeams.push(team);
        allTeams = [...allTeams, team];
        showTeams(allTeams);
        $("#editForm").reset();
      }
    });
  }
}

function deleteTeam(id) {
  console.warn("delete", id);
  deleteTeamRequest(id, (status) => {
    console.warn("removed?", status);
  }).then((status) => {
    if (status.success) {
      loadTeams();
    }
  });
}

function startEditTeam(id) {
  editId = id;
  const team = allTeams.find((team) => team.id == id);

  $("#promotion").value = team.promotion;
  $("#members").value = team.members;
  $("#name").value = team.name;
  $("#url").value = team.url;
}

//functie pura
function searchTeams(teams, search) {
  search = search.toLowerCase();
  return teams.filter((team) => {
    return (
      team.members.toLowerCase().includes(search) ||
      team.promotion.toLowerCase().includes(search) ||
      team.name.toLowerCase().includes(search) ||
      team.url.toLowerCase().includes(search)
    );
  });
}

function initEvents() {
  var form = $("#editForm");
  form.addEventListener("submit", formSubmit);
  form.addEventListener("reset", () => {
    editId = undefined;
  });

  $("#search").addEventListener("input", (e) => {
    //const search = $("#search").value;
    const search = e.target.value;
    console.info("search", search);
    const teams = searchTeams(allTeams, search);

    showTeams(teams);
  });

  $("table tbody").addEventListener("click", (e) => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeam(id);
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      startEditTeam(id);
    }
  });
}

function loadTeams(cb) {
  return getTeamsRequest().then((teams) => {
    //window.teams = teams; // window.teams variabila globala se apeleaza asa pt ca au aceasi denumire
    allTeams = teams;
    showTeams(teams);
    if (typeof cb === "function") {
      cb();
    }
  });
}

//===start====
loadTeams();
initEvents();
