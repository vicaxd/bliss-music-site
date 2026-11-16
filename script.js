// ---------- Forma de onda do hero ----------
// Barras com alturas "musicais" (somando ondas) e uma reprodução única
// ao carregar: as barras vão ficando laranja como se o áudio estivesse tocando.
const onda = document.getElementById('onda');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

function montarOnda() {
  const total = Math.max(40, Math.min(110, Math.round(onda.clientWidth / 11)));
  onda.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const x = i / total;
    const env = Math.sin(Math.PI * x) * 0.55 + 0.35;              // mais forte no meio
    const v = Math.abs(Math.sin(i * 0.9) * 0.5 + Math.sin(i * 0.37) * 0.35 + Math.sin(i * 2.3) * 0.25);
    const h = Math.max(0.08, Math.min(1, env * (0.35 + v)));
    const s = document.createElement('span');
    s.style.setProperty('--h', h.toFixed(3));
    onda.appendChild(s);
  }
  return onda.children;
}

let barras = montarOnda();
if (!reduzir) {
  const duracao = 2600;
  const inicio = performance.now() + 300;
  function tocar(agora) {
    const p = Math.min(1, Math.max(0, (agora - inicio) / duracao));
    const n = Math.round(p * barras.length);
    for (let i = 0; i < barras.length; i++) barras[i].classList.toggle('tocado', i < n);
    if (p < 1) requestAnimationFrame(tocar);
  }
  requestAnimationFrame(tocar);
} else {
  for (const b of barras) b.classList.add('tocado');
}

let largura = onda.clientWidth;
addEventListener('resize', () => {
  if (Math.abs(onda.clientWidth - largura) < 40) return;
  largura = onda.clientWidth;
  barras = montarOnda();
  for (const b of barras) b.classList.add('tocado');
});

// ---------- Player de vídeo (Vimeo) ----------
// A miniatura é só uma imagem; o player do Vimeo só carrega quando a pessoa clica.
const dialog = document.getElementById('player');
const quadro = dialog.querySelector('.player-quadro');
document.querySelectorAll('.play').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.video;
    quadro.classList.toggle('vertical', btn.dataset.ratio === '9/16');
    quadro.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0"
      allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${btn.getAttribute('aria-label')}"></iframe>`;
    dialog.showModal();
  });
});
const fechar = () => { dialog.close(); };
dialog.querySelector('.fechar').addEventListener('click', fechar);
dialog.addEventListener('click', (e) => { if (e.target === dialog) fechar(); });
dialog.addEventListener('close', () => { quadro.innerHTML = ''; });

// ---------- Formulário de orçamento ----------
// Abre o e-mail já preenchido. Para receber os pedidos direto,
// troque por um serviço como Formspree ou Netlify Forms.
const form = document.getElementById('form-orcamento');
const erro = document.getElementById('form-erro');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (!d.nome.trim() || !d.mensagem.trim()) {
    erro.textContent = 'Preencha seu nome e conte sobre o projeto.';
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(d.email)) {
    erro.textContent = 'Digite um e-mail válido, como nome@agencia.com.';
    return;
  }
  erro.textContent = '';
  const assunto = `Orçamento: ${d.tipo} — ${d.empresa || d.nome}`;
  const corpo = `Nome: ${d.nome}\nE-mail: ${d.email}\nAgência/empresa: ${d.empresa || '—'}\nServiço: ${d.tipo}\n\n${d.mensagem}`;
  location.href = `mailto:atendeaicarol@gmail.com?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
});

// ---------- Menu do topo ----------
const menuBotao = document.querySelector('.menu-botao');
const menuLista = document.getElementById('menu-lista');
function abrirMenu(abrir) {
  menuBotao.setAttribute('aria-expanded', String(abrir));
  menuLista.hidden = !abrir;
  if (abrir) menuLista.querySelector('a').focus();
}
menuBotao.addEventListener('click', () => abrirMenu(menuLista.hidden));
menuLista.addEventListener('click', (e) => { if (e.target.closest('a')) abrirMenu(false); });
document.addEventListener('click', (e) => {
  if (!menuLista.hidden && !e.target.closest('.menu')) abrirMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menuLista.hidden) { abrirMenu(false); menuBotao.focus(); }
});
