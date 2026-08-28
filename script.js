const music = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const fallback = document.getElementById('musicFallback');
const enableMusic = document.getElementById('enableMusic');

music.volume = 0.78;

function syncMusicUI(){
  const playing = !music.paused;
  musicToggle.classList.toggle('playing', playing);
  musicToggle.textContent = playing ? '❚❚' : '♫';
  musicToggle.title = playing ? 'Pausar música' : 'Tocar música';
}

async function tryAutoplay(){
  try{
    await music.play();
    fallback.hidden = true;
  }catch(err){
    fallback.hidden = false;
  }
  syncMusicUI();
}

window.addEventListener('DOMContentLoaded', tryAutoplay, {once:true});
window.addEventListener('load', () => {
  if (music.paused) tryAutoplay();
  launchConfetti();
}, {once:true});

enableMusic?.addEventListener('click', async () => {
  try{ await music.play(); fallback.hidden = true; }catch(e){}
  syncMusicUI();
});

musicToggle.addEventListener('click', async () => {
  if(music.paused){
    try{ await music.play(); fallback.hidden = true; }catch(e){ fallback.hidden = false; }
  }else{
    music.pause();
  }
  syncMusicUI();
});
music.addEventListener('play', syncMusicUI);
music.addEventListener('pause', syncMusicUI);

// Se o navegador bloquear autoplay, a primeira interação em qualquer lugar também libera o áudio.
['pointerdown','touchstart','keydown'].forEach(evt => {
  document.addEventListener(evt, async () => {
    if(music.paused){
      try{ await music.play(); fallback.hidden = true; syncMusicUI(); }catch(e){}
    }
  }, {once:true, passive:true});
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function launchConfetti(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  resize();
  window.addEventListener('resize', resize, {passive:true});
  const palette = ['#d6b36a','#f0ccd3','#fff0d3','#b35b75','#ffffff'];
  const bits = Array.from({length:95}, () => ({
    x: Math.random()*innerWidth,
    y: -20-Math.random()*innerHeight*.25,
    w: 5+Math.random()*7,
    h: 8+Math.random()*10,
    vy: 2.1+Math.random()*3.6,
    vx: -1.1+Math.random()*2.2,
    rot: Math.random()*Math.PI,
    vr: -.08+Math.random()*.16,
    c: palette[Math.floor(Math.random()*palette.length)]
  }));
  let start = performance.now();
  function frame(now){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    bits.forEach(b=>{
      b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.rot); ctx.fillStyle=b.c;
      ctx.fillRect(-b.w/2,-b.h/2,b.w,b.h); ctx.restore();
    });
    if(now-start < 4300) requestAnimationFrame(frame); else ctx.clearRect(0,0,innerWidth,innerHeight);
  }
  requestAnimationFrame(frame);
}
