const loginScreen = document.querySelector("#login-screen");
const adminShell = document.querySelector("#admin-shell");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const targetSelect = document.querySelector("#target-select");
const currentTarget = document.querySelector("#current-target");
const syncToFeishu = document.querySelector("#sync-to-feishu");
const sessionStatus = document.querySelector("#session-status");
const sessionsTable = document.querySelector("#sessions-table");
const contextFiles = document.querySelector("#context-files");
const emptyState = document.querySelector("#empty-state");
const rawCommandForm = document.querySelector("#raw-command-form");
const rawCommandInput = document.querySelector("#raw-command");
const commandResult = document.querySelector("#command-result");
const refreshButton = document.querySelector("#refresh-button");

let targets = [];
let currentTargetKey = localStorage.getItem("pi-gateway-admin-target") ?? "";

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";
  const password = new FormData(loginForm).get("password")?.toString() ?? "";
  const response = await apiFetch("./api/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    loginMessage.textContent = "密码不正确。";
    return;
  }

  await showAdmin();
});

targetSelect?.addEventListener("change", async () => {
  currentTargetKey = targetSelect.value;
  localStorage.setItem("pi-gateway-admin-target", currentTargetKey);
  renderCurrentTarget();
  await loadSessions();
});

refreshButton?.addEventListener("click", () => {
  void loadSessions();
});

rawCommandForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runRawCommand(rawCommandInput.value);
});

void boot();

async function boot() {
  const response = await fetch("./api/me");
  if (response.ok) {
    await showAdmin();
  }
}

async function showAdmin() {
  loginScreen.classList.add("is-hidden");
  adminShell.classList.remove("is-hidden");
  await loadBootstrap();
  await loadSessions();
}

async function loadBootstrap() {
  const response = await apiFetch("./api/bootstrap");
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  targets = Array.isArray(data.targets) ? data.targets : [];
  const validCurrent = targets.some((target) => target.key === currentTargetKey);
  currentTargetKey = validCurrent ? currentTargetKey : data.defaultTargetKey ?? "";
  renderTargetOptions();
  renderCurrentTarget();
}

async function loadSessions() {
  if (!currentTargetKey) {
    showEmptyState(true);
    return;
  }

  showEmptyState(false);
  const response = await apiFetch(`./api/pages/sessions?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    commandResult.textContent = data.message ?? "读取失败。";
    return;
  }

  const data = await response.json();
  renderSessionStatus(data.status);
  renderSessionsTable(data.sessions ?? []);
  renderContextFiles(data.contextFiles ?? []);
}

async function runRawCommand(command) {
  if (!currentTargetKey) {
    commandResult.textContent = "请先选择私聊或群聊。";
    return;
  }
  const response = await apiFetch("./api/command", {
    method: "POST",
    body: JSON.stringify({
      targetKey: currentTargetKey,
      command,
      syncToFeishu: syncToFeishu.checked,
    }),
  });
  const data = await response.json().catch(() => ({}));
  commandResult.textContent = data.output ?? data.message ?? "执行失败。";
  await loadSessions();
}

function renderTargetOptions() {
  targetSelect.innerHTML = "";
  for (const target of targets) {
    const option = document.createElement("option");
    option.value = target.key;
    option.textContent = target.label;
    targetSelect.append(option);
  }
  targetSelect.value = currentTargetKey;
}

function renderCurrentTarget() {
  const target = targets.find((item) => item.key === currentTargetKey);
  currentTarget.textContent = target ? target.label : "未选择";
}

function renderSessionStatus(status) {
  const items = [
    ["当前状态", status?.running ? "运行中" : "空闲"],
    ["当前模型", status?.currentModel ?? "未知"],
    ["最近活动", formatDateTime(status?.lastActiveAt)],
    ["已加载上下文", `${status?.contextCount ?? 0} 项`],
  ];
  sessionStatus.innerHTML = "";
  for (const [label, value] of items) {
    const cell = document.createElement("div");
    cell.className = "status-cell";
    cell.innerHTML = `<span></span><strong></strong>`;
    cell.querySelector("span").textContent = label;
    cell.querySelector("strong").textContent = value;
    sessionStatus.append(cell);
  }
}

function renderSessionsTable(sessions) {
  sessionsTable.innerHTML = "";
  if (sessions.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4">当前还没有历史会话。</td>`;
    sessionsTable.append(row);
    return;
  }

  for (const session of sessions) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong></strong></td>
      <td></td>
      <td></td>
      <td><span class="badge"></span></td>
    `;
    row.querySelector("strong").textContent = session.title;
    row.children[1].textContent = String(session.messageCount ?? 0);
    row.children[2].textContent = formatDateTime(session.updatedAt);
    const badge = row.querySelector(".badge");
    badge.textContent = session.isActive ? "当前" : "历史";
    if (session.isActive) {
      badge.classList.add("green");
    }
    sessionsTable.append(row);
  }
}

function renderContextFiles(files) {
  contextFiles.innerHTML = "";
  if (files.length === 0) {
    const empty = document.createElement("span");
    empty.className = "chip";
    empty.textContent = "无";
    contextFiles.append(empty);
    return;
  }
  for (const file of files) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = file;
    contextFiles.append(chip);
  }
}

function showEmptyState(visible) {
  emptyState.classList.toggle("is-hidden", !visible);
  sessionStatus.classList.toggle("is-hidden", visible);
}

function formatDateTime(value) {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function apiFetch(url, options = {}) {
  return fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
}
