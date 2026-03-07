# DevOps Toolkit — Comprehensive Upgrade Prompt (Feb 2026)

> **Context:** You are upgrading a single-page, dependency-free DevOps dashboard built with vanilla HTML/CSS/JS. The project uses a glassmorphism dark theme and stores data in `localStorage`. The codebase consists of three files: `index.html`, `style.css`, and `app.js`. Below is a full, prioritized set of changes. Implement them exactly as described.

---

## 0. Project Overview & Constraints

- **No external runtime dependencies** — no React, no Vue, no npm packages at runtime. Pure vanilla JS/CSS/HTML only.
- **Single-folder structure** — all files live in one directory, opened via `file://` or a simple static server.
- **localStorage** is the only persistence layer.
- **Target browsers:** Latest Chrome/Edge/Firefox/Safari.
- **Current date context for dynamic features:** February 2026.

---

## 1. SECURITY & PRIVACY

### 1.1 API Key Warning Banner
**File:** `index.html` + `app.js`

In the LLM Playground section (`#page-playground`), directly above the API Key input field, inject this persistent warning banner:

```html
<div class="security-notice">
  ⚠️ <strong>Security Notice:</strong> Your API key is saved in browser <code>localStorage</code> in plain text. 
  Do not use this tool on shared or public computers. 
  <button id="clearApiKey" class="btn btn-danger btn-sm">Clear Key Now</button>
</div>
```

In `app.js`, wire `#clearApiKey` to remove only `llm_api_key` from localStorage and clear the input field.

### 1.2 "Nuke All Data" Utility
**File:** `app.js` + `index.html`

Add a **Settings / Privacy** page reachable from the sidebar under a new nav category `"Settings"`:

```
nav-item  data-page="settings"   🛡️  Privacy & Settings
```

On that page render:
- A list of all localStorage keys used by the app with their current byte sizes.
- Individual **"Clear"** buttons per data category (Snippets, LLM Settings, Workflows, Preferences).
- A single red **"Clear ALL App Data"** button that calls `localStorage.clear()` and reloads the page.
- A **"Export All Data"** button that serialises all app localStorage keys to a single JSON file download (see Section 4.1 for the export utility function).

---

## 2. ROBUSTNESS — PARSERS

### 2.1 Replace `simpleYamlParse` with a Proper Inline YAML Parser
**File:** `app.js`

The current `simpleYamlParse` is regex-based and fails on nested objects, arrays, multi-line strings, and quoted values. Replace it with a full recursive-descent parser that handles:

- Indented nested objects (2-space and 4-space indent).
- Sequences starting with `- ` at any nesting level.
- Quoted scalar values (`'single'` and `"double"` — strip quotes, do not interpret escape sequences beyond `\\` and `\"`).
- Inline comments (`# ...` after a value, stripped before parsing).
- Multi-line block scalars (`|` literal and `>` folded) — at minimum, collect subsequent indented lines and join them.
- Boolean coercion: `true/false/yes/no/on/off` → JS boolean.
- Null coercion: `null/~` → JS `null`.
- Numeric coercion: integer and float strings → JS number.

```javascript
// Signature must remain:
function parseYaml(text) { /* returns JS value or throws Error */ }
```

Replace every call site of the old `simpleYamlParse` with `parseYaml`.

### 2.2 Improve `jsonToYaml` Serialiser
**File:** `app.js`

The current serialiser doesn't handle arrays of objects, deep nesting, or multiline strings. Rewrite it:

```javascript
function jsonToYaml(obj, indent = 0) {
  // Rules:
  // - null → 'null'
  // - boolean/number → raw value
  // - string containing \n → block literal (| style), indented correctly
  // - string with special chars → double-quoted with escaping
  // - Array → each item on new line with '- ' prefix, nested content indented +2
  // - Object → each key: value pair, nested objects/arrays indented +2
  // - Indent unit = 2 spaces
}
```

Test cases to verify (include in a dev console test block, not shipped to UI):
```
Input: { "a": { "b": [1, 2, { "c": true }] }, "d": "line1\nline2" }
Expected YAML:
a:
  b:
    - 1
    - 2
    - c: true
d: |
  line1
  line2
```

---

## 3. FEATURE ENHANCEMENTS

### 3.1 JSON/YAML Tool — Additional Buttons
**File:** `index.html`, `app.js`

Add these buttons to the `#page-json-yaml` button group:

| Button Label | Action |
|---|---|
| `Sort Keys` | Re-sort all object keys alphabetically (deep), output as formatted JSON |
| `Copy Input` | Copy contents of `#jsonInput` to clipboard |
| `Clear` | Clear both input and output textareas |
| `↕ Swap` | Swap input ↔ output content |

Wire each in `app.js`. Use the `navigator.clipboard.writeText()` API with a fallback to `execCommand('copy')` for the copy buttons. Show a **2-second "Copied!" toast** (see Section 6.1) on success.

### 3.2 Snippet Manager — Export & Import
**File:** `app.js`, `index.html`

Add two buttons to the `#page-snippets` page header area:

**Export Snippets:**
```javascript
function exportSnippets() {
  const snippets = JSON.parse(localStorage.getItem('devops_snippets') || '[]');
  const blob = new Blob([JSON.stringify(snippets, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devops-snippets-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Import Snippets:**
Render a hidden `<input type="file" accept=".json">`. When triggered:
1. Parse the uploaded JSON file.
2. Validate it is an array of objects each having at least `title` and `code` keys.
3. Present a modal (see Section 6.2) asking: **"Merge with existing snippets"** or **"Replace all snippets"**.
4. Save accordingly and re-render the snippet grid.
5. Show a toast: `"Imported N snippets successfully."`

### 3.3 Workflow Designer — Logical Node Connections
**File:** `app.js`

The current workflow canvas renders draggable nodes but has no connection logic. Implement SVG-based connections:

**Connection Model:**
```javascript
// Each node has:
{ id, type, label, x, y, w: 180, h: 60 }

// Connections array:
[ { from: nodeId, to: nodeId } ]
```

**Interaction:**
1. Each node renders two ports: a circular **output port** (right edge, center) and an **input port** (left edge, center).
2. Clicking an output port enters "connecting mode" — the cursor changes, and a dashed SVG line follows the mouse.
3. Clicking an input port on another node finalises the connection and adds it to the `connections` array.
4. Press `Escape` to cancel connecting mode.
5. On the SVG layer (`#workflowSvg`), draw each connection as a cubic Bézier path:
   ```
   M fromX fromY C fromX+60 fromY, toX-60 toY, toX toY
   ```
   with `stroke: var(--accent-cyan)`, `stroke-width: 2`, `fill: none`, `marker-end: url(#arrow)`.
6. Define an SVG `<defs>` arrowhead marker with id `arrow`.
7. Right-clicking a connection line removes it.
8. Right-clicking a node shows a small context menu: **"Rename"**, **"Duplicate"**, **"Delete"**.

**Export JSON** (`#wfExport`) must output:
```json
{
  "nodes": [ { "id": "...", "type": "...", "label": "...", "x": 0, "y": 0 } ],
  "connections": [ { "from": "...", "to": "..." } ],
  "exportedAt": "2026-02-21T10:00:00Z"
}
```

### 3.4 Command Library — Expandable Detail & "Run in Terminal" Copy
**File:** `app.js`

Each command card currently shows command + description. Extend each command object with:
```javascript
{
  cmd: "docker ps -a",
  description: "List all containers including stopped ones",
  category: "docker",
  detail: "Shows Container ID, Image, Command, Created, Status, Ports, Names columns. Add --format '{{.Names}}' to show only names.",
  flags: [ "--all / -a : Show all containers", "--quiet / -q : Only display IDs" ],
  example: "docker ps -a --filter status=exited"
}
```

Clicking a command card expands it inline (toggle) to show `detail`, `flags` list, and an `example` block with its own **Copy** button. A small **▼/▲** chevron indicates collapsed/expanded state.

Add these new commands to the library (minimum — add more as appropriate):

**Docker (add):** `docker stats`, `docker inspect <id>`, `docker exec -it <id> sh`, `docker logs -f --tail 100 <id>`, `docker system prune -af`, `docker buildx build --platform linux/amd64,linux/arm64 -t image:tag --push .`

**Kubernetes (add):** `kubectl rollout status deployment/<name>`, `kubectl rollout undo deployment/<name>`, `kubectl top pods --sort-by=cpu`, `kubectl get events --sort-by='.lastTimestamp'`, `kubectl debug -it <pod> --image=busybox`, `kubectl apply --dry-run=client -f manifest.yaml`, `kubectl get pods -o json | jq '.items[].spec.containers[].image'`

**Git (add):** `git log --oneline --graph --all --decorate`, `git bisect start / good / bad`, `git stash push -m "description"`, `git reflog`, `git cherry-pick <hash>`, `git worktree add ../hotfix hotfix-branch`

**Linux (add):** `ss -tlnp`, `lsof -i :<port>`, `journalctl -u <service> -f`, `systemctl list-units --failed`, `dmesg -T | tail -50`, `awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -20`, `watch -n 2 'df -h'`

**New category — Terraform:** `terraform init`, `terraform plan -out=plan.tfplan`, `terraform apply plan.tfplan`, `terraform state list`, `terraform state show <resource>`, `terraform import <resource> <id>`, `terraform workspace list / new / select`

**New category — Helm:** `helm repo add <name> <url>`, `helm search repo <chart>`, `helm install <release> <chart> -f values.yaml`, `helm upgrade --install <release> <chart>`, `helm rollback <release> <revision>`, `helm get values <release>`, `helm template <release> <chart>`

### 3.5 HTTP Status Codes — Add "Copy as curl" and RFC Link
**File:** `app.js`

Each HTTP status card should additionally render:
- A **"Copy as curl mock"** button that copies: `curl -s -o /dev/null -w "%{http_code}" https://httpstat.us/<CODE>` to clipboard.
- A small **RFC** badge linking to the relevant MDN docs URL: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/<CODE>` (open in new tab).

### 3.6 LLM Playground — Conversation History & Token Estimator
**File:** `app.js`

**Conversation History:**
- Store the full message array in memory (not localStorage) for the session.
- Add a **"Clear Chat"** button above the message list.
- Add a **"Copy Full Conversation"** button that exports the conversation as Markdown (user/assistant alternating with `**User:**` / `**Assistant:**` headers).

**Token Estimator:**
Display a live counter below the chat input: `~N tokens (est.)` calculated as:
```javascript
function estimateTokens(text) { return Math.ceil(text.split(/\s+/).length * 1.33); }
```
Sum the estimate for system prompt + all messages + current input and update it on every keystroke.

**Provider Model Presets:**
When `#llmProvider` changes, auto-populate `#llmModel` with sensible defaults:
```
openai   → gpt-4o
gemini   → gemini-2.0-flash
ollama   → llama3.2
```

### 3.7 Coding Concepts — Add Missing 2025/2026 Relevant Topics
**File:** `app.js`

Ensure the concepts list includes entries for (add if not present):

- **SOLID Principles** (with one code example per principle in JavaScript)
- **Dependency Injection**
- **Event-Driven Architecture**
- **CQRS (Command Query Responsibility Segregation)**
- **Circuit Breaker Pattern** (with pseudo-code state machine)
- **Rate Limiting Algorithms** (Token Bucket vs Leaky Bucket vs Sliding Window — with JS implementations)
- **Consistent Hashing** (ring-based, with a minimal JS demo)
- **CAP Theorem** (explanation + real-world DB examples)
- **Bloom Filters** (use-case + JS bit-array implementation)
- **Merkle Trees** (use in Git/blockchain — JS example)

Each concept card must have: `title`, `category`, `summary` (1-2 sentences), `detail` (full explanation), `codeExample` (a JS/Python/Bash snippet), and `tags` array.

### 3.8 System Design — Add New Architecture Patterns
**File:** `app.js`

Add these architecture cards (with ASCII/SVG diagrams where noted):

- **Saga Pattern** (choreography vs orchestration, with sequence diagram in ASCII)
- **BFF — Backend for Frontend**
- **Strangler Fig Pattern**
- **Sidecar Pattern** (with a container/pod ASCII diagram)
- **Service Mesh** (Istio/Envoy context, 2025-relevant)
- **Edge Computing Architecture**
- **Multi-Tenancy Patterns** (silo vs pool vs bridge)
- **Hexagonal Architecture (Ports & Adapters)**
- **Zero Trust Network Architecture**

Each card must show: pattern name, use case, pros/cons table, and a textual or ASCII diagram.

---

## 4. DATA MANAGEMENT

### 4.1 Universal Export/Import Utility
**File:** `app.js`

Implement these reusable functions (used by Settings page and individual tools):

```javascript
// Export any localStorage data subset to a .json file
function exportData(keys, filename) { ... }

// Import a .json file; call onSuccess(parsedData) or onError(err)
function importData(onSuccess, onError) { ... }

// Get byte size of a localStorage key's value
function lsSize(key) { return new Blob([localStorage.getItem(key) || '']).size; }
```

### 4.2 Snippet Tags — Filter UI
**File:** `app.js`, `index.html`

