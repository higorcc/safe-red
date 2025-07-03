document.getElementById("form-analise").addEventListener("submit", function (e) {
  e.preventDefault(); // evita recarregar a página

  const form = e.target;

  const timeA = form.timeA.value.trim();
  const timeB = form.timeB.value.trim();

  // Pega os valores dos critérios
  const motivacaoA = parseInt(form.motivacaoA.value) || 0;
  const motivacaoB = parseInt(form.motivacaoB.value) || 0;

  const momentoA = parseInt(form.momentoA.value) || 0;
  const momentoB = parseInt(form.momentoB.value) || 0;

  const elencoA = parseInt(form.elencoA.value) || 0;
  const elencoB = parseInt(form.elencoB.value) || 0;

  const casaForaA = parseInt(form.casaForaA.value) || 0;
  const casaForaB = parseInt(form.casaForaB.value) || 0;

  const confrontoA = parseInt(form.confrontoA.value) || 0;
  const confrontoB = parseInt(form.confrontoB.value) || 0;

  // Soma os pontos
  const totalA = motivacaoA + momentoA + elencoA + casaForaA + confrontoA;
  const totalB = motivacaoB + momentoB + elencoB + casaForaB + confrontoB;

  const diferenca = totalA - totalB;
  let mensagem = "";

  // Sugestão de aposta com base na diferença
  if (Math.abs(diferenca) <= 2) {
    mensagem = "Muito equilibrado - Evite apostar ou vá de mercado de gols, escanteios, etc.";
  } else if (Math.abs(diferenca) <= 4) {
    mensagem = `Leve vantagem - Dupla chance ou empate anula para ${diferenca > 0 ? timeA : timeB}.`;
  } else if (Math.abs(diferenca) <= 6) {
    mensagem = `Boa vantagem - Vitória seca a favor de ${diferenca > 0 ? timeA : timeB}.`;
  }
    else if (Math.abs(diferenca) <= 9) {
    mensagem = `Vantagem significativa - Handicap -1.5 ou over gols a favor de ${diferenca > 0 ? timeA : timeB}.`;
  }
  else {
    mensagem = `Favoritismo claro - Handicap -2.5 ou over gols a favor de ${diferenca > 0 ? timeA : timeB}.`;
  }

  document.getElementById("resultado").innerText = `
    Diferença: ${Math.abs(diferenca)} ponto(s)\n
    Sugestão: ${mensagem}
  `;
});
