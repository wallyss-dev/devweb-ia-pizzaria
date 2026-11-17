-- CONSULTA 1 (Uso de JOIN): 
-- Pergunta de negócio: Quais são os clientes e os status dos seus respectivos pedidos?
-- Justificativa: Une as tabelas cliente e pedido para o restaurante saber quem pediu o quê.
SELECT 
    c.nome AS cliente, 
    c.telefone, 
    p.id AS numero_pedido, 
    p.data_pedido, 
    p.status
FROM cliente c
JOIN pedido p ON c.id = p.cliente_id
ORDER BY p.data_pedido DESC;

-- CONSULTA 2 (Uso de Agregação e Filtro): 
-- Pergunta de negócio: Quantos pedidos existem em cada status no sistema?
-- Justificativa: Ajuda a gerência a saber quantos pedidos estão pendentes, confirmados ou cancelados.
SELECT 
    status, 
    COUNT(id) AS total_pedidos
FROM pedido
GROUP BY status;