Below the snippet search bar, dynamically render a tag filter strip. Collect all unique tags across all saved snippets and render them as clickable `.chip` elements (same style as command filters). Clicking a tag filters the snippet grid to only show snippets with that tag. Multiple tags = AND filter. "All" chip clears the filter.

---

## 5. UI/UX POLISH

### 5.1 Page Transition Animation
**File:** `style.css`

When switching pages (adding/removing the `.active` class), animate the entering page:

```css
.page-section {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.page-section.active {
  opacity: 1;
  transform: translateY(0);
}
```

In `app.js`, when switching pages:
1. Remove `.active` from the current page immediately.
2. Use `requestAnimationFrame` to add `.active` to the new page on the next frame, allowing the CSS transition to fire.

### 5.2 Keyboard Shortcuts
**File:** `app.js`

Add global keyboard shortcuts (show a help modal on `?` key):

| Shortcut | Action |
|---|---|
| `?` | Show keyboard shortcuts modal |
| `Ctrl+K` / `Cmd+K` | Focus the search bar on the current page (if it has one) |
| `Ctrl+/` | Toggle sidebar collapsed/expanded |
| `Escape` | Close any open modal |
| `Ctrl+Enter` | In LLM Playground: send message. In JSON/YAML: format JSON. |

Render the shortcuts modal as a simple overlay (reuse the modal system from Section 6.2).

### 5.3 Sidebar Collapse / Mini Mode
**File:** `style.css`, `app.js`, `index.html`

Add a **collapse toggle button** at the bottom of the sidebar. When collapsed:
- Sidebar width shrinks to `56px`.
- Only icons are shown (hide `<span>` text labels and category labels).
- The main content area expands accordingly.
- Persist the collapsed state to localStorage key `'ui_sidebar_collapsed'`.

```css
.sidebar.collapsed { width: 56px; }
.sidebar.collapsed .nav-category-label,
.sidebar.collapsed .sidebar-title,
.sidebar.collapsed .sidebar-subtitle,
.sidebar.collapsed .nav-item span:not(.nav-icon) { display: none; }
.sidebar.collapsed .nav-item { justify-content: center; }
```

### 5.4 Scrollbar Styling
**File:** `style.css`

Replace or supplement existing scrollbar styles:

```css
* { scrollbar-width: thin; scrollbar-color: rgba(99,179,237,0.4) transparent; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(99,179,237,0.4); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(99,179,237,0.7); }
```

### 5.5 Dashboard — Live Stats Cards
**File:** `app.js`, `index.html`

Below the clock widget and above the Quick Launch grid, add a row of 4 small stat cards:

```
[ 📝 N Snippets Saved ]  [ 💻 N Commands Available ]  [ 🤖 N Prompts ]  [ 🗂️ N Workflows ]
```

Read `N` dynamically from localStorage/app data on every dashboard render. Clicking each stat card navigates to the relevant page.

### 5.6 Regex Tester — Match Highlighting in Test String
**File:** `app.js`, `style.css`

Instead of listing matches separately, render the test string in a read-only `<div contenteditable="false">` with matched substrings wrapped in `<mark class="regex-highlight">` elements. Show the match list below as before, but now also highlight inline. Update on every keystroke.

```css
.regex-highlight { background: rgba(251,211,141,0.35); color: #fbd38d; border-radius: 2px; padding: 0 2px; }
```

### 5.7 Timestamp — Relative Time Display
**File:** `app.js`

After converting a Unix timestamp, also display the relative time below the result:
```
"3 years, 2 months ago"  or  "in 4 hours"
```

Implement `function relativeTime(unixSeconds)` that returns a human-readable relative string without using any external library.

### 5.8 Theme Toggle — Light Mode
**File:** `style.css`, `app.js`, `index.html`

Add a ☀️/🌙 toggle button in the sidebar footer. Toggling it adds/removes a `.light-mode` class on `<body>`. Define a minimal light mode:

```css
body.light-mode {
  --bg-primary: #f0f4f8;
  --bg-secondary: #e2e8f0;
  --bg-card: #ffffff;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  --border-color: rgba(0,0,0,0.1);
}
```

Persist the preference to `localStorage.setItem('ui_theme', 'light'|'dark')` and apply on page load.

---

## 6. REUSABLE UI COMPONENTS (implement once, use everywhere)

### 6.1 Toast Notification System
**File:** `app.js`, `style.css`

```javascript
function showToast(message, type = 'success', duration = 2500) {
  // type: 'success' | 'error' | 'info' | 'warning'
  // Creates a .toast element, appends to #toast-container, auto-removes after duration
}
```

Add `<div id="toast-container"></div>` to `index.html` body (fixed position, top-right).

```css
#toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
.toast { padding: 10px 16px; border-radius: 8px; font-size: 0.875rem; backdrop-filter: blur(12px); animation: slideIn 0.2s ease; }
.toast.success { background: rgba(72,187,120,0.2); border: 1px solid rgba(72,187,120,0.4); color: #9ae6b4; }
.toast.error { background: rgba(245,101,101,0.2); border: 1px solid rgba(245,101,101,0.4); color: #feb2b2; }
.toast.info { background: rgba(99,179,237,0.2); border: 1px solid rgba(99,179,237,0.4); color: #90cdf4; }
@keyframes slideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
```

Replace all existing `alert()` calls and manual "Copied!" text updates with `showToast(...)`.

### 6.2 Modal System
**File:** `app.js`, `style.css`, `index.html`

```javascript
function showModal({ title, body, buttons }) {
  // buttons: [{ label, class, onClick }]
  // Returns a close() function
}
```

Add a single `<div id="modal-overlay">` to `index.html`. Clicking the overlay background closes the modal. `Escape` key also closes it.

```css
#modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 8000; display: none; align-items: center; justify-content: center; }
#modal-overlay.open { display: flex; }
.modal-box { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; min-width: 340px; max-width: 560px; }
```

---

## 7. NEW TOOLS TO ADD

### 7.1 Diff Viewer
**Nav:** `🔀 Diff Viewer` under DevOps Utilities  
**File:** `index.html` (new `<section id="page-diff">`), `app.js`

Two side-by-side textareas (left = original, right = modified). A **"Diff"** button computes a line-by-line diff and renders a unified diff view below with:
- Removed lines highlighted in red (`rgba(245,101,101,0.15)`) prefixed with `−`
- Added lines highlighted in green (`rgba(72,187,120,0.15)`) prefixed with `+`
- Unchanged context lines (±3 lines around changes) in neutral

Implement the diff algorithm using the longest-common-subsequence (LCS) approach in pure JS.

### 7.2 Color & Variable Picker (CSS/Hex Utility)
**Nav:** `🎨 Color Tools` under Quick Utilities

Features:
- HEX ↔ RGB ↔ HSL conversion.
- A colour palette from the current app's CSS variables rendered as clickable swatches.
- Copy any value to clipboard.

### 7.3 Markdown Preview
**Nav:** `📋 Markdown` under DevOps Utilities

Left textarea for Markdown input, right panel renders preview. Implement a minimal Markdown renderer in pure JS supporting: headings, bold, italic, code (inline and fenced), blockquote, unordered/ordered lists, links, horizontal rules. Do **not** use `innerHTML` with unsanitised input — strip `<script>` tags and event handler attributes before rendering.

---

## 8. PERFORMANCE & CODE QUALITY

### 8.1 Debounce All Search Inputs
**File:** `app.js`

All `input` event listeners on search fields must be wrapped with a `debounce(fn, 250)` utility:

```javascript
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
```

### 8.2 Virtual Scroll for Large Lists
**File:** `app.js`

If the command list exceeds 100 items, render only the visible items plus a 10-item buffer above and below the viewport. Use `IntersectionObserver` or a scroll listener approach. This prevents DOM bloat.

### 8.3 Lazy-Render Pages
**File:** `app.js`

Pages that contain large data sets (Commands, HTTP Codes, Concepts, Architecture) should not render their full DOM on app init. Instead, render them only when the user navigates to that page for the first time. Use a `rendered` flag per page:

```javascript
const pageRendered = {};
function navigateTo(page) {
  // ...
  if (!pageRendered[page]) { renderPage(page); pageRendered[page] = true; }
}
```

### 8.4 Error Boundaries for Tool Operations
**File:** `app.js`

Wrap all tool operations (JSON parse, YAML parse, regex compile, base64 decode, JWT decode) in `try/catch`. On error, display the error message in the output textarea with a red border style, and call `showToast(err.message, 'error')`. Never let an unhandled error silently break the UI.

---

## 9. ACCESSIBILITY

- All interactive elements must have accessible `aria-label` attributes where the visible label is insufficient (icon-only buttons).
- The sidebar navigation `<nav>` must have `role="navigation"` and `aria-label="Main navigation"`.
- All modals must trap focus within them when open (`focusTrap` utility function).
- Color contrast: ensure all text meets WCAG AA (4.5:1 ratio). Verify `--text-muted` against `--bg-card`.
- The `#regexOutput` diff/match view must not rely solely on colour — add `+`/`-` prefix characters.

---

## 10. PROMPT LIBRARY — NEW ADDITIONS (February 2026 Relevant)

Add these prompt templates to the Prompt Library (`app.js` data array):

```javascript
// Category: "claude" or "ai-engineering"
{
  title: "Generate a Dockerfile for a Node.js app",
  category: "docker",
  prompt: `You are a senior DevOps engineer. Generate a production-ready, multi-stage Dockerfile for a Node.js 22 application. Requirements:
- Use Alpine base images to minimise size
- Separate build and runtime stages
- Run as a non-root user
- Include HEALTHCHECK instruction
- Use .dockerignore best practices
App entry point: [ENTRY_POINT]
Exposed port: [PORT]`
},
{
  title: "Debug a Kubernetes CrashLoopBackOff",
  category: "kubernetes",
  prompt: `I have a pod stuck in CrashLoopBackOff. Walk me through a systematic debugging process. For each step, give me the exact kubectl command to run and explain what to look for in the output. Pod name: [POD_NAME], Namespace: [NAMESPACE]`
},
{
  title: "Write a Terraform module",
  category: "terraform",
  prompt: `Write a reusable Terraform module for [RESOURCE_TYPE] on [CLOUD_PROVIDER]. Include: variables.tf with sensible defaults and validation rules, outputs.tf, main.tf with resource definitions, and a README with usage example. Follow the official Terraform module structure conventions.`
},
{
  title: "Security audit a bash script",
  category: "security",
  prompt: `Perform a security audit of the following bash script. Check for: command injection vulnerabilities, unsafe use of variables (unquoted), hardcoded credentials, use of deprecated or dangerous commands, TOCTOU race conditions, improper error handling. For each issue found, show the vulnerable line, explain the risk (CVSS-style severity), and provide the fixed version.\n\nScript:\n\`\`\`bash\n[PASTE SCRIPT HERE]\n\`\`\``
},
{
  title: "Incident post-mortem template",
  category: "incident",
  prompt: `Generate a blameless post-mortem document for the following incident. Use the SRE post-mortem format with sections: Summary, Timeline (with UTC timestamps), Root Cause, Contributing Factors, Impact, Resolution, Action Items (with owners and due dates), and Lessons Learned.\n\nIncident summary: [DESCRIBE INCIDENT]`
},
{
  title: "Optimise a slow SQL query",
  category: "debugging",
  prompt: `Analyse this SQL query for performance issues. Identify: missing indexes, N+1 query patterns, unnecessary full table scans, suboptimal JOINs, and opportunities for query restructuring. Provide the optimised query and explain each change. Also suggest what EXPLAIN ANALYZE output I should look for to verify improvement.\n\nQuery:\n\`\`\`sql\n[PASTE QUERY]\n\`\`\``
},
{
  title: "Claude: Review my GitHub Actions workflow",
  category: "code-review",
  prompt: `Review this GitHub Actions workflow YAML for: security issues (e.g., script injection via untrusted inputs, overly broad permissions), efficiency improvements (caching, parallelism), correctness (proper condition expressions, artifact handling), and best practices (pinned action versions, least-privilege permissions). Annotate each issue with the line reference and suggested fix.\n\nWorkflow:\n\`\`\`yaml\n[PASTE WORKFLOW]\n\`\`\``
}
```

---

## 11. IMPLEMENTATION ORDER (Priority)

Implement changes in this order to minimise regression risk:

1. **Section 6** — Toast + Modal system (these are dependencies for everything else)
2. **Section 1** — Security warnings + clear data
3. **Section 2** — Parser improvements (isolated, testable)
4. **Section 8.4** — Error boundaries (wrap all tools)
5. **Section 3.1** — JSON/YAML extra buttons
6. **Section 3.2** — Snippet export/import
7. **Section 5.1** — Page transitions
8. **Section 5.3** — Sidebar collapse
9. **Section 5.8** — Light/dark theme toggle
10. **Section 3.4** — Expanded command library
11. **Section 3.3** — Workflow connections
12. **Section 7** — New tools (Diff, Markdown, Color)
13. **Section 3.6** — LLM Playground improvements
14. **Section 5.2** — Keyboard shortcuts
15. Everything else in Sections 4, 5, 9

---

## 12. VERIFICATION CHECKLIST

After implementation, manually verify each of the following:

- [ ] Paste deeply nested JSON → format → convert to YAML → convert back to JSON → result matches original
- [ ] Paste a multi-level YAML with arrays → parse → result is correct JS object
- [ ] Save 3 snippets → export JSON → clear all data → import JSON → snippets restored correctly
- [ ] In Workflow Designer: add 4 nodes → drag to position → connect them with arrows → export JSON contains nodes + connections
- [ ] Enter API key → refresh page → key persists → click "Clear Key Now" → key is gone
- [ ] Switch between 5 pages rapidly → no UI glitches, transitions are smooth
- [ ] Collapse sidebar → refresh → sidebar remains collapsed
- [ ] Toggle light mode → refresh → light mode persists
- [ ] Press `Ctrl+K` on Commands page → search bar receives focus
- [ ] Press `?` → keyboard shortcuts modal appears → press `Escape` → modal closes
- [ ] Regex tester: enter pattern `\d+` → type test string → matches are highlighted inline
- [ ] HTTP code search: type "not found" → 404 appears → click "Copy as curl mock" → correct command in clipboard
- [ ] Run app on Firefox and Safari — verify no browser-specific failures
- [ ] All `console.error` calls are absent from the shipped code (only `console.warn` at most for deprecation notices)

---

## 13. DEVELOPER KNOWLEDGE BASE — NEW SECTION

> **Purpose:** This section adds a dedicated **"Developer Knowledge Base"** page to the toolkit. It is technology-stack-aware (Angular + .NET Core + SQL) but deliberately teaches **universal concepts** that apply across all languages. Code examples are shown in **C# and TypeScript/JavaScript side by side** where relevant. Depth is **mixed** — some topics start from first principles, others go deep into internals and tradeoffs.

---

### 13.0 New Nav Entry

Add to sidebar under `"Learning & Reference"`:

```
nav-item  data-page="knowledge"   🧠  Dev Knowledge Base
```

Add to `index.html`:
```html
<section class="page-section" id="page-knowledge">
  <div class="page-header">
    <h1>Developer Knowledge Base</h1>
    <p>Universal concepts every developer should deeply understand — with real code examples</p>
  </div>
  <div class="search-bar">
    <span class="search-icon">🔍</span>
    <input type="text" id="knowledgeSearch" placeholder="Search concepts...">
  </div>
  <div class="filter-chips" id="knowledgeFilters">
    <span class="chip active" data-filter="all">All</span>
    <span class="chip" data-filter="language-internals">Language Internals</span>
    <span class="chip" data-filter="design-patterns">Design Patterns</span>
    <span class="chip" data-filter="database">Database</span>
    <span class="chip" data-filter="security">Security</span>
    <span class="chip" data-filter="rxjs">RxJS</span>
    <span class="chip" data-filter="dotnet">ASP.NET Core</span>
    <span class="chip" data-filter="angular">Angular</span>
    <span class="chip" data-filter="performance">Performance & Caching</span>
  </div>
  <div class="concepts-grid" id="knowledgeGrid"></div>
  <div class="concept-detail" id="knowledgeDetail"></div>
