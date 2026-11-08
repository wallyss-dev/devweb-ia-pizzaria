# Forno & Massa — Pizzaria Artesanal


## Descrição Geral do Projeto

O **Forno & Massa** é uma plataforma web completa voltada para a apresentação e comercialização de pizzas artesanais de longa fermentação. O sistema foi projetado para oferecer uma experiência visual agradável e intuitiva, permitindo que os clientes conheçam a história da pizzaria, consultem o cardápio detalhado com preços, realizem reservas de mesa e tirem dúvidas em tempo real por meio de uma assistente virtual inteligente integrada à API do **Google Gemini**.

---

## Público-Alvo

Amantes da gastronomia artesanal, famílias, casais e grupos de amigos que buscam praticidade para consultar opções do cardápio, verificar horários de atendimento, reservar mesas para consumo presencial ou iniciar pedidos via delivery.

---

## Integrantes do Grupo

* **Integrante 1:** WallyssDev
* **Integrante 2:** ArthurDev
* **Integrante 3:** GabrielDev

---

## Tecnologias Utilizadas

### Front-end
* **HTML5:** Estruturação semântica das seções, cabeçalho, navegação, formulários e rodapé.
* **CSS3:** Estilização temática com variáveis CSS (`:root`), layout responsivo (`@media` queries) e construção de cards utilizando `display: grid` e `display: flex`.
* **JavaScript (Vanilla ES6+):** Manipulação do DOM, eventos interativos (`click`, `dblclick`, `mouseenter`, `mouseleave`, `keydown`) e consumo de API assíncrono com `fetch` (`async/await`).

### Back-end e Inteligência Artificial
* **Node.js & Express:** Criação do servidor web local para servir os arquivos estáticos da pasta `public/` e gerenciar a rota de comunicação segura (`/api/chat`).
* **Google GenAI SDK (`@google/genai`):** Integração oficial com o modelo generativo Google Gemini (`gemini-3.7-flash`).
* **Dotenv (`dotenv`):** Gerenciamento seguro de variáveis de ambiente para proteção da chave de API (`GEMINI_API_KEY`).

---

## Principais Funcionalidades

* **Recepção Personalizada:** Captura o nome do visitante ao acessar a página e atualiza dinamicamente a saudação no banner principal (*Hero*).
* **Navegação Funcional e Responsiva:** Menu lateral fixo em telas grandes (*Desktop*) que se adapta automaticamente para o topo em dispositivos móveis (*Mobile*), contendo links para todas as seções (*Início, Sobre, Cardápio, Reserva, Assistente e Contato*).
* **Cardápio Interativo em Cards:** Exibição das pizzas (*Margherita, Calabresa e Quatro Queijos*) organizadas com CSS Grid, apresentando efeitos visuais ao passar o mouse e alertas informativos ao clicar.
* **Simulador de Reserva de Mesa:** Formulário interativo que valida a entrada do usuário, formata o texto e exibe a confirmação de reserva instantaneamente na tela.
* **Atendente Virtual com IA:** Chatbot funcional integrado ao Gemini que responde às dúvidas dos clientes mantendo o histórico e o contexto da conversa.
* **Integração Direta com WhatsApp:** Botão de ação rápida para redirecionamento do cliente ao canal de pedidos e delivery.

---

## Integração com Inteligência Artificial e Persona

O projeto conta com uma integração real de IA generativa por meio do SDK `@google/genai`, utilizando arquitetura cliente-servidor para proteger a chave de API no back-end (`server.js`).

### Perfil da Persona
* **Nome da Assistente:** Luiza
* **Função:** Atendente virtual da Pizzaria Forno & Massa (presencial e delivery).
* **Tom de Voz:** Simpática, acolhedora, direta, simples e profissional, evitando jargões técnicos e mantendo respostas curtas e objetivas (até 4 frases).

### Como Funciona o Controle de Contexto
As diretrizes da assistente estão centralizadas no arquivo `persona.js` (divididas em `PERSONA`, `CONHECIMENTO` e `REGRAS`) e são injetadas no modelo através da propriedade `systemInstruction`:

