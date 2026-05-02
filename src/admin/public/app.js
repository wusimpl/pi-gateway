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
const refreshButton = document.querySelector("#refresh-button");
const navItems = document.querySelectorAll("[data-page]");
const pageViews = document.querySelectorAll("[data-page-view]");
const routeEnabled = document.querySelector("#route-enabled");
const modelRouter = document.querySelector("#model-router");
const modelLight = document.querySelector("#model-light");
const modelHeavy = document.querySelector("#model-heavy");
const availableModels = document.querySelector("#available-models");
const settingStream = document.querySelector("#setting-stream");
const settingSttProvider = document.querySelector("#setting-stt-provider");
const settingReaction = document.querySelector("#setting-reaction");
const settingToolcalls = document.querySelector("#setting-toolcalls");
const settingSkillFolder = document.querySelector("#setting-skill-folder");
const cronRefreshButton = document.querySelector("#cron-refresh-button");
const cronCount = document.querySelector("#cron-count");
const cronTable = document.querySelector("#cron-table");
const groupPolicy = document.querySelector("#group-policy");
const groupMode = document.querySelector("#group-mode");
const groupPolicyBadge = document.querySelector("#group-policy-badge");
const groupKeywordForm = document.querySelector("#group-keyword-form");
const groupKeywords = document.querySelector("#group-keywords");
const groupKeywordChips = document.querySelector("#group-keyword-chips");
const groupKeywordsClear = document.querySelector("#group-keywords-clear");
const groupAllowlist = document.querySelector("#group-allowlist");
const groupAllowlistAdd = document.querySelector("#group-allowlist-add");
const groupAllowlistRemove = document.querySelector("#group-allowlist-remove");
const toolsCount = document.querySelector("#tools-count");
const toolsList = document.querySelector("#tools-list");
const controlStatus = document.querySelector("#control-status");
const controlRunning = document.querySelector("#control-running");
const controlDraining = document.querySelector("#control-draining");
const controlStop = document.querySelector("#control-stop");
const controlNext = document.querySelector("#control-next");
const controlRestart = document.querySelector("#control-restart");
const skillsRefreshButton = document.querySelector("#skills-refresh-button");
const skillsCount = document.querySelector("#skills-count");
const skillsList = document.querySelector("#skills-list");
const skillsUsageList = document.querySelector("#skills-usage-list");

let targets = [];
let currentTargetKey = localStorage.getItem("pi-gateway-admin-target") ?? "";
let currentPage = "sessions";
let lastModelsData = null;

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
  await loadCurrentPage();
});

refreshButton?.addEventListener("click", () => {
  void loadSessions();
});

cronRefreshButton?.addEventListener("click", () => {
  void loadCron();
});

cronTable?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-cron-action]");
  if (!button) {
    return;
  }
  const jobId = button.dataset.jobId;
  const action = button.dataset.cronAction;
  if (!jobId || !action) {
    return;
  }
  if (action === "remove" && !confirm("删除后这个任务不会继续运行。")) {
    return;
  }
  const command = action === "run"
    ? `/cron run ${jobId}`
    : action === "pause"
      ? `/cron pause ${jobId}`
      : action === "resume"
        ? `/cron resume ${jobId}`
        : action === "stop"
          ? `/cron stop ${jobId}`
          : `/cron remove ${jobId}`;
  await runRawCommand(command);
});

groupPolicy?.addEventListener("change", async () => {
  await runRawCommand(`/group policy ${groupPolicy.value}`);
});

groupMode?.addEventListener("change", async () => {
  await runRawCommand(`/group mode ${groupMode.value}`);
});

groupKeywordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const keywords = splitKeywords(groupKeywords.value);
  if (keywords.length === 0) {
    alert("请输入关键词，或使用清空关键词。");
    return;
  }
  await runRawCommand(`/group keywords set ${keywords.join(" ")}`);
});

groupKeywordsClear?.addEventListener("click", async () => {
  if (!confirm("清空后当前群不会再用关键词触发。")) {
    return;
  }
  await runRawCommand("/group keywords clear");
});

groupAllowlistAdd?.addEventListener("click", async () => {
  await runRawCommand("/group allowlist add here");
});

groupAllowlistRemove?.addEventListener("click", async () => {
  if (!confirm("移出后当前群在白名单策略下不会响应。")) {
    return;
  }
  await runRawCommand("/group allowlist remove here");
});

toolsList?.addEventListener("change", async (event) => {
  const input = event.target.closest("[data-tool-name]");
  if (!input) {
    return;
  }
  const toolName = input.dataset.toolName;
  if (!toolName) {
    return;
  }
  await runRawCommand(input.checked ? `/tools on ${toolName}` : `/tools off ${toolName}`);
});