</section>
```

Each knowledge entry in `app.js` follows this schema:
```javascript
{
  id: 'unique-slug',
  title: 'Concept Name',
  category: 'language-internals',   // matches filter chip
  level: 'basic' | 'intermediate' | 'deep',
  summary: 'One sentence — what is this and why does it matter.',
  detail: `Full markdown-style explanation string`,
  codeExamples: [
    { lang: 'csharp', label: 'C#', code: `...` },
    { lang: 'typescript', label: 'TypeScript', code: `...` }
  ],
  tradeoffs: [ 'Pro: ...', 'Con: ...' ],    // optional
  realWorld: 'Where you will encounter this in Angular / .NET / SQL projects',
  tags: ['memory', 'gc', 'value-type']
}
```

Render: clicking a card expands it inline to show `detail`, side-by-side code tabs (C# | TS), `tradeoffs` as a pro/con table, and `realWorld` box.

---

### 13.1 LANGUAGE INTERNALS

---

#### 13.1.1 Stack vs Heap Memory

**Level:** Basic → Intermediate

**Summary:** Every program uses two memory regions — the stack (fast, auto-managed, limited) and the heap (slower, GC-managed, flexible). Knowing which types live where explains performance, null bugs, and unexpected mutation.

**Detail:**
```
Stack:
- Fixed-size frames allocated per method call
- Stores: local variables of value types, method parameters, return addresses
- LIFO — freed automatically when method returns
- Very fast: just move a pointer
- Typical size: 1–8 MB per thread (stack overflow = recursion too deep)

Heap:
- Large, dynamic memory region
- Stores: all objects (reference types), boxed value types
- Managed by Garbage Collector in .NET / JVM / JS engine
- Slower: requires allocation + GC tracking
- Objects remain alive as long as there is a root reference to them
```

**C# Example:**
```csharp
// VALUE TYPES → live on stack (when local variables)
int x = 42;          // stack
double pi = 3.14;    // stack
bool flag = true;    // stack
DateTime now = DateTime.Now; // struct → stack

// REFERENCE TYPES → object body on heap, variable (reference/pointer) on stack
string name = "Alice";       // "Alice" object on heap, 'name' pointer on stack
List<int> nums = new();      // List object on heap

// PASSING BY VALUE — copy is made, original unchanged
void Double(int n) { n *= 2; }  // n is a copy
int a = 5; Double(a);            // a is still 5

// PASSING BY REFERENCE — same memory location
void DoubleRef(ref int n) { n *= 2; }
int b = 5; DoubleRef(ref b);     // b is now 10

// BOXING — value type copied to heap (performance cost!)
int val = 99;
object boxed = val;  // new heap allocation, value copied in
int unboxed = (int)boxed;  // copied back out

// STRUCT vs CLASS — critical distinction
struct Point { public int X, Y; }   // value type, stack, copied on assignment
class Node  { public int X, Y; }    // reference type, heap, shared on assignment

Point p1 = new Point { X = 1 };
Point p2 = p1;   // COPY — p2 is independent
p2.X = 99;       // p1.X is still 1

Node n1 = new Node { X = 1 };
Node n2 = n1;    // REFERENCE — n2 points to same heap object
n2.X = 99;       // n1.X is now 99 too!
```

**TypeScript/JS Example:**
```typescript
// JS has no explicit stack/heap control, but the same rules apply internally:

// PRIMITIVES → value semantics (conceptually stack-like)
let x = 42;
let y = x;  // y is a copy
y = 99;     // x is still 42

// OBJECTS → reference semantics (heap)
const obj1 = { name: 'Alice' };
const obj2 = obj1;   // same reference
obj2.name = 'Bob';   // obj1.name is now 'Bob' too!

// COMMON BUG in Angular:
@Component({...})
export class MyComponent {
  user = { name: 'Alice' };

  edit() {
    const copy = this.user;   // BUG: not a copy, same reference
    copy.name = 'Bob';         // mutates original!

    // CORRECT:
    const safeCopy = { ...this.user };   // shallow copy
    const deepCopy = structuredClone(this.user);  // deep copy (modern)
  }
}

// CLOSURES capture references, not values — classic loop bug:
const fns: (() => number)[] = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);  // captures reference to i, not value
}
fns[0]();  // 3, not 0 — because var is hoisted and i is now 3

// FIX: use let (block-scoped, new binding per iteration)
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
fns[0]();  // 0 ✓
```

**Real World:** In .NET APIs, passing large structs as method parameters causes repeated copying — use `in` or `ref readonly` for read-only large structs. In Angular, mutating object references directly prevents `OnPush` change detection from firing because the reference hasn't changed.

---

#### 13.1.2 Value Types vs Reference Types (Deep Dive)

**Level:** Intermediate

**Summary:** The distinction between value semantics and reference semantics is the root cause of most subtle bugs around equality, mutation, null, and performance across all languages.

**Detail:**

```
Value Types (C#):    int, double, bool, char, decimal, struct, enum
Reference Types (C#): class, string*, array, interface, delegate, record class

* string is special: reference type with value semantics (immutable, interned)
```

**C# Example:**
```csharp
// EQUALITY SEMANTICS
// Value types: == compares content
int a = 5, b = 5;
Console.WriteLine(a == b);  // true — same value

// Reference types: == compares reference (address) by default
var list1 = new List<int> { 1, 2 };
var list2 = new List<int> { 1, 2 };
Console.WriteLine(list1 == list2);   // false — different objects in memory
Console.WriteLine(list1.SequenceEqual(list2));  // true — content equal

// STRING special case: interned, == compares content
string s1 = "hello";
string s2 = "hello";
Console.WriteLine(s1 == s2);           // true (content equality, overridden)
Console.WriteLine(ReferenceEquals(s1, s2));  // true (interning!) or false (runtime-dependent)

// NULLABLE value types
int? maybeNull = null;   // Nullable<int> — box on heap only when has value
if (maybeNull.HasValue) Console.WriteLine(maybeNull.Value);
int result = maybeNull ?? 0;   // null coalescing

// RECORDS (C# 9+) — value semantics for class types
record Person(string Name, int Age);
var p1 = new Person("Alice", 30);
var p2 = new Person("Alice", 30);
Console.WriteLine(p1 == p2);  // true — record equality compares properties
var p3 = p1 with { Age = 31 }; // non-destructive mutation

// IMMUTABILITY and thread safety
// Immutable types are inherently thread-safe — no mutation = no race conditions
// string, record (by convention), ImmutableList<T> etc.
```

**TypeScript Example:**
```typescript
// PRIMITIVE equality (value semantics)
console.log(5 === 5);           // true
console.log('hi' === 'hi');     // true
console.log(null === undefined); // false (use == for loose check)

// OBJECT equality (reference semantics)
const a = { x: 1 };
const b = { x: 1 };
console.log(a === b);  // false — different references

// Deep equality — use structuredClone or a library
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);  // quick but limited
}

// ANGULAR IMPACT: OnPush change detection uses reference equality
// If you mutate an array/object without creating a new reference,
// the component won't re-render.

// WRONG (mutation):
this.items.push(newItem);  // same array reference → OnPush won't detect

// CORRECT (new reference):
this.items = [...this.items, newItem];  // new array → OnPush fires
```

---

#### 13.1.3 Static vs Instance — When and Why

**Level:** Basic → Intermediate

**Summary:** `static` means "belongs to the type itself, not to any instance." Understanding this determines memory layout, testability, thread safety, and the right architectural decisions.

**Detail:**
```
Instance member:
- Tied to a specific object created with `new`
- Each object has its own copy of instance fields
- Can access `this` / instance state

Static member:
- Belongs to the TYPE, not an object
- Single copy exists in memory for the entire app lifetime
- Cannot access instance state
- Shared across ALL callers — beware of shared mutable state!

