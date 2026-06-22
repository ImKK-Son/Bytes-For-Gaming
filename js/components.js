/* =============================================================
   Bytes For Gaming — Shared UI Components
   Renders the nav/footer, product cards, and the price-compare
   modal. Depends on data.js (window.BFG).
   ============================================================= */
(function () {
  'use strict';

  var BFG = window.BFG;

  /* --------------------------- helpers --------------------------- */
  function money(n) {
    return '$' + Number(n).toFixed(2);
  }
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function stars(rating) {
    var full = Math.round(rating);
    var s = '';
    for (var i = 1; i <= 5; i++) { s += i <= full ? '★' : '☆'; }
    return '<span class="stars" aria-label="' + rating + ' out of 5">' + s + '</span>';
  }
  function brandColor(brand) {
    return (BFG.BRANDS[brand] && BFG.BRANDS[brand].color) || '#8b5cf6';
  }
  function catIcon(cat) {
    return (BFG.CATEGORIES[cat] && BFG.CATEGORIES[cat].icon) || '🎮';
  }

  /* --------------------------- chrome (nav/footer) --------------------------- */
  var NAV = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'quiz.html', label: 'Find My Gear', key: 'quiz' },
    { href: 'browse.html', label: 'Browse', key: 'browse' },
    { href: 'deals.html', label: 'Deals', key: 'deals' },
    { href: 'about.html', label: 'How We Protect You', key: 'about' }
  ];

  function renderChrome(activeKey) {
    var header = document.getElementById('site-header');
    if (header) {
      var links = NAV.map(function (n) {
        var active = n.key === activeKey ? ' class="active"' : '';
        return '<a href="' + n.href + '"' + active + '>' + n.label + '</a>';
      }).join('');
      header.innerHTML =
        '<div class="nav-inner container">' +
          '<a class="brand" href="index.html">' +
            '<span class="brand-mark">&lt;/&gt;</span>' +
            '<span class="brand-name">Bytes<span class="accent">For</span>Gaming</span>' +
          '</a>' +
          '<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>' +
          '<nav class="nav-links">' + links + '</nav>' +
        '</div>';

      var toggle = header.querySelector('.nav-toggle');
      var nav = header.querySelector('.nav-links');
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    var footer = document.getElementById('site-footer');
    if (footer) {
      footer.innerHTML =
        '<div class="container footer-inner">' +
          '<div class="footer-col">' +
            '<div class="brand"><span class="brand-mark">&lt;/&gt;</span>' +
            '<span class="brand-name">Bytes<span class="accent">For</span>Gaming</span></div>' +
            '<p class="muted">Your unbiased guide to gaming gear. We compare the major brands and stores so you find the right accessory at a fair price — without getting ripped off.</p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Explore</h4>' +
            '<a href="quiz.html">Find My Gear Quiz</a>' +
            '<a href="browse.html">Browse All Gear</a>' +
            '<a href="deals.html">Today\'s Best Deals</a>' +
            '<a href="about.html">How We Protect You</a>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Brands We Track</h4>' +
            '<p class="muted">' + BFG.brands().join(' · ') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="container footer-legal">' +
          '<p class="muted small">Prices shown are typical estimates to illustrate comparisons — tap any retailer for live pricing and current deals. Bytes For Gaming is an independent buying guide and is not affiliated with the brands listed. Always confirm price, warranty, and seller before purchasing.</p>' +
          '<p class="muted small">© ' + new Date().getFullYear() + ' Bytes For Gaming. Built for gamers, by gamers.</p>' +
        '</div>';
    }
  }

  /* --------------------------- product card --------------------------- */
  function thumb(p) {
    var c = brandColor(p.brand);
    return '<div class="thumb" style="--bc:' + c + '">' +
        '<span class="thumb-icon">' + catIcon(p.category) + '</span>' +
        '<span class="thumb-brand">' + p.brand + '</span>' +
      '</div>';
  }

  function dealBadge(p) {
    if (p.dealScore >= 20) {
      return '<span class="badge badge-deal">Save ' + p.dealScore + '%</span>';
    }
    return '';
  }

  function productCard(p, opts) {
    opts = opts || {};
    var matchBadge = (opts.match != null)
      ? '<span class="badge badge-match">' + opts.match + '% match</span>'
      : '';
    var card = el(
      '<article class="card product-card" data-id="' + p.id + '">' +
        thumb(p) +
        '<div class="card-body">' +
          '<div class="card-badges">' + matchBadge + dealBadge(p) + '</div>' +
          '<h3 class="card-title">' + p.name + '</h3>' +
          '<div class="card-meta">' + stars(p.rating) +
            '<span class="muted small">' + p.rating.toFixed(1) + '</span>' +
            '<span class="cat-pill">' + BFG.CATEGORIES[p.category].label.replace(/s$/, '') + '</span>' +
          '</div>' +
          '<p class="card-desc">' + p.highlight + '</p>' +
          '<div class="card-price">' +
            '<div><span class="price-from">from</span> <span class="price">' + money(p.bestPrice) + '</span></div>' +
            '<button class="btn btn-primary btn-sm js-compare">Compare &amp; Buy</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
    card.querySelector('.js-compare').addEventListener('click', function (e) {
      e.stopPropagation();
      openCompare(p.id);
    });
    card.addEventListener('click', function () { openCompare(p.id); });
    return card;
  }

  /* --------------------------- price-compare modal --------------------------- */
  function offerRow(o) {
    var badges = '';
    if (o.isLowest) badges += '<span class="tag tag-green">Lowest price</span>';
    if (o.isMostTrusted) badges += '<span class="tag tag-blue">Most trusted</span>';
    var prot = '';
    for (var i = 0; i < 5; i++) { prot += i < o.consumerScore ? '🛡️' : '·'; }
    return '<div class="offer' + (o.isOurPick ? ' offer-pick' : '') + '">' +
        '<div class="offer-main">' +
          '<div class="offer-name">' + o.name + ' ' + badges + '</div>' +
          '<div class="offer-prot" title="Buyer-protection score">' +
            '<span class="prot-dots">' + prot + '</span>' +
            '<span class="muted small">' + o.consumerScore + '/5 buyer protection</span>' +
          '</div>' +
          '<div class="offer-blurb muted small">' + o.blurb + '</div>' +
        '</div>' +
        '<div class="offer-cta">' +
          '<div class="offer-price">' + money(o.price) + '</div>' +
          '<a class="btn btn-primary btn-sm" href="' + o.url + '" target="_blank" rel="noopener noreferrer">' +
            (o.key === 'manufacturer' ? 'Buy Direct' : 'View Deal') + ' ↗</a>' +
        '</div>' +
      '</div>';
  }

  function openCompare(id) {
    var p = BFG.getById(id);
    if (!p) return;
    var pr = p.pricing;

    // sort offers cheapest first for the table
    var offers = pr.offers.slice().sort(function (a, b) { return a.price - b.price; });

    var features = p.features.map(function (f) { return '<li>' + f + '</li>'; }).join('');

    var savingsLine = pr.savings > 0
      ? '<div class="savings-banner">💰 Prices range ' + money(pr.lowest) + ' – ' + money(pr.highest) +
        '. Buying smart saves you up to <strong>' + money(pr.savings) + ' (' + pr.savingsPct + '%)</strong> on the same product.</div>'
      : '';

    var pickLine =
      '<div class="pick-banner">✅ <strong>Our anti-rip-off pick:</strong> ' + pr.pick.name +
      ' at ' + money(pr.pick.price) + ' — the best balance of a fair price and strong buyer protection.</div>';

    var overlay = el(
      '<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Compare prices for ' + p.name + '">' +
        '<div class="modal">' +
          '<button class="modal-close" aria-label="Close">✕</button>' +
          '<div class="modal-head">' +
            thumb(p) +
            '<div>' +
              '<h2 id="modal-title">' + p.name + '</h2>' +
              '<div class="card-meta">' + stars(p.rating) +
                '<span class="muted small">' + p.rating.toFixed(1) + ' / 5</span>' +
                '<span class="cat-pill">' + p.brand + '</span>' +
              '</div>' +
              '<p class="muted">' + p.highlight + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="modal-grid">' +
            '<div class="modal-features">' +
              '<h4>Key features</h4><ul class="ticks">' + features + '</ul>' +
              '<h4>Buyer\'s note</h4><p class="muted small">' + p.valueNote + '</p>' +
            '</div>' +
            '<div class="modal-offers">' +
              '<h4>Compare prices &amp; buy</h4>' +
              savingsLine + pickLine +
              '<div class="offers">' + offers.map(offerRow).join('') + '</div>' +
              '<p class="muted small modal-disclaimer">Prices are typical estimates for comparison. Tap a store for live pricing and current deals. Always confirm the item is sold by the retailer (not a third-party reseller) before buying.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    function close() {
      document.body.removeChild(overlay);
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');
  }

  /* --------------------------- expose --------------------------- */
  BFG.ui = {
    money: money,
    el: el,
    stars: stars,
    thumb: thumb,
    productCard: productCard,
    openCompare: openCompare,
    renderChrome: renderChrome,
    catIcon: catIcon,
    brandColor: brandColor
  };
})();
