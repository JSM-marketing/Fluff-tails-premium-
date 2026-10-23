(function () {
  var root = document.documentElement;
  var track = document.querySelector('.gtrack');

  // Gallery: drag to scroll and arrow buttons (works without GSAP)
  if (track) {
    var down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startL = track.scrollLeft; track.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = startL - dx; });
    addEventListener('pointerup', function () { down = false; track.classList.remove('drag'); });
    document.querySelectorAll('.garrows button').forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: (+b.dataset.dir) * 322, behavior: 'smooth' }); });
    });
  }

  // Groom finder (works without GSAP)
  var finder = document.getElementById('finder');
  if (finder) {
    var data = JSON.parse(document.getElementById('fr-data').textContent);
    var state = { age: 'adult', coat: 'long', quick: '' };
    var res = finder.querySelector('.res');
    var render = function () {
      var name = state.quick === 'nails' ? 'Nail Trim' : state.quick === 'ears' ? 'Ear Cleaning'
        : state.age === 'puppy' ? 'Puppy Groom' : state.coat === 'smooth' ? 'Full Groom: Smooth Coat' : 'Full Groom: Long Coat';
      var d = data[name];
      document.getElementById('fr-name').textContent = name;
      var pr = document.getElementById('fr-price');
      pr.textContent = d.price;
      if (d.from) { var sm = document.createElement('small'); sm.textContent = 'from'; pr.appendChild(sm); }
      document.getElementById('fr-desc').textContent = d.dur + '. ' + d.desc;
      document.getElementById('fr-wa').href = 'https://wa.me/447818729593?text=' + encodeURIComponent("Hi Flufftails, I'd like to book " + ({ 'Full Groom: Long Coat': 'a full groom (long coat)', 'Full Groom: Smooth Coat': 'a full groom (smooth coat)', 'Puppy Groom': 'a puppy groom', 'Nail Trim': 'a nail trim', 'Ear Cleaning': 'an ear clean' })[name] + ' for my dog');
      res.classList.remove('flash'); void res.offsetWidth; res.classList.add('flash');
    };
    finder.querySelectorAll('.chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        var q = b.dataset.q, v = b.dataset.v;
        if (q === 'quick') {
          state.quick = state.quick === v ? '' : v;
        } else {
          state[q] = v; state.quick = '';
        }
        finder.querySelectorAll('.chips button').forEach(function (x) {
          x.setAttribute('aria-pressed', String((x.dataset.q === 'quick' ? state.quick : state[x.dataset.q]) === x.dataset.v));
        });
        render();
      });
    });
  }

  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('js'); return; }
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) scrollTo(0, 0);

  var nav = document.getElementById('nav');
  ScrollTrigger.create({ start: 60, onUpdate: function (s) { nav.classList.toggle('solid', s.scroll() > 60); } });
  if (scrollY > 60) nav.classList.add('solid');

  if (RM) { root.classList.remove('js'); return; }

  // The Flufftails groom: pinned, one step per scroll stage
  var g = document.getElementById('groom');
  if (g) {
    var steps = [].slice.call(g.querySelectorAll('.step'));
    var frames = [].slice.call(g.querySelectorAll('.frames img'));
    var dots = [].slice.call(g.querySelectorAll('.dots i'));
    var cur = -1;
    var show = function (k) {
      if (k === cur) return; cur = k;
      steps.forEach(function (s, i) { s.classList.toggle('on', i === k); });
      frames.forEach(function (f, i) { f.classList.toggle('on', i === k); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i <= k); });
    };
    g.classList.add('live');
    show(0);
    ScrollTrigger.create({
      trigger: g, start: 'top top', end: '+=' + (steps.length * 650), pin: true, anticipatePin: 1,
      onUpdate: function (s) { show(Math.min(steps.length - 1, Math.floor(s.progress * steps.length))); }
    });
  }

  // Scroll progress bar
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  // Hero photo stack: drifts with the mouse and on scroll
  var stack = document.getElementById('stack');
  if (stack) {
    var pols = [].slice.call(stack.querySelectorAll('.pol'));
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelector('.hero').addEventListener('mousemove', function (e) {
        var cx = e.clientX / innerWidth - .5, cy = e.clientY / innerHeight - .5;
        pols.forEach(function (p) { var dpt = +p.dataset.depth; p.style.translate = (cx * dpt) + 'px ' + (cy * dpt) + 'px'; });
      });
    }
    gsap.to(stack, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // Price cards tilt towards the mouse
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg');
        c.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 8 + 'deg');
      });
      c.addEventListener('mouseleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }

  // Gallery: pinned and scrolls sideways on desktop
  var gal = document.getElementById('gallery');
  if (gal && track && matchMedia('(min-width: 961px)').matches) {
    gal.classList.add('hpin');
    var hint = gal.querySelector('.head p'); if (hint) hint.textContent = 'Keep scrolling to see some of our recent grooms.';
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth + innerWidth * .05); };
    gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: gal, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
  }
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  function refresh() {
    ScrollTrigger.refresh();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }
  addEventListener('load', refresh);
  if (document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
