// ============================================================
//  DEV-COMMAND NAVIGATOR — APP.JS (v2 Enhanced)
// ============================================================

// ── STATE ────────────────────────────────────────────────────
let state = {
  activeCat: "all",
  searchQuery: "",
  sortMode: "recent",
  favorites: JSON.parse(localStorage.getItem("dcn_favorites") || "[]"),
  notes: JSON.parse(localStorage.getItem("dcn_notes") || "{}"),
  customCommands: JSON.parse(localStorage.getItem("dcn_custom_cmds") || "[]"),
  folders: JSON.parse(localStorage.getItem("dcn_folders") || "[]"),
  profile: JSON.parse(localStorage.getItem("dcn_profile") || '{"name":"Developer","handle":"dev","color":"#007acc"}'),
  currentView: "dashboard",
  noteTargetId: null,
  editCmdId: null,
  editFolderId: null,
};

// ── BOOTSTRAP MODALS ─────────────────────────────────────────
const noteModal     = new bootstrap.Modal(document.getElementById("noteModal"));
const addCmdModal   = new bootstrap.Modal(document.getElementById("addCmdModal"));
const addFolderModal= new bootstrap.Modal(document.getElementById("addFolderModal"));
const profileModal  = new bootstrap.Modal(document.getElementById("profileModal"));

// ── HELPERS ──────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function genId() { return "c_" + Date.now() + Math.random().toString(36).slice(2, 6); }
function save() {
  localStorage.setItem("dcn_favorites",    JSON.stringify(state.favorites));
  localStorage.setItem("dcn_notes",        JSON.stringify(state.notes));
  localStorage.setItem("dcn_custom_cmds",  JSON.stringify(state.customCommands));
  localStorage.setItem("dcn_folders",      JSON.stringify(state.folders));
  localStorage.setItem("dcn_profile",      JSON.stringify(state.profile));
}

// All commands (built-in + custom merged)
function allCommands() {
  return [...COMMANDS, ...state.customCommands];
}

// ── INIT ─────────────────────────────────────────────────────
function init() {
  applyProfile();
  updateCounts();
  renderSidebarFolders();
  renderPills();
  renderCards();
  renderFavPreview();
  updateStats();
  populatePopovers();
  bindEvents();
}

// ── PROFILE ──────────────────────────────────────────────────
function applyProfile() {
  const p = state.profile;
  const initial = (p.name || "D")[0].toUpperCase();
  const color = p.color || "#007acc";

  // Set avatar letter + color everywhere
  document.querySelectorAll(".avatar").forEach(el => {
    el.textContent = initial;
    el.style.background = color;
  });
  document.getElementById("profileNameDisplay").textContent = p.name || "Developer";
  document.getElementById("profileHandleDisplay").textContent = "@" + (p.handle || "dev");
}

// ── COUNTS ───────────────────────────────────────────────────
function updateCounts() {
  const cmds = allCommands();
  document.getElementById("cnt-all").textContent = cmds.length;
  document.getElementById("statTotal").textContent = cmds.length;
  document.getElementById("totalCount").textContent = cmds.length;

  ["git","linux","docker"].forEach(cat => {
    const el = document.getElementById("cnt-" + cat);
    if (el) el.textContent = cmds.filter(c => c.cat === cat).length;
  });

  state.folders.forEach(f => {
    const el = document.getElementById("cnt-folder-" + f.id);
    if (el) el.textContent = cmds.filter(c => c.cat === f.id).length;
  });

  const noteCount = Object.values(state.notes).filter(n => n && n.trim()).length;
  document.getElementById("cnt-favorites").textContent = state.favorites.length;
  document.getElementById("cnt-notes").textContent = noteCount;
}

function updateStats() {
  const noteCount = Object.values(state.notes).filter(n => n && n.trim()).length;
  document.getElementById("favCount").textContent = state.favorites.length;
  document.getElementById("noteCount").textContent = noteCount;
  // Profile popover stats
  document.getElementById("pp-fav").textContent = state.favorites.length;
  document.getElementById("pp-notes").textContent = noteCount;
  document.getElementById("pp-folders").textContent = state.folders.length;
  // Topbar badges
  const favBadge = document.getElementById("favBadge");
  const notesBadge = document.getElementById("notesBadge");
  if (state.favorites.length > 0) {
    favBadge.style.display = "flex";
    favBadge.textContent = state.favorites.length;
  } else {
    favBadge.style.display = "none";
  }
  if (noteCount > 0) {
    notesBadge.style.display = "flex";
    notesBadge.textContent = noteCount;
  } else {
    notesBadge.style.display = "none";
  }
}

