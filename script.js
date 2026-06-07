document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile menu ──────────────────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('active');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', open);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Highlight current page in nav ────────────────────────────
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active-nav');
  });

  // ── Header shadow on scroll ───────────────────────────────────
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20
        ? '0 6px 20px rgba(0,0,0,0.25)'
        : '0 4px 12px rgba(0,0,0,0.15)';
    }, { passive: true });
  }

  // ── Scroll-reveal (IntersectionObserver) ─────────────────────
  const animEls = document.querySelectorAll('.scroll-animate');
  if (animEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    animEls.forEach(el => io.observe(el));
  }

  // ── Gallery lightbox ─────────────────────────────────────────
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    const img = item.querySelector('img');
    const open = () => openLightbox(img);
    item.addEventListener('click', open);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  function openLightbox(img) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <img src="${img.src}" alt="${img.alt}">
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
      overlay.remove();
      document.body.style.overflow = '';
    };
    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  }

  // ── Form validation ───────────────────────────────────────────
  function validateField(field) {
    const val = field.value.trim();
    let error = '';

    if (field.hasAttribute('required') && !val) {
      error = 'This field is required.';
    } else if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      error = 'Please enter a valid email address.';
    } else if (field.type === 'tel' && val && !/^[\d\s+\-()\\.]{7,}$/.test(val)) {
      error = 'Please enter a valid phone number.';
    } else if (field.type === 'date' && val) {
      const today = new Date().toISOString().split('T')[0];
      if (val < today) error = 'Please choose a future date.';
    }

    field.parentElement.querySelectorAll('.field-error, .field-success').forEach(el => el.remove());
    field.classList.remove('error');

    const msg = document.createElement('span');
    if (error) {
      field.classList.add('error');
      msg.className = 'field-error';
      msg.textContent = error;
    } else if (val) {
      msg.className = 'field-success';
      msg.textContent = '✓';
    }
    if (msg.className) field.after(msg);
    return !error;
  }

  document.querySelectorAll('form').forEach(form => {
    // Set date min to today
    form.querySelectorAll('input[type="date"]').forEach(d => {
      d.min = new Date().toISOString().split('T')[0];
    });

    // Live validation on blur; re-validate on input if already errored
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('input, select, textarea').forEach(field => {
        if (!validateField(field)) valid = false;
      });
      if (valid) showSuccess(form);
    });
  });

  function showSuccess(form) {
    let el = form.parentElement.querySelector('.form-success');
    if (!el) {
      el = document.createElement('div');
      el.className = 'form-success';
      el.innerHTML = `
        <div style="font-size:3rem;margin-bottom:1rem">🐾</div>
        <h3 style="color:#1A2A4F;margin-bottom:0.5rem">Thank you!</h3>
        <p style="color:#1A2A4F;font-size:1rem;margin-bottom:1rem">
          We've received your message and will be in touch within 24 hours.
        </p>
        <button onclick="location.reload()"
          style="background:#F7A5A5;color:#1A2A4F;border:none;padding:0.7rem 2rem;border-radius:50px;font-weight:700;cursor:pointer;font-size:1rem">
          Submit Another
        </button>
      `;
      form.before(el);
    }
    form.style.display = 'none';
    el.classList.add('show');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ── Smooth scroll for in-page anchor links ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

});
