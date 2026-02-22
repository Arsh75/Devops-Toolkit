// ============================================
// DevOps Toolkit Dashboard — Application Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initClock();
  initCommandLibrary();
  initJsonYaml();
  initBase64Jwt();
  initCron();
  initRegex();
  initSnippets();
  initHttpCodes();
  initPromptLibrary();
  initWorkflowDesigner();
  initPlayground();
  initCodingConcepts();
  initArchitecture();
  initKnowledgeBase();
  initUuidPassword();
  initTimestamp();
  initDiff();
  initColorPicker();
  initMarkdown();
  initSettings();
  initSidebarCollapse();
  initKeyboardShortcuts();
  initTheme();
  initDashboardStats();
});

function initDashboardStats() {
  const startTime = Date.now();

  function update() {
    // Storage
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      total += (localStorage.getItem(localStorage.key(i)) || '').length;
    }
    document.getElementById('statStorage').textContent = formatSize(total);

    // Snippets
    const snippets = JSON.parse(localStorage.getItem('devops_snippets') || '[]');
    document.getElementById('statSnippets').textContent = snippets.length;

    // Session
    const mins = Math.floor((Date.now() - startTime) / 60000);
    const secs = Math.floor(((Date.now() - startTime) % 60000) / 1000);
    document.getElementById('statSession').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  update();
  setInterval(update, 1000);
}

function initSidebarCollapse() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarCollapse');
  const isCollapsed = localStorage.getItem('ui_sidebar_collapsed') === 'true';

  if (isCollapsed) sidebar.classList.add('collapsed');

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('ui_sidebar_collapsed', sidebar.classList.contains('collapsed'));
  });
}

function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const body = document.body;
  const savedTheme = localStorage.getItem('ui_theme') || 'dark';

  if (savedTheme === 'light') {
    body.classList.add('light-mode');
    icon.textContent = '☀️';
  }

  toggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    icon.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('ui_theme', isLight ? 'light' : 'dark');
    showToast(`Switched to ${isLight ? 'Light' : 'Dark'} mode`, 'info');
  });
}

// === HELPERS & UTILITIES ===
function lsSize(key) {
  try {
    return new Blob([localStorage.getItem(key) || '']).size;
  } catch (e) {
    return 0;
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function lsCategorySize(category) {
  const keys = {
    'snippets': ['devops_snippets'],
    'llm': ['llm_base_url', 'llm_model', 'llm_temp', 'llm_system', 'llm_api_key', 'llm_chat_history'],
    'workflows': ['devops_workflows'],
    'prefs': ['ui_sidebar_collapsed', 'ui_theme']
  };
  let total = 0;
  (keys[category] || []).forEach(k => total += lsSize(k));
  return total;
}

function clearCategory(category) {
  const keys = {
    'snippets': ['devops_snippets'],
    'llm': ['llm_base_url', 'llm_model', 'llm_temp', 'llm_system', 'llm_api_key', 'llm_chat_history'],
    'workflows': ['devops_workflows'],
    'prefs': ['ui_sidebar_collapsed', 'ui_theme']
  };

  showModal({
    title: '⚠️ Clear Category',
    body: `Are you sure you want to clear ${category} data? This cannot be undone.`,
    buttons: [
      { label: 'Cancel', class: 'btn-secondary' },
      {
        label: 'Clear Data', class: 'btn-danger', onClick: () => {
          (keys[category] || []).forEach(k => localStorage.removeItem(k));
          showToast(`Cleared ${category} data`, 'success');
          if (category === 'prefs') location.reload();
          else renderSettingsData();
        }
      }
    ]
  });
}

function exportData(keys, filename) {
  const data = {};
  keys.forEach(k => data[k] = localStorage.getItem(k));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `devops-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(onSuccess, onError) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        onSuccess(data);
      } catch (err) {
        onError(err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
function showToast(message, type = 'success', duration = 2500) {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(20px)';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// Fallback for older toast calls
function toast(msg) { showToast(msg, 'info'); }

function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textArea);
  });
}

function showModal({ title, body, buttons = [] }) {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modalBox');

  box.innerHTML = `
    <div class="modal-header"><h2>${title}</h2></div>
    <div class="modal-body">${body}</div>
    <div class="modal-footer" id="modalFooter"></div>
  `;

  const footer = box.querySelector('#modalFooter');
  buttons.forEach(btn => {
    const b = document.createElement('button');
    b.className = `btn ${btn.class || 'btn-secondary'}`;
    b.textContent = btn.label;
    b.onclick = () => {
      if (btn.onClick) btn.onClick();
      close();
    };
    footer.appendChild(b);
  });

  function close() {
    overlay.classList.remove('open');
    document.removeEventListener('keydown', handleEsc);
  }

  function handleEsc(e) {
    if (e.key === 'Escape') close();
  }

  overlay.onclick = (e) => { if (e.target === overlay) close(); };
  document.addEventListener('keydown', handleEsc);
  overlay.classList.add('open');

  return { close };
}

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

// === NAVIGATION ===
const pageRendered = {};
function navigateTo(page) {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.page-section');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  navItems.forEach(n => n.classList.toggle('active', n.dataset.page === page));

  // Smooth transition
  const currentActive = document.querySelector('.page-section.active');
  if (currentActive) {
    currentActive.classList.remove('active');
  }

  requestAnimationFrame(() => {
    const nextActive = document.getElementById('page-' + page);
    if (nextActive) {
      nextActive.classList.add('active');
      if (page === 'settings') renderSettingsData();
    }
  });

  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('mobileToggle');

  navItems.forEach(n => n.addEventListener('click', () => navigateTo(n.dataset.page)));
  document.querySelectorAll('.quick-card[data-goto]').forEach(c =>
    c.addEventListener('click', () => navigateTo(c.dataset.goto))
  );
  toggle.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    overlay.classList.add('active');
  });
  overlay.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    overlay.classList.remove('active');
  });
}

// === CLOCK ===
function initClock() {
  function update() {
    const now = new Date();
    const h = now.getHours();
    const greeting = h < 12 ? 'Good Morning \u2600\uFE0F' : h < 17 ? 'Good Afternoon \uD83C\uDF24\uFE0F' : 'Good Evening \uD83C\uDF19';
    document.getElementById('clockGreeting').textContent = greeting;
    document.getElementById('clockTime').textContent = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('clockDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  update();
  setInterval(update, 1000);
}


// === COMMAND LIBRARY ===
function initCommandLibrary() {
  const commands = [
    { cmd: 'docker ps -a', desc: 'List all containers', tag: 'docker', detail: 'Shows all containers regardless of status (running, exited, etc.)', flags: '-a: all containers', example: 'docker ps -a' },
    { cmd: 'docker build -t name .', desc: 'Build image from Dockerfile', tag: 'docker', detail: 'Creates a docker image using a Dockerfile in the current directory', flags: '-t: tag name', example: 'docker build -t my-app:v1 .' },
    { cmd: 'docker-compose up -d', desc: 'Start services in background', tag: 'docker', detail: 'Starts all services defined in docker-compose.yml in detached mode', flags: '-d: detached', example: 'docker-compose up -d' },
    { cmd: 'kubectl get pods -A', desc: 'List all pods in all namespaces', tag: 'kubernetes', detail: 'Retrieves all pods across every namespace in the cluster', flags: '-A: all-namespaces', example: 'kubectl get pods -A' },
    { cmd: 'kubectl logs pod -f', desc: 'Stream pod logs', tag: 'kubernetes', detail: 'Continuously outputs logs for a specific pod', flags: '-f: follow logs', example: 'kubectl logs my-pod -f' },
    { cmd: 'git log --oneline -20', desc: 'Show last 20 commits', tag: 'git', detail: 'Displays a condensed view of commit history', flags: '--oneline: one-line format, -20: limit to 20', example: 'git log --oneline -20' },
    { cmd: 'git checkout -b <branch>', desc: 'Create and switch branch', tag: 'git', detail: 'Shortcut for git branch + git checkout', flags: '-b: create new branch', example: 'git checkout -b feature/login' },
    { cmd: 'top -o %MEM', desc: 'Sort processes by memory', tag: 'linux', detail: 'Classic Linux process manager sorted by memory usage', flags: '-o: sort order', example: 'top -o %MEM' },
    { cmd: 'ss -tulnp', desc: 'Show listening ports', tag: 'linux', detail: 'Displays active TCP/UDP sockets with process info', flags: '-t: tcp, -u: udp, -l: listen, -n: numeric, -p: process', example: 'ss -tulnp' },
    { cmd: 'terraform plan -out=tfplan', desc: 'Create execution plan', tag: 'terraform', detail: 'Generates an execution plan and saves it to a file', flags: '-out: output path', example: 'terraform plan -out=main.tfplan' },
    { cmd: 'helm list -A', desc: 'List all releases', tag: 'helm', detail: 'Shows all Helm releases across all namespaces', flags: '-A: all namespaces', example: 'helm list -A' }
  ];

  const list = document.getElementById('commandList');
  const search = document.getElementById('cmdSearch');
  const filters = document.getElementById('cmdFilters');
  let activeFilter = 'all';

  function render() {
    const q = search.value.toLowerCase();
    const filtered = commands.filter(c =>
      (activeFilter === 'all' || c.tag === activeFilter) &&
      (c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || (c.detail && c.detail.toLowerCase().includes(q)))
    );

    const visible = filtered.slice(0, 50); // Simple limit for performance
    list.innerHTML = visible.map((c, idx) => `
      <div class="command-item" data-idx="${idx}">
        <div class="cmd-main" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div class="cmd-info">
            <div class="cmd-label">${c.desc}</div>
            <code class="cmd-code">${c.cmd}</code>
          </div>
          <div class="cmd-actions" style="display: flex; align-items: center; gap: 8px;">
            <span class="cmd-tag tag-${c.tag}">${c.tag}</span>
            <button class="btn btn-copy" onclick="event.stopPropagation(); copyText('${c.cmd.replace(/'/g, "\\'")}')">Copy</button>
            <span class="nav-icon" style="opacity: 0.5; font-size: 0.8rem;">▼</span>
          </div>
        </div>
        <div class="cmd-details" id="details-${idx}">
          <p style="margin: 10px 0; color: var(--text-secondary);">${c.detail || 'No extra detail available.'}</p>
          ${c.flags ? `<div class="cmd-flags" style="font-size: 0.85rem; margin-bottom: 8px;"><strong>Flags:</strong> <span style="color:var(--text-muted)">${c.flags}</span></div>` : ''}
          ${c.example ? `
            <div class="cmd-example" style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; border-left: 2px solid var(--accent-cyan);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Example</strong>
                <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); copyText('${c.example.replace(/'/g, "\\'")}')" style="padding: 2px 6px; font-size: 0.7rem;">Copy</button>
              </div>
              <code style="display: block; font-size: 0.85rem;">${c.example}</code>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    if (filtered.length > 50) {
      const more = document.createElement('div');
      more.style.padding = '12px';
      more.style.textAlign = 'center';
      more.style.color = 'var(--text-muted)';
      more.textContent = `Showing 50 of ${filtered.length} commands. Use search to find more.`;
      list.appendChild(more);
    }

    // Add click listeners for expansion
    list.querySelectorAll('.command-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const details = item.querySelector('.cmd-details');
        const isOpen = details.classList.contains('active');
        // Close others
        list.querySelectorAll('.cmd-details').forEach(d => d.classList.remove('active'));
        list.querySelectorAll('.command-item').forEach(it => it.classList.remove('expanded'));

        if (!isOpen) {
          details.classList.add('active');
          item.classList.add('expanded');
        }
      });
    });
  }

  const debouncedRender = debounce(render, 250);
  search.addEventListener('input', debouncedRender);
  filters.addEventListener('click', e => {
    if (e.target.classList.contains('chip')) {
      filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.dataset.filter;
      render();
    }
  });
  render();
}

// === JSON / YAML ===
function initJsonYaml() {
  const inp = document.getElementById('jsonInput');
  const out = document.getElementById('jsonOutput');

  document.getElementById('jsonFormat').addEventListener('click', () => {
    try { out.value = JSON.stringify(JSON.parse(inp.value), null, 2); out.className = 'tool-textarea output'; } catch (e) { out.value = 'Error: ' + e.message; out.className = 'tool-textarea error-output'; }
  });
  document.getElementById('jsonMinify').addEventListener('click', () => {
    try { out.value = JSON.stringify(JSON.parse(inp.value)); out.className = 'tool-textarea output'; } catch (e) { out.value = 'Error: ' + e.message; out.className = 'tool-textarea error-output'; }
  });
  document.getElementById('jsonValidate').addEventListener('click', () => {
    try { JSON.parse(inp.value); out.value = '✅ Valid JSON!'; out.className = 'tool-textarea output'; } catch (e) { out.value = '💡❌ Invalid: ' + e.message; out.className = 'tool-textarea error-output'; }
  });
  document.getElementById('jsonToYaml').addEventListener('click', () => {
    try {
      const obj = JSON.parse(inp.value);
      out.value = jsonToYaml(obj, 0);
      out.className = 'tool-textarea output';
    } catch (e) { out.value = 'Error: ' + e.message; out.className = 'tool-textarea error-output'; }
  });
  document.getElementById('yamlToJson').addEventListener('click', () => {
    try {
      const obj = parseYaml(inp.value);
      out.value = JSON.stringify(obj, null, 2);
      out.className = 'tool-textarea output';
    } catch (e) { out.value = 'Error: ' + e.message; out.className = 'tool-textarea error-output'; }
  });

  document.getElementById('jsonSort').addEventListener('click', () => {
    try {
      const obj = JSON.parse(inp.value);
      const sorted = sortObject(obj);
      out.value = JSON.stringify(sorted, null, 2);
      out.className = 'tool-textarea output';
      showToast('Keys sorted alphabetically', 'success');
    } catch (e) {
      out.value = 'Error: ' + e.message;
      out.className = 'tool-textarea error-output';
      showToast('Operation failed: ' + e.message, 'error');
    }
  });

  document.getElementById('jsonClear').addEventListener('click', () => { inp.value = ''; out.value = ''; });
  document.getElementById('jsonCopyInp').addEventListener('click', () => copyText(inp.value));
  document.getElementById('jsonSwap').addEventListener('click', () => { const tmp = inp.value; inp.value = out.value; out.value = tmp; });

  function sortObject(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sortObject);
    return Object.keys(obj).sort().reduce((res, key) => {
      res[key] = sortObject(obj[key]);
      return res;
    }, {});
  }
  document.getElementById('jsonCopyOutput').addEventListener('click', () => copyText(out.value));
}

// === YAML PARSER & SERIALIZER ===
function parseYaml(text) {
  const lines = text.split('\n');
  let i = 0;

  function parseRecursive(indent = -1) {
    const obj = {};
    const arr = [];
    let isArr = false;

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }

      const currentIndent = line.search(/\S/);
      if (currentIndent <= indent) break;

      const content = line.trim();

      // Check for array item
      if (content.startsWith('- ')) {
        isArr = true;
        const itemVal = content.slice(2).trim();
        if (itemVal) {
          arr.push(coerceValue(itemVal));
          i++;
        } else {
          i++;
          arr.push(parseRecursive(currentIndent));
        }
        continue;
      }

      // Check for key-value pair
      const colonIndex = content.indexOf(':');
      if (colonIndex !== -1) {
        const key = content.slice(0, colonIndex).trim();
        let val = content.slice(colonIndex + 1).trim();

        // Handle inline comments
        if (val.includes(' #')) val = val.split(' #')[0].trim();

        i++;
        if (val === '|' || val === '>') {
          // Block scalar
          let block = [];
          while (i < lines.length) {
            const nextIndent = lines[i].search(/\S/);
            if (lines[i].trim() && nextIndent <= currentIndent) break;
            block.push(lines[i].slice(currentIndent + 2));
            i++;
          }
          obj[key] = block.join(val === '|' ? '\n' : ' ').trim();
        } else if (val === '') {
          obj[key] = parseRecursive(currentIndent);
        } else {
          obj[key] = coerceValue(val);
        }
      } else {
        i++; // Skip malformed lines
      }
    }
    return isArr ? arr : obj;
  }

  function coerceValue(val) {
    // Strip quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      return val.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    const low = val.toLowerCase();
    if (low === 'true' || low === 'yes' || low === 'on') return true;
    if (low === 'false' || low === 'no' || low === 'off') return false;
    if (low === 'null' || low === '~') return null;
    if (!isNaN(val) && val !== '') return Number(val);
    return val;
  }

  return parseRecursive();
}

function jsonToYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (obj.includes('\n')) {
      const lines = obj.split('\n').map(l => '  '.repeat(indent + 1) + l).join('\n');
      return '|\n' + lines;
    }
    if (/[#:[\]{}|>&!%@`]|^[ \t\n/]| [ \t\n/]/.test(obj)) return `"${obj.replace(/"/g, '\\"')}"`;
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      const val = jsonToYaml(item, indent + 1);
      return `${pad}- ${typeof item === 'object' && item !== null ? '\n' + val : val.trim()}`;
    }).join('\n');
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return keys.map(k => {
      const v = obj[k];
      const val = jsonToYaml(v, indent + 1);
      return `${pad}${k}: ${typeof v === 'object' && v !== null ? '\n' + val : val}`;
    }).join('\n');
  }
  return String(obj);
}

// === BASE64 / JWT ===
function initBase64Jwt() {
  const inp = document.getElementById('b64Input');
  const out = document.getElementById('b64Output');

  document.getElementById('b64Encode').addEventListener('click', () => {
    try { out.value = btoa(unescape(encodeURIComponent(inp.value))); } catch (e) { out.value = 'Error: ' + e.message; }
  });
  document.getElementById('b64Decode').addEventListener('click', () => {
    try { out.value = decodeURIComponent(escape(atob(inp.value.trim()))); } catch (e) { out.value = 'Error: ' + e.message; }
  });
  document.getElementById('jwtDecode').addEventListener('click', () => {
    try {
      const parts = inp.value.trim().split('.');
      if (parts.length < 2) throw new Error('Invalid JWT format');
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      out.value = '=== HEADER ===\n' + JSON.stringify(header, null, 2) + '\n\n=== PAYLOAD ===\n' + JSON.stringify(payload, null, 2);
    } catch (e) {
      out.value = 'Error: ' + e.message;
      showToast('Invalid JWT data', 'error');
    }
  });
  document.getElementById('b64CopyOutput').addEventListener('click', () => copyText(out.value));
}

// === CRON GENERATOR ===
function initCron() {
  const fields = ['cronMin', 'cronHour', 'cronDom', 'cronMonth', 'cronDow'];
  const exprEl = document.getElementById('cronExpr');
  const humanEl = document.getElementById('cronHuman');

  function update() {
    const vals = fields.map(id => document.getElementById(id).value.trim() || '*');
    const expr = vals.join(' ');
    exprEl.textContent = expr;
    humanEl.textContent = describeCron(vals);
  }

  fields.forEach(id => document.getElementById(id).addEventListener('input', update));

  document.getElementById('cronPresets').addEventListener('click', e => {
    const btn = e.target.closest('[data-cron]');
    if (!btn) return;
    const parts = btn.dataset.cron.split(' ');
    fields.forEach((id, i) => document.getElementById(id).value = parts[i]);
    update();
  });

  document.getElementById('cronCopy').addEventListener('click', () => copyText(exprEl.textContent));
  update();
}

function describeCron([min, hour, dom, month, dow]) {
  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') return 'Every minute';
  let parts = [];
  if (min.startsWith('*/')) parts.push(`Every ${min.slice(2)} minutes`);
  else if (min !== '*') parts.push(`At minute ${min}`);
  if (hour.startsWith('*/')) parts.push(`every ${hour.slice(2)} hours`);
  else if (hour !== '*') parts.push(`at hour ${hour}`);
  if (dom !== '*') parts.push(`on day ${dom} of month`);
  if (month !== '*') parts.push(`in month ${month}`);
  const days = { '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat', '7': 'Sun', '1-5': 'Mon-Fri', '0,6': 'Weekends' };
  if (dow !== '*') parts.push(`on ${days[dow] || 'day ' + dow}`);
  return parts.join(', ') || 'Custom schedule';
}

// === REGEX TESTER ===
function initRegex() {
  const pattern = document.getElementById('regexPattern');
  const flags = document.getElementById('regexFlags');
  const input = document.getElementById('regexInput');
  const output = document.getElementById('regexOutput');
  const count = document.getElementById('matchCount');

  function test() {
    const text = input.value;
    const p = pattern.value;
    if (!p || !text) { output.innerHTML = text || ''; count.textContent = '0 matches'; return; }
    try {
      const re = new RegExp(p, flags.value);
      let matches = 0;
      const result = text.replace(re, m => { matches++; return `<span class="match">${m}</span>`; });
      output.innerHTML = result;
      count.textContent = `${matches} match${matches !== 1 ? 'es' : ''}`;
    } catch (e) {
      output.textContent = 'Invalid regex: ' + e.message;
      count.textContent = 'Error';
      showToast('Regex Error: ' + e.message, 'error');
    }
  }

  [pattern, flags, input].forEach(el => el.addEventListener('input', test));
}

// === SCRIPT SNIPPETS ===
function initSnippets() {
  let snippetsSource = localStorage.getItem('devops_snippets') || localStorage.getItem('devtool_snippets') || '[]';
  let snippets = JSON.parse(snippetsSource);
  const grid = document.getElementById('snippetGrid');
  const search = document.getElementById('snippetSearch');
  const tagFilters = document.getElementById('snippetTagFilters');
  let activeTags = new Set();

  function save() { localStorage.setItem('devops_snippets', JSON.stringify(snippets)); }

  function render() {
    const q = search.value.toLowerCase();
    const filtered = snippets.filter(s => {
      const matchSearch = s.title.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)) || s.code.toLowerCase().includes(q);
      const matchTags = activeTags.size === 0 || Array.from(activeTags).every(t => s.tags.includes(t));
      return matchSearch && matchTags;
    });

    grid.innerHTML = filtered.map((s, i) => `
      <div class="snippet-card">
        <div class="snippet-card-header">
          <span class="snippet-card-title">${s.title}</span>
          <div class="snippet-card-tags">${s.tags.map(t => `<span class="snippet-tag">${t}</span>`).join('')}</div>
        </div>
        <div class="snippet-card-code">${escHtml(s.code)}</div>
        <div class="snippet-card-actions">
          <button class="btn btn-copy" onclick="copyText(snippetsList[${i}].code)">Copy</button>
          <button class="btn btn-danger" onclick="deleteSnippet(${i})">Delete</button>
        </div>
      </div>
    `).join('') || '<p style="color:var(--text-muted);padding:20px;">No snippets found.</p>';

    window.snippetsList = filtered;
    renderTags();
  }

  function renderTags() {
    const allTags = new Set();
    snippets.forEach(s => s.tags.forEach(t => allTags.add(t)));

    let html = `<span class="chip ${activeTags.size === 0 ? 'active' : ''}" data-tag="all">All</span>`;
    Array.from(allTags).sort().forEach(t => {
      html += `<span class="chip ${activeTags.has(t) ? 'active' : ''}" data-tag="${t}">${t}</span>`;
    });
    tagFilters.innerHTML = html;
  }

  tagFilters.addEventListener('click', e => {
    if (e.target.classList.contains('chip')) {
      const tag = e.target.dataset.tag;
      if (tag === 'all') activeTags.clear();
      else activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
      render();
    }
  });

  window.deleteSnippet = (i) => {
    const realIdx = snippets.indexOf(window.snippetsList[i]);
    if (realIdx > -1) {
      showModal({
        title: 'Delete Snippet?',
        body: `Are you sure you want to delete "${snippets[realIdx].title}"?`,
        buttons: [
          { label: 'Cancel', class: 'btn-secondary' },
          {
            label: 'Delete', class: 'btn-danger', onClick: () => {
              snippets.splice(realIdx, 1);
              save(); render();
              showToast('Snippet deleted', 'info');
            }
          }
        ]
      });
    }
  };

  document.getElementById('snippetSave').addEventListener('click', () => {
    const title = document.getElementById('snippetTitle').value.trim();
    const tags = document.getElementById('snippetTags').value.split(',').map(t => t.trim()).filter(Boolean);
    const code = document.getElementById('snippetCode').value.trim();

    if (!title || !code) return showToast('Title and Code are required', 'error');

    snippets.unshift({ title, tags, code });
    save(); render();

    document.getElementById('snippetTitle').value = '';
    document.getElementById('snippetTags').value = '';
    document.getElementById('snippetCode').value = '';
    showToast('Snippet saved!', 'success');
  });

  document.getElementById('snippetExport').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ snippets }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devops-snippets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Snippets exported', 'success');
  });

  document.getElementById('snippetImport').addEventListener('click', () => {
    importData((data) => {
      const imported = data.snippets || (Array.isArray(data) ? data : []);
      if (!imported.length) return showToast('No snippets found in file', 'error');

      showModal({
        title: '📥 Import Snippets',
        body: `Found ${imported.length} snippets. Choose import method:`,
        buttons: [
          { label: 'Cancel', class: 'btn-secondary' },
          {
            label: 'Merge', class: 'btn-primary', onClick: () => {
              snippets = [...imported, ...snippets];
              save(); render();
              showToast(`Merged ${imported.length} snippets`, 'success');
            }
          },
          {
            label: 'Replace', class: 'btn-danger', onClick: () => {
              snippets = imported;
              save(); render();
              showToast('Snippets replaced', 'success');
            }
          }
        ]
      });
    }, (err) => showToast('Import failed: ' + err.message, 'error'));
  });

  search.addEventListener('input', debounce(render, 250));
  render();
}

