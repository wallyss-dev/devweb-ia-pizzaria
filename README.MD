
# Forno & Massa - Pizzaria Artesanal

Projeto Final Interdisciplinar (AV3) desenvolvido para as disciplinas de **Desenvolvimento Web para IA** e **Banco de Dados**, do Curso Superior de Tecnologia em Inteligência Artificial (2º Período) da Faculdade Estadual Piauí - Instituto de Tecnologia (PIT).

---

## Descrição Geral do Projeto

O Forno & Massa é uma plataforma web completa voltada para a apresentação e comercialização de pizzas artesanais de longa fermentação. O sistema foi projetado para oferecer uma experiência visual agradável e intuitiva, permitindo que os clientes conheçam a história da pizzaria, consultem o cardápio dinâmico integrado ao banco de dados, realizem reservas de mesa com persistência real e tirem dúvidas em tempo real por meio de uma assistente virtual inteligente integrada à API do Google Gemini.

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
* **JavaScript (Vanilla ES6+):** Manipulação do DOM, eventos interativos e consumo de API assíncrono com `fetch` (`async/await`).

**Back-end e Banco de Dados:**
* **Node.js & Express:** Criação do servidor web local para servir arquivos estáticos e gerenciar as rotas da API REST.
* **PostgreSQL & Neon.tech:** Banco de dados relacional hospedado na nuvem, acessado via driver `pg` com queries parametrizadas (proteção contra SQL Injection).

**Inteligência Artificial e Segurança:**
* **Google GenAI SDK (`@google/genai`):** Integração oficial com o modelo generativo Google Gemini (`gemini-1.5-flash`).
* **Dotenv (`dotenv`):** Gerenciamento seguro de variáveis de ambiente para proteção de chaves e strings de conexão (`GEMINI_API_KEY` e `DATABASE_URL`).

---

## Principais Funcionalidades

1. **Recepção Personalizada:** Captura o nome do visitante ao acessar a página e atualiza dinamicamente a saudação no banner principal (Hero).
2. **Navegação Funcional e Responsiva:** Menu lateral fixo em telas grandes (Desktop) que se adapta automaticamente para o topo em dispositivos móveis (Mobile).
3. **Cardápio Dinâmico em Cards (Read):** Exibição dos sabores de pizzas lidos diretamente da tabela `produto` do banco de dados, renderizando apenas os itens com `disponibilidade = true`.
4. **Reserva de Mesa com Persistência (Create):** Formulário interativo que cadastra o cliente (respeitando unicidade de e-mail) e salva o pedido no banco PostgreSQL, retornando a confirmação com o ID gerado.
5. **Cancelamento Inteligente / Exclusão Controlada (Delete):** Permite ao cliente cancelar a reserva. O sistema exclui o pedido e os itens associados de forma segura, mas preserva o histórico cadastral da tabela `cliente` para manter a integridade relacional.
6. **Atendente Virtual com IA:** Chatbot funcional integrado ao Gemini que responde às dúvidas mantendo o contexto e o histórico da conversa.

---

## Integração com Inteligência Artificial e Persona

O projeto conta com uma integração real de IA generativa por meio do SDK `@google/genai`, utilizando arquitetura cliente-servidor para proteger a chave de API no back-end (`server.js`).

### Perfil da Persona
* **Nome da Assistente:** Luiza
* **Função:** Atendente virtual da Pizzaria Forno & Massa.
* **Tom de Voz:** Simpática, acolhedora, direta, simples e profissional, evitando jargões e mantendo respostas curtas e objetivas (até 4 frases).

### Como Funciona o Controle de Contexto
As diretrizes da assistente estão centralizadas no arquivo `persona.js` (divididas em PERSONA, CONHECIMENTO e REGRAS) e são injetadas no modelo através da propriedade `systemInstruction`.

* **Domínio de Conhecimento:** A Luiza conhece exclusivamente o endereço, o horário de funcionamento, os 6 sabores e preços exatos do cardápio e as formas de pagamento.
* **Prevenção de Fuga de Contexto e Regras Avançadas:** A IA foi instruída a nunca inventar promoções, a lidar com mudanças de pedido, a questionar contradições lógicas e a direcionar o cliente para o formulário do site ou para o WhatsApp dependendo da intenção (reserva vs. delivery).
* **Memória de Curto Prazo:** O servidor utiliza um identificador de sessão (`sessionId`) armazenado em memória (`Map`) para manter o histórico do diálogo enquanto o usuário navega na página.

---

## Estrutura de Pastas e Arquivos

```text
devweb-ia-pizzaria/
├── public/                 # Arquivos do Front-end (acessíveis pelo navegador)
│   ├── index.html          # Estrutura principal da página e seções
│   ├── style.css           # Estilização, paleta de cores, cards e responsividade
│   ├── script.js           # Eventos de DOM, fetch da IA e das rotas do banco
│   └── Pizza.webp          # Imagem de fundo da seção inicial
├── database/               # Scripts SQL documentando o Banco de Dados
│   ├── 01_criacao.sql      # DDL: Criação das 4 tabelas e restrições
│   ├── 02_carga.sql        # DML: Inserção de dados de demonstração fictícios
│   ├── 03_consultas.sql    # DQL: Consultas com JOIN e funções de Agregação
│   └── 04_indice.sql       # Otimização de performance com CREATE INDEX
├── .env.exemplo            # Arquivo de referência para variáveis de ambiente
├── .gitignore              # Lista de arquivos ignorados pelo Git (node_modules, .env)
├── package.json            # Configurações do projeto Node.js e dependências
├── persona.js              # Definição da identidade e regras da IA
├── server.js               # Servidor Express, Rotas SQL e integração Gemini
└── README.md               # Documentação técnica do projeto


## Instruções de Instalação e Execução

Para executar este projeto localmente, siga o passo a passo abaixo:

### Pré-requisitos
- Ter o [Node.js](https://nodejs.org/) instalado (versão 20 LTS ou superior).
- Possuir uma conexão com um banco PostgreSQL (Recomendado usar a nuvem Neon.tech)
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
GEMINI_API_KEY=COLE_SUA_CHAVE_DO_GOOGLE_AQUI
DATABASE_URL=COLE_SUA_STRING_DE_CONEXAO_DO_POSTGRESQL_AQUI
```

### Passo 4: Inicializar o Banco de Dados (Opcional se já estiver configurado na nuvem)
- Execute os scripts disponíveis na pasta /banco na sua interface SQL preferida (pgAdmin, DBeaver, ou console do Neon.tech) seguindo a ordem numérica (01_criacao.sql e 02_carga.sql).

```bash
npm start
```
Abra o navegador e acesse: **http://localhost:3000**


### Passo 5: Iniciar o servidor e acessar
```bash
npm start
```
Abra o navegador e acesse: **http://localhost:3000**