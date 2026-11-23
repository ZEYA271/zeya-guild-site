
const DATA_URL = "./data/alliance.json";

const number = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const format = (value) => number(value).toLocaleString("ko-KR");

const getValue = (obj, keys) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return null;
};

async function loadZEYA() {
  const status = document.getElementById("api-status");
  const updated = document.getElementById("updated");
  const roster = document.getElementById("roster");

  try {
    const response = await fetch(DATA_URL + "?t=" + Date.now());
    if (!response.ok) throw new Error("데이터 파일을 불러오지 못했습니다.");

    const data = await response.json();

    const members =
      data.members ||
      data.member_list ||
      data.players ||
      data.roster ||
      [];

    document.getElementById("power").textContent =
      format(data.power);

    document.getElementById("members-count").textContent =
      format(data.member_count ?? members.length);

    document.getElementById("kills").textContent = "별도 연동 필요";

    document.getElementById("level").textContent =
      data.level ?? "—";

    document.getElementById("api-status").textContent = "연결 성공";

    document.getElementById("roster-count").textContent =
      members.length + " MEMBERS";

    roster.replaceChildren();

    if (!members.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 6;
      td.className = "empty";
      td.textContent = "길드 기본 정보는 연결됐지만 길드원 목록은 데이터에서 찾지 못했습니다.";
      tr.appendChild(td);
      roster.appendChild(tr);
    } else {
      members.forEach((member, index) => {
        const name = getValue(member, ["name", "nickname", "player_name", "username"]) ?? "이름 없음";
        const power = getValue(member, ["power", "total_power", "combat_power"]);
        const kills = getValue(member, ["kills", "kill_count", "total_kills"]);
        const level = getValue(member, ["level", "castle_level", "hq_level"]);
        const activity = getValue(member, ["weekly_activity", "activity", "activity_score"]);

        const tr = document.createElement("tr");

        [index + 1, name, power === null ? "—" : format(power),
          kills === null ? "—" : format(kills),
          level === null ? "—" : level,
          activity === null ? "—" : format(activity)
        ].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });

        roster.appendChild(tr);
      });
    }

    if (updated) {
      updated.textContent = "마지막 데이터 확인: " + new Date().toLocaleString("ko-KR");
    }

    const search = document.getElementById("search");
    if (search) {
      search.oninput = () => {
        const query = search.value.toLowerCase();
        [...roster.rows].forEach((row) => {
          row.hidden = !row.textContent.toLowerCase().includes(query);
        });
      };
    }

    const sort = document.getElementById("sort");
    if (sort) {
      sort.onchange = () => {
        const rows = [...roster.rows];
        const column = sort.value === "name" ? 1 : sort.value === "kills" ? 3 : 2;

        rows.sort((a, b) => {
          if (column === 1) {
            return a.cells[column].textContent.localeCompare(
              b.cells[column].textContent, "ko"
            );
          }
          return number(b.cells[column].textContent.replaceAll(",", "")) -
                 number(a.cells[column].textContent.replaceAll(",", ""));
        });

        rows.forEach((row) => roster.appendChild(row));
      };
    }

  } catch (error) {
    if (status) status.textContent = "데이터 확인 필요";
    if (updated) updated.textContent = error.message;
    console.error(error);
  }
}

const refreshButton = document.getElementById("refresh");
if (refreshButton) refreshButton.addEventListener("click", loadZEYA);

loadZEYA();
