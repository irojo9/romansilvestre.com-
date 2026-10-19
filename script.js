(() => {
  const body = document.body;
  const intro = document.getElementById('intro');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro ---------- */
  let introDone = false;
  const finishIntro = () => {
    if (introDone) return;
    introDone = true;
    intro.classList.add('leave');
    setTimeout(() => {
      body.classList.remove('is-loading');
      body.classList.add('ready');
      revealHero();
    }, 450);
    setTimeout(() => intro.remove(), 1200);
  };

  if (reduced) {
    intro.remove();
    body.classList.remove('is-loading');
    body.classList.add('ready');
  } else {
    requestAnimationFrame(() => intro.classList.add('play'));
    setTimeout(finishIntro, 3700);
    document.getElementById('introSkip').addEventListener('click', finishIntro);
  }

  /* ---------- Nav ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const counter = e.target.querySelector('[data-count]');
      if (counter) countUp(counter);
      io.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    if (el.closest('.hero')) return;
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
    io.observe(el);
  });

  function revealHero() {
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      el.style.transitionDelay = `${350 + i * 120}ms`;
      el.classList.add('in');
    });
  }
  if (body.classList.contains('ready')) revealHero();

  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const start = performance.now();
    const dur = 1600;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const v = target * (1 - Math.pow(1 - p, 4));
      el.textContent = v.toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Card spotlight + tilt ---------- */
  if (window.matchMedia('(hover: hover)').matches && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Method progress ring ---------- */
  const method = document.getElementById('metodo');
  const bar = document.getElementById('methodBar');
  const updateBar = () => {
    const r = method.getBoundingClientRect();
    const total = r.height - window.innerHeight * .5;
    const p = Math.min(Math.max((window.innerHeight * .5 - r.top) / total, 0), 1);
    bar.style.strokeDashoffset = 1 - p;
  };
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();

  /* ---------- Hero canvas: flowing energy waves ---------- */
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr, t = 0, mouseX = .5, mouseY = .5, running = true;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', e => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  }, { passive: true });

  const waves = Array.from({ length: 14 }, (_, i) => ({
    offset: i / 14,
    amp: 30 + Math.random() * 60,
    freq: .0018 + Math.random() * .0016,
    speed: .004 + Math.random() * .006,
    hue: i % 4 === 0 ? 'grey' : 'blue',
    width: i % 5 === 0 ? 2 : 1,
  }));

  const draw = () => {
    if (!running) return;
    t += 1;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    waves.forEach((wv, i) => {
      const baseY = h * (0.45 + (wv.offset - .5) * .55) + (mouseY - .5) * 40;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      if (wv.hue === 'blue') {
        grad.addColorStop(0, 'rgba(30,167,238,0)');
        grad.addColorStop(.5, `rgba(30,167,238,${.18 + (i % 3) * .06})`);
        grad.addColorStop(1, 'rgba(43,79,214,0)');
      } else {
        grad.addColorStop(0, 'rgba(180,185,190,0)');
        grad.addColorStop(.5, 'rgba(180,185,190,.12)');
        grad.addColorStop(1, 'rgba(180,185,190,0)');
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = wv.width;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = baseY
          + Math.sin(x * wv.freq + t * wv.speed + i) * wv.amp * (0.6 + mouseX * .6)
          + Math.sin(x * wv.freq * 2.3 - t * wv.speed * 1.4) * wv.amp * .3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  };

  if (!reduced) {
    new IntersectionObserver(([e]) => {
      const was = running;
      running = e.isIntersecting;
      if (running && !was) requestAnimationFrame(draw);
    }).observe(canvas);
    requestAnimationFrame(draw);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
