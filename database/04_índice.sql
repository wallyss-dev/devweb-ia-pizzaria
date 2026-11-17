-- Antes do índice
EXPLAIN SELECT * FROM produto WHERE disponibilidade = true;

-- B) Crie o índice:
CREATE INDEX idx_produto_disponibilidade ON produto(disponibilidade);

-- Explain com índice:
EXPLAIN SELECT * FROM produto WHERE disponibilidade = true;