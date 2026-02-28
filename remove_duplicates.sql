DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (email, first_name, last_name, phone) VALUES
    ('john@example.com', 'John', 'Doe', '555-0101'),
    ('john@example.com', 'John', 'Doe', '555-0101'),
    ('jane@example.com', 'Jane', 'Smith', '555-0102'),
    ('jane@example.com', 'Jane', 'Smith', '555-0103'),
    ('bob@example.com', 'Bob', 'Carson', '555-0104'),
    ('bob@example.com', 'Robert', 'Robert', '555-0104'),
    ('alice@example.com', 'Alice', 'Brown', '555-0105'),
    ('alice@example.com', 'Alice', 'Brown', '555-0105'),
    ('alice@example.com', 'Alice', 'Brown', '555-0105');

SELECT
    'МЕТОД 1: ДО' as stage,
    email,
    COUNT(*) as count,
    GROUP_CONCAT(id) as ids
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;

DELETE FROM customers
WHERE id NOT IN (
    SELECT MIN(id)
    FROM customers
    GROUP BY email
);

SELECT 'МЕТОД 1: ПОСЛЕ' as stage, * FROM customers ORDER BY id;

INSERT INTO customers (email, first_name, last_name, phone) VALUES
    ('john@example.com', 'John', 'Doe', '555-0101'),
    ('john@example.com', 'John', 'Doe', '555-0101'),
    ('jane@example.com', 'Jane', 'Smith', '555-0103'),
    ('alice@example.com', 'Alice', 'Brown', '555-0105');

SELECT
    'МЕТОД 2: ДО' as stage,
    email,
    COUNT(*) as count,
    GROUP_CONCAT(id) as ids
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;

DELETE FROM customers
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) as rn
        FROM customers
    )
    WHERE rn > 1
);

SELECT 'МЕТОД 2: ПОСЛЕ' as stage, * FROM customers ORDER BY id;

INSERT INTO customers (email, first_name, last_name, phone) VALUES
    ('john@example.com', 'John', 'Doe', '555-0101'),
    ('jane@example.com', 'Jane', 'Smith', '555-0102'),
    ('jane@example.com', 'Jane', 'Smith', '555-0103'),
    ('alice@example.com', 'Alice', 'Brown', '555-0105'),
    ('alice@example.com', 'Alice', 'Brown', '555-0105');

SELECT
    'МЕТОД 3: ДО' as stage,
    email,
    COUNT(*) as count,
    GROUP_CONCAT(id) as ids
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;

WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) as rn
    FROM customers
)
DELETE FROM customers
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

SELECT 'МЕТОД 3: ПОСЛЕ' as stage, * FROM customers ORDER BY id;