const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menuToggle');
menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();

const glow = document.getElementById('cursorGlow');
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
} else {
  glow.style.display = 'none';
}

const revealItems = document.querySelectorAll('.skill-card,.project-card,.timeline-item,.cert-card,.about-copy');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});
revealItems.forEach(item => {
  item.classList.add('reveal');
  observer.observe(item);
});


// Advanced portfolio interactions: loader, progress, cursor, terminal and card tilt.
(() => {
  const loader = document.getElementById('pageLoader');
  const percent = document.getElementById('loaderPercent');
  let n = 0;
  const tick = setInterval(() => {
    n = Math.min(100, n + Math.floor(Math.random() * 17) + 8);
    if (percent) percent.textContent = String(n).padStart(2, '0');
    if (n >= 100) {
      clearInterval(tick);
      setTimeout(() => loader?.classList.add('loaded'), 220);
    }
  }, 115);
  window.addEventListener('load', () => setTimeout(() => loader?.classList.add('loaded'), 900));

  const progress = document.getElementById('scrollProgress');
  const topButton = document.getElementById('backToTop');
  const cursor = document.getElementById('customCursor');
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
    topButton?.classList.toggle('visible', window.scrollY > 550);
  };
  window.addEventListener('scroll', updateScroll, {passive:true});
  updateScroll();
  topButton?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  if (window.matchMedia('(pointer:fine)').matches && cursor) {
    window.addEventListener('pointermove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a,button,input').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // Subtle pointer tilt and localized glow, disabled for touch and reduced-motion users.
  if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.skill-card,.project-card,.cert-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width, y = (e.clientY-r.top)/r.height;
        card.style.setProperty('--mx', (x*100)+'%');
        card.style.setProperty('--my', (y*100)+'%');
        const tiltX = (0.5-y)*3.5, tiltY = (x-0.5)*4;
        card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform = '');
    });
  }

  // ===== Interactive terminal =====
  const panel = document.getElementById('terminalPanel');
  const launch = document.getElementById('terminalLaunch');
  const closeBtn = document.getElementById('terminalClose');
  const form = document.getElementById('terminalForm');
  const input = document.getElementById('terminalInput');
  const output = document.getElementById('terminalOutput');
  const box = panel?.querySelector('.terminal-box');

  const SECTIONS = {about:'about', skills:'skills', projects:'projects', labs:'lab-notes', journey:'experience', certs:'certifications', contact:'contact', home:'home'};
  const commands = {
    help: () => 'Available commands:\n  about · skills · projects · education · certs · contact\n  whoami · ls · github · email · date · open <section> · clear · exit\nTip: ↑ / ↓ for history, Tab to autocomplete.',
    about: () => 'Shuvo Paul — Digital Forensics graduate interested in cybersecurity, malware analysis, endpoint security and security research.',
    skills: () => 'Forensics    Autopsy, FTK Imager, Magnet AXIOM, Volatility 3\nAnalysis     YARA, PE analysis, IOC extraction, hashing\nSecurity     Wireshark, Nmap, OpenVAS/GVM, Burp Suite\nDevelopment  Python, SQL, Bash, HTML, CSS, JavaScript',
    projects: () => 'SentryShield · Linux Security Auditing · USB & Mobile Endpoint Monitoring\nPDF Malware Analysis Toolkit · Kitsune IDS Exploration · Advanced Port Scanner\nType "open projects" to jump to the gallery.',
    education: () => 'B.Sc. in Digital Forensics — ISOAH Institute, affiliated to MAKAUT University.',
    certs: () => '[1] HackerRank — SQL (Basic) · earned 06 Mar 2026\n[2] WsCube Tech — Bug Bounty Ethical Hacking Masterclass (participation) · 02 Nov 2026\nType "open certs" to view the certificates.',
    contact: () => 'Email   shuvopaul601@gmail.com\nGitHub  github.com/shuvopaul601',
    whoami: () => 'visitor — welcome to the portfolio.',
    ls: () => 'about/  skills/  projects/  lab-notes/  journey/  certifications/  contact/',
    github: () => { window.open('https://github.com/shuvopaul601', '_blank', 'noopener'); return 'Opening github.com/shuvopaul601 ...'; },
    email: () => { window.location.href = 'mailto:shuvopaul601@gmail.com'; return 'Opening your mail client ...'; },
    date: () => new Date().toString(),
    exit: () => { setTimeout(closeTerminal, 150); return 'logout'; }
  };
  const names = [...Object.keys(commands), 'open', 'clear', 'echo', 'sudo'];
  const history = []; let hIndex = 0;

  const printLine = (text, cls = '') => {
    const p = document.createElement('p');
    p.className = cls;
    p.textContent = text;
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
  };

  function runCommand(raw) {
    const line = raw.trim();
    if (!line) return;
    history.push(line); hIndex = history.length;
    printLine('visitor@shuvo:~$ ' + line, 'terminal-output-good');
    const [cmd, ...args] = line.split(/\s+/);
    const key = cmd.toLowerCase();
    if (key === 'clear') { output.innerHTML = ''; return; }
    if (key === 'echo') { printLine(args.join(' '), 'terminal-output-muted'); return; }
    if (key === 'sudo') { printLine('visitor is not in the sudoers file. This incident will be reported. (just kidding)', 'terminal-output-muted'); return; }
    if (key === 'open') {
      const target = (args[0] || '').toLowerCase();
      if (SECTIONS[target]) {
        printLine('Jumping to ' + target + ' ...', 'terminal-output-muted');
        setTimeout(() => { closeTerminal(false); document.getElementById(SECTIONS[target])?.scrollIntoView({behavior: 'smooth'}); }, 350);
      } else printLine('Usage: open <' + Object.keys(SECTIONS).join('|') + '>', 'terminal-output-muted');
      return;
    }
    if (commands[key]) printLine(commands[key](), 'terminal-output-muted');
    else printLine('Command not found: ' + key + '. Type "help" to see available commands.', 'terminal-output-muted');
  }

  let lastFocus = null;
  function focusInput() { input?.focus({preventScroll: true}); }
  function openTerminal() {
    if (!panel || panel.classList.contains('open')) return;
    lastFocus = document.activeElement;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('terminal-open');
    void panel.offsetHeight;           // make sure it is rendered before focusing
    focusInput();
    setTimeout(focusInput, 80);        // fallback for slower browsers
  }
  function closeTerminal(restore = true) {
    if (!panel || !panel.classList.contains('open')) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('terminal-open');
    if (restore) (lastFocus || launch)?.focus?.({preventScroll: true});
  }

  launch?.addEventListener('click', openTerminal);
  closeBtn?.addEventListener('click', () => closeTerminal());
  // Click on the dark backdrop closes it; click anywhere inside the window focuses the prompt (unless selecting text).
  panel?.addEventListener('mousedown', e => { if (e.target === panel) closeTerminal(); });
  box?.addEventListener('click', e => {
    if (e.target.closest('button, a, input')) return;
    if (String(window.getSelection?.() || '')) return;
    focusInput();
  });
  document.querySelectorAll('[data-command]').forEach(btn => btn.addEventListener('click', () => { runCommand(btn.dataset.command); focusInput(); }));

  form?.addEventListener('submit', e => { e.preventDefault(); runCommand(input.value); input.value = ''; });

  input?.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIndex > 0) input.value = history[--hIndex];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      hIndex = Math.min(history.length, hIndex + 1);
      input.value = history[hIndex] || '';
    } else if (e.key === 'Tab' && input.value.trim() && !input.value.includes(' ')) {
      e.preventDefault();
      const hits = names.filter(n => n.startsWith(input.value.trim().toLowerCase()));
      if (hits.length === 1) input.value = hits[0];
      else if (hits.length > 1) printLine(hits.join('   '), 'terminal-output-muted');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault(); output.innerHTML = '';
    }
  });

  // Esc closes; Tab stays inside the terminal while it is open.
  document.addEventListener('keydown', e => {
    if (!panel?.classList.contains('open')) return;
    if (e.key === 'Escape') { closeTerminal(); return; }
    if (e.key !== 'Tab' || e.defaultPrevented) return;
    const items = [...panel.querySelectorAll('button, input')].filter(el => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!panel.contains(document.activeElement)) { e.preventDefault(); focusInput(); }
  });
})();


