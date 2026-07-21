// Dados da edição de Julho/2026 (Sandy & Junior).
// Para adicionar uma edição nova: copie este arquivo, ajuste os campos abaixo,
// gere as imagens de página em assets/img/<pasta-da-edicao>/ e inclua o novo
// arquivo com uma linha <script src="assets/js/editions/....js"> no index.html,
// antes de assets/js/site.js. Não precisa editar nenhum arquivo já existente.
window.EDITIONS = window.EDITIONS || [];
window.EDITIONS.push({
  id: "julho-2026",
  title: "CX Conecta — Julho/2026",
  date: "Edição Nº1 · Julho de 2026",
  tag: "Atual",
  current: true,
  cover: "assets/img/Julho/capa-julho-2026.jpg",
  pdf: "Edi%C3%A7%C3%B5es/Edi%C3%A7%C3%A3o%20Julho.pdf",
  filename: "Edição Julho.pdf",

  // Páginas renderizadas da edição, usadas pelo leitor 3D (efeito de virar
  // página). Se uma edição futura ainda não tiver essas imagens geradas,
  // o leitor cai automaticamente para o modo antigo (PDF embutido).
  // "guarda.jpg" é só uma folha lisa (cor sólida, sem logo/texto) pareada
  // com a capa e com a contracapa — sem ela, a página sem par apareceria
  // com um vazio branco ao lado (limitação da biblioteca de flip). Aparece
  // duas vezes de propósito.
  pages: [
    "assets/img/Julho/guarda.jpg",
    "assets/img/Julho/page-01.jpg",
    "assets/img/Julho/page-02.jpg",
    "assets/img/Julho/page-03.jpg",
    "assets/img/Julho/page-04.jpg",
    "assets/img/Julho/page-05.jpg",
    "assets/img/Julho/page-06.jpg",
    "assets/img/Julho/page-07.jpg",
    "assets/img/Julho/page-08.jpg",
    "assets/img/Julho/page-09.jpg",
    "assets/img/Julho/page-10.jpg",
    "assets/img/Julho/page-11.jpg",
    "assets/img/Julho/guarda.jpg",
    "assets/img/Julho/page-12.jpg"
  ],

  badge: "Edição Nº1 · Julho / 2026",
  lead: "Inspirada nas revistas teen dos anos 90, a <strong>CX Conecta</strong> traz o dia a dia de Customer Experience da Hotmart com muito humor: quiz exclusivo, horóscopo, detetives do CX e o mural das pérolas. Tudo isso pra lembrar que entender o todo muda o jeito de fazer CX.",
  stickerTop: "Edição<br>de estreia!",
  stickerBottom: "100%<br>CX",

  ticker: [
    "TESTE EXCLUSIVO: QUAL SUA ERA NO PLANTÃO?",
    "HORÓSCOPO: QUEM VAI SEXTAR NO HORÁRIO",
    "DETETIVES DO CX: OS BASTIDORES DO SUPORTE",
    "MURAL DAS PÉROLAS DO CX",
    "POR DENTRO DO DEMAND GENERATION",
    "TRILHA SONORA DO PLANTÃO"
  ],

  previewEyebrow: "Prévia da edição",
  previewTitle: "O que tem <span class=\"hl\">dentro</span> dessa CX Conecta",
  previewSub: "Um mergulho nostálgico nos anos 90, com uma seleção de seções pensadas pra descontrair (e ensinar) sobre a rotina de Customer Experience.",
  preview: [
    { img: "assets/img/Julho/preview-sandy.jpg", title: "Sandy e Junior em CX", desc: "Como a dupla mais amada dos anos 90 resolveria os casos mais complexos de atendimento." },
    { img: "assets/img/Julho/preview-quiz.jpg", title: "Teste exclusivo", desc: "Descubra qual música da dupla é a trilha sonora do seu plantão." },
    { img: "assets/img/Julho/preview-detetive.jpg", title: "Detetives do CX", desc: "Os segredos dos analistas para salvar páginas de vendas e desvendar bugs misteriosos." },
    { img: "assets/img/Julho/preview-horoscopo.jpg", title: "Horóscopo", desc: "Descubra qual signo vai sextar no horário e quem vai ficar preso no chat." },
    { img: "assets/img/Julho/preview-perolas.jpg", title: "Mural das pérolas", desc: "As frases mais inesquecíveis ditas (ou digitadas) por quem vive o suporte todo dia." },
    { img: "assets/img/Julho/preview-trilha.jpg", title: "Trilha sonora do CX", desc: "A playlist perfeita para cada tipo de plantão — da fila zerada ao sistema fora do ar." }
  ],

  artist: "Sandy & Junior",
  playlist: [
    { title: "A Lenda", spotifyId: "1mBaOJ4OPDqJBMp0luG7Ej" },
    { title: "As Quatro Estações", spotifyId: "5vgMqjgb2nwMBWTcOLjBKX" },
    { title: "Inesquecível", spotifyId: "6Ld4YikXRqsg8cg1WIPpSh" },
    { title: "Dig-Dig-Joy", spotifyId: "28TwyZu0isywcdGVTBujIc" }
  ]
});
