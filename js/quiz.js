/* =============================================================
   Bytes For Gaming — Quiz
   Category picker -> category-specific questions -> matched
   products scored against shared tags + budget + rating.
   ============================================================= */
(function () {
  'use strict';

  var BFG = window.BFG;
  var ui = BFG.ui;

  /* ---------------------------------------------------------
     QUIZ DEFINITIONS
     Each option carries `tags` (weights) that are matched
     against product.tags. A `budget` option sets a max price.
     --------------------------------------------------------- */
  var QUIZZES = {
    controller: {
      title: 'Controller Finder', icon: '🎮',
      intro: 'Answer 5 quick questions and we will match you with the right gamepad.',
      questions: [
        { q: 'What will you play on most?', options: [
          { label: 'PC', tags: { pc: 3 } },
          { label: 'Xbox', tags: { xbox: 3 } },
          { label: 'PlayStation', tags: { playstation: 3 } },
          { label: 'Switch / Retro / Mobile', tags: { switch: 3, retro: 2, mobile: 2 } }
        ]},
        { q: 'Wired or wireless?', options: [
          { label: 'Wireless freedom', tags: { wireless: 3 } },
          { label: 'Wired (lowest latency)', tags: { wired: 3 } },
          { label: 'No preference', tags: { wireless: 1, wired: 1 } }
        ]},
        { q: 'How serious is your play?', options: [
          { label: 'Competitive — I want pro features', tags: { pro: 3, customizable: 2 } },
          { label: 'I hate stick drift', tags: { hallEffect: 3 } },
          { label: 'Casual / couch co-op', tags: { comfortGrip: 2 } }
        ]},
        { q: 'Do you want back buttons / remapping?', options: [
          { label: 'Yes, full customization', tags: { customizable: 3, pro: 1 } },
          { label: 'Nice to have', tags: { customizable: 1 } },
          { label: 'Keep it simple', tags: { comfortGrip: 1 } }
        ]},
        { q: 'Your budget?', budget: true, options: [
          { label: 'Under $60', max: 60 },
          { label: '$60 – $100', max: 100 },
          { label: '$100+', max: 9999 }
        ]}
      ]
    },

    keyboard: {
      title: 'Keyboard Finder', icon: '⌨️',
      intro: 'Tell us how you type and play, and we will find your board.',
      questions: [
        { q: 'How much desk space do you want it to take?', options: [
          { label: 'Full-size (with numpad)', tags: { fullsize: 3 } },
          { label: 'Tenkeyless (no numpad)', tags: { tkl: 3 } },
          { label: 'Compact 60–75% (max desk room)', tags: { compact60: 3 } }
        ]},
        { q: 'Switch feel?', options: [
          { label: 'Smooth & fast (linear)', tags: { linear: 3, optical: 1 } },
          { label: 'Bumpy feedback (tactile)', tags: { tactile: 3 } },
          { label: 'Quiet / low-profile', tags: { quiet: 3, lowprofile: 3 } }
        ]},
        { q: 'Wired or wireless?', options: [
          { label: 'Wireless', tags: { wireless: 3 } },
          { label: 'Wired', tags: { wired: 3 } },
          { label: 'Either is fine', tags: { wireless: 1, wired: 1 } }
        ]},
        { q: 'Do you want to mod / swap switches later?', options: [
          { label: 'Yes — hot-swap please', tags: { hotswap: 3 } },
          { label: 'RGB lighting matters more', tags: { rgb: 2 } },
          { label: 'No, just works out of the box', tags: {} }
        ]},
        { q: 'Your budget?', budget: true, options: [
          { label: 'Under $90', max: 90 },
          { label: '$90 – $160', max: 160 },
          { label: '$160+', max: 9999 }
        ]}
      ]
    },

    mouse: {
      title: 'Mouse Finder', icon: '🖱️',
      intro: 'Grip, genre, and weight decide the perfect mouse. Let us match you.',
      questions: [
        { q: 'What do you play most?', options: [
          { label: 'FPS / fast aim', tags: { fps: 3, lightweight: 2 } },
          { label: 'MMO / lots of abilities', tags: { mmo: 3 } },
          { label: 'A bit of everything', tags: { fps: 1, ergonomic: 1 } }
        ]},
        { q: 'How do you hold a mouse?', options: [
          { label: 'Palm (whole hand rests)', tags: { palmgrip: 3, ergonomic: 2 } },
          { label: 'Claw / fingertip', tags: { clawgrip: 3, lightweight: 1 } },
          { label: 'Not sure', tags: { ergonomic: 1, ambidextrous: 1 } }
        ]},
        { q: 'Weight preference?', options: [
          { label: 'As light as possible', tags: { lightweight: 3 } },
          { label: 'Balanced / heftier is fine', tags: { ergonomic: 1, mmo: 1 } }
        ]},
        { q: 'Wired or wireless?', options: [
          { label: 'Wireless', tags: { wireless: 3 } },
          { label: 'Wired (and cheaper)', tags: { wired: 3 } },
          { label: 'No preference', tags: { wireless: 1, wired: 1 } }
        ]},
        { q: 'Your budget?', budget: true, options: [
          { label: 'Under $60', max: 60 },
          { label: '$60 – $110', max: 110 },
          { label: '$110+', max: 9999 }
        ]}
      ]
    },

    headset: {
      title: 'Headset Finder', icon: '🎧',
      intro: 'From budget comfort kings to flagship wireless — find your sound.',
      questions: [
        { q: 'Wired or wireless?', options: [
          { label: 'Wireless', tags: { wireless: 3 } },
          { label: 'Wired (best value)', tags: { wired: 3 } },
          { label: 'No preference', tags: { wireless: 1, wired: 1 } }
        ]},
        { q: 'What matters most?', options: [
          { label: 'Immersive surround for games', tags: { surround: 3 } },
          { label: 'Hi-fi music + games', tags: { hifi: 3 } },
          { label: 'Block out noise (ANC)', tags: { noiseCancel: 3 } }
        ]},
        { q: 'How long are your sessions?', options: [
          { label: 'Marathon — comfort is king', tags: { comfortLongSession: 3, lightweight: 1 } },
          { label: 'A couple hours', tags: { comfortLongSession: 1 } }
        ]},
        { q: 'Need a great mic for chat/streaming?', options: [
          { label: 'Yes — detachable, clear mic', tags: { detachableMic: 3 } },
          { label: 'Built-in is fine', tags: {} }
        ]},
        { q: 'Your budget?', budget: true, options: [
          { label: 'Under $100', max: 100 },
          { label: '$100 – $200', max: 200 },
          { label: '$200+', max: 9999 }
        ]}
      ]
    },

    chair: {
      title: 'Chair Finder', icon: '🪑',
      intro: 'Protect your back. We will match a chair to your body and budget.',
      questions: [
        { q: 'What is your priority?', options: [
          { label: 'Maximum ergonomics / posture', tags: { ergonomic: 3, lumbar: 2 } },
          { label: 'Strong lower-back support', tags: { lumbar: 3 } },
          { label: 'Comfort on a budget', tags: { ergonomic: 1 } }
        ]},
        { q: 'Material preference?', options: [
          { label: 'Breathable fabric', tags: { fabric: 3 } },
          { label: 'Leather-style (easy to clean)', tags: { leather: 3 } },
          { label: 'Mesh (coolest)', tags: { mesh: 3 } }
        ]},
        { q: 'Your build?', options: [
          { label: 'Taller / larger frame', tags: { bigtall: 3 } },
          { label: 'Smaller / compact', tags: { compact: 3 } },
          { label: 'Average', tags: {} }
        ]},
        { q: 'Want to recline / lean back?', options: [
          { label: 'Yes, deep recline', tags: { recline: 3 } },
          { label: 'Not important', tags: {} }
        ]},
        { q: 'Your budget?', budget: true, options: [
          { label: 'Under $250', max: 250 },
          { label: '$250 – $600', max: 600 },
          { label: '$600+', max: 99999 }
        ]}
      ]
    },

    mousepad: {
      title: 'Mousepad Finder', icon: '🟪',
      intro: 'Speed vs control, and how much desk to cover. Quick and easy.',
      questions: [
        { q: 'Glide style?', options: [
          { label: 'Control (more stopping power)', tags: { control: 3, cloth: 1 } },
          { label: 'Speed (fast, low friction)', tags: { speed: 3, hardsurface: 1 } },
          { label: 'Balanced', tags: { control: 1, speed: 1 } }
        ]},
        { q: 'How big?', options: [
          { label: 'Desk-mat / XL (cover keyboard + mouse)', tags: { xl: 3, desk: 2 } },
          { label: 'Standard mouse size', tags: {} }
        ]},
        { q: 'Surface?', options: [
          { label: 'Soft cloth', tags: { cloth: 3 } },
          { label: 'Spill / water resistant', tags: { waterproof: 3 } },
          { label: 'No preference', tags: {} }
        ]},
        { q: 'Your budget?', budget: true, options: [
          { label: 'Under $35', max: 35 },
          { label: '$35+', max: 9999 }
        ]}
      ]
    },

    mic: {
      title: 'Microphone Finder', icon: '🎙️',
      intro: 'Stream, chat, or podcast with clear audio at any budget.',
      questions: [
        { q: 'What is it for?', options: [
          { label: 'Streaming / content', tags: { streaming: 3 } },
          { label: 'Podcasting / recording', tags: { podcast: 3 } },
          { label: 'Just clearer voice chat', tags: { cardioid: 2, plugplay: 1 } }
        ]},
        { q: 'Setup comfort?', options: [
          { label: 'Plug-and-play USB (easiest)', tags: { usb: 3, plugplay: 3 } },
          { label: 'I want software mixing / control', tags: { gain: 2, streaming: 1 } }
        ]},
        { q: 'Your budget?', budget: true, options: [
          { label: 'Under $60', max: 60 },
          { label: '$60 – $130', max: 130 },
          { label: '$130+', max: 9999 }
        ]}
      ]
    },

    webcam: {
      title: 'Webcam Finder', icon: '📷',
      intro: 'Sharp, well-lit video for streams and calls — find your match.',
      questions: [
        { q: 'What resolution do you need?', options: [
          { label: '1080p is plenty', tags: { '1080p': 3 } },
          { label: 'I want 4K', tags: { '4k': 3, premium: 1 } }
        ]},
        { q: 'Mainly for…', options: [
          { label: 'Streaming / content', tags: { streaming: 3 } },
          { label: 'Video calls / meetings', tags: { calls: 3 } }
        ]},
        { q: 'What matters most?', options: [
          { label: 'Looking good in dim light', tags: { lowlight: 3 } },
          { label: 'Sharp, reliable autofocus', tags: { autofocus: 3 } },
          { label: 'A privacy shutter', tags: { privacy: 3 } }
        ]},
        { q: 'Your budget?', budget: true, options: [
          { label: 'Under $80', max: 80 },
          { label: '$80 – $150', max: 150 },
          { label: '$150+', max: 9999 }
        ]}
      ]
    }
  };

  /* ---------------------------------------------------------
     SCORING
     --------------------------------------------------------- */
  function scoreProducts(cat, answers) {
    var products = BFG.byCategory(cat);
    var quiz = QUIZZES[cat];
    var maxBudget = 99999;

    // collect tag weights + budget from chosen answers
    var wanted = {};
    var maxPossible = 0;
    quiz.questions.forEach(function (question, qi) {
      var chosen = answers[qi];
      if (chosen == null) return;
      var opt = question.options[chosen];
      if (question.budget) {
        maxBudget = opt.max;
        return;
      }
      Object.keys(opt.tags || {}).forEach(function (t) {
        wanted[t] = (wanted[t] || 0) + opt.tags[t];
        maxPossible += opt.tags[t];
      });
    });

    var scored = products.map(function (p) {
      var raw = 0;
      Object.keys(wanted).forEach(function (t) {
        if (p.tags.indexOf(t) !== -1) raw += wanted[t];
      });
      // budget handling: over budget = heavy penalty but not elimination
      var overBudget = p.bestPrice > maxBudget;
      var budgetPenalty = overBudget ? Math.min(0.6, (p.bestPrice - maxBudget) / maxBudget) : 0;
      var withinBonus = !overBudget ? 0.08 : 0;

      var base = maxPossible > 0 ? raw / maxPossible : 0;
      var ratingBonus = (p.rating - 4.0) * 0.12; // up to ~0.11
      var match = Math.max(0, base + ratingBonus + withinBonus - budgetPenalty);

      return {
        product: p,
        match: Math.round(Math.min(1, match) * 100),
        overBudget: overBudget
      };
    });

    scored.sort(function (a, b) {
      if (b.match !== a.match) return b.match - a.match;
      return b.product.rating - a.product.rating;
    });
    return scored;
  }

  /* ---------------------------------------------------------
     RENDERING
     --------------------------------------------------------- */
  var root, state;

  function start(cat) {
    state = { cat: cat, step: 0, answers: [] };
    renderQuestion();
  }

  function renderCategoryPicker() {
    var cards = Object.keys(QUIZZES).map(function (cat) {
      var q = QUIZZES[cat];
      var count = BFG.byCategory(cat).length;
      return '<button class="card cat-card js-cat" data-cat="' + cat + '">' +
          '<span class="cat-card-icon">' + q.icon + '</span>' +
          '<span class="cat-card-title">' + BFG.CATEGORIES[cat].label + '</span>' +
          '<span class="muted small">' + BFG.CATEGORIES[cat].blurb + '</span>' +
          '<span class="cat-card-cta">Start quiz →</span>' +
        '</button>';
    }).join('');

    root.innerHTML =
      '<div class="quiz-intro">' +
        '<h1>Find your perfect <span class="accent">gaming gear</span></h1>' +
        '<p class="lead">Pick a category and answer a few questions. We will match you with the best-fitting products across 8BitDo, Razer, Logitech G, SteelSeries, and more — then show you where to buy it for the best price.</p>' +
      '</div>' +
      '<div class="cat-grid">' + cards + '</div>';

    Array.prototype.forEach.call(root.querySelectorAll('.js-cat'), function (b) {
      b.addEventListener('click', function () { start(b.getAttribute('data-cat')); });
    });
  }

  function renderQuestion() {
    var quiz = QUIZZES[state.cat];
    var q = quiz.questions[state.step];
    var total = quiz.questions.length;
    var pct = Math.round((state.step) / total * 100);

    var opts = q.options.map(function (opt, i) {
      var selected = state.answers[state.step] === i ? ' selected' : '';
      return '<button class="quiz-option js-opt' + selected + '" data-i="' + i + '">' +
          '<span class="opt-radio"></span><span>' + opt.label + '</span>' +
        '</button>';
    }).join('');

    root.innerHTML =
      '<div class="quiz-card card">' +
        '<div class="quiz-top">' +
          '<button class="btn btn-ghost btn-sm js-back">‹ ' + (state.step === 0 ? 'Categories' : 'Back') + '</button>' +
          '<span class="muted small">' + quiz.icon + ' ' + quiz.title + '</span>' +
          '<span class="muted small">Q' + (state.step + 1) + ' / ' + total + '</span>' +
        '</div>' +
        '<div class="progress"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
        '<h2 class="quiz-q">' + q.q + '</h2>' +
        '<div class="quiz-options">' + opts + '</div>' +
      '</div>';

    Array.prototype.forEach.call(root.querySelectorAll('.js-opt'), function (b) {
      b.addEventListener('click', function () {
        state.answers[state.step] = parseInt(b.getAttribute('data-i'), 10);
        if (state.step < total - 1) {
          state.step++;
          renderQuestion();
        } else {
          renderResults();
        }
      });
    });
    root.querySelector('.js-back').addEventListener('click', function () {
      if (state.step === 0) { renderCategoryPicker(); }
      else { state.step--; renderQuestion(); }
    });
  }

  function renderResults() {
    var scored = scoreProducts(state.cat, state.answers);
    var top = scored.slice(0, 4);
    var quiz = QUIZZES[state.cat];

    root.innerHTML =
      '<div class="results-head">' +
        '<span class="badge badge-match">Your matches</span>' +
        '<h1>' + quiz.icon + ' Your top ' + BFG.CATEGORIES[state.cat].label.toLowerCase() + ' picks</h1>' +
        '<p class="lead">Ranked by how well they fit your answers, your budget, and real review scores. Click any card to compare prices across stores and find the best deal.</p>' +
        '<div class="results-actions">' +
          '<button class="btn btn-secondary js-retake">↻ Retake this quiz</button>' +
          '<button class="btn btn-ghost js-other">Try another category</button>' +
        '</div>' +
      '</div>' +
      '<div class="grid" id="results-grid"></div>';

    var grid = document.getElementById('results-grid');
    top.forEach(function (r) {
      grid.appendChild(ui.productCard(r.product, { match: r.match }));
    });

    root.querySelector('.js-retake').addEventListener('click', function () { start(state.cat); });
    root.querySelector('.js-other').addEventListener('click', renderCategoryPicker);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------------------------------------------------------
     EXPOSE (for reuse + testing)
     --------------------------------------------------------- */
  BFG.quiz = { QUIZZES: QUIZZES, scoreProducts: scoreProducts };

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    root = document.getElementById('quiz-root');
    if (!root) return;
    // deep-link support: quiz.html?cat=keyboard
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('cat');
    if (cat && QUIZZES[cat]) { start(cat); }
    else { renderCategoryPicker(); }
  });
})();
