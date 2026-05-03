
CREATE TABLE t_p57875747_custom_furniture_pro.projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  style VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  year VARCHAR(4) NOT NULL,
  img_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p57875747_custom_furniture_pro.projects (title, style, type, year, img_url, sort_order) VALUES
('Гостиная «Архитектор»', 'минимализм', 'гостиная', '2024', 'https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/cbf47af7-4416-43fd-b40e-9ff61968040c.jpg', 1),
('Кухня «Noir»', 'лофт', 'кухня', '2024', 'https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/4888529c-52ca-4d6f-84c6-962501d3f2c1.jpg', 2),
('Кабинет «Атлас»', 'скандинавский', 'кабинет', '2023', 'https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/9d095bb8-def4-4fbd-b6a4-cbe36f9fef0a.jpg', 3),
('Спальня «Изумруд»', 'арт-деко', 'спальня', '2024', 'https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/133153b8-ed24-4243-9589-e9b60defdc85.jpg', 4),
('Столовая «Бруклин»', 'лофт', 'столовая', '2023', 'https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/bcb31839-9761-43ed-815e-66e4fd7253a2.jpg', 5),
('Гардероб «Шампань»', 'арт-деко', 'гардероб', '2024', 'https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/80731633-c04b-4716-82a4-eacb66bd18cf.jpg', 6);

CREATE TABLE t_p57875747_custom_furniture_pro.admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p57875747_custom_furniture_pro.admin_users (email, password_hash) VALUES
('4394339@mail.ru', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGX8eMp6.w7cSe1RjXLKvfZE9Vy');
