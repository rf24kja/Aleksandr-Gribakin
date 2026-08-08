/**
 * The full working stack, as the owner listed it.
 *
 * Never fed into techFrequency(), which counts what the described work used.
 * The two are related but not the same claim, and the page now says how: this
 * file is the whole, and the technologies named in the cases are the part of it
 * with evidence behind them — "N of M", both numbers computed.
 *
 * That fraction only stays arithmetic while every technology a case names also
 * lives here. Twenty-one did not when this list arrived: the languages were
 * group headings rather than entries, and Linux, Git, Make, AWS and GCP were
 * the kind of thing nobody writes down. They are entries now, and a test fails
 * the moment a case names something this file has never heard of.
 *
 * Order is the owner's. Groups are rendered in it, and nothing here is sorted
 * by "importance" — that judgement is not the site's to make.
 */

export const STACK_GROUPS = [
  {
    id: 'go',
    title: { EN: 'Go', RU: 'Go' },
    lines: [
      { label: { EN: 'Language', RU: 'Язык' }, items: ['Go'] },
      { label: { EN: 'Frameworks and routing', RU: 'Фреймворки и роутинг' }, items: ['Gin', 'Echo', 'Chi', 'Fiber'] },
      { label: { EN: 'Databases', RU: 'Работа с БД' }, items: ['GORM', 'sqlx', 'pgx'] },
      { label: { EN: 'RPC and concurrency', RU: 'RPC и конкурентность' }, items: ['gRPC', 'Protocol Buffers', 'context', 'sync/atomic'] },
      { label: { EN: 'Task queues', RU: 'Очереди задач' }, items: ['Asynq (Redis)', 'River (PostgreSQL)'] },
      { label: { EN: 'Configuration', RU: 'Конфигурация' }, items: ['Viper', 'envconfig'] },
      { label: { EN: 'Testing', RU: 'Тестирование' }, items: ['testify', 'gomock', 'testcontainers-go'] },
      { label: { EN: 'Tooling', RU: 'Инструментарий' }, items: ['golangci-lint', 'air', 'buf'] },
    ],
  },
  {
    id: 'python',
    title: { EN: 'Python', RU: 'Python' },
    lines: [
      { label: { EN: 'Language', RU: 'Язык' }, items: ['Python'] },
      { label: { EN: 'Backend', RU: 'Бэкенд' }, items: ['FastAPI', 'Flask', 'Django', 'asyncio'] },
      { label: { EN: 'Analytics and data', RU: 'Аналитика и данные' }, items: ['Pandas', 'NumPy', 'SciPy', 'Polars', 'DuckDB'] },
      { label: { EN: 'Scraping and HTTP', RU: 'Парсинг и HTTP' }, items: ['httpx', 'aiohttp', 'BeautifulSoup', 'Scrapy', 'Playwright'] },
      { label: { EN: 'Validation and typing', RU: 'Валидация и типизация' }, items: ['Pydantic v2', 'msgspec'] },
      { label: { EN: 'Task queues', RU: 'Очереди задач' }, items: ['Celery', 'Dramatiq', 'ARQ'] },
      { label: { EN: 'Testing', RU: 'Тестирование' }, items: ['pytest', 'pytest-asyncio', 'hypothesis', 'coverage'] },
      { label: { EN: 'Tooling', RU: 'Инструментарий' }, items: ['uv', 'poetry', 'ruff', 'mypy'] },
    ],
  },
  {
    id: 'js',
    title: { EN: 'JavaScript and TypeScript', RU: 'JavaScript и TypeScript' },
    lines: [
      { label: { EN: 'Languages', RU: 'Языки' }, items: ['JavaScript', 'TypeScript'] },
      { label: { EN: 'Frameworks', RU: 'Фреймворки' }, items: ['React', 'Next.js', 'Vue.js', 'Node.js', 'Express', 'NestJS', 'Astro'] },
      { label: { EN: 'State and data', RU: 'Состояние и данные' }, items: ['Redux', 'Zustand', 'Pinia', 'TanStack Query', 'SWR'] },
      { label: { EN: 'Build', RU: 'Сборка' }, items: ['Vite', 'esbuild', 'SWC', 'Webpack', 'Babel'] },
      { label: { EN: 'Styling', RU: 'Стилизация' }, items: ['CSS', 'Tailwind CSS', 'PostCSS', 'Sass/SCSS', 'CSS Modules'] },
      { label: { EN: 'UI and animation', RU: 'UI и анимация' }, items: ['shadcn/ui', 'Radix UI', 'Headless UI', 'Framer Motion'] },
      { label: { EN: 'Forms and validation', RU: 'Формы и валидация' }, items: ['Zod', 'React Hook Form', 'Valibot'] },
      { label: { EN: 'API layer', RU: 'API-слой' }, items: ['OpenAPI/Swagger', 'tRPC', 'GraphQL', 'WebSocket', 'SSE'] },
      { label: { EN: 'Component docs', RU: 'Документация компонентов' }, items: ['Storybook'] },
    ],
  },
  {
    id: 'php',
    title: { EN: 'PHP', RU: 'PHP' },
    lines: [
      { label: { EN: 'Language', RU: 'Язык' }, items: ['PHP'] },
      { label: { EN: 'Frameworks', RU: 'Фреймворки' }, items: ['Laravel', 'Symfony'] },
      { label: { EN: 'CMS and e-commerce', RU: 'CMS и e-commerce' }, items: ['1С-Битрикс', 'WordPress', 'WooCommerce'] },
      { label: { EN: 'Tooling', RU: 'Инструментарий' }, items: ['Composer', 'PHPUnit', 'PHPStan', 'Psalm'] },
    ],
  },
  {
    id: 'mobile',
    title: { EN: 'Mobile and cross-platform', RU: 'Мобильная и кросс-платформенная' },
    lines: [
      { label: { EN: 'Cross-platform', RU: 'Кросс-платформа' }, items: ['Flutter (Dart)', 'React Native', 'Expo'] },
      { label: { EN: 'Native layers', RU: 'Нативные слои' }, items: ['Swift (iOS)', 'Kotlin (Android)', 'platform channels'] },
      { label: { EN: 'Sync without a server', RU: 'Синхронизация без сервера' }, items: ['CRDT (Yjs, Automerge)', 'local-first'] },
      { label: { EN: 'Client cryptography', RU: 'Криптография клиента' }, items: ['подпись сообщений', 'детерминированные идентификаторы', 'offline-first обмен'] },
    ],
  },
  {
    id: 'ai',
    title: { EN: 'AI and LLM engineering', RU: 'AI и LLM' },
    lines: [
      { label: { EN: 'Local inference', RU: 'Локальный инференс' }, items: ['LM Studio', 'Ollama', 'llama.cpp', 'vLLM'] },
      { label: { EN: 'Provider APIs', RU: 'Провайдеры API' }, items: ['OpenAI SDK', 'Anthropic SDK', 'Groq', 'litellm'] },
      { label: { EN: 'Formats and quantisation', RU: 'Форматы и квантизация' }, items: ['GGUF', 'Q4_K_M', 'MoE'] },
      { label: { EN: 'RAG and orchestration', RU: 'RAG и оркестрация' }, items: ['LangChain', 'LlamaIndex', 'Haystack'] },
      { label: { EN: 'Structured output and agents', RU: 'Структурированный вывод и агенты' }, items: ['instructor', 'Pydantic AI', 'DSPy'] },
      { label: { EN: 'Embeddings', RU: 'Эмбеддинги' }, items: ['sentence-transformers', 'FastEmbed'] },
      { label: { EN: 'Vector stores', RU: 'Векторные хранилища' }, items: ['Qdrant', 'Milvus', 'Pinecone', 'pgvector', 'Chroma', 'Weaviate'] },
      { label: { EN: 'Agent tooling protocol', RU: 'Протокол инструментов' }, items: ['MCP (Model Context Protocol)'] },
      { label: { EN: 'Evaluation and tracing', RU: 'Оценка и наблюдение' }, items: ['Ragas', 'промпт-регрессии', 'трассировка вызовов'] },
    ],
  },
  {
    id: 'seo',
    title: { EN: 'SEO and semantic markup', RU: 'SEO и семантическая разметка' },
    lines: [
      { label: { EN: 'Structured data', RU: 'Структурированные данные' }, items: ['Schema.org', 'JSON-LD', 'RealEstate', 'Product', 'Organization', 'Offer'] },
      { label: { EN: 'Social previews', RU: 'Соцпревью' }, items: ['Open Graph', 'Twitter Cards'] },
      { label: { EN: 'Indexing', RU: 'Индексация' }, items: ['XML-sitemap', 'robots.txt', 'canonical', 'hreflang'] },
      { label: { EN: 'AI visibility', RU: 'AI-видимость' }, items: ['llms.txt', 'семантическая иерархия под парсинг'] },
      { label: { EN: 'Core Web Vitals', RU: 'Core Web Vitals' }, items: ['Lighthouse', 'PageSpeed Insights', 'WebPageTest', 'web-vitals'] },
      { label: { EN: 'Internationalisation', RU: 'Интернационализация' }, items: ['next-intl', 'i18next', 'ICU MessageFormat'] },
    ],
  },
  {
    id: 'data',
    title: { EN: 'Storage, cache, search', RU: 'Хранение, кеш, поиск' },
    lines: [
      { label: { EN: 'Relational', RU: 'Реляционные' }, items: ['PostgreSQL', 'Patroni', 'PgBouncer', 'MySQL', 'MariaDB'] },
      { label: { EN: 'NoSQL and in-memory', RU: 'NoSQL и in-memory' }, items: ['Redis', 'MongoDB', 'Memcached'] },
      { label: { EN: 'BaaS and embedded', RU: 'BaaS и встраиваемые' }, items: ['Supabase', 'SQLite'] },
      { label: { EN: 'Time series and analytics', RU: 'Временные ряды и аналитика' }, items: ['ClickHouse', 'TimescaleDB', 'DuckDB'] },
      { label: { EN: 'Vector and graph', RU: 'Векторные и графовые' }, items: ['Qdrant', 'Milvus', 'Pinecone', 'pgvector', 'Neo4j'] },
      { label: { EN: 'Full-text search', RU: 'Полнотекстовый поиск' }, items: ['Meilisearch', 'Typesense', 'Elasticsearch', 'OpenSearch'] },
      { label: { EN: 'Migrations', RU: 'Миграции' }, items: ['golang-migrate', 'Alembic', 'Prisma Migrate'] },
    ],
  },
  {
    id: 'queues',
    title: { EN: 'Queues, streaming, durable workflows', RU: 'Очереди, стриминг, durable-воркфлоу' },
    lines: [
      { label: { EN: 'Brokers', RU: 'Брокеры' }, items: ['RabbitMQ', 'Kafka', 'NATS', 'NATS JetStream'] },
      { label: { EN: 'Lightweight queues', RU: 'Лёгкие очереди' }, items: ['Redis Streams', 'Asynq', 'ARQ', 'Celery', 'Dramatiq'] },
      { label: { EN: 'Durable orchestration', RU: 'Durable-оркестрация' }, items: ['Temporal'] },
      { label: { EN: 'Patterns', RU: 'Паттерны' }, items: ['outbox', 'dead-letter queue', 'at-least-once + идемпотентность'] },
    ],
  },
  {
    id: 'infra',
    title: { EN: 'Infrastructure, networks, DevOps, IaC', RU: 'Инфраструктура, сети, DevOps, IaC' },
    lines: [
      { label: { EN: 'Base', RU: 'База' }, items: ['Linux', 'Git', 'Make'] },
      { label: { EN: 'Containers', RU: 'Контейнеризация' }, items: ['Docker', 'Docker Compose'] },
      { label: { EN: 'Orchestration', RU: 'Оркестрация' }, items: ['k3s', 'Kubernetes', 'Helm', 'Kustomize', 'ArgoCD'] },
      { label: { EN: 'Web servers and proxies', RU: 'Веб-серверы и прокси' }, items: ['Nginx', 'Caddy', 'HAProxy', 'Traefik'] },
      { label: { EN: 'CI/CD', RU: 'CI/CD' }, items: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'semantic-release', 'Conventional Commits'] },
      { label: { EN: 'Infrastructure as Code', RU: 'Infrastructure as Code' }, items: ['Terraform', 'Pulumi', 'Ansible'] },
      { label: { EN: 'Secrets', RU: 'Секреты' }, items: ['HashiCorp Vault', 'SOPS', 'age'] },
      { label: { EN: 'Registries and updates', RU: 'Реестры и автообновление' }, items: ['Watchtower', 'GitHub Container Registry'] },
      { label: { EN: 'Process automation', RU: 'Автоматизация процессов' }, items: ['n8n'] },
      { label: { EN: 'Edge, CDN, hosting', RU: 'Edge, CDN, хостинг' }, items: ['AWS', 'GCP', 'Cloudflare (Workers, R2, Turnstile, Zero Trust)', 'Vercel', 'Fastly', 'CDN'] },
    ],
  },
  {
    id: 'observability',
    title: { EN: 'Observability and reliability', RU: 'Наблюдаемость и надёжность' },
    lines: [
      { label: { EN: 'Metrics', RU: 'Метрики' }, items: ['Prometheus', 'Alertmanager', 'Grafana'] },
      { label: { EN: 'Tracing and logs', RU: 'Трассировка и логи' }, items: ['OpenTelemetry', 'Loki', 'Tempo'] },
      { label: { EN: 'Application errors', RU: 'Ошибки приложения' }, items: ['Sentry'] },
      { label: { EN: 'Availability', RU: 'Доступность' }, items: ['Uptime Kuma', 'healthcheck-эндпоинты', 'SLO и алертинг'] },
    ],
  },
  {
    id: 'security',
    title: { EN: 'Security and audit', RU: 'Безопасность и аудит' },
    // Kept as the owner listed it, with one framing added: this is work done
    // under contract on systems the client owns. Without that sentence a list
    // of offensive tooling on a commercial portfolio reads as something else
    // entirely to the corporate buyer the rest of the site is written for.
    note: {
      EN: 'Authorised testing under contract, on systems the client owns.',
      RU: 'Работы по договору, на системах заказчика и с его разрешения.',
    },
    lines: [
      { label: { EN: 'Audit platform', RU: 'Платформа аудита' }, items: ['Faraday CE'] },
      { label: { EN: 'Discovery and scanning', RU: 'Разведка и сканирование' }, items: ['masscan', 'RustScan', 'nmap', 'naabu', 'httpx', 'nuclei'] },
      { label: { EN: 'Web testing', RU: 'Web-тестирование' }, items: ['Burp Suite', 'OWASP ZAP', 'ffuf', 'gobuster', 'sqlmap'] },
      { label: { EN: 'Post-exploitation and AD', RU: 'Пост-эксплуатация и AD' }, items: ['NetExec', 'Impacket', 'BloodHound', 'Responder', 'SharpDPAPI', 'DonPAPI'] },
      { label: { EN: 'Network analysis', RU: 'Сетевой анализ' }, items: ['Wireshark', 'tcpdump'] },
      { label: { EN: 'Storage access', RU: 'Доступ к хранилищам' }, items: ['SMB', 'NFS', 'SFTP', 'WebDAV'] },
      { label: { EN: 'Shift-left on own code', RU: 'Безопасность своего кода' }, items: ['Semgrep', 'Trivy', 'gitleaks', 'gosec', 'Bandit'] },
    ],
  },
  {
    id: 'trading',
    title: { EN: 'Data, analytics, algorithmic trading', RU: 'Данные, аналитика, алготрейдинг' },
    lines: [
      { label: { EN: 'Market processing', RU: 'Обработка рынка' }, items: ['Pandas', 'Polars', 'NumPy', 'SciPy'] },
      { label: { EN: 'Indicators', RU: 'Индикаторы' }, items: ['TA-Lib', 'pandas-ta'] },
      { label: { EN: 'Exchange connectors', RU: 'Коннекторы бирж' }, items: ['ccxt'] },
      { label: { EN: 'Strategy frameworks', RU: 'Фреймворки стратегий' }, items: ['freqtrade', 'jesse', 'кастомные бэктест-движки'] },
      { label: { EN: 'Quote storage', RU: 'Хранение котировок' }, items: ['ClickHouse', 'TimescaleDB', 'DuckDB'] },
      { label: { EN: 'Visualisation', RU: 'Визуализация' }, items: ['Grafana', 'Plotly', 'TradingView Lightweight Charts'] },
      { label: { EN: 'Pipeline orchestration', RU: 'Оркестрация пайплайнов' }, items: ['Prefect', 'Dagster', 'Airflow'] },
    ],
  },
  {
    id: 'testing',
    title: { EN: 'Testing and load', RU: 'Тестирование и нагрузка' },
    lines: [
      { label: { EN: 'Unit and integration', RU: 'Юнит и интеграция' }, items: ['Vitest', 'Jest', 'pytest', 'testify', 'PHPUnit'] },
      { label: { EN: 'End to end', RU: 'E2E и браузер' }, items: ['Playwright', 'Puppeteer', 'Cypress'] },
      { label: { EN: 'Dependency isolation', RU: 'Изоляция зависимостей' }, items: ['Testcontainers'] },
      { label: { EN: 'Load', RU: 'Нагрузочное' }, items: ['k6', 'Locust', 'Vegeta'] },
      { label: { EN: 'Contract testing', RU: 'Контрактное' }, items: ['schemathesis', 'Pact'] },
    ],
  },
  {
    id: 'auth',
    title: { EN: 'Authentication, payments, access', RU: 'Аутентификация, платежи, доступ' },
    lines: [
      { label: { EN: 'Tokens and protocols', RU: 'Токены и протоколы' }, items: ['JWT', 'OAuth2', 'OIDC'] },
      { label: { EN: 'Identity providers', RU: 'Identity-провайдеры' }, items: ['Keycloak', 'Authentik', 'Ory (Kratos, Hydra)', 'Supabase Auth'] },
      { label: { EN: 'Client authorisation', RU: 'Клиентская авторизация' }, items: ['Auth.js', 'Clerk'] },
      { label: { EN: 'Payments', RU: 'Платежи' }, items: ['Stripe', 'вебхуки платёжных провайдеров'] },
      { label: { EN: 'Anti-bot', RU: 'Антибот и защита форм' }, items: ['Cloudflare Turnstile', 'rate limiting'] },
    ],
  },
];

