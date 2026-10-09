(function () {
  var body = document.body;
  body.classList.remove('no-js');
  body.classList.add('js');

  var header = document.querySelector('.site-header');
  var scrollUp = document.querySelector('.scroll-up');

  // Sticky header effect (dark background after 50px) + scroll-to-top button
  function onScroll() {
    var y = window.pageYOffset;
    header.classList.toggle('is-sticky', y > 50);
    scrollUp.classList.toggle('visible', y > 300);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  var toggle = document.querySelector('.menu-toggle');
  toggle.addEventListener('click', function () {
    var open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
  });

  // Gallery lightbox (detail pages)
  var lightbox = document.querySelector('.lightbox');
  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  if (lightbox && links.length) {
    var lbImg = lightbox.querySelector('img');
    var lbCounter = lightbox.querySelector('.lb-counter');
    var current = 0;
    var show = function (i) {
      current = (i + links.length) % links.length;
      lbImg.src = links[current].href;
      lbImg.alt = links[current].querySelector('img').alt;
      lbCounter.textContent = (current + 1) + ' / ' + links.length;
    };
    var close = function () { lightbox.hidden = true; document.body.style.overflow = ''; };
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        show(i);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
      });
    });
    lightbox.querySelector('.lb-close').addEventListener('click', close);
    lightbox.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // Entrance animations
  var items = document.querySelectorAll('.anim');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('animated'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      setTimeout(function () { el.classList.add('animated'); }, +(el.dataset.delay || 0));
      io.unobserve(el);
    });
  }, { threshold: 0.1 });
  items.forEach(function (el) { io.observe(el); });
})();