// ── SIDEBAR FOLDERS ──────────────────────────────────────────
function renderSidebarFolders() {
  const list = document.getElementById("foldersNavList");
  list.innerHTML = "";

  if (state.folders.length === 0) {
    list.innerHTML = `<div style="padding:4px 10px 6px;font-size:11px;color:var(--text3);font-style:italic;">No folders yet.</div>`;
    return;
  }

  state.folders.forEach(f => {
    const btn = document.createElement("button");
    btn.className = `folder-nav-item${state.activeCat === f.id ? " active" : ""}`;
    btn.dataset.cat = f.id;
    const count = allCommands().filter(c => c.cat === f.id).length;
    btn.innerHTML = `
      <span class="folder-emoji">${f.emoji || "📁"}</span>
      <span>${escHtml(f.name)}</span>
      <div class="folder-nav-actions">
        <button class="folder-nav-action edit-folder-btn" data-id="${f.id}" title="Edit folder"><i class="bi bi-pencil"></i></button>
        <button class="folder-nav-action add-cmd-to-folder-btn" data-id="${f.id}" title="Add command"><i class="bi bi-plus"></i></button>
      </div>
      <span class="nav-count" id="cnt-folder-${f.id}">${count}</span>
    `;
    btn.addEventListener("click", (e) => {
      if (e.target.closest(".folder-nav-action")) return;
      switchCat(f.id);
      document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setView("dashboard");
      if (window.innerWidth < 992) closeSidebar();
    });
    btn.querySelector(".edit-folder-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditFolder(f.id);
    });
    btn.querySelector(".add-cmd-to-folder-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddCmd(null, f.id);
    });
    list.appendChild(btn);
  });

  // Also update add command category select
  updateCatSelect();
}

