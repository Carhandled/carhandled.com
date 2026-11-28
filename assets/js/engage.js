/* CarHandled engagement helpers:
   1. Scroll depth events to GA4 (25/50/75/100%).
   2. "Read next" card at the end of each guide, following the buying path.
   3. 0% APR vs rebate calculator, if the page has #rebateCalc. */
(function () {
  function ev(name, params) { try { if (window.gtag) gtag('event', name, params || {}); } catch (e) {} }

  // 1. Scroll depth
  var marks = [25, 50, 75, 100], sent = {};
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (max <= 0) return;
    var pct = Math.round((h.scrollTop || document.body.scrollTop) / max * 100);
    marks.forEach(function (m) {
      if (pct >= m && !sent[m]) { sent[m] = 1; ev('scroll_depth', { percent: m, page_path: location.pathname }); }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // 2. Read next
  var NEXT = {
    'what-is-out-the-door-price': ['out-the-door-price-email-guide', 'How to get a real OTD price by email', 'The exact emails to send so dealers put the full price in writing before you visit.'],
    'out-the-door-price-email-guide': ['how-to-compare-dealer-quotes', 'Compare dealer quotes line by line', 'Once the quotes come in, here is how to see which one is really lower.'],
    'how-to-compare-dealer-quotes': ['dealer-add-ons-what-to-skip', 'Dealer add-ons: what to buy, what to skip', 'What each add-on on a quote is, and which ones are worth keeping.'],
    'dealer-add-ons-what-to-skip': ['car-loan-pre-approval-leverage', 'Know your rate before you shop', 'Get a rate from your bank first, and see if 0% or the rebate saves more.'],
    'car-loan-pre-approval-leverage': ['upside-down-car-loan', 'Upside down on a car loan', 'How owing more than the car is worth happens, and how to avoid it.'],
    'upside-down-car-loan': ['how-to-get-most-for-trade-in', 'How to get the most for your trade-in', 'Get outside offers first and keep the trade separate from the price.'],
    'how-to-get-most-for-trade-in': ['what-is-out-the-door-price', 'What is an out-the-door price?', 'The one number to compare between dealers, and what belongs in it.'],
    'best-car-buying-toolkits-2026': ['what-is-out-the-door-price', 'What is an out-the-door price?', 'The one number to compare between dealers, and what belongs in it.']
  };
  var slug = (location.pathname.match(/\/guides\/([a-z0-9-]+)\.html/) || [])[1];
  var rel = document.querySelector('.related-heading');
  if (slug && NEXT[slug] && rel) {
    var n = NEXT[slug], href = '/guides/' + n[0] + '.html';
    var card = document.createElement('a');
    card.href = href;
    card.className = 'read-next-card';
    card.setAttribute('style', 'display:block;text-decoration:none;margin:2.5rem 0 0.5rem;padding:1.4rem 1.5rem;border-radius:14px;border:2px solid var(--gold,#D7FF3A);background:var(--card,#151515);');
    card.innerHTML = '<div style="font-size:0.72rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--gold,#D7FF3A);margin-bottom:0.45rem;">Read next</div>' +
      '<div style="font-size:1.2rem;font-weight:700;color:var(--white,#fff);margin-bottom:0.35rem;">' + n[1] + ' &rarr;</div>' +
      '<div style="font-size:0.92rem;color:var(--ink-mute,#aaa);line-height:1.5;">' + n[2] + '</div>';
    card.addEventListener('click', function () { ev('read_next_click', { from: slug, to: n[0] }); });
    rel.parentNode.insertBefore(card, rel);
  }

  // 3. 0% vs rebate calculator
  var c = document.getElementById('rebateCalc');
  if (c) {
    var $ = function (id) { return document.getElementById(id); };
    var fmt = function (v) { return '$' + Math.round(v).toLocaleString('en-US'); };
    var used = false;
    function calc() {
      var P = +$('rcAmount').value || 0, R = +$('rcRebate').value || 0,
          r = (+$('rcRate').value || 0) / 1200, n = +$('rcTerm').value || 60;
      var B = Math.max(P - R, 0);
      var pay = r > 0 ? B * r / (1 - Math.pow(1 + r, -n)) : B / n;
      var totalRebate = pay * n, totalZero = P, diff = totalRebate - totalZero;
      var out = $('rcOut');
      if (!P || !n) { out.textContent = ''; return; }
      var zeroPay = P / n;
      out.innerHTML = diff > 0
        ? '<strong>0% wins by about ' + fmt(diff) + '.</strong> 0%: ' + fmt(zeroPay) + '/mo, ' + fmt(totalZero) + ' total. Rebate at your rate: ' + fmt(pay) + '/mo, ' + fmt(totalRebate) + ' total.'
        : '<strong>The rebate wins by about ' + fmt(-diff) + '.</strong> Rebate at your rate: ' + fmt(pay) + '/mo, ' + fmt(totalRebate) + ' total. 0%: ' + fmt(zeroPay) + '/mo, ' + fmt(totalZero) + ' total.';
      if (!used) { used = true; ev('calculator_use', { calc: 'zero_vs_rebate' }); }
    }
    ['rcAmount', 'rcRebate', 'rcRate', 'rcTerm'].forEach(function (id) { $(id).addEventListener('input', calc); });
    calc(); used = false;
  }
})();
