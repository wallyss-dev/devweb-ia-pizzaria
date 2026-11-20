
-- CONSULTAS OBRIGATORIAS E ANALISE DE INDICE (EXPLAIN)

-- CONSULTA 1 (JOIN nas 4 tabelas - usada em GET /api/reservas)
SELECT
    p.id AS numero_pedido,
    c.nome AS cliente,
    c.telefone,
    pr.nome AS pizza,
    ip.quantidade,
    (pr.preco * ip.quantidade) AS total,
    p.status,
    p.data_pedido
FROM pedido p
JOIN cliente c ON p.cliente_id = c.id
JOIN item_pedido ip ON p.id = ip.pedido_id
JOIN produto pr ON ip.produto_id = pr.id
ORDER BY p.data_pedido DESC;

-- CONSULTA 2 (Agregacao - usada em GET /api/reservas/resumo)
SELECT status, COUNT(id) AS total_pedidos
FROM pedido
GROUP BY status
ORDER BY total_pedidos DESC;

-- INDICE idx_pedido_cliente_id (coluna de FK usada em JOIN e filtro por cliente)


--  ANTES (sem o indice)
DROP INDEX IF EXISTS idx_pedido_cliente_id;
EXPLAIN SELECT p.id, p.status, p.data_pedido FROM pedido p WHERE p.cliente_id = 1;

-- cria o indice
CREATE INDEX idx_pedido_cliente_id ON pedido (cliente_id);

--  DEPOIS (Com indice)
EXPLAIN SELECT p.id, p.status, p.data_pedido FROM pedido p WHERE p.cliente_id = 1;

-- DEPOIS so para demonstrar que o indice é utilizavel
SET enable_seqscan = off;
EXPLAIN SELECT p.id, p.status, p.data_pedido FROM pedido p WHERE p.cliente_id = 1;
RESET enable_seqscan;