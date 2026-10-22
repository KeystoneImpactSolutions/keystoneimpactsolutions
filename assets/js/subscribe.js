// Newsletter sign-up: posts to /api/subscribe (Sender, double opt-in).
// Works without JavaScript too: the form posts and the browser lands on /newsletter-pending.
(function () {
  var forms = document.querySelectorAll('form.kis-subscribe');
  Array.prototype.forEach.call(forms, function (form) {
    var msg = document.getElementById(form.getAttribute('aria-describedby'));
    var button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (msg) { msg.textContent = ''; msg.classList.remove('is-error'); }
      button.disabled = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d, status: r.status }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            if (msg) msg.textContent = form.getAttribute('data-success');
            form.dispatchEvent(new CustomEvent('kis:subscribed', { bubbles: true }));
          } else {
            var text = res.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : (res.d.message || 'Something went wrong. Please try again.');
            if (msg) { msg.textContent = text; msg.classList.add('is-error'); }
          }
        })
        .catch(function () { if (msg) { msg.textContent = 'Network error. Please try again.'; msg.classList.add('is-error'); } })
        .then(function () { button.disabled = false; });
    });
  });
})();