controlStop?.addEventListener("click", async () => {
  await runRawCommand("/stop");
});

controlNext?.addEventListener("click", async () => {
  await runRawCommand("/next");
});

controlRestart?.addEventListener("click", async () => {
  if (!confirm("确认重启网关？")) {
    return;
  }
  await runRawCommand("/restart");
});

skillsRefreshButton?.addEventListener("click", () => {
  void loadSkills();
});

routeEnabled?.addEventListener("change", async () => {
  await runRawCommand(routeEnabled.checked ? "/route on" : "/route off");
});

settingStream?.addEventListener("change", async () => {
  await runRawCommand(settingStream.checked ? "/stream on" : "/stream off");
});

settingSttProvider?.addEventListener("change", async () => {
  await runRawCommand(`/stt provider ${settingSttProvider.value}`);
});

settingReaction?.addEventListener("change", async () => {
  await runRawCommand(settingReaction.checked ? "/reaction on" : "/reaction off");
});

settingToolcalls?.addEventListener("change", async () => {
  await runRawCommand(`/toolcalls ${settingToolcalls.value}`);
});

settingSkillFolder?.addEventListener("change", async () => {
  await runRawCommand(settingSkillFolder.checked ? "/skill-folder on" : "/skill-folder off");
});

for (const item of navItems) {
  item.addEventListener("click", async () => {
    if (item.disabled) {
      return;
    }
    currentPage = item.dataset.page ?? "sessions";
    renderPageVisibility();
    window.scrollTo(0, 0);
    await loadCurrentPage();
  });
}

for (const [slot, select] of [
  ["router", modelRouter],
  ["light", modelLight],
  ["heavy", modelHeavy],
]) {
  select?.addEventListener("change", async () => {
    if (!select.value) {
      return;
    }
    await runRawCommand(`/model ${slot} ${select.value}`);
  });
}

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
  renderPageVisibility();
  await loadCurrentPage();
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
    alert(data.message ?? "读取失败。");
    return;
  }

  const data = await response.json();
  renderSessionStatus(data.status);
  renderSessionsTable(data.sessions ?? []);
  renderContextFiles(data.contextFiles ?? []);
}

async function loadModels() {
  if (!currentTargetKey) {
    alert("请先选择私聊或群聊。");
    return;
  }

  const response = await apiFetch(`./api/pages/models?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.message ?? "读取失败。");
    return;
  }

  lastModelsData = await response.json();
  renderModels(lastModelsData);
}

async function loadCurrentPage() {
  if (currentPage === "models") {
    await loadModels();
    return;
  }
  if (currentPage === "settings") {
    await loadSettings();
    return;
  }
  if (currentPage === "cron") {
    await loadCron();
    return;
  }
  if (currentPage === "group") {
    await loadGroup();
    return;
  }
  if (currentPage === "tools") {
    await loadTools();
    return;
  }
  if (currentPage === "control") {
    await loadControl();
    return;
  }
  if (currentPage === "skills") {
    await loadSkills();
    return;
  }
  await loadSessions();
}

async function runRawCommand(command) {
  if (!currentTargetKey) {
    alert("请先选择私聊或群聊。");
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
  if (!response.ok) {
    alert(data.message ?? "操作失败。");
    return;
  }
  await loadCurrentPage();
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
  const target = getCurrentTarget();
  currentTarget.textContent = target ? target.label : "未选择";
  renderNavigationAvailability(target);
}

function getCurrentTarget() {
  return targets.find((item) => item.key === currentTargetKey);
}

function renderNavigationAvailability(target) {
  for (const item of navItems) {
    if (item.dataset.page !== "group") {
      continue;
    }
    const enabled = target?.kind === "group";
    item.hidden = !enabled;
    item.disabled = !enabled;
    if (!enabled && currentPage === "group") {
      currentPage = "sessions";
    }
  }
  renderPageVisibility();
}

function renderPageVisibility() {
  for (const item of navItems) {
    item.classList.toggle("is-active", item.dataset.page === currentPage);
  }
  for (const view of pageViews) {
    view.classList.toggle("is-hidden", view.dataset.pageView !== currentPage);
  }
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

function renderModels(data) {
  routeEnabled.checked = data.routeEnabled === true;
  renderModelSelect(modelRouter, data.availableModels ?? [], data.routeModels?.router);
  renderModelSelect(modelLight, data.availableModels ?? [], data.routeModels?.light);
  renderModelSelect(modelHeavy, data.availableModels ?? [], data.routeModels?.heavy);
  renderAvailableModels(data.availableModels ?? []);
}

async function loadSettings() {
  if (!currentTargetKey) {
    alert("请先选择私聊或群聊。");
    return;
  }

  const response = await apiFetch(`./api/pages/settings?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.message ?? "读取失败。");
    return;
  }

  renderSettings(await response.json());
}