function updateCatSelect() {
  const sel = document.getElementById("newCmdCat");
  // Remove old custom options
  while (sel.options.length > 4) sel.remove(4);
  state.folders.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.emoji} ${f.name}`;
    sel.appendChild(opt);
  });
}

// ── DYNAMIC PILLS (category bar) ─────────────────────────────
function renderPills() {
  const container = document.getElementById("catPills");
  // Remove old folder pills
  container.querySelectorAll(".pill-folder").forEach(p => p.remove());
  state.folders.forEach(f => {
    const btn = document.createElement("button");
    btn.className = "pill pill-folder";
    btn.dataset.cat = f.id;
    btn.innerHTML = `${f.emoji} ${escHtml(f.name)}`;
    btn.addEventListener("click", function() {
      document.querySelectorAll(".pill").forEach(x => x.classList.remove("active"));
      this.classList.add("active");
      state.activeCat = f.id;
      document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
      const sideBtn = document.querySelector(`.folder-nav-item[data-cat="${f.id}"]`);
      if (sideBtn) sideBtn.classList.add("active");
      renderCards();
    });
    container.appendChild(btn);
  });
}

// ── POPOVERS ─────────────────────────────────────────────────
function populatePopovers() {
  populateFavPopover();
  populateNotesPopover();
}

function populateFavPopover() {
  const body = document.getElementById("favPopBody");
  const count = document.getElementById("favPopCount");
  const favCmds = allCommands().filter(c => state.favorites.includes(c.id));
  count.textContent = favCmds.length;
  if (favCmds.length === 0) {
    body.innerHTML = `<div class="pop-empty">No favorites yet. Star a command!</div>`;
    return;
  }
  body.innerHTML = "";
  favCmds.forEach(cmd => {
    const div = document.createElement("div");
    div.className = "pop-item";
    const chip = `<span class="cat-chip chip-${isFolderCat(cmd.cat) ? "custom" : cmd.cat}" style="font-size:9px;padding:1px 5px">${cmd.cat}</span>`;
    div.innerHTML = `
      <div class="pop-item-name">${chip}${escHtml(cmd.name)}</div>
      <div class="pop-item-cmd">${escHtml(cmd.cmd)}</div>
    `;
    div.addEventListener("click", () => {
      switchCat(cmd.cat === "git" || cmd.cat === "linux" || cmd.cat === "docker" ? cmd.cat : "all");
      setView("dashboard");
    });
    body.appendChild(div);
  });
}

function populateNotesPopover() {
  const body = document.getElementById("notesPopBody");
  const count = document.getElementById("notesPopCount");
  const noteEntries = Object.entries(state.notes).filter(([, v]) => v && v.trim());
  count.textContent = noteEntries.length;
  if (noteEntries.length === 0) {
    body.innerHTML = `<div class="pop-empty">No notes yet. Add one from a card!</div>`;
    return;
  }
  body.innerHTML = "";
  noteEntries.forEach(([id, note]) => {
    const cmd = allCommands().find(c => c.id === id);
    if (!cmd) return;
    const div = document.createElement("div");
    div.className = "pop-item";
    div.innerHTML = `
      <div class="pop-item-name"><i class="bi bi-pencil-square" style="color:var(--accent2)"></i>${escHtml(cmd.name)}</div>
      <div class="pop-item-note">${escHtml(note)}</div>
    `;
    div.addEventListener("click", () => { openNoteModal(id, cmd.cmd); });
    body.appendChild(div);
  });
}

function isFolderCat(cat) {
  return !["git","linux","docker"].includes(cat);
}

// ── FILTER ───────────────────────────────────────────────────
function getFilteredCommands() {
  let list = allCommands();
  const q = state.searchQuery.toLowerCase().trim();

  if (state.activeCat === "favorites") {
    list = list.filter(c => state.favorites.includes(c.id));
  } else if (state.activeCat !== "all") {
    list = list.filter(c => c.cat === state.activeCat);
  }
  if (q) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.cmd.toLowerCase().includes(q) ||
      c.desc.toLowerCase().replace(/<[^>]+>/g,"").includes(q) ||
      c.cat.toLowerCase().includes(q)
    );
  }
  if (state.sortMode === "az") list = [...list].sort((a,b) => a.name.localeCompare(b.name));
  return list;
}

// ── BUILD CMD HTML ───────────────────────────────────────────
function buildCmdHtml(cmd) {
  if (!cmd.cmdHasVar && !/[<>]/.test(cmd.cmd)) return `<code class="cmd-text">${escHtml(cmd.cmd)}</code>`;
  const html = escHtml(cmd.cmd).replace(/&lt;([^&]+)&gt;/g, (_, p) =>
    `<span class="cmd-var" contenteditable="true" spellcheck="false" data-placeholder="${p}">&lt;${p}&gt;</span>`
  );
  return `<code class="cmd-text">${html}</code>`;
}

// ── CREATE CARD ──────────────────────────────────────────────
function createCard(cmd) {
  const isFav  = state.favorites.includes(cmd.id);
  const note   = state.notes[cmd.id] || "";
  const isCustom = !!state.customCommands.find(c => c.id === cmd.id);
  const catClass = isFolderCat(cmd.cat) ? "chip-custom" : `chip-${cmd.cat}`;

  const div = document.createElement("div");
  div.className = `cmd-card${isFav ? " favorited" : ""}${note ? " has-note" : ""}${isCustom ? " custom-cmd" : ""}`;
  div.dataset.id = cmd.id;

  const noteBlock = cmd.note
    ? `<div class="warn-note ${cmd.note.type === "danger" ? "danger" : cmd.note.type === "tip" ? "tip" : ""}">${cmd.note.text}</div>` : "";
  const userNoteBlock = note
    ? `<div class="card-note-display"><i class="bi bi-pencil-square"></i><span>${escHtml(note)}</span></div>` : "";
  const editBtn = isCustom
    ? `<button class="card-action-btn edit-btn" title="Edit command" data-id="${cmd.id}"><i class="bi bi-pencil"></i></button>` : "";

  div.innerHTML = `
    <div class="card-top">
      <span class="cat-chip ${catClass}">${cmd.cat}</span>
      <span class="card-name">${escHtml(cmd.name)}</span>
      <div class="card-actions">
        ${editBtn}
        <button class="card-action-btn note-btn${note ? " note-active" : ""}" title="Add note" data-id="${cmd.id}"><i class="bi bi-pencil-square"></i></button>
        <button class="card-action-btn fav-btn${isFav ? " fav-active" : ""}" title="${isFav ? "Remove" : "Favorite"}" data-id="${cmd.id}"><i class="bi ${isFav ? "bi-star-fill" : "bi-star"}"></i></button>
      </div>
    </div>
    <div class="code-block">
      ${buildCmdHtml(cmd)}
      <button class="copy-btn">copy</button>
    </div>
    <p class="card-desc">${cmd.desc}</p>
    ${noteBlock}
    ${userNoteBlock}
  `;

  div.querySelector(".copy-btn").addEventListener("click", function() {
    let text = "";
    div.querySelector(".cmd-text").childNodes.forEach(n => { text += n.textContent || ""; });
    navigator.clipboard.writeText(text.trim()).catch(() => {});
    this.textContent = "✓ copied!"; this.classList.add("copied");
    setTimeout(() => { this.textContent = "copy"; this.classList.remove("copied"); }, 2000);
  });

  div.querySelector(".fav-btn").addEventListener("click", () => toggleFav(cmd.id));
  div.querySelector(".note-btn").addEventListener("click", () => openNoteModal(cmd.id, cmd.cmd));
  div.querySelector(".edit-btn")?.addEventListener("click", () => openEditCmd(cmd.id));

  return div;
}

// ── RENDER CARDS ─────────────────────────────────────────────
function renderCards() {
  const grid  = document.getElementById("mainGrid");
  const empty = document.getElementById("emptyState");
  const filtered = getFilteredCommands();
  const cat = state.activeCat;

  // Update section title
  let title = "All Commands";
  if (cat === "favorites") title = "⭐ Favorites";
  else if (cat === "git") title = "Git Commands";
  else if (cat === "linux") title = "Linux Commands";
  else if (cat === "docker") title = "Docker Commands";
  else {
    const f = state.folders.find(x => x.id === cat);
    if (f) title = `${f.emoji} ${f.name}`;
  }
  document.getElementById("sectionTitle").textContent = title;

  grid.innerHTML = "";
  if (filtered.length === 0) {
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    filtered.forEach((cmd, i) => {
      const card = createCard(cmd);
      card.style.animationDelay = `${i * 0.035}s`;
      grid.appendChild(card);
    });
  }
}

// ── RENDER FAV PREVIEW ───────────────────────────────────────
function renderFavPreview() {
  const section = document.getElementById("favSection");
  const grid = document.getElementById("favPreviewGrid");
  const favCmds = allCommands().filter(c => state.favorites.includes(c.id)).slice(0, 3);
  if (favCmds.length === 0) { section.style.display = "none"; return; }
  section.style.display = "block";
  grid.innerHTML = "";
  favCmds.forEach(cmd => grid.appendChild(createCard(cmd)));
}

// ── RENDER NOTES VIEW ────────────────────────────────────────
function renderNotesView() {
  const grid  = document.getElementById("notesViewGrid");
  const empty = document.getElementById("notesEmptyState");
  const entries = Object.entries(state.notes).filter(([,v]) => v && v.trim());
  grid.innerHTML = "";
  if (entries.length === 0) { empty.style.display = "block"; return; }
  empty.style.display = "none";
  entries.forEach(([id, note], i) => {
    const cmd = allCommands().find(c => c.id === id);
    if (!cmd) return;
    const card = createCard(cmd);
    card.style.animationDelay = `${i * 0.04}s`;
    grid.appendChild(card);
  });
}

// ── TOGGLE FAVORITE ──────────────────────────────────────────
function toggleFav(id) {
  const idx = state.favorites.indexOf(id);
  if (idx === -1) state.favorites.push(id);
  else state.favorites.splice(idx, 1);
  save();
  updateCounts(); updateStats();
  renderCards(); renderFavPreview();
  populatePopovers();
}

// ── NOTE MODAL ───────────────────────────────────────────────
function openNoteModal(id, cmd) {
  state.noteTargetId = id;
  document.getElementById("noteCmdLabel").textContent = cmd;
  document.getElementById("noteTextarea").value = state.notes[id] || "";
  const delBtn = document.getElementById("deleteNoteBtn");
  delBtn.style.display = state.notes[id] ? "inline-flex" : "none";
  noteModal.show();
}

document.getElementById("saveNoteBtn").addEventListener("click", () => {
  const val = document.getElementById("noteTextarea").value.trim();
  if (!state.noteTargetId) return;
  if (val) state.notes[state.noteTargetId] = val;
  else delete state.notes[state.noteTargetId];
  save();
  noteModal.hide();
  updateStats(); updateCounts();
  renderCards(); renderFavPreview();
  populatePopovers();
  if (state.currentView === "notes") renderNotesView();
});

document.getElementById("deleteNoteBtn").addEventListener("click", () => {
  if (!state.noteTargetId) return;
  delete state.notes[state.noteTargetId];
  save();
  noteModal.hide();
  updateStats(); updateCounts();
  renderCards(); renderFavPreview();
  populatePopovers();
  if (state.currentView === "notes") renderNotesView();
});

// ── ADD / EDIT COMMAND ────────────────────────────────────────
function openAddCmd(cmdId = null, defaultFolder = null) {
  state.editCmdId = cmdId;
  const isEdit = !!cmdId;
  document.getElementById("addCmdModalTitle").textContent = isEdit ? "Edit Command" : "Add New Command";
  document.getElementById("saveCmdBtnLabel").textContent  = isEdit ? "Save Changes" : "Add Command";
  document.getElementById("deleteCmdBtn").style.display   = isEdit ? "inline-flex" : "none";
  document.getElementById("addCmdError").style.display    = "none";

  if (isEdit) {
    const cmd = state.customCommands.find(c => c.id === cmdId);
    if (!cmd) return;
    document.getElementById("newCmdName").value     = cmd.name;
    document.getElementById("newCmdCmd").value      = cmd.cmd;
    document.getElementById("newCmdDesc").value     = cmd.desc.replace(/<[^>]+>/g,"");
    document.getElementById("newCmdCat").value      = cmd.cat;
    document.getElementById("newCmdNoteType").value = cmd.note ? cmd.note.type : "";
    document.getElementById("newCmdNoteText").value = cmd.note ? cmd.note.text.replace(/^[^a-zA-Z]+\s*/,"") : "";
  } else {
    document.getElementById("newCmdName").value     = "";
    document.getElementById("newCmdCmd").value      = "";
    document.getElementById("newCmdDesc").value     = "";
    document.getElementById("newCmdCat").value      = defaultFolder || "";
    document.getElementById("newCmdNoteType").value = "";
    document.getElementById("newCmdNoteText").value = "";
  }
  addCmdModal.show();
}

function openEditCmd(cmdId) { openAddCmd(cmdId); }

document.getElementById("saveCmdBtn").addEventListener("click", () => {
  const name  = document.getElementById("newCmdName").value.trim();
  const cmd   = document.getElementById("newCmdCmd").value.trim();
  const desc  = document.getElementById("newCmdDesc").value.trim();
  const cat   = document.getElementById("newCmdCat").value;
  const ntype = document.getElementById("newCmdNoteType").value;
  const ntext = document.getElementById("newCmdNoteText").value.trim();
  const err   = document.getElementById("addCmdError");

  if (!name || !cmd || !desc || !cat) {
    err.textContent = "Please fill in all required fields (name, command, description, category).";
    err.style.display = "block"; return;
  }
  err.style.display = "none";

  const noteObj = (ntype && ntext) ? { type: ntype, text: `${ntype === "tip" ? "✓" : ntype === "danger" ? "🚨" : "⚠️"} ${ntext}` } : null;
  const cmdHasVar = /[<>]/.test(cmd);

  if (state.editCmdId) {
    const idx = state.customCommands.findIndex(c => c.id === state.editCmdId);
    if (idx > -1) {
      state.customCommands[idx] = { ...state.customCommands[idx], name, cmd, desc, cat, note: noteObj, cmdHasVar };
    }
  } else {
    state.customCommands.push({ id: genId(), cat, name, cmd, desc, note: noteObj, cmdHasVar });
  }

  save();
  addCmdModal.hide();
  updateCounts(); renderCards(); renderFavPreview();
  renderSidebarFolders(); renderPills();
});

document.getElementById("deleteCmdBtn").addEventListener("click", () => {
  if (!state.editCmdId) return;
  state.customCommands = state.customCommands.filter(c => c.id !== state.editCmdId);
  delete state.notes[state.editCmdId];
  state.favorites = state.favorites.filter(id => id !== state.editCmdId);
  save();
  addCmdModal.hide();
  updateCounts(); updateStats();
  renderCards(); renderFavPreview(); populatePopovers();
  renderSidebarFolders(); renderPills();
});

// ── ADD / EDIT FOLDER ─────────────────────────────────────────
function openAddFolder() {
  state.editFolderId = null;
  document.getElementById("folderModalTitle").textContent  = "New Folder";
  document.getElementById("saveFolderBtnLabel").textContent = "Create Folder";
  document.getElementById("deleteFolderBtn").style.display  = "none";
  document.getElementById("folderNameInput").value  = "";
  document.getElementById("folderEmojiInput").value = "📁";
  document.getElementById("folderError").style.display = "none";
  addFolderModal.show();
}

function openEditFolder(folderId) {
  const f = state.folders.find(x => x.id === folderId);
  if (!f) return;
  state.editFolderId = folderId;
  document.getElementById("folderModalTitle").textContent  = "Edit Folder";
  document.getElementById("saveFolderBtnLabel").textContent = "Save Changes";
  document.getElementById("deleteFolderBtn").style.display  = "inline-flex";
  document.getElementById("folderNameInput").value  = f.name;
  document.getElementById("folderEmojiInput").value = f.emoji || "📁";
  document.getElementById("folderError").style.display = "none";
  addFolderModal.show();
}

// Emoji picker
document.getElementById("emojiPicker").addEventListener("click", e => {
  const txt = e.target.textContent.trim();
  if (txt) document.getElementById("folderEmojiInput").value = txt;
});

document.getElementById("saveFolderBtn").addEventListener("click", () => {
  const name  = document.getElementById("folderNameInput").value.trim();
  const emoji = document.getElementById("folderEmojiInput").value.trim() || "📁";
  const err   = document.getElementById("folderError");

  if (!name) { err.textContent = "Folder name is required."; err.style.display = "block"; return; }
  err.style.display = "none";

  if (state.editFolderId) {
    const idx = state.folders.findIndex(f => f.id === state.editFolderId);
    if (idx > -1) state.folders[idx] = { ...state.folders[idx], name, emoji };
  } else {
    const id = "folder_" + name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now().toString(36);
    state.folders.push({ id, name, emoji });
  }

  save();
  addFolderModal.hide();
  updateCounts(); renderSidebarFolders(); renderPills();
});

document.getElementById("deleteFolderBtn").addEventListener("click", () => {
  if (!state.editFolderId) return;
  // Optionally remove commands in that folder
  state.customCommands = state.customCommands.filter(c => c.cat !== state.editFolderId);
  state.folders = state.folders.filter(f => f.id !== state.editFolderId);
  if (state.activeCat === state.editFolderId) { state.activeCat = "all"; }
  save();
  addFolderModal.hide();
  updateCounts(); renderCards(); renderSidebarFolders(); renderPills();
});

// ── PROFILE ──────────────────────────────────────────────────
function openProfileModal() {
  const p = state.profile;
  document.getElementById("profileNameInput").value   = p.name || "";
  document.getElementById("profileHandleInput").value = p.handle || "";
  // Mark active color
  document.querySelectorAll(".av-color").forEach(el => {
    el.classList.toggle("active", el.dataset.color === (p.color || "#007acc"));
  });
  document.getElementById("profileEditAvatar").style.background = p.color || "#007acc";
  document.getElementById("profileEditAvatar").textContent = (p.name || "D")[0].toUpperCase();
  profileModal.show();
}

document.getElementById("avatarColorPicker").addEventListener("click", e => {
  const el = e.target.closest(".av-color");
  if (!el) return;
  document.querySelectorAll(".av-color").forEach(x => x.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("profileEditAvatar").style.background = el.dataset.color;
});

document.getElementById("profileNameInput").addEventListener("input", function() {
  const v = this.value.trim();
  if (v) document.getElementById("profileEditAvatar").textContent = v[0].toUpperCase();
});

document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const name   = document.getElementById("profileNameInput").value.trim() || "Developer";
  const handle = document.getElementById("profileHandleInput").value.trim().replace(/^@/,"") || "dev";
  const color  = document.querySelector(".av-color.active")?.dataset.color || "#007acc";
  state.profile = { name, handle, color };
  save();
  applyProfile(); updateStats();
  profileModal.hide();
});

// ── RESCUE MODE ──────────────────────────────────────────────
function renderRescueChips() {
  const chips = document.getElementById("rescueChips");
  chips.innerHTML = "";
  ERRORS.forEach(e => {
    const btn = document.createElement("button");
    btn.className = "rescue-chip";
    btn.textContent = e.title;
    btn.addEventListener("click", () => {
      document.getElementById("rescueInput").value = e.keywords[0];
      runRescueSearch(e.keywords[0]);
    });
    chips.appendChild(btn);
  });
}

function runRescueSearch(query) {
  const q = query.toLowerCase().trim();
  const results = document.getElementById("rescueResults");
  results.innerHTML = "";
  if (!q) return;
  const matched = ERRORS.filter(e =>
    e.keywords.some(k => q.includes(k) || k.includes(q)) ||
    e.title.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q)
  );
  if (matched.length === 0) {
    results.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text3)">
      <i class="bi bi-question-circle" style="font-size:32px;display:block;margin-bottom:12px;opacity:0.4"></i>
      <p>No known solution found. Try: "permission denied", "port in use", "merge conflict"</p></div>`;
    return;
  }
  matched.forEach((err, i) => {
    const card = document.createElement("div");
    card.className = "rescue-card"; card.style.animationDelay = `${i*0.06}s`;
    card.innerHTML = `
      <div class="rescue-card-header">
        <div class="rescue-err-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
        <span class="rescue-err-title">${err.title}</span>
      </div>
      <p class="rescue-err-desc">${err.description}</p>
      <div class="rescue-fix-label"><i class="bi bi-terminal me-1"></i>Recommended Fix</div>
      <div class="rescue-fix-box"><code>${escHtml(err.fix)}</code><button class="copy-btn" style="position:absolute;right:6px;top:50%;transform:translateY(-50%)">copy</button></div>
      ${err.altFix ? `<div class="rescue-fix-label mt-2"><i class="bi bi-arrow-repeat me-1"></i>Alternative</div>
      <div class="rescue-fix-box"><code>${escHtml(err.altFix)}</code><button class="copy-btn" style="position:absolute;right:6px;top:50%;transform:translateY(-50%)">copy</button></div>` : ""}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">${err.tags.map(t=>`<span style="font-size:10px;padding:2px 8px;border-radius:4px;background:rgba(63,185,80,0.1);color:var(--success);border:1px solid rgba(63,185,80,0.2)">${t}</span>`).join("")}</div>
    `;
    card.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        navigator.clipboard.writeText(this.previousElementSibling.textContent.trim()).catch(()=>{});
        this.textContent = "✓ copied!"; this.classList.add("copied");
        setTimeout(() => { this.textContent = "copy"; this.classList.remove("copied"); }, 2000);
      });
    });
    results.appendChild(card);
  });
}

