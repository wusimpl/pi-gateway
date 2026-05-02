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
const navItems = document.querySelectorAll("[data-page]");
const pageViews = document.querySelectorAll("[data-page-view]");
const routeEnabled = document.querySelector("#route-enabled");
const modelSummary = document.querySelector("#model-summary");
const modelRouter = document.querySelector("#model-router");
const modelLight = document.querySelector("#model-light");
const modelHeavy = document.querySelector("#model-heavy");
const availableModels = document.querySelector("#available-models");
const modelCommandForm = document.querySelector("#model-command-form");
const modelCommandInput = document.querySelector("#model-command");
const modelCommandResult = document.querySelector("#model-command-result");
const settingStream = document.querySelector("#setting-stream");
const settingSttProvider = document.querySelector("#setting-stt-provider");
const settingReaction = document.querySelector("#setting-reaction");
const settingToolcalls = document.querySelector("#setting-toolcalls");
const settingSkillFolder = document.querySelector("#setting-skill-folder");
const settingsCommandForm = document.querySelector("#settings-command-form");
const settingsCommandInput = document.querySelector("#settings-command");
const settingsCommandResult = document.querySelector("#settings-command-result");
const cronRefreshButton = document.querySelector("#cron-refresh-button");
const cronCount = document.querySelector("#cron-count");
const cronTable = document.querySelector("#cron-table");
const cronCommandForm = document.querySelector("#cron-command-form");
const cronCommandInput = document.querySelector("#cron-command");
const cronCommandResult = document.querySelector("#cron-command-result");
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
const groupCommandForm = document.querySelector("#group-command-form");
const groupCommandInput = document.querySelector("#group-command");
const groupCommandResult = document.querySelector("#group-command-result");
const toolsCount = document.querySelector("#tools-count");
const toolsList = document.querySelector("#tools-list");
const toolsCommandForm = document.querySelector("#tools-command-form");
const toolsCommandInput = document.querySelector("#tools-command");
const toolsCommandResult = document.querySelector("#tools-command-result");

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

rawCommandForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runRawCommand(rawCommandInput.value, commandResult);
});

modelCommandForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runRawCommand(modelCommandInput.value, modelCommandResult);
});

settingsCommandForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runRawCommand(settingsCommandInput.value, settingsCommandResult);
});

cronCommandForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runRawCommand(cronCommandInput.value, cronCommandResult);
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
    : action === "stop"
      ? `/cron stop ${jobId}`
      : `/cron remove ${jobId}`;
  await runRawCommand(command, cronCommandResult);
});

groupCommandForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runRawCommand(groupCommandInput.value, groupCommandResult);
});

groupPolicy?.addEventListener("change", async () => {
  await runRawCommand(`/group policy ${groupPolicy.value}`, groupCommandResult);
});

groupMode?.addEventListener("change", async () => {
  await runRawCommand(`/group mode ${groupMode.value}`, groupCommandResult);
});

groupKeywordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const keywords = splitKeywords(groupKeywords.value);
  if (keywords.length === 0) {
    groupCommandResult.textContent = "请输入关键词，或使用清空关键词。";
    return;
  }
  await runRawCommand(`/group keywords set ${keywords.join(" ")}`, groupCommandResult);
});

groupKeywordsClear?.addEventListener("click", async () => {
  if (!confirm("清空后当前群不会再用关键词触发。")) {
    return;
  }
  await runRawCommand("/group keywords clear", groupCommandResult);
});

groupAllowlistAdd?.addEventListener("click", async () => {
  await runRawCommand("/group allowlist add here", groupCommandResult);
});

groupAllowlistRemove?.addEventListener("click", async () => {
  if (!confirm("移出后当前群在白名单策略下不会响应。")) {
    return;
  }
  await runRawCommand("/group allowlist remove here", groupCommandResult);
});

toolsCommandForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runRawCommand(toolsCommandInput.value, toolsCommandResult);
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
  await runRawCommand(input.checked ? `/tools on ${toolName}` : `/tools off ${toolName}`, toolsCommandResult);
});

routeEnabled?.addEventListener("change", async () => {
  await runRawCommand(routeEnabled.checked ? "/route on" : "/route off", modelCommandResult);
});

settingStream?.addEventListener("change", async () => {
  await runRawCommand(settingStream.checked ? "/stream on" : "/stream off", settingsCommandResult);
});

settingSttProvider?.addEventListener("change", async () => {
  await runRawCommand(`/stt provider ${settingSttProvider.value}`, settingsCommandResult);
});

