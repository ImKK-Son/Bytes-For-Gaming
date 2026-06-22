/* =============================================================
   Bytes For Gaming — Home page widgets
   Renders the category tiles, featured products, and a deals
   teaser on the landing page.
   ============================================================= */
(function () {
  'use strict';

  var BFG = window.BFG;
  var ui = BFG.ui;

  document.addEventListener('DOMContentLoaded', function () {
    /* category tiles */
    var tiles = document.getElementById('home-categories');
    if (tiles) {
      Object.keys(BFG.CATEGORIES).forEach(function (c) {
        var cat = BFG.CATEGORIES[c];
        var count = BFG.byCategory(c).length;
        var a = ui.el(
          '<a class="tile" href="quiz.html?cat=' + c + '">' +
            '<span class="tile-icon">' + cat.icon + '</span>' +
            '<span class="tile-title">' + cat.label + '</span>' +
            '<span class="muted small">' + count + ' options</span>' +
          '</a>'
        );
        tiles.appendChild(a);
      });
    }

    /* featured = top rated across categories */
    var feat = document.getElementById('home-featured');
    if (feat) {
      var picks = BFG.PRODUCTS.slice().sort(function (a, b) {
        return b.rating - a.rating;
      }).slice(0, 8);
      picks.forEach(function (p) { feat.appendChild(ui.productCard(p)); });
    }

    /* deals teaser */
    var teaser = document.getElementById('home-deals');
    if (teaser) {
      BFG.topDeals(3).forEach(function (p) {
        var saved = ui.money(p.msrp - p.bestPrice);
        var item = ui.el(
          '<div class="deal-mini" data-id="' + p.id + '">' +
            ui.thumb(p) +
            '<div class="deal-mini-body">' +
              '<strong>' + p.name + '</strong>' +
              '<div class="muted small">Save ' + saved + ' · now from ' + ui.money(p.bestPrice) + '</div>' +
            '</div>' +
            '<span class="badge badge-deal">-' + p.dealScore + '%</span>' +
          '</div>'
        );
        item.addEventListener('click', function () { ui.openCompare(p.id); });
        teaser.appendChild(item);
      });
    }
  });
})();