/**
 * The layers a visitor actually asks about — "do you do frontend, do you do
 * backend" — laid over a list that is not organised that way.
 *
 * The fifteen areas above are the owner's own arrangement: four of them are
 * languages (Go, Python, PHP, JavaScript) and the rest are domains. A
 * front-end/back-end question cuts across that grid rather than along it, so
 * the tag sits on the line, not on the area: inside "JavaScript and
 * TypeScript" the styling line is front-end and the API layer is both.
 *
 * A line may carry several layers, because some genuinely belong to several —
 * Node.js and React are one line in the owner's list, and splitting his list
 * to make a filter tidy would be the wrong way round. The consequence is that
 * the layers overlap and their sizes do not add up to 294, which is why the
 * chips are named and not counted: a number that cannot be added to its
 * neighbours has no business being displayed beside them.
 */
export const STACK_LAYERS = [
  { id: 'frontend', title: { EN: 'Frontend', RU: 'Фронтенд' } },
  { id: 'backend', title: { EN: 'Backend', RU: 'Бэкенд' } },
  { id: 'data', title: { EN: 'Data', RU: 'Данные' } },
  { id: 'infra', title: { EN: 'Infrastructure', RU: 'Инфраструктура' } },
  { id: 'ai', title: { EN: 'AI and LLM', RU: 'AI и LLM' } },
  { id: 'security', title: { EN: 'Security', RU: 'Безопасность' } },
  { id: 'testing', title: { EN: 'Testing', RU: 'Тестирование' } },
];

