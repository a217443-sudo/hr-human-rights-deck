/* 案例②：明昌國際——卡通短片（旁白＋對話＋配樂＋音效）
   播放：在案例頁按 V ／ 關閉：Esc ／ 重播：V ／ 靜音：M
   聲音：audio/story.mp3（OpenAI 語音合成之人聲旁白與角色對白，混入配樂與音效）
   畫面：GSAP 時間軸，以聲音時間為準同步。 */
(function () {
  const root = document.getElementById('story');
  const stage = root.querySelector('.stage');
  const W = 1920, H = 1080;
  let T = null, aud = null, open = false, muted = false, driftFn = null, TOTAL = 16.35;
  let LINES = { n1: [.3, 2.527], a1: [2.627, 4.859], c1: [4.939, 7.59], n2: [7.65, 9.774], c2: [9.834, 12.799], n3: [12.899, 15.804] };
  fetch('audio/timing.json').then(r => r.json()).then(j => { TOTAL = j.total; LINES = j.lines; }).catch(() => {});

  function fit() { const s = Math.min(innerWidth / W, innerHeight / H); stage.style.transform = `translate(-50%,-50%) scale(${s})`; }
  addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 250));

  const TEMPLATE = `
  <div class="cam">
    <img class="bg" data-i="1" src="images/story/s1.jpg" alt=""><img class="bg" data-i="2" src="images/story/s2.jpg" alt="">
    <img class="bg" data-i="3" src="images/story/s3.jpg" alt=""><img class="bg" data-i="4" src="images/story/s4.jpg" alt="">
    <img class="bg" data-i="5" src="images/story/s5.jpg" alt="">
    <div class="halftone"></div>
    <canvas class="fx" width="1920" height="1080"></canvas>

    <div class="chip">真實案例改編　明昌國際</div>

    <div class="bub b-a1"><span class="who">客戶代表</span><p>仲介費，怎麼讓移工自己付？</p><i class="tail"></i></div>
    <div class="bub b-c1"><span class="who ch">董事長</span><p>行之有年，也合法啊！</p><i class="tail"></i></div>
    <div class="bub b-c2"><span class="who ch">董事長</span><p>好！從今年起，公司付！</p><i class="tail"></i></div>

    <div class="nar n-n1"><b>旁白</b>疫情後，客戶來查廠。</div>
    <div class="nar n-n2"><b>旁白</b>結果，查廠沒過！</div>
    <div class="nar n-n3"><b>旁白</b>續聘率翻倍。證據就是競爭力。</div>

    <div class="hrtag">收到通知的是 <em>人資主管</em></div>
    <div class="stamp"><b>查廠沒過！</b></div>
    <div class="sfxt s-boom">砰！</div>
    <div class="coins"></div>
    <div class="sfxt s-coin">叮叮叮</div>
    <div class="badge"><small>移工續聘率</small><b>×2</b></div>
    <div class="moral"><span>人資的「證據」</span>就是競爭力</div>
  </div>
  <div class="flash"></div>
  <div class="frame"></div>
  <div class="hud-n">依《天下雜誌》報導改編的示意動畫（對白為情節示意）</div><div class="hud-k">V 重播 ・ M 靜音 ・ Esc 關閉</div>
  <div class="prog"><i></i></div>`;

  function startFx(canvas) {
    const ctx = canvas.getContext('2d'); const P = [];
    canvas._burst = (x, y, n, cols) => {
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = 300 + Math.random() * 800;
        P.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 300, r: 5 + Math.random() * 8, c: cols[i % cols.length], life: 1.3 + Math.random() * .7, t: 0, rot: Math.random() * 6, vr: (Math.random() - .5) * 14, sq: Math.random() < .55 }); }
    };
    let last = performance.now();
    driftFn = () => {
      const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; ctx.clearRect(0, 0, W, H);
      for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.t += dt; p.vy += 1400 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        const k = 1 - p.t / p.life; if (k <= 0) { P.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = `rgba(${p.c},${Math.min(1, k * 1.6)})`;
        if (p.sq) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { ctx.beginPath(); ctx.arc(0, 0, p.r * .7, 0, 7); ctx.fill(); } ctx.restore(); }
      // 以聲音時間為準，修正畫面漂移
      if (aud && !aud.paused && T) { const d = aud.currentTime - T.time(); if (Math.abs(d) > .12) T.time(aud.currentTime, true); }
    };
    gsap.ticker.add(driftFn);
  }

  function build() {
    stage.innerHTML = TEMPLATE;
    const q = s => stage.querySelector(s), qa = s => [...stage.querySelectorAll(s)];
    const bgs = {}; qa('.bg').forEach(b => bgs[b.dataset.i] = b);
    const L = LINES, fx = q('.fx'); startFx(fx);
    const coins = q('.coins'); for (let i = 0; i < 6; i++) coins.insertAdjacentHTML('beforeend', '<div class="coin">$</div>');
    const cA = qa('.coin');

    gsap.set(Object.values(bgs), { autoAlpha: 0, transformOrigin: '50% 50%' });
    gsap.set(stage.querySelectorAll('.bub, .nar, .hrtag, .stamp, .sfxt, .coins, .badge, .moral, .flash, .chip'), { autoAlpha: 0 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    const talk = (sel, a, b) => { // 說話時對話框輕輕晃動
      const n = Math.max(2, Math.round((b - a) / .22));
      tl.fromTo(sel, { rotate: -1.6 }, { rotate: 1.6, duration: .11, yoyo: true, repeat: n, ease: 'sine.inOut' }, a + .15);
      tl.to(sel, { rotate: 0, duration: .15 }, b + .1);
    };
    const bubble = (sel, a, b) => {
      tl.fromTo(sel, { autoAlpha: 0, scale: 0, transformOrigin: '10% 100%' }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'elastic.out(1,.55)' }, a - .08);
      talk(sel, a, b);
      tl.to(sel, { autoAlpha: 0, scale: .8, y: -20, duration: .25, ease: 'power2.in' }, b + .28);
    };
    const nar = (sel, a, b) => {
      tl.fromTo(sel, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: .4, ease: 'back.out(1.8)' }, a - .08);
      tl.to(sel, { autoAlpha: 0, y: 30, duration: .25, ease: 'power2.in' }, b + .25);
    };
    const kb = (img, a, b, from, to, org) => tl.fromTo(img, { scale: from, x: 0, y: 0, transformOrigin: org || '50% 50%' }, { scale: to, duration: b - a, ease: 'none' }, a);
    const show = (i, t, d = .35) => tl.to(bgs[i], { autoAlpha: 1, duration: d, ease: 'none' }, t);
    const hide = (i, t, d = .35) => tl.to(bgs[i], { autoAlpha: 0, duration: d, ease: 'none' }, t);
    const shake = (t, amp, n) => { const cam = q('.cam'); for (let i = 0; i < n; i++) tl.set(cam, { x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: (i % 2 ? 1 : -1) * amp * .6 * (1 - i / n) }, t + i * .04); tl.set(cam, { x: 0, y: 0 }, t + n * .04); };
    const burst = (t, x, y, n, cols) => tl.call(() => fx._burst && fx._burst(x, y, n, cols), null, t);

    tl.fromTo(q('.prog i'), { scaleX: 0 }, { scaleX: 1, duration: TOTAL, ease: 'none' }, 0);
    tl.fromTo(qa('.hud-n, .hud-k'), { autoAlpha: 0 }, { autoAlpha: .85, duration: .5 }, .3);

    // ===== 旁白 1：工廠 → 客戶來訪 =====
    show(1, 0, .01); kb(bgs[1], 0, L.n1[1] - .2, 1.04, 1.16, '50% 55%');
    tl.fromTo(q('.chip'), { autoAlpha: 0, x: -300, rotate: -6 }, { autoAlpha: 1, x: 0, rotate: -3, duration: .55, ease: 'back.out(1.8)' }, .1);
    nar('.n-n1', L.n1[0], L.n1[1]);
    show(2, L.n1[1] - .35, .4); hide(1, L.n1[1] - .1, .3);
    tl.to(q('.chip'), { autoAlpha: 0, y: -60, duration: .3 }, L.n1[1] + .3);

    // ===== 客戶代表：仲介費，怎麼讓移工自己付？ =====
    kb(bgs[2], L.n1[1] - .35, L.a1[1] + .3, 1.04, 1.28, '18% 40%');
    bubble('.b-a1', L.a1[0], L.a1[1]);

    // ===== 董事長：行之有年，也合法啊！ =====
    show(4, L.c1[0] - .3, .3); hide(2, L.c1[0] - .1, .25);
    kb(bgs[4], L.c1[0] - .3, L.c1[1] + .2, 1.03, 1.22, '26% 36%');
    bubble('.b-c1', L.c1[0], L.c1[1]);

    // ===== 旁白 2：查廠沒過（蓋章） =====
    show(3, L.n2[0] - .3, .25); hide(4, L.n2[0] - .1, .2);
    kb(bgs[3], L.n2[0] - .3, L.n2[1] + .4, 1.02, 1.18, '25% 45%');
    nar('.n-n2', L.n2[0], L.n2[1]);
    tl.fromTo(q('.hrtag'), { autoAlpha: 0, x: -200 }, { autoAlpha: 1, x: 0, duration: .5, ease: 'back.out(1.8)' }, L.n2[0] + .15);
    const tS = L.n2[1] - .55;
    tl.fromTo(q('.stamp'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .01 }, tS - .38);
    tl.fromTo(q('.stamp b'), { scale: 5, rotate: -34, autoAlpha: 0 }, { scale: 1, rotate: -8, autoAlpha: 1, duration: .38, ease: 'power4.in' }, tS - .38);
    tl.fromTo(q('.flash'), { autoAlpha: .8 }, { autoAlpha: 0, duration: .35, immediateRender: false }, tS);
    tl.fromTo(q('.s-boom'), { autoAlpha: 0, scale: .3, rotate: -20 }, { autoAlpha: 1, scale: 1, rotate: -8, duration: .3, ease: 'back.out(3)' }, tS);
    shake(tS, 30, 12); burst(tS, 1130, 430, 36, ['255,77,61', '255,255,255', '238,123,48']);
    tl.to(q('.stamp b'), { scale: 1.06, duration: .2, yoyo: true, repeat: 1 }, tS + .1);
    tl.to([q('.stamp'), q('.s-boom'), q('.hrtag')], { autoAlpha: 0, duration: .25 }, L.c2[0] - .3);

    // ===== 董事長：好！從今年起，公司付！ =====
    show(4, L.c2[0] - .3, .3); hide(3, L.c2[0] - .1, .25);
    kb(bgs[4], L.c2[0] - .3, L.c2[1] + .3, 1.2, 1.02, '50% 48%');
    bubble('.b-c2', L.c2[0], L.c2[1]);
    tl.fromTo(coins, { autoAlpha: 0 }, { autoAlpha: 1, duration: .01 }, L.c2[1] - .6);
    cA.forEach((c, i) => tl.fromTo(c, { x: 0, y: 0, autoAlpha: 0, scale: .3, rotate: 0 }, { keyframes: [{ x: 120, y: -80, autoAlpha: 1, scale: 1, rotate: 120, duration: .15 }, { x: 640, y: 60, rotate: 640, duration: .6, ease: 'none' }, { x: 760, y: 80, autoAlpha: 0, scale: .3, duration: .12 }] }, L.c2[1] - .6 + i * .13));
    tl.fromTo(q('.s-coin'), { autoAlpha: 0, scale: .3 }, { autoAlpha: 1, scale: 1, rotate: 6, duration: .3, ease: 'back.out(3)' }, L.c2[1] - .1);
    tl.to(q('.s-coin'), { autoAlpha: 0, duration: .25 }, L.n3[0] - .1);
    tl.to(coins, { autoAlpha: 0, duration: .2 }, L.n3[0] - .1);

    // ===== 旁白 3：結果與重點 =====
    show(5, L.n3[0] - .3, .35); hide(4, L.n3[0] - .1, .3);
    kb(bgs[5], L.n3[0] - .3, TOTAL, 1.2, 1.02, '55% 45%');
    nar('.n-n3', L.n3[0], L.n3[1]);
    tl.fromTo(q('.badge'), { autoAlpha: 0, scale: 0, rotate: -25 }, { autoAlpha: 1, scale: 1, rotate: -6, duration: .6, ease: 'elastic.out(1,.5)' }, L.n3[0] + .12);
    burst(L.n3[0] + .3, 380, 330, 50, ['224,178,82', '238,123,48', '255,255,255', '129,199,132']);
    tl.to(q('.badge'), { autoAlpha: 0, scale: .6, duration: .25 }, L.n3[1] - 1.25);
    tl.fromTo(q('.moral'), { autoAlpha: 0, y: 80, scale: .8 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(2)' }, L.n3[1] - 1.05);
    tl.to(q('.moral'), { scale: 1.04, duration: .35, yoyo: true, repeat: 1 }, L.n3[1] - .3);
    tl.to({}, { duration: .001 }, TOTAL);
    return tl;
  }

  function stopAll() {
    if (aud) { try { aud.pause(); } catch (e) {} aud = null; }
    if (T) { T.kill(); T = null; }
    if (driftFn) { gsap.ticker.remove(driftFn); driftFn = null; }
    stage.innerHTML = '';
  }
  function play(opts) {
    stopAll(); fit(); open = true; root.classList.add('on'); document.body.classList.add('story-open'); root.setAttribute('aria-hidden', 'false');
    T = build();
    if (opts && typeof opts.seek === 'number') { T.seek(opts.seek, false); return; }
    aud = new Audio('audio/story.mp3'); aud.muted = muted; aud.preload = 'auto';
    const go = () => { T.play(0); };
    const p = aud.play(); // 聲音與畫面一起開始
    if (p && p.then) p.then(go).catch(go); else go();
  }
  function close() { stopAll(); open = false; root.classList.remove('on'); document.body.classList.remove('story-open'); root.setAttribute('aria-hidden', 'true'); }
  window.__story = { play, close };

  const onCase = () => (Reveal.getCurrentSlide() || {}).id === 'slide-case2';
  document.addEventListener('keydown', function (e) {
    const k = e.key;
    if (open) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (k === 'Escape') close();
      else if (k === 'v' || k === 'V') play();
      else if (k === 'm' || k === 'M') { muted = !muted; if (aud) aud.muted = muted; }
    } else if ((k === 'v' || k === 'V') && onCase() && !/input|textarea/i.test(e.target.nodeName)) {
      e.preventDefault(); e.stopImmediatePropagation(); play();
    }
  }, true);
  const btn = document.getElementById('story-btn'); if (btn) btn.addEventListener('click', () => play());

  const m = location.search.match(/[?&]t=([\d.]+)/);
  if (m) window.addEventListener('load', () => setTimeout(() => play({ seek: parseFloat(m[1]) }), 700));
})();