When to use static:
✓ Pure utility functions with no state (Math.Sqrt, string.IsNullOrEmpty)
✓ Constants and configuration values
✓ Factory methods (when creation logic doesn't need inheritance)
✓ Extension methods (must be static)

When NOT to use static:
✗ When you need to mock/test it (static calls can't be mocked without tools)
✗ When the behavior might vary per context (use DI instead)
✗ When it holds mutable shared state (thread-safety nightmare)
✗ When you need polymorphism
```

**C# Example:**
```csharp
// STATIC UTILITY — correct use
public static class StringHelper
{
    public static string ToPascalCase(string input)  // pure function, no state
        => string.IsNullOrEmpty(input) ? input
           : char.ToUpper(input[0]) + input[1..].ToLower();
}

// STATIC MUTABLE STATE — dangerous
public static class RequestCounter
{
    private static int _count = 0;          // shared across ALL threads
    public static void Increment() => _count++;  // NOT thread-safe!

    // Thread-safe version:
    private static int _safeCount = 0;
    public static void IncrementSafe() => Interlocked.Increment(ref _safeCount);
}

// INSTANCE with DI — testable, flexible
public class OrderService
{
    private readonly IOrderRepository _repo;       // injected, mockable
    private readonly ILogger<OrderService> _log;

    public OrderService(IOrderRepository repo, ILogger<OrderService> log)
    {
        _repo = repo;
        _log = log;
    }

    public async Task<Order> GetOrderAsync(int id)
    {
        _log.LogInformation("Fetching order {Id}", id);
        return await _repo.GetByIdAsync(id);
    }
}
// Static equivalent would be untestable:
// OrderService.GetOrder(id) → can't mock the DB call!

// EXTENSION METHODS — static but feel like instance
public static class IEnumerableExtensions
{
    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source) where T : class
        => source.Where(x => x is not null)!;
}
// Usage: var names = users.Select(u => u?.Name).WhereNotNull();

// SINGLETON PATTERN — only one instance
public sealed class AppConfig
{
    private static readonly Lazy<AppConfig> _instance
        = new(() => new AppConfig());
    public static AppConfig Instance => _instance.Value;
    private AppConfig() { /* load config */ }
    public string ConnectionString { get; private set; } = "";
}
// Modern .NET: prefer DI singleton registration over manual singleton pattern
```

**TypeScript Example:**
```typescript
// STATIC members on a class
class MathUtils {
    static readonly PI = 3.14159;

    static circleArea(r: number): number {
        return MathUtils.PI * r * r;
    }
    // No constructor needed — never instantiated
}
MathUtils.circleArea(5);  // call directly on type

// MODULE-LEVEL functions are effectively "static" in TS/JS
export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// ANGULAR SERVICES — effectively singletons when provided in root
@Injectable({ providedIn: 'root' })  // single instance for entire app
export class UserService {
    private currentUser$ = new BehaviorSubject<User | null>(null);

    // Instance state — each service injection gets the SAME instance
    // because providedIn: 'root' makes it a singleton
}

// Provided in component — NEW instance per component
@Injectable()
export class FormStateService { }

@Component({
    providers: [FormStateService]  // new instance for this component tree
})
export class CheckoutComponent { }
```

**Real World:** In .NET Core, registering services as `Singleton` in DI means one instance for the app lifetime — great for thread-safe stateless services, dangerous for anything with mutable state accessed from multiple requests. In Angular, `providedIn: 'root'` services are Angular's equivalent of singletons.

---

#### 13.1.4 Garbage Collection — How It Actually Works

**Level:** Intermediate → Deep

**Summary:** GC is not magic — understanding generational collection, the LOH, and finalisers lets you diagnose memory leaks, GC pressure, and pauses in production .NET apps.

**Detail:**
```
.NET GC — Generational:
  Gen 0: New short-lived objects. Collected frequently, very fast (<1ms)
  Gen 1: Survived one Gen 0 collection. Buffer between Gen 0 and 2.
  Gen 2: Long-lived objects (static data, caches). Collected rarely, slower.
  LOH:   Large Object Heap — objects ≥ 85,000 bytes go here directly.
         LOH is only collected during Gen 2 GC.
         LOH is NOT compacted by default → fragmentation over time.

Mark-and-Sweep in JS (V8):
  - Mark phase: start from roots (global, stack), mark all reachable objects
  - Sweep phase: reclaim unmarked memory
  - Incremental + concurrent GC to avoid stop-the-world pauses
```

**C# Example:**
```csharp
// MEMORY LEAK via event handler — extremely common in .NET/Angular
public class Publisher
{
    public event EventHandler? DataChanged;
    public void Raise() => DataChanged?.Invoke(this, EventArgs.Empty);
}

public class Subscriber
{
    private readonly Publisher _pub;
    public Subscriber(Publisher pub)
    {
        _pub = pub;
        _pub.DataChanged += OnDataChanged;  // pub holds reference to subscriber!
        // If Subscriber is "disposed" but Publisher lives on,
        // Subscriber can NEVER be collected → memory leak
    }

    private void OnDataChanged(object? sender, EventArgs e) { }

    // SOLUTION: unsubscribe when done
    public void Dispose() => _pub.DataChanged -= OnDataChanged;
}

// IDisposable PATTERN — deterministic cleanup of unmanaged resources
public class FileProcessor : IDisposable
{
    private FileStream? _stream;
    private bool _disposed;

    public void Open(string path) => _stream = File.OpenRead(path);

    public void Dispose()
    {
        if (_disposed) return;
        _stream?.Dispose();  // release file handle immediately (don't wait for GC)
        _disposed = true;
        GC.SuppressFinalize(this);  // tell GC finaliser not needed
    }
}

// Always use 'using' to guarantee Dispose is called
using var proc = new FileProcessor();
proc.Open("data.csv");
// Dispose() called automatically here even if exception thrown

// AVOID LOH FRAGMENTATION: reuse large buffers
// Instead of: var buffer = new byte[1_000_000]; // new allocation every time
// Use: ArrayPool<byte>.Shared
var buffer = ArrayPool<byte>.Shared.Rent(1_000_000);
try { /* use buffer */ }
finally { ArrayPool<byte>.Shared.Return(buffer); }  // returned to pool, not GC'd
```

**TypeScript/JS Example:**
```typescript
// MEMORY LEAK via forgotten subscriptions — the #1 Angular memory leak
@Component({ selector: 'app-user' })
export class UserComponent implements OnInit, OnDestroy {
    private sub!: Subscription;

    ngOnInit() {
        // BAD: never unsubscribed — component is destroyed but Observable keeps running
        this.userService.user$.subscribe(user => this.user = user);  // LEAK

        // GOOD option 1: store and unsubscribe
        this.sub = this.userService.user$.subscribe(user => this.user = user);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();  // critical cleanup
    }
}

// BEST PATTERN: takeUntilDestroyed (Angular 16+)
@Component({...})
export class UserComponent {
    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.userService.user$
            .pipe(takeUntilDestroyed(this.destroyRef))  // auto-unsubscribes on destroy
            .subscribe(user => this.user = user);
    }
}

// DETECT LEAKS: Chrome DevTools → Memory → Heap Snapshot
// Take snapshot before action, take after, compare — look for unexpected retained objects
```

---

### 13.2 DESIGN PATTERNS

Each pattern entry must include: Intent, When to use, When NOT to use, C# implementation, TypeScript/Angular real-world usage, and common mistakes.

---

#### 13.2.1 Strategy Pattern

**Level:** Intermediate

**Summary:** Define a family of algorithms, encapsulate each one, and make them interchangeable. Eliminates large `if/switch` chains based on type.

**C# Example:**
```csharp
// INTERFACE — the strategy contract
public interface IDiscountStrategy
{
    decimal Apply(decimal price);
}

// CONCRETE STRATEGIES
public class NoDiscount       : IDiscountStrategy { public decimal Apply(decimal p) => p; }
public class PercentDiscount  : IDiscountStrategy
{
    private readonly decimal _pct;
    public PercentDiscount(decimal pct) => _pct = pct;
    public decimal Apply(decimal p) => p * (1 - _pct / 100);
}
public class SeasonalDiscount : IDiscountStrategy { public decimal Apply(decimal p) => p * 0.85m; }

// CONTEXT — uses the strategy
public class ShoppingCart
{
    private IDiscountStrategy _discount = new NoDiscount();

    public void SetDiscount(IDiscountStrategy strategy) => _discount = strategy;
    public decimal Checkout(decimal total) => _discount.Apply(total);
}

// USAGE
var cart = new ShoppingCart();
cart.SetDiscount(new PercentDiscount(10));
Console.WriteLine(cart.Checkout(100));  // 90

// With DI — inject strategy via factory
// Register: services.AddKeyedScoped<IDiscountStrategy, PercentDiscount>("percent");
// Inject:   [FromKeyedServices("percent")] IDiscountStrategy strategy
```

**TypeScript/Angular Example:**
```typescript
// Strategy as function type (idiomatic TS)
type SortStrategy<T> = (a: T, b: T) => number;

class DataGrid<T> {
    private sorter: SortStrategy<T> = () => 0;

    setSortStrategy(fn: SortStrategy<T>) { this.sorter = fn; }
    sort(data: T[]): T[] { return [...data].sort(this.sorter); }
}

const grid = new DataGrid<{ name: string; age: number }>();
grid.setSortStrategy((a, b) => a.name.localeCompare(b.name));

// ANGULAR real-world: HTTP interceptors are a Strategy pattern
// Each interceptor handles requests differently based on conditions
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = this.auth.getToken();
        const authReq = token
            ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            : req;
        return next.handle(authReq);
    }
}
```

---

#### 13.2.2 Observer Pattern (and how RxJS implements it)

**Level:** Intermediate → Deep

**Summary:** Define a one-to-many dependency so when one object changes state, all dependents are notified automatically. RxJS is a complete, production-grade implementation of this pattern.

**C# Example:**
```csharp
// Manual observer pattern
public interface IStockObserver { void Update(string symbol, decimal price); }

public class StockMarket  // Subject
{
    private readonly List<IStockObserver> _observers = new();
    private readonly Dictionary<string, decimal> _prices = new();

    public void Subscribe(IStockObserver o)   => _observers.Add(o);
    public void Unsubscribe(IStockObserver o) => _observers.Remove(o);

    public void UpdatePrice(string symbol, decimal price)
    {
        _prices[symbol] = price;
        foreach (var o in _observers) o.Update(symbol, price);
    }
}

// .NET built-in: IObservable<T> / IObserver<T>
// Reactive Extensions (Rx.NET) is the .NET equivalent of RxJS:
IObservable<int> numbers = Observable.Range(1, 5);
numbers
    .Where(n => n % 2 == 0)
    .Select(n => n * n)
    .Subscribe(
        onNext:      n => Console.WriteLine(n),
        onError:     e => Console.WriteLine($"Error: {e.Message}"),
        onCompleted: ()  => Console.WriteLine("Done")
    );
```

**TypeScript/RxJS Example:**
```typescript
// RxJS IS the Observer pattern — deeply understand this

// The three core interfaces:
// Observable<T>  — the data producer (Subject/stream)
// Observer<T>    — the consumer { next, error, complete }
// Subscription   — the connection (call .unsubscribe() to disconnect)

// SUBJECT types — understand differences:
const subject = new Subject<number>();          // hot, no replay
const behavior = new BehaviorSubject<number>(0); // hot, replays last value to new subscribers
const replay = new ReplaySubject<number>(3);     // hot, replays last N values
const async$ = new AsyncSubject<number>();       // emits only last value on complete

// OPERATORS — the real power of RxJS
this.searchControl.valueChanges.pipe(
    debounceTime(300),           // wait 300ms after last keystroke
    distinctUntilChanged(),      // ignore if same value as before
    filter(term => term.length >= 2),  // ignore short queries
    switchMap(term =>            // cancel previous request, start new one
        this.api.search(term).pipe(
            catchError(err => {
                this.error = err.message;
                return EMPTY;    // don't break the stream on error
            })
        )
    )
).subscribe(results => this.results = results);

// switchMap vs mergeMap vs concatMap vs exhaustMap — CRITICAL difference:
// switchMap:   cancels previous inner observable (use for search, autocomplete)
// mergeMap:    runs all concurrently (use for parallel fire-and-forget)
// concatMap:   queues, runs one at a time in order (use for ordered operations)
// exhaustMap:  ignores new emissions while inner is running (use for submit buttons)

// Submit button — prevent double submission:
this.submitBtn.clicks$.pipe(
    exhaustMap(() => this.api.submitOrder(this.form.value))
).subscribe(result => this.navigateToSuccess(result));
```

---

#### 13.2.3 Factory Pattern & Abstract Factory

**Level:** Intermediate

**C# Example:**
```csharp
// FACTORY METHOD — subclass decides which class to instantiate
public abstract class NotificationFactory
{
    public abstract INotification Create(string recipient);
    public void Send(string recipient, string message) => Create(recipient).Send(message);
}

public class EmailFactory : NotificationFactory
{
    public override INotification Create(string r) => new EmailNotification(r);
}
public class SmsFactory   : NotificationFactory
{
    public override INotification Create(string r) => new SmsNotification(r);
}

// SIMPLE FACTORY (not a GoF pattern but extremely common)
public static class NotificationFactory2
{
    public static INotification Create(NotificationType type, string recipient) => type switch
    {
        NotificationType.Email => new EmailNotification(recipient),
        NotificationType.Sms   => new SmsNotification(recipient),
        NotificationType.Push  => new PushNotification(recipient),
        _ => throw new ArgumentOutOfRangeException()
    };
}

// WITH DI — register multiple implementations and resolve by key
// services.AddKeyedScoped<INotification, EmailNotification>("email");
// services.AddKeyedScoped<INotification, SmsNotification>("sms");
// Then inject: IServiceProvider and call GetKeyedService<INotification>("email")
```

**TypeScript Example:**
```typescript
// Factory function (idiomatic TS)
interface Logger { log(msg: string): void; }

function createLogger(env: 'dev' | 'prod'): Logger {
    if (env === 'prod') return { log: (msg) => sendToDatadog(msg) };
    return { log: (msg) => console.log(`[DEV] ${msg}`) };
}

// ANGULAR: useFactory in providers
@NgModule({
    providers: [{
        provide: LoggerService,
        useFactory: (env: EnvironmentService) =>
            env.isProduction() ? new ProdLogger() : new DevLogger(),
        deps: [EnvironmentService]
    }]
})
```

---

#### 13.2.4 Decorator Pattern

**Level:** Intermediate

**Summary:** Add responsibilities to objects dynamically without modifying the original class. Not to be confused with TypeScript/Angular class decorators (which are metadata annotations).

**C# Example:**
```csharp
// Base interface
public interface IOrderRepository
{
    Task<Order> GetByIdAsync(int id);
}

// Real implementation
public class SqlOrderRepository : IOrderRepository
{
    public async Task<Order> GetByIdAsync(int id) { /* DB call */ return new Order(); }
}

// DECORATOR: adds caching without touching the original
public class CachedOrderRepository : IOrderRepository
{
    private readonly IOrderRepository _inner;
    private readonly IMemoryCache _cache;

    public CachedOrderRepository(IOrderRepository inner, IMemoryCache cache)
    {
        _inner = inner;
        _cache = cache;
    }

    public async Task<Order> GetByIdAsync(int id)
    {
        var key = $"order:{id}";
        if (_cache.TryGetValue(key, out Order? cached)) return cached!;

        var order = await _inner.GetByIdAsync(id);
        _cache.Set(key, order, TimeSpan.FromMinutes(5));
        return order;
    }
}

