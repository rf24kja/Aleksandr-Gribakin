/**
 * The full working stack, as the owner listed it.
 *
 * Kept apart from PROJECTS on purpose, and never fed into techFrequency(). The
 * "Technologies in Production" tile counts what appears in described work: a
 * number that means "these were used on the jobs on this page". This file
 * answers a different question — what the owner can pick up — and mixing the
 * two would quietly turn a measured figure into a claim about tools that no
 * case on the site mentions. Rule two of the project, one level down: two kinds
 * of claim, two places, each labelled as what it is.
 *
 * Order is the owner's. Groups are rendered in it, and nothing here is sorted
 * by "importance" — that judgement is not the site's to make.
 */

export const STACK_GROUPS = [
  {
    id: 'go',
    title: { EN: 'Go', RU: 'Go' },
    lines: [
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
      { label: { EN: 'Frameworks', RU: 'Фреймворки' }, items: ['React', 'Next.js', 'Vue.js', 'Node.js', 'Express', 'NestJS', 'Astro'] },
      { label: { EN: 'State and data', RU: 'Состояние и данные' }, items: ['Redux', 'Zustand', 'Pinia', 'TanStack Query', 'SWR'] },
      { label: { EN: 'Build', RU: 'Сборка' }, items: ['Vite', 'esbuild', 'SWC', 'Webpack', 'Babel'] },
      { label: { EN: 'Styling', RU: 'Стилизация' }, items: ['Tailwind CSS', 'PostCSS', 'Sass/SCSS', 'CSS Modules'] },
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
      { label: { EN: 'Relational', RU: 'Реляционные' }, items: ['PostgreSQL', 'MySQL', 'MariaDB'] },
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
      { label: { EN: 'Containers', RU: 'Контейнеризация' }, items: ['Docker', 'Docker Compose'] },
      { label: { EN: 'Orchestration', RU: 'Оркестрация' }, items: ['k3s', 'Kubernetes'] },
      { label: { EN: 'Web servers and proxies', RU: 'Веб-серверы и прокси' }, items: ['Nginx', 'Caddy', 'HAProxy', 'Traefik'] },
      { label: { EN: 'CI/CD', RU: 'CI/CD' }, items: ['GitHub Actions', 'GitLab CI', 'semantic-release', 'Conventional Commits'] },
      { label: { EN: 'Infrastructure as Code', RU: 'Infrastructure as Code' }, items: ['Terraform', 'Pulumi', 'Ansible'] },
      { label: { EN: 'Secrets', RU: 'Секреты' }, items: ['HashiCorp Vault', 'SOPS', 'age'] },
      { label: { EN: 'Registries and updates', RU: 'Реестры и автообновление' }, items: ['Watchtower', 'GitHub Container Registry'] },
      { label: { EN: 'Process automation', RU: 'Автоматизация процессов' }, items: ['n8n'] },
      { label: { EN: 'Edge, CDN, hosting', RU: 'Edge, CDN, хостинг' }, items: ['Cloudflare (Workers, R2, Turnstile, Zero Trust)', 'Vercel', 'Fastly'] },
    ],
  },
  {
    id: 'observability',
    title: { EN: 'Observability and reliability', RU: 'Наблюдаемость и надёжность' },
    lines: [
      { label: { EN: 'Metrics', RU: 'Метрики' }, items: ['Prometheus', 'Grafana'] },
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

/** Localised view of one group. */
export function stackGroups(lang = 'EN') {
  const key = lang === 'RU' ? 'RU' : 'EN';
  return STACK_GROUPS.map((g) => ({
    id: g.id,
    title: g.title[key] || g.title.EN,
    note: g.note ? (g.note[key] || g.note.EN) : null,
    lines: g.lines.map((l) => ({ label: l.label[key] || l.label.EN, items: l.items })),
  }));
}

/** Distinct tool count, computed rather than typed — as every figure here is. */
export function stackToolCount() {
  const seen = new Set();
  for (const g of STACK_GROUPS) for (const l of g.lines) for (const i of l.items) seen.add(i);
  return seen.size;
}
