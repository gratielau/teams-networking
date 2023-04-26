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
function getTeamAsHTML({ id, url, promotion, members, name }) {
  let displayUrl = url;
  if (url.startsWith("https://")) {
    displayUrl = url.substring(8);
  }
  return `
    <tr>
        <td>${promotion}</td>
        <td>${members}</td>
        <td>${name}</td>
        <td><a href ="${url}" target="_blank"> ${displayUrl}</a></td>
        <td>
        <a data-id="${id}" class = "link-btn remove-btn">✖</a>
        <a data-id="${id}" class = "link-btn edit-btn" >&#9998;</a>
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
    createTeamsRequest(team).then(({ success, id }) => {
      if (success) {
        //v1
        //window.location.reload();
        //v2
        // loadTeams(() => {
        //   $("#editForm").reset();
        // });
        //V3
        team.id = id;
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

function startEditTeam(edit) {
  editId = edit;
  //const team = allTeams.find((team) => team.id == id);
  const { promotion, members, name, url } = allTeams.find(({ id }) => id === edit);

  $("#promotion").value = promotion;
  $("#members").value = members;
  $("#name").value = name;
  $("#url").value = url;
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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

sleep(3000).then(() => {
  console.info("redy to do %o", "next job");
});
//===start====
loadTeams();
initEvents();