// ── SET VIEW ─────────────────────────────────────────────────
function setView(view) {
  state.currentView = view;
  document.getElementById("dashboardView").style.display = view === "dashboard" ? "" : "none";
  document.getElementById("rescueView").style.display    = view === "rescue"    ? "" : "none";
  document.getElementById("notesView").style.display     = view === "notes"     ? "" : "none";
  if (view === "rescue") renderRescueChips();
  if (view === "notes")  renderNotesView();
}

// ── SWITCH CATEGORY ──────────────────────────────────────────
function switchCat(cat) {
  state.activeCat = cat;
  state.searchQuery = "";
  document.getElementById("globalSearch").value = "";
  document.getElementById("sidebarSearch").value = "";
  document.querySelectorAll(".pill").forEach(p => {
    p.classList.toggle("active", p.dataset.cat === cat);
    if (cat === "all" && p.dataset.cat === "all") p.classList.add("active");
  });
  renderCards();
}

// ── BIND EVENTS ──────────────────────────────────────────────
function bindEvents() {

  // Sidebar built-in nav items
  document.querySelectorAll(".nav-item[data-cat]").forEach(btn => {
    btn.addEventListener("click", function() {
      const cat = this.dataset.cat;
      document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      setView("dashboard");
      switchCat(cat);
      if (window.innerWidth < 992) closeSidebar();
    });
  });

  // Notes nav button
  document.getElementById("notesNavBtn").addEventListener("click", function() {
    document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    setView("notes");
    if (window.innerWidth < 992) closeSidebar();
  });

  // Rescue nav
  document.getElementById("troubleshootBtn").addEventListener("click", function() {
    document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    setView("rescue");
    if (window.innerWidth < 992) closeSidebar();
  });

  // Back buttons
  document.getElementById("backFromRescue").addEventListener("click", () => {
    setView("dashboard");
    document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
    document.querySelector('.nav-item[data-cat="all"]').classList.add("active");
  });
  document.getElementById("backFromNotes").addEventListener("click", () => {
    setView("dashboard");
    document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
    document.querySelector('.nav-item[data-cat="all"]').classList.add("active");
  });

  // Searches
  document.getElementById("globalSearch").addEventListener("input", function() {
    state.searchQuery = this.value;
    document.getElementById("sidebarSearch").value = this.value;
    renderCards();
  });
  document.getElementById("sidebarSearch").addEventListener("input", function() {
    state.searchQuery = this.value;
    document.getElementById("globalSearch").value = this.value;
    renderCards();
  });

  // Ctrl+K
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey||e.metaKey) && e.key === "k") {
      e.preventDefault();
      document.getElementById("globalSearch").focus();
    }
    if (e.key === "Escape") closeAllPopovers();
  });

  // Sort
  document.querySelectorAll(".sort-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      state.sortMode = this.dataset.sort;
      renderCards();
    });
  });

  // Built-in pills
  document.querySelectorAll(".pill:not(.pill-folder)").forEach(p => {
    p.addEventListener("click", function() {
      document.querySelectorAll(".pill").forEach(x => x.classList.remove("active"));
      this.classList.add("active");
      state.activeCat = this.dataset.cat;
      document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
      const sideBtn = document.querySelector(`.nav-item[data-cat="${this.dataset.cat}"]`);
      if (sideBtn) sideBtn.classList.add("active");
      renderCards();
    });
  });

  // View-all favorites
  document.querySelector(".view-all-btn[data-cat='favorites']")?.addEventListener("click", () => {
    switchCat("favorites");
    document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
    document.querySelector('.nav-item[data-cat="favorites"]').classList.add("active");
  });

  // Popover view-all buttons
  document.querySelectorAll(".pop-view-all").forEach(btn => {
    btn.addEventListener("click", function() {
      const cat = this.dataset.cat;
      closeAllPopovers();
      if (cat === "notes") {
        setView("notes");
        document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
        document.getElementById("notesNavBtn").classList.add("active");
      } else {
        setView("dashboard");
        switchCat(cat);
        document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
        document.getElementById("favNavBtn").classList.add("active");
      }
    });
  });

  // Rescue input
  document.getElementById("rescueInput").addEventListener("input", function() { runRescueSearch(this.value); });

  // Stats cards clickable
  document.getElementById("statFav").addEventListener("click", () => {
    switchCat("favorites");
    document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
    document.getElementById("favNavBtn").classList.add("active");
  });
  document.getElementById("statNotes").addEventListener("click", () => {
    setView("notes");
    document.querySelectorAll(".nav-item, .folder-nav-item").forEach(b => b.classList.remove("active"));
    document.getElementById("notesNavBtn").classList.add("active");
  });

  // Add folder
  document.getElementById("addFolderBtn").addEventListener("click", openAddFolder);

  // FAB + empty state add command buttons
  document.getElementById("fabAddCmd").addEventListener("click", () => openAddCmd(null, state.activeCat !== "all" && state.activeCat !== "favorites" ? state.activeCat : null));
  document.getElementById("addCmdFromEmpty").addEventListener("click", () => openAddCmd(null, state.activeCat !== "all" && state.activeCat !== "favorites" ? state.activeCat : null));

  // Profile
  document.getElementById("profileBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    const pop = document.getElementById("profilePopover");
    pop.classList.toggle("pinned");
    document.querySelectorAll(".topbar-popover").forEach(p => { if(p !== pop) p.classList.remove("pinned"); });
  });
  document.getElementById("editProfileBtn").addEventListener("click", () => {
    document.getElementById("profilePopover").classList.remove("pinned");
    openProfileModal();
  });

  // Theme toggle (sidebar + profile popup)
  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.dataset.theme === "dark";
    html.dataset.theme = isDark ? "light" : "dark";
    document.getElementById("themeIcon").className = isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    document.getElementById("themeLabel").textContent = isDark ? "Dark Mode" : "Light Mode";
    document.getElementById("themeIconInline").className = isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    document.getElementById("themeLabelInline").textContent = isDark ? "Dark Mode" : "Light Mode";
  }
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("themeToggleInline").addEventListener("click", toggleTheme);

  // Hamburger
  document.getElementById("hamburger").addEventListener("click", openSidebar);
  document.getElementById("closeSidebar").addEventListener("click", closeSidebar);
  document.getElementById("sidebarOverlay").addEventListener("click", closeSidebar);

  // Close popovers on outside click
  document.addEventListener("click", e => {
    if (!e.target.closest(".popover-wrap")) closeAllPopovers();
  });
}

function closeAllPopovers() {
  document.querySelectorAll(".topbar-popover.pinned").forEach(p => p.classList.remove("pinned"));
}

function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebarOverlay").classList.add("active");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("active");
}

// ── RUN ─────────────────────────────────────────────────────
init();
