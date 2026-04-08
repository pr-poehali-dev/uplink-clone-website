
CREATE TABLE cms_services (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  icon VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  accent VARCHAR(100) NOT NULL DEFAULT 'from-cyan-400 to-blue-500',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cms_service_items (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES cms_services(id),
  sort_order INTEGER DEFAULT 0,
  item_text VARCHAR(500) NOT NULL
);

CREATE TABLE cms_plans (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  name VARCHAR(255) NOT NULL,
  price VARCHAR(255) NOT NULL,
  badge VARCHAR(100),
  description TEXT NOT NULL,
  color VARCHAR(100) NOT NULL DEFAULT 'from-gray-600 to-gray-700',
  border_class VARCHAR(100) NOT NULL DEFAULT 'border-gray-700/50',
  btn_class VARCHAR(50) NOT NULL DEFAULT 'btn-outline-neon',
  is_highlighted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cms_plan_features (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES cms_plans(id),
  sort_order INTEGER DEFAULT 0,
  feature_text VARCHAR(500) NOT NULL
);

CREATE TABLE cms_projects (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  client VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  result VARCHAR(255),
  accent VARCHAR(100) NOT NULL DEFAULT 'from-cyan-400 to-blue-500',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cms_project_metrics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES cms_projects(id),
  sort_order INTEGER DEFAULT 0,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(100) NOT NULL
);

CREATE TABLE cms_team (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  experience VARCHAR(100),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cms_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
