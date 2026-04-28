-- Заполняем расширенный контент страниц услуг
UPDATE cms_services SET 
  short_desc = 'Полное обслуживание IT-инфраструктуры на аутсорсе. Дешевле штатного сисадмина до 40%.',
  hero_title = 'IT-аутсорсинг для бизнеса в Саратове',
  hero_subtitle = 'Комплексное обслуживание компьютеров, серверов и сети. Реагирование от 15 минут. Фиксированная цена без скрытых платежей.',
  full_description = 'IT-аутсорсинг — это передача обслуживания компьютерной техники и инфраструктуры профессионалам ИТК Аплинк-IT. Вы получаете команду сертифицированных специалистов с опытом 5–17 лет за стоимость одного штатного сотрудника, и при этом — экономите до 40% бюджета. Мы берём на себя всю техническую часть: от настройки рабочих мест до администрирования серверов и кибербезопасности. Закреплённый за вашей компанией персональный менеджер знает инфраструктуру и историю обращений, поэтому проблемы решаются быстро.',
  price_from = 'от 7 000 ₽/мес',
  for_whom = 'Малый и средний бизнес: офисы, торговля, производство, банковский и финансовый сектор. Компании от 5 до 50+ рабочих мест без штатного IT-отдела.',
  seo_title = 'IT-аутсорсинг в Саратове от 7 000 ₽/мес — ИТК Аплинк-IT',
  seo_description = 'IT-аутсорсинг и техподдержка для бизнеса в Саратове. Реагирование от 15 минут, дешевле штатного сисадмина до 40%. Бесплатный IT-аудит.'
WHERE slug = 'it-outsourcing';

UPDATE cms_services SET 
  short_desc = 'Настройка, мониторинг и сопровождение серверов Windows Server и Linux 24/7.',
  hero_title = 'Администрирование серверов в Саратове',
  hero_subtitle = 'Стабильная работа серверной инфраструктуры круглосуточно. Резервное копирование, мониторинг, оперативное устранение сбоев.',
  full_description = 'Сервер — сердце IT-инфраструктуры компании. Мы обеспечиваем непрерывную работу серверов Windows Server и Linux: настраиваем с нуля, проводим мониторинг производительности, регулярные обновления и патчинг. Настраиваем системы резервного копирования и контролируем целостность бэкапов. При возникновении инцидентов наш дежурный инженер реагирует круглосуточно. Главный инженер сетей нашей команды имеет 17 лет опыта работы с серверной инфраструктурой.',
  price_from = 'от 12 000 ₽/мес',
  for_whom = 'Компании с собственной серверной, использующие 1С, файловые серверы, корпоративную почту, базы данных, виртуализацию или сложные бизнес-приложения.',
  seo_title = 'Администрирование серверов в Саратове — ИТК Аплинк-IT',
  seo_description = 'Настройка и сопровождение серверов Windows/Linux. Мониторинг 24/7, резервные копии, оперативное устранение сбоев. От 12 000 ₽/мес.'
WHERE slug = 'server-administration';

UPDATE cms_services SET 
  short_desc = 'Проектирование, настройка и поддержка корпоративной сетевой инфраструктуры.',
  hero_title = 'Поддержка IT-инфраструктуры в Саратове',
  hero_subtitle = 'От проектирования до круглосуточного сопровождения корпоративных сетей. Mikrotik, Cisco, D-Link.',
  full_description = 'Создаём и сопровождаем стабильную, безопасную и масштабируемую IT-инфраструктуру под задачи бизнеса. Проектируем сети с нуля, настраиваем оборудование Mikrotik, Cisco, D-Link, обеспечиваем сегментацию сети, VLAN, VPN-подключения для удалённых сотрудников и филиалов. Внедряем решения по информационной безопасности, мониторим состояние оборудования и оптимизируем сетевые процессы для увеличения скорости работы.',
  price_from = 'индивидуально',
  for_whom = 'Компании с распределённой сетью, несколькими офисами, удалёнными сотрудниками или повышенными требованиями к безопасности данных.',
  seo_title = 'Поддержка IT-инфраструктуры в Саратове — ИТК Аплинк-IT',
  seo_description = 'Проектирование и сопровождение корпоративных сетей. Настройка Mikrotik, Cisco, D-Link. Информационная безопасность и мониторинг.'
WHERE slug = 'it-infrastructure';

