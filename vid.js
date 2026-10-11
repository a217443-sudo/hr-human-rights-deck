/* 案例②：AI 動態版影片播放（Esc 關閉；開啟時攔截簡報的鍵盤操作） */
(function () {
  const box = document.getElementById('vid'), v = document.getElementById('vid-v'), btn = document.getElementById('vid-btn'), x = document.getElementById('vid-x');
  if (!box || !v || !btn) return;
  const open = () => { if (window.__story && window.__story.close) { try { window.__story.close(); } catch (e) {} } box.classList.add('on'); box.setAttribute('aria-hidden', 'false'); v.currentTime = 0; v.play().catch(() => {}); };
  const close = () => { v.pause(); box.classList.remove('on'); box.setAttribute('aria-hidden', 'true'); };
  btn.addEventListener('click', open); x.addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  addEventListener('keydown', e => {
    if (!box.classList.contains('on')) return;
    e.stopImmediatePropagation();
    if (e.key === 'Escape') close();
    else if (e.key === ' ') { e.preventDefault(); v.paused ? v.play() : v.pause(); }
    else if (e.key === 'ArrowLeft') v.currentTime = Math.max(0, v.currentTime - 5);
    else if (e.key === 'ArrowRight') v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
  }, true);
})();
