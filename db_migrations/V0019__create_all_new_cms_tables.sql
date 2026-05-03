-- Прайс-лист
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.cms_pricing_items (
    id SERIAL PRIMARY KEY,
    category_slug VARCHAR(100) NOT NULL DEFAULT '',
    category_title VARCHAR(255) NOT NULL DEFAULT '',
    category_icon VARCHAR(50) NOT NULL DEFAULT 'Briefcase',
    name VARCHAR(255) NOT NULL DEFAULT '',
    price VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Заявки с сайта
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.cms_leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    service VARCHAR(255) NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    source VARCHAR(255) NOT NULL DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- WhyUs карточки
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.cms_whyus_cards (
    id SERIAL PRIMARY KEY,
    icon VARCHAR(50) NOT NULL DEFAULT 'Check',
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QuickOrder шаги
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.cms_quickorder_steps (
    id SERIAL PRIMARY KEY,
    icon VARCHAR(50) NOT NULL DEFAULT 'CheckCircle',
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Навигационные пункты меню
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.cms_nav_items (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL DEFAULT '',
    href VARCHAR(255) NOT NULL DEFAULT '',
    type VARCHAR(20) NOT NULL DEFAULT 'anchor',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Типы камер для калькулятора видеонаблюдения
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.cms_video_camera_types (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(50) NOT NULL DEFAULT 'Camera',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Оборудование для калькулятора видеонаблюдения
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.cms_video_equipment (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(50) NOT NULL DEFAULT 'Box',
    default_checked BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- SEO страниц
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.cms_pages (
    id SERIAL PRIMARY KEY,
    route VARCHAR(100) NOT NULL UNIQUE DEFAULT '/',
    title VARCHAR(255) NOT NULL DEFAULT '',
    seo_title VARCHAR(255) NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    og_title VARCHAR(255) NOT NULL DEFAULT '',
    og_description TEXT NOT NULL DEFAULT '',
    og_image_url TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP DEFAULT NOW()
);