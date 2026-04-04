// ---- GENERIC EFFECTS ------------------------------------------------------------------------------------------

function initSparkles() {
  var layer = document.getElementById('sparkleLayer');
  if (!layer) return;

  var symbols = ['◆', '✦', '⬡', '✧', '❖', '⬟'];
  var colors = ['#C9952A', '#E8B84B', '#F5D98A', '#B18E62', '#ffd700'];

  for (var i = 0; i < 18; i++) {
    (function (idx) {
      var el = document.createElement('div');
      el.className = 'sparkle';
      var size = 8 + Math.random() * 14;
      var left = Math.random() * 100;
      var delay = Math.random() * 12;
      var dur = 8 + Math.random() * 14;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var sym = symbols[Math.floor(Math.random() * symbols.length)];

      el.style.cssText = [
        'left:' + left + 'vw',
        'top:' + (90 + Math.random() * 20) + 'vh',
        'font-size:' + size + 'px',
        'color:' + color,
        'animation-duration:' + dur + 's',
        'animation-delay:' + delay + 's',
      ].join(';');
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.borderRadius = '50%';
      el.style.background = 'transparent';
      el.textContent = sym;
      layer.appendChild(el);
    })(i);
  }
}

// ---- COIN EXPLOSION --------------------------------------------------------------------------------------------
function triggerCoinBurst(event) {
  var burst = document.getElementById('coinBurst');
  if (!burst) return;

  var x = event ? event.clientX : window.innerWidth / 2;
  var y = event ? event.clientY : window.innerHeight / 2;

  burst.style.left = x + 'px';
  burst.style.top = y + 'px';

  var coinSyms = ['🪙', '💰', '⬡', '✦', '◆'];
  var count = 10;

  for (var i = 0; i < count; i++) {
    (function (idx) {
      var coin = document.createElement('div');
      coin.className = 'burst-coin';

      var angle = (idx / count) * 360 + (Math.random() * 36 - 18);
      var dist = 50 + Math.random() * 80;
      var rad = angle * Math.PI / 180;
      var tx = Math.cos(rad) * dist;
      var ty = Math.sin(rad) * dist;
      var rot = (Math.random() * 360 - 180) + 'deg';
      var sym = coinSyms[Math.floor(Math.random() * coinSyms.length)];

      coin.style.setProperty('--tx', tx + 'px');
      coin.style.setProperty('--ty', ty + 'px');
      coin.style.setProperty('--tr', rot);
      coin.textContent = sym;

      burst.appendChild(coin);

      setTimeout(function () { coin.remove(); }, 950);
    })(i);
  }
}

function attachBurstToButtons() {
  var btns = document.querySelectorAll('.btn-gold, .btn-gold-lg, .toggle-btn, .ctoggle, .btn-ghost');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      triggerCoinBurst(e);
    });
  });
}


// ---- INIT ------------------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  if (typeof fetchGoldPrice === 'function') fetchGoldPrice();
  if (typeof loadChartData === 'function') loadChartData();
  if (typeof loadNews === 'function') loadNews();

  // Auto-refresh every 60 seconds
  if (typeof fetchGoldPrice === 'function') setInterval(fetchGoldPrice, 60000);
  // News refreshes every 1 hour
  if (typeof loadNews === 'function') setInterval(loadNews, 3600000);

  // ── Hamburger / mobile menu ──────────────────────────────────────────
  var toggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.innerHTML = '☰';
      } else {
        mobileMenu.classList.add('open');
        toggle.classList.add('open');
        toggle.innerHTML = '✕';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          e.target !== toggle) {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.innerHTML = '☰';
      }
    });

    // Close menu when a nav link is tapped
    var mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.innerHTML = '☰';
      });
    });
  }

  // ── Wire mobile Login / Register buttons to the same modals ─────────
  // (buttons only exist on desktop nav; hidden on mobile via CSS)

  // Visual effects
  if (typeof initSparkles === 'function') initSparkles();
  if (typeof attachBurstToButtons === 'function') setTimeout(attachBurstToButtons, 500);

  // Set default chart date range to last 30 days
  var today = new Date();
  var from = new Date();
  from.setDate(today.getDate() - 30);
  var toEl = document.getElementById('chartDateTo');
  var fromEl = document.getElementById('chartDateFrom');
  if (toEl) toEl.value = today.toISOString().split('T')[0];
  if (fromEl) fromEl.value = from.toISOString().split('T')[0];
});