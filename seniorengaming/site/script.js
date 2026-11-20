(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const navigation = document.querySelector('[data-navigation]');
  const navLinks = [...document.querySelectorAll('.navigation a')];

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menü öffnen');
    navigation.classList.remove('open');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Menü öffnen' : 'Menü schließen');
    navigation.classList.toggle('open', !isOpen);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const updateNavigation = () => {
    header?.classList.toggle('scrolled', window.scrollY > 30);
    const position = window.scrollY + 150;
    let currentId = 'start';
    sections.forEach((section) => {
      if (section.offsetTop <= position) currentId = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };

  window.addEventListener('scroll', updateNavigation, { passive: true });
  updateNavigation();

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add('visible'));
  }

  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    const slides = [...gallery.querySelectorAll('.gallery-slide')];
    const dots = [...gallery.querySelectorAll('[data-gallery-dot]')];
    let activeIndex = 0;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === activeIndex));
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === activeIndex;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-pressed', String(active));
      });
    };

    gallery.querySelector('[data-gallery-prev]')?.addEventListener('click', () => showSlide(activeIndex - 1));
    gallery.querySelector('[data-gallery-next]')?.addEventListener('click', () => showSlide(activeIndex + 1));
    dots.forEach((dot) => dot.addEventListener('click', () => showSlide(Number(dot.dataset.galleryDot))));

    let touchStart = 0;
    gallery.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
    gallery.addEventListener('touchend', (event) => {
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 50) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });
  }

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