UPDATE cms_services SET 
  short_desc = 'Монтаж IP и аналоговых камер под ключ. Удалённый доступ, архив, гарантия.',
  hero_title = 'Видеонаблюдение под ключ в Саратове',
  hero_subtitle = 'Защитите офис, склад или производство. Полный цикл: проектирование, монтаж, настройка удалённого просмотра.',
  full_description = 'Реализуем системы видеонаблюдения любого масштаба — от 2 до 100+ камер. Подбираем оборудование под задачи: уличные IP-камеры с защитой от вандалов, скрытые камеры для офиса, тепловизоры, поворотные PTZ. Настраиваем хранение архива на срок до 90 дней, удалённый просмотр со смартфона и интеграцию с системами контроля доступа. Реальный кейс: для Банк ВТБ установили 30 камер за 3 дня монтажных работ. На все работы — официальная гарантия.',
  price_from = 'от 35 000 ₽',
  for_whom = 'Магазины, склады, офисы, производство, банки, заправки, логистические центры — везде, где нужна охрана и контроль за процессами.',
  seo_title = 'Видеонаблюдение под ключ в Саратове — ИТК Аплинк-IT',
  seo_description = 'Монтаж IP и аналоговых камер видеонаблюдения. Удалённый доступ, архив, гарантия. Опыт от Банк ВТБ до малого бизнеса.'
WHERE slug = 'video-surveillance';

UPDATE cms_services SET 
  short_desc = 'Прокладка кабеля, установка коммутаторов, тестирование и сертификация ЛВС/СКС.',
  hero_title = 'Монтаж ЛВС и СКС в Саратове',
  hero_subtitle = 'Профессиональный монтаж локальных и структурированных кабельных сетей под задачи вашего бизнеса.',
  full_description = 'Проектируем и монтируем локальные сети (ЛВС) и структурированные кабельные системы (СКС) любой сложности. Подбираем категорию кабеля (Cat5e, Cat6, Cat6a, оптоволокно), монтируем кабельные трассы, устанавливаем коммутационные шкафы, патч-панели и розетки. Каждую линию тестируем сертифицированным оборудованием Fluke и оформляем протокол. Реальный кейс: для ООО ЛукБелОйл смонтировали сеть на 288 портов на 3 этажах с 6 коммутаторами.',
  price_from = 'от 600 ₽/порт',
  for_whom = 'Новые офисы, ремонт существующих помещений, расширение производства, переезд компании, открытие филиалов.',
  seo_title = 'Монтаж ЛВС и СКС в Саратове — ИТК Аплинк-IT',
  seo_description = 'Прокладка локальных сетей и структурированных кабельных систем. Тестирование Fluke, сертификация, гарантия.'
WHERE slug = 'lan-installation';

UPDATE cms_services SET 
  short_desc = 'Настройка IP-АТС и ВАТС, интеграция с CRM, корпоративная связь без затрат.',
  hero_title = 'IP-телефония для бизнеса в Саратове',
  hero_subtitle = 'Современная корпоративная связь с интеграцией в CRM. Запись разговоров, голосовое меню, многоканальные номера.',
  full_description = 'Внедряем IP-телефонию на базе FreePBX и облачных решений (виртуальные АТС). Настраиваем многоканальные номера, голосовое меню (IVR), запись разговоров, переадресацию и сценарии маршрутизации звонков. Интегрируем с популярными CRM (amoCRM, Битрикс24, RetailCRM) — менеджеры видят карточку клиента до ответа. Обеспечиваем безопасность: защиту от взлома SIP, шифрование, контроль доступа.',
  price_from = 'от 8 000 ₽ (внедрение)',
  for_whom = 'Отделы продаж, колл-центры, сервисные службы, компании с несколькими офисами, бизнес с удалёнными менеджерами.',
  seo_title = 'IP-телефония для бизнеса в Саратове — ИТК Аплинк-IT',
  seo_description = 'Установка и настройка IP-АТС, FreePBX, ВАТС. Интеграция с CRM, запись разговоров, голосовое меню. Корпоративная связь под ключ.'
WHERE slug = 'ip-telephony';

-- Преимущества для каждой услуги
INSERT INTO cms_service_benefits (service_id, sort_order, icon, title, description) 
SELECT id, 1, 'Zap', 'Реагирование от 15 минут', 'Удалённое подключение за 15 минут, выезд за 30 минут по Саратову' FROM cms_services WHERE slug = 'it-outsourcing'
UNION ALL SELECT id, 2, 'Wallet', 'Экономия до 40%', 'Дешевле штатного IT-специалиста, фиксированная цена без скрытых платежей' FROM cms_services WHERE slug = 'it-outsourcing'
UNION ALL SELECT id, 3, 'Users', 'Команда экспертов', 'Сертифицированные инженеры с опытом от 5 до 17 лет' FROM cms_services WHERE slug = 'it-outsourcing'
UNION ALL SELECT id, 4, 'UserCheck', 'Персональный менеджер', 'Закреплённый специалист знает вашу инфраструктуру и историю' FROM cms_services WHERE slug = 'it-outsourcing'