/**
 * Which layers each line belongs to, keyed `groupId/English label`.
 *
 * Kept beside the list rather than inside it so the owner's own arrangement
 * stays untouched, and keyed by label rather than by position so reordering a
 * group cannot silently re-tag it. A test asserts every line is present here:
 * add a line to the toolbox without saying where it belongs and the suite
 * fails rather than the filter quietly dropping it.
 */
const LINE_LAYERS = {
  'go/Language': ['backend'],
  'go/Frameworks and routing': ['backend'],
  'go/Databases': ['backend', 'data'],
  'go/RPC and concurrency': ['backend'],
  'go/Task queues': ['backend'],
  'go/Configuration': ['backend'],
  'go/Testing': ['testing'],
  'go/Tooling': ['backend'],

  'python/Language': ['backend'],
  'python/Backend': ['backend'],
  'python/Analytics and data': ['data'],
  'python/Scraping and HTTP': ['backend'],
  'python/Validation and typing': ['backend'],
  'python/Task queues': ['backend'],
  'python/Testing': ['testing'],
  'python/Tooling': ['backend'],

  // React and Node.js share a line in the owner's list, so this one is both.
  'js/Languages': ['frontend', 'backend'],
  'js/Frameworks': ['frontend', 'backend'],
  'js/State and data': ['frontend'],
  'js/Build': ['frontend'],
  'js/Styling': ['frontend'],
  'js/UI and animation': ['frontend'],
  'js/Forms and validation': ['frontend'],
  'js/API layer': ['frontend', 'backend'],
  'js/Component docs': ['frontend'],

  'php/Language': ['backend'],
  'php/Frameworks': ['backend'],
  'php/CMS and e-commerce': ['backend'],
  'php/Tooling': ['backend'],

  'mobile/Cross-platform': ['frontend'],
  'mobile/Native layers': ['frontend'],
  'mobile/Sync without a server': ['frontend', 'backend'],
  'mobile/Client cryptography': ['frontend', 'security'],

  'ai/Local inference': ['ai'],
  'ai/Provider APIs': ['ai'],
  'ai/Formats and quantisation': ['ai'],
  'ai/RAG and orchestration': ['ai'],
  'ai/Structured output and agents': ['ai'],
  'ai/Embeddings': ['ai'],
  'ai/Vector stores': ['ai', 'data'],
  'ai/Agent tooling protocol': ['ai'],
  'ai/Evaluation and tracing': ['ai', 'testing'],

  'seo/Structured data': ['frontend'],
  'seo/Social previews': ['frontend'],
  'seo/Indexing': ['frontend'],
  'seo/AI visibility': ['frontend', 'ai'],
  'seo/Core Web Vitals': ['frontend'],
  'seo/Internationalisation': ['frontend'],

  'data/Relational': ['data'],
  'data/NoSQL and in-memory': ['data'],
  'data/BaaS and embedded': ['data'],
  'data/Time series and analytics': ['data'],
  'data/Vector and graph': ['data', 'ai'],
  'data/Full-text search': ['data'],
  'data/Migrations': ['data', 'backend'],

  'queues/Brokers': ['backend'],
  'queues/Lightweight queues': ['backend'],
  'queues/Durable orchestration': ['backend'],
  'queues/Patterns': ['backend'],

  'infra/Base': ['infra'],
  'infra/Containers': ['infra'],
  'infra/Orchestration': ['infra'],
  'infra/Web servers and proxies': ['infra'],
  'infra/CI/CD': ['infra'],
  'infra/Infrastructure as Code': ['infra'],
  'infra/Secrets': ['infra', 'security'],
  'infra/Registries and updates': ['infra'],
  'infra/Process automation': ['infra'],
  'infra/Edge, CDN, hosting': ['infra'],

  'observability/Metrics': ['infra'],
  'observability/Tracing and logs': ['infra'],
  'observability/Application errors': ['infra'],
  'observability/Availability': ['infra'],

  'security/Audit platform': ['security'],
  'security/Discovery and scanning': ['security'],
  'security/Web testing': ['security'],
  'security/Post-exploitation and AD': ['security'],
  'security/Network analysis': ['security'],
  'security/Storage access': ['security'],
  'security/Shift-left on own code': ['security', 'testing'],

  'trading/Market processing': ['data'],
  'trading/Indicators': ['data'],
  'trading/Exchange connectors': ['data', 'backend'],
  'trading/Strategy frameworks': ['data'],
  'trading/Quote storage': ['data'],
  'trading/Visualisation': ['data', 'frontend'],
  'trading/Pipeline orchestration': ['data', 'infra'],

  'testing/Unit and integration': ['testing'],
  'testing/End to end': ['testing'],
  'testing/Dependency isolation': ['testing'],
  'testing/Load': ['testing', 'infra'],
  'testing/Contract testing': ['testing'],

  'auth/Tokens and protocols': ['backend', 'security'],
  'auth/Identity providers': ['backend', 'security'],
  'auth/Client authorisation': ['frontend', 'backend'],
  'auth/Payments': ['backend'],
  'auth/Anti-bot': ['backend', 'security'],
};

