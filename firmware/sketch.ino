
#include <DHTesp.h>
#include <WiFiClientSecure.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_SENHA = "";

const char* API_URL =
  "https://rkrqobakajlsioletyma.supabase.co/functions/v1/hyper-api";

// Substitua pela chave configurada no Supabase.
// Nunca publique essa chave no GitHub.
const char* DEVICE_API_KEY = "CONFIGURE_SUA_CHAVE_AQUI";

const int PINO_DHT = 15;
const int PINO_SOLO = 34;
const int PINO_LED = 26;

const int LIMITE_UMIDADE = 35;

DHTesp dht;

// Controle da irrigacao
String modoIrrigacao = "automatico";
bool comandoManual = false;

// Consultar o controle no Supabase
void consultarControle() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi desconectado");
    return;
  }

  WiFiClientSecure cliente;
  cliente.setInsecure(); // Somente para simulacao

  
HTTPClient http;

http.setReuse(false);

if (!http.begin(cliente, API_URL)) {
  Serial.println("Erro ao iniciar conexao HTTPS");
  return;
}

http.setConnectTimeout(15000);
http.setTimeout(20000);

http.addHeader("x-device-key", DEVICE_API_KEY);
http.addHeader("Connection", "close");


  int resposta = http.GET();

  Serial.print("GET controle HTTP: ");
  Serial.println(resposta);

  if (resposta == 200) {
    String conteudo = http.getString();

    JsonDocument documento;
    DeserializationError erro =
      deserializeJson(documento, conteudo);

    if (!erro) {
      String novoModo =
        documento["modo"] | "automatico";

      if (novoModo == "automatico" ||
          novoModo == "manual") {
        modoIrrigacao = novoModo;
        comandoManual =
          documento["ligada"] | false;

        Serial.print("Modo: ");
        Serial.println(modoIrrigacao);

        Serial.print("Comando manual: ");
        Serial.println(
          comandoManual ? "LIGAR" : "DESLIGAR"
        );
      } else {
        Serial.println("Modo desconhecido");
      }
    } else {
      Serial.println("Erro ao interpretar controle");
    }
  } else {
    Serial.println("Falha ao consultar controle");
  }

  http.end();
}

// Enviar leitura dos sensores
void enviarLeitura(
  int solo,
  float temperatura,
  float umidadeAr,
  bool irrigacao
) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi desconectado");
    return;
  }

  WiFiClientSecure cliente;
  cliente.setInsecure(); // Somente para simulacao

  HTTPClient http;
  http.begin(cliente, API_URL);
  http.setTimeout(15000);

  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_API_KEY);

  String json = "{";
  json += "\"umidade_solo\":" + String(solo) + ",";
  json += "\"temperatura\":" + String(temperatura, 1) + ",";
  json += "\"umidade_ar\":" + String(umidadeAr, 1) + ",";
  json += "\"irrigacao_ligada\":";
  json += irrigacao ? "true" : "false";
  json += "}";

  Serial.println("Dados preparados: " + json);

  int resposta = http.POST(json);

  Serial.print("POST leitura HTTP: ");
  Serial.println(resposta);

  if (resposta > 0) {
    Serial.println(http.getString());
  } else {
    Serial.println("Erro ao enviar leitura");
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  pinMode(PINO_LED, OUTPUT);
  digitalWrite(PINO_LED, LOW);

  dht.setup(PINO_DHT, DHTesp::DHT22);

  WiFi.begin(WIFI_SSID, WIFI_SENHA, 6);

  Serial.print("Conectando ao Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi conectado!");
  Serial.println("AgroSmart iniciado!");
}

void loop() {
  // Buscar o modo de irrigacao
  consultarControle();

  // Ler umidade do solo
  int leituraSolo = analogRead(PINO_SOLO);

  int umidadeSolo =
    map(leituraSolo, 0, 4095, 100, 0);

  umidadeSolo = constrain(umidadeSolo, 0, 100);

  // Ler DHT22
  TempAndHumidity ambiente =
    dht.getTempAndHumidity();

  // Decidir se a irrigacao deve ligar
  bool irrigacaoLigada;

  if (modoIrrigacao == "manual") {
    irrigacaoLigada = comandoManual;
  } else {
    irrigacaoLigada =
      (umidadeSolo < LIMITE_UMIDADE);
  }

  // Controlar o LED
  digitalWrite(
    PINO_LED,
    irrigacaoLigada ? HIGH : LOW
  );

  Serial.println("-----------------------");
  Serial.println("AGROSMART - MONITORAMENTO");

  Serial.print("Umidade do solo: ");
  Serial.print(umidadeSolo);
  Serial.println("%");

  Serial.print("Temperatura: ");
  Serial.print(ambiente.temperature);
  Serial.println(" C");

  Serial.print("Umidade do ar: ");
  Serial.print(ambiente.humidity);
  Serial.println("%");

  Serial.print("Modo: ");
  Serial.println(modoIrrigacao);

  Serial.print("IRRIGACAO: ");
  Serial.println(
    irrigacaoLigada ? "LIGADA" : "DESLIGADA"
  );

  // Enviar dados ao Supabase
  if (
    isfinite(ambiente.temperature) &&
    isfinite(ambiente.humidity)
  ) {
    enviarLeitura(
      umidadeSolo,
      ambiente.temperature,
      ambiente.humidity,
      irrigacaoLigada
    );
  } else {
    Serial.println("Erro na leitura do DHT22");
  }

  delay(2000);
}
