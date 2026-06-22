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
  function escapeAttr(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
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
          '<p class="muted small">Prices shown are typical estimates to illustrate comparisons (or live data when enabled) — tap any retailer for current pricing and deals. Bytes For Gaming is an independent buying guide and is not affiliated with the brands listed. Always confirm price, warranty, and seller before purchasing.</p>' +
          '<p class="muted small"><strong>Affiliate disclosure:</strong> Some links on this site are affiliate links. If you buy through them, we may earn a commission at no extra cost to you — it helps keep our recommendations free and independent.</p>' +
          '<p class="muted small">© ' + new Date().getFullYear() + ' Bytes For Gaming. Built for gamers, by gamers.</p>' +
        '</div>';
    }
  }

  /* --------------------------- product card --------------------------- */
  // Layered visual: brand-tinted gradient + committed category illustration
  // (always loads). A real photo covers it when available. Photo sources, in
  // order: an explicit override, the product's `image` field, or — when
  // autoProductImages is on — images/products/<id>.jpg (then .png). If none
  // load, it falls back to the illustration automatically.
  function autoImagesOn() {
    var c = window.BFG_CONFIG || {};
    return c.autoProductImages !== false; // default ON
  }
  function thumb(p, opts) {
    opts = opts || {};
    var c = brandColor(p.brand);
    var illus = BFG.catImage(p.category);
    var illusLayer = illus
      ? '<img class="thumb-illus" src="' + illus + '" alt="" aria-hidden="true">'
      : '<span class="thumb-icon">' + catIcon(p.category) + '</span>';

    var photoLayer = '';
    var explicit = opts.image || p.image || '';
    if (explicit) {
      photoLayer = '<img class="thumb-photo" src="' + escapeAttr(explicit) + '" alt="' + escapeAttr(p.name) +
        '" loading="lazy" onerror="this.style.display=&quot;none&quot;">';
    } else if (autoImagesOn()) {
      // try /<id>.jpg, then /<id>.png, then reveal the illustration
      var jpg = 'images/products/' + p.id + '.jpg';
      var png = 'images/products/' + p.id + '.png';
      photoLayer = '<img class="thumb-photo" src="' + jpg + '" alt="' + escapeAttr(p.name) + '" loading="lazy" ' +
        'onerror="if(this.dataset.t){this.style.display=&quot;none&quot;}else{this.dataset.t=1;this.src=&quot;' + png + '&quot;}">';
    }
    return '<div class="thumb" style="--bc:' + c + '">' +
        illusLayer + photoLayer +
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
            '<div><span class="price-from">from</span> <span class="price" title="Estimated lowest price — open to compare stores">≈ ' + money(p.bestPrice) + '</span></div>' +
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
    if (o.exact) badges += '<span class="tag tag-exact" title="Links to the exact product at this exact price">exact</span>';
    var prot = '';
    for (var i = 0; i < 5; i++) { prot += i < o.consumerScore ? '🛡️' : '·'; }
    // estimated prices get a "≈" so shoppers know it is not a live quote
    var priceHtml = o.exact
      ? money(o.price)
      : '<span title="Estimated price — click through for the live price, or enable Live Prices for exact figures">≈ ' + money(o.price) + '</span>';
    return '<div class="offer' + (o.isOurPick ? ' offer-pick' : '') + '">' +
        '<div class="offer-main">' +
          '<div class="offer-name">' + escapeAttr(o.name) + ' ' + badges + '</div>' +
          '<div class="offer-prot" title="Buyer-protection score">' +
            '<span class="prot-dots">' + prot + '</span>' +
            '<span class="muted small">' + o.consumerScore + '/5 buyer protection</span>' +
          '</div>' +
          '<div class="offer-blurb muted small">' + o.blurb + '</div>' +
        '</div>' +
        '<div class="offer-cta">' +
          '<div class="offer-price">' + priceHtml + '</div>' +
          '<a class="btn btn-primary btn-sm" href="' + o.url + '" target="_blank" rel="noopener noreferrer">' +
            (o.key === 'manufacturer' ? 'Buy Direct' : (o.exact ? 'Buy Now' : 'Find It')) + ' ↗</a>' +
        '</div>' +
      '</div>';
  }

  // The whole offers panel (banners + rows + disclaimer), reused for both the
  // initial estimate render and the live-price re-render.
  function offersBodyHTML(pr, isLive, source) {
    if (!pr || !pr.offers.length) return '<p class="muted small">No offers available.</p>';
    var offers = pr.offers.slice().sort(function (a, b) { return a.price - b.price; });
    var liveLabel = source === 'affiliate' ? '● LIVE prices · affiliate' : '● LIVE prices';
    var modeBadge = isLive
      ? '<span class="badge badge-live">' + liveLabel + '</span>'
      : '<span class="badge badge-est">Estimated prices</span>';
    var savingsLine = pr.savings > 0
      ? '<div class="savings-banner">💰 Prices range ' + money(pr.lowest) + ' – ' + money(pr.highest) +
        '. Buying smart saves you up to <strong>' + money(pr.savings) + ' (' + pr.savingsPct + '%)</strong> on the same product.</div>'
      : '';
    var pickLine = pr.pick
      ? '<div class="pick-banner">✅ <strong>Our anti-rip-off pick:</strong> ' + escapeAttr(pr.pick.name) +
        ' at ' + money(pr.pick.price) + ' — the best balance of a fair price and strong buyer protection.</div>'
      : '';
    var disclaimer = isLive
      ? (source === 'affiliate'
          ? 'Live prices from our affiliate partners — some links are affiliate links and we may earn a commission at no extra cost to you. Prices and availability change fast; confirm the final total at checkout.'
          : 'Live results from a shopping API. Prices and availability change fast — always confirm the seller and final total at checkout.')
      : 'A “≈” marks an estimated price for comparison — tap that store to find the live price. The manufacturer “Buy Direct” link (marked <em>exact</em>) goes straight to the product at its real price. For exact prices on every store, enable Live Prices / affiliate feeds (see “How We Protect You”). Always confirm the item is sold by the retailer, not a third-party reseller.';
    return modeBadge + savingsLine + pickLine +
      '<div class="offers">' + offers.map(offerRow).join('') + '</div>' +
      '<p class="muted small modal-disclaimer">' + disclaimer + '</p>';
  }

  function openCompare(id) {
    var p = BFG.getById(id);
    if (!p) return;

    var features = p.features.map(function (f) { return '<li>' + f + '</li>'; }).join('');
    var liveOn = BFG.prices && BFG.prices.isEnabled();
    var statusLine = liveOn
      ? '<span id="price-status" class="price-status">⏳ checking live prices…</span>'
      : '';

    var overlay = el(
      '<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Compare prices for ' + escapeAttr(p.name) + '">' +
        '<div class="modal">' +
          '<button class="modal-close" aria-label="Close">✕</button>' +
          '<div class="modal-head">' +
            '<span id="modal-thumb">' + thumb(p) + '</span>' +
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
              '<h4>Compare prices &amp; buy ' + statusLine + '</h4>' +
              '<div id="modal-offers-body">' + offersBodyHTML(p.pricing, false) + '</div>' +
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

    // upgrade to live prices + real photo if configured
    if (liveOn) {
      BFG.prices.fetchFor(p).then(function (live) {
        var body = overlay.querySelector('#modal-offers-body');
        if (body) body.innerHTML = offersBodyHTML(live.pricing, true, live.source);
        var status = overlay.querySelector('#price-status');
        if (status) status.parentNode.removeChild(status);
        if (live.image) {
          var t = overlay.querySelector('#modal-thumb');
          if (t) t.innerHTML = thumb(p, { image: live.image });
        }
      }).catch(function () {
        var status = overlay.querySelector('#price-status');
        if (status) {
          status.className = 'price-status price-status-warn';
          status.textContent = 'live prices unavailable — showing estimates';
        }
      });
    }
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
