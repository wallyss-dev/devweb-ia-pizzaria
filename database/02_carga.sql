INSERT INTO produto (nome, preco, disponibilidade) VALUES
('Margherita', 42.00, true),
('Calabresa', 46.00, true),
('Quatro Queijos', 52.00, true),
('Portuguesa', 48.00, true),
('Frango com Catupiry', 50.00, true),
('Pepperoni', 54.00, true);

INSERT INTO cliente (nome, email, telefone) VALUES
('João Cliente', 'joao@teste.com', '86999999999');

INSERT INTO pedido (cliente_id, status) VALUES (1, 'Confirmado');

-- Colocando 2 pizzas no pedido do João
INSERT INTO item_pedido (pedido_id, produto_id, quantidade) VALUES
(1, 2, 1), -- 1 Calabresa
(1, 6, 2); -- 2 Pepperonis