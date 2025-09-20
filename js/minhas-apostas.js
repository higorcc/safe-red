document.addEventListener("DOMContentLoaded", function () {
  const lista = document.getElementById("lista-apostas-salvas");

  // ========= TABELA =========
  function carregarApostas() {
    const apostas = JSON.parse(localStorage.getItem("apostasSalvas")) || [];

    if (apostas.length === 0) {
      lista.innerHTML = "<p>Nenhuma aposta salva por enquanto.</p>";
      return;
    }

    const tabela = document.createElement("table");
    tabela.id = "tabela-apostas";
    tabela.innerHTML = `
      <thead>
        <tr>
          <th>#</th>
          <th>Data</th>
          <th>Casa</th>
          <th>Odd</th>
          <th>Valor (R$)</th>
          <th>Retorno Esperado</th>
          <th>Valor Obtido</th>
          <th>Análises</th>
          <th>Resultado</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${apostas.map((aposta, i) => {
          const dataFormatada = new Date(aposta.dataHora).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "numeric",
          });

          const resultadoEmoji =
            aposta.resultado === "green"   ? "✅" :
            aposta.resultado === "red"     ? "❌" :
            aposta.resultado === "cashout" ? "🟨" : "—";

          const analisesHtml = (aposta.analises || []).map(a => `
            <li>
              ${a.sugestao} — a favor de <strong>${a.timeAfavor}</strong>
              (${(a.timeCasa || a.timeAfavor)} vs ${(a.timeFora || a.timeContra)})
            </li>
          `).join("");

          const retornoNum = parseFloat(aposta.retorno);
          let valorObtidoCalc = "—";
          if (aposta.resultado === "green") {
            valorObtidoCalc = retornoNum.toFixed(2);
          } else if (aposta.resultado === "red") {
            valorObtidoCalc = "0.00";
          } else if (aposta.resultado === "cashout" && aposta.valorObtido != null) {
            valorObtidoCalc = parseFloat(aposta.valorObtido).toFixed(2);
          }

          return `
            <tr>
              <td>${i + 1}</td>
              <td>${dataFormatada}</td>
              <td>${aposta.casa}</td>
              <td>${aposta.odd}</td>
              <td>R$ ${parseFloat(aposta.valor).toFixed(2)}</td>
              <td>R$ ${retornoNum.toFixed(2)}</td>
              <td>R$ ${valorObtidoCalc}</td>
              <td><ul>${analisesHtml}</ul></td>
              <td>${resultadoEmoji}</td>
              <td><button class="detalhes-btn" data-index="${i}" title="Detalhes">🔍</button></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    `;

    lista.innerHTML = "";
    lista.appendChild(tabela);

    // Liga os botões de detalhes
    document.querySelectorAll(".detalhes-btn").forEach(btn => {
      btn.addEventListener("click", () => abrirModalDetalhes(parseInt(btn.dataset.index, 10)));
    });
  }

  // ========= MODAL DETALHES =========
  const modal            = document.getElementById("modal-detalhes");
  const fechar           = modal.querySelector(".fechar-modal");
  const selectResultado  = document.getElementById("resultado-select");
  const resumoAnalises   = document.getElementById("analises-resumo");
  const redDetalhes      = document.getElementById("red-detalhes");
  const checkboxAnalises = document.getElementById("checkbox-analises");
  const cashoutCampo     = document.getElementById("cashout-campo");
  const cashoutValor     = document.getElementById("cashout-valor");
  const salvarBtn        = document.getElementById("salvar-detalhes");

  let apostaAtualIndex = null;
  let retornoEsperadoAtual = 0;

  function abrirModalDetalhes(index) {
    const historico = JSON.parse(localStorage.getItem("apostasSalvas")) || [];
    const aposta = historico[index];
    apostaAtualIndex = index;

    // guarda retorno esperado para validar cashout
    retornoEsperadoAtual = parseFloat(aposta.retorno) || 0;

    // Resumo das análises
    resumoAnalises.innerHTML = `
      <strong>Análises incluídas:</strong>
      <ul style="margin-top:6px;">
        ${(aposta.analises || []).map(a => `
          <li>${a.sugestao} — a favor de <strong>${a.timeAfavor}</strong>
              (${(a.timeCasa || a.timeAfavor)} vs ${(a.timeFora || a.timeContra)})</li>
        `).join("")}
      </ul>
    `;

    // Estado atual do resultado
    selectResultado.value = aposta.resultado || "";

    redDetalhes.style.display  = (selectResultado.value === "red") ? "block" : "none";
    cashoutCampo.style.display = (selectResultado.value === "cashout") ? "block" : "none";
    cashoutValor.value = (aposta.resultado === "cashout" && aposta.valorObtido != null)
      ? String(aposta.valorObtido) : "";

    // Monta checkboxes de falhas
    checkboxAnalises.innerHTML = "";
    (aposta.analises || []).forEach((a, i) => {
      const checked = aposta.falhas && aposta.falhas.includes(i) ? "checked" : "";
      const lbl = document.createElement("label");
      lbl.innerHTML = `
        <input type="checkbox" value="${i}" ${checked}>
        ${a.sugestao} — ${a.timeAfavor} (${(a.timeCasa || a.timeAfavor)} vs ${(a.timeFora || a.timeContra)})
      `;
      checkboxAnalises.appendChild(lbl);
    });

    modal.style.display = "flex";
  }

  // Fecha modal (X e clique fora)
  fechar.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

  // Alterna se mostra blocos de red/cashout
  selectResultado.addEventListener("change", () => {
    const v = selectResultado.value;
    redDetalhes.style.display   = v === "red" ? "block" : "none";
    cashoutCampo.style.display  = v === "cashout" ? "block" : "none";
  });

  // ===== Salvar (modal de detalhes) =====
  salvarBtn.addEventListener("click", () => {
    if (apostaAtualIndex === null) return;

    const historico = JSON.parse(localStorage.getItem("apostasSalvas")) || [];
    const aposta = historico[apostaAtualIndex];

    const v = selectResultado.value;  // "green" | "red" | "cashout" | ""
    aposta.resultado = v || "";

    // limpa defaults
    aposta.falhas = [];
    delete aposta.valorObtido;

    if (v === "red") {
      // precisa marcar ao menos uma análise que falhou
      const selecionadas = Array
        .from(checkboxAnalises.querySelectorAll("input[type='checkbox']:checked"))
        .map(chk => parseInt(chk.value, 10));

      if (selecionadas.length === 0) {
        alert("Selecione ao menos uma análise que falhou.");
        return;
      }
      aposta.falhas = selecionadas;
      aposta.valorObtido = "0.00"; // red => 0

    } else if (v === "green") {
      // green => igual ao retorno esperado
      aposta.valorObtido = parseFloat(aposta.retorno).toFixed(2);

    } else if (v === "cashout") {
      const num = parseFloat(cashoutValor.value);
      const maximo = retornoEsperadoAtual; // retorno esperado salvo ao abrir modal

      if (isNaN(num) || num < 0) {
        alert("Informe um valor de cashout válido (maior ou igual a 0).");
        return;
      }
      // regra: cashout deve ser ESTRITAMENTE menor que o retorno esperado
      if (num >= maximo) {
        alert(`Valor de cash out deve ser menor que o valor total da aposta (máx R$ ${maximo.toFixed(2)}).`);
        return;
      }
      aposta.valorObtido = num.toFixed(2);
    }

    // persiste e fecha
    localStorage.setItem("apostasSalvas", JSON.stringify(historico));
    modal.style.display = "none";
    carregarApostas();
  });

  // Inicializa
  carregarApostas();
});