UNION ALL SELECT id, 1, 'Shield', 'Безопасность данных', 'Резервное копирование и защита от потери критичной информации' FROM cms_services WHERE slug = 'server-administration'
UNION ALL SELECT id, 2, 'Activity', 'Мониторинг 24/7', 'Проактивное наблюдение — устраняем проблемы до их появления' FROM cms_services WHERE slug = 'server-administration'
UNION ALL SELECT id, 3, 'Clock', 'Быстрая реакция', 'Дежурный инженер на связи круглосуточно, время реакции до 1 часа' FROM cms_services WHERE slug = 'server-administration'
UNION ALL SELECT id, 4, 'Award', 'Опыт 17 лет', 'Главный инженер сетей с 17-летним стажем работы с серверами' FROM cms_services WHERE slug = 'server-administration'

UNION ALL SELECT id, 1, 'Network', 'Любая сложность', 'От малых офисов до распределённой сети с филиалами и VPN' FROM cms_services WHERE slug = 'it-infrastructure'
UNION ALL SELECT id, 2, 'Lock', 'Безопасность', 'Сегментация, VLAN, межсетевые экраны, защита периметра' FROM cms_services WHERE slug = 'it-infrastructure'
UNION ALL SELECT id, 3, 'Settings2', 'Все производители', 'Mikrotik, Cisco, D-Link, Ubiquiti, HP — настроим любое' FROM cms_services WHERE slug = 'it-infrastructure'
UNION ALL SELECT id, 4, 'TrendingUp', 'Масштабируемость', 'Закладываем запас под рост бизнеса в 2–3 раза' FROM cms_services WHERE slug = 'it-infrastructure'

UNION ALL SELECT id, 1, 'Eye', 'Полный обзор', 'Уличные, внутренние, поворотные PTZ, тепловизоры — под любую задачу' FROM cms_services WHERE slug = 'video-surveillance'
UNION ALL SELECT id, 2, 'Smartphone', 'Просмотр со смартфона', 'Удалённый доступ к камерам и архиву из любой точки мира' FROM cms_services WHERE slug = 'video-surveillance'
UNION ALL SELECT id, 3, 'Database', 'Архив до 90 дней', 'Настройка регистраторов и облачного хранения видео' FROM cms_services WHERE slug = 'video-surveillance'
UNION ALL SELECT id, 4, 'Award', 'Гарантия', 'Официальная гарантия на оборудование и монтажные работы' FROM cms_services WHERE slug = 'video-surveillance'

UNION ALL SELECT id, 1, 'Cable', 'Качественные материалы', 'Cat5e, Cat6, Cat6a, оптоволокно — кабель под задачу и бюджет' FROM cms_services WHERE slug = 'lan-installation'
UNION ALL SELECT id, 2, 'CheckCircle', 'Сертификация Fluke', 'Тестирование каждой линии профессиональным оборудованием' FROM cms_services WHERE slug = 'lan-installation'
UNION ALL SELECT id, 3, 'FileText', 'Полная документация', 'Схемы, протоколы тестирования, паспорт сети' FROM cms_services WHERE slug = 'lan-installation'
UNION ALL SELECT id, 4, 'Hammer', 'Опыт от 288 портов', 'Реализованные проекты от малого офиса до 3-этажного предприятия' FROM cms_services WHERE slug = 'lan-installation'

UNION ALL SELECT id, 1, 'Phone', 'Многоканальные номера', 'Один номер — много одновременных звонков, без потерь клиентов' FROM cms_services WHERE slug = 'ip-telephony'
UNION ALL SELECT id, 2, 'Database', 'Интеграция с CRM', 'amoCRM, Битрикс24, RetailCRM — карточка клиента до ответа' FROM cms_services WHERE slug = 'ip-telephony'
UNION ALL SELECT id, 3, 'Mic', 'Запись разговоров', 'Контроль качества работы менеджеров и обучение сотрудников' FROM cms_services WHERE slug = 'ip-telephony'
UNION ALL SELECT id, 4, 'Shield', 'Защищённая связь', 'Защита от взлома SIP, шифрование, контроль доступа' FROM cms_services WHERE slug = 'ip-telephony';

