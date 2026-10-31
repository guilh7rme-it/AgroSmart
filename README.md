# 🌱 AgroSmart — Sistema Inteligente de Monitoramento de Hortas

## 📋 Sobre o projeto

O **AgroSmart** é um sistema de monitoramento e controle inteligente de hortas, desenvolvido como projeto acadêmico de extensão do curso de Análise e Desenvolvimento de Sistemas (ADS).

O projeto utiliza conceitos de **Internet das Coisas (IoT)**, automação e agricultura inteligente (*Smart Farming*) para acompanhar condições ambientais e controlar a irrigação de maneira remota ou automática.

O funcionamento é demonstrado por meio de uma simulação de ESP32 no Wokwi, integrada a um banco de dados na nuvem e a uma aplicação web.

## 🎯 Objetivo

Desenvolver uma solução tecnológica acessível para demonstrar como o monitoramento ambiental e a automação podem contribuir para o uso consciente da água e o cuidado com hortas.

## ⚙️ Funcionalidades

- Monitoramento da umidade do solo.
- Monitoramento da temperatura ambiente.
- Monitoramento da umidade do ar.
- Visualização das informações em um painel web.
- Atualização periódica dos dados dos sensores.
- Gráfico com o histórico das medições.
- Alerta quando a umidade do solo está abaixo de 35%.
- Irrigação automática baseada na umidade do solo.
- Controle remoto para ligar ou desligar a irrigação.
- Armazenamento das leituras no Supabase.
- Proteção dos comandos administrativos por senha.

## 🛠️ Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| ESP32 | Microcontrolador simulado |
| Wokwi | Simulação do circuito eletrônico |
| DHT22 | Medição de temperatura e umidade do ar |
| Potenciômetro | Simulação da umidade do solo |
| LED | Representação do acionamento da irrigação |
| Node.js | Ambiente de execução do servidor |
| Express | Desenvolvimento da API |
| Supabase | Banco de dados e Edge Functions |
| HTML, CSS e JavaScript | Interface web |
| Chart.js | Visualização gráfica das leituras |
| Git e GitHub | Versionamento do projeto |

## 🧠 Como funciona

1. O ESP32 simulado coleta as informações dos sensores.
2. O sistema consulta o modo de funcionamento da irrigação.
3. No modo automático, a irrigação é acionada quando a umidade do solo fica abaixo de 35%.
4. No modo manual, o sistema segue o comando enviado pelo painel.
5. O ESP32 envia as medições para uma API hospedada no Supabase.
6. Os dados são armazenados no banco de dados.
7. O painel web consulta as leituras e apresenta indicadores, histórico e alertas.

## 📁 Estrutura do projeto

```text
AgroSmart/
├── backend/
│   └── server.js
├── firmware/
│   └── sketch.ino
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 💻 Como executar localmente

**Pré-requisitos:** Node.js instalado e um projeto Supabase configurado.

1. Clone o repositório.
2. Abra a pasta AgroSmart no VS Code.
3. Execute `npm install`.
4. Configure as variáveis de ambiente necessárias no arquivo `backend/.env`, sem publicar credenciais.
5. Execute `node backend/server.js`.
6. Acesse `http://localhost:3000` no navegador.

Para receber novas leituras, execute também a simulação do ESP32 no Wokwi com a API configurada.

## 🌍 Sustentabilidade

O projeto está relacionado especialmente aos Objetivos de Desenvolvimento Sustentável:

- **ODS 6 — Água Potável e Saneamento:** uso mais consciente dos recursos hídricos.
- **ODS 9 — Indústria, Inovação e Infraestrutura:** aplicação de tecnologias digitais.
- **ODS 12 — Consumo e Produção Responsáveis:** incentivo ao uso eficiente de recursos.

## 🔐 Segurança

As credenciais administrativas e chaves secretas não devem ser publicadas no repositório. Os arquivos de ambiente são excluídos do versionamento por meio do `.gitignore`.

O firmware disponibilizado no GitHub utiliza um valor de exemplo para a chave do dispositivo, que deve ser configurada antes da execução.

## 📌 Status

Protótipo funcional em ambiente de simulação, com monitoramento, histórico e controle de irrigação integrados.

**Observação:** o projeto demonstra conceitos de agricultura inteligente. Não utiliza sensores físicos nem um modelo de inteligência artificial treinado; a decisão automática de irrigação é baseada em uma regra de umidade.

## 🎓 Contexto acadêmico

Projeto de extensão desenvolvido por estudantes do curso de Análise e Desenvolvimento de Sistemas (ADS), com foco na aplicação prática de tecnologia, inovação e sustentabilidade.