/* Arena V3.2 — renderer PixiJS local. Não possui regras nem dados sensíveis. */
(function (global) {
  'use strict';
  const sheet = {
    elenya: 'assets/pixel-sprites/elenya-sheet-v1.png', calion: 'assets/pixel-sprites/calion-sheet-v1.png',
    nando: 'assets/pixel-sprites/nando-sheet-v1.png', anao: 'assets/pixel-sprites/anao-caolho-sheet-v1.png',
    'goblin-lanceiro': 'assets/pixel-sprites/goblins-roster-v1.png', 'goblin-arqueiro': 'assets/pixel-sprites/goblins-roster-v1.png',
    'goblin-espadachim': 'assets/pixel-sprites/goblins-roster-v1.png', 'uruk-hai-batedor': 'assets/pixel-sprites/uruk-hai-sheet-v1.png',
    'uruk-hai-capitao': 'assets/pixel-sprites/uruk-hai-sheet-v1.png', 'espectro-sombras': 'assets/pixel-sprites/spectro-sheet-v1.png'
  };
  const sourceFrame = { 'goblin-lanceiro': 0, 'goblin-arqueiro': 1, 'goblin-espadachim': 2 };
  const cache = new Map();
  const isEnemy = p => p?.sourceType === 'creature' || /goblin|orc|uruk|inimigo|criatura|espectro/i.test(p?.type || '');
  const assetFor = p => sheet[p.sourceId] || (isEnemy(p) ? sheet['goblin-espadachim'] : sheet.elenya);

  async function framesFor(participant) {
    const path = assetFor(participant);
    if (cache.has(path)) return cache.get(path);
    const promise = (async () => {
      const base = await global.PIXI.Assets.load(path);
      const width = Math.floor(base.width / 4), height = base.height;
      return Array.from({ length: 4 }, (_, index) => new global.PIXI.Texture({ source: base.source, frame: new global.PIXI.Rectangle(index * width, 0, width, height) }));
    })();
    cache.set(path, promise); return promise;
  }
  function backdrop(app) {
    const g = new global.PIXI.Graphics(); const W = app.screen.width, H = app.screen.height;
    g.rect(0, 0, W, H).fill('#07111b');
    g.rect(0, H * .46, W, H * .54).fill('#162c25');
    g.rect(0, H * .73, W, H * .27).fill('#0d1d19');
    for (let i = 0; i < 18; i++) { const x = i * W / 17; const h = 40 + (i % 5) * 19; g.moveTo(x - 40, H * .46).lineTo(x, H * .46 - h).lineTo(x + 42, H * .46).fill(i % 2 ? '#10231f' : '#0c1b1c'); }
    for (let i = 0; i < 24; i++) { const x = (i * 83) % W, y = H * .71 + ((i * 47) % (H * .2)); g.circle(x, y, 2 + (i % 3)).fill(i % 2 ? '#344334' : '#28382d'); }
    const moon = new global.PIXI.Graphics(); moon.circle(W * .53, H * .19, Math.max(16, W * .055)).fill({ color: '#a7d6d9', alpha: .13 });
    app.stage.addChild(g, moon);
  }
  function label(text, color = '#f2d088') { return new global.PIXI.Text({ text, style: { fontFamily: 'Georgia', fontSize: 12, fill: color, stroke: { color: '#020608', width: 3 }, align: 'center' } }); }
  function positions(list, side, W, H) {
    const count = list.length || 1, cols = Math.min(5, Math.max(1, Math.ceil(Math.sqrt(count * 1.4)))), rows = Math.ceil(count / cols);
    return list.map((p, i) => {
      const col = i % cols, row = Math.floor(i / cols); const xMin = side === 'ally' ? W * .06 : W * .57, xMax = side === 'ally' ? W * .43 : W * .94;
      return { participant: p, x: xMin + (cols === 1 ? (xMax - xMin) / 2 : col * (xMax - xMin) / (cols - 1)), y: H * .82 - row * Math.min(80, H * .14) };
    });
  }
  async function mount(container, participants, options = {}) {
    if (!global.PIXI) throw new Error('PixiJS não carregou.');
    container.replaceChildren();
    const app = new global.PIXI.Application();
    await app.init({ resizeTo: container, backgroundAlpha: 0, antialias: false, autoDensity: true, resolution: Math.min(global.devicePixelRatio || 1, 2) });
    app.canvas.className = 'pixi-arena-canvas'; app.canvas.setAttribute('aria-label', 'Arena 16-bit da batalha'); container.append(app.canvas);
    backdrop(app);
    const actors = new Map(); const party = participants.filter(p => !isEnemy(p)); const enemies = participants.filter(isEnemy);
    const W = app.screen.width, H = app.screen.height;
    const all = [...positions(party, 'ally', W, H), ...positions(enemies, 'foe', W, H)];
    for (const place of all) {
      const p = place.participant, wrap = new global.PIXI.Container(), shadow = new global.PIXI.Graphics();
      shadow.ellipse(0, 2, 38, 9).fill({ color: '#000000', alpha: .47 }); wrap.addChild(shadow);
      let frames; try { frames = await framesFor(p); } catch { frames = []; }
      const sprite = frames.length ? new global.PIXI.AnimatedSprite(frames) : new global.PIXI.Sprite(global.PIXI.Texture.WHITE);
      if (!frames.length) { sprite.tint = isEnemy(p) ? 0x9b473a : 0x6688aa; sprite.width = 46; sprite.height = 76; }
      sprite.anchor.set(.5, 1); sprite.scale.set(Math.max(.25, Math.min(.65, 3.25 / Math.sqrt(participants.length || 1)))); sprite.animationSpeed = .07; sprite.play();
      if (sourceFrame[p.sourceId] !== undefined) sprite.gotoAndStop(sourceFrame[p.sourceId]);
      wrap.addChild(sprite); const name = label(p.name, isEnemy(p) ? '#e4ad91' : '#f1d18b'); name.anchor.set(.5, 1); name.y = -sprite.height * sprite.scale.y - 7; wrap.addChild(name);
      wrap.x = place.x; wrap.y = place.y; app.stage.addChild(wrap); actors.set(p.id, { wrap, sprite, name, homeX: place.x, homeY: place.y, side: isEnemy(p) ? -1 : 1 });
    }
    const scene = { app, actors, container, public: !!options.public };
    scene.destroy = () => { try { app.destroy(true, { children: true, texture: false, textureSource: false }); } catch {} };
    return scene;
  }
  function tween(app, duration, update, done) { let elapsed = 0; const tick = ticker => { elapsed += ticker.deltaMS; update(Math.min(1, elapsed / duration)); if (elapsed >= duration) { app.ticker.remove(tick); done?.(); } }; app.ticker.add(tick); }
  function flash(scene, actorId, targetId, kind = 'melee', text = '') {
    const actor = scene?.actors.get(actorId), target = scene?.actors.get(targetId); if (!actor || !target) return;
    const app = scene.app, dx = target.homeX - actor.homeX, lunge = Math.sign(dx) * Math.min(90, Math.abs(dx) * .34);
    actor.sprite.gotoAndStop?.(1); tween(app, 260, t => actor.wrap.x = actor.homeX + lunge * Math.sin(t * Math.PI), () => actor.sprite.gotoAndPlay?.(0));
    const fx = new global.PIXI.Graphics(); fx.circle(actor.homeX, actor.homeY - 72, kind === 'magic' ? 15 : 7).fill(kind === 'heal' ? '#71e5b0' : kind === 'magic' ? '#66baff' : '#ffc45d'); app.stage.addChild(fx);
    tween(app, 490, t => { fx.x = dx * t; fx.y = (target.homeY - actor.homeY - 55) * t; fx.alpha = 1 - t; if (t > .63) { target.wrap.x = target.homeX + (t % .12) * 38; target.wrap.tint = kind === 'heal' ? 0xaaffd1 : 0xffb09b; } }, () => { target.wrap.x = target.homeX; target.wrap.tint = 0xffffff; fx.destroy(); });
    if (text) { const note = label(text, kind === 'heal' ? '#a8ffd0' : '#ffe0a1'); note.anchor.set(.5); note.x = target.homeX; note.y = target.homeY - 150; app.stage.addChild(note); tween(app, 700, t => { note.y = target.homeY - 150 - t * 42; note.alpha = 1 - t; }, () => note.destroy()); }
  }
  global.RPGBattlePixi = { mount, flash, assetFor, isEnemy };
})(window);