-- Этапы работы по услугам
INSERT INTO cms_service_steps (service_id, sort_order, step_title, step_description) 
SELECT id, 1, 'Бесплатный IT-аудит', 'Изучаем текущую инфраструктуру, оборудование, ПО и боли бизнеса' FROM cms_services WHERE slug = 'it-outsourcing'
UNION ALL SELECT id, 2, 'Подбор тарифа', 'Предлагаем оптимальный тариф под количество ПК и серверов' FROM cms_services WHERE slug = 'it-outsourcing'
UNION ALL SELECT id, 3, 'Подписание договора', 'Фиксируем стоимость, SLA, состав работ и время реагирования' FROM cms_services WHERE slug = 'it-outsourcing'
UNION ALL SELECT id, 4, 'Запуск обслуживания', 'Назначаем персонального менеджера, начинаем работу с первого дня' FROM cms_services WHERE slug = 'it-outsourcing'

UNION ALL SELECT id, 1, 'Аудит серверов', 'Анализ текущего состояния, нагрузки, безопасности и бэкапов' FROM cms_services WHERE slug = 'server-administration'
UNION ALL SELECT id, 2, 'План работ', 'Составляем roadmap по оптимизации и сопровождению' FROM cms_services WHERE slug = 'server-administration'
UNION ALL SELECT id, 3, 'Настройка мониторинга', 'Подключаем систему наблюдения и оповещений 24/7' FROM cms_services WHERE slug = 'server-administration'
UNION ALL SELECT id, 4, 'Сопровождение', 'Регулярное обслуживание, обновления, оперативное реагирование' FROM cms_services WHERE slug = 'server-administration'

UNION ALL SELECT id, 1, 'Обследование', 'Изучаем помещение, текущую сеть, требования бизнеса' FROM cms_services WHERE slug = 'it-infrastructure'
UNION ALL SELECT id, 2, 'Проектирование', 'Создаём схему сети с учётом масштабирования и безопасности' FROM cms_services WHERE slug = 'it-infrastructure'
UNION ALL SELECT id, 3, 'Внедрение', 'Закупка оборудования, настройка, тестирование, документация' FROM cms_services WHERE slug = 'it-infrastructure'
UNION ALL SELECT id, 4, 'Поддержка', 'Сопровождение, мониторинг, оптимизация и развитие' FROM cms_services WHERE slug = 'it-infrastructure'

UNION ALL SELECT id, 1, 'Выезд на объект', 'Бесплатное обследование, расчёт количества и типа камер' FROM cms_services WHERE slug = 'video-surveillance'
UNION ALL SELECT id, 2, 'Проект и смета', 'Согласовываем точки установки, оборудование, стоимость' FROM cms_services WHERE slug = 'video-surveillance'
UNION ALL SELECT id, 3, 'Монтаж', 'Установка камер, прокладка кабеля, настройка регистратора' FROM cms_services WHERE slug = 'video-surveillance'
UNION ALL SELECT id, 4, 'Сдача и обучение', 'Настройка удалённого доступа, обучение персонала, гарантия' FROM cms_services WHERE slug = 'video-surveillance'

UNION ALL SELECT id, 1, 'Замер и проект', 'Выезжаем на объект, делаем замеры, согласовываем схему' FROM cms_services WHERE slug = 'lan-installation'
UNION ALL SELECT id, 2, 'Закупка', 'Подбираем кабель и оборудование под задачу и бюджет' FROM cms_services WHERE slug = 'lan-installation'
UNION ALL SELECT id, 3, 'Монтаж', 'Прокладка трасс, установка розеток, шкафов, патч-панелей' FROM cms_services WHERE slug = 'lan-installation'
UNION ALL SELECT id, 4, 'Тестирование Fluke', 'Сертификация каждой линии, оформление протоколов' FROM cms_services WHERE slug = 'lan-installation'

UNION ALL SELECT id, 1, 'Анализ задач', 'Изучаем сценарии звонков, количество сотрудников, текущие номера' FROM cms_services WHERE slug = 'ip-telephony'
UNION ALL SELECT id, 2, 'Выбор решения', 'Подбираем IP-АТС или ВАТС под задачи и бюджет' FROM cms_services WHERE slug = 'ip-telephony'
UNION ALL SELECT id, 3, 'Настройка и интеграция', 'Подключаем АТС, IP-телефоны, интегрируем с CRM' FROM cms_services WHERE slug = 'ip-telephony'
UNION ALL SELECT id, 4, 'Обучение команды', 'Обучаем сотрудников, передаём документацию, поддерживаем' FROM cms_services WHERE slug = 'ip-telephony';

