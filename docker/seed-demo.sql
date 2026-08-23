-- Solo para el PostgreSQL de Docker Compose.
-- No ejecutar contra la base local del desarrollador.
-- Idempotente: no pisa usuarios existentes.

INSERT INTO roles (name)
SELECT 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

INSERT INTO roles (name)
SELECT 'Vendedor'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Vendedor');

INSERT INTO users (username, password, nombre, apellido, email)
SELECT 'admin',
       '$2a$10$1C4sabESzE8oGn4lMMPvDep/66/0Bza4XWCdSxowTrnfqwoJ7rxVu',
       'Admin',
       'Sistema',
       'admin@farmacia.local'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password, nombre, apellido, email)
SELECT 'vendedor',
       '$2a$10$jhrOBTa9IdAfPEFMVKN7yOXrFaOOiWJvHBYvuN0barlgLy6cMiyz.',
       'Vendedor',
       'Mostrador',
       'vendedor@farmacia.local'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'vendedor');

INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.username = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM users_roles ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'Vendedor'
WHERE u.username = 'vendedor'
  AND NOT EXISTS (
      SELECT 1 FROM users_roles ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );
