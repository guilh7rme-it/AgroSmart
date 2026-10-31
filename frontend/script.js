
const solo = document.getElementById("solo");
const temperatura = document.getElementById("temperatura");
const umidadeAr = document.getElementById("umidade-ar");
const irrigacao = document.getElementById("irrigacao");
const status = document.getElementById("status");

let grafico = null;

function atualizarPainel(leituras) {
  if (!leituras || leituras.length === 0) {
    status.textContent = "Nenhuma leitura encontrada.";
    return;
  }

  // A API retorna as leituras mais recentes primeiro.
  const ultima = leituras[0];

  solo.textContent = ultima.umidade_solo + "%";
  
const alertaSolo = document.getElementById("alerta-solo");

if (Number(ultima.umidade_solo) < 35) {
  alertaSolo.hidden = false;
  alertaSolo.textContent =
    "⚠️ ALERTA: Solo seco! Umidade abaixo de 35%.";
} else {
  alertaSolo.hidden = true;
}

  temperatura.textContent =
    Number(ultima.temperatura).toFixed(1) + " °C";
  umidadeAr.textContent = ultima.umidade_ar + "%";

  irrigacao.textContent = ultima.irrigacao_ligada
    ? "LIGADA"
    : "DESLIGADA";

  status.textContent =
    "Última atualização: " +
    new Date(ultima.criado_em).toLocaleString("pt-BR");

  const historico = [...leituras].reverse();

  const etiquetas = historico.map(item =>
    new Date(item.criado_em).toLocaleTimeString("pt-BR")
  );

  const dadosSolo = historico.map(item => item.umidade_solo);
  const dadosAr = historico.map(item => item.umidade_ar);
  const dadosTemperatura = historico.map(item => item.temperatura);

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(document.getElementById("grafico"), {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: "Umidade do solo (%)",
          data: dadosSolo,
          borderColor: "#16a34a",
          tension: 0.3
        },
        {
          label: "Umidade do ar (%)",
          data: dadosAr,
          borderColor: "#0284c7",
          tension: 0.3
        },
        {
          label: "Temperatura (°C)",
          data: dadosTemperatura,
          borderColor: "#f97316",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

async function carregarLeituras() {
  try {
    status.textContent = "Atualizando sensores...";

    const resposta = await fetch("/api/leituras");

    if (!resposta.ok) {
      throw new Error("HTTP " + resposta.status);
    }

    const leituras = await resposta.json();
    atualizarPainel(leituras);

  } catch (erro) {
    console.error(erro);
    status.textContent =
      "Não foi possível carregar os dados: " + erro.message;
  }
}

carregarLeituras();
setInterval(carregarLeituras, 5000);


const mensagemControle =
  document.getElementById("mensagem-controle");

const btnAutomatico =
  document.getElementById("btn-automatico");

const btnLigar =
  document.getElementById("btn-ligar");

const btnDesligar =
  document.getElementById("btn-desligar");

async function alterarIrrigacao(modo, ligada) {
  
  const senha = prompt("Digite a senha administrativa do AgroSmart:");

  if (senha === null || senha === "") {
    return;
  }

  const botoes = [btnAutomatico, btnLigar, btnDesligar];

  try {
    botoes.forEach(botao => botao.disabled = true);
    mensagemControle.textContent = "Enviando comando...";

    const resposta = await fetch("/api/controle", {
      method: "POST",
     
headers: {
  "Content-Type": "application/json",
  "x-admin-password": senha
},

      body: JSON.stringify({ modo, ligada })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro || "Erro desconhecido");
    }

    mensagemControle.textContent =
      "✅ Comando enviado! Aguardando resposta do ESP32...";

    // Atualizar indicadores após o comando
    setTimeout(carregarLeituras, 3000);

  } catch (erro) {
    mensagemControle.textContent =
      "❌ Não foi possível alterar a irrigação: " + erro.message;
  } finally {
    botoes.forEach(botao => botao.disabled = false);
  }
}

btnAutomatico.addEventListener("click", () => {
  alterarIrrigacao("automatico", false);
});

btnLigar.addEventListener("click", () => {
  alterarIrrigacao("manual", true);
});

btnDesligar.addEventListener("click", () => {
  alterarIrrigacao("manual", false);
});