// DECORATOR: adds logging
public class LoggedOrderRepository : IOrderRepository
{
    private readonly IOrderRepository _inner;
    private readonly ILogger _log;
    public LoggedOrderRepository(IOrderRepository inner, ILogger<LoggedOrderRepository> log)
    { _inner = inner; _log = log; }

    public async Task<Order> GetByIdAsync(int id)
    {
        _log.LogInformation("Fetching order {Id}", id);
        var sw = Stopwatch.StartNew();
        var result = await _inner.GetByIdAsync(id);
        _log.LogInformation("Order {Id} fetched in {Ms}ms", id, sw.ElapsedMilliseconds);
        return result;
    }
}

// Compose decorators — registration order matters
// services.AddScoped<IOrderRepository>(sp =>
//     new LoggedOrderRepository(
//         new CachedOrderRepository(
//             new SqlOrderRepository(sp.GetRequiredService<DbContext>()),
//             sp.GetRequiredService<IMemoryCache>()),
//         sp.GetRequiredService<ILogger<LoggedOrderRepository>>()));

// Scrutor library makes this cleaner:
// services.AddScoped<IOrderRepository, SqlOrderRepository>();
// services.Decorate<IOrderRepository, CachedOrderRepository>();
// services.Decorate<IOrderRepository, LoggedOrderRepository>();
```

---

#### 13.2.5 Repository & Unit of Work Patterns

**Level:** Intermediate

**Summary:** Repository abstracts data access behind a collection-like interface. Unit of Work groups multiple repository operations into one atomic transaction.

**C# Example:**
```csharp
// GENERIC REPOSITORY
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}

public class EfRepository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _ctx;
    public EfRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<T?> GetByIdAsync(int id) => await _ctx.Set<T>().FindAsync(id);
    public async Task<IEnumerable<T>> GetAllAsync() => await _ctx.Set<T>().ToListAsync();
    public async Task AddAsync(T entity) => await _ctx.Set<T>().AddAsync(entity);
    public void Update(T entity) => _ctx.Set<T>().Update(entity);
    public void Delete(T entity) => _ctx.Set<T>().Remove(entity);
}

// UNIT OF WORK — wraps DbContext, coordinates multiple repositories
public interface IUnitOfWork : IDisposable
{
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    Task<int> CommitAsync();  // single SaveChangesAsync call
}

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _ctx;
    public IRepository<Order>     Orders     { get; }
    public IRepository<OrderItem> OrderItems { get; }

    public UnitOfWork(AppDbContext ctx)
    {
        _ctx = ctx;
        Orders     = new EfRepository<Order>(ctx);
        OrderItems = new EfRepository<OrderItem>(ctx);
    }

    public Task<int> CommitAsync() => _ctx.SaveChangesAsync();
    public void Dispose() => _ctx.Dispose();
}

// USAGE — atomic multi-repository operation
public class OrderService
{
    private readonly IUnitOfWork _uow;
    public OrderService(IUnitOfWork uow) => _uow = uow;

    public async Task PlaceOrderAsync(CreateOrderDto dto)
    {
        var order = new Order { CustomerId = dto.CustomerId, Total = dto.Total };
        await _uow.Orders.AddAsync(order);

        foreach (var item in dto.Items)
            await _uow.OrderItems.AddAsync(new OrderItem { OrderId = order.Id, ...item });

        await _uow.CommitAsync();  // ONE transaction — all or nothing
    }
}
```

---

### 13.3 DATABASE INTERNALS

---

#### 13.3.1 How Indexes Actually Work

**Level:** Basic → Deep

**Summary:** Indexes are separate data structures (B-Tree by default in SQL Server/PostgreSQL) that trade write performance and storage for dramatically faster reads. Choosing the wrong index strategy is the most common cause of slow SQL queries.

**Detail:**
```
B-TREE INDEX (default):
- Self-balancing tree, O(log n) search
- Leaf nodes contain: index key + pointer to actual row (Row ID / RID)
- Good for: equality (=), range (>, <, BETWEEN), ORDER BY, JOIN keys
- Clustered Index: the table IS the index — rows stored in key order (one per table)
- Non-Clustered: separate structure, leaf has pointer to clustered key or heap row

COVERING INDEX:
- INCLUDE columns that are not part of the key but are needed by the query
- Query can be satisfied entirely from the index without touching the base table (index scan)
- Example: CREATE INDEX idx_order_date ON Orders(CustomerId) INCLUDE (OrderDate, Total)

COMPOSITE INDEX:
- Index on multiple columns: (LastName, FirstName)
- Rule: leftmost prefix must be used for the index to activate
- WHERE LastName = 'Smith'           → uses index
- WHERE LastName = 'Smith' AND FirstName = 'John' → uses index
- WHERE FirstName = 'John'           → does NOT use index (no leftmost prefix)

WHEN INDEXES HURT:
- High-write tables (every INSERT/UPDATE/DELETE must update all indexes)
- Low-cardinality columns (Gender: M/F — index barely helps, full scan often faster)
- Implicit conversions: WHERE CAST(OrderDate AS DATE) = '2026-01-01' → index ignored!
- Too many indexes → optimizer confusion + maintenance overhead
```

**SQL Example:**
```sql
-- EXECUTION PLAN analysis (SQL Server)
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- BAD: Function on column prevents index use
SELECT * FROM Orders WHERE YEAR(OrderDate) = 2026;
-- GOOD: sargable (Search ARGument ABLE)
SELECT * FROM Orders WHERE OrderDate >= '2026-01-01' AND OrderDate < '2027-01-01';

-- COVERING INDEX example
-- Query: find all orders for a customer with total
SELECT OrderId, OrderDate, Total
FROM Orders
WHERE CustomerId = 42
ORDER BY OrderDate DESC;

-- Without covering index: seek on CustomerId, then Key Lookup to base table for OrderDate, Total
-- With covering index:
CREATE NONCLUSTERED INDEX idx_orders_customer
ON Orders (CustomerId)
INCLUDE (OrderDate, Total);  -- now satisfied entirely from index, no key lookup

-- COMPOSITE INDEX for a common filter
-- Query: active users in a region ordered by last login
SELECT UserId, Email, LastLogin
FROM Users
WHERE RegionId = 5 AND IsActive = 1
ORDER BY LastLogin DESC;

-- Index:
CREATE INDEX idx_users_region_active_login
ON Users (RegionId, IsActive, LastLogin DESC)
INCLUDE (Email);
-- Column order: most selective filter first, then equality, then range/sort

-- IDENTIFY missing indexes (SQL Server)
SELECT
    mid.statement AS TableName,
    migs.avg_user_impact AS AvgImpact,
    mid.equality_columns,
    mid.inequality_columns,
    mid.included_columns
FROM sys.dm_db_missing_index_details mid
JOIN sys.dm_db_missing_index_group_stats migs
    ON mid.index_handle = migs.group_handle
ORDER BY migs.avg_user_impact DESC;

-- IDENTIFY unused indexes (SQL Server)
SELECT OBJECT_NAME(i.object_id) AS TableName, i.name AS IndexName,
       ius.user_seeks, ius.user_scans, ius.user_lookups, ius.user_updates
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats ius ON i.object_id = ius.object_id
    AND i.index_id = ius.index_id AND ius.database_id = DB_ID()
WHERE OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1
  AND ius.user_seeks + ius.user_scans + ius.user_lookups = 0
ORDER BY ius.user_updates DESC;
```

**C# / .NET Core Example:**
```csharp
// Entity Framework — ensure indexes are defined in code
public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal Total { get; set; }
}

public class AppDbContext : DbContext
{
    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Order>(e => {
            e.HasIndex(o => o.CustomerId);  // simple index

            e.HasIndex(o => new { o.CustomerId, o.OrderDate })
             .IsDescending(false, true);    // composite with DESC on date

            // Covering index via HasIndex + IncludeProperties
            e.HasIndex(o => o.CustomerId)
             .IncludeProperties(o => new { o.OrderDate, o.Total });  // EF7+
        });
    }
}

// AVOID N+1 QUERY — the most common EF performance bug
// BAD:
var orders = await ctx.Orders.ToListAsync();    // 1 query
foreach (var order in orders)
{
    var items = await ctx.OrderItems            // N queries!
        .Where(i => i.OrderId == order.Id).ToListAsync();
}

// GOOD: eager load
var orders = await ctx.Orders
    .Include(o => o.Items)   // JOIN — 1 query
    .ToListAsync();

// GOOD for specific columns: projection
var summaries = await ctx.Orders
    .Where(o => o.CustomerId == 42)
    .Select(o => new { o.Id, o.OrderDate, ItemCount = o.Items.Count })
    .ToListAsync();  // single optimised SQL
```

---

#### 13.3.2 Transactions and Isolation Levels

**Level:** Intermediate → Deep

**Summary:** A transaction is an atomic unit of work (ACID). Isolation levels control what dirty/phantom data a transaction can see from concurrent transactions — understanding this is essential for preventing data corruption and diagnosing deadlocks.

**Detail:**
```
ACID:
  Atomicity   — all operations succeed, or none are applied (rollback)
  Consistency — database goes from one valid state to another
  Isolation   — concurrent transactions don't see each other's partial work
  Durability  — committed data survives crashes (written to disk log first)

ISOLATION LEVELS (weakest → strongest):
  READ UNCOMMITTED  — can read rows modified but not yet committed by other tx (dirty reads)
  READ COMMITTED    — only reads committed data (default in SQL Server/PostgreSQL)
                      but non-repeatable reads possible (row can change between two reads)
  REPEATABLE READ   — re-reading same row returns same data (row locked until tx commits)
                      but phantom reads possible (new rows can appear in range query)
  SERIALIZABLE      — full isolation. Range locks prevent phantom reads.
                      Highest consistency, lowest concurrency. Use carefully.
  SNAPSHOT          — reads a consistent snapshot at transaction start.
                      No read locks — writers don't block readers.
                      SQL Server: READ_COMMITTED_SNAPSHOT (RCSI) — enable per database
                      Best for read-heavy OLTP. Can cause update conflicts.

DEADLOCK:
  Tx A locks Row 1, waits for Row 2.
  Tx B locks Row 2, waits for Row 1.
  → circular wait → SQL Server kills one (the "deadlock victim")
  Prevention: always access resources in the same order; keep transactions short.
```

**SQL + C# Example:**
```sql
-- Explicit transaction in SQL
BEGIN TRANSACTION;
  UPDATE Accounts SET Balance = Balance - 100 WHERE AccountId = 1;
  UPDATE Accounts SET Balance = Balance + 100 WHERE AccountId = 2;
  -- If any error: ROLLBACK TRANSACTION
COMMIT TRANSACTION;

-- Set isolation level
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
  SELECT Balance FROM Accounts WHERE AccountId = 1;
  -- ... other work ...
COMMIT;

-- Optimistic concurrency with rowversion (prevent lost updates)
ALTER TABLE Orders ADD RowVer rowversion NOT NULL;

UPDATE Orders SET Status = 'Shipped', RowVer = DEFAULT
WHERE OrderId = 42
  AND RowVer = @originalRowVer;  -- fails if another tx modified it first

IF @@ROWCOUNT = 0
    THROW 50001, 'Concurrency conflict — order was modified', 1;
```

```csharp
// EF Core transactions
await using var tx = await ctx.Database.BeginTransactionAsync(
    IsolationLevel.ReadCommitted);
try
{
    ctx.Orders.Add(newOrder);
    ctx.Inventory.Update(updatedStock);
    await ctx.SaveChangesAsync();
    await tx.CommitAsync();
}
catch
{
    await tx.RollbackAsync();
    throw;
}

// OPTIMISTIC CONCURRENCY in EF Core
public class Order
{
    public int Id { get; set; }
    [Timestamp]  // maps to rowversion in SQL Server
    public byte[] RowVer { get; set; } = null!;
}
// EF will automatically include RowVer in UPDATE WHERE clause
// Throws DbUpdateConcurrencyException if rowcount = 0

// HANDLING concurrency conflict
try
{
    await ctx.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException ex)
{
    var entry = ex.Entries.Single();
    var dbValues = await entry.GetDatabaseValuesAsync();
    // Merge or show user a conflict resolution UI
    entry.OriginalValues.SetValues(dbValues!);
    await ctx.SaveChangesAsync();  // retry with refreshed values
}
```

---

#### 13.3.3 Query Execution Plans — Reading Them

**Level:** Intermediate

**Summary:** The execution plan is the database engine's step-by-step instructions for retrieving your data. Reading plans is the fastest way to understand why a query is slow.

**Key operators to know (SQL Server):**
```
Table Scan        — reads every row, no usable index. Almost always bad on large tables.
Index Seek        — jumps directly to matching rows using index. Fast. ✓
Index Scan        — reads all index pages. Better than Table Scan but may indicate missing filter.
Key Lookup        — extra step after Index Seek to fetch non-indexed columns from base table.
                    If you see many Key Lookups, add INCLUDE columns to the index.
