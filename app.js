// Lamark concept homepage. Plain JavaScript, no dependencies.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Concept note
  var concept = document.getElementById('concept');
  document.getElementById('conceptClose').addEventListener('click', function () { concept.remove(); });

  // Header: border on scroll, mobile menu
  var header = document.querySelector('.site-header');
  var menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = header.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('#navLinks a').forEach(function (a) {
    a.addEventListener('click', function () { header.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
  });

  // Scroll: header border, hero tiles drift, quote photo drifts. One rAF per frame.
  var tiles = document.querySelectorAll('.tile[data-depth]');
  var quote = document.querySelector('.quote');
  var quoteImg = quote && quote.querySelector('img');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    if (!reduce) {
      if (y < 1200 && innerWidth > 960) tiles.forEach(function (t) { t.style.setProperty('--py', (y * Number(t.dataset.depth)).toFixed(1) + 'px'); });
      if (quoteImg) {
        var r = quote.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          quoteImg.style.setProperty('--qy', (p * -60).toFixed(1) + 'px');
        }
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Heat: the slider drives the photo's colour and the two vials
  var places = [
    [4, 'Inside a working fridge'],
    [9, 'A fridge during a power cut'],
    [20, 'An air-conditioned room'],
    [27, 'A room in Pune'],
    [33, 'A Delhi afternoon in April'],
    [38, 'A pharmacy shelf in Nagpur, May'],
    [43, 'A truck on the highway in June'],
    [47, 'Rajasthan at peak summer'],
    [50, 'The temperature Lamark tested at']
  ];
  var heat = document.getElementById('heat');
  var range = document.getElementById('tempRange');
  var tempVal = document.getElementById('tempVal');
  var tempPlace = document.getElementById('tempPlace');
  var vialStd = document.getElementById('vialStd');
  var stdState = document.getElementById('stdState');
  function placeFor(t) {
    var label = places[0][1];
    for (var i = 0; i < places.length; i++) if (t >= places[i][0]) label = places[i][1];
    return label;
  }
  function updateTemp() {
    var t = Number(range.value);
    tempVal.textContent = t;
    tempPlace.textContent = placeFor(t);
    heat.style.setProperty('--heat', ((t - 4) / 46).toFixed(3));
    var inRange = t <= 8;
    vialStd.className = 'vial ' + (inRange ? 'ok' : 'bad');
    stdState.textContent = inRange ? 'Within storage range' : 'Outside storage range';
  }
  range.addEventListener('input', updateTemp);
  updateTemp();

  // Filmstrip: arrows, progress bar
  var film = document.getElementById('film');
  var bar = document.getElementById('filmBar');
  var prev = document.getElementById('filmPrev');
  var next = document.getElementById('filmNext');
  function step() { var f = film.querySelector('.frame'); return f ? f.getBoundingClientRect().width + 20 : 400; }
  function updateFilm() {
    var max = film.scrollWidth - film.clientWidth;
    var p = max > 0 ? film.scrollLeft / max : 1;
    bar.style.width = (20 + p * 80).toFixed(1) + '%';
    prev.disabled = film.scrollLeft < 4;
    next.disabled = film.scrollLeft > max - 4;
  }
  prev.addEventListener('click', function () { film.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
  next.addEventListener('click', function () { film.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
  film.addEventListener('scroll', updateFilm, { passive: true });
  window.addEventListener('resize', updateFilm);
  updateFilm();

  // Pipeline filter
  var chips = document.querySelectorAll('.chip-btn');
  var rows = document.querySelectorAll('.pipe-row');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.filter;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      rows.forEach(function (r) { r.hidden = !(f === 'all' || r.dataset.area === f); });
    });
  });

  // Gallery lightbox
  var shots = Array.prototype.slice.call(document.querySelectorAll('.g'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var current = 0, opener = null;
  function show(i) {
    current = (i + shots.length) % shots.length;
    var img = shots[current].querySelector('img');
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = shots[current].dataset.cap;
  }
  shots.forEach(function (s, i) {
    s.addEventListener('click', function () {
      opener = s; show(i);
      if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    });
  });
  function closeLb() { if (lb.open) lb.close(); }
  lb.addEventListener('close', function () { if (opener) opener.focus(); });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { show(current - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });

  // Partner selector: each visitor gets a pitch and a photo
  var who = {
    pharma: ['License ProteoStrong, or co-develop', 'We partner with pharmaceutical companies for API manufacturing, clinical trials and market expansion. Our technology is already applied to insulin and four other proteins.', 'assets/img/news-malvern.jpg'],
    investor: ['Back a platform, not a single molecule', 'One patented formulation technology, three programmes, BIRAC-backed, with a stated goal of InStrong in every pharmacy by 2030.', 'assets/img/news-ikmc.jpg'],
    clinical: ['Run the studies that get it to patients', 'We are looking for hospitals and clinical partners as our candidates move towards IND-enabling and Phase 1/2 work.', 'assets/img/lab-tubes.jpg'],
    talent: ['Join a small team with a large mission', 'Research associates, regulatory officers and scientists. Labs in Pune and Paris, colleagues across India, Europe and the US.', 'assets/img/team-group.jpg']
  };
  var whoBtns = document.querySelectorAll('[data-who]');
  var topic = document.getElementById('fTopic');
  var whoImg = document.getElementById('whoImg');
  function setWho(key) {
    whoBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.who === key)); });
    document.getElementById('whoTitle').textContent = who[key][0];
    document.getElementById('whoText').textContent = who[key][1];
    whoImg.src = who[key][2];
    topic.value = key;
  }
  whoBtns.forEach(function (b) { b.addEventListener('click', function () { setWho(b.dataset.who); }); });
  topic.addEventListener('change', function () { setWho(topic.value); });

  // Demo form: validate on blur, never send
  var form = document.getElementById('contactForm');
  function check(input) {
    var ok = input.checkValidity();
    input.setAttribute('aria-invalid', String(!ok));
    input.style.borderColor = ok ? '' : 'var(--bad)';
    return ok;
  }
  form.querySelectorAll('[required]').forEach(function (i) {
    i.addEventListener('blur', function () { check(i); });
    i.addEventListener('input', function () { if (i.getAttribute('aria-invalid') === 'true') check(i); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (i) { return !check(i); });
    if (bad.length) { bad[0].focus(); return; }
    var name = document.getElementById('fName').value.split(' ')[0];
    form.innerHTML = '<div class="form-done"><h3>Thanks, ' + name.replace(/[<>&"]/g, '') + '.</h3><p style="color:var(--muted)">This is a demo, so nothing was sent. On the live site this reaches the right person at Lamark the same day.</p></div>';
  });

  // Reveal on scroll, grow the pipeline bars
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in-view');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in-view'); });
  }
})();