function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// === HTTP STATUS CODES ===
function initHttpCodes() {
  const codes = [
    [100, 'Continue', 'Client should continue request', 'rfc9110#status.100'],
    [101, 'Switching Protocols', 'Server switching protocols', 'rfc9110#status.101'],
    [200, 'OK', 'Request succeeded', 'rfc9110#status.200'],
    [201, 'Created', 'Resource created', 'rfc9110#status.201'],
    [202, 'Accepted', 'Accepted for processing', 'rfc9110#status.202'],
    [204, 'No Content', 'Success with no body', 'rfc9110#status.204'],
    [301, 'Moved Permanently', 'Permanent URL redirection', 'rfc9110#status.301'],
    [302, 'Found', 'Temporary URL redirection', 'rfc9110#status.302'],
    [304, 'Not Modified', 'Resource not modified', 'rfc9110#status.304'],
    [400, 'Bad Request', 'Malformed request syntax', 'rfc9110#status.400'],
    [401, 'Unauthorized', 'Authentication required', 'rfc9110#status.401'],
    [403, 'Forbidden', 'Server refuses action', 'rfc9110#status.403'],
    [404, 'Not Found', 'Resource not found', 'rfc9110#status.404'],
    [405, 'Method Not Allowed', 'HTTP method not supported', 'rfc9110#status.405'],
    [409, 'Conflict', 'Request conflict with state', 'rfc9110#status.409'],
    [429, 'Too Many Requests', 'Rate limiting in effect', 'rfc6585#section-4'],
    [500, 'Internal Server Error', 'Generic server error', 'rfc9110#status.500'],
    [502, 'Bad Gateway', 'Invalid response from upstream', 'rfc9110#status.502'],
    [503, 'Service Unavailable', 'Server temporarily offline', 'rfc9110#status.503'],
    [504, 'Gateway Timeout', 'Upstream server timeout', 'rfc9110#status.504']
  ];

  const grid = document.getElementById('httpGrid');
  const search = document.getElementById('httpSearch');
  const filters = document.getElementById('httpFilters');
  let activeFilter = 'all';

  function render() {
    const q = search.value.toLowerCase();
    const filtered = codes.filter(([c, n, d]) =>
      (activeFilter === 'all' || Math.floor(c / 100) == activeFilter) &&
      (c.toString().includes(q) || n.toLowerCase().includes(q) || d.toLowerCase().includes(q))
    );

    grid.innerHTML = filtered.map(([c, n, d, rfc]) => `
      <div class="card" style="display: flex; flex-direction: column; gap: 8px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="code-badge badge-${Math.floor(c / 100)}xx" style="background: var(--bg-tertiary); padding: 4px 10px; border-radius: 4px; font-weight: 700; color: var(--accent-cyan); border: 1px solid var(--glass-border);">${c}</div>
          <a href="https://httpwg.org/specs/${rfc}" target="_blank" style="font-size: 0.7rem; color: var(--accent-cyan); text-decoration: none; opacity: 0.7;">RFC Specs ↗</a>
        </div>
        <div style="font-weight: 700; font-size: 0.95rem; margin-top: 4px;">${n}</div>
        <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; flex-grow: 1;">${d}</p>
        <button class="btn btn-sm btn-ghost" onclick="copyCurlMock(${c}, '${n}')" style="font-size: 0.7rem; padding: 4px 0; border-top: 1px solid var(--glass-border); margin-top: 8px; justify-content: flex-start;">📋 Copy as curl mock</button>
      </div>
    `).join('');
  }

  window.copyCurlMock = (code, name) => {
    const curl = `curl -i -X GET http://localhost:8080/ \\
  -H "Accept: application/json" \\
  --next http://localhost:8080/ \\
  -I # Mocking ${code} ${name}`;
    copyText(curl);
    showToast(`Curl mock for ${code} copied`, 'success');
  };

  search.addEventListener('input', debounce(render, 250));
  filters.addEventListener('click', e => {
    if (e.target.classList.contains('chip')) {
      filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.dataset.filter;
      render();
    }
  });
  render();
}

// === LLM PROMPT LIBRARY ===
function initPromptLibrary() {
  const prompts = [
    { cat: 'docker', title: 'Dockerfile Optimization', text: 'Analyze this Dockerfile and suggest optimizations for smaller image size, better layer caching, and security best practices:\n\n[paste Dockerfile]' },
    { cat: 'docker', title: 'Docker Compose Debugging', text: 'Help me debug this docker-compose.yml. Services are not communicating properly:\n\n[paste docker-compose.yml]' },
    { cat: 'docker', title: 'Multi-Stage Build', text: 'Convert this Dockerfile to a multi-stage build to reduce final image size while keeping all build dependencies:\n\n[paste Dockerfile]' },
    { cat: 'kubernetes', title: 'K8s Manifest Review', text: 'Review this Kubernetes manifest for best practices including resource limits, health checks, security context, and pod disruption budgets:\n\n[paste YAML]' },
    { cat: 'kubernetes', title: 'K8s Troubleshooting', text: 'A pod is in CrashLoopBackOff state. Here are the logs and describe output. Help me diagnose the issue:\n\n[paste kubectl logs and describe output]' },
    { cat: 'kubernetes', title: 'Helm Chart Template', text: 'Generate a production-ready Helm chart template for a microservice with configurable replicas, HPA, ingress, and configmaps.' },
    { cat: 'terraform', title: 'Terraform Module Review', text: 'Review this Terraform module for best practices, security issues, and suggest improvements:\n\n[paste .tf file]' },
    { cat: 'terraform', title: 'Infrastructure as Code', text: 'Generate Terraform configuration for: [describe infrastructure] with proper state management, modules, and variable definitions.' },
    { cat: 'debugging', title: 'Log Analysis', text: 'Analyze these application logs and identify the root cause of the error. Suggest fixes:\n\n[paste logs]' },
    { cat: 'debugging', title: 'Performance Investigation', text: 'This API endpoint is responding slowly (~5s). Here is the code and metrics. Identify bottlenecks:\n\n[paste code and metrics]' },
    { cat: 'code-review', title: 'Code Review Assistant', text: 'Review this code for bugs, security vulnerabilities, performance issues, and adherence to best practices:\n\n[paste code]' },
    { cat: 'code-review', title: 'Refactoring Suggestions', text: 'Suggest refactoring improvements for this code focusing on readability, maintainability, and SOLID principles:\n\n[paste code]' },
    { cat: 'incident', title: 'Incident Response', text: 'We have a production incident: [describe symptoms]. Help me create an incident response plan with immediate actions, investigation steps, and communication template.' },
    { cat: 'incident', title: 'Post-Mortem Template', text: 'Help me write a blameless post-mortem for this incident: [describe incident]. Include timeline, root cause, impact, and action items.' },
    { cat: 'security', title: 'Security Audit', text: 'Perform a security audit of this configuration/code. Identify vulnerabilities and suggest remediations:\n\n[paste code/config]' },
    { cat: 'security', title: 'Secret Management', text: 'Help me set up proper secret management for a microservices architecture using [Vault/AWS Secrets Manager/K8s Secrets]. Current setup:\n\n[describe current approach]' },
  ];

  const grid = document.getElementById('promptGrid');
  const search = document.getElementById('promptSearch');
  const filters = document.getElementById('promptFilters');
  let activeFilter = 'all';

  function render() {
    const q = search.value.toLowerCase();
    const filtered = prompts.filter(p =>
      (activeFilter === 'all' || p.cat === activeFilter) &&
      (p.title.toLowerCase().includes(q) || p.text.toLowerCase().includes(q))
    );
    grid.innerHTML = filtered.map(p => `
      <div class="prompt-card" onclick="copyText(\`${p.text.replace(/`/g, '\\`')}\`)">
        <div class="prompt-card-category">${p.cat}</div>
        <div class="prompt-card-title">${p.title}</div>
        <div class="prompt-card-text">${p.text}</div>
        <div class="prompt-card-actions"><button class="btn btn-copy">📋 Copy Prompt</button></div>
      </div>
    `).join('');
  }

  search.addEventListener('input', render);
  filters.addEventListener('click', e => {
    if (e.target.classList.contains('chip')) {
      filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.dataset.filter;
      render();
    }
  });
  render();
}

// === AI WORKFLOW DESIGNER ===
function initWorkflowDesigner() {
  const canvas = document.getElementById('workflowCanvas');
  const svg = document.getElementById('workflowSvg');
  let nodes = [];
  let connections = [];
  let nextNodeId = 1;
  let activeConnLine = null;
  let draggingNode = null;

  const nodeTypes = {
    trigger: { label: 'New Trigger', color: 'trigger' },
    llm: { label: 'LLM Call', color: 'llm' },
    tool: { label: 'Tool Action', color: 'tool' },
    condition: { label: 'Condition', color: 'condition' },
    output: { label: 'Output', color: 'output' },
  };

  function createNode(type, x, y, label = null) {
    const id = nextNodeId++;
    const node = { id, type, x, y, label: label || nodeTypes[type].label };
    nodes.push(node);
    renderNode(node);
    return node;
  }

  function renderNode(node) {
    const el = document.createElement('div');
    el.className = 'workflow-node';
    el.id = `wf-node-${node.id}`;
    el.style.left = node.x + 'px';
    el.style.top = node.y + 'px';
    el.innerHTML = `
      <div class="workflow-node-type ${node.type}">${node.type.toUpperCase()}</div>
      <div class="workflow-node-label">${node.label}</div>
      <div class="workflow-node-port input" data-id="${node.id}"></div>
      <div class="workflow-node-port output" data-id="${node.id}"></div>
    `;

    el.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('workflow-node-port')) return;
      startNodeDrag(e, node, el);
    });

    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e, node);
    });

    // Port connection logic
    el.querySelector('.output').addEventListener('mousedown', (e) => {
      e.stopPropagation();
      startConnection(e, node);
    });

    el.querySelector('.input').addEventListener('mouseup', (e) => {
      e.stopPropagation();
      finishConnection(node);
    });

    canvas.appendChild(el);
  }

  function startNodeDrag(e, node, el) {
    draggingNode = { node, el, startX: e.clientX, startY: e.clientY, nodeX: node.x, nodeY: node.y };
    el.classList.add('dragging');
    window.addEventListener('mousemove', onNodeDrag);
    window.addEventListener('mouseup', stopNodeDrag);
  }

  function onNodeDrag(e) {
    if (!draggingNode) return;
    const dx = e.clientX - draggingNode.startX;
    const dy = e.clientY - draggingNode.startY;
    draggingNode.node.x = draggingNode.nodeX + dx;
    draggingNode.node.y = draggingNode.nodeY + dy;
    draggingNode.el.style.left = draggingNode.node.x + 'px';
    draggingNode.el.style.top = draggingNode.node.y + 'px';
    drawAllConnections();
  }

  function stopNodeDrag() {
    if (draggingNode) draggingNode.el.classList.remove('dragging');
    draggingNode = null;
    window.removeEventListener('mousemove', onNodeDrag);
    window.removeEventListener('mouseup', stopNodeDrag);
  }

  let connStartNode = null;

  function startConnection(e, node) {
    connStartNode = node;
    activeConnLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    activeConnLine.setAttribute('stroke', 'var(--accent-cyan)');
    activeConnLine.setAttribute('stroke-width', '2');
    activeConnLine.setAttribute('fill', 'none');
    activeConnLine.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(activeConnLine);
    window.addEventListener('mousemove', onConnDrag);
    window.addEventListener('mouseup', stopConnDrag);
  }

  function onConnDrag(e) {
    if (!connStartNode || !activeConnLine) return;
    const rect = canvas.getBoundingClientRect();
    const x1 = connStartNode.x + 160;
    const y1 = connStartNode.y + 35;
    const x2 = e.clientX - rect.left + canvas.scrollLeft;
    const y2 = e.clientY - rect.top + canvas.scrollTop;
    activeConnLine.setAttribute('d', getBezierPath(x1, y1, x2, y2));
  }

  function stopConnDrag() {
    window.removeEventListener('mousemove', onConnDrag);
    window.removeEventListener('mouseup', stopConnDrag);
    setTimeout(() => {
      if (activeConnLine) { svg.removeChild(activeConnLine); activeConnLine = null; }
      connStartNode = null;
    }, 10);
  }

  function finishConnection(targetNode) {
    if (!connStartNode || connStartNode.id === targetNode.id) return;
    // Avoid duplicates
    if (connections.some(c => c.from === connStartNode.id && c.to === targetNode.id)) return;

    connections.push({ from: connStartNode.id, to: targetNode.id });
    drawAllConnections();
  }

  function getBezierPath(x1, y1, x2, y2) {
    const dx = Math.abs(x1 - x2) / 2;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  function drawAllConnections() {
    svg.innerHTML = '';
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (fromNode && toNode) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', getBezierPath(fromNode.x + 160, fromNode.y + 35, toNode.x, toNode.y + 35));
        path.setAttribute('stroke', 'rgba(255,255,255,0.2)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
      }
    });
  }

  function showContextMenu(e, node) {
    const existing = document.querySelector('.wf-context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'wf-context-menu';
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.innerHTML = `
      <div class="wf-menu-item" id="wf-rename">✏️ Rename</div>
      <div class="wf-menu-item" id="wf-duplicate">📋 Duplicate</div>
      <div class="wf-menu-item danger" id="wf-delete">🗑️ Delete</div>
    `;

    document.body.appendChild(menu);

    menu.querySelector('#wf-rename').onclick = () => {
      const newLabel = prompt('Enter new label:', node.label);
      if (newLabel) {
        node.label = newLabel;
        document.querySelector(`#wf-node-${node.id} .workflow-node-label`).textContent = newLabel;
      }
      menu.remove();
    };

    menu.querySelector('#wf-duplicate').onclick = () => {
      createNode(node.type, node.x + 20, node.y + 20, node.label + ' (Copy)');
      menu.remove();
    };

    menu.querySelector('#wf-delete').onclick = () => {
      nodes = nodes.filter(n => n.id !== node.id);
      connections = connections.filter(c => c.from !== node.id && c.to !== node.id);
      document.getElementById(`wf-node-${node.id}`).remove();
      drawAllConnections();
      menu.remove();
    };

    const closeHandler = () => { menu.remove(); window.removeEventListener('click', closeHandler); };
    setTimeout(() => window.addEventListener('click', closeHandler), 10);
  }

  document.querySelectorAll('[data-wf-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      createNode(btn.dataset.wfAdd, 50 + Math.random() * 100, 50 + Math.random() * 100);
    });
  });

  document.getElementById('wfClear').onclick = () => {
    nodes = [];
    connections = [];
    canvas.innerHTML = '<svg id="workflowSvg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;"></svg>';
    drawAllConnections();
  };

  document.getElementById('wfExport').onclick = () => {
    const data = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.label, x: n.x, y: n.y })),
      connections: connections
    };
    copyText(JSON.stringify(data, null, 2));
    showToast('Workflow JSON exported to clipboard!', 'success');
  };
}

// === LLM PLAYGROUND ===
let conversationHistory = [];

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.trim().split(/\s+/).length * 1.33);
}

