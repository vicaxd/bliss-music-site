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

// ---------- Player de vídeo (YouTube) ----------
// A capa é só uma imagem; o player do YouTube só carrega quando a pessoa clica.
// youtube-nocookie não grava cookies de rastreamento; rel=0 mostra só vídeos do próprio canal no fim.
const dialog = document.getElementById('player');
const quadro = dialog.querySelector('.player-quadro');
document.querySelectorAll('.play').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.video;
    quadro.classList.toggle('vertical', btn.dataset.ratio === '9/16');
    quadro.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen title="${btn.getAttribute('aria-label')}"></iframe>`;
    dialog.showModal();
  });
});
const fechar = () => { dialog.close(); };
dialog.querySelector('.fechar').addEventListener('click', fechar);
dialog.addEventListener('click', (e) => { if (e.target === dialog) fechar(); });
dialog.addEventListener('close', () => { quadro.innerHTML = ''; });

// ---------- Peças de rádio (player de áudio) ----------
// Cada peça tem uma onda decorativa; as barras ficam laranja conforme o áudio toca.
// Um range invisível por cima da onda permite avançar/voltar (mouse, toque e teclado).
const formatar = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const audios = [...document.querySelectorAll('.audio')];
audios.forEach((card, n) => {
  const audio = card.querySelector('audio');
  const botao = card.querySelector('.audio-play');
  const busca = card.querySelector('.audio-busca');
  const ondaAudio = card.querySelector('.audio-onda');
  const atual = card.querySelector('.audio-atual');
  const total = card.querySelector('.audio-total');
  const titulo = card.querySelector('h3').textContent;

  const qtd = 60;
  for (let i = 0; i < qtd; i++) {
    const v = Math.abs(Math.sin((i + n * 7) * 0.9) * 0.5 + Math.sin((i + n * 3) * 0.37) * 0.35 + Math.sin(i * 2.3) * 0.25);
    const s = document.createElement('span');
    s.style.setProperty('--h', Math.max(0.12, Math.min(1, 0.25 + v * 0.75)).toFixed(3));
    ondaAudio.appendChild(s);
  }
  const barrasAudio = ondaAudio.children;

  function atualizar() {
    const d = audio.duration || 0;
    const p = d ? audio.currentTime / d : 0;
    const k = Math.round(p * qtd);
    for (let i = 0; i < qtd; i++) barrasAudio[i].classList.toggle('tocado', i < k);
    busca.value = (p * 100).toFixed(1);
    busca.setAttribute('aria-valuetext', `${formatar(audio.currentTime)} de ${formatar(d)}`);
    atual.textContent = formatar(audio.currentTime);
  }

  audio.addEventListener('loadedmetadata', () => { total.textContent = formatar(audio.duration); });
  audio.addEventListener('timeupdate', atualizar);
  audio.addEventListener('play', () => {
    // só uma peça toca por vez
    audios.forEach((c) => { const a = c.querySelector('audio'); if (a !== audio) a.pause(); });
    botao.classList.add('tocando');
    botao.setAttribute('aria-label', `Pausar ${titulo}`);
  });
  audio.addEventListener('pause', () => {
    botao.classList.remove('tocando');
    botao.setAttribute('aria-label', `Ouvir ${titulo}`);
  });
  audio.addEventListener('ended', () => { audio.currentTime = 0; atualizar(); });
  botao.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
  busca.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (busca.value / 100) * audio.duration;
    atualizar();
  });
});

// ---------- Formulário de orçamento ----------
// Dois caminhos: WhatsApp (abre a conversa com a mensagem pronta) ou e-mail.
const WHATSAPP_NUMERO = '5551993179195';   // só números, com 55 + DDD. Ex.: 5511999998888
const EMAIL_ORCAMENTO = 'atendeaicarol@gmail.com';

const form = document.getElementById('form-orcamento');
const erro = document.getElementById('form-erro');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const canal = e.submitter?.value || 'whatsapp';
  const d = Object.fromEntries(new FormData(form));
  if (!d.nome.trim() || !d.mensagem.trim()) {
    erro.textContent = 'Preencha seu nome e conte sobre o projeto.';
    return;
  }
  if (canal === 'email' && !/^\S+@\S+\.\S+$/.test(d.email)) {
    erro.textContent = 'Digite um e-mail válido, como nome@agencia.com.';
    return;
  }
  if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) {
    erro.textContent = 'O e-mail parece incompleto. Confira ou deixe em branco.';
    return;
  }
  erro.textContent = '';
  const quem = d.empresa || d.nome;
  const linhas = [
    `Nome: ${d.nome}`,
    d.email ? `E-mail: ${d.email}` : null,
    `Agência/empresa: ${d.empresa || '—'}`,
    `Serviço: ${d.tipo}`,
    '',
    d.mensagem,
  ].filter((l) => l !== null);

  if (canal === 'whatsapp') {
    const texto = `Olá, Bliss! Gostaria de pedir um orçamento.\n\n${linhas.join('\n')}`;
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  } else {
    const assunto = `Orçamento: ${d.tipo} — ${quem}`;
    location.href = `mailto:${EMAIL_ORCAMENTO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(linhas.join('\n'))}`;
  }
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

