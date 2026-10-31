
require("dotenv").config({ path: "./backend/.env" });




const express = require("express");
const path = require("path");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// Disponibilizar o painel AgroSmart
app.use(express.static(path.join(__dirname, "../frontend")));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Verificar chave do dispositivo
function verificarDispositivo(req, res, next) {
  const chaveRecebida = req.headers["x-device-key"];

  if (
    !process.env.DEVICE_API_KEY ||
    chaveRecebida !== process.env.DEVICE_API_KEY
  ) {
    return res.status(401).json({
      erro: "Acesso não autorizado"
    });
  }

  next();
}

// Receber leituras do ESP32
app.post("/api/leituras", verificarDispositivo, async (req, res) => {
  try {
    const {
      umidade_solo,
      temperatura,
      umidade_ar,
      irrigacao_ligada
    } = req.body;

    const { data, error } = await supabase
      .from("leituras")
      .insert([{
        umidade_solo,
        temperatura,
        umidade_ar,
        irrigacao_ligada
      }])
      .select();

    if (error) throw error;

    res.status(201).json({
      mensagem: "Leitura salva com sucesso!",
      dados: data
    });
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao salvar leitura"
    });
  }
});

// Consultar últimas leituras
app.get("/api/leituras", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("leituras")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao consultar leituras"
    });
  }
});

// Consultar estado do controle
app.get("/api/controle", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("controle_irrigacao")
      .select("modo, ligada")
      .eq("id", 1)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao consultar controle"
    });
  }
});


// Verificar senha administrativa antes de alterar a irrigação
function verificarAdministrador(req, res, next) {
  const senhaRecebida = req.headers["x-admin-password"];
  const senhaCorreta = process.env.ADMIN_PASSWORD;

  


  if (!senhaCorreta || senhaRecebida !== senhaCorreta) {
    return res.status(401).json({
      erro: "Senha administrativa incorreta ou ausente"
    });
  }

  next();
}

// Alterar modo da irrigação (rota protegida)
app.post("/api/controle", verificarAdministrador, async (req, res) => {

  try {
    const { modo, ligada } = req.body;

    if (
      !["automatico", "manual"].includes(modo) ||
      typeof ligada !== "boolean"
    ) {
      return res.status(400).json({
        erro: "Comando inválido"
      });
    }

    const { data, error } = await supabase
      .from("controle_irrigacao")
      .update({
        modo,
        ligada,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", 1)
      .select("modo, ligada")
      .single();

    if (error) throw error;

    res.json({
      mensagem: "Controle atualizado com sucesso!",
      controle: data
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      erro: "Erro ao atualizar irrigação"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AgroSmart rodando na porta ${PORT}`);
});