function initPlayground() {
  const provider = document.getElementById('llmProvider');
  const model = document.getElementById('llmModel');
  const apiKey = document.getElementById('llmApiKey');
  const baseUrl = document.getElementById('llmBaseUrl');
  const temp = document.getElementById('llmTemp');
  const tempVal = document.getElementById('tempVal');
  const system = document.getElementById('llmSystem');
  const chatHistory = document.getElementById('chatHistory');
  const chatInput = document.getElementById('chatInput');
  const tokenCount = document.getElementById('tokenCount');

  // Load saved settings
  const saved = JSON.parse(localStorage.getItem('devtool_llm') || '{}');
  if (saved.provider) provider.value = saved.provider;
  if (saved.model) model.value = saved.model;
  if (saved.apiKey) apiKey.value = saved.apiKey;
  if (saved.baseUrl) baseUrl.value = saved.baseUrl;
  if (saved.temp) { temp.value = saved.temp; tempVal.textContent = saved.temp; }
  if (saved.system) system.value = saved.system;

  // Model presets
  const presets = {
    openai: 'gpt-4o',
    gemini: 'gemini-1.5-pro',
    ollama: 'llama3'
  };

  provider.addEventListener('change', () => {
    model.value = presets[provider.value] || '';
    baseUrl.placeholder = provider.value === 'openai' ? 'https://api.openai.com/v1' :
      provider.value === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta' :
        'http://localhost:11434/v1';
  });

  temp.addEventListener('input', () => tempVal.textContent = temp.value);

  chatInput.addEventListener('input', () => {
    tokenCount.textContent = `~${estimateTokens(chatInput.value)} tokens (est.)`;
  });

  document.getElementById('llmSaveSettings').addEventListener('click', () => {
    localStorage.setItem('devtool_llm', JSON.stringify({
      provider: provider.value,
      model: model.value,
      apiKey: apiKey.value,
      baseUrl: baseUrl.value,
      temp: temp.value,
      system: system.value,
    }));
    showToast('Settings saved!', 'success');
  });

  document.getElementById('llmClearChat').addEventListener('click', () => {
    conversationHistory = [];
    chatHistory.innerHTML = '<div class="chat-msg assistant">👋 Conversation cleared.</div>';
    showToast('Chat history cleared', 'info');
  });

  document.getElementById('llmCopyChat').addEventListener('click', () => {
    const md = conversationHistory.map(m => `**${m.role.toUpperCase()}**: ${m.content}`).join('\n\n');
    copyText(md);
    showToast('Conversation copied as Markdown', 'success');
  });

  document.getElementById('clearApiKey').addEventListener('click', () => {
    apiKey.value = '';
    // Also update saved settings
    const current = JSON.parse(localStorage.getItem('devtool_llm') || '{}');
    current.apiKey = '';
    localStorage.setItem('devtool_llm', JSON.stringify(current));
    showToast('API Key cleared from UI and storage', 'info');
  });

  document.getElementById('chatSend').addEventListener('click', async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    tokenCount.textContent = '~0 tokens (est.)';

    appendMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });

    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-msg assistant';
    typingMsg.innerHTML = '<div class="msg-bubble">💡 Thinking...</div>';
    chatHistory.appendChild(typingMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const resp = await performLLMCall(text);
      chatHistory.removeChild(typingMsg);
      appendMessage('assistant', resp);
      conversationHistory.push({ role: 'assistant', content: resp });
    } catch (e) {
      chatHistory.removeChild(typingMsg);
      appendMessage('assistant', '💡❌ Error: ' + e.message);
    }
  });

  async function performLLMCall(prompt) {
    const p = provider.value;
    const m = model.value;
    const key = apiKey.value;
    const base = baseUrl.value;
    const t = parseFloat(temp.value);
    const s = system.value;

    if (!key && p !== 'ollama') throw new Error('API Key is missing');

    let url, headers, body;
    if (p === 'openai') {
      url = (base || 'https://api.openai.com/v1') + '/chat/completions';
      headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key };
      body = JSON.stringify({ model: m, temperature: t, messages: [{ role: 'system', content: s || 'You are a helpful assistant.' }, ...conversationHistory] });
    } else if (p === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: t } });
    } else {
      url = (base || 'http://localhost:11434') + '/v1/chat/completions';
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({ model: m, messages: [{ role: 'system', content: s }, { role: 'user', content: prompt }], stream: false });
    }

    const resp = await fetch(url, { method: 'POST', headers, body });
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${resp.status}`);
    }
    const data = await resp.json();

    if (p === 'openai') return data.choices?.[0]?.message?.content || JSON.stringify(data);
    if (p === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
    return data.choices?.[0]?.message?.content || data.response || JSON.stringify(data);
  }

  function appendMessage(role, content) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.innerHTML = `<div class="msg-bubble">${content}</div>`;
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('chatSend').click(); });
}

// === CODING CONCEPTS ===
function initCodingConcepts() {
  const concepts = [
    {
      icon: '📊', title: 'Data Structures', desc: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Hash Maps — with real-world use cases',
      sections: [
        { h: 'Arrays', text: '🔹 What: Contiguous memory block storing elements of the same type. O(1) random access by index.\n\n🌍 Real-World Example — Spotify Playlist:\nWhen you create a playlist, songs are stored in an array-like structure. You can jump to song #5 instantly (O(1) access), but inserting a song in the middle shifts everything after it (O(n)).\n\n💡 Use Cases:\n• Storing pixel data in images (2D arrays)\n• Database query results (rows of data)\n• Time-series metrics (CPU usage every second)\n• Browser history (ordered list of URLs)', code: '// Real-world: E-commerce Cart\nconst cart = ["Laptop", "Mouse", "Keyboard"];\ncart.push("Monitor");       // Add to end: O(1)\ncart.splice(1, 0, "USB-C"); // Insert at index 1: O(n)\ncart.indexOf("Mouse");      // Search: O(n)\n\n// When to use Arrays vs other structures:\n// ✅ Need fast access by index\n// ✅ Data size is known/stable\n// 💡 Frequent insertions/deletions in middle' },
        { h: 'Hash Maps', text: '🔹 What: Key-value pairs with O(1) average lookup using a hash function.\n\n🌍 Real-World Example — DNS Resolution:\nWhen you type "google.com", a DNS cache (hash map) instantly maps it to IP 142.250.80.46 without scanning all entries.\n\n💡 Use Cases:\n• Caching API responses (Redis stores key-value pairs)\n• Session management (sessionID → user data)\n• Counting word frequencies in log analysis\n• De-duplicating records in data pipelines\n• Database indexing (B-tree indexes work similarly)', code: '// Real-world: API Rate Limiter\nconst rateLimiter = new Map();\n\nfunction checkRateLimit(userId) {\n  const now = Date.now();\n  const userData = rateLimiter.get(userId);\n  \n  if (!userData) {\n    rateLimiter.set(userId, { count: 1, resetAt: now + 60000 });\n    return true; // allowed\n  }\n  \n  if (now > userData.resetAt) {\n    userData.count = 1;\n    userData.resetAt = now + 60000;\n    return true;\n  }\n  \n  if (userData.count >= 100) return false; // rate limited!\n  userData.count++;\n  return true;\n}' },
        { h: 'Stacks & Queues', text: '🔹 Stack (LIFO): Last In, First Out — like a stack of plates.\n🔹 Queue (FIFO): First In, First Out — like a line at a store.\n\n🌍 Real-World Examples:\n• Stack → Browser Back Button: Each page you visit is pushed onto a stack. Clicking "back" pops the last page.\n• Stack → Undo/Redo in VS Code: Every edit is pushed to an undo stack.\n• Queue → Print Queue: Documents print in the order they were submitted.\n• Queue → Kubernetes Pod Scheduling: Pods wait in a queue for available nodes.\n\n💡 Use Cases:\n• Function call stack (recursion)\n• Expression parsing (parentheses matching)\n• BFS traversal (queue)\n• Message queues (RabbitMQ, SQS)', code: '// Real-world: Undo/Redo System\nclass UndoRedo {\n  constructor() {\n    this.undoStack = [];\n    this.redoStack = [];\n  }\n  \n  execute(action) {\n    action.do();\n    this.undoStack.push(action);\n    this.redoStack = []; // clear redo\n  }\n  \n  undo() {\n    const action = this.undoStack.pop();\n    if (action) {\n      action.undo();\n      this.redoStack.push(action);\n    }\n  }\n  \n  redo() {\n    const action = this.redoStack.pop();\n    if (action) {\n      action.do();\n      this.undoStack.push(action);\n    }\n  }\n}' },
        { h: 'Trees & Graphs', text: '🔹 Trees: Hierarchical data with parent-child relationships. Each node has 0+ children.\n🔹 Graphs: Nodes connected by edges (can be cyclic, directed/undirected).\n\n🌍 Real-World Examples:\n• Tree → File System: Folders contain subfolders and files (tree structure).\n• Tree → DOM: HTML elements form a tree that browsers parse and render.\n• Tree → Organization Chart: CEO → VPs → Directors → Managers.\n• Graph → Google Maps: Cities are nodes, roads are edges. Dijkstra\'s algorithm finds shortest path.\n• Graph → Social Networks: Facebook friend connections form an undirected graph.\n• Graph → Microservice Dependencies: Services depend on each other (directed graph).\n\n💡 Use Cases:\n• Database B-Trees for indexing (MySQL, PostgreSQL)\n• Trie for autocomplete (search suggestions)\n• Graph for recommendation engines (Netflix, Amazon)', code: '// Real-world: File System Tree Traversal\nfunction findLargeFiles(directory, maxSize) {\n  const results = [];\n  \n  function traverse(node) {\n    if (node.type === "file") {\n      if (node.size > maxSize) results.push(node.path);\n      return;\n    }\n    // Directory: recurse into children\n    for (const child of node.children) {\n      traverse(child);\n    }\n  }\n  \n  traverse(directory);\n  return results;\n}\n\n// Real-world: Shortest Path (Dijkstra)\n// Used by: Google Maps, network routing,\n// CDN path optimization' },
      ]
    },
    {
      icon: '⚡', title: 'Algorithms', desc: 'Sorting, Searching, Dynamic Programming, Greedy — with real-world applications',
      sections: [
        { h: 'Sorting Algorithms', text: '🔹 Why sorting matters: Sorted data enables binary search (O(log n) vs O(n)), makes deduplication trivial, and improves data presentation.\n\n🌍 Real-World Examples:\n• Merge Sort → Git merge: Git uses a 3-way merge algorithm similar to merge sort to combine branches.\n• Quick Sort → V8 Engine: Chrome\'s JavaScript engine uses TimSort (hybrid of merge sort + insertion sort) for Array.sort().\n• Counting Sort → Analytics: Sorting millions of events by timestamp when the range is known.\n\nComplexity Comparison:\n• Bubble Sort: O(n²) — Educational only, never use in production\n• Merge Sort: O(n log n) — Stable, great for linked lists\n• Quick Sort: O(n log n) avg — Fastest in practice, used by most languages\n• Radix Sort: O(nk) — When sorting integers/strings of fixed length', code: '// Real-world: Sort deployment logs by severity\nconst severityOrder = { critical: 0, error: 1, warn: 2, info: 3 };\n\nfunction sortLogs(logs) {\n  return logs.sort((a, b) => {\n    // Primary: severity, Secondary: timestamp\n    const sevDiff = severityOrder[a.level] - severityOrder[b.level];\n    if (sevDiff !== 0) return sevDiff;\n    return new Date(b.timestamp) - new Date(a.timestamp);\n  });\n}\n\n// TimSort (used by JS engines internally)\n// Hybrid: insertion sort for small chunks,\n// merge sort for combining them' },
        { h: 'Binary Search', text: '🔹 What: Divide-and-conquer search on SORTED data. Eliminates half the remaining elements each step.\n\n🌍 Real-World Examples:\n• Git Bisect: Finding which commit introduced a bug. Git uses binary search across commit history — instead of checking 1000 commits, you check ~10!\n• Database Index Lookups: B-tree indexes use binary search to find rows in O(log n).\n• Load Balancer: Finding the right server in a consistent hashing ring.\n\n⚡ Power: Searching 1 billion items takes only 30 comparisons!', code: '// Real-world: Git Bisect (finding bad commit)\nfunction gitBisect(commits, isBugPresent) {\n  let lo = 0, hi = commits.length - 1;\n  \n  while (lo < hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    console.log(`Testing commit ${commits[mid].hash}...`);\n    \n    if (isBugPresent(commits[mid])) {\n      hi = mid; // bug exists, search earlier\n    } else {\n      lo = mid + 1; // no bug, search later\n    }\n  }\n  \n  return commits[lo]; // first bad commit\n}\n// 1024 commits → only 10 tests needed!' },
        { h: 'Dynamic Programming', text: '🔹 What: Solve complex problems by breaking them into overlapping subproblems and caching results.\n\n🌍 Real-World Examples:\n• Google Maps — Shortest Path: Uses DP (Dijkstra/Bellman-Ford) to find optimal routes.\n• Netflix — Text Similarity: Uses edit distance (DP) for search spell-correction ("did you mean?").\n• Amazon — Knapsack Problem: Optimizing which items to load in delivery trucks (weight/value optimization).\n• Webpack — Chunk Splitting: Optimizes bundle sizes using DP-like algorithms.\n\n💡 Use Cases:\n• Resource allocation and scheduling\n• DNA sequence alignment (bioinformatics)\n• Caching strategies (LRU cache implementation)\n• Financial portfolio optimization', code: '// Real-world: LRU Cache (used by Redis, CDNs)\nclass LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map(); // maintains insertion order\n  }\n  \n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val); // move to end (most recent)\n    return val;\n  }\n  \n  put(key, value) {\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    if (this.cache.size > this.capacity) {\n      // Evict least recently used (first item)\n      const oldest = this.cache.keys().next().value;\n      this.cache.delete(oldest);\n    }\n  }\n}\n// Used everywhere: browser cache, DNS cache,\n// database query cache, CDN edge caching' },
      ]
    },
    {
      icon: '💡💡', title: 'OOP Principles', desc: 'Encapsulation, Inheritance, Polymorphism, Abstraction — real-world software examples',
      sections: [
        { h: 'Encapsulation', text: '🔹 What: Bundling data and methods together, hiding internal state. Only expose what\'s necessary.\n\n🌍 Real-World Example — Bank Account:\nYou can deposit/withdraw via methods, but you can\'t directly modify the balance variable. The internal logic validates transactions.\n\n💡 Use Cases:\n• API clients that hide HTTP complexity behind simple methods\n• Database connection pools that manage connections internally\n• AWS SDK: You call s3.putObject() without knowing the HTTP signing process', code: '// Real-world: Payment Gateway Client\nclass PaymentGateway {\n  #apiKey;        // private - hidden\n  #baseUrl;       // private - hidden\n  #retryCount;    // private - hidden\n  \n  constructor(apiKey) {\n    this.#apiKey = apiKey;\n    this.#baseUrl = "https://api.stripe.com/v1";\n    this.#retryCount = 3;\n  }\n  \n  // Public interface - simple and clean\n  async charge(amount, currency, card) {\n    return this.#makeRequest("/charges", {\n      amount, currency, source: card\n    });\n  }\n  \n  // Private - all complexity hidden\n  async #makeRequest(endpoint, data) {\n    for (let i = 0; i < this.#retryCount; i++) {\n      try {\n        const res = await fetch(this.#baseUrl + endpoint, {\n          method: "POST",\n          headers: { "Authorization": `Bearer ${this.#apiKey}` },\n          body: JSON.stringify(data)\n        });\n        return await res.json();\n      } catch (e) {\n        if (i === this.#retryCount - 1) throw e;\n      }\n    }\n  }\n}' },
        { h: 'Inheritance & Polymorphism', text: '🔹 Inheritance: Create new classes based on existing ones. Child inherits parent\'s properties/methods.\n🔹 Polymorphism: Same method name, different behavior based on the object type.\n\n🌍 Real-World Example — Notification System:\nA base Notification class has a send() method. EmailNotification, SMSNotification, and PushNotification all override send() with their own logic. The calling code doesn\'t care which type — it just calls send().\n\n💡 Use Cases:\n• Payment processors (Stripe, PayPal, Square — all have charge())\n• Logging backends (Console, File, CloudWatch — all have log())\n• Cloud providers (AWS, GCP, Azure — all have deploy())', code: '// Real-world: Multi-channel Notification System\nclass Notification {\n  constructor(to, message) {\n    this.to = to;\n    this.message = message;\n    this.timestamp = new Date();\n  }\n  send() { throw new Error("Override me!"); }\n}\n\nclass EmailNotification extends Notification {\n  send() {\n    console.log(`📧 Email to ${this.to}: ${this.message}`);\n    // Uses SendGrid/SES internally\n  }\n}\n\nclass SlackNotification extends Notification {\n  send() {\n    console.log(`💬 Slack to ${this.to}: ${this.message}`);\n    // Uses Slack Webhook internally\n  }\n}\n\nclass PagerDutyNotification extends Notification {\n  send() {\n    console.log(`🚨 PagerDuty alert: ${this.message}`);\n    // Triggers on-call engineer\n  }\n}\n\n// Polymorphism in action — caller doesn\'t care about type\nfunction alertTeam(notifications) {\n  notifications.forEach(n => n.send()); // same interface!\n}' },
        { h: 'Abstraction', text: '🔹 What: Hiding complex implementation details behind a simple interface.\n\n🌍 Real-World Example — Kubernetes kubectl:\nYou run `kubectl apply -f deploy.yaml` — behind the scenes it validates YAML, communicates with API server, schedules pods, pulls images, configures networking, and sets up health checks. You don\'t need to know any of that.\n\n💡 Use Cases:\n• ORMs (Sequelize, Prisma): Write JS objects, they generate SQL\n• Docker: Write a Dockerfile, it handles filesystem, networking, namespaces\n• Terraform: Declare infrastructure, it handles API calls to cloud providers' },
      ]
    },
    {
      icon: '🎯', title: 'SOLID Principles', desc: 'Five design principles for maintainable, scalable software — with practical examples',
      sections: [
        { h: 'S — Single Responsibility Principle', text: '🔹 "A class should have only one reason to change."\n\n🌍 Real-World Example — Microservices:\nInstead of one monolith handling auth, payments, and notifications, each is a separate service. If the payment logic changes, only the payment service is modified.\n\n💡 Bad: UserService handles login, profile updates, email sending, and report generation.\n✅ Good: AuthService, ProfileService, EmailService, ReportService — each has ONE job.', code: '// 💡 BAD: One class does everything\nclass UserManager {\n  authenticate(user) { /* ... */ }\n  updateProfile(user) { /* ... */ }\n  sendEmail(user, msg) { /* ... */ }\n  generateReport(user) { /* ... */ }\n}\n\n// ✅ GOOD: Each class has one responsibility\nclass AuthService {\n  authenticate(user) { /* ... */ }\n}\n\nclass ProfileService {\n  updateProfile(user, data) { /* ... */ }\n}\n\nclass NotificationService {\n  sendEmail(to, msg) { /* ... */ }\n}' },
        { h: 'O — Open/Closed Principle', text: '🔹 "Open for extension, closed for modification."\n\n🌍 Real-World Example — Payment Processors:\nDon\'t modify existing code to add PayPal support. Instead, create a new PayPalProcessor that implements the PaymentProcessor interface.\n\n💡 Use Case: Plugin systems (VS Code extensions, Webpack plugins, Express middleware) — all follow this principle.', code: '// ✅ GOOD: Add new payment methods without changing existing code\nclass PaymentProcessor {\n  process(amount) { throw new Error("Override"); }\n}\n\nclass StripeProcessor extends PaymentProcessor {\n  process(amount) { /* Stripe API call */ }\n}\n\nclass PayPalProcessor extends PaymentProcessor {\n  process(amount) { /* PayPal API call */ }\n}\n\n// Adding RazorPay? Just create new class!\nclass RazorPayProcessor extends PaymentProcessor {\n  process(amount) { /* RazorPay API call */ }\n}' },
        { h: 'L — Liskov Substitution Principle', text: '🔹 "Subtypes must be substitutable for their base types without breaking the program."\n\n🌍 Real-World Example — Cloud Storage:\nIf your code works with a StorageService interface, switching from AWS S3 to Google Cloud Storage should work without any code changes.\n\n💡 Classic violation: Square extends Rectangle but breaks when you set width independently of height.' },
        { h: 'I — Interface Segregation Principle', text: '🔹 "Clients should not be forced to depend on interfaces they do not use."\n\n🌍 Real-World Example — Docker:\nA container doesn\'t need to implement a VM interface. Docker provides just the container-specific interface (start, stop, exec) without exposing hypervisor-level operations.\n\n💡 Bad: One giant IWorker interface with code(), test(), deploy(), design().\n✅ Good: IDeveloper (code, test), IDesigner (design), IDevOps (deploy).' },
        { h: 'D — Dependency Inversion Principle', text: '🔹 "High-level modules should not depend on low-level modules. Both should depend on abstractions."\n\n🌍 Real-World Example — Logging:\nYour application code shouldn\'t directly use console.log or Winston. Instead, depend on a Logger interface. Swap implementations (CloudWatch, Datadog, ELK) without changing business logic.\n\n💡 Use Case: Dependency injection in Express/NestJS, Spring Boot, and .NET — frameworks inject dependencies at runtime.', code: '// 💡 BAD: Direct dependency on specific logger\nclass OrderService {\n  placeOrder(order) {\n    console.log("Order placed: " + order.id); // tightly coupled!\n  }\n}\n\n// ✅ GOOD: Depend on abstraction\nclass OrderService {\n  constructor(logger) { this.logger = logger; }\n  placeOrder(order) {\n    this.logger.log("Order placed: " + order.id);\n  }\n}\n\n// Swap implementations freely:\nconst svc1 = new OrderService(new ConsoleLogger());\nconst svc2 = new OrderService(new CloudWatchLogger());\nconst svc3 = new OrderService(new DatadogLogger());' },
      ]
    },
    {
      icon: '🔄', title: 'Design Patterns', desc: 'Singleton, Factory, Observer, Strategy, Decorator — used by Netflix, React, Node.js',
      sections: [
        { h: 'Singleton Pattern', text: '🔹 What: Ensures only one instance of a class exists globally.\n\n🌍 Real-World Examples:\n• Database Connection Pool: Only one pool manager across the entire app.\n• Logger Instance: One Winston/Pino logger shared everywhere.\n• Redux Store: Single source of truth for React app state.\n• Kubernetes: etcd cluster has a single leader at any time.', code: '// Real-world: Database Connection Pool\nclass DatabasePool {\n  static #instance;\n  #connections = [];\n  \n  static getInstance() {\n    if (!this.#instance) {\n      this.#instance = new DatabasePool();\n      this.#instance.#init();\n    }\n    return this.#instance;\n  }\n  \n  #init() {\n    for (let i = 0; i < 10; i++) {\n      this.#connections.push({ id: i, busy: false });\n    }\n    console.log("Pool initialized with 10 connections");\n  }\n  \n  getConnection() {\n    const conn = this.#connections.find(c => !c.busy);\n    if (conn) { conn.busy = true; return conn; }\n    throw new Error("No connections available");\n  }\n}\n\n// Same instance everywhere:\nconst db1 = DatabasePool.getInstance();\nconst db2 = DatabasePool.getInstance();\nconsole.log(db1 === db2); // true' },
        { h: 'Observer Pattern', text: '🔹 What: Objects subscribe to events and get notified when state changes.\n\n🌍 Real-World Examples:\n• React useState: Components re-render when state changes (observer pattern internally).\n• Node.js EventEmitter: Core of Node.js — streams, HTTP server, all use events.\n• Kafka/RabbitMQ: Producers publish events, consumers subscribe and react.\n• Webhooks: GitHub notifies your CI/CD when code is pushed.\n• Kubernetes Controllers: Watch for resource changes and reconcile state.', code: '// Real-world: Deployment Event System\nclass DeploymentEvents {\n  #subscribers = {};\n  \n  on(event, callback) {\n    (this.#subscribers[event] ??= []).push(callback);\n  }\n  \n  emit(event, data) {\n    (this.#subscribers[event] || []).forEach(cb => cb(data));\n  }\n}\n\nconst deploy = new DeploymentEvents();\n\n// Different teams subscribe to events:\ndeploy.on("deploy:success", (data) => {\n  sendSlackMessage(`✅ ${data.service} deployed`);\n});\n\ndeploy.on("deploy:success", (data) => {\n  updateDashboard(data.service, "healthy");\n});\n\ndeploy.on("deploy:failure", (data) => {\n  triggerPagerDuty(data.service, data.error);\n  rollback(data.service, data.previousVersion);\n});\n\n// Trigger:\ndeploy.emit("deploy:success", {\n  service: "api-gateway", version: "2.1.0"\n});' },
        { h: 'Strategy Pattern', text: '🔹 What: Define a family of interchangeable algorithms. Switch between them at runtime.\n\n🌍 Real-World Examples:\n• Compression: Choose gzip, brotli, or deflate based on client support.\n• Authentication: Switch between JWT, OAuth, API Key strategies (Passport.js uses this!).\n• Pricing: Different discount strategies for regular, premium, enterprise users.\n• Sorting: Choose algorithm based on data size (insertion sort for small, merge sort for large).', code: '// Real-world: Authentication Strategies (like Passport.js)\nclass AuthContext {\n  constructor(strategy) { this.strategy = strategy; }\n  \n  async authenticate(request) {\n    return this.strategy.verify(request);\n  }\n}\n\nclass JWTStrategy {\n  verify(req) {\n    const token = req.headers.authorization;\n    return jwt.verify(token, SECRET);\n  }\n}\n\nclass APIKeyStrategy {\n  verify(req) {\n    const key = req.headers["x-api-key"];\n    return db.apiKeys.findOne({ key });\n  }\n}\n\n// Switch strategies based on route:\napp.use("/api", new AuthContext(new APIKeyStrategy()));\napp.use("/web", new AuthContext(new JWTStrategy()));' },
        { h: 'Factory Pattern', text: '🔹 What: Create objects without specifying the exact class to instantiate.\n\n🌍 Real-World Examples:\n• React.createElement(): Creates different element types based on input.\n• Cloud Provider SDK: Create EC2, Lambda, or S3 resources through a unified factory.\n• Logging: Create ConsoleLogger, FileLogger, or CloudLogger based on environment (dev/staging/prod).\n• Kubernetes: `kubectl create` creates different resource types based on YAML kind field.', code: '// Real-world: Cloud Resource Factory\nfunction createCloudResource(type, config) {\n  switch (type) {\n    case "compute":\n      return new EC2Instance(config);\n    case "serverless":\n      return new LambdaFunction(config);\n    case "storage":\n      return new S3Bucket(config);\n    case "database":\n      return new RDSInstance(config);\n    case "cache":\n      return new ElastiCacheCluster(config);\n    default:\n      throw new Error(`Unknown resource: ${type}`);\n  }\n}\n\n// Usage:\nconst server = createCloudResource("compute", {\n  instanceType: "t3.medium",\n  ami: "ami-12345"\n});' },
      ]
    },
    {
      icon: '🧹', title: 'Clean Code', desc: 'Write code that humans can read, maintain, and debug — with before/after examples',
      sections: [
        { h: 'Meaningful Names', text: '🔹 Variable and function names should reveal intent. If you need a comment to explain a name, the name is wrong.\n\n🌍 Real-World Impact:\n• Good names reduce onboarding time for new team members from weeks to days.\n• Self-documenting code reduces the need for external documentation by 40-60%.\n• Code review time decreases significantly with clear naming.', code: '// 💡 BAD: What does this mean?\nconst d = new Date();\nconst x = u.filter(i => i.a > 5);\nfunction calc(a, b) { return a * b * 0.18; }\n\n// ✅ GOOD: Self-documenting\nconst currentDate = new Date();\nconst activeUsers = users.filter(user => user.loginCount > 5);\nfunction calculateTax(price, quantity) {\n  const TAX_RATE = 0.18;\n  return price * quantity * TAX_RATE;\n}' },
        { h: 'Functions Should Do ONE Thing', text: '🔹 A function should do one thing, do it well, and do it only.\n🔹 If you can extract another function from it — it\'s doing too much.\n🔹 Ideal function length: 5-20 lines. If it\'s > 30 lines, it probably needs splitting.\n\n🌍 Real-World Example:\nInstead of one processOrder() function that validates, charges, sends email, and updates database — split into validate(), charge(), notify(), and persist().', code: '// 💡 BAD: Function does 4 things\nasync function processOrder(order) {\n  // validate\n  if (!order.items.length) throw new Error("Empty");\n  if (!order.user.email) throw new Error("No email");\n  // calculate total\n  let total = 0;\n  for (const item of order.items) total += item.price * item.qty;\n  // charge payment\n  await stripe.charges.create({ amount: total });\n  // send confirmation\n  await sendEmail(order.user.email, "Order confirmed!");\n}\n\n// ✅ GOOD: Each function does ONE thing\nasync function processOrder(order) {\n  validateOrder(order);\n  const total = calculateTotal(order.items);\n  await chargePayment(order.user, total);\n  await sendConfirmation(order.user.email, total);\n}' },
        { h: 'Error Handling', text: '🔹 Don\'t use try/catch as a crutch — handle errors meaningfully.\n🔹 Create custom error classes for different failure types.\n🔹 Always log enough context to debug issues in production.\n\n🌍 Real-World Impact:\nPoor error handling is the #1 cause of "silent failures" in production — where something breaks but nobody notices until customers complain.', code: '// Real-world: Proper Error Handling in APIs\nclass AppError extends Error {\n  constructor(message, statusCode, errorCode) {\n    super(message);\n    this.statusCode = statusCode;\n    this.errorCode = errorCode;\n    this.isOperational = true;\n  }\n}\n\nclass NotFoundError extends AppError {\n  constructor(resource) {\n    super(`${resource} not found`, 404, "NOT_FOUND");\n  }\n}\n\nclass ValidationError extends AppError {\n  constructor(field, reason) {\n    super(`Invalid ${field}: ${reason}`, 400, "VALIDATION");\n  }\n}\n\n// Usage:\nasync function getUser(id) {\n  const user = await db.users.findById(id);\n  if (!user) throw new NotFoundError("User");\n  return user;\n}' },
        { h: 'DRY & KISS Principles', text: '🔹 DRY — Don\'t Repeat Yourself: Every piece of knowledge should have a single source of truth.\n🔹 KISS — Keep It Simple, Stupid: Simpler solutions are almost always better.\n🔹 YAGNI — You Aren\'t Gonna Need It: Don\'t build features "just in case".\n\n🌍 Real-World Examples:\n• DRY violation: Copy-pasting validation logic across 10 API endpoints. Fix: Create a shared validation middleware.\n• KISS violation: Building a custom event bus when a simple callback would suffice.\n• YAGNI violation: Adding a plugin system to an internal tool used by 3 people.' },
      ]
    },
    {
      icon: '🔀', title: 'Git Workflows', desc: 'GitFlow, Trunk-Based, Feature Branching — used by Google, Netflix, and GitHub',
      sections: [
        { h: 'GitFlow', text: '🔹 What: Structured workflow with dedicated branches for features, releases, and hotfixes.\n\n💡 Who uses it: Large enterprises with scheduled releases, mobile apps (iOS/Android).\n\n📋 Branch Structure:\n• main — production-ready code\n• develop — integration branch (all features merge here first)\n• feature/* — individual features\n• release/* — preparing a release (version bumps, final fixes)\n• hotfix/* — emergency production fixes\n\n⚠💡 Best for: Teams with scheduled release cycles (v1.0, v2.0, etc.)', code: '# Create a feature branch\ngit checkout -b feature/user-auth develop\n\n# Work on feature, commit, push\ngit add . && git commit -m "feat: add JWT auth"\ngit push origin feature/user-auth\n\n# When done, merge back to develop\ngit checkout develop\ngit merge --no-ff feature/user-auth\n\n# Create release branch\ngit checkout -b release/1.0 develop\n# Final fixes, bump version\ngit checkout main\ngit merge --no-ff release/1.0\ngit tag -a v1.0 -m "Release 1.0"\n\n# Hotfix for production bug\ngit checkout -b hotfix/login-fix main\n# Fix, commit, merge to both main AND develop\ngit checkout main && git merge --no-ff hotfix/login-fix\ngit checkout develop && git merge --no-ff hotfix/login-fix' },
        { h: 'Trunk-Based Development', text: '🔹 What: Everyone commits to main (trunk) frequently. Short-lived branches (< 1 day) or direct commits.\n\n💡 Who uses it:\n• Google — All 25,000+ engineers commit to a single monorepo trunk.\n• Netflix — Pushes to production hundreds of times per day.\n• Meta — Trunk-based with feature flags for gradual rollout.\n\n✅ Best for: Teams with strong CI/CD, feature flags, and automated testing.\n💡 Not great for: Teams without comprehensive test suites.', code: '# Daily workflow:\ngit checkout main\ngit pull origin main\n\n# Short-lived branch (merge same day)\ngit checkout -b quick/add-health-check\n# Make change, commit\ngit add . && git commit -m "feat: add /health endpoint"\ngit push origin quick/add-health-check\n# Create PR, get quick review, merge\n# Branch lives < 1 day\n\n# Feature Flags for long-running work:\nif (featureFlags.isEnabled("new-checkout")) {\n  showNewCheckout();\n} else {\n  showLegacyCheckout();\n}' },
        { h: 'Conventional Commits', text: '🔹 What: Standardized commit message format that enables automated changelogs and semantic versioning.\n\n💡 Who uses it: Angular, React, Vue, Kubernetes, and most modern open-source projects.\n\n📋 Format: type(scope): description\n\nTypes:\n• feat: — New feature (bumps MINOR version)\n• fix: — Bug fix (bumps PATCH version)\n• docs: — Documentation only\n• refactor: — Code change that doesn\'t fix bug or add feature\n• perf: — Performance improvement\n• test: — Adding tests\n• chore: — Build process, dependencies\n• BREAKING CHANGE: — In footer (bumps MAJOR version)', code: '# Examples:\nfeat(auth): add Google OAuth login\nfix(api): handle null response from payment gateway\nperf(db): add index on users.email column\nrefactor(cart): extract discount calculation logic\ndocs(readme): add deployment instructions\n\nfeat(api): add pagination to /users endpoint\n\nBREAKING CHANGE: response format changed from\narray to paginated object { data: [], total, page }\n\n# Auto-generate changelog:\n# v2.1.0 (2026-02-15)\n# Features:\n#   - Add Google OAuth login (a1b2c3d)\n#   - Add pagination to /users endpoint (e4f5g6h)\n# Bug Fixes:\n#   - Handle null payment response (i7j8k9l)' },
      ]
    },
    {
      icon: '🚀', title: 'CI/CD Pipelines', desc: 'Continuous Integration & Deployment — how Netflix deploys 1000s of times daily',
      sections: [
        { h: 'Pipeline Overview', text: '🔹 CI (Continuous Integration): Automatically build and test every commit.\n🔹 CD (Continuous Delivery): Automatically deploy to staging. Manual approval for production.\n🔹 CD (Continuous Deployment): Automatically deploy to production. No manual steps.\n\n🌍 Real-World Scale:\n• Netflix: 1000s of deployments per day across 100s of microservices.\n• Amazon: Deploys every 11.7 seconds on average.\n• Google: 60,000+ builds per day from a single monorepo.\n\n📋 Typical Pipeline Stages:\n1. 📥 Code Push → Trigger\n2. 🔨 Build → Compile, dependency resolution\n3. 🧪 Unit Tests → Fast feedback (< 5 min)\n4. 💡 Static Analysis → Linting, code quality (SonarQube)\n5. 🔒 Security Scan → Dependency vulnerabilities (Snyk, Trivy)\n6. 📦 Docker Build → Create container image\n7. 🧪 Integration Tests → Test with real dependencies\n8. 🚀 Deploy Staging → Canary or blue/green\n9. ✅ Smoke Tests → Verify critical paths\n10. 💡 Deploy Production → Gradual rollout' },
        { h: 'GitHub Actions Example', text: '🔹 The most popular CI/CD for open-source projects. Free for public repos.', code: 'name: CI/CD Pipeline\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npm test\n      - run: npm run lint\n  \n  security:\n    needs: test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run Snyk security scan\n        uses: snyk/actions/node@master\n  \n  deploy:\n    needs: [test, security]\n    if: github.ref == \'refs/heads/main\'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build Docker image\n        run: docker build -t my-app:${{ github.sha }} .\n      - name: Deploy to Kubernetes\n        run: kubectl set image deploy/my-app my-app=my-app:${{ github.sha }}' },
        { h: 'Deployment Strategies', text: '🔹 Blue/Green: Run two identical environments. Switch traffic instantly.\n  → Used by: Amazon, banks (zero-downtime requirement).\n  → Pros: Instant rollback. Cons: Double infrastructure cost.\n\n🔹 Canary: Route 5% of traffic to new version. Gradually increase if healthy.\n  → Used by: Netflix, Google, Facebook.\n  → Pros: Minimizes blast radius. Cons: Complex routing.\n\n🔹 Rolling Update: Replace instances one-by-one.\n  → Used by: Kubernetes (default strategy).\n  → Pros: No extra infrastructure. Cons: Mixed versions during rollout.\n\n🔹 Feature Flags: Deploy code but hide behind flags. Enable for specific users.\n  → Used by: LaunchDarkly, Unleash, Flipt.\n  → Pros: Decouple deploy from release. Cons: Flag cleanup needed.' },
      ]
    },
    {
      icon: '🔍', title: 'Bloom Filters', desc: 'Space-efficient probabilistic data structures — used by Redis, PostgreSQL, and Google',
      sections: [
        { h: 'What is a Bloom Filter?', text: '🔹 A Bit Array + Multiple Hash Functions.\n🔹 Purpose: "Is this element in the set?"\n🔹 Answers: "Definitely Not" or "Probably Yes" (Never "Definitely Yes").\n\n🌍 Real-World Examples:\n• Google Chrome: Checking URLs against a list of millions of malicious sites (Bloom filter checks locally before querying API).\n• Medium: "Recommend posts you haven\'t read" — uses a Bloom filter per user to skip seen posts.\n• Redis: Checking if a key exists before hitting the heavy database.\n• Cassandra/PostgreSQL: Checking if a partition contains a key before reading from disk.', code: '// Conceptual: Bloom Filter Implementation\nclass BloomFilter {\n  constructor(size = 100) {\n    this.bits = new Uint8Array(size);\n  }\n  \n  add(item) {\n    const h1 = (item.length % 100); // dummy hash\n    const h2 = (item.length * 2 % 100); // dummy hash\n    this.bits[h1] = 1;\n    this.bits[h2] = 1;\n  }\n  \n  contains(item) {\n    const h1 = (item.length % 100);\n    const h2 = (item.length * 2 % 100);\n    return this.bits[h1] === 1 && this.bits[h2] === 1;\n  }\n}\n// Result False: definitely not there\n// Result True: might be there (false positive risk)' }
      ]
    },
    {
      icon: '🌳', title: 'Merkle Trees', desc: 'Hash trees for efficient data verification — used by Git, BitTorrent, and Blockchain',
      sections: [
        { h: 'What is a Merkle Tree?', text: '🔹 A tree where every leaf node is a hash of a data block, and every non-leaf node is a hash of its children.\n\n🌍 Real-World Examples:\n• Git: Every commit is a Merkle tree of file snapshots. If one byte in one file changes, the root hash changes.\n• BitTorrent: Verify chunks of data downloaded from multiple peers without downloading the whole file first.\n• Cassandra/DynamoDB: Efficiently sync data between nodes. Only send the chunks that have different hashes.\n• Blockchain: Verify transactions in a block using a Merkle proof.', code: '// Conceptual: Merkle Tree Root Calculation\nfunction getMerkleRoot(dataBlocks) {\n  let hashes = dataBlocks.map(b => "h" + b); // dummy hash\n  \n  while (hashes.length > 1) {\n    let nextLevel = [];\n    for (let i = 0; i < hashes.length; i += 2) {\n      const left = hashes[i];\n      const right = hashes[i + 1] || left;\n      nextLevel.push("h" + left + right);\n    }\n    hashes = nextLevel;\n  }\n  return hashes[0]; // Merkle Root\n}' }
      ]
    },
  ];

  const listEl = document.getElementById('conceptsList');
  const detailEl = document.getElementById('conceptDetail');

  listEl.innerHTML = concepts.map((c, i) => `
    <div class="concept-card" data-idx="${i}">
      <div class="concept-icon">${c.icon}</div>
      <div class="concept-title">${c.title}</div>
      <div class="concept-desc">${c.desc}</div>
    </div>
  `).join('');

  listEl.addEventListener('click', e => {
    const card = e.target.closest('.concept-card');
    if (!card) return;
    const c = concepts[card.dataset.idx];
    listEl.style.display = 'none';
    detailEl.classList.add('active');
    detailEl.innerHTML = `
      <div class="concept-detail-back"><button class="btn btn-secondary" id="conceptBack">← Back</button></div>
      <div class="page-header"><h1>${c.icon} ${c.title}</h1><p>${c.desc}</p></div>
      ${c.sections.map(s => `
        <div class="concept-section">
          <h3>${s.h || ''}</h3>
          ${s.text ? `<p style="white-space:pre-line">${s.text}</p>` : ''}
          ${s.code ? `<div class="concept-code">${escHtml(s.code)}</div>` : ''}
        </div>
      `).join('')}
    `;
    document.getElementById('conceptBack').addEventListener('click', () => {
      listEl.style.display = '';
      detailEl.classList.remove('active');
      detailEl.innerHTML = '';
    });
  });
}