/** Layers of one line, by the key the map above is written in. */
export function layersOf(groupId, labelEN) {
  return LINE_LAYERS[`${groupId}/${labelEN}`] || [];
}

/** Lines this file carries that nobody has classified — empty is the invariant. */
export function unclassifiedLines() {
  const out = [];
  for (const g of STACK_GROUPS) {
    for (const l of g.lines) {
      if (!LINE_LAYERS[`${g.id}/${l.label.EN}`]) out.push(`${g.id}/${l.label.EN}`);
    }
  }
  return out;
}

/** Localised layers, dropping any that no line claims. */
export function stackLayers(lang = 'EN') {
  const key = lang === 'RU' ? 'RU' : 'EN';
  const used = new Set(Object.values(LINE_LAYERS).flat());
  return STACK_LAYERS.filter((l) => used.has(l.id))
    .map((l) => ({ id: l.id, title: l.title[key] || l.title.EN }));
}

/**
 * Localised view of one group, optionally narrowed to a layer.
 *
 * Narrowing drops lines rather than whole areas, and then drops the areas left
 * with nothing — so "Frontend" inside "JavaScript and TypeScript" shows the
 * styling and the components without the server frameworks beside them.
 */
export function stackGroups(lang = 'EN', layer = null) {
  const key = lang === 'RU' ? 'RU' : 'EN';
  return STACK_GROUPS.map((g) => ({
    id: g.id,
    title: g.title[key] || g.title.EN,
    note: g.note ? (g.note[key] || g.note.EN) : null,
    lines: g.lines
      .filter((l) => !layer || layersOf(g.id, l.label.EN).includes(layer))
      .map((l) => ({ label: l.label[key] || l.label.EN, items: l.items })),
  })).filter((g) => g.lines.length > 0);
}

