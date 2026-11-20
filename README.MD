# Forno & Massa - Pizzaria Artesanal

Projeto Final Interdisciplinar (AV3) desenvolvido para as disciplinas de **Desenvolvimento Web para IA** e **Banco de Dados**, do Curso Superior de Tecnologia em Inteligência Artificial (2º Período) da Faculdade Estadual Piauí - Instituto de Tecnologia (PIT).

---

## Descrição Geral do Projeto

O Forno & Massa é uma plataforma web completa voltada para a apresentação e comercialização de pizzas artesanais de longa fermentação. O sistema permite consultar o cardápio dinâmico carregado do banco de dados, realizar, consultar, confirmar e cancelar reservas de mesa com persistência real em PostgreSQL e tirar dúvidas em tempo real com uma assistente virtual integrada à API do Google Gemini.

### Público-Alvo
Amantes da gastronomia artesanal, famílias, casais e grupos de amigos que buscam praticidade para consultar opções do cardápio, verificar horários de atendimento, reservar mesas para consumo presencial ou iniciar pedidos via delivery.

---

## Integrantes do Grupo

- **Wallysson Uriel Silva Torres** - GitHub: [@wallyss-dev](https://github.com/wallyss-dev)
- **Arthur dos Santos Alcântara** - GitHub: [@arthuralcantarax-netizen](https://github.com/arthuralcantarax-netizen)
- **João Gabriel Oliveira** - GitHub: [@JoaoGabriel-o](https://github.com/JoaoGabriel-o)

---

## Tecnologias Utilizadas

- **Front-end:** HTML5, CSS3 (variáveis `:root`, CSS Grid, Flexbox, `@media queries`) e JavaScript Vanilla ES6+ (`fetch`, `async/await`).
- **Back-end:** Node.js (v22+) e Express (`express`), com variáveis de ambiente gerenciadas via `dotenv`.
- **Banco de Dados:** PostgreSQL hospedado no Neon.tech, integrado via driver oficial `pg` com queries parametrizadas e transações (`pool.connect`, `BEGIN`/`COMMIT`/`ROLLBACK`).
- **Inteligência Artificial:** Google GenAI SDK (`@google/genai`) com modelo `gemini-3.5-flash-lite` (fallback automático para `gemini-3.1-flash-lite` em caso de indisponibilidade temporária).

---

## Principais Funcionalidades

1. **Recepção Personalizada:** Captura o nome do visitante e personaliza a saudação no banner inicial.
2. **Navegação Responsiva:** Menu lateral fixo no desktop que se adapta ao topo em celulares, com 6 seções navegáveis.
3. **Cardápio Dinâmico (`GET /api/produtos`):** Exibe as pizzas com `disponibilidade = true` lidas diretamente do PostgreSQL e sincroniza o seletor do formulário.
4. **Reserva Completa em Transação (`POST /api/reservas`):** Valida os dados no servidor, cadastra ou reutiliza o cliente (respeitando `UNIQUE` no e-mail), cria o pedido e vincula pizza e quantidade na tabela associativa `item_pedido`.
5. **Consulta de Reservas e Resumo (`GET /api/reservas`, `GET /api/reservas/:email`, `GET /api/reservas/resumo`):** Carrega automaticamente os pedidos persistidos (JOIN nas 4 tabelas) e o total por status (`GROUP BY`).
6. **Atualização e Exclusão Controlada (`PATCH /api/reservas/:id/status` e `DELETE /api/reservas/:id`):** Permite confirmar status ou cancelar o pedido removendo primeiro `item_pedido` e depois `pedido`, preservando o cadastro em `cliente`.
7. **Assistente Virtual Luiza (`POST /api/chat`):** Chatbot com persona própria, memória de sessão e proteção contra fuga de contexto.

---

## Integração com Inteligência Artificial

- **Persona:** Luiza, atendente virtual da Forno & Massa, tom simpático, acolhedor e objetivo (até 4 frases).
- **Contexto:** Definido em `persona.js` (`PERSONA`, `CONHECIMENTO`, `REGRAS`) e injetado via `systemInstruction` no servidor (`server.js`), sem nunca expor `GEMINI_API_KEY` ao navegador.
- **Mecanismos Anti-Fuga:** Regras explícitas proibindo invenção de preços/promoções, bloqueando assuntos fora da pizzaria e ignorando tentativas de alteração de instruções (*prompt injection*), além de histórico por `sessionId` em `Map`.

---

## Estrutura de Pastas e Arquivos

```text
devweb-ia-pizzaria/
├── database/                                  # Artefatos do Banco de Dados
│   ├── schema.sql                             # Script único e reexecutável (DDL + índices + carga fictícia)
│   ├── consultas_e_explain.sql                # Consultas JOIN/GROUP BY e testes EXPLAIN antes/depois
│   └── der_forno_massa.png                    # Diagrama Entidade-Relacionamento (DER)
├── Docs/
│   └── Evidências/                            # Capturas de tela e registros de validação do sistema
│       ├── Consultas obrigatórias/            # Prints das consultas JOIN e GROUP BY no Neon
│       ├── DB e WEB/                          # Prints de conexão e compatibilidade do front-end
│       ├── DER/                               # Cópia da imagem do DER para o relatório
│       ├── índices/                           # Prints dos planos EXPLAIN antes e depois do índice
│       ├── Provar Persistência Real, Atualização (PATCH) e Exclusão Controlada (DELETE)/
│       ├── Teste segurança do Git e commits dos 3 integrantes/
│       ├── Testes de validação e segurança/   # Prints e log dos testes HTTP (400/404)
│       └── Vídeo testando chatbot/            # Gravação da Assistente Luiza em funcionamento
├── public/                                    # Front-end servido pelo Express
│   ├── index.html                             # Estrutura semântica e seções
│   ├── style.css                              # Identidade visual, Grid/Flex e responsividade
│   ├── script.js                              # Interações DOM e consumo das rotas da API
│   ├── logo.svg                               # Logomarca da pizzaria
│   └── Pizza.webp                             # Imagem de fundo da seção Hero
├── .env.example                               # Modelo de variáveis de ambiente (sem segredos)
├── .gitignore                                 # Ignora node_modules/, .env e pedidos.json
├── package.json                               # Dependências, script "start" e requisito Node >= 22
├── persona.js                                 # Persona, base de conhecimento e regras da IA
├── server.js                                  # Servidor Express, rotas PostgreSQL e Gemini
└── README.MD                                  # Documentação do projeto
```

- **DER:** `database/der_forno_massa.png`
- **Script SQL (esquema + dados de demonstração fictícios):** `database/schema.sql`
- **Consultas e EXPLAIN:** `database/consultas_e_explain.sql`
- **Deploy:** Execução local.

---

## Instruções de Instalação e Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/) v22 LTS ou superior (exigido pelo `@google/genai`).
- Banco PostgreSQL (recomendado [Neon.tech](https://neon.tech/)).
- Chave de API gratuita do [Google AI Studio](https://aistudio.google.com/).

### Passo 1: Clonar o repositório
```bash
git clone https://github.com/wallyss-dev/devweb-ia-pizzaria.git
cd devweb-ia-pizzaria
```

### Passo 2: Instalar as dependências
```bash
npm install
```

### Passo 3: Configurar as variáveis de ambiente
Copie `.env.example` para `.env` na raiz do projeto e preencha suas credenciais reais:
```env
GEMINI_API_KEY=COLE_SUA_CHAVE_DO_GOOGLE_AI_STUDIO_AQUI
DATABASE_URL=COLE_SUA_STRING_DE_CONEXAO_DO_NEON_AQUI
```

### Passo 4: Criar o esquema e carregar os dados fictícios
Execute o arquivo `database/schema.sql` no SQL Editor do Neon.tech (ou `psql`/DBeaver). O script é reexecutável e recria as 4 tabelas, os índices e os dados fictícios de demonstração.

### Passo 5: Iniciar o servidor e acessar
```bash
npm start
```
Abra o navegador e acesse: **http://localhost:3000**