// === SYSTEM DESIGN & ARCHITECTURE ===
function initArchitecture() {
  const patterns = [
    {
      icon: '💡', title: 'Monolithic Architecture', desc: 'Single deployable unit — how most apps start (and when to move on)',
      diagram: [
        { row: [{ label: 'Client (Browser/Mobile)', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'Monolith Server\n(UI + Business Logic + Data Access)', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Single Database', cls: 'db' }] },
      ],
      details: [
        { h: '🌍 Real-World Examples', text: '• Early Netflix (2007): Started as a monolith Ruby on Rails app before migrating to microservices.\n• Shopify: Still a monolith (Ruby on Rails) serving millions of merchants — proof that monoliths can scale!\n• Stack Overflow: Handles 1.3 billion page views/month with a monolithic .NET application.\n• Basecamp: 37signals deliberately chose a monolith and scales it vertically.\n\n💡 Key insight: Monoliths are NOT bad. Many successful companies run monoliths at massive scale.' },
        { h: '✅ Pros', text: '• Simple to develop, test, and deploy (one codebase, one deploy pipeline)\n• No network latency between components (everything is in-process)\n• Easier debugging — single stack trace, single log stream\n• Lower operational cost (one server, one database)\n• Perfect for teams < 10 engineers' },
        { h: '💡 Cons', text: '• "Big ball of mud" — codebase becomes hard to understand over time\n• Scaling means scaling EVERYTHING (can\'t scale just the payment module)\n• A bug in one module can crash the entire application\n• Technology lock-in — entire app must use same language/framework\n• Long build and deploy times as codebase grows\n• Hard for multiple teams to work independently' },
        { h: '📋 When to Use', text: '✅ MVPs and startups — validate your idea first, optimize later\n✅ Small teams (< 10 engineers) — microservices add unnecessary complexity\n✅ Simple domains — not every app needs to be Netflix\n✅ When rapid iteration matters more than scalability\n\n💡 Avoid when:\n• Multiple teams need to deploy independently\n• Different components have vastly different scaling needs\n• You need polyglot technology (e.g., ML in Python, API in Go)' },
      ]
    },
    {
      icon: '🔗', title: 'Microservices Architecture', desc: 'Independent services — how Netflix, Uber, and Amazon operate at scale',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'API Gateway / LB', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'Auth Service', cls: 'server' }, { label: 'User Service', cls: 'server' }, { label: 'Order Service', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Auth DB', cls: 'db' }, { label: 'User DB', cls: 'db' }, { label: 'Order DB', cls: 'db' }] },
      ],
      details: [
        { h: '🌍 Real-World Examples', text: '• Netflix: 1000+ microservices handling 250M+ subscribers. Each team owns 2-3 services. Services communicate via gRPC and async messaging.\n• Uber: Started as monolith, migrated to 4000+ microservices. Each service handles one domain: pricing, matching, payments, maps.\n• Amazon: CEO Jeff Bezos issued the famous "API mandate" — every team must expose their functionality through APIs. This led to AWS.\n• Spotify: Each squad (team) owns a set of microservices. The "Spotify Model" influenced how companies organize around microservices.' },
        { h: '✅ Pros', text: '• Independent deployment — ship Auth without redeploying Orders\n• Independent scaling — scale the Search service during Black Friday without scaling everything\n• Technology freedom — User Service in Node.js, ML Service in Python, Performance-critical in Go\n• Fault isolation — if Recommendations crash, users can still browse and purchase\n• Team autonomy — each team fully owns their service(s)' },
        { h: '💡 Cons', text: '• Distributed system complexity (network failures, timeouts, retries)\n• Data consistency is HARD (no more simple database transactions across services)\n• Operational overhead (logging, monitoring, tracing across 100s of services)\n• "Distributed monolith" — if services are tightly coupled, you get the worst of both worlds\n• Need for service mesh, API gateway, circuit breakers, distributed tracing' },
        { h: '🔧 Key Patterns', text: '• API Gateway: Single entry point (Kong, AWS API Gateway, Envoy)\n• Service Discovery: Services find each other dynamically (Consul, Eureka, K8s DNS)\n• Circuit Breaker: Prevent cascade failures (Netflix Hystrix, resilience4j)\n• Saga Pattern: Manage distributed transactions across services\n• Sidecar Pattern: Attach logging/monitoring via proxies (Istio, Linkerd)\n• Strangler Fig: Gradually migrate from monolith by routing requests to new services' },
        { h: '📋 When to Use', text: '✅ Teams > 20 engineers that need to work independently\n✅ Different components need different scaling (e.g., video transcoding vs. user profiles)\n✅ Need polyglot tech stack\n✅ Organization structured around business domains (DDD)\n\n💡 Avoid when:\n• Team is small (< 10 people) — overhead will slow you down\n• Domain is simple and well-understood\n• You can\'t invest in DevOps infrastructure (CI/CD, monitoring, service mesh)' },
      ]
    },
    {
      icon: '📨', title: 'Event-Driven Architecture', desc: 'Async messaging — how Uber processes millions of rides in real-time',
      diagram: [
        { row: [{ label: 'Order Service', cls: 'server' }, { label: 'Payment Service', cls: 'server' }] },
        { arrow: '↓ publish events' },
        { row: [{ label: 'Message Broker\n(Kafka / RabbitMQ / SQS)', cls: 'queue' }] },
        { arrow: '↓ consume events' },
        { row: [{ label: 'Notification\nService', cls: 'server' }, { label: 'Analytics\nService', cls: 'server' }, { label: 'Search Index\nService', cls: 'server' }] },
      ],
      details: [
        { h: '🌍 Real-World Examples', text: '• Uber: When a ride is requested, events flow: ride.requested → driver.matched → ride.started → ride.completed → payment.processed → receipt.sent. All async!\n• LinkedIn: Processes 7 trillion events/day through Kafka (which they invented!).\n• Netflix: Uses event sourcing for recommendations — every user action (watch, pause, rate) is an event that feeds ML models.\n• Stripe: Payment events (charge.succeeded, charge.failed) trigger webhooks to merchants.\n• GitHub: Push events trigger GitHub Actions workflows.' },
        { h: '✅ Pros', text: '• Loose coupling — producers don\'t know about consumers\n• High scalability — add more consumers without changing producers\n• Real-time processing — react to events as they happen\n• Resilience — if a consumer is down, messages queue up and process when it recovers\n• Audit trail — event log is a complete history of what happened (event sourcing)' },
        { h: '💡 Cons', text: '• Eventual consistency — data may be stale for a brief period\n• Complex debugging — tracing a request across async events is hard\n• Message ordering — ensuring events are processed in the right order\n• Duplicate processing — consumers must be idempotent (handle duplicates gracefully)\n• Error handling — dead letter queues for failed messages' },
        { h: '📋 When to Use', text: '✅ Real-time data streaming (IoT sensors, live dashboards, stock prices)\n✅ Decoupling services — when one action triggers multiple downstream effects\n✅ Event sourcing — when you need a complete audit trail (fintech, healthcare)\n✅ CQRS — separate read/write paths for optimization\n\n💡 Avoid when:\n• Strong consistency is required (banking transactions)\n• Simple request-response is sufficient\n• Team isn\'t experienced with async patterns' },
      ]
    },
    {
      icon: '💡💡', title: 'Serverless Architecture', desc: 'FaaS — how Coca-Cola reduced costs by 80% with serverless',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'API Gateway\n(AWS / GCP / Azure)', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'Function A\n(Auth)', cls: 'server' }, { label: 'Function B\n(Process)', cls: 'server' }, { label: 'Function C\n(Notify)', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'DynamoDB', cls: 'db' }, { label: 'S3', cls: 'cache' }, { label: 'SQS', cls: 'queue' }] },
      ],
      details: [
        { h: '🌍 Real-World Examples', text: '• Coca-Cola: Migrated vending machine backend to serverless, reduced costs by 80%.\n• iRobot (Roomba): Processes 4+ million robot events/day using AWS Lambda.\n• Nordstrom: Handles Black Friday traffic spikes with auto-scaling Lambda functions.\n• BBC: Serves 60K+ requests/second during peak news events using serverless.\n• Figma: Uses serverless for event processing and background jobs.' },
        { h: '✅ Pros', text: '• Zero server management — no OS patching, no capacity planning\n• Pay per execution — $0 cost when no traffic (great for variable workloads)\n• Auto-scaling — from 0 to 10,000 concurrent executions automatically\n• Faster time-to-market — focus on code, not infrastructure\n• Built-in high availability across multiple availability zones' },
        { h: '💡 Cons', text: '• Cold start latency (100ms-2s delay when function hasn\'t run recently)\n• Vendor lock-in — hard to migrate from AWS Lambda to Azure Functions\n• 15-minute execution time limit (not for long-running tasks)\n• Debugging is harder — no server to SSH into\n• Cost can spike unexpectedly with high traffic\n• Stateless — need external storage for any state' },
        { h: '📋 When to Use', text: '✅ Variable/unpredictable traffic patterns (marketing campaigns, seasonal)\n✅ Event processing (S3 upload → resize image, webhook → process data)\n✅ APIs with low-to-moderate traffic\n✅ Cron jobs and scheduled tasks\n✅ MVPs and prototypes (rapid development)\n\n💡 Avoid when:\n• Consistent, high-throughput workloads (cheaper to run containers)\n• Real-time applications requiring < 10ms latency\n• Long-running processes (video encoding, ML training)\n• You need fine-grained control over runtime environment' },
      ]
    },
    {
      icon: '⚖💡', title: 'Load Balancing & Caching', desc: 'How Amazon handles 66,000 orders/second on Prime Day',
      diagram: [
        { row: [{ label: 'Millions of Clients', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'CDN (CloudFront)\nStatic Assets', cls: 'cache' }] },
        { arrow: '↓' },
        { row: [{ label: 'Load Balancer (ALB/NLB)', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'Server 1', cls: 'server' }, { label: 'Server 2', cls: 'server' }, { label: 'Server N', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Redis/Memcached\nCache Layer', cls: 'cache' }, { label: 'Primary DB', cls: 'db' }, { label: 'Read Replicas', cls: 'db' }] },
      ],
      details: [
        { h: '🌍 Real-World Examples', text: '• Netflix: Uses AWS ELB + custom Zuul gateway to route 250M+ users across thousands of EC2 instances.\n• Amazon Prime Day: Handles 66,000+ orders/second using multi-layer load balancing + ElastiCache.\n• Twitter: Caches hot tweets in Redis — without caching, each viral tweet could bring down the service.\n• YouTube: Uses CDN caching at 100+ edge locations worldwide to serve 720,000 hours of video/day.\n• Facebook: Memcached cluster handles billions of reads/second, reducing database load by 99%.' },
        { h: '⚖️ Load Balancing Strategies', text: '1. Round Robin: Distribute requests equally. Simple but doesn\'t consider server load.\n   → Use: Homogeneous servers with similar capacity.\n\n2. Least Connections: Send to server with fewest active connections.\n   → Use: When requests have varying processing times (e.g., file uploads).\n\n3. IP Hash: Same client always goes to same server.\n   → Use: When you need session affinity (sticky sessions).\n\n4. Weighted: Assign weights based on server capacity.\n   → Use: Mix of powerful and less powerful servers.\n\n5. Health-Check Based: Only route to healthy servers.\n   → Use: Always! Combine with any strategy above.' },
        { h: '💾 Caching Strategies', text: '1. Cache-Aside (Lazy Loading):\n   App checks cache → miss → reads DB → writes to cache → returns.\n   → Used by: Most web apps. Simple and effective.\n\n2. Write-Through:\n   App writes to cache AND DB simultaneously.\n   → Used by: Banking systems (consistency is critical).\n\n3. Write-Behind (Write-Back):\n   App writes to cache → cache asynchronously writes to DB.\n   → Used by: High-write workloads (IoT sensor data).\n\n4. Read-Through:\n   Cache automatically loads from DB on miss.\n   → Used by: CDNs (CloudFront, Cloudflare).' },
        { h: '🔺 CAP Theorem', text: 'In a distributed system, you can guarantee at most 2 of 3:\n\n• C (Consistency): Every read returns the most recent write.\n• A (Availability): Every request receives a response.\n• P (Partition Tolerance): System works despite network failures.\n\nReal-World Choices:\n• CP (Consistency + Partition): MongoDB, HBase — bank transfers, inventory counts.\n• AP (Availability + Partition): Cassandra, DynamoDB — social media feeds, shopping carts.\n• CA (Consistency + Availability): Traditional RDBMS (PostgreSQL) — only works without partitions (single node).\n\n💡 In real distributed systems, P is mandatory (networks WILL fail), so you\'re really choosing between C and A.' },
      ]
    },
    {
      icon: '📊', title: 'CQRS Pattern', desc: 'Separate reads and writes — used by trading platforms and e-commerce at scale',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'Command API\n(Write)', cls: 'server' }, { label: 'Query API\n(Read)', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Write DB\n(Normalized)', cls: 'db' }, { label: 'Event Bus\n(Kafka)', cls: 'queue' }, { label: 'Read DB\n(Denormalized)', cls: 'db' }] },
      ],
      details: [
        { h: '🌍 Real-World Examples', text: '• Stock Trading Platforms: Write path records trades (must be consistent). Read path shows portfolio dashboards (can be eventually consistent with optimized queries).\n• E-commerce Product Catalog: Write path handles seller updates (normalized: products, prices, inventory tables). Read path serves customer-facing pages (denormalized: single document with all product info).\n• Twitter Timeline: Write path stores tweets. Read path uses a pre-computed "fan-out" timeline per user for fast reads.\n• Banking: Write path records transactions with strict ACID. Read path serves account statements from materialized views.' },
        { h: '📋 When to Use', text: '✅ Read-heavy applications (100:1 read/write ratio)\n✅ Complex queries that slow down the write path\n✅ Different scaling needs for reads vs writes\n✅ Event sourcing — storing events as the source of truth\n✅ When read and write models have very different shapes\n\n💡 Avoid when:\n• Simple CRUD applications (adds unnecessary complexity)\n• Read and write models are identical\n• Strong consistency is needed on reads (eventual consistency adds latency)\n• Small team without experience in distributed systems' },
        { h: '🔧 Implementation Tips', text: '• Use Kafka/RabbitMQ to sync write DB → read DB\n• Read DB can be Elasticsearch (for search), Redis (for fast lookups), or a denormalized PostgreSQL\n• Accept eventual consistency — read model may be 50-200ms behind write\n• Use event versioning to handle schema changes\n• Monitor sync lag between write and read databases' },
      ]
    },
    {
      icon: '🗄💡', title: 'Database Sharding', desc: 'Horizontal scaling — how Instagram stores 2 billion+ users\' data',
      diagram: [
        { row: [{ label: 'Application Servers', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Shard Router / Proxy\n(Vitess, ProxySQL)', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'Shard 1\n(Users A-H)', cls: 'db' }, { label: 'Shard 2\n(Users I-P)', cls: 'db' }, { label: 'Shard 3\n(Users Q-Z)', cls: 'db' }] },
      ],
      details: [
        { h: '🌍 Real-World Examples', text: '• Instagram: Shards PostgreSQL by user_id. Each shard holds ~1M users. Uses Vitess for shard management.\n• Discord: Shards messages by channel_id across Cassandra nodes. Each Discord server\'s messages stay on one shard.\n• Notion: Shards PostgreSQL by workspace_id. Each workspace\'s data is co-located on one shard.\n• Pinterest: Shards MySQL by user_id. Uses consistent hashing to distribute data evenly.\n• Slack: Shards by workspace_id — each company\'s data lives on a single shard for data locality.' },
        { h: '🔀 Sharding Strategies', text: '1. Hash-Based: hash(user_id) % num_shards\n   ✅ Even distribution\n   💡 Hard to add/remove shards (resharding required)\n   → Used by: Most systems. Pinterest uses this.\n\n2. Range-Based: Users A-H → Shard 1, I-P → Shard 2\n   ✅ Range queries are efficient\n   💡 Hot spots (popular ranges get more traffic)\n   → Used by: Time-series data (logs by date range).\n\n3. Geographic: US data → US shard, EU data → EU shard\n   ✅ Low latency (data near users)\n   ✅ Compliance (GDPR — EU data stays in EU)\n   💡 Cross-region queries are slow\n   → Used by: Uber, Netflix (region-specific content).\n\n4. Directory-Based: Lookup table maps key → shard\n   ✅ Flexible, easy to reshape\n   💡 Lookup table becomes a bottleneck\n   → Used by: Multi-tenant SaaS (Slack, Notion).' },
        { h: '⚠💡 Challenges', text: '• Cross-shard JOIN queries — nearly impossible, must denormalize or use application-level joins\n• Resharding — adding new shards requires migrating data (use consistent hashing to minimize)\n• Hot shards — one shard getting disproportionate traffic (celebrity user problem)\n• Distributed transactions — ACID across shards requires 2-phase commit or saga pattern\n• Operational complexity — monitoring, backups, and failover for N shards instead of 1\n\n💡 Rule of thumb: Don\'t shard unless your database exceeds 1-2TB or 10K queries/second. Vertical scaling (bigger machine) is simpler and often sufficient.' },
      ]
    },
    {
      icon: '🛡️', title: 'Zero Trust Architecture', desc: 'Never trust, always verify — modern security for distributed systems',
      diagram: [
        { row: [{ label: 'User / Device / Service', cls: 'client' }] },
        { arrow: '↓ Request' },
        { row: [{ label: 'Policy Enforcement Point\n(Identity Proxy)', cls: 'lb' }] },
        { arrow: '↓ Verified Identity + Context' },
        { row: [{ label: 'Microservice A', cls: 'server' }, { label: 'Microservice B', cls: 'server' }] },
      ],
      details: [
        { h: 'What is Zero Trust?', text: '🔹 Shift from "Castle and Moat" (perimeter security) to "Verify every request".\n🔹 Core principles: Explicit verification, Least privileged access, Assume breach.\n\n🌍 Real-World Examples:\n• Google BeyondCorp: Google employees access internal tools over the public internet without a VPN — identity and device health are verified for every request.\n• Cloudflare Access: Replaces traditional VPNs with identity-aware proxies.\n• Netflix: Uses "Lara" (internal tool) for zero-trust service-to-service communication.\n• Microsoft: Implemented Zero Trust across all internal corporate resources.' }
      ]
    },
    {
      icon: '🏛️', title: 'Hexagonal Architecture', desc: 'Ports and Adapters — keeping business logic pure and testable',
      diagram: [
        { row: [{ label: 'External (HTTP/CLI)', cls: 'client' }] },
        { arrow: '↓ adapt' },
        { row: [{ label: 'Pure Business Logic\n(The Domain)', cls: 'server' }] },
        { arrow: '↓ adapt' },
        { row: [{ label: 'Database / External APIs', cls: 'db' }] },
      ],
      details: [
        { h: 'What is it?', text: '🔹 Separates the "Inside" (Business Logic) from the "Outside" (Database, UI, APIs).\n🔹 Business logic doesn\'t depend on frameworks or databases — it defines "Ports" (interfaces) and the outside world provides "Adapters".\n\n✅ Pros: 100% testable logic without DB, easy to swap technologies (e.g. SQL to NoSQL).\n💡 Used by: Domains with complex business rules and long lifespans.' }
      ]
    },
    {
      icon: '🛡️', title: 'Saga Pattern', desc: 'Distributed transactions — managing consistency across microservices',
      diagram: [
        { row: [{ label: 'Order Service', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Payment Service', cls: 'server' }] },
        { arrow: '↓ (fail)' },
        { row: [{ label: 'Compensation Logic', cls: 'lb' }] },
      ],
      details: [
        { h: 'What is it?', text: '🔹 A sequence of local transactions. If one fails, the saga executes compensating transactions to undo the preceding steps.\n\n🌍 Real-World Example:\nBooking a trip (Flight + Hotel + Car). If the car booking fails, the system automatically cancels the flight and hotel.' }
      ]
    },
    {
      icon: '🌐', title: 'Edge Computing', desc: 'Processing data near the source — reducing latency for global users',
      diagram: [
        { row: [{ label: 'User Device', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'Edge Location\n(Cloudflare Worker / Lambda@Edge)', cls: 'cache' }] },
        { arrow: '↓' },
        { row: [{ label: 'Central Cloud', cls: 'server' }] },
      ],
      details: [
        { h: 'Why Edge?', text: '🔹 Reduces latency from 200ms to < 20ms by running code in the CDN data center closest to the user.\n\n💡 Use Cases: Image optimization, A/B testing, Authentication checks, IoT telemetry processing.' }
      ]
    },
    {
      icon: '🏢', title: 'Multi-Tenancy', desc: 'Serving multiple customers from a single application instance',
      diagram: [
        { row: [{ label: 'Tenant A', cls: 'client' }, { label: 'Tenant B', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'Shared App Instance', cls: 'server' }] },
        { arrow: '↓ isolation' },
        { row: [{ label: 'Shared DB (with tenant_id)', cls: 'db' }] },
      ],
      details: [
        { h: 'Isolation Levels', text: '1. Shared App, Shared DB (Logical Isolation): Simplest, cheapest. Risk of "noisy neighbor".\n2. Shared App, Separate DBs: Better security and performance isolation.\n3. Separate App, Separate DBs: Full isolation (Silo pattern).' }
      ]
    },
    {
      icon: '👯', title: 'BFF (Backend for Frontend)', desc: 'Customized backends for specific client types (Web vs. Mobile)',
      diagram: [
        { row: [{ label: 'Web UI', cls: 'client' }, { label: 'Mobile App', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'Web BFF', cls: 'lb' }, { label: 'Mobile BFF', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'API 1', cls: 'server' }, { label: 'API 2', cls: 'server' }] },
      ],
      details: [
        { h: 'Why BFF?', text: '🔹 Web apps need large payloads (JSON), Mobile apps need small payloads (Protobuf).\n🔹 BFF acts as a translation layer specifically for ONE frontend.\n\n🌍 Real-World Examples:\n• SoundCloud: One of the early pioneers of BFF for their web and mobile apps.\n• Netflix: Moved from a single API to specific BFFs for different TV/Mobile devices.' }
      ]
    },
    {
      icon: '🔄', title: 'Strangler Fig Pattern', desc: 'Migrate legacy monoliths by gradually replacing features',
      diagram: [
        { row: [{ label: 'Legacy Monolith', cls: 'server' }] },
        { arrow: '↓ Route traffic' },
        { row: [{ label: 'New API (The "Fig")', cls: 'server' }] },
      ],
      details: [
        { h: 'How it works', text: '🔹 Named after the vine that wraps around a tree and eventually replaces it.\n🔹 Instead of a "Big Bang" rewrite, you build new features in a separate service and route specific URLs to it.\n\n💡 Use Case: Moving from a legacy PHP monolith to a modern Node.js microservice architecture.' }
      ]
    },
    {
      icon: '🚢', title: 'Service Mesh', desc: 'Secure and monitor service-to-service communication with sidecars',
      diagram: [
        { row: [{ label: 'App A', cls: 'server' }, { label: 'Proxy (Sidecar)', cls: 'lb' }] },
        { arrow: '↔' },
        { row: [{ label: 'App B', cls: 'server' }, { label: 'Proxy (Sidecar)', cls: 'lb' }] },
      ],
      details: [
        { h: 'What is it?', text: '🔹 Offloads networking (retries, timeouts, mTLS, metrics) to a separate process (sidecar).\n🔹 Famous tools: Istio, Linkerd.\n\n✅ Pros: Transparent security, deep observability without changing app code.' }
      ]
    }
  ];

  const listEl = document.getElementById('archList');
  const detailEl = document.getElementById('archDetail');

  listEl.innerHTML = patterns.map((p, i) => `
    <div class="arch-card" data-idx="${i}">
      <div class="arch-card-icon">${p.icon}</div>
      <div class="arch-card-title">${p.title}</div>
      <div class="arch-card-desc">${p.desc}</div>
    </div>
  `).join('');

  listEl.addEventListener('click', e => {
    const card = e.target.closest('.arch-card');
    if (!card) return;
    const p = patterns[card.dataset.idx];
    listEl.style.display = 'none';
    detailEl.classList.add('active');

    const diagramHtml = `<div class="arch-diagram">${p.diagram.map(item => {
      if (item.arrow) return `<div class="arch-arrow">${item.arrow}</div>`;
      return `<div class="arch-row">${item.row.map(b => `<div class="arch-box ${b.cls}">${b.label}</div>`).join('')}</div>`;
    }).join('')}</div>`;

    detailEl.innerHTML = `
      <div class="concept-detail-back"><button class="btn btn-secondary" id="archBack">← Back</button></div>
      <div class="page-header"><h1>${p.icon} ${p.title}</h1><p>${p.desc}</p></div>
      ${diagramHtml}
      ${p.details.map(d => `
        <div class="arch-detail-section">
          <h3>${d.h}</h3>
          <p style="white-space:pre-line">${d.text}</p>
        </div>
      `).join('')}
    `;
    document.getElementById('archBack').addEventListener('click', () => {
      listEl.style.display = '';
      detailEl.classList.remove('active');
      detailEl.innerHTML = '';
    });
  });
}

// === DEVELOPER KNOWLEDGE BASE ===
function initKnowledgeBase() {
  const entries = [
    {
      id: 'stack-vs-heap',
      title: 'Stack vs Heap Memory',
      category: 'language-internals',
      level: 'intermediate',
      summary: 'Understanding where data lives explains performance and lifecycle.',
      detail: `Every program uses two primary memory regions:
      
      **The Stack:**
      - Optimized for speed and automatic management.
      - Stores local variables (primitives/value types).
      - Follows LIFO (Last-In, First-Out).
      - Fixed size per thread (leads to StackOverflowError).
      
      **The Heap:**
      - Flexible but slower.
      - Stores objects and reference types.
      - Managed by Garbage Collection (GC).`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C#', code: `// Value type on Stack
int age = 25; 

// Reference type: pointer on Stack, object on Heap
var user = new User { Name = "Alice" }; 

// Boxing: copying value type to Heap
object boxed = age;`
        },
        {
          lang: 'typescript', label: 'TypeScript', code: `// Primitives (conceptually stack-like)
let age: number = 25; 

// Objects (stored on Heap)
const user = { name: "Alice" }; 

// Shallow copy vs Deep copy
const userRef = user; // Same heap reference
const userCopy = { ...user }; // New heap object`
        }
      ],
      tradeoffs: [
        'Pro: Stack is extremely fast for short-lived data',
        'Pro: Heap allows sharing data between functions',
        'Con: Heap requires GC cycles which can cause lag',
        'Con: Stack is limited in size'
      ],
      realWorld: 'Critical for avoiding "Memory Leaks" in Angular or "Captive Dependencies" in .NET.',
      tags: ['memory', 'gc', 'performance', 'internals']
    },
    {
      id: 'event-loop',
      title: 'Event Loop & Concurrency',
      category: 'language-internals',
      level: 'deep',
      summary: 'How single-threaded JS handles async vs C# multi-threaded ThreadPool.',
      detail: `The core difference in high-scale performance between JS and .NET lies in their concurrency models.
      
      **JS (Event Loop):**
      - Single-threaded (Main Thread).
      - Operations like disk I/O are delegated to libuv (C++) and pushed to the Callback Queue.
      - Never blocks the UI thread if used correctly.
      
      **C# (.NET ThreadPool):**
      - Multi-threaded managed pool.
      - Async/Await uses "State Machines" to release threads back to the pool while waiting for I/O.
      - Capable of true parallel CPU-bound processing.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (TPL)', code: `// Non-blocking I/O
var data = await _httpClient.GetStringAsync(url);

// CPU Parallelism
Parallel.ForEach(list, item => {
    Process(item); // Runs on multiple threads
});`
        },
        {
          lang: 'typescript', label: 'TypeScript (libuv)', code: `// Non-blocking I/O
const data = await fetch(url).then(r => r.text());

// CPU Concurrency (Worker Threads)
// JS cannot do true multi-threading in the same context.
const worker = new Worker('./worker.js');
worker.postMessage(data);`
        }
      ],
      tradeoffs: [
        'JS: Simple mental model, no race conditions',
        'C#: High CPU performance, complex synchronization (locks)',
        'C#: Better for heavy data processing / image manipulation',
        'JS: Better for I/O intensive web apps'
      ],
      realWorld: 'Explains why heavy loops in Node.js block all users, while in .NET they only block one thread.',
      tags: ['async', 'libuv', 'threading', 'performance']
    },
    {
      id: 'closures-memory',
      title: 'Closures & Scope Leakage',
      category: 'language-internals',
      level: 'intermediate',
      summary: 'How functions remember their creation scope and why it causes memory leaks.',
      detail: `A closure is a function bundled together with references to its surrounding state.
      
      **Key Concepts:**
      - **Lexical Scope:** Nested functions have access to variables declared in their outer scope.
      - **Persistent State:** Variables stay in memory as long as the inner function is reachable.
      
      **The Risk:** If you attach a closure to a long-lived object (like a global event listener), every variable in that closure\'s scope is held in the Heap forever.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Lambda)', code: `public Action GetCounter() {
    int count = 0; // Captured variable (Heap)
    return () => {
        count++;
        Console.WriteLine(count);
    };
}`
        },
        {
          lang: 'typescript', label: 'TypeScript', code: `function createCounter() {
    let count = 0; // Closure scope
    return () => {
        count++;
        return count;
    };
}
const counter = createCounter();`
        }
      ],
      tradeoffs: [
        'Pro: Enables data encapsulation (private variables)',
        'Pro: Essential for functional programming patterns',
        'Con: Hidden memory costs (Outer scope pinning)',
        'Con: Difficult to debug "Stale Closures" in React hooks'
      ],
      realWorld: 'A common cause of memory leaks in SPA applications when event listeners aren\'t cleaned up.',
      tags: ['memory', 'scope', 'javascript', 'patterns']
    },
    {
      id: 'records-structs-value',
      title: 'Records, Structs & Value Types',
      category: 'language-internals',
      level: 'intermediate',
      summary: 'Optimizing memory footprint with value semantics vs reference objects.',
      detail: `Most objects are "Reference Types" (lives on Heap, accessed via pointer). 
      
      **Value Types (Structs/Records):**
      - **Structs (C#):** Lives on the Stack. No GC overhead. Best for small, immutable data (Points, Colors).
      - **Records (C#):** Reference types but with "Value Equality" and built-in immutability.
      - **TypeScript (Types/Interfaces):** JS doesn\'t have true value types, but we simulate them with \`Readonly\` to ensure predictable state.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C#', code: `// Struct: Value type, zero GC pressure
public struct Point { public int X, Y; }

// Record: Immutable, Value-based equality
public record User(string Email, string Role);

var u1 = new User("a@b.com", "Admin");
var u2 = u1 with { Role = "User" }; // Non-destructive mutation`
        },
        {
          lang: 'typescript', label: 'TypeScript', code: `// Simulating immutability with Readonly
type User = Readonly<{
  email: string;
  role: string;
}>;

const u1: User = { email: "a@b.com", role: "Admin" };
const u2 = { ...u1, role: "User" }; // Pattern similar to 'with'`
        }
      ],
      tradeoffs: [
        'Pro: Structs reduce Heap fragmentation in high-perf apps',
        'Pro: Records make state management (Redux/NgRx) safer',
        'Con: Large structs copied on every assignment (Performance hit)',
        'Con: Value types can\'t be inherited'
      ],
      realWorld: 'Use Structs for high-frequency game math (Unity); use Records for DTOs in Microservices.',
      tags: ['csharp', 'performance', 'immutability', 'memory']
    },
    {
      id: 'middleware-pipeline',
      title: 'Middleware & The HTTP Pipeline',
      category: 'dotnet',
      level: 'intermediate',
      summary: 'Understanding the request/response flow and why order matters.',
      detail: `ASP.NET Core uses a "Chain of Responsibility" pattern for handling HTTP requests.
      
      **The Pipeline Logic:**
      - Each component (Middleware) can choose to process the request and pass it to the next, OR short-circuit it.
      - On the way "back" (response), each middleware can modify the outgoing response.
      
      **Common Errors:**
      - Placing \`UseAuthorization\` before \`UseRouting\`.
      - Missing \`MapControllers\` or \`MapHubs\` at the end.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (ASP.NET Core)', code: `var app = builder.Build();

app.UseExceptionHandler("/Error"); // First for broad coverage
app.UseStaticFiles();             // High performance skip for logic
app.UseRouting();
app.UseAuthentication();          // Must be after Routing
app.UseAuthorization();           

app.MapGet("/", () => "Hello World!"); // Endpoint logic`
        },
        {
          lang: 'typescript', label: 'Express (Node.js)', code: `const app = express();

app.use(morgan('dev'));         // Logging
app.use(express.static('public')); 
app.use(authMiddleware);        // Custom auth logic
app.use(router);                // Endpoint routes

app.use((err, req, res, next) => { // Error handler last in Express
  res.status(500).send('Broken!');
});`
        }
      ],
      tradeoffs: [
        'Pro: Highly modular and extensible',
        'Pro: Low overhead for non-matching requests (static files)',
        'Con: Ordering bugs are silent and dangerous (Security risks)',
        'Con: Hidden complexity in deep pipelines'
      ],
      realWorld: 'Putting UseStaticFiles before UseAuthentication ensures public assets don\'t hit the heavy auth logic, saving CPU cycles.',
      tags: ['dotnet', 'middleware', 'http', 'web']
    },
    {
      id: 'di-lifetimes',
      title: 'Dependency Injection Lifetimes',
      category: 'dotnet',
      level: 'intermediate',
      summary: 'Transient, Scoped, and Singleton — avoiding the "Captive Dependency" trap.',
      detail: `Knowing how services are instantiated is the difference between a stable app and a memory-leak nightmare.
      
      **Lifetimes:**
      - **Transient:** Created every time they are requested. Best for lightweight, stateless services.
      - **Scoped:** Created once per client request (within the same HTTP scope). Best for DB Contexts/Repositories.
      - **Singleton:** Created once and live for the app lifetime. Best for Caching/Configuration.
      
      **⚠️ Captive Dependency:** When a long-lived service (Singleton) depends on a short-lived service (Scoped). The Scoped service is "trapped" and never disposed, causing leaks.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Microsoft.DI)', code: `// Configuration
services.AddTransient<IEmailService, EmailService>();
services.AddScoped<IUserRepository, UserRepository>();
services.AddSingleton<ICacheManager, CacheManager>();

// Usage (Constructor Injection)
public class UserService(IUserRepository repo) { ... }`
        },
        {
          lang: 'typescript', label: 'Inversify / NestJS', code: `// NestJS (similar semantics)
@Injectable({ scope: Scope.TRANSIENT })
export class DataService {}

@Injectable({ scope: Scope.REQUEST }) // Scoped
export class RequestContext {}

@Injectable() // Singleton by default
export class AppConfig {}`
        }
      ],
      tradeoffs: [
        'Singleton: Memory efficient, but risky for state',
        'Scoped: Safe for unit-of-work, but adds factory overhead',
        'Transient: Zero-risk for state, but highest memory allocations',
        'DI: Improves testability (mocking) drastically'
      ],
      realWorld: 'Never inject a Scoped DbContext into a Singleton Background Task; use IServiceScopeFactory instead.',
      tags: ['di', 'patterns', 'dotnet', 'architecture']
    },
    {
      id: 'minimal-api-vs-controllers',
      title: 'Minimal APIs vs Controllers',
      category: 'dotnet',
      level: 'intermediate',
      summary: 'The shift from MVC boilerplate to high-performance functional routing.',
      detail: `ASP.NET Core 6+ introduced Minimal APIs as a lightweight alternative to traditional Controllers.
      
      **Minimal APIs:**
      - Functional style, no "Controller" base class.
      - Lower memory footprint (faster startup).
      - Great for microservices and cloud-native apps.
      
      **Controllers (MVC):**
      - Organized by attributes and folder structure.
      - Better for complex monoliths with 100+ endpoints.
      - Built-in support for Filters and model binding conventions.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'Minimal API vs Controller', code: `// Minimal API (Program.cs)
app.MapGet("/users/{id}", (int id, IRepo repo) => repo.Get(id));

// Traditional Controller
[ApiController]
[Route("[controller]")]
public class UsersController : ControllerBase {
    [HttpGet("{id}")]
    public IActionResult Get(int id) => Ok(_repo.Get(id));
}`
        },
        {
          lang: 'typescript', label: 'Node.js (Fastify vs Nest)', code: `// Fastify (Minimal-like)
fastify.get('/users/:id', async (req, reply) => { ... });

// NestJS (Controller-like)
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id') id: string) { ... }
}`
        }
      ],
      tradeoffs: [
        'Minimal: 10-15% better throughput, less code',
        'Controller: Better organization for large teams',
        'Minimal: Harder to split across multiple files initially',
        'Controller: Easier to use built-in Authorization filters'
      ],
      realWorld: 'Use Minimal APIs for AWS Lambda / Azure Functions to reduce cold start times by 30%.',
      tags: ['dotnet', 'api', 'performance', 'minimal-api']
    },
    {
      id: 'angular-lifecycle',
      title: 'Component Lifecycle Hooks',
      category: 'angular',
      level: 'intermediate',
      summary: 'Mastering hook execution order to avoid "ExpressionChangedAfterItHasBeenCheckedError".',
      detail: `Angular components undergo a rigorous lifecycle from creation to destruction.
      
      **The Big Three:**
      - **ngOnInit:** Data initialization safely happens here. Inputs are set as of this moment.
      - **ngAfterViewInit:** The DOM and child components are fully rendered. Direct DOM manipulation happens here.
      - **ngOnDestroy:** Critical for cleanup (unsubscribing from Observables, clearing intervals).
      
      **⚠️ Common Pitfall:** Changing a bound value in \`ngAfterViewInit\` without \`setTimeout\` causes the app to crash in Dev mode because the "Check" cycle has already passed.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'Angular', code: `export class UserProfile implements OnInit, OnDestroy {
  @Input() id: string;
  private sub: Subscription;

  ngOnInit() {
    this.sub = this.api.getUser(this.id).subscribe();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe(); // Prevent memory leaks
  }
}`
        },
        {
          lang: 'typescript', label: 'React (Functional)', code: `const UserProfile = ({ id }) => {
  useEffect(() => {
    const sub = api.getUser(id).subscribe();
    
    return () => sub.unsubscribe(); // Equivalent to ngOnDestroy
  }, [id]); // id dependency similar to ngOnChanges
};`
        }
      ],
      tradeoffs: [
        'Pro: Extremely predictable state flow',
        'Pro: Centralized cleanup logic',
        'Con: Verbose boilerplate compared to React hooks',
        'Con: Steep learning curve for Hook order'
      ],
      realWorld: 'Always use ngOnDestroy to unsubscribe from infinite streams (like a WebSocket or Timer) to prevent the browser tab from consuming 4GB+ of RAM.',
      tags: ['angular', 'lifecycle', 'performance', 'spa']
    },
    {
      id: 'angular-change-detection',
      title: 'Change Detection: Default vs OnPush',
      category: 'angular',
      level: 'deep',
      summary: 'Optimizing UI performance by reducing the "Dirty Checking" frequency.',
      detail: `By default, Angular runs change detection on the entire component tree for every click, timer, or XHR.
      
      **ChangeDetectionStrategy.Default:**
      - Simple but inefficient.
      - Checks every component "just in case".
      
      **ChangeDetectionStrategy.OnPush:**
      - Only checks the component if:
        1. An \`@Input()\` reference changes.
        2. An event (click, change) originates from inside the component.
        3. You manually trigger it via \`ChangeDetectorRef\`.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'Angular (OnPush)', code: `@Component({
  selector: 'chart-item',
  template: '...',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Chart {
  @Input() data: LargeDataset; // Only checks if 'data' is a NEW reference
}`
        },
        {
          lang: 'typescript', label: 'React (memo)', code: `// Similar to OnPush, only re-renders if props change
const Chart = React.memo(({ data }) => {
  return <canvas>...</canvas>;
}, (prev, next) => prev.data === next.data);`
        }
      ],
      tradeoffs: [
        'OnPush: Massive performance gains in large apps',
        'OnPush: Faster UI interactions (lower scripting time)',
        'Default: "Just works" — fewer bugs for beginners',
        'OnPush: Requires immutability (must send NEW references)'
      ],
      realWorld: 'In a real-time trading app, using OnPush on 500+ table rows reduced CPU usage from 80% to 5% by preventing unnecessary re-renders of static rows.',
      tags: ['performance', 'optimization', 'rendering', 'angular']
    },
    {
      id: 'angular-routing-resolvers',
      title: 'Guards, Resolvers & Pre-fetching',
      category: 'angular',
      level: 'intermediate',
      summary: 'Preventing "Empty Page Flickers" and handling Auth before the component loads.',
      detail: `Modern SPAs shouldn't navigate to a page and *then* start loading data. It creates a jarring "Loading..." flicker.
      
      **The Routing Pipeline:**
      1. **Guards (CanActivate):** Check if user is allowed (Auth). Immediate redirect if not.
      2. **Resolvers:** Fetch the data from the API. The navigation is "paused" until the data arrives.
      3. **Page Display:** The component is rendered only when data is ready. No empty state needed.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'Angular (Resolver)', code: `// Resolver logic
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getById(route.paramMap.get('id'));
};

// Route config
{ path: 'user/:id', component: UserPage, resolve: { data: userResolver } }

// Access in Component
this.user = this.route.snapshot.data['data'];`
        },
        {
          lang: 'typescript', label: 'React (Loader)', code: `// React Router 6.4+ Loaders
export async function loader({ params }) {
  return getUser(params.id);
}

// Access in Component
const user = useLoaderData();`
        }
      ],
      tradeoffs: [
        'Pro: No "Pop-in" of data segments',
        'Pro: Unified error handling for data fetching',
        'Con: Navigation feels slower (delay before URL changes)',
        'Con: Complex logic if resolver hangs (timeout needed)'
      ],
      realWorld: 'Use Resolvers to verify that a resource exists (e.g., a specific Order ID) before letting the user even see the order page.',
      tags: ['angular', 'routing', 'ux', 'state']
    },
    {
      id: 'sql-indexing-btree',
      title: 'SQL Indexing & B-Trees',
      category: 'database',
      level: 'intermediate',
      summary: 'Why "SELECT *" is a performance killer and how B-Trees optimize lookups.',
      detail: `Most SQL databases (PostgreSQL, SQL Server, MySQL) use B-Tree indexes to find data in O(log n) time.
      
      **How it works:**
      - An index is a separate data structure that stores the column value and a pointer to the actual row.
      - **Clustered Index:** The actual data is sorted by this key (usually Primary Key).
      - **Non-Clustered Index:** A separate "map" to the data. 
      
      **The Pitfall:** Adding too many indexes slows down INSERT/UPDATE/DELETE because the database must update the index "map" for every change.`,
      codeExamples: [
        {
          lang: 'sql', label: 'SQL', code: `-- Create index on frequently searched column
CREATE INDEX idx_user_email ON Users(Email);

-- High Performance Seek
SELECT Name FROM Users WHERE Email = 'a@b.com';

-- Low Performance Scan (Index Ignored)
SELECT * FROM Users WHERE Email LIKE '%@b.com';`
        },
        {
          lang: 'typescript', label: 'EF Core / Drizzle', code: `// EF Core: Define index in Fluent API
modelBuilder.Entity<User>()
    .HasIndex(u => u.Email);

// Drizzle: Define in schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));`
        }
      ],
      tradeoffs: [
        'Pro: Speeds up READ queries from seconds to milliseconds',
        'Pro: Enforces uniqueness (Unique Indexes)',
        'Con: Consumes extra disk space',
        'Con: Slows down WRITE operations (Index maintenance)'
      ],
      realWorld: 'On a table with 10 million rows, a query without an index took 8 seconds (Scanning every row). With a B-Tree index, it took 12ms (Finding the key in the tree).',
      tags: ['sql', 'database', 'performance', 'indexing']
    },
    {
      id: 'sql-execution-plans',
      title: 'Execution Plans: Scan vs Seek',
      category: 'database',
      level: 'deep',
      summary: 'Reading the database "Mind" to understand why queries are slow.',
      detail: `Before running a query, the DB "Optimizer" creates an Execution Plan.
      
      **Key Operators:**
      - **Index Seek:** The DB uses the index to jump directly to the data. (Fast / Target: 🟢)
      - **Index Scan:** The DB reads the entire index. (Moderate / Target: 🟡)
      - **Table/Clustered Scan:** The DB reads the entire table from disk. (Slow / Target: 🔴)
      
      **Why Seeks turn into Scans:**
      1. Using functions on the indexed column: \`WHERE YEAR(Date) = 2024\`.
      2. Data Type Mismatch: Searching a string column with an integer.`,
      codeExamples: [
        {
          lang: 'sql', label: 'SQL (EXPLAIN)', code: `-- PostgreSQL / MySQL
EXPLAIN ANALYZE 
SELECT * FROM Orders WHERE OrderId = 500;

-- Look for:
-- "Index Scan" -> Bad (Scan)
-- "Index Seek" or "Index Only Scan" -> Good (Seek)`
        },
        {
          lang: 'csharp', label: 'EF Core (Logging)', code: `// View generated SQL in Debug Output
optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information);

// Check if EF is doing "Client-Side Evaluation"
// (Downloading all rows to filter in RAM - EXTREMELY BAD)`
        }
      ],
      tradeoffs: [
        'Pro: Essential for debugging production bottlenecks',
        'Pro: Helps identify missing covering indexes',
        'Con: Plans can change based on data volume (Parameter Sniffing)',
        'Con: Requires deep DB engine knowledge'
      ],
      realWorld: "By changing 'WHERE UPPER(Email) = ...' to 'WHERE Email = ...', we moved from a Full Table Scan to a Clustered Index Seek, reducing RDS CPU load by 60%.",
      tags: ['sql', 'optimization', 'query-plan', 'database']
    },
    {
      id: 'n-plus-1-problem',
      title: 'The N+1 Query Problem',
      category: 'database',
      level: 'intermediate',
      summary: 'The #1 reason ORMs crash production databases early on.',
      detail: `The N+1 problem occurs when you fetch a list of items (1 query) and then, while looping through them, fetch a related item for each record (N queries).
      
      **Total Queries: 1 (Original) + N (Related) = N + 1.**
      
      Instead of 1 join, you send 101 separate requests to the database, killing connection pools and increasing latency.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (EF Core)', code: `// 🔴 BAD (N+1): Lazy loading triggered in loop
var orders = context.Orders.ToList(); // 1 Query
foreach(var o in orders) {
    var user = o.User.Name; // N Queries!
}

// 🟢 GOOD (Eager Loading): 1 Query with Join
var orders = context.Orders.Include(o => o.User).ToList();`
        },
        {
          lang: 'typescript', label: 'Drizzle / Prisma', code: `// Prisma (Explicit Include)
const orders = await prisma.order.findMany({
  include: { user: true } // Joins in 1 query
});

// Drizzle (Relational Queries)
const orders = await db.query.orders.findMany({
  with: { user: true }
});`
        }
      ],
      tradeoffs: [
        'Pro: Joining reduces round-trips to SQL server',
        'Pro: Prevents "Death by a thousand cuts" latency',
        'Con: Large joins can increase memory usage on the app server',
        'Con: Over-fetching (Include everything) can slow down the DB'
      ],
      realWorld: 'A dashboard showing 50 orders was generating 51 SQL queries per refresh. Switching to Eager Loading reduced the page load time from 1.2s to 150ms.',
      tags: ['performance', 'orm', 'sql', 'latency']
    },
    {
      id: 'sql-injection-prevention',
      title: 'SQL Injection & Parameterization',
      category: 'security',
      level: 'intermediate',
      summary: 'Preventing the #1 most common data breach vector with parameterized queries.',
      detail: `SQL Injection occurs when user input is concatenated directly into a query string, allowing attackers to manipulate the database command.
      
      **The Solution (Parameterization):**
      - Instead of building strings, you send the query template and the values separately.
      - The database treats the values as "Data", never as "Code".
      - ORMs (EF Core, Prisma) do this automatically, but raw SQL requires manual care.`,
      codeExamples: [
        {
          lang: 'sql', label: 'SQL (Raw)', code: `-- 🔴 DANGEROUS (Injection)
query = "SELECT * FROM Users WHERE Name = '" + userInput + "'";

-- 🟢 SECURE (Parameterized)
query = "SELECT * FROM Users WHERE Name = @name";
parameters.Add("@name", userInput);`
        },
        {
          lang: 'typescript', label: 'Node.js (pg)', code: `// 🔴 DANGEROUS
client.query(\`SELECT * FROM users WHERE id = \${id}\`);

// 🟢 SECURE
client.query('SELECT * FROM users WHERE id = $1', [id]);`
        }
      ],
      tradeoffs: [
        'Pro: 100% protection against standard SQL injection',
        'Pro: Allows the DB to cache execution plans',
        'Con: Forces slightly more verbose code for raw queries',
        'Con: Doesn\'t protect against "Second Order" injection'
      ],
      realWorld: 'A simple login form without parameterization allowed attackers to login as admin by typing "\' OR 1=1 --" into the password field.',
      tags: ['security', 'sql', 'defense', 'owasp']
    },
    {
      id: 'xss-protection',
      title: 'XSS & Content Security Policy',
      category: 'security',
      level: 'intermediate',
      summary: 'Blocking malicious scripts from stealing user session cookies.',
      detail: `Cross-Site Scripting (XSS) happens when an app includes untrusted data in a web page without proper validation or escaping.
      
      **Defenses:**
      1. **Context-Aware Escaping:** Converting \`<\` to \`&lt;\`. Modern frameworks (Angular, React) do this by default.
      2. **HttpOnly Cookies:** Prevents JS (\`document.cookie\`) from accessing sensitive tokens.
      3. **CSP (Content Security Policy):** A browser header that tells the browser only to trust scripts from specific domains.`,
      codeExamples: [
        {
          lang: 'javascript', label: 'Security Headers', code: `// Express (Helmet)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "trusted-scripts.com"]
  }
}));`
        },
        {
          lang: 'csharp', label: 'ASP.NET Core Cookies', code: `options.Cookie.HttpOnly = true;
options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
options.Cookie.SameSite = SameSiteMode.Strict;`
        }
      ],
      tradeoffs: [
        'Pro: CSP blocks most external script injections',
        'Pro: HttpOnly makes token theft via JS impossible',
        'Con: CSP can be difficult to configure without breaking third-party tools',
        'Con: "Strict" SameSite can break some OAuth redirects'
      ],
      realWorld: 'Using "HttpOnly" on your JWT cookie means even if an attacker finds an XSS vulnerability, they cannot steal the user\'s login token.',
      tags: ['security', 'xss', 'web', 'headers']
    },
    {
      id: 'secret-management',
      title: 'Secrets & Environment Security',
      category: 'security',
      level: 'intermediate',
      summary: 'Moving beyond plain-text .env files to secure cloud vaults.',
      detail: `Hardcoding API keys or DB passwords in your source code is a critical failure. 
      
      **The Hierarchy of Secrets:**
      1. **🔴 Hardcoded:** Instant disaster (commits to Git).
      2. **🟡 .env Files:** Better, but often leaked via unprotected backups or logs.
      3. **🟢 Environment Variables:** Best for local dev; standard in CI/CD.
      4. **💎 Secret Vaults:** Best for Production (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault).`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Azure Key Vault)', code: `// Securely fetch at runtime
