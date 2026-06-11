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

  // ── Header elevation on scroll (rAF-debounced) ───────────────
  const header = document.querySelector('header');
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
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
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
    animEls.forEach(el => io.observe(el));
  }

  // ── Gallery image fade-in on load ────────────────────────────
  document.querySelectorAll('.gallery-item img').forEach(img => {
    if (img.complete && img.naturalWidth) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    }
  });

  // ── Gallery lightbox with navigation ─────────────────────────
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  galleryItems.forEach((item, index) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    const open = () => openLightbox(index);
    item.addEventListener('click', open);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  function openLightbox(startIndex) {
    const images = galleryItems.map(item => item.querySelector('img'));
    let current = startIndex;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      ${images.length > 1 ? `
        <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#8592;</button>
        <button class="lightbox-nav lightbox-next" aria-label="Next image">&#8594;</button>
      ` : ''}
      <img src="${images[current].src}" alt="${images[current].alt}">
      <span class="lightbox-counter" aria-live="polite"></span>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const imgEl    = overlay.querySelector('img');
    const counter  = overlay.querySelector('.lightbox-counter');
    const updateCounter = () => {
      counter.textContent = images.length > 1 ? `${current + 1} of ${images.length}` : '';
    };
    updateCounter();

    const show = idx => {
      current = (idx + images.length) % images.length;
      imgEl.classList.add('switching');
      setTimeout(() => {
        imgEl.src = images[current].src;
        imgEl.alt = images[current].alt;
        updateCounter();
        imgEl.classList.remove('switching');
      }, 250);
    };

    const close = () => {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      galleryItems[current].focus();
    };

    const onKey = e => {
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    };

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-prev')?.addEventListener('click', () => show(current - 1));
    overlay.querySelector('.lightbox-next')?.addEventListener('click', () => show(current + 1));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.lightbox-close').focus();
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
    const hadError = field.classList.contains('error');
    field.classList.remove('error', 'shake');

    const msg = document.createElement('span');
    if (error) {
      field.classList.add('error');
      if (!hadError) {
        void field.offsetWidth; // restart shake animation
        field.classList.add('shake');
      }
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
      else form.querySelector('.error')?.focus();
    });
  });

  function showSuccess(form) {
    let el = form.parentElement.querySelector('.form-success');
    if (!el) {
      el = document.createElement('div');
      el.className = 'form-success';
      el.innerHTML = `
        <div class="success-paw" role="img" aria-label="Paw print">🐾</div>
        <h3 style="margin-bottom:0.5rem">Thank you!</h3>
        <p style="font-size:1rem;margin-bottom:1.5rem">
          We've received your message and will be in touch within 24 hours.
        </p>
        <button onclick="location.reload()" class="btn-cta" style="padding:0.7rem 2rem;font-size:1rem">
          Submit Another<span class="btn-arrow">&rarr;</span>
        </button>
        <p style="margin:1.25rem 0 0;font-size:0.95rem">
          <a href="index.html" style="color:#D4878F;font-weight:600">&larr; Back to Home</a>
        </p>
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

  // ── Page fade transitions between internal pages ──────────────
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    document.querySelectorAll('a[href$=".html"]').forEach(a => {
      a.addEventListener('click', e => {
        if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        document.body.classList.add('page-exit');
        setTimeout(() => { window.location.href = a.getAttribute('href'); }, 100);
      });
    });
    // Restore opacity when returning via browser back/forward cache
    window.addEventListener('pageshow', () => document.body.classList.remove('page-exit'));
  }

});
