-- FORNO & MASSA - (DDL + INDICES + CARGA FICTICIA)


-- Para remover tabelas na ordem segura para permitir reexecucao limpa do zero caso preciso
DROP TABLE IF EXISTS item_pedido, pedido, produto, cliente CASCADE;

-- 1) CRIACAO DAS TABELAS (DDL)
CREATE TABLE cliente (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco NUMERIC(10,2) NOT NULL CHECK (preco > 0),
    disponibilidade BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE pedido (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'Pendente' NOT NULL
        CHECK (status IN ('Pendente', 'Confirmado', 'Cancelado')),
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES cliente (id)
);

CREATE TABLE item_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id) REFERENCES pedido (id),
    CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produto (id)
);

-- 2) INDICES ADICIONAIS JUSTIFICADOS PELAS CONSULTAS FREQUENTES DO SISTEMA
CREATE INDEX idx_pedido_cliente_id ON pedido (cliente_id);
CREATE INDEX idx_item_pedido_pedido_id ON item_pedido (pedido_id);
CREATE INDEX idx_produto_disponibilidade ON produto (disponibilidade);

-- 3) CARGA INICIAL COM DADOS FICTICIOS (DML)
INSERT INTO produto (nome, preco, disponibilidade) VALUES
('Margherita', 42.00, true),
('Calabresa', 46.00, true),
('Quatro Queijos', 52.00, true),
('Portuguesa', 48.00, true),
('Frango com Catupiry', 50.00, true),
('Pepperoni', 54.00, true);

INSERT INTO cliente (nome, email, telefone) VALUES
('Joao Cliente', 'joao@teste.com', '86999999999'),
('Maria Exemplo', 'maria@teste.com', '86988888888');

INSERT INTO pedido (cliente_id, status) VALUES
(1, 'Confirmado'),
(2, 'Pendente');

INSERT INTO item_pedido (pedido_id, produto_id, quantidade) VALUES
(1, 2, 1), -- Pedido 1: 1 Calabresa
(1, 6, 2), -- Pedido 1: 2 Pepperonis
(2, 1, 1); -- Pedido 2: 1 Margherita