var client = new SecretClient(new Uri(kvUri), new DefaultAzureCredential());
KeyVaultSecret secret = await client.GetSecretAsync("DbPassword");`
        },
        {
          lang: 'typescript', label: 'Node.js (AWS SDK)', code: `const client = new SecretsManagerClient({ region: "us-east-1" });
const command = new GetSecretValueCommand({ SecretId: "Prod/DB/Pass" });
const response = await client.send(command);`
        }
      ],
      tradeoffs: [
        'Pro: Secrets never touch the source code or local disks',
        'Pro: Enables "Secret Rotation" (auto-changing passwords)',
        'Con: Adds network latency to app startup',
        'Con: Requires cloud-specific setup (IAM roles/Service Principals)'
      ],
      realWorld: 'A public GitHub project accidentally leaked an AWS Key. Within 5 minutes, botnets used the key to spin up $20,000 worth of crypto-mining instances.',
      tags: ['security', 'devops', 'cloud', 'vault']
    },
    {
      id: 'rxjs-observables-vs-promises',
      title: 'Observables vs Promises',
      category: 'rxjs',
      level: 'intermediate',
      summary: 'Why streams are more powerful than one-off async values.',
      detail: `While Promises handle a single async event, Observables handle multiple events over time(Streams).
      
      ** Key Differences:**
      - ** Emit Multiple:** Promises emit once; Observables can emit 0, 1, or 1,000 values.
      - ** Cancellable:** You can't natively "stop" a Promise, but you can unsubscribe from an Observable.
    - ** Lazy:** Observables don't start until you subscribe. Promises start immediately.
    - ** Operators:** RxJS provides 100 + operators to transform, filter, and combine streams.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'RxJS (Observable)', code: `const stream$ = new Observable(subscriber => {
      const id = setInterval(() => subscriber.next('ping'), 1000);
      return () => clearInterval(id); // Cleanup
    });

  const sub = stream$.subscribe(console.log);
  setTimeout(() => sub.unsubscribe(), 5000); // STOP the stream`
        },
        {
          lang: 'javascript', label: 'JavaScript (Promise)', code: `const p = new Promise(resolve => {
  setTimeout(() => resolve('done'), 1000);
});

p.then(console.log); 
// Cannot "cancel" this mid-way easily.`
        }
      ],
      tradeoffs: [
        'Pro: Perfect for events (clicks, websockets, sensors)',
        'Pro: Declarative code using pipes',
        'Con: Steeper learning curve than standard async/await',
        'Con: Risk of memory leaks if not unsubscribed'
      ],
      realWorld: 'Use Observables for a "Real-time Search" where every keystroke is an event that needs to be debounced and potentially cancelled.',
      tags: ['rxjs', 'async', 'streams', 'reactive']
    },
    {
      id: 'rxjs-higher-order-operators',
      title: 'SwitchMap vs MergeMap vs ExhaustMap',
      category: 'rxjs',
      level: 'deep',
      summary: 'Managing "Race Conditions" in complex async workflows.',
      detail: `Higher-order mapping operators decide what happens when a new event arrives while the previous one is still processing.
      
      **The Big Three:**
      1. **switchMap:** Cancels the previous request and starts the new one. (Best for Search/Auto-complete).
      2. **mergeMap:** Runs everything in parallel. (Best for independent save operations).
      3. **exhaustMap:** Ignores new events until the current one finishes. (Best for Submit buttons).`,
      codeExamples: [
        {
          lang: 'typescript', label: 'RxJS Real-World Patterns', code: `// 🔍 Search (switchMap)
searchInput$.pipe(
  debounceTime(300),
  switchMap(term => api.search(term)) // Cancels old search if typing continues
);

// 💾 Multiple Uploads (mergeMap)
fileIds$.pipe(
  mergeMap(id => api.upload(id)) // All uploads run simultaneously
);

// 🔘 Submit Button (exhaustMap)
click$.pipe(
  exhaustMap(() => api.saveData()) // Ignores double-clicks until save finishes
);`
        }
      ],
      tradeoffs: [
        'Pro: Prevents out-of-order data results (Race conditions)',
        'Pro: Built-in concurrency control',
        'Con: Choosing the wrong operator leads to lost data or hidden bugs',
        'Con: Hard to visualize without marble diagrams'
      ],
      realWorld: 'In a "Typeahead Search", if request A (slow) finishes after request B (fast), switchMap ensures the user only sees result B, preventing UI data flickering.',
      tags: ['rxjs', 'operators', 'performance', 'concurrency']
    },
    {
      id: 'rxjs-pipe-logic',
      title: 'The Pipeable Operators Pattern',
      category: 'rxjs',
      level: 'intermediate',
      summary: 'Building complex logic chains with functional operators.',
      detail: `The \`.pipe()\` method is the engine of RxJS. It allows you to compose small, pure functions into powerful data processing pipelines.
      
      **Common Pipeline Stages:**
      - **Filter:** Only let specific data through.
      - **Map:** Transform the data (e.g., extract a property).
      - **CatchError:** Gracefully handle failures without killing the entire stream.
      - **Retry:** Automatically try again if a network request fails.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'A Robust API Pipeline', code: `const data$ = api.getData().pipe(
  retry(3),             // Try 3 times on failure
  map(res => res.items), // Extract array
  filter(items => items.length > 0), // Ignore empty
  catchError(err => {
    console.error(err);
    return of([]); // Fallback to empty array
  })
);`
        }
      ],
      tradeoffs: [
        'Pro: Extremely clean logic (no nested if/else)',
        'Pro: High reusability of operator chains',
        'Con: Debugging inside a pipe requires specific tools (tap operator)',
        'Con: Over-piping can make code unreadable'
      ],
      realWorld: 'Using \`retry(3)\` with a \`delay\` is the most efficient way to handle "Transient Network Failures" in mobile applications.',
      tags: ['rxjs', 'functional', 'patterns', 'clean-code']
    },
    {
      id: 'http-caching-headers',
      title: 'Browser Caching & HTTP Headers',
      category: 'performance',
      level: 'intermediate',
      summary: 'Leveraging the browser cache to reduce server round-trips.',
      detail: `HTTP Caching header control how the browser and intermediate proxies store responses.
      
      **Key Headers:**
      - **Cache-Control:** The primary header. Use \`max-age\` for duration and \`public/private\` for visibility.
      - **ETag:** A unique hash of the resource. Browser sends it back with \`If-None-Match\` to check if things changed.
      - **Vary:** Tells the cache that the response depends on a specific request header (e.g., \`User-Agent\` or \`Accept-Encoding\`).`,
      codeExamples: [
        {
          lang: 'javascript', label: 'Common Cache-Control Patterns', code: `// Immutable Static Assets (Images, CSS, JS) - Cache for 1 Year
// Cache-Control: public, max-age=31536000, immutable

// Dynamic Content - Always revalidate before using
// Cache-Control: no-cache, must-revalidate

// Sensitive Data - Never store in cache
// Cache-Control: no-store`
        },
        {
          lang: 'csharp', label: 'ASP.NET Core Middleware', code: `app.UseStaticFiles(new StaticFileOptions {
    OnPrepareResponse = ctx => {
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=600");
    }
});`
        }
      ],
      tradeoffs: [
        'Pro: Instant page loads for returning visitors',
        'Pro: Drastically reduces bandwidth costs',
        'Con: Stale content if caching strategy is too aggressive',
        'Con: Hard to "Invalidate" cache without changing URLs (cache busting)'
      ],
      realWorld: 'A news site using "max-age=60" on the homepage saved 90% of database load during peak traffic while keeping content fresh enough for users.',
      tags: ['http', 'caching', 'performance', 'headers']
    },
    {
      id: 'cdn-edge-strategies',
      title: 'CDN & Edge Scaling',
      category: 'performance',
      level: 'intermediate',
      summary: 'Reducing global latency by moving data closer to the user.',
      detail: `A Content Delivery Network (CDN) is a distributed network of servers (Edge locations) that cache your content globally.
      
      **Core Strategies:**
      - **Static Asset Offloading:** Offload large file (Video, JS, Images) delivery from your origin server.
      - **Edge Logic (Serverless):** Run small scripts (Cloudflare Workers, Lambda@Edge) at the CDN level for Auth, A/B Testing, or Image resizing.
      - **Shielding:** Using the CDN to protect your origin from DDoS attacks.`,
      codeExamples: [
        {
          lang: 'javascript', label: 'Cloudflare Worker (Edge Logic)', code: `addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Logic runs at the Edge center closest to user
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)
  newHeaders.set('X-Edge-Processed', 'true')
  return new Response(response.body, { ...response, headers: newHeaders })
}`
        }
      ],
      tradeoffs: [
        'Pro: Reduces latency from 200ms+ to < 20ms globally',
        'Pro: Origin server only handles dynamic, non-cacheable data',
        'Con: Increases operational complexity (multi-cloud/vendor)',
        'Con: Costly for high-bandwidth egress if not optimized'
      ],
      realWorld: 'By moving video thumbnails to an Edge CDN, a social app reduced global latency for Australian users by 85% compared to serving from a US-East server.',
      tags: ['cdn', 'edge', 'scaling', 'infrastructure']
    },
    {
      id: 'debounce-vs-throttle',
      title: 'Debouncing vs Throttling',
      category: 'performance',
      level: 'intermediate',
      summary: 'Optimizing high-frequency browser events to save CPU.',
      detail: `Both techniques limit how many times a function is called, but they work differently.
      
      **Debouncing:**
      - "Wait until the typing stops".
      - Resets the timer on every event.
      - Useful for: Search bars, input validation.
      
      **Throttling:**
      - "Execute only once every X ms".
      - Guarantees execution at regular intervals.
      - Useful for: Scroll listeners, resize events, gaming loops.`,
      codeExamples: [
        {
          lang: 'javascript', label: 'The Implementation', code: `// Debounce: Wait 300ms after last event
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Throttle: Execute at most once every 300ms
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}`
        }
      ],
      tradeoffs: [
        'Pro: Prevents UI lag and browser crashes on heavy pages',
        'Pro: Reduces accidental double-API calls',
        'Con: Introduces a slight delay in feedback (Debounce)',
        'Con: Can feel "choppy" if throttle limit is too high'
      ],
      realWorld: 'Implementing a Debounce on a window resize listener prevented a charting library from re-rendering 60 times a second, saving the battery life of mobile users.',
      tags: ['performance', 'javascript', 'ux', 'optimization']
    },
    {
      id: 'resilience-circuit-breaker',
      title: 'Circuit Breaker & Exponential Backoff',
      category: 'performance',
      level: 'deep',
      summary: 'Preventing "Cascading Failures" when downstream services are struggling.',
      detail: `In a microservices world, if Service A is slow, Service B can get stuck waiting for it, eventually crashing the entire system.
      
      **The Resilience Toolkit:**
      - **Exponential Backoff:** Instead of retrying every 1s, you wait 1s, then 2s, then 4s, then 8s. This gives the struggling service "breathing room".
      - **Circuit Breaker:** If a service fails 5 times in a row, the breaker "Opens". All future calls fail instantly for 30s without even trying the network. This prevents "Thundering Herds" from killing a recovering service.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Polly Library)', code: `// Definition
var pipeline = new ResiliencePipelineBuilder()
    .AddRetry(new RetryStrategyOptions {
        BackoffType = DelayBackoffType.Exponential,
        MaxRetryAttempts = 3
    })
    .AddCircuitBreaker(new CircuitBreakerStrategyOptions {
        FailureRatio = 0.5, // 50% failure rate opens the circuit
        SamplingDuration = TimeSpan.FromSeconds(10)
    })
    .Build();

// Execution
await pipeline.ExecuteAsync(async ct => await api.CallAsync(ct));`
        },
        {
          lang: 'typescript', label: 'RxJS (RetryStrategy)', code: `const request$ = api.getData().pipe(
  retry({
    count: 3,
    delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000)
  }),
  catchError(err => {
    if (circuitOpen) return throwError(() => 'Service Unavailable');
    return handleError(err);
  })
);`
        }
      ],
      tradeoffs: [
        'Pro: Prevents a single slow service from taking down the whole app',
        'Pro: Self-healing architecture',
        'Con: Users see "Service Unavailable" immediately when breaker is open',
        'Con: Complexity in configuring "half-open" states'
      ],
      realWorld: 'During a database migration, the API became slow. The Circuit Breaker tripped, saving the API servers from crashing due to thousands of queued requests, allowing the DB to finish its work.',
      tags: ['resilience', 'polly', 'microservices', 'devops']
    },
    {
      id: 'cache-aside-pattern',
      title: 'The Cache-Aside Pattern',
      category: 'performance',
      level: 'intermediate',
      summary: 'State-of-the-art data fetching with Redis/Distributed Caching.',
      detail: `The "Cache-Aside" or "Lazy Loading" pattern is the most common way to use a cache.
      
      **The Logic:**
      1. Application checks the Cache (Redis/In-Mem).
      2. If **Hit**: Return data immediately. 🟢
      3. If **Miss**: Fetch from DB. 🟡
      4. **Populate**: Write the DB result into the Cache for next time.
      5. Return data to user.
      
      **Invalidation:** When data is updated in the DB, you must "evict" (delete) the cache entry to prevent stale data.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Distributed Cache)', code: `public async Task<User> GetUserAsync(int id) {
    var key = $"user_{id}";
    // 1. Check Cache
    var cached = await _cache.GetStringAsync(key);
    if (cached != null) return JsonConvert.DeserializeObject<User>(cached);

    // 2. Cache Miss -> DB
    var user = await _db.Users.FindAsync(id);

    // 3. Populate Cache
    if (user != null) {
        await _cache.SetStringAsync(key, JsonConvert.SerializeObject(user), 
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1) });
    }
    return user;
}`
        }
      ],
      tradeoffs: [
        'Pro: Reads are extremely fast once cached',
        'Pro: DB load is reduced by 80-90% for popular items',
        'Con: First request (Cold Start) is always slow',
        'Con: If DB updates but cache isn\'t cleared, users see old data'
      ],
      realWorld: 'A social media feed uses Cache-Aside to store the "Top 100 Posts". Thousands of users see the cached list without ever hitting the main database.',
      tags: ['caching', 'redis', 'database', 'performance']
    },
    {
      id: 'optimistic-ui-updates',
      title: 'Optimistic UI Updates',
      category: 'performance',
      level: 'intermediate',
      summary: 'Making apps feel 10x faster by assuming success.',
      detail: `Optimistic UI is a pattern where the UI updates immediately as if the server request succeeded, even before the server responds.
      
      **The Workflow:**
      1. User clicks "Like".
      2. UI immediately shows the full heart and increments count. 🟢
      3. API call is sent in the background.
      4. **If Success**: Do nothing (UI is already correct).
      5. **If Failure**: Rollback the UI state and show an error toast. 🔴`,
      codeExamples: [
        {
          lang: 'typescript', label: 'Angular (Optimistic)', code: `likePost(postId: string) {
  // 1. Optimistic Update
  this.posts[postId].liked = true;
  this.posts[postId].likes++;

  // 2. Background Call
  this.api.like(postId).subscribe({
    error: () => {
      // 3. Rollback on failure
      this.posts[postId].liked = false;
      this.posts[postId].likes--;
      this.toast.error('Failed to like post.');
    }
  });
}`
        }
      ],
      tradeoffs: [
        'Pro: Interactions feel instantaneous ("Zero Latency")',
        'Pro: Higher perceived performance for users on slow mobile networks',
        'Con: Requires "Rollback" logic for every action',
        'Con: Risky for critical actions (Payments, Deletions)'
      ],
      realWorld: 'Instagram and WhatsApp use Optimistic UI for comments and messages. Your message appears in the list instantly, with a small "sending" spinner that only appears if the network is really slow.',
      tags: ['ux', 'performance', 'frontend', 'async']
    },
    {
      id: 'pattern-strategy',
      title: 'Strategy Pattern',
      category: 'design-patterns',
      level: 'intermediate',
      summary: 'Decoupling algorithms from the classes that use them.',
      detail: `The Strategy Pattern allows you to define a family of algorithms, encapsulate each one, and make them interchangeable.
      
      **When to use:**
      - When you have multiple ways of doing the same thing (e.g., Export as PDF, Excel, or CSV).
      - When you want to avoid massive \`if-else\` or \`switch\` blocks.
      - When you need to change behavior at runtime.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Export Services)', code: `public interface IExportStrategy { void Export(Data d); }

