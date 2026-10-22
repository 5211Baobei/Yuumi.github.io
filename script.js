(() => {
  const root = document.documentElement;
  const card = document.querySelector('#id-card');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('pointermove', (event) => {
    root.style.setProperty('--mx', `${event.clientX}px`);
    root.style.setProperty('--my', `${event.clientY}px`);
  }, { passive: true });

  if (card && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--ry', `${x * 11}deg`);
      card.style.setProperty('--rx', `${y * -9}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
    revealObserver.observe(item);
  });

  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav-link')];
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-30% 0px -55%', threshold: [0, .2, .5] });
  sections.forEach((section) => sectionObserver.observe(section));

  const detailDialog = document.querySelector('#detail-dialog');
  const detailTitle = document.querySelector('#detail-title');
  const detailLabel = document.querySelector('#detail-label');
  const detailCopy = document.querySelector('#detail-copy');
  const detailIndex = document.querySelector('#detail-index');
  const detailClose = document.querySelector('.detail-close');
  let activeInterest = null;

  document.querySelectorAll('.interest-trigger').forEach((interest) => {
    interest.addEventListener('click', () => {
      activeInterest = interest;
      detailTitle.textContent = interest.dataset.title;
      detailLabel.textContent = interest.dataset.label;
      detailCopy.textContent = interest.dataset.detail;
      detailIndex.textContent = interest.dataset.index;
      detailDialog.showModal();
      document.body.classList.add('modal-open');
    });
  });

  detailClose.addEventListener('click', () => detailDialog.close());
  detailDialog.addEventListener('click', (event) => {
    if (event.target === detailDialog) detailDialog.close();
  });
  detailDialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    activeInterest?.focus();
  });

  document.querySelectorAll('.copy-contact').forEach((button) => {
    button.addEventListener('click', async () => {
      const label = button.querySelector('span');
      const original = label.textContent;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        label.textContent = '已复制';
      } catch {
        const field = document.createElement('textarea');
        field.value = button.dataset.copy;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
        label.textContent = '已复制';
      }
      window.setTimeout(() => { label.textContent = original; }, 1800);
    });
  });

  const canvas = document.querySelector('#particle-canvas');
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(70, Math.max(28, Math.floor(width / 24)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.2 + .25,
      speed: Math.random() * .2 + .06,
      drift: (Math.random() - .5) * .08,
      alpha: Math.random() * .4 + .08,
      hue: Math.random() > .7 ? 316 : 187
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 95%, 72%, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();