function renderSettings(data) {
  settingStream.checked = data.streamingEnabled === true;
  settingSttProvider.value = data.audioTranscribeProvider ?? "whisper";
  settingReaction.checked = data.processingReactionEnabled === true;
  settingToolcalls.value = data.toolCallsDisplayMode ?? "off";
  settingSkillFolder.checked = data.skillFolderEnabled === true;
}

async function loadCron() {
  if (!currentTargetKey) {
    alert("请先选择私聊或群聊。");
    return;
  }

  const response = await apiFetch(`./api/pages/cron?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.message ?? "读取失败。");
    return;
  }

  renderCron(await response.json());
}

function renderCron(data) {
  const jobs = data.jobs ?? [];
  cronCount.textContent = data.enabled === false ? "未开启" : `${jobs.length} 个任务`;
  cronTable.innerHTML = "";
  if (data.enabled === false) {
    appendCronEmptyRow("当前没有开启定时任务。");
    return;
  }
  if (jobs.length === 0) {
    appendCronEmptyRow("当前目标没有定时任务。");
    return;
  }

  for (const job of jobs) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong></strong><br /><span></span></td>
      <td></td>
      <td><span class="badge"></span></td>
      <td><div class="table-actions"></div></td>
    `;
    row.querySelector("strong").textContent = job.name || job.id;
    row.querySelector("td span").textContent = job.id;
    row.children[1].textContent = job.runningAtMs ? "运行中" : formatTimestamp(job.nextRunAtMs);
    const badge = row.querySelector(".badge");
    const status = resolveCronStatus(job);
    badge.textContent = status.label;
    if (status.className) {
      badge.classList.add(status.className);
    }
    const actions = row.querySelector(".table-actions");
    if (job.enabled) {
      actions.append(createCronActionButton("pause", job.id, "停止"));
    } else {
      actions.append(createCronActionButton("resume", job.id, "启动"));
    }
    actions.append(createCronActionButton("run", job.id, "运行"));
    if (job.runningAtMs) {
      actions.append(createCronActionButton("stop", job.id, "终止执行"));
    }
    actions.append(createCronActionButton("remove", job.id, "删除"));
    cronTable.append(row);
  }
}

function appendCronEmptyRow(text) {
  const row = document.createElement("tr");
  row.innerHTML = `<td colspan="4"></td>`;
  row.querySelector("td").textContent = text;
  cronTable.append(row);
}

function createCronActionButton(action, jobId, label) {
  const button = document.createElement("button");
  button.className = action === "remove" ? "button subtle danger" : "button subtle";
  button.type = "button";
  button.dataset.cronAction = action;
  button.dataset.jobId = jobId;
  button.textContent = label;
  button.setAttribute("aria-label", label);
  button.title = label;
  return button;
}

function resolveCronStatus(job) {
  if (job.runningAtMs) {
    return { label: "正在运行", className: "amber" };
  }
  if (!job.enabled) {
    return { label: "已暂停", className: "" };
  }
  if (job.lastRunStatus === "error") {
    return { label: "上次失败", className: "red" };
  }
  return { label: "等待运行", className: "green" };
}