public class PdfExport : IExportStrategy { ... }
public class CsvExport : IExportStrategy { ... }

// Usage
public class DataExporter(IExportStrategy strategy) {
    public void Run(Data d) => strategy.Export(d);
}`
        },
        {
          lang: 'typescript', label: 'TypeScript (Validation)', code: `type Validator = (v: any) => boolean;

const strategies = {
  email: (v: string) => v.includes('@'),
  phone: (v: string) => /^\\d{10}$/.test(v)
};

// Usage
function validate(value: any, type: keyof typeof strategies) {
  return strategies[type](value);
}`
        }
      ],
      tradeoffs: [
        'Pro: Open/Closed Principle (Add new strategies without changing context)',
        'Pro: Eliminates complex conditional logic',
        'Con: Client must be aware of different strategies',
        'Con: Increases the number of objects/classes in the system'
      ],
      realWorld: 'A Payment Gateway system uses the Strategy pattern to switch between Stripe, PayPal, and Bank Transfer depending on the user\'s selection, without changing the main Checkout logic.',
      tags: ['patterns', 'solid', 'architecture', 'clean-code']
    },
    {
      id: 'pattern-observer',
      title: 'Observer Pattern (Pub/Sub)',
      category: 'design-patterns',
      level: 'intermediate',
      summary: 'Establishing a one-to-many dependency between objects.',
      detail: `The Observer Pattern is the foundation of reactive programming. It allows multiple "Observers" to listen to changes in a "Subject".
      
      **Core Concepts:**
      - **Subject:** The source of truth. Maintains a list of observers.
      - **Observer:** The listener. It gets notified when the Subject changes.
      
      **Modern Evolution:** Event Emitters in Node.js and Observables in RxJS are implementations of this pattern.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'Simple JS Observer', code: `class Subject {
  private observers = [];
  subscribe(fn) { this.observers.push(fn); }
  notify(data) { this.observers.forEach(fn => fn(data)); }
}

const news = new Subject();
news.subscribe(data => console.log('UI Updated:', data));
news.notify('New Article Posted!');`
        },
        {
          lang: 'csharp', label: 'C# (Events)', code: `public class StockTicker {
    public event EventHandler<decimal> PriceChanged;
    public void SetPrice(decimal p) => PriceChanged?.Invoke(this, p);
}

// Usage
ticker.PriceChanged += (s, p) => UpdateUI(p);`
        }
      ],
      tradeoffs: [
        'Pro: Loose coupling (Subject doesn\'t know details of Observers)',
        'Pro: Broadcast communication to many listeners at once',
        'Con: Risk of memory leaks if observers aren\'t "unsubscribed"',
        'Con: Notification order is often unpredictable'
      ],
      realWorld: 'A "Notification System" in a banking app uses the Observer pattern. When a transaction occurs (Subject), observers for SMS, Email, and Push Notifications all fire independently.',
      tags: ['patterns', 'reactive', 'events', 'decoupling']
    },
    {
      id: 'pattern-factory',
      title: 'Factory & Abstract Factory',
      category: 'design-patterns',
      level: 'intermediate',
      summary: 'Centralizing object creation logic to simplify complex initialization.',
      detail: `The Factory Pattern provides an interface for creating objects but allows subclasses to alter the type of objects that will be created.
      
      **Why use it?**
      - Centralizes "New-ing" objects.
      - Useful when you don't know the exact class until runtime.
      - Simplifies complex setup logic (connecting to DB, setting defaults).`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Db Connection Factory)', code: `public class ConnectionFactory {
    public IDbConnection Create(string provider) => provider switch {
        "SqlServer" => new SqlConnection(config),
        "Postgres" => new NpgsqlConnection(config),
        _ => throw new Exception("Unknown")
    };
}`
        },
        {
          lang: 'typescript', label: 'TS (UI Component Factory)', code: `const createWidget = (type: 'chart' | 'table') => {
  if (type === 'chart') return new HighChartsWidget();
  return new DataTableWidget();
};`
        }
      ],
      tradeoffs: [
        'Pro: Encourages "Code to Interface, not Implementation"',
        'Pro: Easier testing (just mock the factory output)',
        'Con: Can lead to over-engineering for simple object creation',
        'Con: Requires a common interface/base class for all products'
      ],
      realWorld: 'A cross-platform Mobile App uses a Factory to create "Buttons". On iOS, it creates a CupertinoButton; on Android, a MaterialButton, while the code only asks for a "Button".',
      tags: ['patterns', 'solid', 'creation', 'architecture']
    },
    {
      id: 'cloud-graceful-shutdown',
      title: 'Graceful Shutdown (Cloud Native)',
      category: 'devops',
      level: 'intermediate',
      summary: 'Preventing data loss and dropped connections during deployments.',
      detail: `In environments like Kubernetes or AWS ECS, containers are frequently stopped. If your app just "dies", it might leave a database transaction half-done or drop a user's upload.
      
      **The Workflow:**
      1. Runtime sends a **SIGTERM** signal.
      2. App stops accepting NEW requests.
      3. App waits for IN-FLIGHT requests to finish.
      4. App closes Database/Redis connections safely.
      5. App exits (SIGKILL is sent if it takes too long).`,
      codeExamples: [
        {
          lang: 'javascript', label: 'Node.js (Express)', code: `const server = app.listen(3000);

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Cleaning up...');
  server.close(() => {
    console.log('HTTP server closed.');
    db.close(); // Close DB connections
    process.exit(0);
  });
});`
        },
        {
          lang: 'csharp', label: 'C# (Host Shutdown)', code: `// In .NET 6/7/8+
