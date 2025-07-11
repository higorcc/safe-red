// ====== VARIÁVEIS GLOBAIS ======
let apostasAdicionadas = [];
let vantagemTipoGlobal = "";
let sugestaoTipoGlobal = "";
let diferencaGlobal = 0;

// ====== AÇÕES DO SUBMIT DO BOTÃO ANALISAR ======
document.getElementById("form-analise").addEventListener("submit", function (e) {
  e.preventDefault(); // evita recarregar a página

  const form = e.target;

  const timeA = form.timeA.value.trim();
  const timeB = form.timeB.value.trim();

  // Pega os valores dos critérios
  const motivacaoA = parseFloat(form.motivacaoA.value) || 0;
  const motivacaoB = parseFloat(form.motivacaoB.value) || 0;
  const momentoA = parseFloat(form.momentoA.value) || 0;
  const momentoB = parseFloat(form.momentoB.value) || 0;
  const elencoA = parseFloat(form.elencoA.value) || 0;
  const elencoB = parseFloat(form.elencoB.value) || 0;
  const casaForaA = parseFloat(form.casaForaA.value) || 0;
  const casaForaB = parseFloat(form.casaForaB.value) || 0;
  const confrontoA = parseFloat(form.confrontoA.value) || 0;
  const confrontoB = parseFloat(form.confrontoB.value) || 0;

  // Soma os pontos
  const totalA = motivacaoA + momentoA + elencoA + casaForaA + confrontoA;
  const totalB = motivacaoB + momentoB + elencoB + casaForaB + confrontoB;
  diferencaGlobal = totalA - totalB;

  let mensagem = "";
  let vantagemTipo = "";
  let sugestaoTipo = "";

  // Sugestão de aposta com base na diferença
  if (Math.abs(diferencaGlobal) <= 2) {
    mensagem = "Muito equilibrado - Evite apostar ou vá de mercado de gols, escanteios, etc.";
    vantagemTipo = "Muito equilibrado";
    sugestaoTipo = "Evite apostar";
  } else if (Math.abs(diferencaGlobal) <= 4) {
    mensagem = `Leve vantagem - Dupla chance ou empate anula para ${diferencaGlobal > 0 ? timeA : timeB}.`;
    vantagemTipo = "Leve vantagem";
    sugestaoTipo = "Dupla chance ou empate anula";
  } else if (Math.abs(diferencaGlobal) <= 6) {
    mensagem = `Boa vantagem - Vitória seca a favor de ${diferencaGlobal > 0 ? timeA : timeB}.`;
    vantagemTipo = "Boa vantagem";
    sugestaoTipo = "Vitória seca";
  } else if (Math.abs(diferencaGlobal) <= 9) {
    mensagem = `Vantagem significativa - Handicap -1.5 a favor de ${diferencaGlobal > 0 ? timeA : timeB}.`;
    vantagemTipo = "Vantagem significativa";
    sugestaoTipo = "Handicap asiático -1.5";
  } else {
    mensagem = `Favoritismo claro - Handicap -2.5 ou over gols a favor de ${diferencaGlobal > 0 ? timeA : timeB}.`;
    vantagemTipo = "Favoritismo claro";
    sugestaoTipo = "Handicap asiático -2.5 ou over 3.5 gols";
  }

  vantagemTipoGlobal = vantagemTipo;
  sugestaoTipoGlobal = sugestaoTipo;

  // Exibe resultado da análise
  document.getElementById("texto-resultado").innerText = `
Diferença: ${Math.abs(diferencaGlobal)} ponto(s)
Sugestão: ${mensagem}
`;
  document.getElementById("botoes-acao").style.display = "block";
});

// ====== BOTÃO ADICIONAR AO CARRINHO ======
document.getElementById("adicionar-aposta").addEventListener("click", function () {
  if (apostasAdicionadas.length >= 3) {
    alert("Limite de 3 apostas atingido.");
    return;
  }

  const timeA = document.getElementById("timeA").value.trim();
  const timeB = document.getElementById("timeB").value.trim();

  const aposta = {
    vantagem: vantagemTipoGlobal,
    sugestao: sugestaoTipoGlobal,
    timeAfavor: diferencaGlobal > 0 ? timeA : timeB,
    timeContra: diferencaGlobal > 0 ? timeB : timeA,
    diferenca: Math.abs(diferencaGlobal),
  };

  apostasAdicionadas.push(aposta);
  atualizarCarrinho();

  // Reset do formulário após adicionar aposta
  document.querySelector("form").reset();
  document.getElementById("texto-resultado").textContent = "";
  document.getElementById("botoes-acao").style.display = "none";
});

// ====== ATUALIZA O CARRINHO VISUALMENTE ======
function atualizarCarrinho() {
  const carrinho = document.getElementById("carrinho-apostas");
  const lista = document.getElementById("lista-apostas");

  if (apostasAdicionadas.length === 0) {
    carrinho.style.display = "none";
    return;
  }

  carrinho.style.display = "block";

  const cabecalho = `
    <tr>
      <th>#</th>
      <th>Vantagem</th>
      <th>Sugestão</th>
      <th>Time A Favor</th>
      <th>Time Contra</th>
      <th></th>
    </tr>
  `;
  lista.innerHTML = cabecalho;

  apostasAdicionadas.forEach((aposta, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${aposta.vantagem}</td>
      <td>${aposta.sugestao}</td>
      <td>${aposta.timeAfavor}</td>
      <td>${aposta.timeContra}</td>
      <td><span class="remover-aposta" data-index="${index}" style="cursor:pointer;">❌</span></td>
    `;
    lista.appendChild(row);
  });

  // Ativando botões de remover aposta do carrinho
  document.querySelectorAll(".remover-aposta").forEach((botao) => {
    botao.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      apostasAdicionadas.splice(index, 1);
      atualizarCarrinho();
    });
  });
}

// ====== BOTÃO DESCARTAR APOSTA ======
document.getElementById("descartar-aposta").addEventListener("click", function () {
  document.querySelector("form").reset();
  document.getElementById("texto-resultado").textContent = "";
  document.getElementById("botoes-acao").style.display = "none";
});

// ====== BOTÃO AUTO-FILL PARA TESTES ======
document.getElementById("auto-fill").addEventListener("click", function () {
  document.getElementById("timeA").value = "Palmeiras";
  document.getElementById("timeB").value = "River Plate";

  document.getElementById("motivacaoA").value = 4;
  document.getElementById("motivacaoB").value = 3;
  document.getElementById("momentoA").value = 2;
  document.getElementById("momentoB").value = 1;
  document.getElementById("elencoA").value = 3;
  document.getElementById("elencoB").value = 2;
  document.getElementById("casaForaA").value = 2;
  document.getElementById("casaForaB").value = 1;
  document.getElementById("confrontoA").value = 2;
  document.getElementById("confrontoB").value = 1;
});
