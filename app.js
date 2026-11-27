// Lamark concept homepage. Plain JavaScript, no dependencies.
(function () {
  'use strict';

  // Concept note
  var concept = document.getElementById('concept');
  document.getElementById('conceptClose').addEventListener('click', function () {
    concept.remove();
  });

  // Header: border on scroll, mobile menu
  var header = document.querySelector('.site-header');
  var menuBtn = document.getElementById('menuBtn');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
  menuBtn.addEventListener('click', function () {
    var open = header.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('#navLinks a').forEach(function (a) {
    a.addEventListener('click', function () {
      header.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Thermometer
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
    var inRange = t <= 8;
    vialStd.className = 'vial ' + (inRange ? 'ok' : 'bad');
    stdState.textContent = inRange ? 'Within storage range' : 'Outside storage range';
  }
  range.addEventListener('input', updateTemp);
  updateTemp();

  // Journey of a vial
  var stops = [
    {
      ct: 'Fine, for now',
      cx: 'The vial leaves at 2–8°C. Every stop after this one has to keep it there.',
      wt: 'No fridge needed from here',
      wx: 'A thermostable formulation can be stored and shipped at room temperature, even in hotter climates.'
    },
    {
      ct: 'Refrigerated truck, or none',
      cx: 'Reefer trucks cost more and are scarce outside big cities. A breakdown or a long wait at a checkpoint is enough.',
      wt: 'Any truck will do',
      wx: 'Ordinary transport, ordinary cost. Lamark expects removing the cold chain to bring costs down by around 20%.'
    },
    {
      ct: 'One power cut away',
      cx: 'Regions in India and Africa lack cold-chain infrastructure and uninterrupted power. Stock that warms up quietly loses efficacy.',
      wt: 'The power cut stops mattering',
      wx: 'Stock on a shelf stays usable through outages and summer heat.'
    },
    {
      ct: 'Often not stocked at all',
      cx: 'A pharmacy without a reliable fridge cannot keep insulin, so the patient travels to the nearest town, or goes without.',
      wt: 'Stocked where people live',
      wx: 'If it needs no fridge, the village pharmacy can carry it. Zero days of waiting.'
    },
    {
      ct: 'A missed dose',
      cx: 'Insulin that degrades without refrigeration leads to missed doses, and missed doses lead to amputations and kidney failure.',
      wt: 'The dose that arrives, works',
      wx: 'The point of all of it: insulin that is still potent on the day it is used. WHO targets 80% access; this is how remote areas reach it.'
    }
  ];
  var stopBtns = document.querySelectorAll('.stop');
  var jp = {
    ct: document.getElementById('jpColdTitle'), cx: document.getElementById('jpColdText'),
    wt: document.getElementById('jpWarmTitle'), wx: document.getElementById('jpWarmText')
  };
  function showStop(i) {
    stopBtns.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    Object.keys(jp).forEach(function (k) { jp[k].textContent = stops[i][k]; });
  }
  stopBtns.forEach(function (b, i) {
    b.addEventListener('click', function () { showStop(i); stopAuto(); });
    b.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % stops.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + stops.length) % stops.length;
      if (n !== null) { e.preventDefault(); showStop(n); stopBtns[n].focus(); stopAuto(); }
    });
  });

  // Walk the journey once on its own when it scrolls into view, unless reduced motion
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoTimer = null, autoStep = 0;
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  function startAuto() {
    if (reduce || autoTimer) return;
    autoTimer = setInterval(function () {
      autoStep += 1;
      if (autoStep >= stops.length) return stopAuto();
      showStop(autoStep);
    }, 2600);
  }

  // Pipeline filter
  var chips = document.querySelectorAll('.chip');
  var rows = document.querySelectorAll('.pipe-row');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.filter;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      rows.forEach(function (r) { r.hidden = !(f === 'all' || r.dataset.area === f); });
    });
  });

  // Partner selector
  var who = {
    pharma: ['License ProteoStrong, or co-develop', 'We partner with pharmaceutical companies for API manufacturing, clinical trials and market expansion. Our technology is already applied to insulin and four other proteins.'],
    investor: ['Back a platform, not a single molecule', 'One patented formulation technology, three programmes, BIRAC-backed, with a stated goal of InStrong in every pharmacy by 2030.'],
    clinical: ['Run the studies that get it to patients', 'We are looking for hospitals and clinical partners as our candidates move towards IND-enabling and Phase 1/2 work.'],
    talent: ['Join a small team with a large mission', 'Research associates, regulatory officers and scientists. Labs in Pune and Paris, colleagues across India, Europe and the US.']
  };
  var whoBtns = document.querySelectorAll('[data-who]');
  var topic = document.getElementById('fTopic');
  function setWho(key) {
    whoBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.who === key)); });
    document.getElementById('whoTitle').textContent = who[key][0];
    document.getElementById('whoText').textContent = who[key][1];
    topic.value = key;
  }
  whoBtns.forEach(function (b) { b.addEventListener('click', function () { setWho(b.dataset.who); }); });
  topic.addEventListener('change', function () { setWho(topic.value); });

  // Demo form: validate on blur, never send
  var form = document.getElementById('contactForm');
  function check(input) {
    var ok = input.checkValidity();
    input.setAttribute('aria-invalid', String(!ok));
    input.style.borderColor = ok ? '' : 'var(--coral)';
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

  // Reveal on scroll, start the journey, grow the pipeline bars
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in-view');
        if (en.target.classList.contains('journey-track')) startAuto();
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in-view'); });
  }
})();
