// Reference architectures. Client code is under NDA, so each entry describes the
// design and the reasoning rather than a specific deployment — the detail pages
// say so on the page itself. Metrics are characteristics of the approach.
export const PROJECTS_DETAIL = {
  EN: {
    'bare-to-cloud': {
      details: [
        'A migration path off physical servers and classic virtualisation into a hybrid AWS/GCP footprint. The hard part is never the new infrastructure — it is that nobody has a complete inventory of the old one, so the first phase is discovery rather than provisioning.',
        'Workloads move in three passes: describe the existing estate as code, stand up a parity environment and prove it under real traffic in shadow, then shift traffic with a rehearsed rollback. Anything stateful moves last, once the stateless tier has already proven the network path.'
      ],
      highlights: [
        { label: 'Maintenance Cost', value: 35, unit: '% saved' },
        { label: 'Migration Phases', value: 3, unit: '' },
        { label: 'Rollback Time', value: 5, unit: 'min' },
        { label: 'Parity Soak', value: 6, unit: 'weeks' },
        { label: 'Cloud Providers', value: 2, unit: '' },
        { label: 'Downtime', value: 0, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Discovery-first inventory as code', 'Shadow traffic parity testing', 'Stateless tier moves before stateful', 'Rehearsed rollback at every phase', 'Hybrid connectivity with private peering'],
      screenshotType: 'graph'
    },
    'k8s-platform': {
      details: [
        'A Kubernetes platform built so product teams do not have to become Kubernetes engineers. A team requests a namespace and receives quotas, network policy, ingress, TLS, log shipping and a dashboard already wired up.',
        'The platform layer is deliberately opinionated. Teams get a small manifest surface rather than raw Kubernetes objects, which keeps the blast radius of a mistake inside one namespace and makes cluster upgrades something the platform team can actually schedule.'
      ],
      highlights: [
        { label: 'Uptime Target', value: 99.9, unit: '%' },
        { label: 'Namespace Setup', value: 4, unit: 'min' },
        { label: 'Node Pools', value: 4, unit: '' },
        { label: 'Managed Add-ons', value: 9, unit: '' },
        { label: 'Cluster Upgrades', value: 4, unit: '/yr' },
        { label: 'Quota Enforced', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Self-serve namespace provisioning', 'Network policy on by default', 'Automatic TLS and ingress', 'Per-namespace quotas and limits', 'Scheduled zero-drama cluster upgrades'],
      screenshotType: 'terminal'
    },
    'iac-baseline': {
      details: [
        'A baseline where every environment — development, staging, production — exists as code and can be rebuilt from nothing. The test of whether this is real is simple: destroy a non-production environment and recreate it. If that is frightening, it is not infrastructure as code yet.',
        'Terraform owns anything with a lifecycle, Ansible owns anything inside a machine, and secrets never touch the repository. Changes go through review and a plan step, so the diff a human approves is the diff that gets applied.'
      ],
      highlights: [
        { label: 'Reproducibility', value: 100, unit: '%' },
        { label: 'Environments', value: 3, unit: '' },
        { label: 'Rebuild Time', value: 22, unit: 'min' },
        { label: 'Manual Steps', value: 0, unit: '' },
        { label: 'Modules', value: 24, unit: '' },
        { label: 'Drift Checks', value: 1, unit: '/day' }
      ],
      links: {}, access: 'private',
      features: ['Plan-and-review before every apply', 'Secrets from a vault, never the repo', 'Scheduled drift detection', 'Environment rebuild as a routine drill', 'Shared modules with pinned versions'],
      screenshotType: 'code'
    },
    'env-parity': {
      details: [
        'A setup where a developer runs the same container images locally that production runs, differing only in configuration. It removes an entire category of incident: the one where a bug is unreproducible because two environments disagree about a library version nobody documented.',
        'Local uses Compose, production uses the orchestrator, and both consume the same build artefact. Bringing a full stack up on a laptop takes one command, which matters more than it sounds — the cost of that command is what decides whether people test before pushing.'
      ],
      highlights: [
        { label: 'Environments', value: 4, unit: '' },
        { label: 'Cold Start', value: 90, unit: 's' },
        { label: 'Setup Commands', value: 1, unit: '' },
        { label: 'Image Reuse', value: 100, unit: '%' },
        { label: 'Services Local', value: 11, unit: '' },
        { label: 'Config Drift', value: 0, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['One build artefact across all environments', 'Single-command local stack', 'Configuration injected, never baked in', 'Seeded fixtures for realistic local data', 'Same health checks locally and in production'],
      screenshotType: 'terminal'
    },
    'pipeline-standard': {
      details: [
        'A single pipeline template shared across dozens of microservices, instead of dozens of pipelines that drifted apart the moment they were copied. A service opts in by declaring its type; the stages, caching, scanning and promotion rules come from the template.',
        'The measurable outcome was release time falling from a multi-day coordinated event to roughly fifteen minutes. The unmeasured one mattered more: when releasing is cheap, teams release smaller changes, and smaller changes are what actually reduces incidents.'
      ],
      highlights: [
        { label: 'Release Time', value: 15, unit: 'min' },
        { label: 'Previous Time', value: 48, unit: 'hr' },
        { label: 'Pipeline Stages', value: 7, unit: '' },
        { label: 'Cache Hit Rate', value: 82, unit: '%' },
        { label: 'Services', value: 40, unit: '+' },
        { label: 'Templates', value: 4, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['One template, many services', 'Layer caching tuned per language', 'Dependency and image scanning in-pipeline', 'Promotion between environments by tag', 'Pipeline config reviewed like application code'],
      screenshotType: 'terminal'
    },
    'zero-downtime': {
      details: [
        'Deployment without a maintenance window. Readiness and liveness probes decide when an instance joins the pool, connection draining lets the old one finish what it started, and promotion pauses on an error-rate gate rather than a stopwatch.',
        'Rollback is the part teams underinvest in. Here the previous release stays warm and reachable, so reverting is a routing change rather than a rebuild — which is why it completes in about ninety seconds instead of the twenty minutes a redeploy takes.'
      ],
      highlights: [
        { label: 'Downtime', value: 0, unit: '' },
        { label: 'Rollback', value: 90, unit: 's' },
        { label: 'Health Gates', value: 3, unit: '' },
        { label: 'Drain Window', value: 30, unit: 's' },
        { label: 'Strategies', value: 2, unit: '' },
        { label: 'Canary Steps', value: 4, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Readiness-gated instance rotation', 'Connection draining before shutdown', 'Error-rate gate blocks promotion', 'Previous release kept warm for instant revert', 'Blue-green for schema-sensitive releases'],
      screenshotType: 'graph'
    },
    'gitops': {
      details: [
        'Cluster state lives in Git and a controller continuously reconciles reality against it. The property that makes this worth the migration is not deployment speed but auditability: every change to production has an author, a review and a revert path, because it is a commit.',
        'It also removes an entire failure mode. Manual kubectl edits stop being invisible drift and start being changes the reconciler undoes within seconds, which sounds harsh until the first incident caused by a fix somebody applied at 2am and forgot to write down.'
      ],
      highlights: [
        { label: 'Reconcile Interval', value: 30, unit: 's' },
        { label: 'Environments', value: 3, unit: '' },
        { label: 'Drift Corrected', value: 100, unit: '%' },
        { label: 'Audit Trail', value: true, unit: '' },
        { label: 'Apps Managed', value: 60, unit: '+' },
        { label: 'Revert', value: 1, unit: 'commit' }
      ],
      links: {}, access: 'private',
      features: ['Git as the single source of truth', 'Continuous drift correction', 'Every production change reviewed as a commit', 'Per-environment overlays without forked manifests', 'Revert by reverting the commit'],
      screenshotType: 'code'
    },
    'monolith-split': {
      details: [
        'Extracting services from a monolith while it keeps serving production traffic. The boundary that matters is data ownership: two components that write the same table are one service pretending to be two, no matter how the directories are arranged.',
        'A gateway routes each extracted capability to the new service while the monolith remains the fallback, so any extraction can be reversed with a routing rule. Nothing about this requires a feature freeze, which is the only reason a migration like this ever finishes.'
      ],
      highlights: [
        { label: 'Extraction Steps', value: 12, unit: '' },
        { label: 'Feature Freeze', value: 0, unit: '' },
        { label: 'Rollback', value: 1, unit: 'route' },
        { label: 'Services Extracted', value: 14, unit: '' },
        { label: 'Shared Tables', value: 0, unit: '' },
        { label: 'Contract Tests', value: 180, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Seams drawn on data ownership', 'Gateway routing with monolith fallback', 'One capability extracted at a time', 'Contract tests on every boundary', 'No feature freeze at any point'],
      screenshotType: 'graph'
    },
    'api-layer': {
      details: [
        'A public REST surface backed by gRPC between services, with both generated from one contract. Handwritten clients drift from the server the week after they are written; generated ones fail the build instead, which is the only feedback that arrives early enough to be useful.',
        'Versioning is explicit and additive: new fields are optional, removals require a deprecation window, and the gateway can serve two versions at once. This is unglamorous and it is what lets a backend team ship without scheduling around every consumer.'
      ],
      highlights: [
        { label: 'p95 Latency', value: 40, unit: 'ms' },
        { label: 'Generated Clients', value: 5, unit: '' },
        { label: 'Breaking Changes', value: 0, unit: '' },
        { label: 'Endpoints', value: 120, unit: '+' },
        { label: 'Deprecation Window', value: 90, unit: 'day' },
        { label: 'Schema Checks', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['One contract generates REST and gRPC', 'Compile-time client compatibility', 'Additive-only schema evolution', 'Two API versions served concurrently', 'Contract diff enforced in CI'],
      screenshotType: 'code'
    },
    'async-jobs': {
      details: [
        'Background processing for everything that should not happen inside a request: imports, exports, notifications, report generation. Handlers are idempotent because at-least-once delivery means a job will eventually run twice, and pretending otherwise just relocates the bug.',
        'Retries use exponential backoff with a cap, and anything exhausting its retries lands in a dead-letter queue with the original payload and failure reason. The dead-letter queue has an owner and a dashboard, because an unread one is just a slower way to lose data.'
      ],
      highlights: [
        { label: 'Throughput', value: 3, unit: 'K/min' },
        { label: 'Retry Attempts', value: 5, unit: '' },
        { label: 'Max Backoff', value: 15, unit: 'min' },
        { label: 'Queues', value: 8, unit: '' },
        { label: 'DLQ Monitored', value: true, unit: '' },
        { label: 'Idempotent', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Idempotent handlers by construction', 'Exponential backoff with a ceiling', 'Dead-letter queue with an owner', 'Priority lanes for interactive jobs', 'Per-queue depth and age alerting'],
      screenshotType: 'terminal'
    },
    'pg-highload': {
      details: [
        'Tuning PostgreSQL for highload without reaching for a bigger instance first. Streaming replication takes read traffic off the primary, partitioning keeps the hot set small, and a pooler stops thousands of application connections from becoming thousands of backend processes.',
        'The largest improvements consistently came from reading execution plans rather than adding capacity: a missing composite index, a query that sorted before filtering, an ORM that fetched a hundred rows to count them. Hardware hides those for a quarter and then stops.'
      ],
      highlights: [
        { label: 'Read Replicas', value: 3, unit: '' },
        { label: 'p99 Query', value: 25, unit: 'ms' },
        { label: 'Pooled Connections', value: 5, unit: 'K' },
        { label: 'Partition Span', value: 1, unit: 'mo' },
        { label: 'Failover', value: 30, unit: 's' },
        { label: 'Cache Hit Ratio', value: 98, unit: '%' }
      ],
      links: {}, access: 'private',
      features: ['Streaming replication with automatic failover', 'Time-based partitioning on hot tables', 'Transaction pooling via PgBouncer', 'Query plan review as routine practice', 'Slow query capture with alerting'],
      screenshotType: 'dashboard'
    },
    'cache-tiers': {
      details: [
        'A caching hierarchy where each layer has a stated purpose and a stated staleness budget: CDN for static assets, edge cache for anonymous pages, application cache for computed fragments, query cache for expensive reads.',
        'Invalidation is designed before the cache is added, not after it causes an incident. Keys carry a version, writes publish invalidation events, and anything that cannot be invalidated cleanly gets a short TTL instead — a cache nobody can reason about is a bug with better latency.'
      ],
      highlights: [
        { label: 'Cache Tiers', value: 4, unit: '' },
        { label: 'Origin Offload', value: 88, unit: '%' },
        { label: 'p95 Cached', value: 8, unit: 'ms' },
        { label: 'Stale Window', value: 60, unit: 's' },
        { label: 'Hit Rate', value: 94, unit: '%' },
        { label: 'Versioned Keys', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Explicit staleness budget per tier', 'Version-tagged cache keys', 'Event-driven invalidation on write', 'Short TTL where invalidation is unclear', 'Per-tier hit-rate dashboards'],
      screenshotType: 'dashboard'
    },
    'search-stack': {
      details: [
        'A search tier kept current by a change stream rather than a nightly job, so an edit becomes searchable in seconds. The document store holds the flexible shape, the search index holds what needs querying, and neither pretends to be the system of record.',
        'Reindexing is the operation everyone forgets to design. Here it writes to a new index alias-side and swaps atomically when complete, which means schema changes and analyser changes are routine rather than an outage scheduled for a Sunday.'
      ],
      highlights: [
        { label: 'Index Lag', value: 4, unit: 's' },
        { label: 'Documents', value: 40, unit: 'M+' },
        { label: 'Reindex Downtime', value: 0, unit: '' },
        { label: 'Query p95', value: 60, unit: 'ms' },
        { label: 'Shards', value: 12, unit: '' },
        { label: 'Analysers', value: 6, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Change-stream driven indexing', 'Atomic alias swap on reindex', 'Separate write shape and query shape', 'Language-aware analysers', 'Index lag alerting'],
      screenshotType: 'dashboard'
    },
    'spa-ssr': {
      details: [
        'A single-page application rendered on the server for the first response and hydrated on the client afterwards. It exists because a client-rendered page is a blank document to a crawler and a slow one to anybody on a poor connection, and both of those cost real traffic.',
        'Types run end to end from the API contract into components, so a backend field rename fails the frontend build rather than producing an undefined in production. Bundles are split by route, because most users never visit most routes.'
      ],
      highlights: [
        { label: 'First Paint', value: 1.1, unit: 's' },
        { label: 'Bundle', value: 180, unit: 'KB' },
        { label: 'Route Chunks', value: 14, unit: '' },
        { label: 'Lighthouse', value: 96, unit: '/100' },
        { label: 'Type Coverage', value: 97, unit: '%' },
        { label: 'Hydration', value: 220, unit: 'ms' }
      ],
      links: {}, access: 'private',
      features: ['Server render for first paint and crawlers', 'Route-level code splitting', 'Types shared with the API contract', 'Streaming HTML where supported', 'Budget checks on bundle size in CI'],
      screenshotType: 'code'
    },
    'ui-kit': {
      details: [
        'A component library shared across products, built on design tokens so a colour or spacing change lands everywhere at once instead of in eleven slightly different places. Each component documents its variants, its states and its keyboard behaviour.',
        'Accessibility is part of the component rather than an audit finding: focus is visible, controls are reachable by keyboard, and contrast is checked in the token layer. Retrofitting any of that across forty components costs far more than building it in.'
      ],
      highlights: [
        { label: 'Components', value: 42, unit: '' },
        { label: 'Design Tokens', value: 120, unit: '+' },
        { label: 'Contrast', value: 'WCAG AA', unit: '' },
        { label: 'Products Using', value: 5, unit: '' },
        { label: 'Documented States', value: 4, unit: '/component' },
        { label: 'Visual Tests', value: 210, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Token-driven theming', 'Documented variants and states', 'Keyboard and focus behaviour per component', 'Contrast enforced at the token layer', 'Visual regression tests in CI'],
      screenshotType: 'code'
    },
    'observability': {
      details: [
        'Metrics, logs and traces joined by a request identifier that survives every hop, so a slow request can be followed from the ingress to the query that caused it without switching tools and guessing at timestamps.',
        'Alerts fire on symptoms users feel — error rate, latency, saturation — rather than on individual machine conditions. A page for high CPU wakes somebody for a system that is working fine, and after enough of those nobody reads the pages that matter.'
      ],
      highlights: [
        { label: 'Retention', value: 30, unit: 'day' },
        { label: 'Scrape Interval', value: 15, unit: 's' },
        { label: 'Alert Rules', value: 60, unit: '' },
        { label: 'Dashboards', value: 24, unit: '' },
        { label: 'Trace Sampling', value: 10, unit: '%' },
        { label: 'Correlated', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Request id propagated across every service', 'Symptom-based alerting, not machine-based', 'SLO burn-rate alerts', 'Log and metric correlation in one view', 'Runbook link on every alert'],
      screenshotType: 'dashboard'
    },
    'incident': {
      details: [
        'On-call built around service ownership: the team that ships a service carries it, which is the only arrangement that reliably improves reliability. Rotations are staffed so that being on call is uneventful most weeks rather than a tax people plan around.',
        'Runbooks live beside the code and are opened during drills, because a runbook nobody has followed since it was written is fiction. Postmortems are blameless and produce tracked actions, on the principle that an incident which changes nothing will happen again on schedule.'
      ],
      highlights: [
        { label: 'Ack Target', value: 5, unit: 'min' },
        { label: 'Runbook Review', value: 3, unit: 'mo' },
        { label: 'Rotation Depth', value: 4, unit: '' },
        { label: 'Postmortem SLA', value: 5, unit: 'day' },
        { label: 'Drills', value: 4, unit: '/yr' },
        { label: 'Blameless', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Service ownership drives the rotation', 'Runbooks versioned with the code', 'Regular game-day drills', 'Blameless postmortems with tracked actions', 'Alert volume reviewed every quarter'],
      screenshotType: 'terminal'
    }
  },
  RU: {
    'bare-to-cloud': {
      details: [
        'Путь ухода с физических серверов и классической виртуализации в гибридную инфраструктуру AWS/GCP. Сложность никогда не в новой инфраструктуре — сложность в том, что полной описи старой ни у кого нет, поэтому первая фаза это обнаружение, а не провижининг.',
        'Нагрузки переезжают в три прохода: описать существующее хозяйство кодом, поднять паритетное окружение и проверить его реальным трафиком в теневом режиме, затем переключить трафик с отрепетированным откатом. Всё stateful едет последним, когда stateless-слой уже подтвердил сетевой путь.'
      ],
      highlights: [
        { label: 'Стоимость обслуживания', value: 35, unit: '% сэкономлено' },
        { label: 'Фаз миграции', value: 3, unit: '' },
        { label: 'Время отката', value: 5, unit: 'мин' },
        { label: 'Прогон паритета', value: 6, unit: 'недель' },
        { label: 'Облачных провайдеров', value: 2, unit: '' },
        { label: 'Простой', value: 0, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Опись инфраструктуры как код', 'Паритет на теневом трафике', 'Stateless едет раньше stateful', 'Отрепетированный откат на каждой фазе', 'Гибридная связность через private peering'],
      screenshotType: 'graph'
    },
    'k8s-platform': {
      details: [
        'Kubernetes-платформа, построенная так, чтобы продуктовым командам не пришлось становиться Kubernetes-инженерами. Команда запрашивает namespace и получает квоты, сетевые политики, ingress, TLS, отгрузку логов и готовый дашборд.',
        'Слой платформы намеренно директивен. Командам доступна небольшая поверхность манифестов, а не сырые объекты Kubernetes, — это удерживает радиус поражения ошибки внутри одного namespace и превращает обновление кластера в то, что платформенная команда может спокойно запланировать.'
      ],
      highlights: [
        { label: 'Целевой аптайм', value: 99.9, unit: '%' },
        { label: 'Заведение namespace', value: 4, unit: 'мин' },
        { label: 'Пулов нод', value: 4, unit: '' },
        { label: 'Управляемых аддонов', value: 9, unit: '' },
        { label: 'Обновлений кластера', value: 4, unit: '/год' },
        { label: 'Квоты', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Self-serve выдача namespace', 'Сетевые политики по умолчанию', 'Автоматические TLS и ingress', 'Квоты и лимиты на namespace', 'Плановые обновления кластера без драмы'],
      screenshotType: 'terminal'
    },
    'iac-baseline': {
      details: [
        'База, в которой каждое окружение — development, staging, production — существует как код и пересобирается с нуля. Проверка на честность простая: снести непродакшен-окружение и создать заново. Если это страшно, значит инфраструктура ещё не код.',
        'Terraform владеет всем, у чего есть жизненный цикл, Ansible — всем, что внутри машины, а секреты не попадают в репозиторий никогда. Изменения проходят ревью и стадию плана, поэтому применяется ровно тот diff, который одобрил человек.'
      ],
      highlights: [
        { label: 'Воспроизводимость', value: 100, unit: '%' },
        { label: 'Окружений', value: 3, unit: '' },
        { label: 'Пересборка', value: 22, unit: 'мин' },
        { label: 'Ручных шагов', value: 0, unit: '' },
        { label: 'Модулей', value: 24, unit: '' },
        { label: 'Проверок дрифта', value: 1, unit: '/день' }
      ],
      links: {}, access: 'private',
      features: ['План и ревью перед каждым применением', 'Секреты из хранилища, не из репозитория', 'Регулярная детекция дрифта', 'Пересборка окружения как рутинное учение', 'Общие модули с зафиксированными версиями'],
      screenshotType: 'code'
    },
    'env-parity': {
      details: [
        'Схема, при которой разработчик запускает локально те же образы контейнеров, что и продакшен, а отличается только конфигурация. Это убирает целую категорию инцидентов — ту, где баг невоспроизводим, потому что два окружения расходятся в версии библиотеки, которую никто не задокументировал.',
        'Локально Compose, в продакшене оркестратор, но оба потребляют один и тот же артефакт сборки. Поднять полный стек на ноутбуке — одна команда, и это важнее, чем звучит: именно цена этой команды решает, тестируют ли люди перед пушем.'
      ],
      highlights: [
        { label: 'Окружений', value: 4, unit: '' },
        { label: 'Холодный старт', value: 90, unit: 'с' },
        { label: 'Команд для запуска', value: 1, unit: '' },
        { label: 'Переиспользование образа', value: 100, unit: '%' },
        { label: 'Сервисов локально', value: 11, unit: '' },
        { label: 'Дрифт конфигурации', value: 0, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Один артефакт сборки на все окружения', 'Локальный стек одной командой', 'Конфигурация подаётся, а не вшивается', 'Подготовленные фикстуры под реальные данные', 'Одинаковые health-check локально и в проде'],
      screenshotType: 'terminal'
    },
    'pipeline-standard': {
      details: [
        'Единый шаблон пайплайна для десятков микросервисов вместо десятков пайплайнов, разошедшихся сразу после копирования. Сервис подключается, объявив свой тип; стадии, кэширование, сканирование и правила промоушена приходят из шаблона.',
        'Измеримый результат — время релиза упало с многодневного согласованного события примерно до пятнадцати минут. Неизмеримый оказался важнее: когда релиз дёшев, команды выпускают меньшие изменения, а именно меньшие изменения снижают число инцидентов.'
      ],
      highlights: [
        { label: 'Время релиза', value: 15, unit: 'мин' },
        { label: 'Было', value: 48, unit: 'ч' },
        { label: 'Стадий пайплайна', value: 7, unit: '' },
        { label: 'Попаданий в кэш', value: 82, unit: '%' },
        { label: 'Сервисов', value: 40, unit: '+' },
        { label: 'Шаблонов', value: 4, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Один шаблон, много сервисов', 'Кэширование слоёв под каждый язык', 'Сканирование зависимостей и образов в пайплайне', 'Промоушен между средами по тегу', 'Конфиг пайплайна проходит ревью как код'],
      screenshotType: 'terminal'
    },
    'zero-downtime': {
      details: [
        'Развёртывание без технического окна. Пробы readiness и liveness решают, когда инстанс входит в пул, дренаж соединений даёт старому закончить начатое, а промоушен приостанавливается по уровню ошибок, а не по секундомеру.',
        'Откат — то, во что команды вкладываются меньше всего. Здесь предыдущий релиз остаётся прогретым и доступным, поэтому возврат это смена маршрутизации, а не пересборка. Отсюда девяносто секунд вместо двадцати минут, которые занимает повторный деплой.'
      ],
      highlights: [
        { label: 'Простой', value: 0, unit: '' },
        { label: 'Откат', value: 90, unit: 'с' },
        { label: 'Проверок здоровья', value: 3, unit: '' },
        { label: 'Окно дренажа', value: 30, unit: 'с' },
        { label: 'Стратегий', value: 2, unit: '' },
        { label: 'Шагов canary', value: 4, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Ротация инстансов по readiness', 'Дренаж соединений перед остановкой', 'Порог ошибок блокирует промоушен', 'Предыдущий релиз прогрет для мгновенного возврата', 'Blue-green для релизов со схемой БД'],
      screenshotType: 'graph'
    },
    'gitops': {
      details: [
        'Состояние кластера живёт в Git, а контроллер непрерывно сверяет с ним реальность. Ради чего стоит мигрировать — не скорость деплоя, а аудируемость: у каждого изменения продакшена есть автор, ревью и путь отката, потому что это коммит.',
        'Заодно исчезает целый класс отказов. Правки через kubectl перестают быть невидимым дрифтом и становятся изменениями, которые контроллер отменяет за секунды. Звучит жёстко ровно до первого инцидента из-за фикса, который кто-то применил в два ночи и забыл записать.'
      ],
      highlights: [
        { label: 'Интервал сверки', value: 30, unit: 'с' },
        { label: 'Окружений', value: 3, unit: '' },
        { label: 'Дрифт исправлен', value: 100, unit: '%' },
        { label: 'Аудит-трейл', value: true, unit: '' },
        { label: 'Приложений', value: 60, unit: '+' },
        { label: 'Откат', value: 1, unit: 'коммит' }
      ],
      links: {}, access: 'private',
      features: ['Git как единственный источник истины', 'Непрерывная коррекция дрифта', 'Каждое изменение прода проходит ревью', 'Оверлеи под окружения без форка манифестов', 'Откат через revert коммита'],
      screenshotType: 'code'
    },
    'monolith-split': {
      details: [
        'Извлечение сервисов из монолита, пока тот продолжает обслуживать продакшен. Значимая граница — владение данными: два компонента, пишущих в одну таблицу, это один сервис, притворяющийся двумя, как бы ни были разложены директории.',
        'Шлюз направляет каждую извлечённую функцию в новый сервис, а монолит остаётся запасным вариантом, поэтому любое извлечение отменяется правилом маршрутизации. Заморозка функционала при этом не нужна — и только поэтому такие миграции вообще доходят до конца.'
      ],
      highlights: [
        { label: 'Шагов извлечения', value: 12, unit: '' },
        { label: 'Заморозка фич', value: 0, unit: '' },
        { label: 'Откат', value: 1, unit: 'маршрут' },
        { label: 'Извлечено сервисов', value: 14, unit: '' },
        { label: 'Общих таблиц', value: 0, unit: '' },
        { label: 'Контрактных тестов', value: 180, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Границы по владению данными', 'Маршрутизация со шлюзом и запасным монолитом', 'По одной функции за раз', 'Контрактные тесты на каждой границе', 'Без заморозки функционала'],
      screenshotType: 'graph'
    },
    'api-layer': {
      details: [
        'Публичная REST-поверхность поверх gRPC между сервисами, оба генерируются из одного контракта. Написанные руками клиенты расходятся с сервером на следующей же неделе; сгенерированные вместо этого валят сборку — единственная обратная связь, приходящая достаточно рано, чтобы быть полезной.',
        'Версионирование явное и только аддитивное: новые поля опциональны, удаление требует окна устаревания, шлюз умеет отдавать две версии сразу. Скучно — и именно это позволяет бэкенд-команде выпускать, не согласуясь с каждым потребителем.'
      ],
      highlights: [
        { label: 'Задержка p95', value: 40, unit: 'ms' },
        { label: 'Сгенерированных клиентов', value: 5, unit: '' },
        { label: 'Ломающих изменений', value: 0, unit: '' },
        { label: 'Эндпоинтов', value: 120, unit: '+' },
        { label: 'Окно устаревания', value: 90, unit: 'дней' },
        { label: 'Проверка схемы', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Один контракт генерирует REST и gRPC', 'Совместимость клиентов на этапе компиляции', 'Только аддитивное развитие схемы', 'Две версии API одновременно', 'Диф контракта проверяется в CI'],
      screenshotType: 'code'
    },
    'async-jobs': {
      details: [
        'Фоновая обработка всего, чему не место внутри запроса: импорты, выгрузки, уведомления, генерация отчётов. Обработчики идемпотентны, потому что доставка at-least-once означает, что задача рано или поздно выполнится дважды, и вид, что это не так, просто переносит баг в другое место.',
        'Ретраи идут с экспоненциальным backoff и потолком, а всё, исчерпавшее попытки, попадает в dead-letter с исходным payload и причиной отказа. У этой очереди есть владелец и дашборд, потому что непрочитанный dead-letter — это просто более медленный способ потерять данные.'
      ],
      highlights: [
        { label: 'Пропускная способность', value: 3, unit: 'K/мин' },
        { label: 'Попыток', value: 5, unit: '' },
        { label: 'Макс. backoff', value: 15, unit: 'мин' },
        { label: 'Очередей', value: 8, unit: '' },
        { label: 'DLQ под наблюдением', value: true, unit: '' },
        { label: 'Идемпотентность', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Идемпотентные обработчики по построению', 'Экспоненциальный backoff с потолком', 'Dead-letter очередь с владельцем', 'Приоритетные полосы для интерактивных задач', 'Алерты по глубине и возрасту очереди'],
      screenshotType: 'terminal'
    },
    'pg-highload': {
      details: [
        'Тюнинг PostgreSQL под highload без того, чтобы первым делом брать инстанс побольше. Потоковая репликация снимает чтение с мастера, партиционирование удерживает горячий набор небольшим, а пулер не даёт тысячам соединений приложения превратиться в тысячи процессов на бэкенде.',
        'Самые крупные улучшения стабильно давало чтение планов выполнения, а не добавление мощности: отсутствующий составной индекс, запрос, сортирующий до фильтрации, ORM, вытягивающий сотню строк, чтобы их посчитать. Железо прячет такое на квартал, а потом перестаёт.'
      ],
      highlights: [
        { label: 'Реплик на чтение', value: 3, unit: '' },
        { label: 'Запрос p99', value: 25, unit: 'ms' },
        { label: 'Соединений в пуле', value: 5, unit: 'K' },
        { label: 'Шаг партиции', value: 1, unit: 'мес' },
        { label: 'Переключение', value: 30, unit: 'с' },
        { label: 'Попаданий в кэш', value: 98, unit: '%' }
      ],
      links: {}, access: 'private',
      features: ['Потоковая репликация с авто-переключением', 'Партиционирование горячих таблиц по времени', 'Пулинг транзакций через PgBouncer', 'Разбор планов запросов как рутина', 'Сбор медленных запросов с алертами'],
      screenshotType: 'dashboard'
    },
    'cache-tiers': {
      details: [
        'Иерархия кэшей, где у каждого слоя заявлены назначение и допустимая устарелость: CDN для статики, edge-кэш для анонимных страниц, кэш приложения для вычисленных фрагментов, кэш запросов для дорогих чтений.',
        'Инвалидация проектируется до добавления кэша, а не после инцидента. Ключи несут версию, записи публикуют события инвалидации, а всё, что нельзя инвалидировать чисто, получает короткий TTL: кэш, о котором никто не может рассуждать, — это баг с лучшей задержкой.'
      ],
      highlights: [
        { label: 'Уровней кэша', value: 4, unit: '' },
        { label: 'Разгрузка origin', value: 88, unit: '%' },
        { label: 'p95 из кэша', value: 8, unit: 'ms' },
        { label: 'Окно устарелости', value: 60, unit: 'с' },
        { label: 'Попаданий', value: 94, unit: '%' },
        { label: 'Версии в ключах', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Заявленный бюджет устарелости на слой', 'Ключи с версионным тегом', 'Событийная инвалидация при записи', 'Короткий TTL там, где инвалидация неясна', 'Дашборды попаданий по каждому слою'],
      screenshotType: 'dashboard'
    },
    'search-stack': {
      details: [
        'Поисковый слой, актуальный за счёт потока изменений, а не ночной задачи: правка становится доступна поиску за секунды. Документное хранилище держит гибкую форму, индекс — то, что нужно запрашивать, и ни один из них не претендует на роль системы записи.',
        'Переиндексация — операция, которую все забывают проектировать. Здесь она пишет в новый индекс со стороны алиаса и атомарно переключается по завершении, поэтому смена схемы или анализатора становится рутиной, а не аварией, назначенной на воскресенье.'
      ],
      highlights: [
        { label: 'Отставание индекса', value: 4, unit: 'с' },
        { label: 'Документов', value: 40, unit: 'M+' },
        { label: 'Простой при переиндексации', value: 0, unit: '' },
        { label: 'Запрос p95', value: 60, unit: 'ms' },
        { label: 'Шардов', value: 12, unit: '' },
        { label: 'Анализаторов', value: 6, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Индексация по потоку изменений', 'Атомарное переключение алиаса', 'Разные формы для записи и запроса', 'Анализаторы с учётом языка', 'Алерты по отставанию индекса'],
      screenshotType: 'dashboard'
    },
    'spa-ssr': {
      details: [
        'Одностраничное приложение, рендерящееся на сервере для первого ответа и гидратируемое на клиенте дальше. Оно существует потому, что страница с клиентским рендером — пустой документ для поискового робота и медленный для любого на плохом канале, и то и другое стоит реального трафика.',
        'Типы идут сквозь всю систему от контракта API до компонентов, поэтому переименование поля на бэкенде валит сборку фронтенда, а не даёт undefined в продакшене. Бандлы разделены по маршрутам, потому что большинство пользователей не заходит на большинство страниц.'
      ],
      highlights: [
        { label: 'Первая отрисовка', value: 1.1, unit: 'с' },
        { label: 'Бандл', value: 180, unit: 'KB' },
        { label: 'Чанков маршрутов', value: 14, unit: '' },
        { label: 'Lighthouse', value: 96, unit: '/100' },
        { label: 'Покрытие типами', value: 97, unit: '%' },
        { label: 'Гидратация', value: 220, unit: 'ms' }
      ],
      links: {}, access: 'private',
      features: ['Серверный рендер для первой отрисовки и роботов', 'Разделение кода по маршрутам', 'Типы общие с контрактом API', 'Потоковый HTML там, где поддерживается', 'Проверка бюджета бандла в CI'],
      screenshotType: 'code'
    },
    'ui-kit': {
      details: [
        'Библиотека компонентов, общая для нескольких продуктов, на дизайн-токенах: смена цвета или отступа прилетает везде сразу, а не в одиннадцать слегка разных мест. Каждый компонент описывает свои варианты, состояния и поведение с клавиатуры.',
        'Доступность встроена в компонент, а не является находкой аудита: фокус виден, до элементов можно дойти клавиатурой, контраст проверяется на уровне токенов. Дорабатывать это задним числом на сорока компонентах стоит несравнимо дороже.'
      ],
      highlights: [
        { label: 'Компонентов', value: 42, unit: '' },
        { label: 'Дизайн-токенов', value: 120, unit: '+' },
        { label: 'Контраст', value: 'WCAG AA', unit: '' },
        { label: 'Продуктов использует', value: 5, unit: '' },
        { label: 'Состояний описано', value: 4, unit: '/компонент' },
        { label: 'Визуальных тестов', value: 210, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Темизация через токены', 'Описанные варианты и состояния', 'Клавиатура и фокус в каждом компоненте', 'Контраст проверяется на уровне токенов', 'Тесты визуальной регрессии в CI'],
      screenshotType: 'code'
    },
    'observability': {
      details: [
        'Метрики, логи и трейсы сшиты идентификатором запроса, переживающим каждый переход, поэтому медленный запрос прослеживается от ingress до вызвавшего его запроса к базе без переключения инструментов и угадывания по таймстампам.',
        'Алерты срабатывают на симптомы, которые чувствует пользователь: ошибки, задержка, насыщение. Пейджер по высокому CPU будит человека ради системы, которая работает нормально, а после десятка таких никто уже не читает те, что важны.'
      ],
      highlights: [
        { label: 'Хранение', value: 30, unit: 'дней' },
        { label: 'Интервал сбора', value: 15, unit: 'с' },
        { label: 'Правил алертов', value: 60, unit: '' },
        { label: 'Дашбордов', value: 24, unit: '' },
        { label: 'Сэмплирование трейсов', value: 10, unit: '%' },
        { label: 'Связанность', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Id запроса пробрасывается через все сервисы', 'Алерты по симптомам, а не по машинам', 'Алерты по скорости сжигания SLO', 'Логи и метрики в одном представлении', 'Ссылка на runbook в каждом алерте'],
      screenshotType: 'dashboard'
    },
    'incident': {
      details: [
        'Дежурства построены вокруг владения сервисом: кто выпускает сервис, тот его и носит — единственная схема, которая надёжно повышает надёжность. Ротации укомплектованы так, чтобы дежурство было спокойным большинство недель, а не налогом, вокруг которого люди планируют жизнь.',
        'Runbook лежат рядом с кодом и открываются на учениях, потому что runbook, который никто не проходил с момента написания, — это художественная литература. Постмортемы безобвинительные и дают отслеживаемые действия: инцидент, который ничего не изменил, повторится точно по расписанию.'
      ],
      highlights: [
        { label: 'Цель по ack', value: 5, unit: 'мин' },
        { label: 'Ревью runbook', value: 3, unit: 'мес' },
        { label: 'Глубина ротации', value: 4, unit: '' },
        { label: 'SLA постмортема', value: 5, unit: 'дней' },
        { label: 'Учений', value: 4, unit: '/год' },
        { label: 'Без обвинений', value: true, unit: '' }
      ],
      links: {}, access: 'private',
      features: ['Ротация по владению сервисом', 'Runbook версионируются вместе с кодом', 'Регулярные учения game-day', 'Безобвинительные постмортемы с задачами', 'Ежеквартальный разбор объёма алертов'],
      screenshotType: 'terminal'
    }
  }
};

export const CAREER_DETAIL = {
  EN: [
    {
      details: [
        'Owned the Kubernetes platform and the GitOps model that delivers onto it. Product teams request a namespace and receive quotas, network policy, ingress, TLS and monitoring already wired together, which keeps them out of cluster internals and keeps cluster upgrades schedulable.',
        'Finished moving the remaining legacy estate off physical servers into a hybrid cloud footprint across AWS and GCP. Maintenance spend fell by 30-40%, though the more useful outcome was that the infrastructure finally existed as code rather than as institutional memory.'
      ],
      highlights: [
        { label: 'Uptime Target', value: 99.9, unit: '%' },
        { label: 'Maintenance Cost', value: 35, unit: '% saved' },
        { label: 'Managed Services', value: 60, unit: '+' },
        { label: 'Cluster Upgrades', value: 4, unit: '/yr' },
        { label: 'Namespace Setup', value: 4, unit: 'min' },
        { label: 'Cloud Providers', value: 2, unit: '' }
      ],
      techStack: ['Kubernetes', 'Terraform', 'ArgoCD', 'Helm', 'AWS', 'GCP', 'Prometheus', 'Linux'],
      keyAchievements: [
        'Completed the move off bare metal into hybrid cloud',
        'Cut infrastructure maintenance spend by 30-40%',
        'Made cluster upgrades a scheduled event rather than an incident',
        'Brought every environment under infrastructure as code',
        'Reduced namespace provisioning from a ticket to four minutes'
      ]
    },
    {
      details: [
        'Standardised delivery across dozens of microservices that had each grown their own pipeline. One template, opted into by declaring a service type, replaced a set of copies that had drifted apart the moment they were duplicated.',
        'Release time dropped from a multi-day coordinated event to roughly fifteen minutes, deployed without downtime. The effect worth naming is second-order: once releasing became cheap, teams shipped smaller changes more often, and smaller changes are what actually brings incident counts down.'
      ],
      highlights: [
        { label: 'Release Time', value: 15, unit: 'min' },
        { label: 'Previous Time', value: 48, unit: 'hr' },
        { label: 'Services Covered', value: 40, unit: '+' },
        { label: 'Downtime', value: 0, unit: '' },
        { label: 'Pipeline Templates', value: 4, unit: '' },
        { label: 'Rollback', value: 90, unit: 's' }
      ],
      techStack: ['GitLab CI', 'Jenkins', 'Docker', 'Kubernetes', 'Helm', 'Ansible', 'Bash', 'Linux'],
      keyAchievements: [
        'Cut release time from days to about fifteen minutes',
        'Standardised CI/CD across dozens of services',
        'Introduced zero-downtime deployment as the default',
        'Added dependency and image scanning to every pipeline',
        'Made rollback a ninety-second routing change'
      ]
    },
    {
      details: [
        'Backend and frontend on the same product, plus the infrastructure underneath it — the arrangement that makes the DevOps label mean something rather than being a job title. Owning the deploy changes how you write the code.',
        'Most of the engineering effort went into the database tier under growing load: streaming replication to take reads off the primary, partitioning to keep the hot set small, and a caching hierarchy with an invalidation story designed before the cache existed.'
      ],
      highlights: [
        { label: 'p99 Query', value: 25, unit: 'ms' },
        { label: 'Read Replicas', value: 3, unit: '' },
        { label: 'Cache Tiers', value: 4, unit: '' },
        { label: 'Origin Offload', value: 88, unit: '%' },
        { label: 'Services Owned', value: 6, unit: '' },
        { label: 'Cache Hit Rate', value: 94, unit: '%' }
      ],
      techStack: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'React', 'TypeScript', 'Docker', 'NGINX'],
      keyAchievements: [
        'Scaled the database tier through replication and partitioning',
        'Designed a four-tier cache with explicit invalidation',
        'Took reads off the primary without changing application code',
        'Owned services end to end, from schema to deploy',
        'Cut p99 query time by reading plans rather than adding hardware'
      ]
    },
    {
      details: [
        'The monolith era, on classic virtualisation. Deploys were manual, environments were assembled by hand, and every incident traced back to a step somebody performed slightly differently than last time.',
        'This is where the automation instinct came from. Each repetitive task got scripted, each script got version-controlled, and the gap between what the runbook said and what production actually looked like became impossible to ignore.'
      ],
      highlights: [
        { label: 'Deploy Steps', value: 30, unit: '' },
        { label: 'Automated', value: 80, unit: '%' },
        { label: 'Environments', value: 3, unit: '' },
        { label: 'Release Cadence', value: 2, unit: '/mo' },
        { label: 'Manual Errors', value: 70, unit: '% saved' },
        { label: 'Scripts Written', value: 40, unit: '+' }
      ],
      techStack: ['PHP', 'Symfony', 'MySQL', 'JavaScript', 'Bash', 'Linux', 'Apache', 'Git'],
      keyAchievements: [
        'Scripted a manual deploy process end to end',
        'Brought environment setup under version control',
        'Cut deploy-time human error substantially',
        'Established the first repeatable release cadence',
        'Documented production as it actually was, not as intended'
      ]
    },
    {
      details: [
        'LAMP on physical servers, which meant learning the stack from the kernel upward because there was no managed layer to hide behind. Disk filled up, you cleared it. A service died at night, you were the one who restarted it.',
        'Unfashionable now and still the most useful period of the fifteen. Every abstraction that came later — containers, orchestrators, managed databases — is easier to reason about when you have already debugged the thing it replaced.'
      ],
      highlights: [
        { label: 'Servers Managed', value: 20, unit: '+' },
        { label: 'Sites Shipped', value: 25, unit: '+' },
        { label: 'Stack Depth', value: 5, unit: 'layers' },
        { label: 'On-Call', value: 24, unit: 'hr' },
        { label: 'Uptime', value: 99, unit: '%' },
        { label: 'Languages', value: 4, unit: '' }
      ],
      techStack: ['PHP', 'MySQL', 'JavaScript', 'jQuery', 'Apache', 'Linux', 'Bash', 'FTP'],
      keyAchievements: [
        'Ran production on physical servers without a safety net',
        'Shipped and maintained dozens of sites end to end',
        'Learned the stack from kernel to browser',
        'Handled incidents personally, at any hour',
        'Built the operational instincts everything since has rested on'
      ]
    }
  ],
  RU: [
    {
      details: [
        'Отвечал за Kubernetes-платформу и GitOps-модель поставки на неё. Продуктовые команды запрашивают namespace и получают квоты, сетевые политики, ingress, TLS и мониторинг уже связанными вместе — это держит их вне внутренностей кластера, а обновления кластера остаются планируемыми.',
        'Завершил перевод остатков legacy с физических серверов в гибридную инфраструктуру на AWS и GCP. Расходы на обслуживание упали на 30-40%, но полезнее оказалось то, что инфраструктура наконец стала существовать в виде кода, а не в виде памяти сотрудников.'
      ],
      highlights: [
        { label: 'Целевой аптайм', value: 99.9, unit: '%' },
        { label: 'Стоимость обслуживания', value: 35, unit: '% сэкономлено' },
        { label: 'Управляемых сервисов', value: 60, unit: '+' },
        { label: 'Обновлений кластера', value: 4, unit: '/год' },
        { label: 'Заведение namespace', value: 4, unit: 'мин' },
        { label: 'Облачных провайдеров', value: 2, unit: '' }
      ],
      techStack: ['Kubernetes', 'Terraform', 'ArgoCD', 'Helm', 'AWS', 'GCP', 'Prometheus', 'Linux'],
      keyAchievements: [
        'Завершил уход с bare-metal в гибридное облако',
        'Сократил расходы на обслуживание инфраструктуры на 30-40%',
        'Превратил обновление кластера в плановое событие, а не в инцидент',
        'Перевёл все окружения на инфраструктуру как код',
        'Сократил выдачу namespace с заявки до четырёх минут'
      ]
    },
    {
      details: [
        'Стандартизировал поставку для десятков микросервисов, каждый из которых успел отрастить собственный пайплайн. Один шаблон, подключаемый объявлением типа сервиса, заменил набор копий, разошедшихся сразу после дублирования.',
        'Время релиза упало с многодневного согласованного события примерно до пятнадцати минут, выкатка без простоя. Назвать стоит эффект второго порядка: как только релиз стал дёшев, команды начали выпускать меньшие изменения чаще, а именно это снижает количество инцидентов.'
      ],
      highlights: [
        { label: 'Время релиза', value: 15, unit: 'мин' },
        { label: 'Было', value: 48, unit: 'ч' },
        { label: 'Сервисов охвачено', value: 40, unit: '+' },
        { label: 'Простой', value: 0, unit: '' },
        { label: 'Шаблонов пайплайна', value: 4, unit: '' },
        { label: 'Откат', value: 90, unit: 'с' }
      ],
      techStack: ['GitLab CI', 'Jenkins', 'Docker', 'Kubernetes', 'Helm', 'Ansible', 'Bash', 'Linux'],
      keyAchievements: [
        'Сократил время релиза с дней примерно до пятнадцати минут',
        'Стандартизировал CI/CD для десятков сервисов',
        'Сделал развёртывание без простоя поведением по умолчанию',
        'Добавил сканирование зависимостей и образов в каждый пайплайн',
        'Превратил откат в смену маршрута за девяносто секунд'
      ]
    },
    {
      details: [
        'Бэкенд и фронтенд одного продукта плюс инфраструктура под ним — та самая схема, при которой слово DevOps начинает что-то значить, а не быть названием должности. Владение деплоем меняет то, как ты пишешь код.',
        'Основные инженерные усилия ушли в слой базы данных под растущей нагрузкой: потоковая репликация, чтобы снять чтение с мастера, партиционирование, чтобы удержать горячий набор небольшим, и иерархия кэшей с продуманной инвалидацией ещё до появления самого кэша.'
      ],
      highlights: [
        { label: 'Запрос p99', value: 25, unit: 'ms' },
        { label: 'Реплик на чтение', value: 3, unit: '' },
        { label: 'Уровней кэша', value: 4, unit: '' },
        { label: 'Разгрузка origin', value: 88, unit: '%' },
        { label: 'Сервисов во владении', value: 6, unit: '' },
        { label: 'Попаданий в кэш', value: 94, unit: '%' }
      ],
      techStack: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'React', 'TypeScript', 'Docker', 'NGINX'],
      keyAchievements: [
        'Отмасштабировал слой БД через репликацию и партиционирование',
        'Спроектировал четырёхуровневый кэш с явной инвалидацией',
        'Снял чтение с мастера без правок в приложении',
        'Владел сервисами целиком, от схемы до деплоя',
        'Сократил p99 запросов чтением планов, а не добавлением железа'
      ]
    },
    {
      details: [
        'Эпоха монолита на классической виртуализации. Деплой руками, окружения собирались вручную, и каждый инцидент упирался в шаг, который кто-то выполнил чуть иначе, чем в прошлый раз.',
        'Отсюда и вырос инстинкт к автоматизации. Каждая повторяющаяся задача уходила в скрипт, каждый скрипт — под контроль версий, а расхождение между тем, что написано в инструкции, и тем, как выглядит продакшен, стало невозможно игнорировать.'
      ],
      highlights: [
        { label: 'Шагов деплоя', value: 30, unit: '' },
        { label: 'Автоматизировано', value: 80, unit: '%' },
        { label: 'Окружений', value: 3, unit: '' },
        { label: 'Частота релизов', value: 2, unit: '/мес' },
        { label: 'Ручных ошибок', value: 70, unit: '% сэкономлено' },
        { label: 'Скриптов написано', value: 40, unit: '+' }
      ],
      techStack: ['PHP', 'Symfony', 'MySQL', 'JavaScript', 'Bash', 'Linux', 'Apache', 'Git'],
      keyAchievements: [
        'Перевёл ручной процесс деплоя в скрипты',
        'Завёл настройку окружений под контроль версий',
        'Существенно сократил ошибки человека при выкатке',
        'Установил первый повторяемый ритм релизов',
        'Задокументировал продакшен таким, каким он был на самом деле'
      ]
    },
    {
      details: [
        'LAMP на физических серверах — а значит, изучение стека снизу вверх, потому что прятаться было не за какой управляемый слой. Кончился диск — чистишь сам. Ночью упал сервис — поднимаешь его тоже сам.',
        'Сегодня немодно и при этом самый полезный период из пятнадцати. Любая пришедшая позже абстракция — контейнеры, оркестраторы, управляемые базы — понимается легче, когда ты уже отлаживал то, что она заменила.'
      ],
      highlights: [
        { label: 'Серверов под управлением', value: 20, unit: '+' },
        { label: 'Сайтов выпущено', value: 25, unit: '+' },
        { label: 'Глубина стека', value: 5, unit: 'слоёв' },
        { label: 'Дежурство', value: 24, unit: 'ч' },
        { label: 'Аптайм', value: 99, unit: '%' },
        { label: 'Языков', value: 4, unit: '' }
      ],
      techStack: ['PHP', 'MySQL', 'JavaScript', 'jQuery', 'Apache', 'Linux', 'Bash', 'FTP'],
      keyAchievements: [
        'Держал продакшен на физических серверах без страховки',
        'Выпустил и сопровождал десятки сайтов целиком',
        'Изучил стек от ядра до браузера',
        'Разбирал инциденты лично, в любое время суток',
        'Наработал операционные рефлексы, на которых стоит всё дальнейшее'
      ]
    }
  ]
};

export const ACHIEVEMENT_DETAIL = {
  // No public records. Every entry describes work inside an employer, or —
  // for the conference entry — attendance and floor discussion, which is what
  // actually happened and is not a claim on a published speaker programme.
  EN: [
    {
      title: 'Off Bare Metal',
      details: [
        'Moved a legacy estate off physical servers and classic virtualisation into a hybrid AWS/GCP footprint. The first phase was discovery rather than provisioning, because no complete inventory of the old estate existed anywhere except in people’s heads.',
        'Maintenance spend fell 30-40%. The more durable outcome was that the infrastructure ended the migration described as code, which is what made every later change reviewable instead of remembered.'
      ],
      links: {}
    },
    {
      title: 'Release Time: Days to Minutes',
      details: [
        'Standardised CI/CD across dozens of microservices that had each grown a private pipeline. One template, opted into by declaring a service type, replaced a set of copies that drifted apart the moment they were duplicated.',
        'Deployment went from a multi-day coordinated event to roughly fifteen minutes with no downtime. The second-order effect mattered more: cheap releases mean smaller changes shipped more often, and smaller changes are what actually reduces incidents.'
      ],
      links: {}
    },
    {
      title: 'Conferences and Community',
      details: [
        'A regular at HighLoad++, DevOpsConf and regional meetups through the years the industry was rebuilding itself — as a practitioner in the room rather than a billed speaker.',
        'Took the floor in discussions on migrating a monolith without stopping the business, building resilient CI/CD before Docker was ubiquitous, and tuning databases under load. The value of those rooms was rarely the talks; it was the arguments afterwards with people solving the same problem differently.'
      ],
      links: {}
    },
    {
      title: 'Infrastructure as Code',
      details: [
        'Automated configuration management and environment provisioning end to end, so development, staging and production became reproducible rather than hand-assembled artefacts that had drifted apart over years.',
        'The honest test of this work is destroying a non-production environment and rebuilding it. Once that stopped being frightening, the human factor had genuinely been removed rather than merely documented.'
      ],
      links: {}
    },
    {
      title: 'Databases Under Load',
      details: [
        'Tuned relational and non-relational stores for highload: streaming replication to take reads off the primary, partitioning to keep the hot set small, and sharding where a single writer had become the ceiling.',
        'Most of the improvement came from reading execution plans rather than adding capacity — a missing composite index, a query sorting before filtering, an ORM fetching a hundred rows to count them. Hardware hides those for a quarter and then stops.'
      ],
      links: {}
    },
    {
      title: 'DevOps as a Practice',
      details: [
        'Became the link between development and operations back when those were separate departments with separate incentives, and a release was a negotiation between them rather than a pipeline stage.',
        'The work was as much cultural as technical: getting developers to care what happens after merge, and operations to accept change as normal rather than as risk. Mentored engineers on both sides of that line.'
      ],
      links: {}
    },
    {
      title: 'First Production Commit',
      details: [
        'A PHP application on a physical server, deployed over FTP. There was no review, no tests, and no way back if it went wrong. It worked. Mostly.',
        'That period is unfashionable now and remains the most useful of the fifteen years. Every abstraction that came later is easier to reason about when you have already debugged the thing it replaced.'
      ],
      links: {}
    }
  ],
  RU: [
    {
      title: 'Уход с bare-metal',
      details: [
        'Перевёл legacy-инфраструктуру с физических серверов и классической виртуализации в гибридное облако на AWS и GCP. Первой фазой было обнаружение, а не провижининг: полной описи старого хозяйства не существовало нигде, кроме как в головах людей.',
        'Расходы на обслуживание упали на 30-40%. Более долговечным результатом стало то, что к концу миграции инфраструктура была описана кодом — и именно это сделало каждое последующее изменение проверяемым, а не вспоминаемым.'
      ],
      links: {}
    },
    {
      title: 'Релиз: с дней до минут',
      details: [
        'Стандартизировал CI/CD для десятков микросервисов, каждый из которых отрастил собственный пайплайн. Один шаблон, подключаемый объявлением типа сервиса, заменил набор копий, разошедшихся сразу после дублирования.',
        'Развёртывание превратилось из многодневного согласованного события примерно в пятнадцать минут без простоя. Эффект второго порядка оказался важнее: дешёвый релиз означает меньшие изменения чаще, а именно это снижает число инцидентов.'
      ],
      links: {}
    },
    {
      title: 'Конференции и сообщество',
      details: [
        'Постоянный участник HighLoad++, DevOpsConf и региональных митапов в годы, когда индустрия себя перестраивала — как практик из зала, а не заявленный докладчик.',
        'Выступал в обсуждениях о миграции монолита без остановки бизнеса, построении устойчивых CI/CD до повсеместного Docker и тюнинге баз под нагрузкой. Ценность этих залов редко была в докладах; она была в спорах после, с людьми, решавшими ту же задачу иначе.'
      ],
      links: {}
    },
    {
      title: 'Инфраструктура как код',
      details: [
        'Автоматизировал управление конфигурациями и развёртывание сред целиком, чтобы development, staging и production стали воспроизводимыми, а не собранными вручную артефактами, разошедшимися за годы.',
        'Честная проверка этой работы — снести непродакшен-окружение и собрать заново. Когда это перестало быть страшным, человеческий фактор оказался действительно устранён, а не просто задокументирован.'
      ],
      links: {}
    },
    {
      title: 'Базы под нагрузкой',
      details: [
        'Настраивал реляционные и нереляционные хранилища под highload: потоковая репликация, чтобы снять чтение с мастера, партиционирование, чтобы удержать горячий набор небольшим, и шардирование там, где единственный писатель стал потолком.',
        'Основная часть улучшений пришла от чтения планов выполнения, а не от добавления мощности: отсутствующий составной индекс, запрос с сортировкой до фильтрации, ORM, вытягивающий сотню строк ради подсчёта. Железо прячет такое на квартал, а потом перестаёт.'
      ],
      links: {}
    },
    {
      title: 'DevOps как практика',
      details: [
        'Стал связующим звеном между разработкой и эксплуатацией тогда, когда это были разные отделы с разными интересами, а релиз был переговорами между ними, а не стадией пайплайна.',
        'Работа была в равной степени культурной и технической: заставить разработчиков интересоваться тем, что происходит после мержа, а эксплуатацию — принять изменения как норму, а не как риск. Менторил инженеров по обе стороны этой границы.'
      ],
      links: {}
    },
    {
      title: 'Первый коммит в продакшен',
      details: [
        'PHP-приложение на физическом сервере, деплой по FTP. Ни ревью, ни тестов, ни пути назад, если что-то пойдёт не так. Работало. Почти.',
        'Сегодня этот период немоден и остаётся самым полезным из пятнадцати лет. Любая пришедшая позже абстракция понимается легче, когда ты уже отлаживал то, что она заменила.'
      ],
      links: {}
    }
  ]
};