-- FAQ по услугам
INSERT INTO cms_service_faq (service_id, sort_order, question, answer) 
SELECT id, 1, 'Сколько стоит IT-аутсорсинг?', 'Стоимость зависит от количества ПК, серверов и требований к скорости реагирования. Базовый тариф — от 7 000 ₽/мес для офиса до 5 ПК. Точный расчёт можно получить через наш калькулятор или после бесплатного IT-аудита.' FROM cms_services WHERE slug = 'it-outsourcing'
UNION ALL SELECT id, 2, 'Есть ли договор и SLA?', 'Да, заключаем официальный договор с фиксированной стоимостью и прописанным SLA: время реагирования, состав работ, регламент по выездам. Никаких скрытых платежей.' FROM cms_services WHERE slug = 'it-outsourcing'
UNION ALL SELECT id, 3, 'Как быстро решаются проблемы?', 'Удалённое подключение — за 15 минут, выезд на объект — за 30 минут по Саратову. На тарифе Премиум — приоритетная горячая линия с реакцией до 1 часа.' FROM cms_services WHERE slug = 'it-outsourcing'

UNION ALL SELECT id, 1, 'Какие серверы вы поддерживаете?', 'Windows Server (2012–2022), Linux (Ubuntu, Debian, CentOS, RHEL), виртуализация (VMware, Hyper-V, Proxmox), 1С-серверы, файловые серверы, базы данных.' FROM cms_services WHERE slug = 'server-administration'
UNION ALL SELECT id, 2, 'Как настраивается резервное копирование?', 'Подбираем стратегию бэкапов под бизнес-задачи: ежедневные инкрементальные, еженедельные полные, хранение в нескольких локациях, регулярная проверка восстановления.' FROM cms_services WHERE slug = 'server-administration'

UNION ALL SELECT id, 1, 'Работаете ли с филиалами?', 'Да, проектируем распределённые сети с VPN-каналами между офисами. Обеспечиваем единую сеть для головного офиса и филиалов.' FROM cms_services WHERE slug = 'it-infrastructure'
UNION ALL SELECT id, 2, 'Можно ли перевести существующее оборудование?', 'Да, проводим аудит текущей инфраструктуры и предлагаем варианты: использовать имеющееся, заменить или модернизировать. Решение всегда за вами.' FROM cms_services WHERE slug = 'it-infrastructure'

UNION ALL SELECT id, 1, 'Сколько камер нужно для офиса?', 'Зависит от площади и задач. В среднем для офиса 100 м² — 4–6 камер, для магазина — 6–10. Точное количество определим на бесплатном выезде специалиста.' FROM cms_services WHERE slug = 'video-surveillance'
UNION ALL SELECT id, 2, 'Какой срок хранения архива?', 'Стандартно — 30 дней, можно увеличить до 90 дней или больше. Зависит от количества камер, разрешения и объёма накопителя.' FROM cms_services WHERE slug = 'video-surveillance'
UNION ALL SELECT id, 3, 'Можно смотреть камеры со смартфона?', 'Да, настраиваем мобильные приложения для удалённого просмотра в реальном времени и доступа к архиву из любой точки мира.' FROM cms_services WHERE slug = 'video-surveillance'

UNION ALL SELECT id, 1, 'Какая категория кабеля нужна?', 'Для офиса достаточно Cat5e (до 1 Гбит/с), для повышенных нагрузок — Cat6 или Cat6a (до 10 Гбит/с). Между этажами или зданиями — оптоволокно.' FROM cms_services WHERE slug = 'lan-installation'
UNION ALL SELECT id, 2, 'Делаете ли сертификацию?', 'Да, тестируем каждую линию профессиональным оборудованием Fluke и оформляем сертификат. Это гарантия качества монтажа.' FROM cms_services WHERE slug = 'lan-installation'

UNION ALL SELECT id, 1, 'С какими CRM работаете?', 'Интегрируем с amoCRM, Битрикс24, RetailCRM, Yclients и другими. Если CRM есть — настроим связку. Если нет — поможем выбрать.' FROM cms_services WHERE slug = 'ip-telephony'
UNION ALL SELECT id, 2, 'Сохранятся ли текущие номера?', 'Да, если оператор поддерживает портирование. Помогаем перевести номера к выбранному оператору IP-телефонии без потери для клиентов.' FROM cms_services WHERE slug = 'ip-telephony';