async function loadGroup() {
  if (!currentTargetKey) {
    alert("请先选择私聊或群聊。");
    return;
  }

  const response = await apiFetch(`./api/pages/group?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.message ?? "读取失败。");
    return;
  }

  renderGroup(await response.json());
}

function renderGroup(data) {
  const keywords = data.keywords ?? [];
  groupPolicy.value = data.policy ?? "disabled";
  groupMode.value = data.mode ?? "mention";
  groupKeywords.value = keywords.join(" ");
  renderGroupPolicyBadge(data.policy);
  renderGroupKeywords(keywords);
  renderGroupAllowlist(data);
}

function renderGroupPolicyBadge(policy) {
  const status = policy === "open"
    ? { label: "所有群可用", className: "green" }
    : policy === "allowlist"
      ? { label: "白名单可用", className: "amber" }
      : { label: "已关闭", className: "red" };
  groupPolicyBadge.className = "badge";
  groupPolicyBadge.textContent = status.label;
  groupPolicyBadge.classList.add(status.className);
}

function renderGroupKeywords(keywords) {
  groupKeywordChips.innerHTML = "";
  if (keywords.length === 0) {
    const empty = document.createElement("span");
    empty.className = "chip";
    empty.textContent = "无关键词";
    groupKeywordChips.append(empty);
    return;
  }
  for (const keyword of keywords) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = keyword;
    groupKeywordChips.append(chip);
  }
}

function renderGroupAllowlist(data) {
  groupAllowlist.innerHTML = "";
  const current = document.createElement("div");
  current.className = "data-item";
  current.innerHTML = `<div><strong>当前群</strong><span></span></div><span class="badge"></span>`;
  current.querySelector("span").textContent = data.chatId ?? "--";
  const currentBadge = current.querySelector(".badge");
  currentBadge.textContent = data.currentInAllowlist ? "已加入" : "未加入";
  currentBadge.classList.add(data.currentInAllowlist ? "green" : "red");
  groupAllowlist.append(current);

  const otherChatIds = (data.allowlist ?? []).filter((chatId) => chatId !== data.chatId);
  for (const chatId of otherChatIds) {
    const item = document.createElement("div");
    item.className = "data-item";
    item.innerHTML = `<div><strong>已加入的群</strong><span></span></div><span class="badge green">已加入</span>`;
    item.querySelector("span").textContent = chatId;
    groupAllowlist.append(item);
  }
}

async function loadTools() {
  if (!currentTargetKey) {
    alert("请先选择私聊或群聊。");
    return;
  }

  const response = await apiFetch(`./api/pages/tools?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.message ?? "读取失败。");
    return;
  }

  renderTools(await response.json());
}

function renderTools(data) {
  const tools = data.tools ?? [];
  toolsCount.textContent = data.supported === false ? "不可配置" : `${data.enabledCount ?? 0} 个启用`;
  toolsList.innerHTML = "";
  if (data.supported === false) {
    appendToolsMessage("当前会话不支持工具配置。");
    return;
  }
  if (tools.length === 0) {
    appendToolsMessage("当前会话没有可配置的工具。");
    return;
  }

  for (const tool of tools) {
    const item = document.createElement("label");
    item.className = "setting-item";
    item.innerHTML = `
      <span>
        <strong></strong>
        <small></small>
      </span>
      <input class="switch-input" type="checkbox" />
    `;
    item.querySelector("strong").textContent = tool.name;
    item.querySelector("small").textContent = tool.description || "暂无说明";
    const checkbox = item.querySelector("input");
    checkbox.checked = tool.enabled === true;
    checkbox.dataset.toolName = tool.name;
    checkbox.setAttribute("aria-label", `${tool.enabled ? "停用" : "启用"} ${tool.name}`);
    toolsList.append(item);
  }
}

function appendToolsMessage(text) {
  const item = document.createElement("div");
  item.className = "data-item";
  item.textContent = text;
  toolsList.append(item);
}

async function loadControl() {
  if (!currentTargetKey) {
    alert("请先选择私聊或群聊。");
    return;
  }

  const response = await apiFetch(`./api/pages/control?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.message ?? "读取失败。");
    return;
  }

  renderControl(await response.json());
}

function renderControl(data) {
  const running = data.running === true;
  const draining = data.draining === true;
  controlStatus.className = "badge";
  if (draining) {
    controlStatus.textContent = "重启中";
    controlStatus.classList.add("amber");
  } else if (running) {
    controlStatus.textContent = "运行中";
    controlStatus.classList.add("green");
  } else {
    controlStatus.textContent = "空闲";
  }
  controlRunning.textContent = running ? "运行中" : "空闲";
  controlDraining.textContent = draining ? "正在重启" : "正常";
}

async function loadSkills() {
  if (!currentTargetKey) {
    alert("请先选择私聊或群聊。");
    return;
  }

  const response = await apiFetch(`./api/pages/skills?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.message ?? "读取失败。");
    return;
  }

  renderSkills(await response.json());
}