Hash Match        — used for JOINs and GROUP BY when data is large. Builds hash table.
Nested Loops      — used for JOINs on small result sets. Fast when outer is small.
Sort              — expensive, blocking operation. Often avoidable with right index.
Parallelism       — query runs on multiple CPUs. Good for analytics, bad for OLTP.

Cost %            — relative cost of each operator. Focus on the most expensive first.
Estimated vs Actual rows — large discrepancy means stale statistics. Run UPDATE STATISTICS.
```

```sql
-- View estimated plan without running
SET SHOWPLAN_TEXT ON;
SELECT ... FROM ... WHERE ...;

-- View actual plan
SET STATISTICS PROFILE ON;
SELECT ... FROM ... WHERE ...;

-- Check for implicit conversions that kill indexes
-- Common: VARCHAR column compared to NVARCHAR parameter
SELECT * FROM Users WHERE Email = N'user@example.com';  -- N prefix = NVARCHAR
-- If Email is VARCHAR, this causes implicit conversion → index ignored!
-- Fix: ensure parameter type matches column type exactly

-- Find expensive queries in production (SQL Server)
SELECT TOP 20
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_us,
    qs.execution_count,
    SUBSTRING(qt.text, qs.statement_start_offset/2+1,
        (CASE qs.statement_end_offset WHEN -1 THEN LEN(qt.text)*2
         ELSE qs.statement_end_offset END - qs.statement_start_offset)/2+1) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_us DESC;
```

---

### 13.4 SECURITY CONCEPTS

---

#### 13.4.1 Authentication vs Authorisation

**Summary:** AuthN = "who are you?" (identity). AuthZ = "what are you allowed to do?" (permissions). They are distinct concerns — always implement both.

**C# / ASP.NET Core Example:**
```csharp
// AUTHENTICATION — verify identity, issue JWT
[HttpPost("login")]
public async Task<IActionResult> Login(LoginDto dto)
{
    var user = await _userService.ValidateCredentials(dto.Email, dto.Password);
    if (user is null) return Unauthorized();

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role),   // "Admin", "User", etc.
    };

    var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        issuer:   _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims:   claims,
        expires:  DateTime.UtcNow.AddMinutes(60),
        signingCredentials: creds);

    return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
}

// AUTHORISATION — [Authorize] attribute + policy
[Authorize]                          // any authenticated user
[Authorize(Roles = "Admin")]         // role-based
[Authorize(Policy = "CanEditOrders")] // policy-based (more flexible)

// Policy-based (preferred for complex rules):
builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("CanEditOrders", policy =>
        policy.RequireRole("Admin", "Manager")
              .RequireClaim("department", "sales", "ops"));
});

// RESOURCE-BASED authorisation (can this user edit THIS specific order?)
public class OrderAuthorizationHandler
    : AuthorizationHandler<EditOrderRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext ctx,
        EditOrderRequirement req,
        Order order)
    {
        var userId = int.Parse(ctx.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        if (order.CustomerId == userId || ctx.User.IsInRole("Admin"))
            ctx.Succeed(req);
        return Task.CompletedTask;
    }
}
```

**TypeScript/Angular Example:**
```typescript
// JWT storage — store in memory or httpOnly cookie, NOT localStorage
// localStorage is accessible to XSS attacks

// AUTH INTERCEPTOR
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        const token = this.auth.getToken();  // from memory, not localStorage
        if (!token) return next.handle(req);
        return next.handle(req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        }));
    }
}

// ROUTE GUARD — prevent unauthorised navigation
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (!this.auth.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }
        const requiredRole = route.data['role'];
        if (requiredRole && !this.auth.hasRole(requiredRole)) {
            this.router.navigate(['/forbidden']);
            return false;
        }
        return true;
    }
}
// Route config:
// { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { role: 'Admin' } }
```

---

#### 13.4.2 JWT — How It Works Internally

**Level:** Basic → Intermediate

**Summary:** A JWT is a signed token with three Base64URL-encoded parts: Header.Payload.Signature. The signature is verified server-side — understand what this means for security.

**Detail:**
```
HEADER:   { "alg": "HS256", "typ": "JWT" }           → base64url encoded
PAYLOAD:  { "sub": "42", "role": "Admin", "exp": ... } → base64url encoded (NOT encrypted!)
SIGNATURE: HMACSHA256(base64(header) + "." + base64(payload), secretKey)

The payload is READABLE by anyone — never put sensitive data in JWT claims.
The signature can only be verified (and forged) by whoever has the secretKey.

KEY POINTS:
- JWTs are stateless — server doesn't store sessions (scalable, but can't be revoked easily)
- Expiry (exp claim) is the only built-in revocation mechanism
- If secret key is compromised, ALL tokens are compromised
- Use RS256 (asymmetric) in production: private key signs, public key verifies
  → even if public key leaks, can't forge tokens

REFRESH TOKEN PATTERN:
- Access token: short-lived (15min), stored in memory
- Refresh token: long-lived (7 days), stored in httpOnly cookie
- When access token expires, call /auth/refresh with refresh token cookie
- Refresh token can be rotated (each use issues a new one) for security
```

---

#### 13.4.3 OWASP Top 10 — Practical Mitigations

**Level:** Intermediate

Each entry below should render as a card with: threat, how it happens, mitigation, and code example.

```
A01 Broken Access Control
  Threat: User accesses resources they're not authorized for
  Example: GET /api/orders/999 — returns another user's order because only auth checked, not ownership
  Fix: Always check resource ownership. Use resource-based authorization (see Section 13.4.1).
  Code: if (order.CustomerId != currentUserId && !User.IsInRole("Admin")) return Forbid();

A02 Cryptographic Failures
  Threat: Sensitive data stored/transmitted without encryption
  Fix: HTTPS everywhere. Hash passwords with BCrypt/Argon2 (NOT SHA256/MD5).
  Code (C#): BCrypt.Net.BCrypt.HashPassword(plaintext, workFactor: 12)
             BCrypt.Net.BCrypt.Verify(plaintext, hash)

A03 Injection (SQL, LDAP, OS command)
  Threat: User input interpreted as code
  BAD SQL:  "SELECT * FROM Users WHERE Name = '" + input + "'"  → SQL injection
  GOOD:     ctx.Users.Where(u => u.Name == input)  // EF parameterises automatically
  Raw SQL:  ctx.Database.ExecuteSqlRaw("SELECT * FROM Users WHERE Name = {0}", input)
            NOT: ExecuteSqlRaw($"... WHERE Name = '{input}'")  // vulnerable!

A05 Security Misconfiguration
  Fix in .NET Core:
  - Remove default error pages in prod (app.UseExceptionHandler("/error"))
  - Disable directory browsing
  - Remove X-Powered-By headers
  - Use Content Security Policy headers
  app.UseHsts(); // HTTP Strict Transport Security
  app.UseXContentTypeOptions();
  app.UseReferrerPolicy(opts => opts.NoReferrer());

A07 Identification and Authentication Failures
  - Implement rate limiting on login endpoint (prevent brute force)
  - Lock accounts after N failed attempts
  - Enforce MFA for admin roles
  Code: services.AddRateLimiter(o => o.AddFixedWindowLimiter("login",
      opts => { opts.PermitLimit = 5; opts.Window = TimeSpan.FromMinutes(1); }));

A09 Security Logging and Monitoring Failures
  - Log all authentication events (success + failure) with IP
  - Log all access control failures
  - Never log passwords, tokens, or PII
  Code: _logger.LogWarning("Failed login attempt for {Email} from {IP}", email, ip);
```

---

### 13.5 RXJS — DEEP REFERENCE

---

#### 13.5.1 Hot vs Cold Observables

**Level:** Intermediate → Deep

**Summary:** Cold observables create a new producer per subscriber (HTTP calls, timers). Hot observables share one producer across all subscribers (mouse events, WebSocket, Subject). Mixing them up causes duplicate API calls or missed events.

```typescript
// COLD — new execution per subscriber (each subscriber gets full sequence from start)
const cold$ = new Observable(observer => {
    console.log('HTTP call made');  // runs ONCE PER SUBSCRIBER
    setTimeout(() => {
        observer.next(Math.random());
        observer.complete();
    }, 1000);
});

cold$.subscribe(v => console.log('Sub1:', v));  // logs "HTTP call made", gets value X
cold$.subscribe(v => console.log('Sub2:', v));  // logs "HTTP call made" AGAIN, gets value Y
// Two separate executions — different values!

// HOT — single producer, subscribers tap in (and miss events before subscription)
const hot$ = fromEvent(document, 'click');  // one event stream, all subscribers share it
// BehaviorSubject — hot, remembers last value
const state$ = new BehaviorSubject<number>(0);
state$.subscribe(v => console.log('Sub1:', v));  // gets 0 immediately (current value)
state$.next(1);
state$.subscribe(v => console.log('Sub2:', v));  // gets 1 (last emitted value)

// MAKING COLD HOT — share/shareReplay
const apiCall$ = this.http.get('/api/data').pipe(
    shareReplay(1)  // first subscriber triggers the call,
                    // all subsequent subscribers get the cached last value
                    // HTTP call made exactly ONCE regardless of subscriber count
);
// Multiple components can subscribe — only one HTTP request!
```

---

#### 13.5.2 Essential Operators Reference

```typescript
// TRANSFORMATION
map(x => x * 2)                      // transform each emission
pluck('name')                        // extract property (deprecated, use map)
scan((acc, val) => acc + val, 0)     // running accumulation (like Array.reduce but streaming)
reduce((acc, val) => acc + val, 0)   // final accumulated value on complete (cold only)
buffer(interval(1000))               // collect emissions for 1s, emit as array

// FILTERING
filter(x => x > 0)
take(5)               // complete after 5 emissions
skip(3)               // ignore first 3
debounceTime(300)     // emit only after 300ms silence (search input)
throttleTime(1000)    // emit at most once per second (scroll events)
distinctUntilChanged()  // suppress consecutive duplicate values
distinctUntilChanged((a, b) => a.id === b.id)  // custom comparator

// COMBINATION
combineLatest([a$, b$])   // emits [latestA, latestB] whenever EITHER emits
                          // waits for both to emit at least once
forkJoin([a$, b$])        // waits for BOTH to complete, emits [lastA, lastB]
                          // like Promise.all for observables
zip([a$, b$])             // pairs emissions by index: [a[0],b[0]], [a[1],b[1]]
merge(a$, b$)             // interleaves emissions from both, passes through all
concat(a$, b$)            // subscribes to b$ only when a$ completes (sequential)
withLatestFrom(b$)        // when a$ emits, attach latest value from b$
                          // unlike combineLatest: only triggers on a$

// FLATTENING (inner observable management)
switchMap(x => api.get(x))    // cancel previous, start new (typeahead, navigation)
mergeMap(x => api.get(x))     // run all concurrently (parallel requests)
concatMap(x => api.get(x))    // queue, run one at a time (ordered processing)
exhaustMap(x => api.post(x))  // ignore while busy (submit buttons, login)

// ERROR HANDLING
catchError(err => of(defaultValue))  // recover with a default
catchError(err => throwError(() => new CustomError(err)))  // re-throw as different error
retry(3)                             // retry up to 3 times on error
retryWhen(errors => errors.pipe(delay(1000), take(3)))  // retry with delay
finalize(() => this.loading = false)  // always runs on complete OR error (like finally)

// LIFECYCLE / UTILITIES
tap(x => console.log(x))     // side-effects without modifying stream
startWith(0)                  // prepend an initial value
delay(500)                    // delay all emissions by 500ms
timeout(5000)                 // error if no emission within 5s
share()                       // multicast, unsubscribe when no subscribers
shareReplay(1)                // multicast + cache last N values for late subscribers
```

---

#### 13.5.3 RxJS in Angular — Common Patterns

```typescript
// PATTERN 1: Async pipe — subscribe in template, auto-unsubscribe
@Component({
    template: `
        <div *ngIf="user$ | async as user">{{ user.name }}</div>
        <li *ngFor="let item of items$ | async">{{ item.name }}</li>
    `
})
export class ProfileComponent {
    user$  = this.userService.currentUser$;   // no subscribe(), no ngOnDestroy needed
    items$ = this.itemService.getAll();
}

// PATTERN 2: Combine multiple streams for a "view model"
@Component({...})
export class DashboardComponent {
    vm$ = combineLatest({
        user:   this.authService.user$,
        orders: this.orderService.getOrders(),
        stats:  this.statsService.getDashboardStats()
    }).pipe(
        map(({ user, orders, stats }) => ({
            greeting: `Hello, ${user.name}`,
            orderCount: orders.length,
            revenue: stats.totalRevenue
        }))
    );
    // Template: *ngIf="vm$ | async as vm"
}

// PATTERN 3: Reactive form + live validation
this.form.get('username')!.valueChanges.pipe(
    debounceTime(400),
    distinctUntilChanged(),
    switchMap(username => this.api.checkUsernameAvailable(username)),
    takeUntilDestroyed(this.destroyRef)
).subscribe(available => {
    this.usernameAvailable = available;
});

// PATTERN 4: Global error handling
@Injectable()
export class GlobalErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) this.auth.logout();
                if (err.status >= 500) this.toast.error('Server error. Please try again.');
                return throwError(() => err);
            })
        );
    }
}
```

---

### 13.6 ASP.NET CORE INTERNALS

---

#### 13.6.1 Middleware Pipeline

**Level:** Basic → Intermediate

**Summary:** Every HTTP request in ASP.NET Core flows through a pipeline of middleware components. Order matters critically. Understanding this explains how auth, CORS, compression, error handling, and routing actually work.

```
Request →  [ExceptionHandler] → [HSTS] → [HTTPS Redirect] → [Static Files]
        →  [Routing] → [CORS] → [Authentication] → [Authorization]
        →  [Endpoint (Controller/Minimal API)]