/** Distinct tool count, computed rather than typed — as every figure here is. */
export function stackToolCount() {
  const seen = new Set();
  for (const g of STACK_GROUPS) for (const l of g.lines) for (const i of l.items) seen.add(i);
  return seen.size;
}

/**
 * Matches a technology named in the described work to a tool in this file.
 *
 * The two lists were written years apart by different hands, so they disagree
 * on spelling rather than on substance: the cases say NGINX where this file
 * says Nginx, Vault where it says HashiCorp Vault, OpenAPI where it says
 * OpenAPI/Swagger. Comparing the strings as-is would have reported those three
 * as "not in the toolbox" and made the "N of M" line on the page false, which
 * is the one thing the numbers here are not allowed to be.
 */
function variants(tool) {
  const base = tool.toLowerCase().replace(/\s*\(.*\)\s*/g, '').trim();
  const out = new Set([base]);
  for (const part of base.split('/')) out.add(part.trim());
  // "HashiCorp Vault" answers to "Vault"; "Tailwind CSS" must not answer to
  // "CSS", so only the last word of a two-word vendor-prefixed name counts.
  const words = base.split(/\s+/);
  if (words.length === 2 && /^(hashicorp|apache|microsoft|google|amazon)$/.test(words[0])) {
    out.add(words[1]);
  }
  return out;
}

/** The tools with work behind them on this site, matched against `labels`. */
export function backedTools(labels = []) {
  const wanted = new Set(labels.map((l) => l.toLowerCase().trim()));
  const backed = new Set();
  for (const g of STACK_GROUPS) {
    for (const l of g.lines) {
      for (const item of l.items) {
        for (const v of variants(item)) {
          if (wanted.has(v)) { backed.add(item); break; }
        }
      }
    }
  }
  return backed;
}

/** Work technologies this file does not carry — empty is the invariant. */
export function unmatchedWorkTech(labels = []) {
  const covered = new Set();
  for (const g of STACK_GROUPS) {
    for (const l of g.lines) for (const item of l.items) for (const v of variants(item)) covered.add(v);
  }
  return labels.filter((l) => !covered.has(l.toLowerCase().trim()));
}