settingReaction?.addEventListener("change", async () => {
  await runRawCommand(settingReaction.checked ? "/reaction on" : "/reaction off", settingsCommandResult);
});

settingToolcalls?.addEventListener("change", async () => {
  await runRawCommand(`/toolcalls ${settingToolcalls.value}`, settingsCommandResult);
});

settingSkillFolder?.addEventListener("change", async () => {
  await runRawCommand(settingSkillFolder.checked ? "/skill-folder on" : "/skill-folder off", settingsCommandResult);
});

for (const item of navItems) {
  item.addEventListener("click", async () => {
    if (item.disabled) {
      return;
    }
    currentPage = item.dataset.page ?? "sessions";
    renderPageVisibility();
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
    await runRawCommand(`/model ${slot} ${select.value}`, modelCommandResult);
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
    commandResult.textContent = data.message ?? "读取失败。";
    return;
  }

  const data = await response.json();
  renderSessionStatus(data.status);
  renderSessionsTable(data.sessions ?? []);
  renderContextFiles(data.contextFiles ?? []);
}

async function loadModels() {
  if (!currentTargetKey) {
    modelCommandResult.textContent = "请先选择私聊或群聊。";
    return;
  }

  const response = await apiFetch(`./api/pages/models?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    modelCommandResult.textContent = data.message ?? "读取失败。";
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
  await loadSessions();
}

async function runRawCommand(command, resultElement) {
  if (!currentTargetKey) {
    resultElement.textContent = "请先选择私聊或群聊。";
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
  resultElement.textContent = data.output ?? data.message ?? "执行失败。";
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
  renderModelSummary(data);
  renderModelSelect(modelRouter, data.availableModels ?? [], data.routeModels?.router);
  renderModelSelect(modelLight, data.availableModels ?? [], data.routeModels?.light);
  renderModelSelect(modelHeavy, data.availableModels ?? [], data.routeModels?.heavy);
  renderAvailableModels(data.availableModels ?? []);
}

async function loadSettings() {
  if (!currentTargetKey) {
    settingsCommandResult.textContent = "请先选择私聊或群聊。";
    return;
  }

  const response = await apiFetch(`./api/pages/settings?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    settingsCommandResult.textContent = data.message ?? "读取失败。";
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
    cronCommandResult.textContent = "请先选择私聊或群聊。";
    return;
  }

  const response = await apiFetch(`./api/pages/cron?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    cronCommandResult.textContent = data.message ?? "读取失败。";
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
    actions.append(
      createCronActionButton("run", job.id, "▶", "立即运行"),
      createCronActionButton("stop", job.id, "■", "停止"),
      createCronActionButton("remove", job.id, "×", "删除"),
    );
    cronTable.append(row);
  }
}

function appendCronEmptyRow(text) {
  const row = document.createElement("tr");
  row.innerHTML = `<td colspan="4"></td>`;
  row.querySelector("td").textContent = text;
  cronTable.append(row);
}

function createCronActionButton(action, jobId, text, label) {
  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.dataset.cronAction = action;
  button.dataset.jobId = jobId;
  button.textContent = text;
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
    groupCommandResult.textContent = "请先选择私聊或群聊。";
    return;
  }

  const response = await apiFetch(`./api/pages/group?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    groupCommandResult.textContent = data.message ?? "读取失败。";
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
    toolsCommandResult.textContent = "请先选择私聊或群聊。";
    return;
  }

  const response = await apiFetch(`./api/pages/tools?targetKey=${encodeURIComponent(currentTargetKey)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    toolsCommandResult.textContent = data.message ?? "读取失败。";
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
      <input type="checkbox" />
    `;
    item.querySelector("strong").textContent = tool.name;
    item.querySelector("small").textContent = tool.enabled ? "已启用" : "已停用";
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

function renderModelSummary(data) {
  const cards = [
    ["Router", data.routeModels?.router ?? "未设置"],
    ["Light", data.routeModels?.light ?? "未设置"],
    ["Heavy", data.routeModels?.heavy ?? "未设置"],
  ];
  modelSummary.innerHTML = "";
  for (const [title, value] of cards) {
    const card = document.createElement("div");
    card.className = "model-card";
    card.innerHTML = `<strong></strong><span></span>`;
    card.querySelector("strong").textContent = title;
    card.querySelector("span").textContent = value;
    modelSummary.append(card);
  }
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
    item.querySelector("strong").textContent = model.label;
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
