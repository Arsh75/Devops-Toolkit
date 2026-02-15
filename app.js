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
    const greeting = h < 12 ? 'Good Morning ☀️' : h < 17 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙';
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
    try { JSON.parse(inp.value); out.value = '✅ Valid JSON!'; out.className = 'tool-textarea output'; } catch (e) { out.value = '❌ Invalid: ' + e.message; out.className = 'tool-textarea error-output'; }
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
    [100,'Continue','Client should continue request'],[101,'Switching Protocols','Server switching protocols'],
    [200,'OK','Request succeeded'],[201,'Created','Resource created'],[202,'Accepted','Request accepted for processing'],
    [204,'No Content','Success with no body'],[206,'Partial Content','Partial resource returned'],
    [301,'Moved Permanently','Resource moved permanently'],[302,'Found','Temporary redirect'],
    [304,'Not Modified','Resource not modified'],[307,'Temporary Redirect','Temporary redirect preserving method'],
    [308,'Permanent Redirect','Permanent redirect preserving method'],
    [400,'Bad Request','Malformed request'],[401,'Unauthorized','Authentication required'],
    [403,'Forbidden','Access denied'],[404,'Not Found','Resource not found'],
    [405,'Method Not Allowed','HTTP method not allowed'],[408,'Request Timeout','Request timed out'],
    [409,'Conflict','Conflict with current state'],[410,'Gone','Resource permanently removed'],
    [413,'Payload Too Large','Request body too large'],[415,'Unsupported Media Type','Media type not supported'],
    [422,'Unprocessable Entity','Validation failed'],[429,'Too Many Requests','Rate limit exceeded'],
    [500,'Internal Server Error','Server error'],[502,'Bad Gateway','Invalid upstream response'],
    [503,'Service Unavailable','Server overloaded/maintenance'],[504,'Gateway Timeout','Upstream timeout'],
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
        <div class="delete-node" onclick="event.stopPropagation();removeWfNode(${node.id})">✕</div>`;
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

    if (!apiKey && provider !== 'ollama') { addMsg('assistant', '⚠️ Please set your API key in settings.'); return; }

    addMsg('assistant', '⏳ Thinking...');

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
      addMsg('assistant', '❌ Error: ' + e.message);
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
    { icon: '📊', title: 'Data Structures', desc: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Hash Maps',
      sections: [
        { h: 'Arrays', text: 'Contiguous memory, O(1) access, O(n) insert/delete.', code: '// Array operations\nconst arr = [1, 2, 3];\narr.push(4);     // O(1) amortized\narr.unshift(0);  // O(n)\narr.splice(1,1); // O(n)' },
        { h: 'Hash Maps', text: 'Key-value store, O(1) average lookup, insert, delete.', code: '// Hash Map\nconst map = new Map();\nmap.set("key", "value"); // O(1)\nmap.get("key");          // O(1)\nmap.has("key");          // O(1)' },
        { h: 'Linked Lists', text: 'Nodes with pointers. O(1) insert at head, O(n) search.', code: 'class Node {\n  constructor(val) {\n    this.val = val;\n    this.next = null;\n  }\n}' },
        { h: 'Trees', text: 'Hierarchical structure. BST: O(log n) search, insert.', code: 'class TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}' },
      ]},
    { icon: '⚡', title: 'Algorithms', desc: 'Sorting, Searching, Dynamic Programming, Recursion',
      sections: [
        { h: 'Sorting Complexity', text: 'Bubble: O(n²) | Merge: O(n log n) | Quick: O(n log n) avg', code: '// Quick Sort\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[0];\n  const left = arr.slice(1).filter(x => x <= pivot);\n  const right = arr.slice(1).filter(x => x > pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}' },
        { h: 'Binary Search', text: 'O(log n) search on sorted arrays.', code: 'function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}' },
        { h: 'Dynamic Programming', text: 'Break problems into overlapping subproblems, store results.', code: '// Fibonacci with memoization\nfunction fib(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  return memo[n] = fib(n-1, memo) + fib(n-2, memo);\n}' },
      ]},
    { icon: '🏛️', title: 'OOP Principles', desc: 'Encapsulation, Inheritance, Polymorphism, Abstraction',
      sections: [
        { h: 'Four Pillars', text: '1. Encapsulation — bundling data/methods\n2. Inheritance — code reuse via parent classes\n3. Polymorphism — same interface, different behavior\n4. Abstraction — hiding complexity', code: 'class Animal {\n  #name; // encapsulation\n  constructor(name) { this.#name = name; }\n  speak() { return "..."; } // abstraction\n}\n\nclass Dog extends Animal { // inheritance\n  speak() { return "Woof!"; } // polymorphism\n}' },
      ]},
    { icon: '🎯', title: 'SOLID Principles', desc: 'Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion',
      sections: [
        { h: 'S — Single Responsibility', text: 'A class should have only one reason to change.' },
        { h: 'O — Open/Closed', text: 'Open for extension, closed for modification.' },
        { h: 'L — Liskov Substitution', text: 'Subtypes must be substitutable for base types.' },
        { h: 'I — Interface Segregation', text: 'Many specific interfaces > one general interface.' },
        { h: 'D — Dependency Inversion', text: 'Depend on abstractions, not concrete implementations.' },
      ]},
    { icon: '🔄', title: 'Design Patterns', desc: 'Singleton, Factory, Observer, Strategy, Decorator',
      sections: [
        { h: 'Singleton', text: 'Ensures only one instance exists.', code: 'class Singleton {\n  static #instance;\n  static getInstance() {\n    if (!this.#instance) this.#instance = new Singleton();\n    return this.#instance;\n  }\n}' },
        { h: 'Observer', text: 'Subscribe to state changes.', code: 'class EventEmitter {\n  #listeners = {};\n  on(event, fn) {\n    (this.#listeners[event] ??= []).push(fn);\n  }\n  emit(event, data) {\n    this.#listeners[event]?.forEach(fn => fn(data));\n  }\n}' },
        { h: 'Factory', text: 'Create objects without specifying exact class.', code: 'function createUser(type) {\n  switch(type) {\n    case "admin": return new Admin();\n    case "user":  return new User();\n    default: throw new Error("Unknown type");\n  }\n}' },
      ]},
    { icon: '🧹', title: 'Clean Code', desc: 'Naming, Functions, Comments, Error Handling',
      sections: [
        { h: 'Key Principles', text: '• Meaningful variable/function names\n• Functions should do ONE thing\n• Avoid magic numbers — use constants\n• Handle errors explicitly\n• Keep functions short (< 20 lines ideal)\n• DRY — Don\'t Repeat Yourself' },
      ]},
    { icon: '🔀', title: 'Git Workflows', desc: 'GitFlow, Trunk-Based, Feature Branching, Conventional Commits',
      sections: [
        { h: 'GitFlow', text: 'main → develop → feature branches → release → hotfix', code: 'git checkout -b feature/my-feature develop\n# work...\ngit checkout develop\ngit merge --no-ff feature/my-feature' },
        { h: 'Conventional Commits', text: 'Standardized commit messages.', code: 'feat: add user authentication\nfix: resolve login timeout issue\ndocs: update API documentation\nchore: upgrade dependencies\nrefactor: extract validation logic' },
      ]},
    { icon: '🔄', title: 'CI/CD', desc: 'Continuous Integration, Continuous Deployment, Pipelines',
      sections: [
        { h: 'Pipeline Stages', text: '1. Code → 2. Build → 3. Test → 4. Security Scan → 5. Deploy Staging → 6. Integration Tests → 7. Deploy Production' },
        { h: 'GitHub Actions Example', code: 'name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm install\n      - run: npm test\n      - run: npm run build' },
      ]},
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
    { icon: '🏢', title: 'Monolithic Architecture', desc: 'Single deployable unit containing all application logic',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'Monolith Server\n(UI + Business Logic + Data Access)', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Database', cls: 'db' }] },
      ],
      details: [
        { h: 'Pros', text: '• Simple to develop and deploy\n• Easy debugging and testing\n• No network latency between components' },
        { h: 'Cons', text: '• Hard to scale individual components\n• Large codebase becomes unwieldy\n• Single point of failure\n• Technology lock-in' },
        { h: 'When to Use', text: 'Small teams, MVPs, simple applications, early-stage startups' },
      ]},
    { icon: '🔗', title: 'Microservices Architecture', desc: 'Independent services communicating via APIs',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'API Gateway / Load Balancer', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'Auth Service', cls: 'server' }, { label: 'User Service', cls: 'server' }, { label: 'Order Service', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Auth DB', cls: 'db' }, { label: 'User DB', cls: 'db' }, { label: 'Order DB', cls: 'db' }] },
      ],
      details: [
        { h: 'Pros', text: '• Independent scaling & deployment\n• Technology flexibility per service\n• Fault isolation\n• Team autonomy' },
        { h: 'Cons', text: '• Distributed system complexity\n• Network latency\n• Data consistency challenges\n• Operational overhead' },
        { h: 'Key Patterns', text: '• Service Discovery\n• Circuit Breaker\n• Saga Pattern for transactions\n• API Gateway' },
      ]},
    { icon: '📨', title: 'Event-Driven Architecture', desc: 'Components communicate via asynchronous events',
      diagram: [
        { row: [{ label: 'Producer A', cls: 'server' }, { label: 'Producer B', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Message Broker\n(Kafka / RabbitMQ / SQS)', cls: 'queue' }] },
        { arrow: '↓' },
        { row: [{ label: 'Consumer X', cls: 'server' }, { label: 'Consumer Y', cls: 'server' }, { label: 'Consumer Z', cls: 'server' }] },
      ],
      details: [
        { h: 'Pros', text: '• Loose coupling between services\n• High scalability\n• Real-time processing\n• Event sourcing enables audit trails' },
        { h: 'Cons', text: '• Eventual consistency\n• Complex debugging\n• Message ordering challenges' },
      ]},
    { icon: '☁️', title: 'Serverless Architecture', desc: 'FaaS — code runs in stateless, event-triggered functions',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'API Gateway', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'Lambda / Cloud Function A', cls: 'server' }, { label: 'Lambda / Cloud Function B', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'DynamoDB', cls: 'db' }, { label: 'S3 Bucket', cls: 'cache' }] },
      ],
      details: [
        { h: 'Pros', text: '• Zero server management\n• Pay per invocation\n• Auto-scaling\n• Reduced operational cost' },
        { h: 'Cons', text: '• Cold start latency\n• Vendor lock-in\n• Limited execution time\n• Stateless constraints' },
      ]},
    { icon: '⚖️', title: 'Load Balancing & Caching', desc: 'Distributing traffic and caching for performance',
      diagram: [
        { row: [{ label: 'Clients', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'Load Balancer\n(Round Robin / Least Conn)', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'Server 1', cls: 'server' }, { label: 'Server 2', cls: 'server' }, { label: 'Server 3', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Redis Cache', cls: 'cache' }, { label: 'Database', cls: 'db' }] },
      ],
      details: [
        { h: 'LB Strategies', text: '• Round Robin\n• Least Connections\n• IP Hash\n• Weighted Round Robin' },
        { h: 'Cache Strategies', text: '• Cache Aside (Lazy Loading)\n• Write Through\n• Write Behind\n• Read Through' },
        { h: 'CAP Theorem', text: 'Distributed systems can guarantee at most 2 of 3:\nConsistency — Availability — Partition Tolerance' },
      ]},
    { icon: '📊', title: 'CQRS Pattern', desc: 'Command Query Responsibility Segregation — separate read and write models',
      diagram: [
        { row: [{ label: 'Client', cls: 'client' }] },
        { arrow: '↓' },
        { row: [{ label: 'Command API\n(Write)', cls: 'server' }, { label: 'Query API\n(Read)', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Write DB\n(Normalized)', cls: 'db' }, { label: 'Event Bus', cls: 'queue' }, { label: 'Read DB\n(Denormalized)', cls: 'db' }] },
      ],
      details: [
        { h: 'When to Use', text: '• High read/write ratio applications\n• Complex business domains\n• Need for different read/write optimization\n• Event sourcing scenarios' },
      ]},
    { icon: '🗄️', title: 'Database Sharding', desc: 'Horizontal partitioning of data across multiple database instances',
      diagram: [
        { row: [{ label: 'Application', cls: 'server' }] },
        { arrow: '↓' },
        { row: [{ label: 'Shard Router', cls: 'lb' }] },
        { arrow: '↓' },
        { row: [{ label: 'Shard 1\n(Users A-H)', cls: 'db' }, { label: 'Shard 2\n(Users I-P)', cls: 'db' }, { label: 'Shard 3\n(Users Q-Z)', cls: 'db' }] },
      ],
      details: [
        { h: 'Sharding Strategies', text: '• Hash-based: hash(key) % num_shards\n• Range-based: partition by value ranges\n• Geographic: partition by region\n• Directory-based: lookup table for routing' },
        { h: 'Challenges', text: '• Cross-shard queries\n• Rebalancing shards\n• Maintaining referential integrity\n• Increased operational complexity' },
      ]},
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