1. **Domínio de Conhecimento:** A Luiza conhece exclusivamente o endereço (*Rua da esquina, 123*), o horário de funcionamento (*todos os dias, das 18h às 23h*), os sabores e preços exatos do cardápio (*Margherita por 42 reais, Calabresa por 46 reais e Quatro Queijos por 52 reais*) e as formas de pagamento aceitas (*Pix, dinheiro e cartões*).
2. **Prevenção de Fuga de Contexto:** A IA foi instruída a nunca inventar promoções ou sabores fora do catálogo, recusar educadamente assuntos que não tenham relação com a pizzaria e direcionar o cliente para a seção de Reserva do site ou para o WhatsApp no caso de pedidos de entrega.
3. **Memória de Curto Prazo:** O servidor utiliza um identificador de sessão (`sessionId`) armazenado em memória (`Map`) para manter o histórico do diálogo enquanto o usuário conversa no chat.

---

## Estrutura de Pastas e Arquivos

```text
devweb-ia-pizzaria/
├── public/                 # Arquivos do Front-end (servidos pelo Express)
│   ├── index.html          # Estrutura principal da página e seções
│   ├── style.css           # Estilização, paleta de cores, cards (Grid/Flex) e responsividade
│   └── script.js           # Eventos de DOM, lógica de reserva e requisição fetch para a IA
├── .env.exemplo            # Arquivo de referência para configuração da chave de API
├── .gitignore              # Lista de arquivos ignorados pelo Git (node_modules, .env)
├── package.json            # Configurações do projeto Node.js e dependências instaladas
├── package-lock.json       # Mapeamento exato das versões das bibliotecas
├── persona.js              # Definição da identidade, base de conhecimento e regras da IA
├── server.js               # Servidor Express e integração com a API do Google Gemini
└── README.md               # Documentação técnica do projeto
```

---

## Instruções de Instalação e Execução (Passo a Passo)

Qualquer pessoa pode baixar e testar este projeto localmente seguindo as etapas abaixo:

### 1. Pré-requisitos
* Ter o [Node.js](https://nodejs.org/) instalado (versão 20 LTS ou superior).
* Gerar uma chave de API gratuita do Google Gemini no [Google AI Studio](https://aistudio.google.com/).

### 2. Clonar ou baixar o repositório
Abra o terminal e execute os comandos abaixo (ou extraia o arquivo `.zip` do projeto e abra a pasta no VS Code):

```bash
git clone [https://github.com/SEU-USUARIO/devweb-ia-pizzaria.git](https://github.com/SEU-USUARIO/devweb-ia-pizzaria.git)
cd devweb-ia-pizzaria
```

### 3. Instalar as dependências do projeto
No terminal, dentro da pasta raiz do projeto, execute o comando abaixo para baixar as bibliotecas necessárias (`express`, `dotenv` e `@google/genai`):

```bash
npm install
```

### 4. Configurar a Chave de API (`.env`)
Por segurança, a chave da API não fica salva no repositório público. Para configurar a sua chave local:

1. Na raiz do projeto (fora da pasta `public`), crie um arquivo chamado exatamente `.env` (você também pode duplicar o arquivo `.env.exemplo` e renomear a cópia para `.env`).
2. Dentro do arquivo `.env`, cole a sua chave gerada no Google AI Studio exatamente neste formato (sem aspas e sem espaços):

```env
GEMINI_API_KEY=COLE_SUA_CHAVE_AQUI
```

### 5. Iniciar o servidor
No terminal, inicie o servidor Node.js com o comando:

```bash
npm start
```
*(Ou, alternativamente, execute `node server.js`).*

O terminal mostrará a confirmação de que o servidor está ativo:
```text
 Forno & Massa no ar: http://localhost:3000
 Atendente virtual: Luiza
```

### 6. Acessar e testar a aplicação
Abra o seu navegador e acesse:
 **http://localhost:3000**

---

## Solução de Problemas Comuns (FAQ)

* **O chat não responde quando abro o `index.html` direto da pasta ou pelo Live Server:**
  Isso é esperado. A Inteligência Artificial roda no servidor Node.js (`server.js`). Para o chat funcionar, você deve sempre ligar o servidor no terminal (`npm start`) e acessar pelo endereço `http://localhost:3000`.

* **Erro 503 (`UNAVAILABLE / High demand`) no terminal:**
  Significa que a sua chave e o seu código funcionaram perfeitamente, mas o servidor gratuito do Google teve um pico de acessos naquele segundo. Basta aguardar alguns instantes e enviar a mensagem novamente no chat.

* **Alterações no `persona.js` ou `server.js` não aparecem:**
  Sempre que editar arquivos do back-end ou o arquivo `.env`, pare o servidor no terminal pressionando `Ctrl + C` e inicie novamente com `npm start`.

---

## Licença e Uso
Projeto desenvolvido exclusivamente para fins didáticos