// ===== AUTO-ANIMATION LAYER =====
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Looping typing effect
  const typed = document.getElementById('typed');
  if (typed) {
    const phrases = [
      'investigating digital evidence...',
      'analyzing malware samples...',
      'auditing Linux systems...',
      'hunting threats on the network...',
      'building security tools...'
    ];
    if (reduce) { typed.textContent = phrases[0]; }
    else {
      let p = 0, c = 0, del = false;
      const step = () => {
        const word = phrases[p];
        c += del ? -1 : 1;
        typed.textContent = word.slice(0, c);
        let wait = del ? 28 : 65;
        if (!del && c === word.length) { wait = 1600; del = true; }
        else if (del && c === 0) { del = false; p = (p + 1) % phrases.length; wait = 400; }
        setTimeout(step, wait);
      };
      setTimeout(step, 1400);
    }
  }

  // 2. Particle network in the hero
  const canvas = document.getElementById('heroCanvas');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, dots = [];
    const mouse = {x: -999, y: -999};
    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      const count = Math.min(70, Math.floor(w * h / 18000));
      dots = Array.from({length: count}, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
        r: Math.random() * 1.6 + .6
      }));
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    let visible = true;
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(canvas);
    const draw = () => {
      requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d, i) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 6.283);
        ctx.fillStyle = 'rgba(255,51,79,.8)';
        ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
          const o = dots[j], dist = Math.hypot(d.x - o.x, d.y - o.y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(255,51,79,${(1 - dist / 130) * .25})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y); ctx.stroke();
          }
        }
        const md = Math.hypot(d.x - mouse.x, d.y - mouse.y);
        if (md < 160) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - md / 160) * .3})`;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      });
    };
    draw();
  }

  // 3. Auto glitch on the hero title
  const title = document.querySelector('.hero-title');
  if (title && !reduce) {
    setInterval(() => {
      title.classList.add('glitch');
      setTimeout(() => title.classList.remove('glitch'), 380);
    }, 6000);
  }

  // 4. Count-up numbers
  const countObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    countObs.unobserve(e.target);
    const target = +e.target.dataset.count;
    if (reduce) { e.target.textContent = target; return; }
    const start = performance.now(), dur = 1600;
    const tick = now => {
      const t = Math.min(1, (now - start) / dur);
      e.target.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), {threshold: .6});
  document.querySelectorAll('[data-count]').forEach(c => countObs.observe(c));

  // 5. Section heading lines draw themselves
  const headObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); headObs.unobserve(e.target); }
  }), {threshold: .5});
  document.querySelectorAll('.section-heading').forEach(h => headObs.observe(h));

  // 6. Staggered reveals with alternating directions
  const stagger = (sel, dirs) => document.querySelectorAll(sel).forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.12 + 's';
    if (dirs) el.classList.add(i % 2 ? 'from-right' : 'from-left');
  });
  stagger('.skill-card'); stagger('.cert-card'); stagger('.project-card:not(.featured)', true);
  document.querySelectorAll('.timeline-item').forEach((el, i) => el.style.transitionDelay = i * 0.12 + 's');
  document.querySelectorAll('.stat').forEach(el => {
    el.classList.add('reveal');
    el.style.transitionDelay = [...el.parentNode.children].indexOf(el) * 0.12 + 's';
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); o.disconnect(); }
    }), {threshold: .2}).observe(el);
  });

  // 7. Active nav link follows scroll
  const links = [...document.querySelectorAll('#nav a:not(.nav-cta)')];
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  document.querySelectorAll('main section[id]').forEach(s => navObs.observe(s));

  // 9. Idle glow: random cards light up on their own
  if (!reduce) {
    const cards = document.querySelectorAll('.skill-card,.cert-card');
    setInterval(() => {
      const c = cards[Math.floor(Math.random() * cards.length)];
      c.style.borderColor = '#9c2947';
      setTimeout(() => { c.style.borderColor = ''; }, 1200);
    }, 2500);
  }
})();


// ===== INTERACTION UPGRADE =====
(() => {
  const menu = document.getElementById('nav');
  const toggle = document.getElementById('menuToggle');
  toggle?.addEventListener('click', () => {
    const open = menu?.classList.contains('open');
    toggle.setAttribute('aria-expanded', String(!open));
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  // Filter project cards without reloading the page.
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const projectCards = [...document.querySelectorAll('.project-card[data-category]')];
  const count = document.getElementById('projectCount');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    projectCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-filtered-out', !show);
      card.classList.toggle('is-filtered-in', show);
      if (show) visible++;
    });
    if (count) count.textContent = `${String(visible).padStart(2,'0')} PROJECT${visible === 1 ? '' : 'S'}`;
  }));

  // Pointer-following highlights on interactive cards.
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.lab-card,.skill-card,.cert-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    });
  }
})();
