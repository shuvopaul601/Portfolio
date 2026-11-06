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

  const panel = document.getElementById('terminalPanel');
  const launch = document.getElementById('terminalLaunch');
  const close = document.getElementById('terminalClose');
  const form = document.getElementById('terminalForm');
  const input = document.getElementById('terminalInput');
  const output = document.getElementById('terminalOutput');
  const commands = {
    help: 'Available commands: about · skills · projects · education · contact · clear',
    about: 'Shuvo Paul — Digital Forensics graduate interested in cybersecurity, malware analysis, endpoint security and security research.',
    skills: 'Forensics: Autopsy, FTK Imager, Magnet AXIOM, Volatility 3.\\nAnalysis: YARA, PE analysis, IOC extraction, hashing.\\nSecurity: Wireshark, Nmap, OpenVAS/GVM, Burp Suite.\\nDevelopment: Python, SQL, Bash, HTML, CSS, JavaScript.',
    projects: 'Featured work: SentryShield · Linux Security Auditing · USB & Mobile Endpoint Monitoring · PDF Malware Analysis Toolkit · Kitsune IDS Exploration.',
    education: 'B.Sc. in Digital Forensics — ISOAH Institute, affiliated to MAKAUT University.',
    contact: 'Use the contact links at the bottom of this page to connect by email, LinkedIn or GitHub.'
  };
  const openTerminal = () => { panel?.classList.add('open'); panel?.setAttribute('aria-hidden','false'); setTimeout(()=>input?.focus(),250); };
  const closeTerminal = () => { panel?.classList.remove('open'); panel?.setAttribute('aria-hidden','true'); launch?.focus(); };
  launch?.addEventListener('click', openTerminal);
  close?.addEventListener('click', closeTerminal);
  panel?.addEventListener('click', e => { if (e.target === panel) closeTerminal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel?.classList.contains('open')) closeTerminal(); });
  const printLine = (text, cls='') => {
    const p = document.createElement('p');
    p.className = cls;
    p.textContent = text;
    output?.appendChild(p);
    if (output) output.scrollTop = output.scrollHeight;
  };
  const runCommand = raw => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    printLine('visitor@shuvo:~$ ' + raw, 'terminal-output-good');
    if (cmd === 'clear') { output.innerHTML = ''; return; }
    if (commands[cmd]) printLine(commands[cmd], 'terminal-output-muted');
    else printLine('Command not found: ' + cmd + '. Type "help" to see available commands.', 'terminal-output-muted');
  };
  form?.addEventListener('submit', e => { e.preventDefault(); runCommand(input.value); input.value=''; });
  document.querySelectorAll('[data-command]').forEach(btn => btn.addEventListener('click', () => runCommand(btn.dataset.command)));
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

  // 8. Terminal runs a typed demo the first time it opens
  const launch = document.getElementById('terminalLaunch');
  const input = document.getElementById('terminalInput');
  const form = document.getElementById('terminalForm');
  let demoed = false;
  launch?.addEventListener('click', () => {
    if (demoed || reduce || !input || !form) return;
    demoed = true;
    const cmds = ['about', 'skills'];
    let ci = 0;
    const typeCmd = () => {
      if (ci >= cmds.length) return;
      const cmd = cmds[ci++]; let k = 0;
      const t = setInterval(() => {
        input.value = cmd.slice(0, ++k);
        if (k >= cmd.length) {
          clearInterval(t);
          setTimeout(() => { form.requestSubmit(); setTimeout(typeCmd, 900); }, 350);
        }
      }, 90);
    };
    setTimeout(typeCmd, 700);
    input.addEventListener('keydown', () => { ci = cmds.length; }, {once: true});
  });

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
