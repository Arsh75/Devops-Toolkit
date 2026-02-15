// ============================================
// DevOps Toolkit Dashboard â€” Application Logic
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
  initUuidPassword();
  initTimestamp();
});

// === HELPERS ===
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard!'));
}

// === NAVIGATION ===
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.page-section');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('mobileToggle');

  function navigate(page) {
    navItems.forEach(n => n.classList.toggle('active', n.dataset.page === page));
    sections.forEach(s => s.classList.toggle('active', s.id === 'page-' + page));
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }

  navItems.forEach(n => n.addEventListener('click', () => navigate(n.dataset.page)));
  document.querySelectorAll('.quick-card[data-goto]').forEach(c =>
    c.addEventListener('click', () => navigate(c.dataset.goto))
  );
  toggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
  overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });
}

// === CLOCK ===
function initClock() {
  function update() {
    const now = new Date();
    const h = now.getHours();
    const greeting = h < 12 ? 'Good Morning â˜€ï¸' : h < 17 ? 'Good Afternoon ðŸŒ¤ï¸' : 'Good Evening ðŸŒ™';
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
    { cmd: 'docker ps -a', desc: 'List all containers', tag: 'docker' },
    { cmd: 'docker build -t name .', desc: 'Build image from Dockerfile', tag: 'docker' },
    { cmd: 'docker-compose up -d', desc: 'Start services in background', tag: 'docker' },
    { cmd: 'docker logs -f container', desc: 'Follow container logs', tag: 'docker' },
    { cmd: 'docker exec -it container bash', desc: 'Shell into running container', tag: 'docker' },
    { cmd: 'docker system prune -a', desc: 'Remove all unused resources', tag: 'docker' },
    { cmd: 'docker network ls', desc: 'List all networks', tag: 'docker' },
    { cmd: 'docker volume ls', desc: 'List all volumes', tag: 'docker' },
    { cmd: 'docker inspect container', desc: 'Inspect container details', tag: 'docker' },
    { cmd: 'docker stats', desc: 'Live resource usage stats', tag: 'docker' },
    { cmd: 'kubectl get pods -A', desc: 'List all pods in all namespaces', tag: 'kubernetes' },
    { cmd: 'kubectl describe pod name', desc: 'Describe a pod in detail', tag: 'kubernetes' },
    { cmd: 'kubectl logs pod -f', desc: 'Stream pod logs', tag: 'kubernetes' },
    { cmd: 'kubectl apply -f file.yaml', desc: 'Apply a configuration', tag: 'kubernetes' },
    { cmd: 'kubectl get svc', desc: 'List services', tag: 'kubernetes' },
    { cmd: 'kubectl rollout restart deploy/name', desc: 'Restart a deployment', tag: 'kubernetes' },
    { cmd: 'kubectl scale deploy/name --replicas=3', desc: 'Scale deployment replicas', tag: 'kubernetes' },
    { cmd: 'kubectl port-forward svc/name 8080:80', desc: 'Port forward to service', tag: 'kubernetes' },
    { cmd: 'kubectl top pods', desc: 'Resource usage per pod', tag: 'kubernetes' },
    { cmd: 'kubectl config get-contexts', desc: 'List kube contexts', tag: 'kubernetes' },
    { cmd: 'git log --oneline -20', desc: 'Show last 20 commits', tag: 'git' },
    { cmd: 'git stash && git stash pop', desc: 'Stash and restore changes', tag: 'git' },
    { cmd: 'git rebase -i HEAD~3', desc: 'Interactive rebase last 3', tag: 'git' },
    { cmd: 'git cherry-pick <hash>', desc: 'Apply a specific commit', tag: 'git' },
    { cmd: 'git diff --staged', desc: 'Show staged changes', tag: 'git' },
    { cmd: 'git remote -v', desc: 'List remote URLs', tag: 'git' },
    { cmd: 'git bisect start', desc: 'Binary search for bad commit', tag: 'git' },
    { cmd: 'git reflog', desc: 'Show reference log history', tag: 'git' },
    { cmd: 'git tag -a v1.0 -m "msg"', desc: 'Create annotated tag', tag: 'git' },
    { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit, keep changes', tag: 'git' },
    { cmd: 'top -o %MEM', desc: 'Sort processes by memory', tag: 'linux' },
    { cmd: 'df -h', desc: 'Disk usage human readable', tag: 'linux' },
    { cmd: 'find / -name "*.log" -mtime +7 -delete', desc: 'Delete logs older than 7 days', tag: 'linux' },
    { cmd: 'ss -tulnp', desc: 'Show listening ports', tag: 'linux' },
    { cmd: 'journalctl -u service -f', desc: 'Follow systemd service logs', tag: 'linux' },
    { cmd: 'chmod 755 file', desc: 'Set file permissions', tag: 'linux' },
    { cmd: 'tar -czf archive.tar.gz dir/', desc: 'Compress directory', tag: 'linux' },
    { cmd: 'curl -s ifconfig.me', desc: 'Get public IP address', tag: 'linux' },
    { cmd: 'htop', desc: 'Interactive process viewer', tag: 'linux' },
    { cmd: 'lsof -i :8080', desc: 'Find process using port 8080', tag: 'linux' },
    { cmd: 'nginx -t', desc: 'Test nginx configuration', tag: 'nginx' },
    { cmd: 'nginx -s reload', desc: 'Reload nginx config', tag: 'nginx' },
    { cmd: 'tail -f /var/log/nginx/error.log', desc: 'Follow nginx error log', tag: 'nginx' },
    { cmd: 'certbot --nginx -d domain.com', desc: 'Generate SSL with certbot', tag: 'nginx' },
    { cmd: 'nginx -V', desc: 'Show compiled modules', tag: 'nginx' },
  ];

  const list = document.getElementById('commandList');
  const search = document.getElementById('cmdSearch');
  const filters = document.getElementById('cmdFilters');
  let activeFilter = 'all';

  function render() {
    const q = search.value.toLowerCase();
    const filtered = commands.filter(c =>
      (activeFilter === 'all' || c.tag === activeFilter) &&
      (c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
    );
    list.innerHTML = filtered.map(c => `
      <div class="command-item">
        <div class="cmd-info">
          <div class="cmd-label">${c.desc}</div>
          <code class="cmd-code">${c.cmd}</code>
        </div>
        <span class="cmd-tag tag-${c.tag}">${c.tag}</span>
        <button class="btn btn-copy" onclick="copyText('${c.cmd.replace(/'/g, "\\'")}')">Copy</button>
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
    try { JSON.parse(inp.value); out.value = 'âœ… Valid JSON!'; out.className = 'tool-textarea output'; } catch (e) { out.value = 'âŒ Invalid: ' + e.message; out.className = 'tool-textarea error-output'; }
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
      const obj = simpleYamlParse(inp.value);
      out.value = JSON.stringify(obj, null, 2);
      out.className = 'tool-textarea output';
    } catch (e) { out.value = 'Error: ' + e.message; out.className = 'tool-textarea error-output'; }
  });
  document.getElementById('jsonCopyOutput').addEventListener('click', () => copyText(out.value));
}

function jsonToYaml(obj, indent) {
  const pad = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) return obj.map(v => pad + '- ' + (typeof v === 'object' ? '\n' + jsonToYaml(v, indent + 1) : v)).join('\n');
  return Object.entries(obj).map(([k, v]) => {
    if (typeof v === 'object' && v !== null) return pad + k + ':\n' + jsonToYaml(v, indent + 1);
    return pad + k + ': ' + (v === null ? 'null' : v);
  }).join('\n');
}

function simpleYamlParse(yaml) {
  const result = {};
  yaml.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).forEach(line => {
    const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
    if (match) {
      const [, , key, val] = match;
      result[key.trim()] = val.trim() === '' ? {} : isNaN(val.trim()) ? val.trim() : Number(val.trim());
    }
  });
  return result;
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
    } catch (e) { out.value = 'Error: ' + e.message; }
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
    } catch (e) { output.textContent = 'Invalid regex: ' + e.message; count.textContent = 'Error'; }
  }

  [pattern, flags, input].forEach(el => el.addEventListener('input', test));
}

// === SCRIPT SNIPPETS ===
function initSnippets() {
  let snippets = JSON.parse(localStorage.getItem('devtool_snippets') || '[]');
  const grid = document.getElementById('snippetGrid');
  const search = document.getElementById('snippetSearch');

  function save() { localStorage.setItem('devtool_snippets', JSON.stringify(snippets)); }

  function render() {
    const q = search.value.toLowerCase();
    const filtered = snippets.filter(s => s.title.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)) || s.code.toLowerCase().includes(q));
    grid.innerHTML = filtered.map((s, i) => `
      <div class="snippet-card">
        <div class="snippet-card-header">
          <span class="snippet-card-title">${s.title}</span>
          <div class="snippet-card-tags">${s.tags.map(t => `<span class="snippet-tag">${t}</span>`).join('')}</div>
        </div>
        <div class="snippet-card-code">${escHtml(s.code)}</div>
        <div class="snippet-card-actions">
          <button class="btn btn-copy" onclick="copyText(devSnippets[${i}].code)">Copy</button>
          <button class="btn btn-danger" onclick="deleteSnippet(${i})">Delete</button>
        </div>
      </div>
    `).join('') || '<p style="color:var(--text-muted);padding:20px;">No snippets yet. Add one above!</p>';
  }

  window.devSnippets = snippets;
  window.deleteSnippet = (i) => { snippets.splice(i, 1); window.devSnippets = snippets; save(); render(); };

  document.getElementById('snippetSave').addEventListener('click', () => {
    const title = document.getElementById('snippetTitle').value.trim();
    const tags = document.getElementById('snippetTags').value.split(',').map(t => t.trim()).filter(Boolean);
    const code = document.getElementById('snippetCode').value;
    if (!title || !code) { toast('Please enter title and code'); return; }
    snippets.unshift({ title, tags, code });
    window.devSnippets = snippets;
    save(); render();
    document.getElementById('snippetTitle').value = '';
    document.getElementById('snippetTags').value = '';
    document.getElementById('snippetCode').value = '';
    toast('Snippet saved!');
  });

  search.addEventListener('input', render);
  render();
}

function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// === HTTP STATUS CODES ===
function initHttpCodes() {
  const codes = [
    [100, 'Continue', 'Client should continue request'], [101, 'Switching Protocols', 'Server switching protocols'],
    [200, 'OK', 'Request succeeded'], [201, 'Created', 'Resource created'], [202, 'Accepted', 'Request accepted for processing'],
    [204, 'No Content', 'Success with no body'], [206, 'Partial Content', 'Partial resource returned'],
    [301, 'Moved Permanently', 'Resource moved permanently'], [302, 'Found', 'Temporary redirect'],
    [304, 'Not Modified', 'Resource not modified'], [307, 'Temporary Redirect', 'Temporary redirect preserving method'],
    [308, 'Permanent Redirect', 'Permanent redirect preserving method'],
    [400, 'Bad Request', 'Malformed request'], [401, 'Unauthorized', 'Authentication required'],
    [403, 'Forbidden', 'Access denied'], [404, 'Not Found', 'Resource not found'],
    [405, 'Method Not Allowed', 'HTTP method not allowed'], [408, 'Request Timeout', 'Request timed out'],
    [409, 'Conflict', 'Conflict with current state'], [410, 'Gone', 'Resource permanently removed'],
    [413, 'Payload Too Large', 'Request body too large'], [415, 'Unsupported Media Type', 'Media type not supported'],
    [422, 'Unprocessable Entity', 'Validation failed'], [429, 'Too Many Requests', 'Rate limit exceeded'],
    [500, 'Internal Server Error', 'Server error'], [502, 'Bad Gateway', 'Invalid upstream response'],
    [503, 'Service Unavailable', 'Server overloaded/maintenance'], [504, 'Gateway Timeout', 'Upstream timeout'],
  ];

  const grid = document.getElementById('httpGrid');
  const search = document.getElementById('httpSearch');
  const filters = document.getElementById('httpFilters');
  let activeFilter = 'all';

  function render() {
    const q = search.value.toLowerCase();
    const filtered = codes.filter(([code, name, desc]) => {
      const cat = Math.floor(code / 100) + 'xx';
      return (activeFilter === 'all' || cat === activeFilter) &&
        (String(code).includes(q) || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q));
    });
    grid.innerHTML = filtered.map(([code, name, desc]) => {
      const cat = 'c' + Math.floor(code / 100) + 'xx';
      return `<div class="http-item"><span class="http-code ${cat}">${code}</span><div><div class="http-name">${name}</div><div class="http-desc">${desc}</div></div></div>`;
    }).join('');
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
        <div class="prompt-card-actions"><button class="btn btn-copy">ðŸ“‹ Copy Prompt</button></div>
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
  let nodeId = 0;
  let dragState = null;

  const nodeDefaults = {
    trigger: { label: 'New Trigger', color: 'trigger' },
    llm: { label: 'LLM Call', color: 'llm' },
    tool: { label: 'Tool Action', color: 'tool' },
    condition: { label: 'Condition', color: 'condition' },
    output: { label: 'Output', color: 'output' },
  };

  function addNode(type) {
    const def = nodeDefaults[type];
    const node = { id: nodeId++, type, label: def.label, x: 40 + Math.random() * 300, y: 40 + Math.random() * 200 };
    nodes.push(node);
    renderNodes();
  }

  function renderNodes() {
    canvas.querySelectorAll('.workflow-node').forEach(n => n.remove());
    nodes.forEach(node => {
      const el = document.createElement('div');
      el.className = 'workflow-node';
      el.style.left = node.x + 'px';
      el.style.top = node.y + 'px';
      el.dataset.id = node.id;
      el.innerHTML = `<div class="workflow-node-type ${node.type}">${node.type.toUpperCase()}</div>
        <div class="workflow-node-label" contenteditable="true">${node.label}</div>
        <div class="delete-node" onclick="event.stopPropagation();removeWfNode(${node.id})">âœ•</div>`;
      el.addEventListener('mousedown', startDrag);
      el.querySelector('.workflow-node-label').addEventListener('blur', e => {
        const n = nodes.find(n => n.id === node.id);
        if (n) n.label = e.target.textContent;
      });
      canvas.appendChild(el);
    });
    drawConnections();
  }

  function drawConnections() {
    svg.innerHTML = '';
    for (let i = 1; i < nodes.length; i++) {
      const from = nodes[i - 1], to = nodes[i];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', from.x + 80); line.setAttribute('y1', from.y + 30);
      line.setAttribute('x2', to.x + 80); line.setAttribute('y2', to.y + 30);
      line.setAttribute('stroke', 'rgba(99,130,255,0.3)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '6,4');
      svg.appendChild(line);
    }
  }

  function startDrag(e) {
    if (e.target.contentEditable === 'true') return;
    const el = e.currentTarget;
    const id = parseInt(el.dataset.id);
    const rect = canvas.getBoundingClientRect();
    dragState = { el, id, offX: e.clientX - el.offsetLeft, offY: e.clientY - el.offsetTop };
    el.classList.add('dragging');

    function onMove(e2) {
      const x = e2.clientX - dragState.offX;
      const y = e2.clientY - dragState.offY;
      dragState.el.style.left = x + 'px';
      dragState.el.style.top = y + 'px';
      const node = nodes.find(n => n.id === id);
      if (node) { node.x = x; node.y = y; }
      drawConnections();
    }
    function onUp() {
      dragState.el.classList.remove('dragging');
      dragState = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  window.removeWfNode = (id) => { nodes = nodes.filter(n => n.id !== id); renderNodes(); };

  document.querySelectorAll('[data-wf-add]').forEach(btn =>
    btn.addEventListener('click', () => addNode(btn.dataset.wfAdd))
  );
  document.getElementById('wfClear').addEventListener('click', () => { nodes = []; nodeId = 0; renderNodes(); });
  document.getElementById('wfExport').addEventListener('click', () => {
    const json = JSON.stringify({ nodes: nodes.map(n => ({ type: n.type, label: n.label })) }, null, 2);
    copyText(json);
    toast('Workflow JSON copied!');
  });
}

// === LLM PLAYGROUND ===
function initPlayground() {
  const saved = JSON.parse(localStorage.getItem('devtool_llm') || '{}');
  if (saved.provider) document.getElementById('llmProvider').value = saved.provider;
  if (saved.model) document.getElementById('llmModel').value = saved.model;
  if (saved.apiKey) document.getElementById('llmApiKey').value = saved.apiKey;
  if (saved.baseUrl) document.getElementById('llmBaseUrl').value = saved.baseUrl;
  if (saved.temp) { document.getElementById('llmTemp').value = saved.temp; document.getElementById('tempVal').textContent = saved.temp; }
  if (saved.system) document.getElementById('llmSystem').value = saved.system;

  document.getElementById('llmTemp').addEventListener('input', e => document.getElementById('tempVal').textContent = e.target.value);
  document.getElementById('llmSaveSettings').addEventListener('click', () => {
    localStorage.setItem('devtool_llm', JSON.stringify({
      provider: document.getElementById('llmProvider').value,
      model: document.getElementById('llmModel').value,
      apiKey: document.getElementById('llmApiKey').value,
      baseUrl: document.getElementById('llmBaseUrl').value,
      temp: document.getElementById('llmTemp').value,
      system: document.getElementById('llmSystem').value,
    }));
    toast('Settings saved!');
  });

  const msgs = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');

  function addMsg(role, text) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  async function sendToLLM(prompt) {
    const provider = document.getElementById('llmProvider').value;
    const model = document.getElementById('llmModel').value;
    const apiKey = document.getElementById('llmApiKey').value;
    const baseUrl = document.getElementById('llmBaseUrl').value;
    const temp = parseFloat(document.getElementById('llmTemp').value);
    const system = document.getElementById('llmSystem').value;

    if (!apiKey && provider !== 'ollama') { addMsg('assistant', 'âš ï¸ Please set your API key in settings.'); return; }

    addMsg('assistant', 'â³ Thinking...');

    try {
      let url, headers, body;
      if (provider === 'openai') {
        url = (baseUrl || 'https://api.openai.com/v1') + '/chat/completions';
        headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey };
        body = JSON.stringify({ model, temperature: temp, messages: [{ role: 'system', content: system || 'You are a helpful assistant.' }, { role: 'user', content: prompt }] });
      } else if (provider === 'gemini') {
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: temp } });
      } else {
        url = (baseUrl || 'http://localhost:11434') + '/api/generate';
        headers = { 'Content-Type': 'application/json' };
        body = JSON.stringify({ model, prompt, stream: false });
      }

      const resp = await fetch(url, { method: 'POST', headers, body });
      const data = await resp.json();

      msgs.removeChild(msgs.lastChild); // remove "Thinking..."

      let answer = '';
      if (provider === 'openai') answer = data.choices?.[0]?.message?.content || JSON.stringify(data);
      else if (provider === 'gemini') answer = data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
      else answer = data.response || JSON.stringify(data);

      addMsg('assistant', answer);
    } catch (e) {
      msgs.removeChild(msgs.lastChild);
      addMsg('assistant', 'âŒ Error: ' + e.message);
    }
  }

  document.getElementById('chatSend').addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (!text) return;
    addMsg('user', text);
    chatInput.value = '';
    sendToLLM(text);
  });
  chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('chatSend').click(); });
}

// === CODING CONCEPTS ===
function initCodingConcepts() {
  const concepts = [
    {
      icon: 'ðŸ“Š', title: 'Data Structures', desc: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Hash Maps â€” with real-world use cases',
      sections: [
        { h: 'Arrays', text: 'ðŸ”¹ What: Contiguous memory block storing elements of the same type. O(1) random access by index.\n\nðŸŒ Real-World Example â€” Spotify Playlist:\nWhen you create a playlist, songs are stored in an array-like structure. You can jump to song #5 instantly (O(1) access), but inserting a song in the middle shifts everything after it (O(n)).\n\nðŸ¢ Use Cases:\nâ€¢ Storing pixel data in images (2D arrays)\nâ€¢ Database query results (rows of data)\nâ€¢ Time-series metrics (CPU usage every second)\nâ€¢ Browser history (ordered list of URLs)', code: '// Real-world: E-commerce Cart\nconst cart = ["Laptop", "Mouse", "Keyboard"];\ncart.push("Monitor");       // Add to end: O(1)\ncart.splice(1, 0, "USB-C"); // Insert at index 1: O(n)\ncart.indexOf("Mouse");      // Search: O(n)\n\n// When to use Arrays vs other structures:\n// âœ… Need fast access by index\n// âœ… Data size is known/stable\n// âŒ Frequent insertions/deletions in middle' },
        { h: 'Hash Maps', text: 'ðŸ”¹ What: Key-value pairs with O(1) average lookup using a hash function.\n\nðŸŒ Real-World Example â€” DNS Resolution:\nWhen you type "google.com", a DNS cache (hash map) instantly maps it to IP 142.250.80.46 without scanning all entries.\n\nðŸ¢ Use Cases:\nâ€¢ Caching API responses (Redis stores key-value pairs)\nâ€¢ Session management (sessionID â†’ user data)\nâ€¢ Counting word frequencies in log analysis\nâ€¢ De-duplicating records in data pipelines\nâ€¢ Database indexing (B-tree indexes work similarly)', code: '// Real-world: API Rate Limiter\nconst rateLimiter = new Map();\n\nfunction checkRateLimit(userId) {\n  const now = Date.now();\n  const userData = rateLimiter.get(userId);\n  \n  if (!userData) {\n    rateLimiter.set(userId, { count: 1, resetAt: now + 60000 });\n    return true; // allowed\n  }\n  \n  if (now > userData.resetAt) {\n    userData.count = 1;\n    userData.resetAt = now + 60000;\n    return true;\n  }\n  \n  if (userData.count >= 100) return false; // rate limited!\n  userData.count++;\n  return true;\n}' },
        { h: 'Stacks & Queues', text: 'ðŸ”¹ Stack (LIFO): Last In, First Out â€” like a stack of plates.\nðŸ”¹ Queue (FIFO): First In, First Out â€” like a line at a store.\n\nðŸŒ Real-World Examples:\nâ€¢ Stack â†’ Browser Back Button: Each page you visit is pushed onto a stack. Clicking "back" pops the last page.\nâ€¢ Stack â†’ Undo/Redo in VS Code: Every edit is pushed to an undo stack.\nâ€¢ Queue â†’ Print Queue: Documents print in the order they were submitted.\nâ€¢ Queue â†’ Kubernetes Pod Scheduling: Pods wait in a queue for available nodes.\n\nðŸ¢ Use Cases:\nâ€¢ Function call stack (recursion)\nâ€¢ Expression parsing (parentheses matching)\nâ€¢ BFS traversal (queue)\nâ€¢ Message queues (RabbitMQ, SQS)', code: '// Real-world: Undo/Redo System\nclass UndoRedo {\n  constructor() {\n    this.undoStack = [];\n    this.redoStack = [];\n  }\n  \n  execute(action) {\n    action.do();\n    this.undoStack.push(action);\n    this.redoStack = []; // clear redo\n  }\n  \n  undo() {\n    const action = this.undoStack.pop();\n    if (action) {\n      action.undo();\n      this.redoStack.push(action);\n    }\n  }\n  \n  redo() {\n    const action = this.redoStack.pop();\n    if (action) {\n      action.do();\n      this.undoStack.push(action);\n    }\n  }\n}' },
        { h: 'Trees & Graphs', text: 'ðŸ”¹ Trees: Hierarchical data with parent-child relationships. Each node has 0+ children.\nðŸ”¹ Graphs: Nodes connected by edges (can be cyclic, directed/undirected).\n\nðŸŒ Real-World Examples:\nâ€¢ Tree â†’ File System: Folders contain subfolders and files (tree structure).\nâ€¢ Tree â†’ DOM: HTML elements form a tree that browsers parse and render.\nâ€¢ Tree â†’ Organization Chart: CEO â†’ VPs â†’ Directors â†’ Managers.\nâ€¢ Graph â†’ Google Maps: Cities are nodes, roads are edges. Dijkstra\'s algorithm finds shortest path.\nâ€¢ Graph â†’ Social Networks: Facebook friend connections form an undirected graph.\nâ€¢ Graph â†’ Microservice Dependencies: Services depend on each other (directed graph).\n\nðŸ¢ Use Cases:\nâ€¢ Database B-Trees for indexing (MySQL, PostgreSQL)\nâ€¢ Trie for autocomplete (search suggestions)\nâ€¢ Graph for recommendation engines (Netflix, Amazon)', code: '// Real-world: File System Tree Traversal\nfunction findLargeFiles(directory, maxSize) {\n  const results = [];\n  \n  function traverse(node) {\n    if (node.type === "file") {\n      if (node.size > maxSize) results.push(node.path);\n      return;\n    }\n    // Directory: recurse into children\n    for (const child of node.children) {\n      traverse(child);\n    }\n  }\n  \n  traverse(directory);\n  return results;\n}\n\n// Real-world: Shortest Path (Dijkstra)\n// Used by: Google Maps, network routing,\n// CDN path optimization' },
      ]
    },
    {
      icon: 'âš¡', title: 'Algorithms', desc: 'Sorting, Searching, Dynamic Programming, Greedy â€” with real-world applications',
      sections: [
        { h: 'Sorting Algorithms', text: 'ðŸ”¹ Why sorting matters: Sorted data enables binary search (O(log n) vs O(n)), makes deduplication trivial, and improves data presentation.\n\nðŸŒ Real-World Examples:\nâ€¢ Merge Sort â†’ Git merge: Git uses a 3-way merge algorithm similar to merge sort to combine branches.\nâ€¢ Quick Sort â†’ V8 Engine: Chrome\'s JavaScript engine uses TimSort (hybrid of merge sort + insertion sort) for Array.sort().\nâ€¢ Counting Sort â†’ Analytics: Sorting millions of events by timestamp when the range is known.\n\nComplexity Comparison:\nâ€¢ Bubble Sort: O(nÂ²) â€” Educational only, never use in production\nâ€¢ Merge Sort: O(n log n) â€” Stable, great for linked lists\nâ€¢ Quick Sort: O(n log n) avg â€” Fastest in practice, used by most languages\nâ€¢ Radix Sort: O(nk) â€” When sorting integers/strings of fixed length', code: '// Real-world: Sort deployment logs by severity\nconst severityOrder = { critical: 0, error: 1, warn: 2, info: 3 };\n\nfunction sortLogs(logs) {\n  return logs.sort((a, b) => {\n    // Primary: severity, Secondary: timestamp\n    const sevDiff = severityOrder[a.level] - severityOrder[b.level];\n    if (sevDiff !== 0) return sevDiff;\n    return new Date(b.timestamp) - new Date(a.timestamp);\n  });\n}\n\n// TimSort (used by JS engines internally)\n// Hybrid: insertion sort for small chunks,\n// merge sort for combining them' },
        { h: 'Binary Search', text: 'ðŸ”¹ What: Divide-and-conquer search on SORTED data. Eliminates half the remaining elements each step.\n\nðŸŒ Real-World Examples:\nâ€¢ Git Bisect: Finding which commit introduced a bug. Git uses binary search across commit history â€” instead of checking 1000 commits, you check ~10!\nâ€¢ Database Index Lookups: B-tree indexes use binary search to find rows in O(log n).\nâ€¢ Load Balancer: Finding the right server in a consistent hashing ring.\n\nâš¡ Power: Searching 1 billion items takes only 30 comparisons!', code: '// Real-world: Git Bisect (finding bad commit)\nfunction gitBisect(commits, isBugPresent) {\n  let lo = 0, hi = commits.length - 1;\n  \n  while (lo < hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    console.log(`Testing commit ${commits[mid].hash}...`);\n    \n    if (isBugPresent(commits[mid])) {\n      hi = mid; // bug exists, search earlier\n    } else {\n      lo = mid + 1; // no bug, search later\n    }\n  }\n  \n  return commits[lo]; // first bad commit\n}\n// 1024 commits â†’ only 10 tests needed!' },
        { h: 'Dynamic Programming', text: 'ðŸ”¹ What: Solve complex problems by breaking them into overlapping subproblems and caching results.\n\nðŸŒ Real-World Examples:\nâ€¢ Google Maps â€” Shortest Path: Uses DP (Dijkstra/Bellman-Ford) to find optimal routes.\nâ€¢ Netflix â€” Text Similarity: Uses edit distance (DP) for search spell-correction ("did you mean?").\nâ€¢ Amazon â€” Knapsack Problem: Optimizing which items to load in delivery trucks (weight/value optimization).\nâ€¢ Webpack â€” Chunk Splitting: Optimizes bundle sizes using DP-like algorithms.\n\nðŸ¢ Use Cases:\nâ€¢ Resource allocation and scheduling\nâ€¢ DNA sequence alignment (bioinformatics)\nâ€¢ Caching strategies (LRU cache implementation)\nâ€¢ Financial portfolio optimization', code: '// Real-world: LRU Cache (used by Redis, CDNs)\nclass LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map(); // maintains insertion order\n  }\n  \n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val); // move to end (most recent)\n    return val;\n  }\n  \n  put(key, value) {\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    if (this.cache.size > this.capacity) {\n      // Evict least recently used (first item)\n      const oldest = this.cache.keys().next().value;\n      this.cache.delete(oldest);\n    }\n  }\n}\n// Used everywhere: browser cache, DNS cache,\n// database query cache, CDN edge caching' },
      ]
    },
    {
      icon: 'ðŸ›ï¸', title: 'OOP Principles', desc: 'Encapsulation, Inheritance, Polymorphism, Abstraction â€” real-world software examples',
      sections: [
        { h: 'Encapsulation', text: 'ðŸ”¹ What: Bundling data and methods together, hiding internal state. Only expose what\'s necessary.\n\nðŸŒ Real-World Example â€” Bank Account:\nYou can deposit/withdraw via methods, but you can\'t directly modify the balance variable. The internal logic validates transactions.\n\nðŸ¢ Use Cases:\nâ€¢ API clients that hide HTTP complexity behind simple methods\nâ€¢ Database connection pools that manage connections internally\nâ€¢ AWS SDK: You call s3.putObject() without knowing the HTTP signing process', code: '// Real-world: Payment Gateway Client\nclass PaymentGateway {\n  #apiKey;        // private - hidden\n  #baseUrl;       // private - hidden\n  #retryCount;    // private - hidden\n  \n  constructor(apiKey) {\n    this.#apiKey = apiKey;\n    this.#baseUrl = "https://api.stripe.com/v1";\n    this.#retryCount = 3;\n  }\n  \n  // Public interface - simple and clean\n  async charge(amount, currency, card) {\n    return this.#makeRequest("/charges", {\n      amount, currency, source: card\n    });\n  }\n  \n  // Private - all complexity hidden\n  async #makeRequest(endpoint, data) {\n    for (let i = 0; i < this.#retryCount; i++) {\n      try {\n        const res = await fetch(this.#baseUrl + endpoint, {\n          method: "POST",\n          headers: { "Authorization": `Bearer ${this.#apiKey}` },\n          body: JSON.stringify(data)\n        });\n        return await res.json();\n      } catch (e) {\n        if (i === this.#retryCount - 1) throw e;\n      }\n    }\n  }\n}' },
        { h: 'Inheritance & Polymorphism', text: 'ðŸ”¹ Inheritance: Create new classes based on existing ones. Child inherits parent\'s properties/methods.\nðŸ”¹ Polymorphism: Same method name, different behavior based on the object type.\n\nðŸŒ Real-World Example â€” Notification System:\nA base Notification class has a send() method. EmailNotification, SMSNotification, and PushNotification all override send() with their own logic. The calling code doesn\'t care which type â€” it just calls send().\n\nðŸ¢ Use Cases:\nâ€¢ Payment processors (Stripe, PayPal, Square â€” all have charge())\nâ€¢ Logging backends (Console, File, CloudWatch â€” all have log())\nâ€¢ Cloud providers (AWS, GCP, Azure â€” all have deploy())', code: '// Real-world: Multi-channel Notification System\nclass Notification {\n  constructor(to, message) {\n    this.to = to;\n    this.message = message;\n    this.timestamp = new Date();\n  }\n  send() { throw new Error("Override me!"); }\n}\n\nclass EmailNotification extends Notification {\n  send() {\n    console.log(`ðŸ“§ Email to ${this.to}: ${this.message}`);\n    // Uses SendGrid/SES internally\n  }\n}\n\nclass SlackNotification extends Notification {\n  send() {\n    console.log(`ðŸ’¬ Slack to ${this.to}: ${this.message}`);\n    // Uses Slack Webhook internally\n  }\n}\n\nclass PagerDutyNotification extends Notification {\n  send() {\n    console.log(`ðŸš¨ PagerDuty alert: ${this.message}`);\n    // Triggers on-call engineer\n  }\n}\n\n// Polymorphism in action â€” caller doesn\'t care about type\nfunction alertTeam(notifications) {\n  notifications.forEach(n => n.send()); // same interface!\n}' },
        { h: 'Abstraction', text: 'ðŸ”¹ What: Hiding complex implementation details behind a simple interface.\n\nðŸŒ Real-World Example â€” Kubernetes kubectl:\nYou run `kubectl apply -f deploy.yaml` â€” behind the scenes it validates YAML, communicates with API server, schedules pods, pulls images, configures networking, and sets up health checks. You don\'t need to know any of that.\n\nðŸ¢ Use Cases:\nâ€¢ ORMs (Sequelize, Prisma): Write JS objects, they generate SQL\nâ€¢ Docker: Write a Dockerfile, it handles filesystem, networking, namespaces\nâ€¢ Terraform: Declare infrastructure, it handles API calls to cloud providers' },
      ]
    },
    {
      icon: 'ðŸŽ¯', title: 'SOLID Principles', desc: 'Five design principles for maintainable, scalable software â€” with practical examples',
      sections: [
        { h: 'S â€” Single Responsibility Principle', text: 'ðŸ”¹ "A class should have only one reason to change."\n\nðŸŒ Real-World Example â€” Microservices:\nInstead of one monolith handling auth, payments, and notifications, each is a separate service. If the payment logic changes, only the payment service is modified.\n\nâŒ Bad: UserService handles login, profile updates, email sending, and report generation.\nâœ… Good: AuthService, ProfileService, EmailService, ReportService â€” each has ONE job.', code: '// âŒ BAD: One class does everything\nclass UserManager {\n  authenticate(user) { /* ... */ }\n  updateProfile(user) { /* ... */ }\n  sendEmail(user, msg) { /* ... */ }\n  generateReport(user) { /* ... */ }\n}\n\n// âœ… GOOD: Each class has one responsibility\nclass AuthService {\n  authenticate(user) { /* ... */ }\n}\n\nclass ProfileService {\n  updateProfile(user, data) { /* ... */ }\n}\n\nclass NotificationService {\n  sendEmail(to, msg) { /* ... */ }\n}' },
        { h: 'O â€” Open/Closed Principle', text: 'ðŸ”¹ "Open for extension, closed for modification."\n\nðŸŒ Real-World Example â€” Payment Processors:\nDon\'t modify existing code to add PayPal support. Instead, create a new PayPalProcessor that implements the PaymentProcessor interface.\n\nðŸ¢ Use Case: Plugin systems (VS Code extensions, Webpack plugins, Express middleware) â€” all follow this principle.', code: '// âœ… GOOD: Add new payment methods without changing existing code\nclass PaymentProcessor {\n  process(amount) { throw new Error("Override"); }\n}\n\nclass StripeProcessor extends PaymentProcessor {\n  process(amount) { /* Stripe API call */ }\n}\n\nclass PayPalProcessor extends PaymentProcessor {\n  process(amount) { /* PayPal API call */ }\n}\n\n// Adding RazorPay? Just create new class!\nclass RazorPayProcessor extends PaymentProcessor {\n  process(amount) { /* RazorPay API call */ }\n}' },
        { h: 'L â€” Liskov Substitution Principle', text: 'ðŸ”¹ "Subtypes must be substitutable for their base types without breaking the program."\n\nðŸŒ Real-World Example â€” Cloud Storage:\nIf your code works with a StorageService interface, switching from AWS S3 to Google Cloud Storage should work without any code changes.\n\nâŒ Classic violation: Square extends Rectangle but breaks when you set width independently of height.' },
        { h: 'I â€” Interface Segregation Principle', text: 'ðŸ”¹ "Clients should not be forced to depend on interfaces they do not use."\n\nðŸŒ Real-World Example â€” Docker:\nA container doesn\'t need to implement a VM interface. Docker provides just the container-specific interface (start, stop, exec) without exposing hypervisor-level operations.\n\nâŒ Bad: One giant IWorker interface with code(), test(), deploy(), design().\nâœ… Good: IDeveloper (code, test), IDesigner (design), IDevOps (deploy).' },
        { h: 'D â€” Dependency Inversion Principle', text: 'ðŸ”¹ "High-level modules should not depend on low-level modules. Both should depend on abstractions."\n\nðŸŒ Real-World Example â€” Logging:\nYour application code shouldn\'t directly use console.log or Winston. Instead, depend on a Logger interface. Swap implementations (CloudWatch, Datadog, ELK) without changing business logic.\n\nðŸ¢ Use Case: Dependency injection in Express/NestJS, Spring Boot, and .NET â€” frameworks inject dependencies at runtime.', code: '// âŒ BAD: Direct dependency on specific logger\nclass OrderService {\n  placeOrder(order) {\n    console.log("Order placed: " + order.id); // tightly coupled!\n  }\n}\n\n// âœ… GOOD: Depend on abstraction\nclass OrderService {\n  constructor(logger) { this.logger = logger; }\n  placeOrder(order) {\n    this.logger.log("Order placed: " + order.id);\n  }\n}\n\n// Swap implementations freely:\nconst svc1 = new OrderService(new ConsoleLogger());\nconst svc2 = new OrderService(new CloudWatchLogger());\nconst svc3 = new OrderService(new DatadogLogger());' },
      ]
    },
    {
      icon: 'ðŸ”„', title: 'Design Patterns', desc: 'Singleton, Factory, Observer, Strategy, Decorator â€” used by Netflix, React, Node.js',
      sections: [
        { h: 'Singleton Pattern', text: 'ðŸ”¹ What: Ensures only one instance of a class exists globally.\n\nðŸŒ Real-World Examples:\nâ€¢ Database Connection Pool: Only one pool manager across the entire app.\nâ€¢ Logger Instance: One Winston/Pino logger shared everywhere.\nâ€¢ Redux Store: Single source of truth for React app state.\nâ€¢ Kubernetes: etcd cluster has a single leader at any time.', code: '// Real-world: Database Connection Pool\nclass DatabasePool {\n  static #instance;\n  #connections = [];\n  \n  static getInstance() {\n    if (!this.#instance) {\n      this.#instance = new DatabasePool();\n      this.#instance.#init();\n    }\n    return this.#instance;\n  }\n  \n  #init() {\n    for (let i = 0; i < 10; i++) {\n      this.#connections.push({ id: i, busy: false });\n    }\n    console.log("Pool initialized with 10 connections");\n  }\n  \n  getConnection() {\n    const conn = this.#connections.find(c => !c.busy);\n    if (conn) { conn.busy = true; return conn; }\n    throw new Error("No connections available");\n  }\n}\n\n// Same instance everywhere:\nconst db1 = DatabasePool.getInstance();\nconst db2 = DatabasePool.getInstance();\nconsole.log(db1 === db2); // true' },
        { h: 'Observer Pattern', text: 'ðŸ”¹ What: Objects subscribe to events and get notified when state changes.\n\nðŸŒ Real-World Examples:\nâ€¢ React useState: Components re-render when state changes (observer pattern internally).\nâ€¢ Node.js EventEmitter: Core of Node.js â€” streams, HTTP server, all use events.\nâ€¢ Kafka/RabbitMQ: Producers publish events, consumers subscribe and react.\nâ€¢ Webhooks: GitHub notifies your CI/CD when code is pushed.\nâ€¢ Kubernetes Controllers: Watch for resource changes and reconcile state.', code: '// Real-world: Deployment Event System\nclass DeploymentEvents {\n  #subscribers = {};\n  \n  on(event, callback) {\n    (this.#subscribers[event] ??= []).push(callback);\n  }\n  \n  emit(event, data) {\n    (this.#subscribers[event] || []).forEach(cb => cb(data));\n  }\n}\n\nconst deploy = new DeploymentEvents();\n\n// Different teams subscribe to events:\ndeploy.on("deploy:success", (data) => {\n  sendSlackMessage(`âœ… ${data.service} deployed`);\n});\n\ndeploy.on("deploy:success", (data) => {\n  updateDashboard(data.service, "healthy");\n});\n\ndeploy.on("deploy:failure", (data) => {\n  triggerPagerDuty(data.service, data.error);\n  rollback(data.service, data.previousVersion);\n});\n\n// Trigger:\ndeploy.emit("deploy:success", {\n  service: "api-gateway", version: "2.1.0"\n});' },
        { h: 'Strategy Pattern', text: 'ðŸ”¹ What: Define a family of interchangeable algorithms. Switch between them at runtime.\n\nðŸŒ Real-World Examples:\nâ€¢ Compression: Choose gzip, brotli, or deflate based on client support.\nâ€¢ Authentication: Switch between JWT, OAuth, API Key strategies (Passport.js uses this!).\nâ€¢ Pricing: Different discount strategies for regular, premium, enterprise users.\nâ€¢ Sorting: Choose algorithm based on data size (insertion sort for small, merge sort for large).', code: '// Real-world: Authentication Strategies (like Passport.js)\nclass AuthContext {\n  constructor(strategy) { this.strategy = strategy; }\n  \n  async authenticate(request) {\n    return this.strategy.verify(request);\n  }\n}\n\nclass JWTStrategy {\n  verify(req) {\n    const token = req.headers.authorization;\n    return jwt.verify(token, SECRET);\n  }\n}\n\nclass APIKeyStrategy {\n  verify(req) {\n    const key = req.headers["x-api-key"];\n    return db.apiKeys.findOne({ key });\n  }\n}\n\n// Switch strategies based on route:\napp.use("/api", new AuthContext(new APIKeyStrategy()));\napp.use("/web", new AuthContext(new JWTStrategy()));' },
        { h: 'Factory Pattern', text: 'ðŸ”¹ What: Create objects without specifying the exact class to instantiate.\n\nðŸŒ Real-World Examples:\nâ€¢ React.createElement(): Creates different element types based on input.\nâ€¢ Cloud Provider SDK: Create EC2, Lambda, or S3 resources through a unified factory.\nâ€¢ Logging: Create ConsoleLogger, FileLogger, or CloudLogger based on environment (dev/staging/prod).\nâ€¢ Kubernetes: `kubectl create` creates different resource types based on YAML kind field.', code: '// Real-world: Cloud Resource Factory\nfunction createCloudResource(type, config) {\n  switch (type) {\n    case "compute":\n      return new EC2Instance(config);\n    case "serverless":\n      return new LambdaFunction(config);\n    case "storage":\n      return new S3Bucket(config);\n    case "database":\n      return new RDSInstance(config);\n    case "cache":\n      return new ElastiCacheCluster(config);\n    default:\n      throw new Error(`Unknown resource: ${type}`);\n  }\n}\n\n// Usage:\nconst server = createCloudResource("compute", {\n  instanceType: "t3.medium",\n  ami: "ami-12345"\n});' },
      ]
    },
    {
      icon: 'ðŸ§¹', title: 'Clean Code', desc: 'Write code that humans can read, maintain, and debug â€” with before/after examples',
      sections: [
        { h: 'Meaningful Names', text: 'ðŸ”¹ Variable and function names should reveal intent. If you need a comment to explain a name, the name is wrong.\n\nðŸŒ Real-World Impact:\nâ€¢ Good names reduce onboarding time for new team members from weeks to days.\nâ€¢ Self-documenting code reduces the need for external documentation by 40-60%.\nâ€¢ Code review time decreases significantly with clear naming.', code: '// âŒ BAD: What does this mean?\nconst d = new Date();\nconst x = u.filter(i => i.a > 5);\nfunction calc(a, b) { return a * b * 0.18; }\n\n// âœ… GOOD: Self-documenting\nconst currentDate = new Date();\nconst activeUsers = users.filter(user => user.loginCount > 5);\nfunction calculateTax(price, quantity) {\n  const TAX_RATE = 0.18;\n  return price * quantity * TAX_RATE;\n}' },
        { h: 'Functions Should Do ONE Thing', text: 'ðŸ”¹ A function should do one thing, do it well, and do it only.\nðŸ”¹ If you can extract another function from it â€” it\'s doing too much.\nðŸ”¹ Ideal function length: 5-20 lines. If it\'s > 30 lines, it probably needs splitting.\n\nðŸŒ Real-World Example:\nInstead of one processOrder() function that validates, charges, sends email, and updates database â€” split into validate(), charge(), notify(), and persist().', code: '// âŒ BAD: Function does 4 things\nasync function processOrder(order) {\n  // validate\n  if (!order.items.length) throw new Error("Empty");\n  if (!order.user.email) throw new Error("No email");\n  // calculate total\n  let total = 0;\n  for (const item of order.items) total += item.price * item.qty;\n  // charge payment\n  await stripe.charges.create({ amount: total });\n  // send confirmation\n  await sendEmail(order.user.email, "Order confirmed!");\n}\n\n// âœ… GOOD: Each function does ONE thing\nasync function processOrder(order) {\n  validateOrder(order);\n  const total = calculateTotal(order.items);\n  await chargePayment(order.user, total);\n  await sendConfirmation(order.user.email, total);\n}' },
        { h: 'Error Handling', text: 'ðŸ”¹ Don\'t use try/catch as a crutch â€” handle errors meaningfully.\nðŸ”¹ Create custom error classes for different failure types.\nðŸ”¹ Always log enough context to debug issues in production.\n\nðŸŒ Real-World Impact:\nPoor error handling is the #1 cause of "silent failures" in production â€” where something breaks but nobody notices until customers complain.', code: '// Real-world: Proper Error Handling in APIs\nclass AppError extends Error {\n  constructor(message, statusCode, errorCode) {\n    super(message);\n    this.statusCode = statusCode;\n    this.errorCode = errorCode;\n    this.isOperational = true;\n  }\n}\n\nclass NotFoundError extends AppError {\n  constructor(resource) {\n    super(`${resource} not found`, 404, "NOT_FOUND");\n  }\n}\n\nclass ValidationError extends AppError {\n  constructor(field, reason) {\n    super(`Invalid ${field}: ${reason}`, 400, "VALIDATION");\n  }\n}\n\n// Usage:\nasync function getUser(id) {\n  const user = await db.users.findById(id);\n  if (!user) throw new NotFoundError("User");\n  return user;\n}' },
        { h: 'DRY & KISS Principles', text: 'ðŸ”¹ DRY â€” Don\'t Repeat Yourself: Every piece of knowledge should have a single source of truth.\nðŸ”¹ KISS â€” Keep It Simple, Stupid: Simpler solutions are almost always better.\nðŸ”¹ YAGNI â€” You Aren\'t Gonna Need It: Don\'t build features "just in case".\n\nðŸŒ Real-World Examples:\nâ€¢ DRY violation: Copy-pasting validation logic across 10 API endpoints. Fix: Create a shared validation middleware.\nâ€¢ KISS violation: Building a custom event bus when a simple callback would suffice.\nâ€¢ YAGNI violation: Adding a plugin system to an internal tool used by 3 people.' },
      ]
    },
    {
      icon: 'ðŸ”€', title: 'Git Workflows', desc: 'GitFlow, Trunk-Based, Feature Branching â€” used by Google, Netflix, and GitHub',
      sections: [
        { h: 'GitFlow', text: 'ðŸ”¹ What: Structured workflow with dedicated branches for features, releases, and hotfixes.\n\nðŸŒ Who uses it: Large enterprises with scheduled releases, mobile apps (iOS/Android).\n\nðŸ“‹ Branch Structure:\nâ€¢ main â€” production-ready code\nâ€¢ develop â€” integration branch (all features merge here first)\nâ€¢ feature/* â€” individual features\nâ€¢ release/* â€” preparing a release (version bumps, final fixes)\nâ€¢ hotfix/* â€” emergency production fixes\n\nâš ï¸ Best for: Teams with scheduled release cycles (v1.0, v2.0, etc.)', code: '# Create a feature branch\ngit checkout -b feature/user-auth develop\n\n# Work on feature, commit, push\ngit add . && git commit -m "feat: add JWT auth"\ngit push origin feature/user-auth\n\n# When done, merge back to develop\ngit checkout develop\ngit merge --no-ff feature/user-auth\n\n# Create release branch\ngit checkout -b release/1.0 develop\n# Final fixes, bump version\ngit checkout main\ngit merge --no-ff release/1.0\ngit tag -a v1.0 -m "Release 1.0"\n\n# Hotfix for production bug\ngit checkout -b hotfix/login-fix main\n# Fix, commit, merge to both main AND develop\ngit checkout main && git merge --no-ff hotfix/login-fix\ngit checkout develop && git merge --no-ff hotfix/login-fix' },
        { h: 'Trunk-Based Development', text: 'ðŸ”¹ What: Everyone commits to main (trunk) frequently. Short-lived branches (< 1 day) or direct commits.\n\nðŸŒ Who uses it:\nâ€¢ Google â€” All 25,000+ engineers commit to a single monorepo trunk.\nâ€¢ Netflix â€” Pushes to production hundreds of times per day.\nâ€¢ Meta â€” Trunk-based with feature flags for gradual rollout.\n\nâœ… Best for: Teams with strong CI/CD, feature flags, and automated testing.\nâŒ Not great for: Teams without comprehensive test suites.', code: '# Daily workflow:\ngit checkout main\ngit pull origin main\n\n# Short-lived branch (merge same day)\ngit checkout -b quick/add-health-check\n# Make change, commit\ngit add . && git commit -m "feat: add /health endpoint"\ngit push origin quick/add-health-check\n# Create PR, get quick review, merge\n# Branch lives < 1 day\n\n# Feature Flags for long-running work:\nif (featureFlags.isEnabled("new-checkout")) {\n  showNewCheckout();\n} else {\n  showLegacyCheckout();\n}' },
        { h: 'Conventional Commits', text: 'ðŸ”¹ What: Standardized commit message format that enables automated changelogs and semantic versioning.\n\nðŸŒ Who uses it: Angular, React, Vue, Kubernetes, and most modern open-source projects.\n\nðŸ“‹ Format: type(scope): description\n\nTypes:\nâ€¢ feat: â€” New feature (bumps MINOR version)\nâ€¢ fix: â€” Bug fix (bumps PATCH version)\nâ€¢ docs: â€” Documentation only\nâ€¢ refactor: â€” Code change that doesn\'t fix bug or add feature\nâ€¢ perf: â€” Performance improvement\nâ€¢ test: â€” Adding tests\nâ€¢ chore: â€” Build process, dependencies\nâ€¢ BREAKING CHANGE: â€” In footer (bumps MAJOR version)', code: '# Examples:\nfeat(auth): add Google OAuth login\nfix(api): handle null response from payment gateway\nperf(db): add index on users.email column\nrefactor(cart): extract discount calculation logic\ndocs(readme): add deployment instructions\n\nfeat(api): add pagination to /users endpoint\n\nBREAKING CHANGE: response format changed from\narray to paginated object { data: [], total, page }\n\n# Auto-generate changelog:\n# v2.1.0 (2026-02-15)\n# Features:\n#   - Add Google OAuth login (a1b2c3d)\n#   - Add pagination to /users endpoint (e4f5g6h)\n# Bug Fixes:\n#   - Handle null payment response (i7j8k9l)' },
      ]
    },
    {
      icon: 'ðŸš€', title: 'CI/CD Pipelines', desc: 'Continuous Integration & Deployment â€” how Netflix deploys 1000s of times daily',
      sections: [
        { h: 'Pipeline Overview', text: 'ðŸ”¹ CI (Continuous Integration): Automatically build and test every commit.\nðŸ”¹ CD (Continuous Delivery): Automatically deploy to staging. Manual approval for production.\nðŸ”¹ CD (Continuous Deployment): Automatically deploy to production. No manual steps.\n\nðŸŒ Real-World Scale:\nâ€¢ Netflix: 1000s of deployments per day across 100s of microservices.\nâ€¢ Amazon: Deploys every 11.7 seconds on average.\nâ€¢ Google: 60,000+ builds per day from a single monorepo.\n\nðŸ“‹ Typical Pipeline Stages:\n1. ðŸ“¥ Code Push â†’ Trigger\n2. ðŸ”¨ Build â†’ Compile, dependency resolution\n3. ðŸ§ª Unit Tests â†’ Fast feedback (< 5 min)\n4. ðŸ” Static Analysis â†’ Linting, code quality (SonarQube)\n5. ðŸ”’ Security Scan â†’ Dependency vulnerabilities (Snyk, Trivy)\n6. ðŸ“¦ Docker Build â†’ Create container image\n7. ðŸ§ª Integration Tests â†’ Test with real dependencies\n8. ðŸš€ Deploy Staging â†’ Canary or blue/green\n9. âœ… Smoke Tests â†’ Verify critical paths\n10. ðŸŒ Deploy Production â†’ Gradual rollout' },
        { h: 'GitHub Actions Example', text: 'ðŸ”¹ The most popular CI/CD for open-source projects. Free for public repos.', code: 'name: CI/CD Pipeline\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npm test\n      - run: npm run lint\n  \n  security:\n    needs: test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run Snyk security scan\n        uses: snyk/actions/node@master\n  \n  deploy:\n    needs: [test, security]\n    if: github.ref == \'refs/heads/main\'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build Docker image\n        run: docker build -t my-app:${{ github.sha }} .\n      - name: Deploy to Kubernetes\n        run: kubectl set image deploy/my-app my-app=my-app:${{ github.sha }}' },
        { h: 'Deployment Strategies', text: 'ðŸ”¹ Blue/Green: Run two identical environments. Switch traffic instantly.\n  â†’ Used by: Amazon, banks (zero-downtime requirement).\n  â†’ Pros: Instant rollback. Cons: Double infrastructure cost.\n\nðŸ”¹ Canary: Route 5% of traffic to new version. Gradually increase if healthy.\n  â†’ Used by: Netflix, Google, Facebook.\n  â†’ Pros: Minimizes blast radius. Cons: Complex routing.\n\nðŸ”¹ Rolling Update: Replace instances one-by-one.\n  â†’ Used by: Kubernetes (default strategy).\n  â†’ Pros: No extra infrastructure. Cons: Mixed versions during rollout.\n\nðŸ”¹ Feature Flags: Deploy code but hide behind flags. Enable for specific users.\n  â†’ Used by: LaunchDarkly, Unleash, Flipt.\n  â†’ Pros: Decouple deploy from release. Cons: Flag cleanup needed.' },
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
      <div class="concept-detail-back"><button class="btn btn-secondary" id="conceptBack">â† Back</button></div>
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
      icon: 'ðŸ¢', title: 'Monolithic Architecture', desc: 'Single deployable unit â€” how most apps start (and when to move on)',
      diagram: [
        { row: [{ label: 'Client (Browser/Mobile)', cls: 'client' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Monolith Server\n(UI + Business Logic + Data Access)', cls: 'server' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Single Database', cls: 'db' }] },
      ],
      details: [
        { h: 'ðŸŒ Real-World Examples', text: 'â€¢ Early Netflix (2007): Started as a monolith Ruby on Rails app before migrating to microservices.\nâ€¢ Shopify: Still a monolith (Ruby on Rails) serving millions of merchants â€” proof that monoliths can scale!\nâ€¢ Stack Overflow: Handles 1.3 billion page views/month with a monolithic .NET application.\nâ€¢ Basecamp: 37signals deliberately chose a monolith and scales it vertically.\n\nðŸ’¡ Key insight: Monoliths are NOT bad. Many successful companies run monoliths at massive scale.' },
        { h: 'âœ… Pros', text: 'â€¢ Simple to develop, test, and deploy (one codebase, one deploy pipeline)\nâ€¢ No network latency between components (everything is in-process)\nâ€¢ Easier debugging â€” single stack trace, single log stream\nâ€¢ Lower operational cost (one server, one database)\nâ€¢ Perfect for teams < 10 engineers' },
        { h: 'âŒ Cons', text: 'â€¢ "Big ball of mud" â€” codebase becomes hard to understand over time\nâ€¢ Scaling means scaling EVERYTHING (can\'t scale just the payment module)\nâ€¢ A bug in one module can crash the entire application\nâ€¢ Technology lock-in â€” entire app must use same language/framework\nâ€¢ Long build and deploy times as codebase grows\nâ€¢ Hard for multiple teams to work independently' },
        { h: 'ðŸ“‹ When to Use', text: 'âœ… MVPs and startups â€” validate your idea first, optimize later\nâœ… Small teams (< 10 engineers) â€” microservices add unnecessary complexity\nâœ… Simple domains â€” not every app needs to be Netflix\nâœ… When rapid iteration matters more than scalability\n\nâŒ Avoid when:\nâ€¢ Multiple teams need to deploy independently\nâ€¢ Different components have vastly different scaling needs\nâ€¢ You need polyglot technology (e.g., ML in Python, API in Go)' },
      ]
    },
    {
      icon: 'ðŸ”—', title: 'Microservices Architecture', desc: 'Independent services â€” how Netflix, Uber, and Amazon operate at scale',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'API Gateway / LB', cls: 'lb' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Auth Service', cls: 'server' }, { label: 'User Service', cls: 'server' }, { label: 'Order Service', cls: 'server' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Auth DB', cls: 'db' }, { label: 'User DB', cls: 'db' }, { label: 'Order DB', cls: 'db' }] },
      ],
      details: [
        { h: 'ðŸŒ Real-World Examples', text: 'â€¢ Netflix: 1000+ microservices handling 250M+ subscribers. Each team owns 2-3 services. Services communicate via gRPC and async messaging.\nâ€¢ Uber: Started as monolith, migrated to 4000+ microservices. Each service handles one domain: pricing, matching, payments, maps.\nâ€¢ Amazon: CEO Jeff Bezos issued the famous "API mandate" â€” every team must expose their functionality through APIs. This led to AWS.\nâ€¢ Spotify: Each squad (team) owns a set of microservices. The "Spotify Model" influenced how companies organize around microservices.' },
        { h: 'âœ… Pros', text: 'â€¢ Independent deployment â€” ship Auth without redeploying Orders\nâ€¢ Independent scaling â€” scale the Search service during Black Friday without scaling everything\nâ€¢ Technology freedom â€” User Service in Node.js, ML Service in Python, Performance-critical in Go\nâ€¢ Fault isolation â€” if Recommendations crash, users can still browse and purchase\nâ€¢ Team autonomy â€” each team fully owns their service(s)' },
        { h: 'âŒ Cons', text: 'â€¢ Distributed system complexity (network failures, timeouts, retries)\nâ€¢ Data consistency is HARD (no more simple database transactions across services)\nâ€¢ Operational overhead (logging, monitoring, tracing across 100s of services)\nâ€¢ "Distributed monolith" â€” if services are tightly coupled, you get the worst of both worlds\nâ€¢ Need for service mesh, API gateway, circuit breakers, distributed tracing' },
        { h: 'ðŸ”§ Key Patterns', text: 'â€¢ API Gateway: Single entry point (Kong, AWS API Gateway, Envoy)\nâ€¢ Service Discovery: Services find each other dynamically (Consul, Eureka, K8s DNS)\nâ€¢ Circuit Breaker: Prevent cascade failures (Netflix Hystrix, resilience4j)\nâ€¢ Saga Pattern: Manage distributed transactions across services\nâ€¢ Sidecar Pattern: Attach logging/monitoring via proxies (Istio, Linkerd)\nâ€¢ Strangler Fig: Gradually migrate from monolith by routing requests to new services' },
        { h: 'ðŸ“‹ When to Use', text: 'âœ… Teams > 20 engineers that need to work independently\nâœ… Different components need different scaling (e.g., video transcoding vs. user profiles)\nâœ… Need polyglot tech stack\nâœ… Organization structured around business domains (DDD)\n\nâŒ Avoid when:\nâ€¢ Team is small (< 10 people) â€” overhead will slow you down\nâ€¢ Domain is simple and well-understood\nâ€¢ You can\'t invest in DevOps infrastructure (CI/CD, monitoring, service mesh)' },
      ]
    },
    {
      icon: 'ðŸ“¨', title: 'Event-Driven Architecture', desc: 'Async messaging â€” how Uber processes millions of rides in real-time',
      diagram: [
        { row: [{ label: 'Order Service', cls: 'server' }, { label: 'Payment Service', cls: 'server' }] },
        { arrow: 'â†“ publish events' },
        { row: [{ label: 'Message Broker\n(Kafka / RabbitMQ / SQS)', cls: 'queue' }] },
        { arrow: 'â†“ consume events' },
        { row: [{ label: 'Notification\nService', cls: 'server' }, { label: 'Analytics\nService', cls: 'server' }, { label: 'Search Index\nService', cls: 'server' }] },
      ],
      details: [
        { h: 'ðŸŒ Real-World Examples', text: 'â€¢ Uber: When a ride is requested, events flow: ride.requested â†’ driver.matched â†’ ride.started â†’ ride.completed â†’ payment.processed â†’ receipt.sent. All async!\nâ€¢ LinkedIn: Processes 7 trillion events/day through Kafka (which they invented!).\nâ€¢ Netflix: Uses event sourcing for recommendations â€” every user action (watch, pause, rate) is an event that feeds ML models.\nâ€¢ Stripe: Payment events (charge.succeeded, charge.failed) trigger webhooks to merchants.\nâ€¢ GitHub: Push events trigger GitHub Actions workflows.' },
        { h: 'âœ… Pros', text: 'â€¢ Loose coupling â€” producers don\'t know about consumers\nâ€¢ High scalability â€” add more consumers without changing producers\nâ€¢ Real-time processing â€” react to events as they happen\nâ€¢ Resilience â€” if a consumer is down, messages queue up and process when it recovers\nâ€¢ Audit trail â€” event log is a complete history of what happened (event sourcing)' },
        { h: 'âŒ Cons', text: 'â€¢ Eventual consistency â€” data may be stale for a brief period\nâ€¢ Complex debugging â€” tracing a request across async events is hard\nâ€¢ Message ordering â€” ensuring events are processed in the right order\nâ€¢ Duplicate processing â€” consumers must be idempotent (handle duplicates gracefully)\nâ€¢ Error handling â€” dead letter queues for failed messages' },
        { h: 'ðŸ“‹ When to Use', text: 'âœ… Real-time data streaming (IoT sensors, live dashboards, stock prices)\nâœ… Decoupling services â€” when one action triggers multiple downstream effects\nâœ… Event sourcing â€” when you need a complete audit trail (fintech, healthcare)\nâœ… CQRS â€” separate read/write paths for optimization\n\nâŒ Avoid when:\nâ€¢ Strong consistency is required (banking transactions)\nâ€¢ Simple request-response is sufficient\nâ€¢ Team isn\'t experienced with async patterns' },
      ]
    },
    {
      icon: 'â˜ï¸', title: 'Serverless Architecture', desc: 'FaaS â€” how Coca-Cola reduced costs by 80% with serverless',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'API Gateway\n(AWS / GCP / Azure)', cls: 'lb' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Function A\n(Auth)', cls: 'server' }, { label: 'Function B\n(Process)', cls: 'server' }, { label: 'Function C\n(Notify)', cls: 'server' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'DynamoDB', cls: 'db' }, { label: 'S3', cls: 'cache' }, { label: 'SQS', cls: 'queue' }] },
      ],
      details: [
        { h: 'ðŸŒ Real-World Examples', text: 'â€¢ Coca-Cola: Migrated vending machine backend to serverless, reduced costs by 80%.\nâ€¢ iRobot (Roomba): Processes 4+ million robot events/day using AWS Lambda.\nâ€¢ Nordstrom: Handles Black Friday traffic spikes with auto-scaling Lambda functions.\nâ€¢ BBC: Serves 60K+ requests/second during peak news events using serverless.\nâ€¢ Figma: Uses serverless for event processing and background jobs.' },
        { h: 'âœ… Pros', text: 'â€¢ Zero server management â€” no OS patching, no capacity planning\nâ€¢ Pay per execution â€” $0 cost when no traffic (great for variable workloads)\nâ€¢ Auto-scaling â€” from 0 to 10,000 concurrent executions automatically\nâ€¢ Faster time-to-market â€” focus on code, not infrastructure\nâ€¢ Built-in high availability across multiple availability zones' },
        { h: 'âŒ Cons', text: 'â€¢ Cold start latency (100ms-2s delay when function hasn\'t run recently)\nâ€¢ Vendor lock-in â€” hard to migrate from AWS Lambda to Azure Functions\nâ€¢ 15-minute execution time limit (not for long-running tasks)\nâ€¢ Debugging is harder â€” no server to SSH into\nâ€¢ Cost can spike unexpectedly with high traffic\nâ€¢ Stateless â€” need external storage for any state' },
        { h: 'ðŸ“‹ When to Use', text: 'âœ… Variable/unpredictable traffic patterns (marketing campaigns, seasonal)\nâœ… Event processing (S3 upload â†’ resize image, webhook â†’ process data)\nâœ… APIs with low-to-moderate traffic\nâœ… Cron jobs and scheduled tasks\nâœ… MVPs and prototypes (rapid development)\n\nâŒ Avoid when:\nâ€¢ Consistent, high-throughput workloads (cheaper to run containers)\nâ€¢ Real-time applications requiring < 10ms latency\nâ€¢ Long-running processes (video encoding, ML training)\nâ€¢ You need fine-grained control over runtime environment' },
      ]
    },
    {
      icon: 'âš–ï¸', title: 'Load Balancing & Caching', desc: 'How Amazon handles 66,000 orders/second on Prime Day',
      diagram: [
        { row: [{ label: 'Millions of Clients', cls: 'client' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'CDN (CloudFront)\nStatic Assets', cls: 'cache' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Load Balancer (ALB/NLB)', cls: 'lb' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Server 1', cls: 'server' }, { label: 'Server 2', cls: 'server' }, { label: 'Server N', cls: 'server' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Redis/Memcached\nCache Layer', cls: 'cache' }, { label: 'Primary DB', cls: 'db' }, { label: 'Read Replicas', cls: 'db' }] },
      ],
      details: [
        { h: 'ðŸŒ Real-World Examples', text: 'â€¢ Netflix: Uses AWS ELB + custom Zuul gateway to route 250M+ users across thousands of EC2 instances.\nâ€¢ Amazon Prime Day: Handles 66,000+ orders/second using multi-layer load balancing + ElastiCache.\nâ€¢ Twitter: Caches hot tweets in Redis â€” without caching, each viral tweet could bring down the service.\nâ€¢ YouTube: Uses CDN caching at 100+ edge locations worldwide to serve 720,000 hours of video/day.\nâ€¢ Facebook: Memcached cluster handles billions of reads/second, reducing database load by 99%.' },
        { h: 'âš–ï¸ Load Balancing Strategies', text: '1. Round Robin: Distribute requests equally. Simple but doesn\'t consider server load.\n   â†’ Use: Homogeneous servers with similar capacity.\n\n2. Least Connections: Send to server with fewest active connections.\n   â†’ Use: When requests have varying processing times (e.g., file uploads).\n\n3. IP Hash: Same client always goes to same server.\n   â†’ Use: When you need session affinity (sticky sessions).\n\n4. Weighted: Assign weights based on server capacity.\n   â†’ Use: Mix of powerful and less powerful servers.\n\n5. Health-Check Based: Only route to healthy servers.\n   â†’ Use: Always! Combine with any strategy above.' },
        { h: 'ðŸ’¾ Caching Strategies', text: '1. Cache-Aside (Lazy Loading):\n   App checks cache â†’ miss â†’ reads DB â†’ writes to cache â†’ returns.\n   â†’ Used by: Most web apps. Simple and effective.\n\n2. Write-Through:\n   App writes to cache AND DB simultaneously.\n   â†’ Used by: Banking systems (consistency is critical).\n\n3. Write-Behind (Write-Back):\n   App writes to cache â†’ cache asynchronously writes to DB.\n   â†’ Used by: High-write workloads (IoT sensor data).\n\n4. Read-Through:\n   Cache automatically loads from DB on miss.\n   â†’ Used by: CDNs (CloudFront, Cloudflare).' },
        { h: 'ðŸ”º CAP Theorem', text: 'In a distributed system, you can guarantee at most 2 of 3:\n\nâ€¢ C (Consistency): Every read returns the most recent write.\nâ€¢ A (Availability): Every request receives a response.\nâ€¢ P (Partition Tolerance): System works despite network failures.\n\nReal-World Choices:\nâ€¢ CP (Consistency + Partition): MongoDB, HBase â€” bank transfers, inventory counts.\nâ€¢ AP (Availability + Partition): Cassandra, DynamoDB â€” social media feeds, shopping carts.\nâ€¢ CA (Consistency + Availability): Traditional RDBMS (PostgreSQL) â€” only works without partitions (single node).\n\nðŸ’¡ In real distributed systems, P is mandatory (networks WILL fail), so you\'re really choosing between C and A.' },
      ]
    },
    {
      icon: 'ðŸ“Š', title: 'CQRS Pattern', desc: 'Separate reads and writes â€” used by trading platforms and e-commerce at scale',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Command API\n(Write)', cls: 'server' }, { label: 'Query API\n(Read)', cls: 'server' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Write DB\n(Normalized)', cls: 'db' }, { label: 'Event Bus\n(Kafka)', cls: 'queue' }, { label: 'Read DB\n(Denormalized)', cls: 'db' }] },
      ],
      details: [
        { h: 'ðŸŒ Real-World Examples', text: 'â€¢ Stock Trading Platforms: Write path records trades (must be consistent). Read path shows portfolio dashboards (can be eventually consistent with optimized queries).\nâ€¢ E-commerce Product Catalog: Write path handles seller updates (normalized: products, prices, inventory tables). Read path serves customer-facing pages (denormalized: single document with all product info).\nâ€¢ Twitter Timeline: Write path stores tweets. Read path uses a pre-computed "fan-out" timeline per user for fast reads.\nâ€¢ Banking: Write path records transactions with strict ACID. Read path serves account statements from materialized views.' },
        { h: 'ðŸ“‹ When to Use', text: 'âœ… Read-heavy applications (100:1 read/write ratio)\nâœ… Complex queries that slow down the write path\nâœ… Different scaling needs for reads vs writes\nâœ… Event sourcing â€” storing events as the source of truth\nâœ… When read and write models have very different shapes\n\nâŒ Avoid when:\nâ€¢ Simple CRUD applications (adds unnecessary complexity)\nâ€¢ Read and write models are identical\nâ€¢ Strong consistency is needed on reads (eventual consistency adds latency)\nâ€¢ Small team without experience in distributed systems' },
        { h: 'ðŸ”§ Implementation Tips', text: 'â€¢ Use Kafka/RabbitMQ to sync write DB â†’ read DB\nâ€¢ Read DB can be Elasticsearch (for search), Redis (for fast lookups), or a denormalized PostgreSQL\nâ€¢ Accept eventual consistency â€” read model may be 50-200ms behind write\nâ€¢ Use event versioning to handle schema changes\nâ€¢ Monitor sync lag between write and read databases' },
      ]
    },
    {
      icon: 'ðŸ—„ï¸', title: 'Database Sharding', desc: 'Horizontal scaling â€” how Instagram stores 2 billion+ users\' data',
      diagram: [
        { row: [{ label: 'Application Servers', cls: 'server' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Shard Router / Proxy\n(Vitess, ProxySQL)', cls: 'lb' }] },
        { arrow: 'â†“' },
        { row: [{ label: 'Shard 1\n(Users A-H)', cls: 'db' }, { label: 'Shard 2\n(Users I-P)', cls: 'db' }, { label: 'Shard 3\n(Users Q-Z)', cls: 'db' }] },
      ],
      details: [
        { h: 'ðŸŒ Real-World Examples', text: 'â€¢ Instagram: Shards PostgreSQL by user_id. Each shard holds ~1M users. Uses Vitess for shard management.\nâ€¢ Discord: Shards messages by channel_id across Cassandra nodes. Each Discord server\'s messages stay on one shard.\nâ€¢ Notion: Shards PostgreSQL by workspace_id. Each workspace\'s data is co-located on one shard.\nâ€¢ Pinterest: Shards MySQL by user_id. Uses consistent hashing to distribute data evenly.\nâ€¢ Slack: Shards by workspace_id â€” each company\'s data lives on a single shard for data locality.' },
        { h: 'ðŸ”€ Sharding Strategies', text: '1. Hash-Based: hash(user_id) % num_shards\n   âœ… Even distribution\n   âŒ Hard to add/remove shards (resharding required)\n   â†’ Used by: Most systems. Pinterest uses this.\n\n2. Range-Based: Users A-H â†’ Shard 1, I-P â†’ Shard 2\n   âœ… Range queries are efficient\n   âŒ Hot spots (popular ranges get more traffic)\n   â†’ Used by: Time-series data (logs by date range).\n\n3. Geographic: US data â†’ US shard, EU data â†’ EU shard\n   âœ… Low latency (data near users)\n   âœ… Compliance (GDPR â€” EU data stays in EU)\n   âŒ Cross-region queries are slow\n   â†’ Used by: Uber, Netflix (region-specific content).\n\n4. Directory-Based: Lookup table maps key â†’ shard\n   âœ… Flexible, easy to reshape\n   âŒ Lookup table becomes a bottleneck\n   â†’ Used by: Multi-tenant SaaS (Slack, Notion).' },
        { h: 'âš ï¸ Challenges', text: 'â€¢ Cross-shard JOIN queries â€” nearly impossible, must denormalize or use application-level joins\nâ€¢ Resharding â€” adding new shards requires migrating data (use consistent hashing to minimize)\nâ€¢ Hot shards â€” one shard getting disproportionate traffic (celebrity user problem)\nâ€¢ Distributed transactions â€” ACID across shards requires 2-phase commit or saga pattern\nâ€¢ Operational complexity â€” monitoring, backups, and failover for N shards instead of 1\n\nðŸ’¡ Rule of thumb: Don\'t shard unless your database exceeds 1-2TB or 10K queries/second. Vertical scaling (bigger machine) is simpler and often sufficient.' },
      ]
    },
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
      <div class="concept-detail-back"><button class="btn btn-secondary" id="archBack">â† Back</button></div>
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
    document.getElementById('tsUnixResult').textContent = date.toString() + '\nISO: ' + date.toISOString();
  });

  document.getElementById('tsFromDate').addEventListener('click', () => {
    const val = document.getElementById('tsDateInput').value;
    if (!val) return;
    const date = new Date(val);
    document.getElementById('tsDateResult').textContent = 'Unix: ' + Math.floor(date.getTime() / 1000) + '\nISO: ' + date.toISOString();
  });
}
