/* CarHandled holiday sale: $29 -> $9, Nov 24 to Dec 31 2026 (US Eastern).
   Turns itself on and off by date, so nothing needs to be changed to end the sale.
   Preview any time with ?sale=preview in the URL. */
(function () {
  var START = new Date('2026-11-24T00:00:00-05:00');
  var END = new Date('2027-01-01T00:00:00-05:00');
  var OLD_LINK = 'https://buy.stripe.com/3cIaEXfIP9Ll4Ai0bbfIs05';
  var SALE_LINK = 'https://buy.stripe.com/28E9AT1RZ4r11o61fffIs06';

  var now = new Date();
  var preview = /[?&]sale=preview\b/.test(location.search);
  if (!preview && (now < START || now >= END)) return;

  function run() {

    // 1. Swap every "$29" in visible text and labels to "$9".
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        if (p === 'SCRIPT' || p === 'STYLE' || p === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return /\$29/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) { n.nodeValue = n.nodeValue.replace(/\$29(?!\d)/g, '$9'); });
    document.querySelectorAll('[aria-label*="$29"]').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute('aria-label').replace(/\$29(?!\d)/g, '$9'));
    });

    // 2. Point checkout at the $9 Stripe link.
    document.querySelectorAll('a[href^="' + OLD_LINK + '"]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').replace(OLD_LINK, SALE_LINK));
    });

    // 3. Show the regular price crossed out on the pricing card.
    var now$ = document.querySelector('.price-row .price-now');
    if (now$ && !document.querySelector('.price-row .price-was')) {
      var was = document.createElement('span');
      was.className = 'price-was';
      was.textContent = '$29';
      was.style.cssText = 'font-size:1.4rem;';
      now$.parentNode.insertBefore(was, now$);
      var tag = document.querySelector('.price-card .price-tag');
      if (tag) tag.textContent = 'Holiday price · Ends Dec 31';
    }

    // 4. Thin banner above the header.
    if (!document.getElementById('ch-sale-bar')) {
      var bar = document.createElement('a');
      bar.id = 'ch-sale-bar';
      bar.href = '/#pricing';
      bar.innerHTML = 'Holiday sale: Toolkit <s style="opacity:.6">$29</s> <strong>$9</strong> thru Dec 31&nbsp;&rarr;';
      bar.style.cssText = [
        'display:block', 'text-align:center', 'padding:9px 16px',
        'background:#D7FF3A','border-bottom:2px solid #0E0E0E', 'color:#0b0b0b', 'font-size:14px', 'line-height:1.35',
        'font-weight:500', 'text-decoration:none', 'position:relative', 'z-index:101'
      ].join(';');
      bar.addEventListener('click', function () {
        if (typeof gtag === 'function') gtag('event', 'sale_banner_click');
      });
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