Response ← (flows back through same chain in reverse)
```

**C# Example:**
```csharp
var app = builder.Build();

// CRITICAL ORDER:
app.UseExceptionHandler("/error");  // MUST be first — catches exceptions from all below
app.UseHsts();                       // before HTTPS redirect
app.UseHttpsRedirection();
app.UseStaticFiles();                // before routing — short-circuits for static files
app.UseRouting();                    // marks where route is evaluated
app.UseCors("AllowFrontend");        // after routing, before auth
app.UseAuthentication();             // BEFORE authorization
app.UseAuthorization();              // after authentication
app.MapControllers();                // endpoint execution

// CUSTOM MIDDLEWARE
app.Use(async (context, next) =>
{
    // Before endpoint:
    context.Response.Headers["X-Request-Id"] = Guid.NewGuid().ToString();
    var sw = Stopwatch.StartNew();

    await next(context);  // call next middleware

    // After endpoint (response on the way back):
    sw.Stop();
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("{Method} {Path} → {Status} in {Ms}ms",
        context.Request.Method, context.Request.Path,
        context.Response.StatusCode, sw.ElapsedMilliseconds);
});

// SHORT-CIRCUIT middleware (no next call):
app.Use(async (context, next) =>
{
    if (context.Request.Headers["X-Maintenance-Key"] != "secret123")
    {
        context.Response.StatusCode = 503;
        await context.Response.WriteAsync("Under maintenance");
        return;  // does NOT call next — pipeline ends here
    }
    await next(context);
});
```

---

#### 13.6.2 Dependency Injection Lifetimes

**Level:** Basic → Intermediate

**Summary:** The three DI lifetimes control how long an instance lives and whether it's shared. Choosing wrong causes subtle bugs, memory leaks, or thread safety issues.

```
Singleton  — ONE instance for entire app lifetime.
             Created on first request or at startup. Never disposed (unless app shuts down).
             Use for: stateless services, caches, heavy-init services (e.g., HttpClient)
             Danger: if it depends on a Scoped service → Captive Dependency bug

Scoped     — ONE instance per HTTP request (per scope).
             Disposed at end of request.
             Default for: DbContext, repositories, services with per-request state
             Danger: NOT thread-safe within a single request if shared across async branches

Transient  — NEW instance every time it's requested from DI.
             Disposed at end of scope if IDisposable.
             Use for: lightweight stateless services
             Danger: if injected into Singleton → same instance captured forever (leak!)
```

**C# Example:**
```csharp
// CAPTIVE DEPENDENCY — common bug
builder.Services.AddSingleton<ReportCache>();   // Singleton
builder.Services.AddScoped<IOrderRepository, EfOrderRepository>(); // Scoped

// ReportCache constructor injects IOrderRepository:
public class ReportCache
{
    private readonly IOrderRepository _repo;  // SCOPED injected into SINGLETON!
    public ReportCache(IOrderRepository repo) => _repo = repo;
    // _repo is the FIRST request's repository, reused forever → stale DbContext!
}

// FIX: inject IServiceScopeFactory and create scope manually
public class ReportCache
{
    private readonly IServiceScopeFactory _scopeFactory;
    public ReportCache(IServiceScopeFactory sf) => _scopeFactory = sf;

    public async Task<Report> GetReportAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
        return await repo.BuildReportAsync();
    }
}

// REGISTRATION patterns
builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IOrderRepository, EfOrderRepository>();
builder.Services.AddTransient<IValidator<OrderDto>, OrderDtoValidator>();

// Register with factory (conditional)
builder.Services.AddSingleton<ICacheProvider>(sp =>
    builder.Configuration["Cache:Provider"] == "Redis"
        ? new RedisCacheProvider(sp.GetRequiredService<IConnectionMultiplexer>())
        : new MemoryCacheProvider());

// Keyed services (.NET 8+)
builder.Services.AddKeyedScoped<IPaymentGateway, StripeGateway>("stripe");
builder.Services.AddKeyedScoped<IPaymentGateway, PayPalGateway>("paypal");
// Inject: [FromKeyedServices("stripe")] IPaymentGateway gateway
```

---

#### 13.6.3 Minimal APIs vs Controllers

```csharp
// MINIMAL API (good for microservices, simple CRUD)
var app = builder.Build();

app.MapGet("/orders/{id}", async (int id, IOrderRepository repo) =>
{
    var order = await repo.GetByIdAsync(id);
    return order is null ? Results.NotFound() : Results.Ok(order);
})
.WithName("GetOrder")
.WithOpenApi()
.RequireAuthorization()
.Produces<Order>(200)
.Produces(404);

// Group endpoints
var orders = app.MapGroup("/orders").RequireAuthorization();
orders.MapGet("/",    (IOrderRepository r) => r.GetAllAsync());
orders.MapPost("/",   (CreateOrderDto dto, IOrderService svc) => svc.CreateAsync(dto));
orders.MapDelete("{id}", (int id, IOrderService svc) => svc.DeleteAsync(id));

// CONTROLLER (good for complex apps, when filters/model binding needed heavily)
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Order), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id, [FromServices] IOrderRepository repo)
    {
        var order = await repo.GetByIdAsync(id);
        return order is null ? NotFound() : Ok(order);
    }
}
```

---

### 13.7 ANGULAR INTERNALS

---

#### 13.7.1 Component Lifecycle — Full Reference

**Level:** Basic → Deep

```typescript
@Component({ selector: 'app-example', template: '...' })
export class ExampleComponent implements
    OnChanges, OnInit, DoCheck,
    AfterContentInit, AfterContentChecked,
    AfterViewInit, AfterViewChecked,
    OnDestroy
{
    @Input() data!: any;

    // 1. CONSTRUCTOR — DI injection only. NO template access. NO @Input values yet.
    constructor(private service: MyService) {
        // Do NOT call service methods here — too early
    }

    // 2. ngOnChanges — called before OnInit, then every time @Input changes
    // SimpleChanges holds { currentValue, previousValue, firstChange }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && !changes['data'].firstChange) {
            this.processData(changes['data'].currentValue);
        }
    }

    // 3. ngOnInit — @Inputs are set. Use for: HTTP calls, subscriptions, init logic
    ngOnInit() {
        this.service.getData().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(d => this.items = d);
    }

    // 4. ngDoCheck — runs every change detection cycle (can be VERY frequent!)
    // Use sparingly — only when you need custom dirty-checking
    ngDoCheck() {
        // Expensive! Runs on EVERY CD cycle for the entire app if Default strategy
    }

    // 5. ngAfterContentInit — projected content (<ng-content>) is initialized
    // 6. ngAfterContentChecked — after projected content is checked
    ngAfterContentInit() { /* access @ContentChild here */ }

    // 7. ngAfterViewInit — component's OWN view (and child views) fully initialized
    // Use for: accessing ViewChild, DOM manipulation, third-party lib init
    ngAfterViewInit() { /* access @ViewChild here */ }

    // 8. ngAfterViewChecked — after every CD cycle for the view
    // Runs frequently — avoid heavy operations here

    // 9. ngOnDestroy — cleanup BEFORE component removed from DOM
    // Use for: unsubscribing, clearing timers, disconnecting observers
    ngOnDestroy() {
        this.resizeObserver?.disconnect();
        clearInterval(this.timer);
        // Subscriptions handled by takeUntilDestroyed — no manual unsubscription needed
    }
}
```

---

#### 13.7.2 Change Detection — Default vs OnPush

**Level:** Intermediate → Deep

**Summary:** Change detection (CD) is how Angular decides when to update the DOM. The Default strategy checks everything on every event. OnPush is a performance optimisation that only checks when inputs change or an Observable emits.

```typescript
// DEFAULT strategy — CD runs for ALL components in the tree on:
// - Any browser event (click, input, mousemove...)
// - Any async operation completing (HTTP, setTimeout, Promise)
// - Manually triggered

// ONPUSH strategy — CD runs for a component ONLY when:
// 1. An @Input reference changes (not mutation!)
// 2. An Observable used with async pipe emits
// 3. An event inside THIS component fires
// 4. markForCheck() or detectChanges() is called manually

@Component({
    selector: 'app-item-list',
    changeDetection: ChangeDetectionStrategy.OnPush,  // opt-in
    template: `<li *ngFor="let item of items">{{ item.name }}</li>`
})
export class ItemListComponent {
    @Input() items!: Item[];  // MUST pass new array reference for CD to fire

    constructor(private cdr: ChangeDetectorRef) {}

    // When you need to trigger CD manually (e.g., after setTimeout callback):
    updateFromExternalSource() {
        // Option 1: mark this component + ancestors for checking
        this.cdr.markForCheck();

        // Option 2: run CD immediately for this component's subtree only
        this.cdr.detectChanges();
    }
}

// PARENT — must create new array references for OnPush children
@Component({...})
export class ParentComponent {
    items: Item[] = [];

    addItem(item: Item) {
        // WRONG: mutation — OnPush child won't re-render
        this.items.push(item);

        // CORRECT: new reference
        this.items = [...this.items, item];
    }

    updateItem(index: number, newItem: Item) {
        // WRONG:
        this.items[index] = newItem;

        // CORRECT:
        this.items = this.items.map((item, i) => i === index ? newItem : item);
    }
}

// SIGNALS (Angular 17+) — the future of change detection
import { signal, computed, effect } from '@angular/core';

@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class SignalsComponent {
    count = signal(0);
    doubled = computed(() => this.count() * 2);  // auto-tracks dependencies

    increment() {
        this.count.update(v => v + 1);  // triggers fine-grained update, no markForCheck needed
    }

    constructor() {
        effect(() => {
            console.log('Count changed to:', this.count());  // runs on every count change
        });
    }
}
```

---

#### 13.7.3 Angular Routing — Guards, Resolvers, Lazy Loading

```typescript
// ROUTES with all features
const routes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],        // prevent access if not logged in
        canDeactivate: [UnsavedChangesGuard],  // warn before leaving dirty form
        resolve: { data: DashboardResolver },   // pre-load data before component init
        data: { roles: ['Admin', 'Manager'] }
    },
    {
        path: 'admin',
        canActivate: [AuthGuard],
        canMatch: [AdminModuleGuard],  // prevent lazy module from loading (Angular 14+)
        loadChildren: () =>            // LAZY LOADING — module loaded on demand
            import('./admin/admin.module').then(m => m.AdminModule)
    },
    // Standalone component lazy loading (Angular 15+)
    {
        path: 'reports',
        loadComponent: () =>
            import('./reports/reports.component').then(c => c.ReportsComponent)
    }
];

// RESOLVER — pre-fetch data, available in component via ActivatedRoute
@Injectable({ providedIn: 'root' })
export class DashboardResolver implements Resolve<DashboardData> {
    constructor(private api: ApiService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<DashboardData> {
        return this.api.getDashboardData();
        // Router waits for this to complete before activating the component
        // Component gets data immediately in ngOnInit — no loading state needed
    }
}

// Access in component:
ngOnInit() {
    this.data = this.route.snapshot.data['data'];  // pre-fetched by resolver
}
```

---

### 13.8 PERFORMANCE & CACHING — COMPREHENSIVE

---

#### 13.8.1 Caching Strategies — Decision Framework

**Level:** Intermediate → Deep

```
CHOOSE YOUR STRATEGY based on:
  Data change frequency   → static / slow / medium / fast / real-time
  Data scope              → global (same for all users) / user-specific
  Tolerable staleness     → 0s / seconds / minutes / hours / days
  Data size               → KB / MB / GB
  Where to cache          → browser / CDN / API gateway / application / database

STRATEGIES:
  Cache-Aside (Lazy Loading)
    → App checks cache first. On miss, load from DB, populate cache.
    → Best for: read-heavy, tolerable staleness, unpredictable access patterns
    → Risk: cache stampede on cold start (many concurrent misses → DB overwhelmed)
    → Fix: probabilistic early expiration or cache lock/mutex

  Write-Through
    → Write to cache AND DB synchronously on every write.
    → Data always fresh in cache. Extra write latency.
    → Best for: write-intensive with immediate read consistency requirement

  Write-Behind (Write-Back)
    → Write to cache immediately, DB updated asynchronously.
    → Fast writes. Risk: data loss if cache fails before DB write.

  Read-Through
    → Cache handles all reads. On miss, cache fetches from DB automatically.
    → Shifts complexity to cache layer.

  Time-To-Live (TTL)
    → Every cached item expires after N seconds. Simple.
    → Risk: thundering herd at expiry moment if many clients hit simultaneously.

