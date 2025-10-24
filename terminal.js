// Minimal terminal emulator for static site
document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('terminal-output');
  const input = document.getElementById('terminal-input');
  const cursor = document.getElementById('terminal-cursor');
  const terminal = document.getElementById('terminal');

  const state = {
    cwd: '~',
    history: [],
    histIndex: -1,
  };

  function writeLine(text = '') {
    const el = document.createElement('div');
    el.textContent = text;
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  function clearOutput() {
    output.innerHTML = '';
  }

  function showHelp() {
    writeLine('Available commands:');
    writeLine('  help      - show this help');
    writeLine('  clear     - clear the terminal');
    writeLine('  echo ARG  - print ARG');
    writeLine('  about     - about this site');
    writeLine('  ls        - list main pages');
    writeLine('  open PAGE - navigate to a page (index, projects, gallery, status)');
    writeLine('  startx   - start window manager');
  }

  function listPages() {
    writeLine('index.html  project-directory.html  gallery.html  status.html  webrings.html');
  }

  function runCommand(raw) {
    if (!raw) return;
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        showHelp();
        break;
      case 'clear':
        clearOutput();
        break;
      case 'echo':
        writeLine(args.join(' '));
        break;
      case 'about':
        writeLine('Meowcat\'s shell');
        writeLine('This terminal mode is cosmetic and runs locally in your browser.');
        break;
      case 'ls':
        listPages();
        break;
      case 'open':
        if (args.length === 0) { writeLine('Usage: open PAGE'); break; }
        const target = args[0];
        const map = {
          index: 'index.html',
          projects: 'project-directory.html',
          gallery: 'gallery.html',
          status: 'status.html',
          webrings: 'webrings.html'
        };
        const url = map[target] || target;
        writeLine('Opening ' + url + '...');
        setTimeout(() => { window.location.href = url; }, 250);
        break;
      default:
        writeLine(cmd + ': command not found');
    }
  }

  // Handle Enter, arrow keys for history
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value;
      writeLine('meowcat@meowcat767:~$ ' + val);
      runCommand(val);
      state.history.push(val);
      state.histIndex = state.history.length;
      input.value = '';
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowUp') {
      if (state.histIndex > 0) state.histIndex -= 1;
      const histVal = state.history[state.histIndex] || '';
      input.value = histVal;
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      if (state.histIndex < state.history.length) state.histIndex += 1;
      const histVal = state.history[state.histIndex] || '';
      input.value = histVal;
      e.preventDefault();
    }
  });

  // focus handling
  terminal.addEventListener('click', () => {
    input.focus();
    document.body.classList.add('terminal-focused');
  });

  input.addEventListener('blur', () => {
    document.body.classList.remove('terminal-focused');
  });

  // Typing helper (per-character) and line-typing helper
  function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

  async function typeLine(text, speed = 18) {
    const el = document.createElement('div');
    output.appendChild(el);
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      output.scrollTop = output.scrollHeight;
      await sleep(speed);
    }
  }

  async function runBootSequence() {
    clearOutput();
    const bootLines = [
      'MeowcatOS v0.1 - initializing...',
      'Checking hardware... ok',
      'Loading kernel modules... ok',
      'Mounting root filesystem... ok',
      'Starting services: network, sound, gui... ok',
      'Launching window manager.'
    ];
    for (const line of bootLines) {
      await typeLine(line);
      await sleep(250);
    }
    await sleep(150);
    await typeLine('Login: meowcat');
    writeLine('');
    writeLine('Welcome to Meowcat\'s terminal. Type "help" for commands.');
    localStorage.setItem('meow_booted', Date.now());
  }

  function ensurePlan9Desktop() {
    const existing = document.getElementById('plan9-desktop');
    if (existing) return existing;
    const desktop = document.createElement('div');
    desktop.id = 'plan9-desktop';
    desktop.innerHTML = `
      <div class="plan9-bar">
        <div class="plan9-title">meowcat@plan9</div>
        <button class="plan9-close" title="Close">✕</button>
      </div>
      <div class="plan9-area">
        <div class="plan9-icons">
          <div class="plan9-icon" data-app="editor">ed</div>
          <div class="plan9-icon" data-app="files">fs</div>
          <div class="plan9-icon" data-app="term">term</div>
        </div>
        <div class="plan9-windows"></div>
      </div>
    `;
    document.body.appendChild(desktop);

    // close button
    desktop.querySelector('.plan9-close').addEventListener('click', () => {
      desktop.remove();
      writeLine('X: window manager exited');
    });

    // icon clicks open simple windows
    desktop.querySelectorAll('.plan9-icon').forEach(ic => {
      ic.addEventListener('click', () => {
        const app = ic.dataset.app;
        openPlan9App(app);
      });
    });

    return desktop;
  }

  function openPlan9App(app) {
    const desktop = ensurePlan9Desktop();
    if (!desktop) { writeLine('openPlan9App: cannot create desktop'); return; }
    const winArea = desktop.querySelector('.plan9-windows');
    if (!winArea) { writeLine('openPlan9App: no window area'); return; }
    const win = document.createElement('div');
    win.className = 'plan9-window';
    win.innerHTML = `
      <div class="plan9-window-title">${app}</div>
      <div class="plan9-window-body"></div>
    `;
    // app content
    const body = win.querySelector('.plan9-window-body');
    if (app === 'editor') body.textContent = 'ED - simple editor (read-only demo)';
    else if (app === 'files') body.textContent = '/index.html\n/project-directory.html\n/gallery.html';
    else if (app === 'term') {
      const t = document.createElement('div');
      t.textContent = 'Embedded terminal: type `help` in main terminal to control navigation.';
      body.appendChild(t);
    }
    // add close control
    const ttitle = win.querySelector('.plan9-window-title');
    ttitle.addEventListener('click', () => win.remove());
    winArea.appendChild(win);
  }

  // startui: open the home page inside the Plan9 GUI as an iframe window
  function startui() {
    try {
      const desktop = ensurePlan9Desktop();
      if (!desktop) { writeLine('startui: failed to create desktop'); return; }
      const winArea = desktop.querySelector('.plan9-windows');
    const win = document.createElement('div');
    win.className = 'plan9-window plan9-ui-window';
    win.innerHTML = `
      <div class="plan9-window-title">Home UI</div>
      <div class="plan9-window-body"><iframe src="ui.html" frameborder="0" style="width:100%;height:100%;"></iframe></div>
    `;
    const ttitle = win.querySelector('.plan9-window-title');
    ttitle.addEventListener('click', () => win.remove());
    winArea.appendChild(win);
    writeLine('startui: opened home UI in window manager');
    } catch (err) {
      console.error('startui error', err);
      writeLine('startui: error - ' + (err && err.message ? err.message : String(err)));
    }
  }

  function startx() {
    try {
      const existing = document.getElementById('plan9-desktop');
      if (existing) { writeLine('startx: X already running'); return; }
      const desktop = ensurePlan9Desktop();
      if (!desktop) { writeLine('startx: failed to start desktop'); return; }
      writeLine('Starting X...');
    } catch (err) {
      console.error('startx error', err);
      writeLine('startx: error - ' + (err && err.message ? err.message : String(err)));
    }
  }

  function exitx() {
    const desktop = document.getElementById('plan9-desktop');
    if (desktop) { desktop.remove(); writeLine('X stopped.'); }
    else writeLine('exitx: no window manager running');
  }

  // Bootstrap: run boot on first visit, otherwise show small welcome and focus
  const booted = localStorage.getItem('meow_booted');
  if (!booted) {
    runBootSequence().then(() => input.focus());
  } else {
    writeLine('Welcome back — type "help" for commands.');
    input.focus();
  }

  // Fullscreen terminal helpers
  function setFullscreen(enabled) {
    if (enabled) document.body.classList.add('terminal-fullscreen');
    else document.body.classList.remove('terminal-fullscreen');
  }

  // start in fullscreen terminal mode by default
  setFullscreen(true);

  // add commands to control fullscreen
  const originalRunCommand = runCommand;
  runCommand = function(raw) {
    if (!raw) return;
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    if (cmd === 'fullscreen') { setFullscreen(true); writeLine('Terminal: fullscreen enabled'); return; }
    if (cmd === 'windowed') { setFullscreen(false); writeLine('Terminal: windowed mode'); return; }
    if (cmd === 'boot') { runBootSequence(); return; }
    if (cmd === 'startx') { startx(); return; }
    if (cmd === 'startui') { startx(); startui(); return; }
    if (cmd === 'exitx' || cmd === 'stopx') { exitx(); return; }
    // fallback to original behaviour
    originalRunCommand(raw);
  };

  // Keyboard shortcut: toggle fullscreen with `~` (backquote) when terminal focused
  document.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
      // only toggle if focus isn't on a form element else let user type normally
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const isFull = document.body.classList.toggle('terminal-fullscreen');
      writeLine('Terminal: ' + (isFull ? 'fullscreen' : 'windowed'));
    }
  });
});
