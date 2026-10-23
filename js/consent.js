/* Cookie consent + Google Analytics 4 (only loads after the visitor accepts) */
(function () {
  // Paste Pure Elegance's GA4 Measurement ID here (Google Analytics > Admin > Data streams). Analytics stays off until it is set.
  var GA_ID = 'G-XXXXXXXXXX';
  var KEY = 'ft_cookie_consent';
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000; // ask again after 12 months

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && (v.c === 'granted' || v.c === 'denied') && Date.now() - v.t < MAX_AGE) return v.c;
    } catch (e) {}
    return null;
  }
  function save(c) {
    try { localStorage.setItem(KEY, JSON.stringify({ c: c, t: Date.now() })); } catch (e) {}
  }
  function gaReady() { return /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX'; }

  function loadGA() {
    if (!gaReady() || window.__peGA) return;
    window.__peGA = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { cookie_flags: 'SameSite=Lax;Secure' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function clearGA() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^_ga/.test(n)) {
        document.cookie = n + '=; Max-Age=0; path=/';
        document.cookie = n + '=; Max-Age=0; path=/; domain=.' + host;
      }
    });
  }

  var box;
  function close() { if (box) { box.remove(); box = null; } }
  function choose(c) {
    save(c);
    close();
    if (c === 'granted') loadGA();
    else if (window.__peGA) { clearGA(); location.reload(); }
    else clearGA();
  }

  function show() {
    if (box) return;
    box = document.createElement('div');
    box.className = 'cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Cookie preferences');

    var h = document.createElement('strong');
    h.textContent = 'Your privacy';
    var p = document.createElement('p');
    p.appendChild(document.createTextNode('We use optional analytics cookies to see how visitors use this site, so we can improve it. They are only set if you accept. '));
    var a = document.createElement('a');
    a.href = 'cookie-policy.html';
    a.textContent = 'Cookie policy';
    p.appendChild(a);

    var row = document.createElement('div');
    row.className = 'cb';
    var rej = document.createElement('button');
    rej.type = 'button'; rej.className = 'rej'; rej.textContent = 'REJECT';
    rej.addEventListener('click', function () { choose('denied'); });
    var acc = document.createElement('button');
    acc.type = 'button'; acc.className = 'acc'; acc.textContent = 'ACCEPT';
    acc.addEventListener('click', function () { choose('granted'); });
    row.appendChild(rej); row.appendChild(acc);

    box.appendChild(h); box.appendChild(p); box.appendChild(row);
    document.body.appendChild(box);
  }

  var state = read();
  if (state === 'granted') loadGA();
  else if (state === null) show();

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('a,button') : null;
    if (!t) return;
    if (t.classList.contains('cookie-settings')) { e.preventDefault(); show(); return; }
    // Count booking clicks as leads in Google Analytics
    if (window.gtag && t.href) {
      var m = /wa\.me/.test(t.href) ? 'whatsapp' : /^tel:/.test(t.href) ? 'phone' : /ig\.me|instagram\.com/.test(t.href) ? 'instagram' : null;
      if (m) window.gtag('event', 'generate_lead', { method: m });
    }
  });
  document.addEventListener('submit', function (e) {
    if (window.gtag && e.target.name === 'enquiry') window.gtag('event', 'generate_lead', { method: 'form' });
  });
})();