  Cache-Control Headers (HTTP)
    → Browser and CDN caching. Zero load on your server.
    → max-age: how long browser can serve from its own cache without asking server
    → s-maxage: CDN-specific max-age
    → no-cache: revalidate with server on every request (use ETags)
    → no-store: never cache (sensitive data)
    → stale-while-revalidate: serve stale while fetching fresh in background

CACHE INVALIDATION (the hard problem):
  Time-based   → TTL. Simple. Data can be stale for up to TTL duration.
  Event-based  → invalidate cache key on write. Fresh. More complex.
  Version tags → add a version to the cache key, increment on change.
  Cache-busting → include content hash in URL (CSS/JS files, CDN assets)
```

**C# / ASP.NET Core Example:**
```csharp
// MEMORY CACHE — in-process, single server
// Registration:
builder.Services.AddMemoryCache();

// Usage:
public class ProductService
{
    private readonly IMemoryCache _cache;
    private readonly IProductRepository _repo;

    public async Task<Product?> GetByIdAsync(int id)
    {
        var key = $"product:{id}";

        if (_cache.TryGetValue(key, out Product? product)) return product;

        product = await _repo.GetByIdAsync(id);
        if (product is null) return null;

        _cache.Set(key, product, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
            SlidingExpiration = TimeSpan.FromMinutes(2),  // reset TTL on each access
            Priority = CacheItemPriority.Normal,
            Size = 1  // for size-limited caches
        });

        return product;
    }

    public async Task InvalidateAsync(int id)
    {
        _cache.Remove($"product:{id}");
        await _repo.UpdateAsync(id, ...);
    }
}

// DISTRIBUTED CACHE — Redis (scales across multiple servers)
builder.Services.AddStackExchangeRedisCache(opts =>
{
    opts.Configuration = builder.Configuration["Redis:ConnectionString"];
    opts.InstanceName = "myapp:";
});

public class DistributedProductService
{
    private readonly IDistributedCache _cache;

    public async Task<Product?> GetAsync(int id)
    {
        var key = $"product:{id}";
        var cached = await _cache.GetStringAsync(key);

        if (cached is not null)
            return JsonSerializer.Deserialize<Product>(cached);

        var product = await _repo.GetByIdAsync(id);
        if (product is null) return null;

        await _cache.SetStringAsync(key,
            JsonSerializer.Serialize(product),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            });

        return product;
    }
}

// RESPONSE CACHING — cache entire HTTP responses at middleware level
builder.Services.AddResponseCaching();
app.UseResponseCaching();

[HttpGet("{id}")]
[ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "id" })]
public async Task<IActionResult> GetProduct(int id) { ... }

// OUTPUT CACHING (.NET 7+) — more powerful than ResponseCaching
builder.Services.AddOutputCache(opts =>
{
    opts.AddPolicy("products", b => b.Expire(TimeSpan.FromMinutes(5))
                                      .Tag("products"));  // tag-based invalidation
});
app.UseOutputCache();

[HttpGet]
[OutputCache(PolicyName = "products")]
public async Task<IActionResult> GetProducts() { ... }

// Invalidate by tag when data changes:
[HttpPost]
public async Task<IActionResult> CreateProduct(CreateProductDto dto,
    IOutputCacheStore cache, CancellationToken ct)
{
    await _service.CreateAsync(dto);
    await cache.EvictByTagAsync("products", ct);  // invalidate all "products" responses
    return Created(...);
}

// CACHE STAMPEDE PREVENTION — SemaphoreSlim lock
private readonly SemaphoreSlim _lock = new(1, 1);

public async Task<Product?> GetWithLockAsync(int id)
{
    var key = $"product:{id}";
    if (_cache.TryGetValue(key, out Product? p)) return p;

    await _lock.WaitAsync();
    try
    {
        // Double-check after acquiring lock (another thread may have populated)
        if (_cache.TryGetValue(key, out p)) return p;

        p = await _repo.GetByIdAsync(id);
        _cache.Set(key, p, TimeSpan.FromMinutes(10));
        return p;
    }
    finally { _lock.Release(); }
}
```

**TypeScript/Angular Example:**
```typescript
// HTTP CACHING — use shareReplay to prevent duplicate requests
@Injectable({ providedIn: 'root' })
export class ProductService {
    private cache = new Map<number, Observable<Product>>();

    getProduct(id: number): Observable<Product> {
        if (!this.cache.has(id)) {
            this.cache.set(id,
                this.http.get<Product>(`/api/products/${id}`).pipe(
                    shareReplay(1),       // cache the result, share across subscribers
                    catchError(err => {
                        this.cache.delete(id);  // remove failed cache entry
                        return throwError(() => err);
                    })
                )
            );
        }
        return this.cache.get(id)!;
    }

    invalidate(id: number): void {
        this.cache.delete(id);
    }
}

// MEMOISATION — cache pure function results
function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: unknown[]) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn(...args) as ReturnType<T>;
        cache.set(key, result);
        return result;
    }) as T;
}
const expensiveCalc = memoize((n: number) => n * n * Math.PI);

// VIRTUAL SCROLLING — don't render thousands of DOM nodes
// Angular CDK:
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
    template: `
        <cdk-virtual-scroll-viewport itemSize="50" style="height: 400px">
            <div *cdkVirtualFor="let item of items">{{ item.name }}</div>
        </cdk-virtual-scroll-viewport>
    `
})
// Only renders ~10 rows at a time regardless of list size

// LAZY LOADING IMAGES — Intersection Observer
@Directive({ selector: 'img[lazyLoad]' })
export class LazyLoadDirective implements AfterViewInit, OnDestroy {
    private observer!: IntersectionObserver;

    constructor(private el: ElementRef<HTMLImageElement>) {}

    ngAfterViewInit() {
        this.observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                const img = this.el.nativeElement;
                img.src = img.dataset['src']!;  // <img lazyLoad data-src="real-url.jpg">
                this.observer.disconnect();
            }
        });
        this.observer.observe(this.el.nativeElement);
    }

    ngOnDestroy() { this.observer.disconnect(); }
}

// TRACKBY — prevent Angular from destroying/recreating DOM nodes on list changes
@Component({
    template: `
        <li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>
    `
})
export class ListComponent {
    trackById = (index: number, item: Item) => item.id;
    // Without trackBy: Angular destroys all <li> and recreates on any array change
    // With trackBy: only adds/removes/moves the actually changed items
}
```

---

#### 13.8.2 SQL Query Performance — Real-World Techniques

```sql
-- 1. USE PAGINATION — never SELECT * with no LIMIT on large tables
-- BAD:
SELECT * FROM Orders WHERE CustomerId = 42;  -- 10,000 rows returned

-- GOOD: Keyset pagination (faster than OFFSET for large pages)
SELECT TOP 20 OrderId, OrderDate, Total
FROM Orders
WHERE CustomerId = 42
  AND OrderId > @lastSeenId   -- continue from where we left off
ORDER BY OrderId;

-- OFFSET pagination (simpler but slower for large offsets):
SELECT OrderId, OrderDate, Total
FROM Orders
WHERE CustomerId = 42
ORDER BY OrderDate DESC
OFFSET 40 ROWS FETCH NEXT 20 ROWS ONLY;

-- 2. AVOID SELECT * — select only columns you need
-- BAD: SELECT * causes extra Key Lookups, transfers unnecessary data
-- GOOD:
SELECT OrderId, OrderDate, Total FROM Orders WHERE CustomerId = 42;

-- 3. BATCH INSERTS — single INSERT faster than N individual INSERTs
INSERT INTO AuditLog (UserId, Action, Timestamp)
VALUES (1, 'Login', GETUTCDATE()),
       (2, 'Logout', GETUTCDATE()),
       (3, 'Purchase', GETUTCDATE());  -- single round trip

-- 4. INDEXED VIEWS (materialised query results)
CREATE VIEW vw_OrderSummaryByCustomer WITH SCHEMABINDING AS
SELECT CustomerId, COUNT_BIG(*) AS OrderCount, SUM(Total) AS TotalSpend
FROM dbo.Orders
GROUP BY CustomerId;

CREATE UNIQUE CLUSTERED INDEX idx_vw_orders ON vw_OrderSummaryByCustomer (CustomerId);
-- Now: SELECT * FROM vw_OrderSummaryByCustomer WHERE CustomerId = 42 → instant!

-- 5. TEMP TABLES vs CTEs vs Subqueries
-- CTE: readability, NOT performance (inline, re-evaluated each reference)
-- Temp table: materialized, can be indexed, good for multi-reference
-- Subquery: fine for single-use

-- Use temp table when:
CREATE TABLE #SalesData (CustomerId INT, Total DECIMAL(18,2));
INSERT INTO #SalesData
SELECT CustomerId, SUM(Total) FROM Orders WHERE OrderDate >= '2026-01-01' GROUP BY CustomerId;
CREATE INDEX idx_tmp ON #SalesData (CustomerId);  -- index the temp table!
-- Now join #SalesData efficiently multiple times in the query

-- 6. STRING_AGG for concatenation (avoid cursor/loop)
SELECT CustomerId,
       STRING_AGG(CAST(OrderId AS VARCHAR), ', ') WITHIN GROUP (ORDER BY OrderDate)
FROM Orders GROUP BY CustomerId;
```

---

#### 13.8.3 HTTP & API Performance

```csharp
// HTTP COMPRESSION — gzip/brotli responses
builder.Services.AddResponseCompression(opts => {
    opts.EnableForHttps = true;  // safe when not mixing sensitive data with controlled input
    opts.Providers.Add<BrotliCompressionProvider>();
    opts.Providers.Add<GzipCompressionProvider>();
});
builder.Services.Configure<BrotliCompressionProviderOptions>(o =>
    o.Level = CompressionLevel.Fastest);

// HTTPCONTEXT MINIATURE — avoid reading body twice
// If you need body in middleware AND controller: buffer it
app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();  // allows re-reading body
    await next(context);
});

// MINIMAL SERIALISATION — use System.Text.Json source generation for AOT perf
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(List<ProductDto>))]
public partial class AppJsonContext : JsonSerializerContext { }
// 3-5x faster than reflection-based + AOT compatible

// PAGINATION response with metadata
public record PagedResult<T>(IEnumerable<T> Items, int Total, int Page, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
    public bool HasNext => Page < TotalPages;
    public bool HasPrevious => Page > 1;
}
```

---

## 14. UPDATED IMPLEMENTATION ORDER

The original Section 11 is superseded by this complete order:

1. **Section 6** — Toast + Modal system
2. **Section 1** — Security warnings + data clearing
3. **Section 2** — Parser improvements
4. **Section 8.4** — Error boundaries
5. **Section 13.0** — Knowledge Base page scaffolding (nav + section + card renderer)
6. **Section 13.1** — Language Internals entries (data in app.js)
7. **Section 13.2** — Design Patterns entries
8. **Section 13.3** — Database Internals entries
9. **Section 13.4** — Security Concepts entries
10. **Section 13.5** — RxJS entries
11. **Section 13.6** — ASP.NET Core entries
12. **Section 13.7** — Angular Internals entries
13. **Section 13.8** — Performance & Caching entries
14. **Section 3.1** — JSON/YAML extra buttons
15. **Section 3.2** — Snippet export/import
16. **Section 5.1** — Page transitions
17. **Section 5.3** — Sidebar collapse
18. **Section 5.8** — Theme toggle
19. **Section 3.4** — Expanded command library
20. **Section 3.3** — Workflow connections
21. **Section 7** — New tools (Diff, Markdown, Color)
22. **Section 3.6** — LLM Playground improvements
23. **Section 5.2** — Keyboard shortcuts
24. Everything else in Sections 4, 5, 9

---

## 15. UPDATED VERIFICATION CHECKLIST

All original checks from Section 12 still apply, plus:

- [ ] Knowledge Base page loads — all 8 filter categories render correct cards
- [ ] Search in Knowledge Base filters cards by title and tags correctly
- [ ] Clicking any knowledge card expands inline with C# and TypeScript tabs — both tabs show correct code
- [ ] Clicking a different tab on code example switches the displayed code block
- [ ] "Language Internals" filter shows only Stack/Heap, Value/Ref, Static, GC cards
- [ ] "RxJS" filter shows only RxJS cards with TypeScript examples
- [ ] "Performance & Caching" cards show both C# and Angular examples with real code
- [ ] "Angular" filter includes lifecycle, OnPush, routing cards
- [ ] "ASP.NET Core" filter includes middleware, DI, minimal API cards
- [ ] "Database" filter includes indexes, transactions, query plan cards
- [ ] "Design Patterns" filter shows Strategy, Observer, Factory, Decorator, Repository cards
- [ ] "Security" filter shows Auth/Authz, JWT, OWASP cards
- [ ] All code blocks in knowledge cards are syntax-highlighted or monospaced correctly
- [ ] Tradeoffs table renders as pro/con if tradeoffs array is present
- [ ] "Real World" box renders highlighted separately from main detail text
- [ ] Knowledge Base is searchable by tags (e.g. searching "stack" finds Stack/Heap card)

---

*Generated for DevOps Toolkit v2.0 — February 2026*