app.Lifetime.ApplicationStopping.Register(() => {
    logger.LogInformation("Stopping service...");
    // Cleanup logic here
    _cache.Dispose();
});`
        }
      ],
      tradeoffs: [
        'Pro: No "502 Bad Gateway" errors during updates',
        'Pro: Ensures database integrity',
        'Con: Increases deployment time slightly (waiting for tasks)',
        'Con: Requires careful timeout configuration'
      ],
      realWorld: 'A high-traffic e-commerce site reduced "Order Processing Failures" by 98% during deployments by implementing graceful shutdown on their worker nodes.',
      tags: ['devops', 'kubernetes', 'cloud', 'resilience']
    },
    {
      id: 'idempotent-api-design',
      title: 'Idempotent API Design',
      category: 'architecture',
      level: 'deep',
      summary: 'Guaranteeing "Exactly-Once" execution in unreliable networks.',
      detail: `What happens if a user clicks "Pay" and the network times out? Did the payment go through? If they click again, will they be double-charged?
      
      **The Solution: Idempotency Keys**
      1. Client generates a unique \`Idempotency-Key\` (UUID).
      2. Server stores the RESULT of the first successful request against that key.
      3. If a duplicate request arrives with the same key, the server returns the **cached result** without re-running the logic.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (API Controller)', code: `[HttpPost]
public async Task<IActionResult> ProcessPayment(PaymentRequest req, 
    [FromHeader(Name = "X-Idempotency-Key")] string key) {
    
    var existing = await _cache.GetAsync(key);
    if (existing != null) return Ok(existing); // Return saved result

    var result = await _svc.PayAsync(req);
    await _cache.SetAsync(key, result, TimeSpan.FromHours(24));
    
    return Ok(result);
}`
        }
      ],
      tradeoffs: [
        'Pro: Safety against network retries and double-clicks',
        'Pro: Critical for financial and system-state operations',
        'Con: Requires a fast storage layer (Redis) for keys',
        'Con: Keys must have a TTL (expiry) to prevent storage bloat'
      ],
      realWorld: 'Stripe and PayPal APIs require Idempotency Keys for all "Charge" requests to ensure users are never billed twice for the same order.',
      tags: ['architecture', 'api', 'distributed', 'security']
    },
    {
      id: 'pattern-transactional-outbox',
      title: 'The Transactional Outbox Pattern',
      category: 'architecture',
      level: 'deep',
      summary: 'Reliably sending messages without distributed transactions.',
      detail: `The "Dual Write" problem: You save a User to the DB and want to send a "User Created" event to RabbitMQ. If the DB save works but the Message Queue is down, your system becomes inconsistent.
      
      **The Outbox Solution:**
      1. Save the User AND the Event to the **same database** in a single transaction.
      2. A separate "Relay" process polls the Outbox table and sends events to the Queue.
      3. Once sent, the Relay marks the event as "Published".`,
      codeExamples: [
        {
          lang: 'sql', label: 'Outbox Table Schema', code: `BEGIN TRANSACTION;
  INSERT INTO Users (Id, Name) VALUES (123, 'John');
  INSERT INTO Outbox (Id, Type, Payload, Status) 
  VALUES (gen_uuid(), 'UserCreated', '{...}', 'Pending');
COMMIT;`
        },
        {
          lang: 'csharp', label: 'C# (Background Relay)', code: `// Hosted service polling the DB
