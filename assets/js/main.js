/**
 * Shanmukhi Sai Nandiraju - Portfolio Interactions & Logic
 * Native Modern JavaScript (ES2022+)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('.site-header');
  const updateHeader = () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // 2. Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      const icon = mobileToggle.querySelector('svg');
      if (icon) {
        icon.innerHTML = isOpen 
          ? '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
          : '<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      }
    });

    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Active Nav Link on Scroll via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  // 4. Project Filtering Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter') || 'all';

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  // 5. Native Modal Dialogs & Light Dismiss
  // Per Modern Web Guidance for `<dialog closedby="any">`:
  // Fallback for browsers that do not yet support closedby attribute (e.g. Safari)
  const setupDialog = (dialogId, triggerSelector) => {
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;

    // Triggers
    if (triggerSelector) {
      document.querySelectorAll(triggerSelector).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (typeof dialog.showModal === 'function') {
            dialog.showModal();
          }
        });
      });
    }

    // Close buttons inside dialog
    dialog.querySelectorAll('.dialog-close-btn, [data-dialog-close]').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => dialog.close());
    });

    // Fallback light-dismiss if closedBy is unsupported
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          dialog.close();
        }
      });
    }
  };

  setupDialog('contact-dialog', '[data-open-contact]');

  // 7. Email Copy to Clipboard & Toast Alert
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  const toast = document.getElementById('toast');
  const emailToCopy = 'contact@shanmukhi.com';

  const showToast = (message) => {
    if (!toast) return;
    const toastText = toast.querySelector('.toast-text');
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  copyBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(emailToCopy);
        showToast('Email copied to clipboard! (contact@shanmukhi.com)');
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = emailToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Email copied to clipboard!');
      }
    });
  });

  // 8. Contact Form Handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name')?.value || '';
      const email = document.getElementById('form-email')?.value || '';
      const message = document.getElementById('form-message')?.value || '';
      
      const mailtoUrl = `mailto:contact@shanmukhi.com?subject=Portfolio%20Inquiry%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(`Hi Shanu,\n\n${message}\n\nFrom: ${name} (${email})`)}`;
      window.location.href = mailtoUrl;

      const dialog = document.getElementById('contact-dialog');
      if (dialog) dialog.close();
      showToast('Opening your email client to send message!');
    });
  }

  // 9. Interactive Card Spotlight Glow (Desktop Pointer Movement)
  if (window.matchMedia('(pointer: fine)').matches) {
    const cards = document.querySelectorAll('.project-card, .experience-card, .pillar-card, .skill-category-card');
    cards.forEach(card => {
      let rafId = null;
      let pendingX = 0, pendingY = 0;
      card.addEventListener('mousemove', (e) => {
        pendingX = e.clientX;
        pendingY = e.clientY;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${pendingX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${pendingY - rect.top}px`);
          rafId = null;
        });
      });
    });
  }

  // 10. Dynamic Animated Stat Counter on Viewport Entry
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const isDecimal = String(target).includes('.');
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        
        let start = 0;
        const duration = 1400;
        const startTime = performance.now();

        const updateCount = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = start + (target - start) * easeProgress;
          
          el.textContent = `${prefix}${isDecimal ? current.toFixed(2) : Math.floor(current)}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            el.textContent = `${prefix}${isDecimal ? target.toFixed(2) : target}${suffix}`;
          }
        };

        requestAnimationFrame(updateCount);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(s => statsObserver.observe(s));

  // 11. Smooth Scroll to Top for all #top anchors
  document.querySelectorAll('a[href="#top"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      if (window.location.hash) {
        history.pushState(null, '', window.location.pathname);
      }
    });
  });
});