function renderSkills(data) {
  const skills = data.skills ?? [];
  skillsCount.textContent = `${skills.length} 个可用`;
  skillsList.innerHTML = "";
  skillsUsageList.innerHTML = "";

  if (skills.length === 0) {
    appendDataMessage(skillsList, "当前会话没有加载技能。");
  } else {
    for (const group of groupSkillsByFolder(skills)) {
      const details = document.createElement("details");
      details.className = "skill-group";
      details.open = true;
      details.innerHTML = `
        <summary>
          <span>
            <strong></strong>
            <small></small>
          </span>
          <span class="badge"></span>
        </summary>
        <div class="skill-group-list"></div>
      `;
      details.querySelector("strong").textContent = group.name;
      details.querySelector("small").textContent = group.path;
      details.querySelector(".badge").textContent = `${group.skills.length} 个`;
      const groupList = details.querySelector(".skill-group-list");
      for (const skill of group.skills) {
        const item = document.createElement("div");
        item.className = "data-item";
        item.innerHTML = `<div><strong></strong><span></span></div><span class="badge green">可用</span>`;
        item.querySelector("strong").textContent = skill.name;
        item.querySelector("span").textContent = formatSkillPath(skill.path, skill.scope, group.path);
        groupList.append(item);
      }
      skillsList.append(details);
    }
  }

  const usage = data.usage ?? [];
  if (data.statsEnabled === false) {
    appendDataMessage(skillsUsageList, "当前没有启用技能使用统计。");
    return;
  }
  if (usage.length === 0) {
    appendDataMessage(skillsUsageList, "当前没有技能使用记录。");
    return;
  }
  for (const record of usage) {
    const item = document.createElement("div");
    item.className = "data-item";
    item.innerHTML = `<div><strong></strong><span></span></div><span class="badge"></span>`;
    item.querySelector("strong").textContent = record.name;
    item.querySelector("span").textContent = `最近使用：${formatDateTime(record.lastUsedAt)}`;
    item.querySelector(".badge").textContent = `${record.count} 次`;
    skillsUsageList.append(item);
  }
}

function groupSkillsByFolder(skills) {
  const groups = new Map();
  for (const skill of skills) {
    const folderPath = getSkillParentFolder(skill.path);
    const key = `${skill.scope ?? ""}:${folderPath}`;
    if (!groups.has(key)) {
      groups.set(key, {
        name: formatSkillGroupName(folderPath, skill.scope),
        path: folderPath,
        skills: [],
      });
    }
    groups.get(key).skills.push(skill);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      skills: group.skills.sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function getSkillParentFolder(path) {
  const normalized = path.replace(/\\/g, "/");
  const skillDir = normalized.endsWith("/SKILL.md")
    ? normalized.slice(0, -"/SKILL.md".length)
    : normalized;
  const index = skillDir.lastIndexOf("/");
  return index > 0 ? skillDir.slice(0, index) : skillDir;
}

function formatSkillGroupName(path, scope) {
  const folder = path.split("/").filter(Boolean).at(-1) ?? path;
  return scope ? `${formatScope(scope)} · ${folder}` : folder;
}

function formatSkillPath(path, scope, basePath) {
  const label = scope && !basePath ? `${formatScope(scope)} · ` : "";
  const displayPath = basePath && path.startsWith(`${basePath}/`) ? path.slice(basePath.length + 1) : path;
  return `${label}${displayPath}`;
}

function formatScope(scope) {
  if (scope === "user") {
    return "用户";
  }
  if (scope === "project") {
    return "项目";
  }
  if (scope === "temporary") {
    return "临时";
  }
  return scope;
}

function appendDataMessage(container, text) {
  const item = document.createElement("div");
  item.className = "data-item";
  item.textContent = text;
  container.append(item);
}

function renderModelSelect(select, models, selectedLabel) {
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "请选择模型";
  select.append(empty);
  for (const model of models) {
    const option = document.createElement("option");
    option.value = `${model.provider}/${model.id}`;
    option.textContent = model.label;
    select.append(option);
  }
  select.value = selectedLabel ?? "";
}

function renderAvailableModels(models) {
  availableModels.innerHTML = "";
  if (models.length === 0) {
    const empty = document.createElement("div");
    empty.className = "data-item";
    empty.textContent = "当前没有可用模型。";
    availableModels.append(empty);
    return;
  }
  for (const model of models) {
    const item = document.createElement("div");
    item.className = "data-item";
    item.innerHTML = `<div><strong></strong><span></span></div><span class="badge green">可用</span>`;
    item.querySelector("strong").textContent = `${model.provider}/${model.id}`;
    item.querySelector("span").textContent = model.name && model.name !== model.id ? model.name : `序号 ${model.order}`;
    availableModels.append(item);
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

function formatTimestamp(value) {
  if (!value) {
    return "--";
  }
  return formatDateTime(new Date(value).toISOString());
}

function splitKeywords(value) {
  const seen = new Set();
  const result = [];
  for (const item of value.split(/[,\s]+/)) {
    const keyword = item.trim();
    if (!keyword || seen.has(keyword)) {
      continue;
    }
    seen.add(keyword);
    result.push(keyword);
  }
  return result;
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