protected override async Task ExecuteAsync(CancellationToken ct) {
    while (!ct.IsCancellationRequested) {
        var events = await _db.Outbox.Where(e => !e.Processed).ToListAsync();
        foreach(var e in events) {
            await _bus.Publish(e.Payload);
            e.Processed = true;
        }
        await _db.SaveChangesAsync();
        await Task.Delay(1000);
    }
}`
        }
      ],
      tradeoffs: [
        'Pro: Guaranteed eventual consistency',
        'Pro: No need for heavy 2PC (Two-Phase Commit) protocols',
        'Con: "At-Least-Once" delivery (messages might be sent twice, need idempotency!)',
        'Con: Introduces a slight delay in message delivery'
      ],
      realWorld: 'Uber and Netflix use the Outbox pattern to ensure that when a ride ends or a movie starts, the billing and analytics systems stay perfectly synced even during outages.',
      tags: ['architecture', 'microservices', 'data-integrity', 'messaging']
    },
    {
      id: 'pattern-solid',
      title: 'SOLID Principles',
      category: 'architecture',
      level: 'deep',
      summary: 'The five laws of highly maintainable object-oriented software.',
      detail: `SOLID is an acronym for five design principles that make software more understandable, flexible, and maintainable.
      
      **The Five Pillars:**
      1. **Single Responsibility (SRP):** A class should have one, and only one, reason to change.
      2. **Open/Closed (OCP):** Software entities should be open for extension, but closed for modification.
      3. **Liskov Substitution (LSP):** Subtypes must be substitutable for their base types without breaking the app.
      4. **Interface Segregation (ISP):** Clients shouldn't be forced to depend on methods they don't use.
      5. **Dependency Inversion (DIP):** Depend on abstractions, not concretions.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'DIP (The Power Principle)', code: `// ❌ WRONG: Hard dependency
class OrderService {
  private logger = new FileLogger(); // Directly coupled
}

// ✅ CORRECT: Dependency Inversion
interface ILogger { log(msg: string): void; }

class OrderService {
  constructor(private logger: ILogger) {} // Inject abstraction
}`
        }
      ],
      tradeoffs: [
        'Pro: Extremely easy to unit test (via mocking)',
        'Pro: Decoupled code allows for massive scaling of teams',
        'Con: Introduces "Boilerplate" and many small interfaces',
        'Con: Over-abstraction can make simple logic hard to find'
      ],
      realWorld: 'Implementing the Open/Closed principle allowed a game studio to add 50 new character types without changing a single line of the original "Combat Engine" code.',
      tags: ['solid', 'architecture', 'clean-code', 'oop']
    },
    {
      id: 'cap-theorem',
      title: 'CAP Theorem',
      category: 'cloud',
      level: 'deep',
      summary: 'Why you cannot have everything in a distributed database.',
      detail: `In a distributed system, you can only pick TWO out of the following three guarantees:
      
      **C - Consistency:** Every read receives the most recent write or an error.
      **A - Availability:** Every request receives a (non-error) response.
      **P - Partition Tolerance:** The system continues to operate despite network failures.
      
      **Common Trade-offs:**
      - **CP (Consistency + Partition):** MongoDB, HBase. (System goes down if it can't sync).
      - **AP (Availability + Partition):** Cassandra, DynamoDB. (System returns "Old" data but stays alive).`,
      codeExamples: [
        {
          lang: 'sql', label: 'CP vs AP configuration', code: `// CP Setting (ACID-like)
// MongoDB: { w: "majority", j: true }
// Ensures majority acknowledge before returning success.

// AP Setting (Eventually Consistent)
// Cassandra: CONSISTENCY ONE
// Returns success as soon as ONE node has the data.`
        }
      ],
      tradeoffs: [
        'Pro: Provides a mathematical framework for database choice',
        'Pro: Prevents "Impossible Architecture" designs',
        'Con: Modern systems (PACELC) are more nuanced than just CAP',
        'Con: Choosing wrong leads to systemic data corruption or downtime'
      ],
      realWorld: 'Amazon DynamoDB chooses "Availability" (AP). This ensures that even if a data center is partially down, the "Add to Cart" button always works, prioritizing sales over 100% instant inventory accuracy.',
      tags: ['distributed', 'database', 'cap', 'scaling']
    },
    {
      id: 'microservices-vs-monolith',
      title: 'Microservices vs Monolith',
      category: 'cloud',
      level: 'intermediate',
      summary: 'Comparing architecture styles for team scaling and deployment agility.',
      detail: `**Monolith:** Single codebase, single deployment unit. Simple to develop and test, but hard to scale teams and technology.
      
      **Microservices:** Distributed system of small, independent services. Enables team autonomy and independent scaling, but introduces massive operational complexity (networking, observability).`,
      codeExamples: [
        {
          lang: 'yaml', label: 'Kubernetes (Microservice)', code: `apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: orders
  ports:
    - port: 80
      targetPort: 8080`
        }
      ],
      tradeoffs: [
        'Pro (MS): Team autonomy (Deploy independently)',
        'Pro (MS): Fault isolation (One service crash doesn\'t kill all)',
        'Con (MS): Data consistency across services is difficult',
        'Con (MS): High "Operational Tax" (Need K8s, CI/CD, Tracing)'
      ],
      realWorld: 'Amazon migrated from a massive C++ monolith to thousands of microservices in the early 2000s, enabling them to deploy code every 11 seconds.',
      tags: ['architecture', 'cloud', 'scaling', 'devops']
    },
    {
      id: 'cqrs-event-sourcing',
      title: 'CQRS & Event Sourcing',
      category: 'architecture',
      level: 'deep',
      summary: 'Separating read and write models for massive horizontal scale.',
      detail: `**CQRS:** Command Query Responsibility Segregation. Use DIFFERENT models for Updating data (Commands) and Reading data (Queries).
      
      **Event Sourcing:** Instead of storing the CURRENT state, store the ENTIRE HISTORY of changes (events). State is rebuilt by "replaying" events.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Command vs Query)', code: `// Command: Handles Logic
public class CreateOrderHandler : ICommandHandler<CreateOrder> {
    public void Handle(CreateOrder cmd) => _db.Events.Save(new OrderCreated(...));
}

// Query: Optimized for UI (Flat Data)
public class OrderListQuery : IQueryHandler<GetOrderList> {
    public List<OrderDto> Handle() => _readonlyDb.Orders.ToList();
}`
        }
      ],
      tradeoffs: [
        'Pro: High performance read models (Pre-computed views)',
        'Pro: Perfect audit log (ES stores every single action)',
        'Con: Eventually Consistent (Read model might lag)',
        'Con: "Brain-warping" complexity for many developers'
      ],
      realWorld: 'A Banking Ledger uses Event Sourcing. You don\'t just store the "Balance: $100", you store "+$50", "-$20", "+$70". If the balance is wrong, you can replay the history to find out why.',
      tags: ['architecture', 'patterns', 'cqrs', 'distributed']
    },
    {
      id: 'clean-hexagonal-architecture',
      title: 'Clean & Hexagonal Architecture',
      category: 'architecture',
      level: 'deep',
      summary: 'Protecting your business logic from external frameworks.',
      detail: `Also known as "Ports and Adapters". The core business logic (Domain) is in the center and has NO dependencies on databases, UI, or frameworks.
      
      **The Layers:**
      1. **Domain:** Pure logic, entities, interfaces.
      2. **Application:** Orchestration (Use Cases).
      3. **Infrastructure:** Implementation (SQL, AWS, SendGrid).
      4. **UI:** Web Controllers, CLI tools.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'Hexagonal Structure', code: `// 🔹 Core (Domain)
interface IUserRepository { save(user: User): void; }

// 🔹 Application (Use Case) - No dependency on SQL!
class CreateUserUseCase {
  constructor(private repo: IUserRepository) {}
  execute(data) { ... }
}

// 🔹 Infrastructure (Adapter)
class SqlUserRepository implements IUserRepository {
  save(user) { /* Knex/TypeORM logic here */ }
}`
        }
      ],
      tradeoffs: [
        'Pro: Technology Independence (Swap SQL for Mongo in 1 day)',
        'Pro: Testable without a database (Unit tests for core logic)',
        'Con: Lots of mapping code between layers',
        'Con: Overkill for small CRUD applications'
      ],
      realWorld: 'A fintech app used Hexagonal Architecture to switch from a legacy on-prem Oracle DB to AWS DynamoDB by only changing the "Infrastructure" layer, leaving the core banking logic untouched.',
      tags: ['architecture', 'patterns', 'solid', 'ddd']
    },
    {
      id: 'twelve-factor-app',
      title: 'The Twelve-Factor App',
      category: 'devops',
      level: 'deep',
      summary: 'The gold standard methodology for building SaaS applications.',
      detail: `Developed by Heroku engineers, these 12 factors ensure your app is optimized for modern cloud deployments (Cloud Native).
      
      **Core Factors:**
      - **III. Config:** Store config in the environment (not in code).
      - **VI. Processes:** App is stateless; share nothing via RAM.
      - **IX. Disposability:** Fast startup and graceful shutdown.
      - **XI. Logs:** Treat logs as event streams (stdout), not files on disk.`,
      codeExamples: [
        {
          lang: 'javascript', label: 'Factor III: Environment Config', code: `// ❌ WRONG
const dbPassword = "secret_password_123";

// ✅ CORRECT (Twelve-Factor compliant)
const dbPassword = process.env.DATABASE_URL;
// This allows the SAME code to run in Dev, Staging, and Prod.`
        }
      ],
      tradeoffs: [
        'Pro: Seamless horizontal scaling (statelessness)',
        'Pro: Portability across cloud vendors (AWS, GCP, Azure)',
        'Con: Requires externalizing state (Redis/DB) early on',
        'Con: Steeper initial setup than monoliths'
      ],
      realWorld: 'By following the Twelve-Factor "Statelessness" rule, a startup was able to scale from 1 to 50 server instances in 2 minutes during a TV appearance without a single user session dropping.',
      tags: ['devops', 'cloud-native', 'scaling', 'best-practices']
    },
    {
      id: 'micro-frontends',
      title: 'Micro-Frontends',
      category: 'architecture',
      level: 'intermediate',
      summary: 'Breaking down massive frontend monoliths into manageable pieces.',
      detail: `Micro-frontends bring the benefits of microservices to the browser. Different teams can build, test, and deploy their own part of the UI independently.
      
      **Common Patterns:**
      - **Module Federation (Webpack):** Dynamic loading of remotes at runtime.
      - **iFrames:** The oldest/simplest way (strong isolation, poor UX).
      - **Web Components:** Framework-agnostic encapsulation.`,
      codeExamples: [
        {
          lang: 'javascript', label: 'Webpack Module Federation', code: `// Container app configuration
new ModuleFederationPlugin({
  remotes: {
    checkout: "checkout@http://localhost:3001/remoteEntry.js",
    auth: "auth@http://localhost:3002/remoteEntry.js"
  }
});

// Usage in code
const CheckoutButton = React.lazy(() => import("checkout/Button"));`
        }
      ],
      tradeoffs: [
        'Pro: Teams can use different frameworks (React, Vue, Angular)',
        'Pro: Independent deployment cycles (no more massive QA bottlenecks)',
        'Con: Complex dev environment setup',
        'Con: Risk of "Payload Bloat" (loading React multiple times)'
      ],
      realWorld: 'Spotify and IKEA use Micro-frontends so that the "Search Team" can deploy updates 10 times a day without needing approval from the "Playlist Team".',
      tags: ['micro-frontends', 'webpack', 'frontend', 'scaling']
    },
    {
      id: 'rxjs-flattening-operators',
      title: 'RxJS Flattening Operators',
      category: 'frontend-internals',
      level: 'intermediate',
      summary: 'Making sense of SwitchMap, MergeMap, ConcatMap, and ExhaustMap.',
      detail: `When you have an Observable that returns another Observable (like an HTTP call inside a click), you need a flattening operator.
      
      **The Big Four:**
      - **mergeMap:** Fire and forget. All requests run in parallel.
      - **switchMap:** The "Search" operator. Cancels the previous request when a new one arrives.
      - **concatMap:** The "Queue" operator. Waits for current to finish before starting next.
      - **exhaustMap:** The "Ignore" operator. While one is running, ignore all new inputs.`,
      codeExamples: [
        {
          lang: 'typescript', label: 'TypeScript (Angular/RxJS)', code: `// switchMap for Search (prevents race conditions)
searchTerm$.pipe(
  switchMap(term => this.api.search(term))
).subscribe(results => ...);

// concatMap for Sequential Saves
saveClicks$.pipe(
  concatMap(data => this.api.save(data))
).subscribe();`
        }
      ],
      tradeoffs: [
        'switchMap: Best for read operations (GET)',
        'concatMap: Best for write operations (POST) that must be in order',
        'mergeMap: Best for independent tasks where order doesn\'t matter',
        'exhaustMap: Best for login/submit buttons (prevents double fire)'
      ],
      realWorld: 'Using switchMap for "Auto-complete" avoids showing results for the "old" search query if the network was slow.',
      tags: ['rxjs', 'reactive', 'angular', 'streams']
    },
    {
      id: 'dotnet-span-memory',
      title: 'High-Perf .NET: Span<T> & Memory<T>',
      category: 'dotnet',
      level: 'deep',
      summary: 'Heap-less string and buffer manipulation for ultra-low allocation.',
      detail: `Traditionally, slicing a string (\`substring\`) creates a NEW string on the Heap. In high-perf code, this causes constant GC pressure.
      
      **The Solution:**
      - **Span<T>:** A "ref struct" that provides a type-safe window into ANY memory (Stack, Heap, or Unmanaged).
      - **ReadOnlySpan<char>:** Allows parsing strings without copying them.
      - **Rule:** \`Span\` can ONLY live on the Stack (cannot be a class field). For async/heap usage, use \`Memory<T>\`.`,
      codeExamples: [
        {
          lang: 'csharp', label: 'C# (Zero Allocation Parsing)', code: `// Old way: creates new string
var sub = "Hello World".Substring(0, 5); 

// New way: Zero copies
ReadOnlySpan<char> span = "Hello World".AsSpan();
var slice = span.Slice(0, 5); 

// Parsing without allocation
int.TryParse(span.Slice(6, 4), out int year);`
        }
      ],
      tradeoffs: [
        'Pro: Significant reduction in GC pauses',
        'Pro: Works with array pools for buffer management',
        'Con: Ref structs (Span) have strict compiler limitations',
        'Con: Syntax is more verbose for simple tasks'
      ],
      realWorld: 'Kestrel (the ASP.NET Core web server) uses Span/Memory extensively to parse HTTP headers without allocating millions of tiny string objects per second.',
      tags: ['dotnet', 'performance', 'memory', 'internals']
    },
    {
      id: 'db-indexing-strategies',
      title: 'B-Tree vs LSM-Tree Indexes',
      category: 'database-internals',
      level: 'deep',
      summary: 'How different storage engines optimize for Reads vs Writes.',
      detail: `Database performance is determined by how data is structured on disk.
      
      **B-Tree (Balanced Tree):**
      - Used by: SQL Server, PostgreSQL, MySQL.
      - Optimizes: **Reads**.
      - Logic: Maintains a sorted tree structure. Updates require "in-place" modifications.
      
      **LSM-Tree (Log-Structured Merge-Tree):**
      - Used by: Cassandra, ScyllaDB, LevelDB.
      - Optimizes: **Writes**.
      - Logic: Appends data to a write-ahead log. Periodically merges (compacts) files in background. Great for high-velocity logs/sensor data.`,
      codeExamples: [
        {
          lang: 'sql', label: 'SQL (B-Tree Index)', code: `-- Standard clustered index
CREATE INDEX IX_Users_Email 
ON Users(Email) 
INCLUDE(DisplayName, LastLogin);`
        }
      ],
      tradeoffs: [
        'B-Tree: Better for range queries and predictable read latency',
        'LSM-Tree: Much higher write throughput, but read performance "jitters"',
        'LSM-Tree: Background compaction can cause "Write Amplification"',
        'B-Tree: Fragmented over time, requires maintenance (Rebuilt)'
      ],
      realWorld: 'Use PostgreSQL (B-Tree) for your "User Profiles" (mostly reads); use Cassandra (LSM) for your "User Activity Feed" (heavy writes).',
      tags: ['database', 'storage', 'performance', 'sql', 'nosql']
    }
  ];

  const grid = document.getElementById('knowledgeGrid');
  const detail = document.getElementById('knowledgeDetail');
  const search = document.getElementById('knowledgeSearch');
  const filters = document.getElementById('knowledgeFilters');
  let activeFilter = 'all';

  function render() {
    const q = search ? search.value.toLowerCase() : '';
    const filtered = entries.filter(e =>
      (activeFilter === 'all' || e.category === activeFilter) &&
      (e.title.toLowerCase().includes(q) || e.tags.some(t => t.includes(q)) || e.summary.toLowerCase().includes(q))
    );

    if (!grid) return;

    grid.innerHTML = filtered.map(e => `
      <div class="concept-card" data-id="${e.id}">
        <div class="concept-badge ${entryLevel(e.level)}">${e.level.toUpperCase()}</div>
        <div class="concept-title">${e.title}</div>
        <div class="concept-desc">${e.summary}</div>
        <div class="snippet-card-tags" style="margin-top: 10px;">
          ${e.tags.map(t => `<span class="snippet-tag">#${t}</span>`).join('')}
        </div>
      </div>
    `).join('') || '<p class="no-results">No concepts found matching your criteria.</p>';

    grid.querySelectorAll('.concept-card').forEach(card => {
      card.addEventListener('click', () => showDetail(card.dataset.id));
    });
  }

  function entryLevel(lvl) {
    if (lvl === 'deep') return 'badge-5xx';
    if (lvl === 'intermediate') return 'badge-2xx';
    return 'badge-1xx';
  }

  function showDetail(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    grid.style.display = 'none';
    detail.classList.add('active');

    detail.innerHTML = `
      <div class="concept-detail-back">
        <button class="btn btn-secondary" id="kbBack">← Back to Knowledge Base</button>
      </div>
      <div class="page-header">
        <div class="concept-badge ${entryLevel(entry.level)}" style="display:inline-block; margin-bottom:10px;">${entry.level.toUpperCase()}</div>
        <h1>${entry.title}</h1>
        <p>${entry.summary}</p>
      </div>
      
      <div class="concept-section">
        <h3>Depth Analysis</h3>
        <p style="white-space:pre-line">${entry.detail}</p>
      </div>

      <div class="concept-section">
        <h3>Code Implementation</h3>
        <div class="code-tabs">
          ${entry.codeExamples.map((ex, i) => `
            <button class="tab-btn ${i === 0 ? 'active' : ''}" data-lang="${ex.lang}">${ex.label}</button>
          `).join('')}
        </div>
        <div class="code-container">
          ${entry.codeExamples.map((ex, i) => `
            <pre class="code-block ${i === 0 ? 'active' : ''}" id="code-${ex.lang}"><code>${escHtml(ex.code)}</code></pre>
          `).join('')}
        </div>
      </div>

      <div class="concept-section">
        <h3>Trade-offs & Real World</h3>
        <div class="tradeoffs-grid">
          <div class="tradeoffs-card">
            <h4>Trade-offs</h4>
            <ul>${entry.tradeoffs.map(t => `<li>${t}</li>`).join('')}</ul>
          </div>
          <div class="real-world-box">
            <h4>Real World Context</h4>
            <p>${entry.realWorld}</p>
          </div>
        </div>
      </div>
    `;

    const backBtn = document.getElementById('kbBack');
    if (backBtn) {
      backBtn.onclick = () => {
        grid.style.display = '';
        detail.classList.remove('active');
        detail.innerHTML = '';
      };
    }

    detail.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        detail.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        detail.querySelectorAll('.code-block').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const codeEl = document.getElementById(`code-${btn.dataset.lang}`);
        if (codeEl) codeEl.classList.add('active');
      };
    });
  }

  if (search) search.addEventListener('input', debounce(render, 250));
  if (filters) filters.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.dataset.filter;
      render();
    }
  });

  render();
}

// === UUID / PASSWORD GENERATOR ===
function initUuidPassword() {
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  document.getElementById('uuidGen').addEventListener('click', () => {
    document.getElementById('uuidValue').textContent = uuidv4();
  });
  document.getElementById('uuidCopy').addEventListener('click', () => {
    copyText(document.getElementById('uuidValue').textContent);
  });

  function genPass() {
    const len = parseInt(document.getElementById('passLen').value);
    let chars = '';
    if (document.getElementById('passUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (document.getElementById('passLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (document.getElementById('passDigits').checked) chars += '0123456789';
    if (document.getElementById('passSymbols').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) { toast('Select at least one option'); return; }
    let pass = '';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) pass += chars[arr[i] % chars.length];
    document.getElementById('passValue').textContent = pass;
  }

  document.getElementById('passGen').addEventListener('click', genPass);
  document.getElementById('passLen').addEventListener('input', e => {
    document.getElementById('passLenVal').textContent = e.target.value;
  });
  document.getElementById('passCopy').addEventListener('click', () => {
    copyText(document.getElementById('passValue').textContent);
  });

  // Generate defaults on load
  document.getElementById('uuidValue').textContent = uuidv4();
  genPass();
}

// === TIMESTAMP CONVERTER ===
function initTimestamp() {
  function updateNow() {
    const now = new Date();
    document.getElementById('tsNowUnix').textContent = Math.floor(now.getTime() / 1000);
    document.getElementById('tsNowIso').textContent = now.toISOString();
  }
  updateNow();
  setInterval(updateNow, 1000);

  document.getElementById('tsFromUnix').addEventListener('click', () => {
    const val = document.getElementById('tsUnixInput').value.trim();
    if (!val) return;
    const ts = parseInt(val);
    const date = new Date(val.length <= 10 ? ts * 1000 : ts);
    const rel = relativeTime(Math.floor(date.getTime() / 1000));
    document.getElementById('tsUnixResult').textContent = date.toString() + '\nISO: ' + date.toISOString() + '\nRelative: ' + rel;
  });

  document.getElementById('tsFromDate').addEventListener('click', () => {
    const val = document.getElementById('tsDateInput').value;
    if (!val) return;
    const date = new Date(val);
    const rel = relativeTime(Math.floor(date.getTime() / 1000));
    document.getElementById('tsDateResult').textContent = 'Unix: ' + Math.floor(date.getTime() / 1000) + '\nISO: ' + date.toISOString() + '\nRelative: ' + rel;
  });
}

function relativeTime(unixSeconds) {
  const delta = Math.floor(Date.now() / 1000) - unixSeconds;
  const absDelta = Math.abs(delta);
  const suffix = delta > 0 ? ' ago' : ' from now';
  if (absDelta < 60) return 'just now';
  if (absDelta < 3600) return Math.floor(absDelta / 60) + ' minutes' + suffix;
  if (absDelta < 86400) return Math.floor(absDelta / 3600) + ' hours' + suffix;
  if (absDelta < 2592000) return Math.floor(absDelta / 86400) + ' days' + suffix;
  if (absDelta < 31536000) return Math.floor(absDelta / 2592000) + ' months' + suffix;
  return Math.floor(absDelta / 31536000) + ' years' + suffix;
}

function renderSettingsData() {
  document.getElementById('size-snippets').textContent = `Size: ${formatSize(lsCategorySize('snippets'))}`;
  document.getElementById('size-llm').textContent = `Size: ${formatSize(lsCategorySize('llm'))}`;
  document.getElementById('size-workflows').textContent = `Size: ${formatSize(lsCategorySize('workflows'))}`;
  document.getElementById('size-prefs').textContent = `Size: ${formatSize(lsCategorySize('prefs'))}`;
}

function initSettings() {
  const dropZone = document.getElementById('importDropZone');
  const fileInput = document.getElementById('importFileInput');

  // Trigger file input on click
  dropZone?.addEventListener('click', () => fileInput.click());

  // Handle Drag Events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone?.addEventListener(eventName, () => dropZone.classList.add('dragover'));
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone?.addEventListener(eventName, () => dropZone.classList.remove('dragover'));
  });

  // Handle Drop
  dropZone?.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleImportFile(file);
  });

  // Handle Manual Selection
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleImportFile(file);
  });

  function handleImportFile(file) {
    if (!file || file.type !== 'application/json' && !file.name.endsWith('.json')) {
      showToast('Please upload a valid .json backup file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        confirmImport(data);
      } catch (err) {
        showToast('Failed to parse JSON backup', 'error');
      }
    };
    reader.readAsText(file);
  }

  function confirmImport(data) {
    showModal({
      title: '📥 Confirm Data Import',
      body: `You are about to import a backup. This will merge with or overwrite your current settings and snippets. Continue?`,
      buttons: [
        { label: 'Cancel', class: 'btn-secondary' },
        {
          label: 'Start Import', class: 'btn-primary', onClick: () => {
            Object.keys(data).forEach(key => {
              if (data[key] !== null) localStorage.setItem(key, data[key]);
            });
            showToast('Data imported successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
          }
        }
      ]
    });
  }

  document.getElementById('nukeAllData').addEventListener('click', () => {
    showModal({
      title: '☢️ Critical Action',
      body: 'Are you absolutely sure? This will delete all your snippets, LLM settings, and preferences. This cannot be undone.',
      buttons: [
        { label: 'Cancel', class: 'btn-secondary' },
        {
          label: 'YES, NUKE EVERYTHING', class: 'btn-danger', onClick: () => {
            localStorage.clear();
            location.reload();
          }
        }
      ]
    });
  });

  document.getElementById('exportAllData').addEventListener('click', () => {
    const allKeys = Object.keys(localStorage);
    exportData(allKeys, `devops-toolkit-full-backup-${new Date().toISOString().slice(0, 10)}.json`);
    showToast('All app data exported', 'success');
  });
}

function renderSettingsData() {
  const container = document.getElementById('lsDataList');
  if (!container) return;

  const categories = [
    { label: 'Snippets', key: 'devtool_snippets', icon: '📝' },
    { label: 'Script Snippets (New)', key: 'devops_snippets', icon: '📝' },
    { label: 'LLM Settings', key: 'devtool_llm', icon: '🤖' },
    { label: 'Workflows', key: 'devtool_workflows', icon: '🧠' },
    { label: 'UI Preferences', key: 'ui_theme', icon: '🎨' }
  ];

  container.innerHTML = categories.map(cat => {
    const size = lsSize(cat.key);
    return `
      <div class="command-item" style="padding: 12px 16px;">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
          <span style="font-size: 1.2rem;">${cat.icon}</span>
          <div>
            <div style="font-weight: 600; font-size: 0.9rem;">${cat.label}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${formatSize(size)}</div>
          </div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="clearDataCategory('${cat.key}')" style="padding: 4px 10px; font-size: 0.75rem;">Clear</button>
      </div>
    `;
  }).join('');
}

window.clearDataCategory = (key) => {
  localStorage.removeItem(key);
  showToast('Data category cleared', 'info');
  renderSettingsData();
};

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 1. GLOBAL SEARCH (Ctrl/Cmd + K)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Find the search input in the ACTIVE page
      const activeSection = document.querySelector('.page-section.active');
      const searchInput = activeSection?.querySelector('input[type="text"]');
      if (searchInput) {
        searchInput.focus();
        showToast('Search Focused', 'info', 1000);
      } else {
        // Fallback to Command Library if no search on current page
        navigateTo('commands');
        setTimeout(() => document.getElementById('cmdSearch')?.focus(), 100);
      }
    }

    // 2. QUICK NAVIGATION (Alt + 1-8)
    if (e.altKey && e.key >= '1' && e.key <= '8') {
      const navItems = document.querySelectorAll('.nav-item');
      const index = parseInt(e.key) - 1;
      if (navItems[index]) {
        navigateTo(navItems[index].dataset.page);
        showToast(`Switched to ${navItems[index].innerText.trim()}`, 'info', 1000);
      }
    }

    // 3. ESCAPE (Close Modals/Details)
    if (e.key === 'Escape') {
      // Close Modals
      const modal = document.getElementById('modal-overlay');
      if (modal?.classList.contains('open')) {
        modal.classList.remove('open');
        return;
      }

      // Return from Knowledge Base Detail
      const kbDetail = document.getElementById('knowledgeDetail');
      const kbGrid = document.getElementById('knowledgeGrid');
      if (kbDetail?.classList.contains('active')) {
        kbDetail.classList.remove('active');
        if (kbGrid) kbGrid.style.display = 'grid';
        return;
      }

      // Return from Architecture Detail
      const archDetail = document.getElementById('arch-detail');
      const archGrid = document.getElementById('arch-grid');
      if (archDetail?.style.display === 'block') {
        archDetail.style.display = 'none';
        if (archGrid) archGrid.style.display = 'grid';
        return;
      }
    }

    // 4. HELP MENU (Shift + ?)
    if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      showShortcutsHelp();
    }
  });

  function showShortcutsHelp() {
    const modal = document.getElementById('modal-overlay');
    const box = document.getElementById('modalBox');

    box.innerHTML = `
      <div class="modal-header">
        <span class="modal-title">⌨️ Keyboard Shortcuts</span>
        <button class="modal-close" id="closeShortcuts">&times;</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
        <div class="shortcut-group">
          <small style="color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Global</small>
          <div style="display:flex; justify-content:space-between; margin-top:10px;">
            <span>Focus Search</span>
            <kbd style="color:var(--accent-cyan); background:rgba(6,214,242,0.1); padding:2px 6px; border-radius:4px; font-size:0.8rem;">Ctrl + K</kbd>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:10px;">
            <span>Help Menu</span>
            <kbd style="color:var(--accent-cyan); background:rgba(6,214,242,0.1); padding:2px 6px; border-radius:4px; font-size:0.8rem;">?</kbd>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:10px;">
            <span>Go Back / Close</span>
            <kbd style="color:var(--accent-cyan); background:rgba(6,214,242,0.1); padding:2px 6px; border-radius:4px; font-size:0.8rem;">Esc</kbd>
          </div>
        </div>
        <div class="shortcut-group">
          <small style="color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Navigation</small>
          <div style="display:flex; justify-content:space-between; margin-top:10px;">
            <span>Quick Tabs</span>
            <kbd style="color:var(--accent-cyan); background:rgba(6,214,242,0.1); padding:2px 6px; border-radius:4px; font-size:0.8rem;">Alt + 1-8</kbd>
          </div>
        </div>
      </div>
      <div style="margin-top:20px; text-align:right;">
        <button class="btn btn-secondary" id="gotItShortcuts">Got it</button>
      </div>
    `;

    const close = () => modal.classList.remove('open');
    document.getElementById('closeShortcuts').onclick = close;
    document.getElementById('gotItShortcuts').onclick = close;
    modal.classList.add('open');
  }
}
