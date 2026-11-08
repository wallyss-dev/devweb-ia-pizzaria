# Forno & Massa - Pizzaria Artesanal

Projeto prático desenvolvido para a 3ª Avaliação (AV3 - Parte 1) da disciplina de Desenvolvimento Web para IA, do Curso Superior de Tecnologia em Inteligência Artificial (2º Período) da Faculdade Estadual Piauí - Instituto de Tecnologia (PIT).

---

## Descrição Geral do Projeto

O Forno & Massa é uma plataforma web completa voltada para a apresentação e comercialização de pizzas artesanais de longa fermentação. O sistema foi projetado para oferecer uma experiência visual agradável e intuitiva, permitindo que os clientes conheçam a história da pizzaria, consultem o cardápio detalhado com preços, realizem reservas de mesa e tirem dúvidas em tempo real por meio de uma assistente virtual inteligente integrada à API do Google Gemini.

### Público-Alvo
Amantes da gastronomia artesanal, famílias, casais e grupos de amigos que buscam praticidade para consultar opções do cardápio, verificar horários de atendimento, reservar mesas para consumo presencial ou iniciar pedidos via delivery.

---

## Integrantes do Grupo

* **Wallysson Uriel Silva Torres** - GitHub: [@wallyss-dev](https://github.com/wallyss-dev)
* **Arthur dos Santos Alcântara** - GitHub: [@arthuralcantarax-netizen](https://github.com/arthuralcantarax-netizen)
* **João Gabriel Oliveira** - GitHub: [@JoaoGabriel-o](https://github.com/JoaoGabriel-o)

---

## Tecnologias Utilizadas

**Front-end:**
* **HTML5:** Estruturação semântica das seções, cabeçalho, navegação, formulários e rodapé.
* **CSS3:** Estilização temática com variáveis CSS (`:root`), layout responsivo (`@media queries`) e construção de cards utilizando `display: grid` e `display: flex`.
* **JavaScript (Vanilla ES6+):** Manipulação do DOM, eventos interativos (`click`, `dblclick`, `mouseenter`, `mouseleave`, `keydown`) e consumo de API assíncrono com `fetch` (`async/await`).

**Back-end e Inteligência Artificial:**
* **Node.js & Express:** Criação do servidor web local para servir os arquivos estáticos e gerenciar a rota de comunicação segura (`/api/chat`).
* **Google GenAI SDK (`@google/genai`):** Integração oficial com o modelo generativo Google Gemini (`gemini-3.7-flash`).
* **Dotenv (`dotenv`):** Gerenciamento seguro de variáveis de ambiente para proteção da chave de API (`GEMINI_API_KEY`).

---

## Principais Funcionalidades

1. **Recepção Personalizada:** Captura o nome do visitante ao acessar a página e atualiza dinamicamente a saudação no banner principal (Hero).
2. **Navegação Funcional e Responsiva:** Menu lateral fixo em telas grandes (Desktop) que se adapta automaticamente para o topo em dispositivos móveis (Mobile), contendo links para todas as seções (Início, Sobre, Cardápio, Reserva, Assistente e Contato).
3. **Cardápio em Cards:** Exibição de 6 sabores de pizzas (Margherita, Calabresa, Quatro Queijos, Portuguesa, Frango com Catupiry e Pepperoni).
4. **Simulador de Reserva de Mesa:** Formulário interativo que valida a entrada do usuário, formata o texto e exibe a confirmação de reserva instantaneamente na tela.
5. **Atendente Virtual com IA:** Chatbot funcional integrado ao Gemini que responde às dúvidas dos clientes mantendo o contexto e o histórico da conversa.
6. **Integração Direta com WhatsApp:** Botão de ação rápida para redirecionamento do cliente ao canal de pedidos e delivery.

---

## Integração com Inteligência Artificial e Persona

O projeto conta com uma integração real de IA generativa por meio do SDK `@google/genai`, utilizando arquitetura cliente-servidor para proteger a chave de API no back-end (`server.js`).

### Perfil da Persona
* **Nome da Assistente:** Luiza
* **Função:** Atendente virtual da Pizzaria Forno & Massa (presencial e delivery).
* **Tom de Voz:** Simpática, acolhedora, direta, simples e profissional, evitando jargões técnicos e mantendo respostas curtas e objetivas (até 4 frases).

### Como Funciona o Controle de Contexto
As diretrizes da assistente estão centralizadas no arquivo `persona.js` (divididas em PERSONA, CONHECIMENTO e REGRAS) e são injetadas no modelo através da propriedade `systemInstruction`.

* **Domínio de Conhecimento:** A Luiza conhece exclusivamente o endereço, o horário de funcionamento, os 6 sabores e preços exatos do cardápio e as formas de pagamento aceitas.
* **Prevenção de Fuga de Contexto e Regras Avançadas:** A IA foi instruída a nunca inventar promoções, a lidar com mudanças de pedido mantendo a memória do carrinho, a questionar contradições lógicas (como pedir Catupiry em uma pizza sem lactose) e a direcionar o cliente para o atendimento humano no WhatsApp em caso de reclamações.
* **Memória de Curto Prazo:** O servidor utiliza um identificador de sessão (`sessionId`) armazenado em memória (`Map`) para manter o histórico do diálogo enquanto o usuário navega na página.

---

## Estrutura de Pastas e Arquivos

```text
devweb-ia-pizzaria/
├── public/                 # Arquivos do Front-end (acessíveis pelo navegador)
│   ├── index.html          # Estrutura principal da página e seções
│   ├── style.css           # Estilização, paleta de cores, cards (Grid/Flex) e responsividade
│   ├── script.js           # Eventos de DOM, lógica de reserva e requisição fetch para a IA
│   └── Pizza.webp          # Imagem de fundo da seção inicial
├── .env.exemplo            # Arquivo de referência para configuração da chave de API
├── .gitignore              # Lista de arquivos ignorados pelo Git (node_modules, .env, pedidos.json)
├── package.json            # Configurações do projeto Node.js e dependências instaladas
├── package-lock.json       # Mapeamento exato das versões das bibliotecas
├── persona.js              # Definição da identidade, base de conhecimento e regras da IA
├── server.js               # Servidor Express e integração com a API do Google Gemini
└── README.md               # Documentação técnica do projeto

```

---

## Instruções de Instalação e Execução

Para executar este projeto localmente, siga o passo a passo abaixo:

### Pré-requisitos
- Ter o [Node.js](https://nodejs.org/) instalado (versão 20 LTS ou superior).
- Possuir uma chave de API gratuita do Google Gemini, gerada no [Google AI Studio](https://aistudio.google.com/).

### Passo 1: Clonar o repositório
```bash
git clone [https://github.com/wallyss-dev/devweb-ia-pizzaria.git](https://github.com/wallyss-dev/devweb-ia-pizzaria.git)
cd devweb-ia-pizzaria
```

### Passo 2: Instalar as dependências
```bash
npm install
```

### Passo 3: Configurar a Chave de API
Crie um arquivo chamado `.env` na raiz do projeto (fora da pasta `public`) e adicione sua chave:
```env
GEMINI_API_KEY=COLE_SUA_CHAVE_AQUI
```

### Passo 4: Iniciar o servidor e acessar
```bash
npm start
```
Abra o navegador e acesse: **http://localhost:3000**