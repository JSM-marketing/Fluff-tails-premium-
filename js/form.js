/* Enquiry form: sends through Web3Forms (works on Vercel or any static host).
   Until an access key is added below, Premium sites open the enquiry in WhatsApp instead, already filled in. */
(function () {
  // Get a free key at https://web3forms.com (enter the email that should receive enquiries) and paste it here.
  var ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var WHATSAPP = '447818729593';
  var PHONE = '07818 729593';
  var WA_FALLBACK = true; // Premium sites only; Standard sites have no WhatsApp
  var COOLDOWN = 60 * 1000; // one enquiry per minute from the same browser

  var form = document.querySelector('form.enquiry');
  if (!form) return;
  var btn = form.querySelector('button[type=submit]');
  var msg = form.querySelector('.form-msg');
  var keyReady = /^[0-9a-f-]{30,}$/i.test(ACCESS_KEY);
  form.querySelector('input[name=access_key]').value = keyReady ? ACCESS_KEY : '';

  function say(text, isError) {
    msg.textContent = text;
    msg.className = 'form-msg' + (isError ? ' err' : '');
  }
  function val(name) { var el = form.elements[name]; return el ? String(el.value).trim() : ''; }

  function viaWhatsApp() {
    var lines = ["Hi Flufftails, I'd like to book a groom.", 'My name: ' + val('name'), 'Phone: ' + val('phone')];
    if (val('email')) lines.push('Email: ' + val('email'));
    lines.push("Dog's name: " + val('dog_name'));
    if (val('breed')) lines.push('Breed / size: ' + val('breed'));
    lines.push('Service: ' + val('service'));
    if (val('preferred_date')) lines.push('Preferred date: ' + val('preferred_date'));
    if (val('message')) lines.push('Message: ' + val('message'));
    location.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements.botcheck && form.elements.botcheck.checked) { location.href = 'thank-you.html'; return; }

    var last = 0;
    try { last = +localStorage.getItem('ft_last_enquiry') || 0; } catch (err) {}
    if (Date.now() - last < COOLDOWN) { say('Thanks, we already have your enquiry. Please wait a minute before sending another.', true); return; }

    if (!keyReady) {
      if (WA_FALLBACK) viaWhatsApp();
      else say('Online enquiries are not switched on yet. Please call or text ' + PHONE + ', or book online.', true);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    say('');
    fetch(ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(function (r) { return r.json().then(function (j) { return r.ok && j.success; }); })
      .then(function (ok) {
        if (!ok) throw new Error('rejected');
        try { localStorage.setItem('ft_last_enquiry', String(Date.now())); } catch (err) {}
        location.href = 'thank-you.html';
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Send enquiry';
        say("Sorry, your enquiry didn't send. Please try again, or " + (WA_FALLBACK ? 'WhatsApp' : 'call or text') + ' ' + PHONE + '.', true);
      });
  });
})();
