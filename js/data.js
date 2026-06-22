/* =============================================================
   Bytes For Gaming — Data Layer
   Brands, retailers, product catalog, and pricing helpers.
   No build step, no dependencies. Exposed on window.BFG.
   ============================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     RETAILERS
     consumerScore (1-5) reflects buyer protection: returns,
     warranty support, price transparency, authenticity.
     Links are LIVE SEARCH urls so prices/deals are always
     current and links never 404 on a discontinued SKU.
     --------------------------------------------------------- */
  var RETAILERS = {
    amazon: {
      name: 'Amazon',
      consumerScore: 4,
      blurb: 'Fast, easy 30-day returns and A-to-z buyer protection. Check the seller says "Ships from / Sold by Amazon" to dodge gray-market resellers.',
      search: function (q) { return 'https://www.amazon.com/s?k=' + encodeURIComponent(q); }
    },
    bestbuy: {
      name: 'Best Buy',
      consumerScore: 5,
      blurb: 'Price-match guarantee, in-store returns, official manufacturer warranty and Geek Squad support. One of the safest places to buy.',
      search: function (q) { return 'https://www.bestbuy.com/site/searchpage.jsp?st=' + encodeURIComponent(q); }
    },
    walmart: {
      name: 'Walmart',
      consumerScore: 4,
      blurb: 'Transparent pricing and a generous return window. Confirm the listing is sold by Walmart, not a marketplace seller.',
      search: function (q) { return 'https://www.walmart.com/search?q=' + encodeURIComponent(q); }
    },
    newegg: {
      name: 'Newegg',
      consumerScore: 4,
      blurb: 'A PC-gamer favorite with frequent combo deals. Great prices, but read the return policy on open-box items first.',
      search: function (q) { return 'https://www.newegg.com/p/pl?d=' + encodeURIComponent(q); }
    },
    manufacturer: {
      name: 'Manufacturer Direct',
      consumerScore: 5,
      blurb: 'Guaranteed authentic with the full factory warranty and best support. Sometimes costs a little more, but zero rip-off risk.',
      search: null // resolved per-brand below
    }
  };

  /* ---------------------------------------------------------
     BRANDS — official sites + accent colors for visuals.
     Manufacturer-direct links point to the official store,
     which always resolves.
     --------------------------------------------------------- */
  var BRANDS = {
    '8BitDo':       { site: 'https://www.8bitdo.com/',                      color: '#e60012' },
    'Razer':        { site: 'https://www.razer.com/',                       color: '#44d62c' },
    'Logitech G':   { site: 'https://www.logitechg.com/',                   color: '#00b8fc' },
    'SteelSeries':  { site: 'https://steelseries.com/',                     color: '#ff5200' },
    'Corsair':      { site: 'https://www.corsair.com/',                     color: '#ffd200' },
    'HyperX':       { site: 'https://hyperx.com/',                          color: '#e4002b' },
    'Keychron':     { site: 'https://www.keychron.com/',                    color: '#f04e23' },
    'Glorious':     { site: 'https://www.gloriousgaming.com/',              color: '#ffce1f' },
    'Secretlab':    { site: 'https://secretlab.co/',                        color: '#c8a45c' },
    'Sony':         { site: 'https://www.playstation.com/accessories/',     color: '#0070d1' },
    'Xbox':         { site: 'https://www.xbox.com/accessories',             color: '#107c10' },
    'Herman Miller':{ site: 'https://www.hermanmiller.com/gaming/',         color: '#d8412f' }
  };

  /* ---------------------------------------------------------
     CATEGORIES
     --------------------------------------------------------- */
  var CATEGORIES = {
    controller: { label: 'Controllers', icon: '🎮', blurb: 'Gamepads for PC, console, and retro — wired, wireless, and pro.' },
    keyboard:   { label: 'Keyboards',   icon: '⌨️', blurb: 'Mechanical, optical, and low-profile boards for every desk.' },
    mouse:      { label: 'Mice',        icon: '🖱️', blurb: 'Featherweight FPS mice to button-loaded MMO rigs.' },
    headset:    { label: 'Headsets',    icon: '🎧', blurb: 'Immersive audio and crystal-clear comms for long sessions.' },
    chair:      { label: 'Chairs',      icon: '🪑', blurb: 'Ergonomic seating that protects your back, not just your K/D.' },
    mousepad:   { label: 'Mousepads',   icon: '🟪', blurb: 'Speed, control, and desk-sized surfaces for pixel-perfect aim.' },
    mic:        { label: 'Microphones', icon: '🎙️', blurb: 'Stream and chat with studio-grade clarity.' }
  };

  /* ---------------------------------------------------------
     PRODUCT CATALOG
     price  = typical street price (USD)
     msrp   = manufacturer suggested price (USD)
     rating = aggregate review score (out of 5)
     tags   = quiz-matching attributes (shared with quiz options)
     --------------------------------------------------------- */
  var PRODUCTS = [
    /* ---------------- CONTROLLERS ---------------- */
    {
      id: '8bitdo-ultimate-bt', name: '8BitDo Ultimate Bluetooth Controller', brand: '8BitDo', category: 'controller',
      price: 49.99, msrp: 69.99, rating: 4.7,
      highlight: 'Pro-level features at a budget price, with Hall-effect sticks that never drift.',
      features: ['Hall-effect joysticks (drift-proof)', 'Charging dock included', 'Back buttons + custom profiles', 'Bluetooth, 2.4G, and USB-C'],
      tags: ['pc', 'switch', 'mobile', 'wireless', 'budget', 'pro', 'hallEffect', 'customizable', 'comfortGrip'],
      valueNote: 'One of the best value-to-feature ratios on the market — drift-proof sticks usually cost twice this.'
    },
    {
      id: '8bitdo-pro2', name: '8BitDo Pro 2', brand: '8BitDo', category: 'controller',
      price: 49.99, msrp: 49.99, rating: 4.6,
      highlight: 'Retro SNES looks with modern back paddles and deep customization.',
      features: ['Retro design + modern layout', 'Back paddles', 'Profile switching on the fly', 'Works on Switch, PC, mobile, Pi'],
      tags: ['pc', 'switch', 'mobile', 'wireless', 'wired', 'budget', 'retro', 'customizable', 'comfortGrip'],
      valueNote: 'Hugely flexible for the price; a favorite for emulation and indie games.'
    },
    {
      id: 'xbox-core', name: 'Xbox Wireless Controller', brand: 'Xbox', category: 'controller',
      price: 54.99, msrp: 64.99, rating: 4.8,
      highlight: 'The all-rounder. Rock-solid on Xbox, PC, and mobile with superb ergonomics.',
      features: ['Textured grips + triggers', 'Bluetooth + Xbox Wireless', 'Share button', 'Swappable AA or rechargeable'],
      tags: ['pc', 'xbox', 'mobile', 'wireless', 'budget', 'comfortGrip'],
      valueNote: 'The safe default — widely available and frequently discounted below MSRP.'
    },
    {
      id: 'xbox-elite-2', name: 'Xbox Elite Wireless Controller Series 2', brand: 'Xbox', category: 'controller',
      price: 149.99, msrp: 179.99, rating: 4.5,
      highlight: 'The premium pro-pad: swappable sticks, paddles, and adjustable triggers.',
      features: ['Interchangeable thumbsticks + paddles', 'Adjustable-tension sticks', 'Hair-trigger locks', 'Built-in rechargeable battery'],
      tags: ['pc', 'xbox', 'wireless', 'premium', 'pro', 'customizable', 'comfortGrip'],
      valueNote: 'Pricey — only worth it if you will actually use the paddles and tuning.'
    },
    {
      id: 'sony-dualsense', name: 'Sony DualSense Wireless Controller', brand: 'Sony', category: 'controller',
      price: 69.99, msrp: 74.99, rating: 4.7,
      highlight: 'Haptic feedback and adaptive triggers make PS5 games feel alive.',
      features: ['Haptic feedback', 'Adaptive triggers', 'Built-in mic', 'USB-C rechargeable'],
      tags: ['playstation', 'pc', 'wireless', 'premium', 'comfortGrip'],
      valueNote: 'Best-in-class immersion on PS5; also a great PC pad over USB.'
    },
    {
      id: 'razer-wolverine-v2', name: 'Razer Wolverine V2 Chroma', brand: 'Razer', category: 'controller',
      price: 99.99, msrp: 149.99, rating: 4.3,
      highlight: 'Wired pro controller with mecha-tactile buttons and extra paddles.',
      features: ['6 remappable buttons', 'Mecha-tactile action buttons', 'Chroma RGB', 'Wired low-latency'],
      tags: ['pc', 'xbox', 'wired', 'premium', 'pro', 'customizable'],
      valueNote: 'Great for fighting games and shooters if you prefer a wired connection.'
    },

    /* ---------------- KEYBOARDS ---------------- */
    {
      id: 'keychron-k2', name: 'Keychron K2 (V2)', brand: 'Keychron', category: 'keyboard',
      price: 79.99, msrp: 89.99, rating: 4.6,
      highlight: 'The crowd-favorite 75% wireless board — Mac/Windows, hot-swap option, great typing.',
      features: ['75% compact layout', 'Bluetooth + USB-C', 'Hot-swap version available', 'Mac & Windows keycaps'],
      tags: ['mechanical', 'compact60', 'tkl', 'wireless', 'wired', 'hotswap', 'tactile', 'budget'],
      valueNote: 'Outstanding entry into mechanical keyboards without overpaying.'
    },
    {
      id: 'logi-g915-tkl', name: 'Logitech G915 TKL Lightspeed', brand: 'Logitech G', category: 'keyboard',
      price: 169.99, msrp: 229.99, rating: 4.6,
      highlight: 'Ultra-slim low-profile wireless board with a premium aluminum deck.',
      features: ['Low-profile mechanical switches', 'Lightspeed wireless + Bluetooth', 'Aluminum top case', 'Up to 40h RGB battery'],
      tags: ['mechanical', 'lowprofile', 'tkl', 'wireless', 'rgb', 'premium', 'linear', 'quiet'],
      valueNote: 'A splurge, but the only top-tier low-profile wireless option for many.'
    },
    {
      id: 'razer-huntsman-mini', name: 'Razer Huntsman Mini', brand: 'Razer', category: 'keyboard',
      price: 99.99, msrp: 119.99, rating: 4.5,
      highlight: 'Compact 60% optical board with blazing actuation for fast-paced FPS.',
      features: ['60% form factor', 'Optical switches (fast)', 'Doubleshot PBT keycaps', 'Onboard memory'],
      tags: ['optical', 'compact60', 'wired', 'rgb', 'linear', 'premium'],
      valueNote: 'Frees up huge desk space for low-sens FPS players.'
    },
    {
      id: 'corsair-k70', name: 'Corsair K70 RGB PRO', brand: 'Corsair', category: 'keyboard',
      price: 139.99, msrp: 169.99, rating: 4.6,
      highlight: 'Full-size mainstay with Cherry MX switches and a sturdy aluminum frame.',
      features: ['Full-size + media wheel', 'Cherry MX switches', 'Aluminum frame', 'Per-key RGB + macros'],
      tags: ['mechanical', 'fullsize', 'wired', 'rgb', 'tactile', 'linear', 'premium'],
      valueNote: 'A long-lasting do-everything board for work and play.'
    },
    {
      id: 'steelseries-apex-pro', name: 'SteelSeries Apex Pro TKL', brand: 'SteelSeries', category: 'keyboard',
      price: 189.99, msrp: 219.99, rating: 4.5,
      highlight: 'Adjustable per-key actuation lets you tune feel and speed precisely.',
      features: ['Adjustable actuation depth', 'OLED smart display', 'Magnetic wrist rest', 'Hot-swap switches'],
      tags: ['mechanical', 'tkl', 'wired', 'rgb', 'linear', 'premium', 'hotswap'],
      valueNote: 'For tinkerers who want to dial in their switches; premium price to match.'
    },
    {
      id: 'hyperx-alloy-origins', name: 'HyperX Alloy Origins Core', brand: 'HyperX', category: 'keyboard',
      price: 69.99, msrp: 89.99, rating: 4.6,
      highlight: 'Affordable, solid TKL with HyperX switches and a full aluminum body.',
      features: ['TKL aluminum body', 'HyperX mechanical switches', 'Per-key RGB', 'Adjustable feet'],
      tags: ['mechanical', 'tkl', 'wired', 'rgb', 'linear', 'budget'],
      valueNote: 'Punches well above its price — a top budget mechanical pick.'
    },

    /* ---------------- MICE ---------------- */
    {
      id: 'logi-superlight-2', name: 'Logitech G Pro X Superlight 2', brand: 'Logitech G', category: 'mouse',
      price: 129.99, msrp: 159.99, rating: 4.7,
      highlight: 'The esports standard: ~60g, flawless sensor, multi-day battery.',
      features: ['~60g ultralight', 'HERO 2 sensor (32K DPI)', 'Lightspeed wireless', 'Up to 95h battery'],
      tags: ['wireless', 'lightweight', 'ambidextrous', 'fps', 'clawgrip', 'palmgrip', 'highdpi', 'premium'],
      valueNote: 'Used by a huge share of pros; expensive but the gold standard.'
    },
    {
      id: 'razer-deathadder-v3', name: 'Razer DeathAdder V3 Pro', brand: 'Razer', category: 'mouse',
      price: 119.99, msrp: 149.99, rating: 4.7,
      highlight: 'The ergonomic icon, reborn ultralight for serious FPS players.',
      features: ['Ergonomic right-handed shape', '~63g', 'Focus Pro 30K sensor', 'HyperSpeed wireless'],
      tags: ['wireless', 'lightweight', 'ergonomic', 'fps', 'palmgrip', 'highdpi', 'premium'],
      valueNote: 'The most comfortable ultralight for larger hands and palm-grippers.'
    },
    {
      id: 'razer-viper-v2', name: 'Razer Viper V2 Pro', brand: 'Razer', category: 'mouse',
      price: 99.99, msrp: 149.99, rating: 4.6,
      highlight: 'Symmetrical ultralight built for raw competitive speed.',
      features: ['~58g ambidextrous shape', 'Focus Pro 30K sensor', 'Optical switches', 'HyperSpeed wireless'],
      tags: ['wireless', 'lightweight', 'ambidextrous', 'fps', 'clawgrip', 'highdpi', 'premium'],
      valueNote: 'Frequently discounted to a great price for its tier.'
    },
    {
      id: 'logi-g502x', name: 'Logitech G502 X', brand: 'Logitech G', category: 'mouse',
      price: 59.99, msrp: 79.99, rating: 4.6,
      highlight: 'The legendary feature-loaded mouse with 13 controls and a tuned weight.',
      features: ['13 programmable controls', 'Hybrid optical-mechanical switches', 'HERO 25K sensor', 'Sniper button'],
      tags: ['wired', 'ergonomic', 'mmo', 'palmgrip', 'highdpi', 'budget'],
      valueNote: 'Best for players who want lots of buttons without going full MMO.'
    },
    {
      id: 'steelseries-aerox-3', name: 'SteelSeries Aerox 3 Wireless', brand: 'SteelSeries', category: 'mouse',
      price: 69.99, msrp: 99.99, rating: 4.4,
      highlight: 'Lightweight, water-resistant honeycomb mouse at a friendlier price.',
      features: ['~68g honeycomb shell', 'AquaBarrier water resistance', 'Quantum 2.0 wireless', 'USB-C fast charge'],
      tags: ['wireless', 'lightweight', 'ambidextrous', 'fps', 'clawgrip', 'budget'],
      valueNote: 'A solid mid-budget ultralight that often drops in price.'
    },
    {
      id: 'glorious-model-o', name: 'Glorious Model O', brand: 'Glorious', category: 'mouse',
      price: 49.99, msrp: 59.99, rating: 4.5,
      highlight: 'The honeycomb mouse that kicked off the ultralight craze — still a bargain.',
      features: ['~67g honeycomb', 'BAMF sensor', 'G-Skates feet', 'RGB'],
      tags: ['wired', 'lightweight', 'ambidextrous', 'fps', 'clawgrip', 'budget'],
      valueNote: 'Excellent first ultralight without breaking the bank.'
    },

    /* ---------------- HEADSETS ---------------- */
    {
      id: 'hyperx-cloud-2', name: 'HyperX Cloud II', brand: 'HyperX', category: 'headset',
      price: 79.99, msrp: 99.99, rating: 4.7,
      highlight: 'The legendary comfort-king headset that has topped budget lists for years.',
      features: ['Memory-foam ear cushions', 'Virtual 7.1 surround', 'Detachable noise-cancel mic', 'Multi-platform'],
      tags: ['wired', 'surround', 'detachableMic', 'comfortLongSession', 'multiplatform', 'budget'],
      valueNote: 'Still one of the best value headsets you can buy, period.'
    },
    {
      id: 'razer-blackshark-v2-pro', name: 'Razer BlackShark V2 Pro', brand: 'Razer', category: 'headset',
      price: 149.99, msrp: 199.99, rating: 4.5,
      highlight: 'Esports-grade wireless audio with a detachable broadcast-quality mic.',
      features: ['TriForce Titanium drivers', 'HyperClear detachable mic', 'Lightweight design', 'THX Spatial Audio'],
      tags: ['wireless', 'surround', 'detachableMic', 'lightweight', 'comfortLongSession', 'premium'],
      valueNote: 'Top-tier comp audio; watch for frequent sales under $150.'
    },
    {
      id: 'steelseries-arctis-nova-pro', name: 'SteelSeries Arctis Nova Pro Wireless', brand: 'SteelSeries', category: 'headset',
      price: 279.99, msrp: 349.99, rating: 4.5,
      highlight: 'Flagship audio with active noise cancellation and a hot-swap dual-battery base.',
      features: ['Active noise cancellation', 'Dual-battery hot-swap base', 'Hi-fi drivers', 'Multi-system switching'],
      tags: ['wireless', 'hifi', 'noiseCancel', 'comfortLongSession', 'multiplatform', 'premium'],
      valueNote: 'A luxury pick — only worth it if you want ANC and do-everything connectivity.'
    },
    {
      id: 'logi-pro-x-2', name: 'Logitech G Pro X 2 Lightspeed', brand: 'Logitech G', category: 'headset',
      price: 199.99, msrp: 249.99, rating: 4.4,
      highlight: 'Graphene-driver wireless headset tuned with input from pro players.',
      features: ['Graphene drivers', 'Lightspeed + Bluetooth', 'Blue VO!CE mic processing', 'Memory-foam pads'],
      tags: ['wireless', 'hifi', 'detachableMic', 'comfortLongSession', 'multiplatform', 'premium'],
      valueNote: 'Great all-rounder; compare against the BlackShark V2 Pro before buying.'
    },
    {
      id: 'sony-inzone-h9', name: 'Sony INZONE H9', brand: 'Sony', category: 'headset',
      price: 199.99, msrp: 299.99, rating: 4.3,
      highlight: 'Comfortable ANC wireless headset that pairs perfectly with PS5 and PC.',
      features: ['Active noise cancellation', '360 Spatial Sound', '~32h battery', 'Soft synthetic-leather pads'],
      tags: ['wireless', 'hifi', 'noiseCancel', 'comfortLongSession', 'playstation', 'premium'],
      valueNote: 'Often discounted hard — a strong deal when it drops near $150.'
    },

    /* ---------------- CHAIRS ---------------- */
    {
      id: 'secretlab-titan-evo', name: 'Secretlab TITAN Evo', brand: 'Secretlab', category: 'chair',
      price: 549.00, msrp: 619.00, rating: 4.7,
      highlight: 'The gold-standard gaming chair: integrated lumbar, magnetic memory-foam pillow.',
      features: ['4-way L-ADAPT lumbar support', 'Magnetic head pillow', 'NEO Hybrid Leatherette or fabric', 'Three sizes (S/R/XL)'],
      tags: ['ergonomic', 'lumbar', 'leather', 'fabric', 'recline', 'premium', 'bigtall', 'compact'],
      valueNote: 'Expensive but built to last 5+ years; comes in sizes for most body types.'
    },
    {
      id: 'razer-iskur', name: 'Razer Iskur', brand: 'Razer', category: 'chair',
      price: 499.00, msrp: 599.00, rating: 4.4,
      highlight: 'Aggressive built-in lumbar curve that hugs your lower back.',
      features: ['Adjustable lumbar curve', 'Multi-layer synthetic leather', 'Dense memory-foam head cushion', '4D armrests'],
      tags: ['ergonomic', 'lumbar', 'leather', 'recline', 'premium'],
      valueNote: 'Best for people who specifically want firm lower-back support.'
    },
    {
      id: 'corsair-tc100', name: 'Corsair TC100 Relaxed', brand: 'Corsair', category: 'chair',
      price: 199.99, msrp: 249.99, rating: 4.4,
      highlight: 'The smart budget pick — comfortable, breathable, and well-built.',
      features: ['Breathable fabric or leatherette', 'Memory-foam cushions', 'Reclines up to 160 degrees', '4D armrests'],
      tags: ['ergonomic', 'lumbar', 'fabric', 'leather', 'recline', 'budget'],
      valueNote: 'The best value gaming chair for most people on a budget.'
    },
    {
      id: 'herman-miller-embody', name: 'Herman Miller x Logitech G Embody', brand: 'Herman Miller', category: 'chair',
      price: 1495.00, msrp: 1695.00, rating: 4.6,
      highlight: 'A true ergonomic office chair built for gaming, with a 12-year warranty.',
      features: ['Pixelated support back', 'Cooling foam', 'Built for posture/circulation', '12-year warranty'],
      tags: ['ergonomic', 'lumbar', 'mesh', 'premium', 'bigtall'],
      valueNote: 'Investment-grade. The 12-year warranty is the consumer-protection win here.'
    },

    /* ---------------- MOUSEPADS ---------------- */
    {
      id: 'steelseries-qck-xxl', name: 'SteelSeries QcK XXL', brand: 'SteelSeries', category: 'mousepad',
      price: 29.99, msrp: 34.99, rating: 4.8,
      highlight: 'The dependable desk-sized cloth pad trusted by pros for two decades.',
      features: ['900 x 400 mm desk size', 'Micro-woven cloth (control)', 'Non-slip rubber base', 'Durable stitched-free edge'],
      tags: ['xl', 'desk', 'control', 'cloth', 'budget'],
      valueNote: 'Cheap, huge, and reliable — hard to go wrong.'
    },
    {
      id: 'logi-g840', name: 'Logitech G840 XL', brand: 'Logitech G', category: 'mousepad',
      price: 39.99, msrp: 49.99, rating: 4.7,
      highlight: 'A premium balanced cloth surface sized to cover keyboard and mouse.',
      features: ['900 x 400 mm', 'Balanced speed/control weave', '3mm rubber base', 'Performance-tuned surface'],
      tags: ['xl', 'desk', 'control', 'cloth', 'budget'],
      valueNote: 'A step up in stitching and surface consistency over basic pads.'
    },
    {
      id: 'razer-strider', name: 'Razer Strider Hybrid', brand: 'Razer', category: 'mousepad',
      price: 39.99, msrp: 59.99, rating: 4.5,
      highlight: 'Hybrid surface blends cloth glide with hard-pad speed; spill-resistant.',
      features: ['Soft-feel, hard-glide hybrid', 'Water/stain resistant', 'Rounded anti-fray edges', 'Multiple sizes'],
      tags: ['desk', 'speed', 'control', 'hardsurface', 'waterproof', 'budget'],
      valueNote: 'Nice middle ground if you cannot decide between speed and control.'
    },
    {
      id: 'glorious-3xl', name: 'Glorious 3XL Extended', brand: 'Glorious', category: 'mousepad',
      price: 39.99, msrp: 44.99, rating: 4.7,
      highlight: 'Enormous deskmat that covers the entire desk with a smooth control surface.',
      features: ['1220 x 610 mm full-desk', 'Stitched anti-fray edges', 'Control-focused cloth', 'Non-slip base'],
      tags: ['xl', 'desk', 'control', 'cloth', 'budget'],
      valueNote: 'Best if you want one mat to cover your whole setup.'
    },

    /* ---------------- MICROPHONES ---------------- */
    {
      id: 'hyperx-quadcast-s', name: 'HyperX QuadCast S', brand: 'HyperX', category: 'mic',
      price: 129.99, msrp: 159.99, rating: 4.7,
      highlight: 'Plug-and-play USB mic with RGB, a built-in shock mount, and tap-to-mute.',
      features: ['USB plug-and-play', 'Four polar patterns', 'Built-in pop filter + shock mount', 'Tap-to-mute sensor'],
      tags: ['usb', 'cardioid', 'streaming', 'podcast', 'plugplay', 'premium'],
      valueNote: 'Everything a new streamer needs in one box, no interface required.'
    },
    {
      id: 'elgato-wave3', name: 'Elgato Wave:3', brand: 'Corsair', category: 'mic',
      price: 129.99, msrp: 149.99, rating: 4.6,
      highlight: 'Streamer-focused USB mic with clip-guard and powerful Wave Link mixing software.',
      features: ['Cardioid condenser', 'Clipguard anti-distortion', 'Wave Link software mixer', 'Capacitive mute'],
      tags: ['usb', 'cardioid', 'streaming', 'podcast', 'plugplay', 'gain', 'premium'],
      valueNote: 'The Wave Link software is the real value for multi-source streamers.'
    },
    {
      id: 'razer-seiren-mini', name: 'Razer Seiren Mini', brand: 'Razer', category: 'mic',
      price: 49.99, msrp: 59.99, rating: 4.5,
      highlight: 'Tiny, affordable supercardioid mic that just works for chat and starting out.',
      features: ['Supercardioid (rejects background noise)', 'Compact footprint', 'Tilting stand', 'USB plug-and-play'],
      tags: ['usb', 'cardioid', 'streaming', 'plugplay', 'budget'],
      valueNote: 'A perfect first upgrade from a headset mic without overspending.'
    },
    {
      id: 'blue-yeti', name: 'Logitech for Creators Blue Yeti', brand: 'Logitech G', category: 'mic',
      price: 99.99, msrp: 129.99, rating: 4.6,
      highlight: 'The iconic do-it-all USB mic with four pickup patterns for any scenario.',
      features: ['Four polar patterns', 'Onboard gain + mute', 'Plug-and-play USB', 'Sturdy desktop stand'],
      tags: ['usb', 'cardioid', 'streaming', 'podcast', 'plugplay', 'gain', 'budget'],
      valueNote: 'Frequently on sale; a versatile workhorse for streams and calls.'
    }
  ];

  /* ---------------------------------------------------------
     PRICING ENGINE
     We do not scrape live prices (no backend), so we generate
     a realistic, STABLE set of retailer offers from each
     product's typical price + MSRP. Retailer links go to LIVE
     search results so the shopper always sees real-time deals.
     A deterministic per-id offset keeps numbers consistent
     between page loads.
     --------------------------------------------------------- */
  function hashId(id) {
    var h = 0;
    for (var i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) % 100000; }
    return h;
  }

  // Round to a believable price ending (.99 / .95 / .00)
  function tidyPrice(p) {
    var rounded = Math.round(p);
    var endings = [0.99, 0.95, 0.99, 0.49];
    var cents = endings[Math.abs(rounded) % endings.length];
    return Math.max(0, rounded - 1 + cents);
  }

  // Map a free-text retailer name (e.g. from a live API "source") to our
  // known retailer meta so live offers get the same buyer-protection scoring.
  function retailerMeta(name) {
    var n = String(name || '').toLowerCase();
    var keys = Object.keys(RETAILERS);
    for (var i = 0; i < keys.length; i++) {
      var r = RETAILERS[keys[i]];
      var token = r.name.toLowerCase().split(' ')[0]; // amazon / best / walmart / newegg
      if (n.indexOf(token) !== -1) return { key: keys[i], name: r.name, consumerScore: r.consumerScore, blurb: r.blurb };
    }
    // unknown third-party seller: treat with caution
    return {
      key: 'other', name: name || 'Other store', consumerScore: 3,
      blurb: 'Third-party seller — confirm the return policy, warranty, and seller reputation before buying.'
    };
  }

  // Pure: take raw offers [{key?,name,consumerScore,blurb,price,url}] and add
  // the lowest / most-trusted / our-pick badges + savings summary. Shared by
  // the estimate engine AND the live price path so behavior is identical.
  function decorateOffers(rawOffers) {
    var offers = rawOffers.filter(function (o) { return typeof o.price === 'number' && o.price > 0; });
    if (!offers.length) return { offers: [], lowest: 0, highest: 0, savings: 0, savingsPct: 0, pick: null };

    var prices = offers.map(function (o) { return o.price; });
    var min = Math.min.apply(null, prices);
    var max = Math.max.apply(null, prices);

    offers.forEach(function (o) {
      o.isLowest = (o.price === min);
      o.isMostTrusted = false;
      o.isOurPick = false;
    });

    // most trusted = highest consumerScore, tie broken by lowest price
    var trusted = offers.slice().sort(function (a, b) {
      if (b.consumerScore !== a.consumerScore) return b.consumerScore - a.consumerScore;
      return a.price - b.price;
    })[0];
    trusted.isMostTrusted = true;

    // "Our Pick" = best blend of buyer protection (50%) and price (50%)
    offers.forEach(function (o) {
      var protScore = o.consumerScore / 5;
      var priceScore = max === min ? 1 : (1 - (o.price - min) / (max - min));
      o.value = protScore * 0.5 + priceScore * 0.5;
    });
    var pick = offers.slice().sort(function (a, b) { return b.value - a.value; })[0];
    pick.isOurPick = true;

    return {
      offers: offers,
      lowest: min,
      highest: max,
      savings: +(max - min).toFixed(2),
      savingsPct: max > 0 ? Math.round(((max - min) / max) * 100) : 0,
      pick: pick
    };
  }

  function buildOffers(product) {
    var h = hashId(product.id);
    var base = product.price;
    var query = product.brand.replace(' G', '') + ' ' + product.name;
    var brand = BRANDS[product.brand] || { site: 'https://www.google.com/search?q=' + encodeURIComponent(query) };

    // deterministic per-retailer multipliers around the street price
    var plan = [
      { key: 'amazon',       mult: 1.00 + ((h % 5) - 2) / 100 },        // +/- 2%
      { key: 'bestbuy',      mult: 1.03 + ((h % 3)) / 100 },            // tends slightly higher, but trusted
      { key: 'walmart',      mult: 0.97 + ((h % 4)) / 100 },            // often cheapest
      { key: 'newegg',       mult: 1.01 + ((h % 6) - 3) / 100 },        // varies
      { key: 'manufacturer', mult: product.msrp / base }               // MSRP direct
    ];

    var offers = plan.map(function (row) {
      var r = RETAILERS[row.key];
      var price = tidyPrice(base * row.mult);
      var url = row.key === 'manufacturer' ? brand.site : r.search(query);
      return {
        key: row.key,
        name: r.name,
        consumerScore: r.consumerScore,
        blurb: r.blurb,
        price: price,
        url: url
      };
    });

    return decorateOffers(offers);
  }

  // attach computed pricing to every product once
  PRODUCTS.forEach(function (p) {
    p.pricing = buildOffers(p);
    p.bestPrice = p.pricing.lowest;
    // value rating: bigger spread + lower price vs msrp = better deal
    var discount = (p.msrp - p.bestPrice) / p.msrp;
    p.dealScore = Math.max(0, Math.min(100, Math.round(discount * 100)));
  });

  /* ---------------------------------------------------------
     IMAGES
     Each category ships a committed SVG illustration that always
     loads (no network). Products may also define an `image` URL
     (a real photo); the live price API can supply one too. The UI
     falls back illustration -> emoji if a photo fails to load.
     --------------------------------------------------------- */
  var CAT_IMAGE = {
    controller: 'images/controller.svg',
    keyboard: 'images/keyboard.svg',
    mouse: 'images/mouse.svg',
    headset: 'images/headset.svg',
    chair: 'images/chair.svg',
    mousepad: 'images/mousepad.svg',
    mic: 'images/mic.svg'
  };

  // Consistent search query for a product (used by links + the price API).
  function searchQuery(product) {
    return product.brand.replace(' G', '') + ' ' + product.name;
  }

  /* ---------------------------------------------------------
     PUBLIC API
     --------------------------------------------------------- */
  window.BFG = window.BFG || {};
  window.BFG.RETAILERS = RETAILERS;
  window.BFG.BRANDS = BRANDS;
  window.BFG.CATEGORIES = CATEGORIES;
  window.BFG.PRODUCTS = PRODUCTS;
  window.BFG.decorateOffers = decorateOffers;
  window.BFG.retailerMeta = retailerMeta;
  window.BFG.searchQuery = searchQuery;
  window.BFG.catImage = function (cat) { return CAT_IMAGE[cat] || ''; };

  window.BFG.getById = function (id) {
    return PRODUCTS.filter(function (p) { return p.id === id; })[0] || null;
  };
  window.BFG.byCategory = function (cat) {
    return PRODUCTS.filter(function (p) { return p.category === cat; });
  };
  window.BFG.brands = function () {
    return Object.keys(BRANDS);
  };
  // products sorted by deal quality (for the Deals page)
  window.BFG.topDeals = function (limit) {
    var sorted = PRODUCTS.slice().sort(function (a, b) {
      if (b.dealScore !== a.dealScore) return b.dealScore - a.dealScore;
      return b.rating - a.rating;
    });
    return limit ? sorted.slice(0, limit) : sorted;
  };
})();
