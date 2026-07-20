export const PROJECTS_DETAIL = {
  EN: {
    'payment-mesh': {
      details: [
        'A multi-region payment orchestration mesh processing over $4 billion in annual transaction volume across 14 geographic regions. The system was designed from the ground up to achieve 99.999% uptime while maintaining sub-10ms p99 latency at 50,000 transactions per second.',
        'Built on Go with Temporal for workflow orchestration, the mesh handles payment routing, currency conversion, fraud pre-screening, and settlement reconciliation. Each region operates independently with eventual consistency guaranteed through Kafka-backed event streaming.',
        'The architecture reduced operational costs by 42% compared to the previous monolithic system while increasing throughput capacity by 8x. The team of 20+ engineers was organized into 3 squads covering payments core, compliance, and infrastructure.'
      ],
      highlights: [
        { label: 'Annual Volume', value: 4, unit: '$B+' },
        { label: 'Regions', value: 14, unit: '' },
        { label: 'Peak TPS', value: 50, unit: 'K' },
        { label: 'Uptime', value: 99.999, unit: '%' },
        { label: 'Latency p99', value: 10, unit: 'ms' },
        { label: 'Cost Reduction', value: 42, unit: '%' }
      ],
      links: { github: 'https://github.com/RF24KRSK/payment-mesh' },
      features: ['Multi-region active-active deployment', 'Real-time FX rate integration', 'Automated settlement reconciliation', 'PCI-DSS Level 1 compliance', 'Circuit breaker with auto-recovery'],
      screenshotType: 'dashboard'
    },
    'fraud-engine': {
      details: [
        'A machine learning fraud detection system operating at 8,000 transactions per second with 99.2% precision and 40ms inference latency. In its first year of deployment, the engine prevented $12 million in fraud losses.',
        'The system uses an ensemble of PyTorch models including temporal graph neural networks for transaction pattern analysis, gradient-boosted trees for rule-based scoring, and a dedicated deep learning model for anomaly detection. Features are served in real-time from a Redis-based feature store.',
        'A continuous learning pipeline retrains models every 6 hours using Kafka-streamed transaction data, ensuring the system adapts to new fraud patterns within minutes of detection. The model monitoring dashboard provides real-time drift detection and performance metrics.'
      ],
      highlights: [
        { label: 'Throughput', value: 8, unit: 'K TPS' },
        { label: 'Precision', value: 99.2, unit: '%' },
        { label: 'Inference', value: 40, unit: 'ms' },
        { label: 'Fraud Saved', value: 12, unit: '$M' },
        { label: 'Models Live', value: 7, unit: '' },
        { label: 'Retrain Cycle', value: 6, unit: 'hr' }
      ],
      links: { github: 'https://github.com/RF24KRSK/fraud-engine' },
      features: ['Ensemble ML model architecture', 'Real-time feature serving at sub-ms', 'Automated model retraining pipeline', 'Drift detection and auto-rollback', 'Explainable AI with SHAP integration'],
      screenshotType: 'dashboard'
    },
    'audit-log': {
      details: [
        'An immutable audit log pipeline processing 1 million events per second with 5-year retention and sub-200ms query performance. Built to meet SOC2 Type II and PCI-DSS compliance requirements for regulated fintech operations.',
        'The pipeline uses Rust for the ingestion layer, achieving zero-GC overhead and predictable latency under load. Events flow through Kafka for buffering and are stored in ClickHouse for analytical queries, with S3-based cold storage for data older than 90 days.',
        'Cryptographic chain-linking ensures tamper evidence: each batch of events includes a Merkle root hash of the previous batch, making retrospective modification computationally infeasible. Query performance is maintained through materialized views and a custom partitioning strategy.'
      ],
      highlights: [
        { label: 'Throughput', value: 1, unit: 'M/s' },
        { label: 'Retention', value: 5, unit: 'yrs' },
        { label: 'Query Latency', value: 200, unit: 'ms' },
        { label: 'Storage', value: 500, unit: 'TB+' },
        { label: 'Compliance', value: 2, unit: 'standards' },
        { label: 'Data Nodes', value: 12, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/audit-pipeline' },
      features: ['Cryptographic tamper evidence', 'Multi-tier storage with auto-tiering', 'Sub-200ms analytical queries', 'Real-time reconciliation hooks', 'Automated compliance reporting'],
      screenshotType: 'dashboard'
    },
    'compliance': {
      details: [
        'A policy-driven compliance engine evaluating up to 4,000 rules per transaction in under 5 milliseconds. The system automates regulatory reporting across multiple jurisdictions, reducing manual compliance effort by 80%.',
        'Built with Go and OpenPolicyAgent for rule evaluation, the engine supports both real-time transaction screening and batch retroactive analysis. Rules are authored in Rego DSL and version-controlled through Git, following a strict review-and-promote workflow.',
        'The system integrates with 12 regulatory APIs across 5 jurisdictions, automatically filing reports and flagging exceptions. A dashboard provides real-time compliance posture visibility with drill-down to individual rule evaluations.'
      ],
      highlights: [
        { label: 'Rules/Tx', value: 4, unit: 'K' },
        { label: 'Eval Time', value: 5, unit: 'ms' },
        { label: 'Jurisdictions', value: 5, unit: '' },
        { label: 'Manual Effort', value: 80, unit: '% saved' },
        { label: 'Rules Authored', value: 2, unit: 'K+' },
        { label: 'API Integrations', value: 12, unit: '' }
      ],
      links: {},
      features: ['Realtime and batch evaluation modes', 'Git-versioned rule management', 'Multi-jurisdiction regulatory filing', 'Drill-down audit trail', 'Sandboxed rule testing environment'],
      screenshotType: 'dashboard'
    },
    'ledger': {
      details: [
        'An embedded double-entry ledger service processing 200,000 entries per second per node with strict ACID guarantees. Designed for payment flows requiring real-time reconciliation and audit-grade transaction records.',
        'Built in Rust with SQLite at its core, the ledger uses a custom WAL architecture that enables concurrent read-write operations without contention. Communication between nodes happens via gRPC with NATS for event broadcasting.',
        'The system supports multi-currency accounting with automatic FX conversion tracking, memo-post patterns for two-phase settlement, and real-time balance computation via materialized aggregation. Each node can operate independently during network partitions.'
      ],
      highlights: [
        { label: 'Entries/s', value: 200, unit: 'K' },
        { label: 'Nodes', value: 16, unit: '' },
        { label: 'Reconciliation', value: 'Real-time', unit: '' },
        { label: 'ACID', value: 'Strict', unit: '' },
        { label: 'Currencies', value: 24, unit: '' },
        { label: 'Data Size', value: 50, unit: 'TB+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/rust-ledger' },
      features: ['Strict ACID with concurrent reads', 'Multi-currency with FX tracking', 'Partition-tolerant architecture', 'Real-time balance aggregation', 'gRPC + NATS transport layer'],
      screenshotType: 'dashboard'
    },
    'billing': {
      details: [
        'A real-time usage-based billing platform processing 10,000 metering events per second with 99.99% invoice accuracy and sub-minute latency from event ingestion to invoice line item.',
        'The system meters usage across compute, storage, API calls, and seat-based pricing models. Events are ingested via Kafka, aggregated in Redis with hourly snapshots to PostgreSQL, and billed through Stripe with custom webhook integration.',
        'A real-time dashboard gives customers visibility into their current usage and projected costs, with configurable budget alerts that trigger at 50%, 80%, and 100% of budget thresholds. The platform supports both prepaid and postpaid billing models.'
      ],
      highlights: [
        { label: 'Events/s', value: 10, unit: 'K' },
        { label: 'Accuracy', value: 99.99, unit: '%' },
        { label: 'Invoice Latency', value: 1, unit: 'min' },
        { label: 'Customers', value: 500, unit: 'K+' },
        { label: 'Pricing Models', value: 4, unit: '' },
        { label: 'Integration', value: 'Stripe', unit: '' }
      ],
      links: {},
      features: ['Real-time usage metering', 'Multi-model pricing engine', 'Customer budget alerts', 'Prepaid + postpaid billing', 'Stripe webhook integration'],
      screenshotType: 'dashboard'
    },
    'kyc-orch': {
      details: [
        'A KYC document verification orchestrator processing over 300,000 verifications with a 95% auto-approval rate, reducing manual review workload by 40% compared to the incumbent solution.',
        'The pipeline uses AWS Textract for document OCR, a custom ML model for forgery detection, and integrates with 5 identity verification providers. A Step Functions state machine orchestrates the workflow with automatic fallback between providers.',
        'The system includes a comprehensive admin dashboard for manual review of edge cases, with AI-suggested decisions based on similar historical cases. Average verification time dropped from 24 hours to 3 minutes for auto-approved cases.'
      ],
      highlights: [
        { label: 'Verifications', value: 300, unit: 'K+' },
        { label: 'Auto-Approval', value: 95, unit: '%' },
        { label: 'Faster vs Incumbent', value: 40, unit: '%' },
        { label: 'Verification Time', value: 3, unit: 'min' },
        { label: 'Providers', value: 5, unit: '' },
        { label: 'Forgery Detection', value: 'ML-based', unit: '' }
      ],
      links: {},
      features: ['Multi-provider orchestration', 'ML-based forgery detection', 'Auto-fallback between providers', 'AI-assisted manual review', 'Real-time verification status'],
      screenshotType: 'dashboard'
    },
    'ml-platform': {
      details: [
        'An internal ML training platform serving 200+ data scientists, providing distributed training, automated hyperparameter tuning, and a centralized model registry. The platform tripled team velocity in its first year.',
        'Built on Python with PyTorch and Ray, the platform abstracts away infrastructure complexity. Data scientists define experiments in YAML configuration files, and the platform handles GPU allocation, distributed training orchestration, and experiment tracking.',
        'The model registry supports versioning, staging promotion (dev → staging → production), A/B testing configuration, and automated rollback. Integration with CI/CD pipelines enables continuous training and deployment with approval gates.'
      ],
      highlights: [
        { label: 'Users', value: 200, unit: '+' },
        { label: 'Velocity Gain', value: 3, unit: 'x' },
        { label: 'Models in Prod', value: 50, unit: '+' },
        { label: 'GPU Cluster', value: 64, unit: 'GPUs' },
        { label: 'Experiments/Month', value: 500, unit: '+' },
        { label: 'Training Jobs', value: 200, unit: '/day' }
      ],
      links: { github: 'https://github.com/RF24KRSK/ml-platform' },
      features: ['YAML-based experiment config', 'Distributed GPU training', 'Automated hyperparameter tuning', 'Model registry with staging', 'CI/CD integration for ML'],
      screenshotType: 'dashboard'
    },
    'feature-store': {
      details: [
        'A real-time feature store serving both online and offline ML workloads with p99 online retrieval latency of 2ms across 10,000 features and 1TB/day throughput.',
        'Built with Go for the serving layer, Redis for online storage, Kafka for streaming feature computation, and S3 for offline batch storage. Flink processes streaming feature pipelines with exactly-once semantics.',
        'The feature store supports time-travel queries for historical feature values, point-in-time joins for training dataset creation, and automatic feature validation with drift detection. Feature discovery is enabled through an integrated catalog with search and lineage tracking.'
      ],
      highlights: [
        { label: 'Features', value: 10, unit: 'K' },
        { label: 'Online p99', value: 2, unit: 'ms' },
        { label: 'Throughput', value: 1, unit: 'TB/day' },
        { label: 'Teams Using', value: 15, unit: '' },
        { label: 'Streaming Pipelines', value: 40, unit: '' },
        { label: 'Time-Travel', value: '7-day', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/feature-store' },
      features: ['Online/offline unified serving', 'Time-travel queries', 'Auto feature validation', 'Feature catalog with lineage', 'Streaming computation with Flink'],
      screenshotType: 'dashboard'
    },
    'model-mesh': {
      details: [
        'A multi-model serving mesh supporting 50+ model types with auto-scaling to zero and sub-10ms p50 inference latency. The mesh provides a unified inference API across PyTorch, TensorFlow, ONNX, and custom models.',
        'Built on Kubernetes with Triton Inference Server, the mesh uses Envoy for traffic routing and canary deployments. Custom autoscalers detect inference patterns and scale pods from zero to hundreds within seconds based on queue depth.',
        'The mesh includes model versioning with A/B testing support, shadow traffic for validation, and automated performance monitoring. A dashboard provides per-model latency, throughput, and error rate metrics with drill-down to individual inference requests.'
      ],
      highlights: [
        { label: 'Model Types', value: 50, unit: '+' },
        { label: 'Inference p50', value: 10, unit: 'ms' },
        { label: 'Scale-to-Zero', value: true, unit: '' },
        { label: 'Requests/Day', value: 100, unit: 'M+' },
        { label: 'Frameworks', value: 4, unit: '' },
        { label: 'Canary Stages', value: 3, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/model-mesh' },
      features: ['Multi-framework inference', 'Auto-scaling to zero', 'Canary deployments', 'Shadow traffic validation', 'Per-model monitoring dashboard'],
      screenshotType: 'dashboard'
    },
    'nlp-pipe': {
      details: [
        'A document NLP pipeline processing 10 million documents per day with NER, classification, and summarization capabilities, achieving 94% F1 score across 12 document types.',
        'Built with Python using HuggingFace Transformers, the pipeline uses a fine-tuned BERT-based model for NER and classification, and a T5 variant for abstractive summarization. Documents are ingested via a FastAPI service and processed asynchronously through a Celery task queue.',
        'Results are indexed in Elasticsearch for full-text search with faceted navigation. The pipeline supports custom ontologies and can be retrained on domain-specific data within hours through a web-based training interface.'
      ],
      highlights: [
        { label: 'Throughput', value: 10, unit: 'M/day' },
        { label: 'F1 Score', value: 94, unit: '%' },
        { label: 'Doc Types', value: 12, unit: '' },
        { label: 'Model Size', value: 350, unit: 'M params' },
        { label: 'Inference', value: 200, unit: 'ms/doc' },
        { label: 'Search Index', value: 'Elasticsearch', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/nlp-pipeline' },
      features: ['Multi-task NLP (NER+classification+summarization)', 'Fine-tuned transformer models', 'Custom ontology support', 'Web-based model retraining', 'Full-text search with facets'],
      screenshotType: 'dashboard'
    },
    'anomaly': {
      details: [
        'A real-time anomaly detection system monitoring 5,000 financial metric streams with alert latency under 30 seconds and 96% precision. The system detects anomalies across transaction volumes, latency, error rates, and custom business metrics.',
        'Built with Python using Prophet for trend decomposition and statistical models for anomaly scoring. Metrics flow through Kafka to TimescaleDB for storage, with Grafana dashboards for visualization and alerting.',
        'The system learns normal behavior patterns over rolling 7-day and 30-day windows, automatically adjusting thresholds during known events like product launches or marketing campaigns. An alert fatigue reduction mechanism groups related alerts into incidents.'
      ],
      highlights: [
        { label: 'Metric Streams', value: 5, unit: 'K' },
        { label: 'Alert Latency', value: 30, unit: 's' },
        { label: 'Precision', value: 96, unit: '%' },
        { label: 'Data Points/Day', value: 500, unit: 'M+' },
        { label: 'Auto-Thresholds', value: true, unit: '' },
        { label: 'Alert Grouping', value: 'Smart', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/anomaly-detection' },
      features: ['Prophet-based trend decomposition', 'Auto-adaptive thresholds', 'Alert fatigue reduction', 'Grafana integration', 'Multi-metric correlation'],
      screenshotType: 'dashboard'
    },
    'data-lake': {
      details: [
        'A streaming data lake processing 500TB per day with a custom Rust pipeline that replaced the previous Spark-based architecture, achieving 12x throughput improvement and 80% reduction in infrastructure costs.',
        'The system ingests data from 200+ sources through Kafka, processes it with a Rust pipeline that performs schema inference, data quality validation, and partitioning optimization before storing in S3 with Iceberg table format.',
        'Trino provides federated SQL querying across the data lake, data warehouse, and real-time streams, enabling analysts to join historical and live data in a single query. The platform serves 50+ analytics teams across the organization.'
      ],
      highlights: [
        { label: 'Throughput', value: 500, unit: 'TB/day' },
        { label: 'Speedup', value: 12, unit: 'x' },
        { label: 'Cost Reduction', value: 80, unit: '%' },
        { label: 'Data Sources', value: 200, unit: '+' },
        { label: 'Analytics Teams', value: 50, unit: '+' },
        { label: 'Query Engine', value: 'Trino', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/rust-data-lake' },
      features: ['Custom Rust ingestion pipeline', 'Schema inference and validation', 'Iceberg table format', 'Federated SQL querying', 'Auto-tiering to cold storage'],
      screenshotType: 'graph'
    },
    'migration-kit': {
      details: [
        'An enterprise monolith-to-microservices migration toolkit used in 6 enterprise engagements, successfully migrating 150+ services with zero-downtime cutover. The toolkit reduces migration risk through automated analysis, gateway-based strangler fig pattern, and canary rollout.',
        'Built with Go, the toolkit includes a dependency analyzer that maps service boundaries, an API gateway (Envoy) for traffic splitting between old and new systems, and a Kafka event bridge for data synchronization during migration.',
        'Each migration follows a proven pattern: analyze → boundary identification → strangler fig → data sync → traffic shift → cutover. Automated rollback capability ensures any phase can be reversed within seconds.'
      ],
      highlights: [
        { label: 'Services Migrated', value: 150, unit: '+' },
        { label: 'Enterprises', value: 6, unit: '' },
        { label: 'Downtime', value: 0, unit: '' },
        { label: 'Migration Phases', value: 6, unit: '' },
        { label: 'Rollback Time', value: 5, unit: 's' },
        { label: 'Team Size', value: 8, unit: '/project' }
      ],
      links: { github: 'https://github.com/RF24KRSK/migration-kit' },
      features: ['Dependency graph analyzer', 'Strangler fig gateway pattern', 'Auto data sync with Kafka bridge', 'Canary traffic shifting', 'Instant rollback capability'],
      screenshotType: 'graph'
    },
    'k8s-operators': {
      details: [
        'A suite of 6 Kubernetes operators for database provisioning, canary deployments, secret rotation, and certificate management. The suite has earned 1,000+ GitHub stars and is deployed in production at 50+ companies.',
        'Written in Go using the controller-runtime library, each operator follows best practices for reconciliation, status reporting, and metrics exposure. The operators are deployed via Helm charts with extensive configuration options.',
        'Key operators include: PostgreSQL cluster operator with automated backup/restore, canary deployment operator with progressive traffic shifting, and Vault secret rotation operator with scheduled and on-demand rotation policies.'
      ],
      highlights: [
        { label: 'GitHub Stars', value: 1, unit: 'K+' },
        { label: 'Operators', value: 6, unit: '' },
        { label: 'Companies', value: 50, unit: '+' },
        { label: 'Helm Charts', value: 12, unit: '' },
        { label: 'Custom Resources', value: 18, unit: '' },
        { label: 'Downloads', value: 100, unit: 'K+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/k8s-operators' },
      features: ['PostgreSQL cluster lifecycle management', 'Canary deployment with traffic shifting', 'Automated secret rotation', 'Certificate auto-renewal', 'Prometheus metrics integration'],
      screenshotType: 'terminal'
    },
    'cicd': {
      details: [
        'An internal self-serve CI/CD platform used by 40+ engineering teams, processing 2,000 builds per day with an 8-minute median build time and 99.9% uptime.',
        'Built on Tekton for pipeline execution and ArgoCD for GitOps deployment, the platform provides a web-based pipeline builder where teams define their pipelines using a drag-and-drop interface. Harbor provides container image registry with vulnerability scanning.',
        'The platform integrates with GitHub, GitLab, and Bitbucket, providing unified webhook handling, status reporting, and deployment tracking. A dashboard gives executives visibility into deployment frequency, lead time, and change failure rate across all teams.'
      ],
      highlights: [
        { label: 'Teams', value: 40, unit: '+' },
        { label: 'Builds/Day', value: 2, unit: 'K' },
        { label: 'Median Build', value: 8, unit: 'min' },
        { label: 'Uptime', value: 99.9, unit: '%' },
        { label: 'Git Integrations', value: 3, unit: '' },
        { label: 'Pipelines', value: 500, unit: '+' }
      ],
      links: {},
      features: ['Drag-and-drop pipeline builder', 'GitOps with ArgoCD', 'Container vulnerability scanning', 'Multi-Git-provider support', 'Executive DORA metrics dashboard'],
      screenshotType: 'dashboard'
    },
    'service-mesh': {
      details: [
        'A multi-cluster service mesh spanning 3 regions with mutual TLS, traffic shifting, and comprehensive observability. The mesh reduced cross-team incidents by 95% through standardized communication patterns.',
        'Built on Istio with Envoy sidecars, the mesh provides uniform traffic management, security, and observability across Kubernetes clusters in US East, EU West, and Asia Pacific. All inter-service communication uses mTLS with automatic certificate rotation.',
        'The mesh includes a global rate limiting service, circuit breakers with automatic recovery, and distributed tracing across all clusters. A unified Grafana dashboard shows service health, dependency graph, and SLO compliance across regions.'
      ],
      highlights: [
        { label: 'Regions', value: 3, unit: '' },
        { label: 'Services', value: 200, unit: '+' },
        { label: 'mtls', value: '100%', unit: '' },
        { label: 'Incident Reduction', value: 95, unit: '%' },
        { label: 'Cert Rotation', value: 'Auto 24h', unit: '' },
        { label: 'Observability', value: 'Full', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/service-mesh' },
      features: ['Automatic mTLS with rotation', 'Global rate limiting', 'Cross-cluster tracing', 'Canary + blue-green deployments', 'Unified multi-region dashboard'],
      screenshotType: 'graph'
    },
    'paas': {
      details: [
        'A self-serve multi-cloud application platform enabling developers to go from commit to production in 12 minutes — down from 2 days prior. The platform supports AWS, GCP, and Azure with 200+ applications running in production.',
        'Built with Go, Terraform, Pulumi, and Crossplane, the platform abstracts cloud provider differences behind a unified API. Developers define their application requirements in a manifest file, and the platform handles infrastructure provisioning, service mesh injection, and monitoring setup.',
        'The platform includes integrated secrets management, automatic SSL certificate provisioning through Let\'s Encrypt, and a service catalog with 50+ pre-configured backing services including databases, queues, and caches.'
      ],
      highlights: [
        { label: 'Deploy Time', value: 12, unit: 'min' },
        { label: 'Previous Time', value: 48, unit: 'hr' },
        { label: 'Apps Running', value: 200, unit: '+' },
        { label: 'Cloud Providers', value: 3, unit: '' },
        { label: 'Backing Services', value: 50, unit: '+' },
        { label: 'Devs Using', value: 300, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/multi-cloud-paas' },
      features: ['Unified multi-cloud API', 'Manifest-based deployment', 'Integrated secrets management', 'Auto SSL provisioning', '50+ pre-configured services'],
      screenshotType: 'terminal'
    },
    'kubedbg': {
      details: [
        'An interactive Kubernetes Pod debugging CLI tool with 2,400+ GitHub stars and 300+ forks, used by 50+ companies including 2 FAANG organizations. The tool provides a debug shell into any Pod without requiring special container images or RBAC changes.',
        'Built in Go with the Kubernetes client-go library and Cobra CLI framework, kubedbg creates an ephemeral debug container that shares the Pod\'s network namespace, process namespace, and volumes. It supports interactive shell, port forwarding, and file copying.',
        'The tool has been featured in the official Kubernetes blog and CNCF weekly newsletter. Community contributions include zsh completion, VS Code extension, and a web-based terminal mode.'
      ],
      highlights: [
        { label: 'GitHub Stars', value: 2.4, unit: 'K' },
        { label: 'Forks', value: 300, unit: '+' },
        { label: 'Companies', value: 50, unit: '+' },
        { label: 'FAANG Users', value: 2, unit: '' },
        { label: 'CLI Commands', value: 8, unit: '' },
        { label: 'Contributors', value: 30, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/kubectl-debugger', demo: 'https://kubedbg.dev' },
      features: ['Ephemeral debug containers', 'Network namespace sharing', 'File copy in/out', 'Port forwarding', 'VS Code extension'],
      screenshotType: 'terminal'
    },
    'apitest': {
      details: [
        'A declarative API testing framework with 1,800+ GitHub stars and 10,000+ monthly npm downloads. Tests are defined in YAML files, making them readable by both developers and QA engineers.',
        'Built in TypeScript with OpenAPI integration, the framework automatically generates test coverage reports, validates response schemas, and supports data-driven testing with CSV/JSON test data files. It integrates with CI/CD pipelines via CLI or programmatic API.',
        'The framework supports HTTP, GraphQL, and gRPC protocols with built-in mock server capabilities. The community has contributed plugins for OAuth2 authentication flows, database state management, and Slack notification integration.'
      ],
      highlights: [
        { label: 'GitHub Stars', value: 1.8, unit: 'K' },
        { label: 'npm Downloads', value: 10, unit: 'K/mo' },
        { label: 'Contributors', value: 40, unit: '+' },
        { label: 'Protocols', value: 3, unit: '' },
        { label: 'Plugins', value: 12, unit: '' },
        { label: 'CI Integrations', value: 5, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/api-test-framework' },
      features: ['YAML-based test definitions', 'OpenAPI schema validation', 'Multi-protocol (HTTP/GraphQL/gRPC)', 'Built-in mock server', 'Data-driven testing'],
      screenshotType: 'terminal'
    },
    'dbmate': {
      details: [
        'A database migration tool with multi-DB support including PostgreSQL, MySQL, SQLite, and ClickHouse. With 1,200+ GitHub stars, it provides dry-run, rollback, and CI integration capabilities out of the box.',
        'Written in Go, dbmate-pro generates migration files in pure SQL or Go DSL, with forward-only (no-edit) policy for audit compliance. Migrations are verified through checksum validation and can be previewed via dry-run mode.',
        'The tool supports branching workflows where developers can test migrations against ephemeral databases, automated verification pipelines, and zero-downtime migration patterns for production deployments.'
      ],
      highlights: [
        { label: 'GitHub Stars', value: 1.2, unit: 'K' },
        { label: 'DB Engines', value: 4, unit: '' },
        { label: 'Downloads', value: 50, unit: 'K+' },
        { label: 'Migration Types', value: 2, unit: '(SQL/Go)' },
        { label: 'CI Integrations', value: 3, unit: '' },
        { label: 'Checksum', value: 'SHA-256', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/dbmate-pro' },
      features: ['Multi-DB engine support', 'SQL + Go DSL migrations', 'Dry-run preview mode', 'Checksum verification', 'Zero-downtime migration patterns'],
      screenshotType: 'terminal'
    },
    'jsval': {
      details: [
        'A high-performance JSON Schema validator built in Rust and compiled to WebAssembly, achieving 5x better performance than pure JavaScript alternatives. With 800+ GitHub stars, it validates millions of schemas daily in production.',
        'The validator uses Rust\'s serde_json for parsing and implements the JSON Schema draft-07 and 2019-09 specifications. WASM compilation enables use in Node.js, browser, and edge runtime environments with minimal overhead.',
        'Performance benchmarks show consistent 5x improvement across all schema complexity levels. The library maintains API compatibility with popular JS validators, enabling drop-in replacement without code changes.'
      ],
      highlights: [
        { label: 'GitHub Stars', value: 800, unit: '+' },
        { label: 'Speedup', value: 5, unit: 'x' },
        { label: 'Spec Versions', value: 2, unit: '' },
        { label: 'Runtime', value: 'WASM', unit: '' },
        { label: 'Downloads', value: 100, unit: 'K+' },
        { label: 'API Compat', value: '100%', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/json-schema-validator' },
      features: ['Rust core with WASM compilation', '5x faster than JS alternatives', 'Drop-in API compatibility', 'Browser + Node + Edge support', 'Draft-07 and 2019-09 support'],
      screenshotType: 'code'
    },
    'tui-kit': {
      details: [
        'A React-based terminal UI component library for building rich CLI applications. With 1,500+ GitHub stars and 12 reusable components, it brings modern UI paradigms to the terminal.',
        'Built with TypeScript, Ink, and React, the library provides components for tables, forms, spinners, progress bars, text inputs, select menus, and notification toasts. Each component supports custom themes and keyboard navigation.',
        'The library powers CLI tools at several companies, including deployment dashboards, database management UIs, and CI pipeline monitors. Documentation includes interactive examples that run directly in the terminal.'
      ],
      highlights: [
        { label: 'GitHub Stars', value: 1.5, unit: 'K' },
        { label: 'Components', value: 12, unit: '' },
        { label: 'Framework', value: 'React/Ink', unit: '' },
        { label: 'Companies Using', value: 15, unit: '+' },
        { label: 'npm Downloads', value: 20, unit: 'K/mo' },
        { label: 'Themes', value: 8, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/terminal-ui-kit' },
      features: ['12 reusable TUI components', 'React + Ink architecture', 'Custom theming support', 'Keyboard navigation', 'Interactive terminal examples'],
      screenshotType: 'terminal'
    },
    'did': {
      details: [
        'A decentralized identity protocol using zero-knowledge proofs for DeFi compliance. With 300,000+ identities issued and 60% lower KYC costs compared to traditional providers, the protocol was audited by Trail of Bits.',
        'Built with Solidity for on-chain verification, Go for the off-chain operator, and IPFS for identity document storage, the protocol enables users to prove their identity attributes without revealing underlying data. ZK-SNARK circuits were developed using Circom.',
        'The protocol integrates with 5 major DeFi protocols and 3 centralized exchanges for seamless identity verification. A governance DAO manages protocol parameters, identity approvers, and fee structures.'
      ],
      highlights: [
        { label: 'Identities', value: 300, unit: 'K+' },
        { label: 'KYC Cost Reduction', value: 60, unit: '%' },
        { label: 'ZK Proof Time', value: 60, unit: 'ms' },
        { label: 'Audit', value: 'ToB', unit: '' },
        { label: 'DeFi Integrations', value: 8, unit: '' },
        { label: 'DAO Members', value: 500, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/did-protocol' },
      features: ['Zero-knowledge identity proofs', 'Off-chain + on-chain architecture', 'Trail of Bits audited', 'Multi-DAO governance', 'DeFi + CEX integration'],
      screenshotType: 'blocks'
    },
    'defi-analytics': {
      details: [
        'An on-chain analytics platform monitoring 15 DeFi protocols across 5 chains with real-time TVL, volume, and wallet tracking. The platform provides 50 dashboards for protocol teams, investors, and researchers.',
        'Built with Python, Web3.py, and Dune Analytics integration, the platform indexes blockchain data into PostgreSQL for flexible querying. A GraphQL API serves frontend dashboards and enables custom reporting via SQL.',
        'Key features include wallet profiling with entity clustering, transaction simulation for MEV analysis, and cross-protocol risk aggregation. Alerts notify users of anomalous on-chain activity within 2 blocks of confirmation.'
      ],
      highlights: [
        { label: 'Protocols', value: 15, unit: '' },
        { label: 'Chains', value: 5, unit: '' },
        { label: 'Dashboards', value: 50, unit: '' },
        { label: 'TVL Tracked', value: 2.5, unit: '$B+' },
        { label: 'Alert Latency', value: 2, unit: 'blocks' },
        { label: 'API Queries', value: 1, unit: 'M/day' }
      ],
      links: { github: 'https://github.com/RF24KRSK/defi-analytics' },
      features: ['Multi-chain data indexing', 'Real-time wallet profiling', 'MEV transaction simulation', 'Cross-protocol risk analysis', 'GraphQL API with SQL reports'],
      screenshotType: 'dashboard'
    },
    'nft-infra': {
      details: [
        'An NFT minting and metadata infrastructure suite that has minted 500,000+ NFTs with sub-100ms metadata serving and 99.9% uptime. Designed for high-traffic drops and large PFP collections.',
        'Built with Go for the metadata API, NFT.Storage for decentralized metadata persistence, IPFS for content addressing, and Alchemy for on-chain event monitoring. Redis caching ensures metadata is served with consistent sub-100ms latency under load.',
        'The suite includes a minting scheduler with gas optimization, automated metadata generation, and real-time mint tracking. A rarity calculator and trait distribution analyzer help collection creators design balanced attribute sets.'
      ],
      highlights: [
        { label: 'NFTs Minted', value: 500, unit: 'K+' },
        { label: 'Metadata Latency', value: 100, unit: 'ms' },
        { label: 'Uptime', value: 99.9, unit: '%' },
        { label: 'Peak Mint Rate', value: 1, unit: 'K/min' },
        { label: 'Gas Optimization', value: 25, unit: '% savings' },
        { label: 'Collections', value: 40, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/nft-infrastructure' },
      features: ['High-throughput minting engine', 'Gas-optimized scheduling', 'Decentralized metadata storage', 'Real-time mint tracking', 'Rarity and trait analysis'],
      screenshotType: 'blocks'
    },
    'dao-govern': {
      details: [
        'A DAO governance toolkit combining off-chain signaling and on-chain execution, used by 10 DAOs with 200,000+ proposals processed and 75% average voter participation.',
        'Built with Solidity for on-chain execution, TypeScript for the proposal builder interface, and Snapshot integration for gasless off-chain voting. The Graph indexes proposal events for real-time tracking dashboards.',
        'The toolkit supports delegative voting, quadratic voting, and conviction voting mechanisms. A proposal lifecycle manager handles creation, discussion period, voting, execution, and veto phases with configurable parameters per DAO.'
      ],
      highlights: [
        { label: 'DAOs Live', value: 10, unit: '' },
        { label: 'Proposals', value: 200, unit: 'K+' },
        { label: 'Voter Participation', value: 75, unit: '%' },
        { label: 'Voting Types', value: 3, unit: '' },
        { label: 'Gasless Voting', value: true, unit: '' },
        { label: 'Avg. Proposal', value: 72, unit: 'hr cycle' }
      ],
      links: { github: 'https://github.com/RF24KRSK/dao-governance' },
      features: ['Off-chain + on-chain governance', 'Quadratic + conviction voting', 'Proposal lifecycle manager', 'Snapshot integration', 'Real-time tracking dashboards'],
      screenshotType: 'blocks'
    },
    'saas-engine': {
      details: [
        'A self-serve multi-tenant SaaS engine powering 500,000+ businesses with comprehensive tenant isolation, usage-based billing, and real-time analytics — all backed by a 99.99% SLA.',
        'Built with Go for the control plane, React for the admin dashboard, PostgreSQL for tenant data with row-level security, and Redis for rate limiting and session management. Terraform manages tenant-specific infrastructure when isolation requirements demand dedicated resources.',
        'The platform provides tenant onboarding automation, feature flag management, and self-service analytics. A usage metering pipeline tracks every API call, storage byte, and compute cycle for accurate billing and capacity planning.'
      ],
      highlights: [
        { label: 'Active Tenants', value: 500, unit: 'K+' },
        { label: 'SLA', value: 99.99, unit: '%' },
        { label: 'API Requests', value: 100, unit: 'K/s' },
        { label: 'Tenant Onboarding', value: 2, unit: 'min' },
        { label: 'Data Isolation', value: 'RLS + VPC', unit: '' },
        { label: 'Billing Accuracy', value: 99.99, unit: '%' }
      ],
      links: {},
      features: ['Multi-tenant with RLS/network isolation', 'Self-service onboarding', 'Usage metering + billing', 'Feature flag management', 'Real-time tenant analytics'],
      screenshotType: 'dashboard'
    },
    'collab-engine': {
      details: [
        'A CRDT-based real-time collaboration engine supporting 10,000 concurrent editors with sub-50ms conflict resolution. The engine powers a collaborative design tool, competing with Figma in the whiteboard and diagramming space.',
        'Built with TypeScript using Yjs CRDT library for conflict-free data synchronization, WebSockets for real-time communication, ScyllaDB for session persistence, and Redis for presence information.',
        'The engine supports rich text editing, shape manipulation, drawing, and component libraries. An offline mode allows continued editing with automatic sync on reconnection. Undo/redo works across collaborators without conflicts.'
      ],
      highlights: [
        { label: 'Concurrent Editors', value: 10, unit: 'K' },
        { label: 'Conflict Resolution', value: 50, unit: 'ms' },
        { label: 'WebSocket Connections', value: 50, unit: 'K' },
        { label: 'Data Sync', value: 'CRDT', unit: '' },
        { label: 'Undo Depth', value: 'Unlimited', unit: '' },
        { label: 'Supported Elements', value: 20, unit: 'types' }
      ],
      links: { github: 'https://github.com/RF24KRSK/collab-engine' },
      features: ['CRDT-based conflict resolution', 'Offline editing with auto-sync', 'Cross-collaborator undo/redo', 'Rich text + shape manipulation', 'WebSocket + ScyllaDB persistence'],
      screenshotType: 'dashboard'
    },
    'event-sourcing': {
      details: [
        'An event sourcing and CQRS platform handling 500+ event types with 100,000 events per second throughput and exactly-once processing semantics. The platform provides a foundation for building audit-compliant, event-driven systems.',
        'Built with Go, Kafka for event storage with configurable retention policies, PostgreSQL for read model materialization via Debezium CDC, and Kafka Connect for stream processing. The platform includes a schema registry with backward compatibility validation.',
        'Read models are materialized asynchronously and can be rebuilt from scratch using replay. Snapshots prevent unbounded replay times. A monitoring dashboard shows event throughput, consumer lag, and projection progress across all event streams.'
      ],
      highlights: [
        { label: 'Event Types', value: 500, unit: '+' },
        { label: 'Throughput', value: 100, unit: 'K/s' },
        { label: 'Semantics', value: 'Exactly-once', unit: '' },
        { label: 'Consumers', value: 40, unit: '+' },
        { label: 'Snapshot Interval', value: 10, unit: 'K events' },
        { label: 'Read Models', value: 30, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/event-sourcing-platform' },
      features: ['Event sourcing + CQRS pattern', 'Exactly-once processing', 'Schema registry with validation', 'Automatic read model projection', 'Snapshot + replay support'],
      screenshotType: 'graph'
    },
    'api-gateway': {
      details: [
        'A unified API gateway routing traffic to 200+ microservices with rate limiting, authentication, caching, and circuit breaking — handling 200,000 requests per second per node.',
        'Built with Go on top of Envoy Proxy, the gateway provides a plugin system for custom authentication, request transformation, and response enrichment. Redis-backed rate limiting supports both per-client and global quotas.',
        'The gateway includes a developer portal with API documentation auto-generated from OpenAPI specs, interactive API explorer, and API key management. Circuit breaker states are exposed in real-time through a health dashboard.'
      ],
      highlights: [
        { label: 'Services', value: 200, unit: '+' },
        { label: 'Throughput', value: 200, unit: 'K req/s' },
        { label: 'Rate Limits', value: 'Redis-backed', unit: '' },
        { label: 'Latency Added', value: 2, unit: 'ms' },
        { label: 'Auth Methods', value: 5, unit: '' },
        { label: 'Developer Portal', value: 'Auto-docs', unit: '' }
      ],
      links: {},
      features: ['Envoy-based plugin architecture', 'Redis-backed rate limiting', 'Auto-generated API documentation', 'Multi-auth (OAuth2/JWT/API key)', 'Real-time circuit breaker dashboard'],
      screenshotType: 'graph'
    },
    'dev-portal': {
      details: [
        'A Backstage-based internal developer portal with 40+ plugins, cataloging 200 services and serving 1,000+ daily active engineers. The portal provides a unified view of the engineering organization\'s software ecosystem.',
        'Built with React and Backstage framework, TypeScript for plugin development, and GraphQL for unified data access across multiple backend systems including GitHub, Jira, PagerDuty, and Datadog.',
        'The portal enables engineers to discover services, view API documentation, check deployment status, and manage on-call rotations from a single interface. Scorecards track service maturity across reliability, security, and documentation dimensions.'
      ],
      highlights: [
        { label: 'Plugins', value: 40, unit: '+' },
        { label: 'Services Cataloged', value: 200, unit: '' },
        { label: 'Daily Active Engineers', value: 1, unit: 'K+' },
        { label: 'Backend Integrations', value: 8, unit: '' },
        { label: 'Scorecard Dimensions', value: 3, unit: '' },
        { label: 'API Queries', value: 500, unit: 'K/day' }
      ],
      links: { github: 'https://github.com/RF24KRSK/dev-portal' },
      features: ['Backstage-based extensible platform', '40+ integrated plugins', 'Multi-system data aggregation', 'Service maturity scorecards', 'Unified engineer experience'],
      screenshotType: 'dashboard'
    }
  },
  RU: {
    'payment-mesh': {
      details: [
        'Мультирегиональная платежная mesh, обрабатывающая более $4 миллиардов годового транзакционного объема в 14 географических регионах. Система достигла 99.999% аптайма при p99 задержке менее 10ms при 50 000 транзакциях в секунду.',
        'Построена на Go с Temporal для оркестрации рабочих процессов. Mesh обрабатывает маршрутизацию платежей, конвертацию валют, предпроверку фрода и сверку расчетов. Каждый регион работает независимо с гарантированной согласованностью через Kafka.',
        'Архитектура снизила операционные расходы на 42% по сравнению с предыдущей монолитной системой, увеличив пропускную способность в 8 раз. Команда из 20+ инженеров была организована в 3 отряда: ядро платежей, комплаенс и инфраструктура.'
      ],
      highlights: [
        { label: 'Годовой объем', value: 4, unit: '$B+' },
        { label: 'Регионы', value: 14, unit: '' },
        { label: 'Пик TPS', value: 50, unit: 'K' },
        { label: 'Аптайм', value: 99.999, unit: '%' },
        { label: 'Задержка p99', value: 10, unit: 'ms' },
        { label: 'Экономия', value: 42, unit: '%' }
      ],
      links: { github: 'https://github.com/RF24KRSK/payment-mesh' },
      features: ['Active-active в нескольких регионах', 'Курсы валют в реальном времени', 'Автоматическая сверка расчетов', 'PCI-DSS Level 1', 'Circuit breaker с авто-восстановлением'],
      screenshotType: 'dashboard'
    },
    'fraud-engine': {
      details: [
        'ML-система обнаружения фрода на 8 000 транзакций в секунду с точностью 99.2% и задержкой инференса 40ms. В первый год система предотвратила убытки на $12 млн.',
        'Система использует ансамбль PyTorch моделей: темпоральные графовые нейросети для анализа транзакций, градиентный бустинг для скоринга и глубокое обучение для аномалий. Фичи подаются в реальном времени из Redis feature store.',
        'Пайплайн непрерывного обучения переобучает модели каждые 6 часов на потоковых данных из Kafka, адаптируясь к новым паттернам фрода в течение минут после обнаружения.'
      ],
      highlights: [
        { label: 'Пропускная способность', value: 8, unit: 'K TPS' },
        { label: 'Точность', value: 99.2, unit: '%' },
        { label: 'Инференс', value: 40, unit: 'ms' },
        { label: 'Предотвращено', value: 12, unit: '$M' },
        { label: 'Моделей', value: 7, unit: '' },
        { label: 'Переобучение', value: 6, unit: 'ч' }
      ],
      links: { github: 'https://github.com/RF24KRSK/fraud-engine' },
      features: ['Ансамбль ML-моделей', 'Feature serving <1ms', 'Автоматическое переобучение', 'Дрифт-детекция и откат', 'Explainable AI с SHAP'],
      screenshotType: 'dashboard'
    },
    'audit-log': {
      details: [
        'Иммутабельный аудит-лог пайплайн с пропускной способностью 1 млн событий в секунду, хранением 5 лет и производительностью запросов менее 200ms. Соответствует SOC2 Type II и PCI-DSS.',
        'Слой приема на Rust обеспечивает нулевые накладные расходы GC и предсказуемую задержку. События буферизируются через Kafka и хранятся в ClickHouse для аналитических запросов с S3 холодным хранением для данных старше 90 дней.',
        'Криптографическая цепочка гарантирует защиту от изменений: каждый батч включает Merkle root хеш предыдущего. Производительность запросов обеспечивается материализованными представлениями.'
      ],
      highlights: [
        { label: 'Пропускная способность', value: 1, unit: 'M/с' },
        { label: 'Хранение', value: 5, unit: 'лет' },
        { label: 'Запросы', value: 200, unit: 'ms' },
        { label: 'Хранилище', value: 500, unit: 'TB+' },
        { label: 'Стандарты', value: 2, unit: '' },
        { label: 'Ноды', value: 12, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/audit-pipeline' },
      features: ['Криптографическая защита', 'Многоуровневое хранение', 'Аналитические запросы <200ms', 'Сверка в реальном времени', 'Автоматическая отчетность'],
      screenshotType: 'dashboard'
    },
    'compliance': {
      details: [
        'Policy-driven система комплаенса, оценивающая до 4 000 правил на транзакцию менее чем за 5ms. Система автоматизирует регуляторную отчетность в нескольких юрисдикциях, снижая ручной труд на 80%.',
        'Построена на Go с OpenPolicyAgent для оценки правил. Движок поддерживает как проверку в реальном времени, так и пакетный ретроактивный анализ. Правила пишутся на Rego DSL и хранятся в Git.',
        'Система интегрируется с 12 регуляторными API в 5 юрисдикциях, автоматически подавая отчеты и отмечая исключения. Дашборд предоставляет видимость комплаенс-позиции с детализацией до каждого правила.'
      ],
      highlights: [
        { label: 'Правил/транзакция', value: 4, unit: 'K' },
        { label: 'Время оценки', value: 5, unit: 'ms' },
        { label: 'Юрисдикции', value: 5, unit: '' },
        { label: 'Ручной труд', value: 80, unit: '% сэкономлено' },
        { label: 'Правил создано', value: 2, unit: 'K+' },
        { label: 'API интеграции', value: 12, unit: '' }
      ],
      links: {},
      features: ['Realtime + batch режимы', 'Правила в Git', 'Мультиюрисдикционная отчетность', 'Полный аудит-трейл', 'Песочница для тестирования правил'],
      screenshotType: 'dashboard'
    },
    'ledger': {
      details: [
        'Встраиваемый double-entry ledger, обрабатывающий 200 000 записей в секунду на ноду со строгими ACID гарантиями. Создан для платежных потоков, требующих сверки в реальном времени и аудита.',
        'Написан на Rust с SQLite в ядре, использует кастомную WAL-архитектуру для конкурентных чтений/записи. Межнодовое взаимодействие через gRPC с NATS для рассылки событий.',
        'Поддерживает мультивалютный учет с автоматическим отслеживанием конверсии, memo-post паттерны для двухфазных расчетов и вычисление балансов в реальном времени.'
      ],
      highlights: [
        { label: 'Записей/с', value: 200, unit: 'K' },
        { label: 'Нод', value: 16, unit: '' },
        { label: 'Сверка', value: 'Realtime', unit: '' },
        { label: 'ACID', value: 'Строгий', unit: '' },
        { label: 'Валют', value: 24, unit: '' },
        { label: 'Данных', value: 50, unit: 'TB+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/rust-ledger' },
      features: ['Строгий ACID с конкурентным чтением', 'Мультивалютность с FX', 'Устойчивость к разделению', 'Балансы в реальном времени', 'gRPC + NATS'],
      screenshotType: 'dashboard'
    },
    'billing': {
      details: [
        'Биллинговая платформа реального времени, обрабатывающая 10 000 событий метринга в секунду с точностью инвойсов 99.99% и задержкой менее минуты от события до строки в инвойсе.',
        'Система метрит compute, storage, API вызовы и посещаемость. События поступают через Kafka, агрегируются в Redis с часовыми снепшотами в PostgreSQL и выставляются через Stripe с кастомной вебхук-интеграцией.',
        'Дашборд реального времени дает клиентам видимость текущего использования и прогнозируемых затрат с настраиваемыми бюджетными оповещениями на 50%, 80% и 100% порогах.'
      ],
      highlights: [
        { label: 'Событий/с', value: 10, unit: 'K' },
        { label: 'Точность', value: 99.99, unit: '%' },
        { label: 'Задержка', value: 1, unit: 'мин' },
        { label: 'Клиентов', value: 500, unit: 'K+' },
        { label: 'Моделей цен', value: 4, unit: '' },
        { label: 'Интеграция', value: 'Stripe', unit: '' }
      ],
      links: {},
      features: ['Метринг в реальном времени', 'Многомодельный движок цен', 'Бюджетные оповещения', 'Prepaid + postpaid', 'Stripe вебхуки'],
      screenshotType: 'dashboard'
    },
    'kyc-orch': {
      details: [
        'Оркестратор верификации документов KYC, обработавший 300 000+ проверок с 95% авто-одобрением, сократив ручную проверку на 40% по сравнению с предыдущим решением.',
        'Pipeline использует AWS Textract для OCR документов, кастомную ML-модель для детекции подделок и интеграцию с 5 провайдерами верификации. Step Functions оркестрирует workflow с автоматическим fallback.',
        'Админ-дашборд для ручной проверки сложных случаев с AI-подсказками на основе похожих исторических кейсов. Среднее время верификации сократилось с 24 часов до 3 минут для авто-одобренных.'
      ],
      highlights: [
        { label: 'Верификаций', value: 300, unit: 'K+' },
        { label: 'Авто-одобрение', value: 95, unit: '%' },
        { label: 'Быстрее', value: 40, unit: '%' },
        { label: 'Время проверки', value: 3, unit: 'мин' },
        { label: 'Провайдеров', value: 5, unit: '' },
        { label: 'Детекция подделок', value: 'ML', unit: '' }
      ],
      links: {},
      features: ['Многопровайдерная оркестрация', 'ML детекция подделок', 'Авто-fallback', 'AI-ассистированная проверка', 'Статус в реальном времени'],
      screenshotType: 'dashboard'
    },
    'ml-platform': {
      details: [
        'Внутренняя ML-платформа для 200+ дата-сайентистов с распределенным обучением, автоматическим подбором гиперпараметров и централизованным registry моделей. Ускорила работу команд в 3 раза.',
        'На Python с PyTorch и Ray, платформа абстрагирует инфраструктурную сложность. Дата-сайентисты описывают эксперименты в YAML, платформа управляет GPU, распределенным обучением и трекингом.',
        'Registry моделей поддерживает версионирование, promotion (dev → staging → prod), A/B тестирование и автоматический откат. CI/CD интеграция обеспечивает непрерывное обучение с approval gates.'
      ],
      highlights: [
        { label: 'Пользователей', value: 200, unit: '+' },
        { label: 'Ускорение', value: 3, unit: 'x' },
        { label: 'Моделей в продe', value: 50, unit: '+' },
        { label: 'GPU кластер', value: 64, unit: 'GPU' },
        { label: 'Экспериментов/мес', value: 500, unit: '+' },
        { label: 'Тренировок/день', value: 200, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/ml-platform' },
      features: ['YAML конфиги экспериментов', 'Распределенное GPU обучение', 'Авто Hyperparameter Tuning', 'Registry со стейджингом', 'CI/CD для ML'],
      screenshotType: 'dashboard'
    },
    'feature-store': {
      details: [
        'Реалтайм feature store для online и offline ML-нагрузок с p99 задержкой 2ms для 10 000 фич и пропускной способностью 1TB/день.',
        'Go для serving слоя, Redis для online хранения, Kafka для стриминговых вычислений, S3 для batch хранения. Flink обрабатывает streaming feature pipelines с exactly-once семантикой.',
        'Поддерживает time-travel запросы, point-in-time joins для датасетов и автоматическую валидацию фич с дрифт-детекцией. Каталог фич с поиском и lineage трекингом.'
      ],
      highlights: [
        { label: 'Фич', value: 10, unit: 'K' },
        { label: 'Online p99', value: 2, unit: 'ms' },
        { label: 'Пропускная', value: 1, unit: 'TB/день' },
        { label: 'Команд использует', value: 15, unit: '' },
        { label: 'Стриминг пайплайнов', value: 40, unit: '' },
        { label: 'Time-Travel', value: '7 дней', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/feature-store' },
      features: ['Online/offline единый serving', 'Time-travel запросы', 'Авто-валидация фич', 'Каталог с lineage', 'Стриминг через Flink'],
      screenshotType: 'dashboard'
    },
    'model-mesh': {
      details: [
        'Multi-model serving mesh для 50+ типов моделей с авто-масштабированием до нуля и p50 задержкой менее 10ms. Единый inference API для PyTorch, TensorFlow, ONNX и кастомных моделей.',
        'На Kubernetes с Triton Inference Server, Envoy для маршрутизации и canary деплоев. Кастомные автоскейлеры определяют паттерны инференса и масштабируют от нуля до сотен подов за секунды.',
        'Включает версионирование моделей, A/B тестирование, shadow трафик и автоматический мониторинг производительности с дашбордом per-model метрик.'
      ],
      highlights: [
        { label: 'Типов моделей', value: 50, unit: '+' },
        { label: 'Инференс p50', value: 10, unit: 'ms' },
        { label: 'Scale-to-zero', value: true, unit: '' },
        { label: 'Запросов/день', value: 100, unit: 'M+' },
        { label: 'Фреймворков', value: 4, unit: '' },
        { label: 'Стадий canary', value: 3, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/model-mesh' },
      features: ['Multi-фреймворковый инференс', 'Авто-масштабирование до 0', 'Canary деплои', 'Shadow трафик', 'Мониторинг per-model'],
      screenshotType: 'dashboard'
    },
    'nlp-pipe': {
      details: [
        'NLP пайплайн для 10 млн документов в день с NER, классификацией и суммаризацией, достигающий 94% F1 на 12 типах документов.',
        'Python с HuggingFace Transformers, fine-tuned BERT для NER/классификации и T5 для абстрактивной суммаризации. Документы через FastAPI, асинхронная обработка через Celery.',
        'Результаты индексируются в Elasticsearch с фасетной навигацией. Поддерживаются кастомные онтологии с переобучением на доменных данных через веб-интерфейс за часы.'
      ],
      highlights: [
        { label: 'Пропускная', value: 10, unit: 'M/день' },
        { label: 'F1 Score', value: 94, unit: '%' },
        { label: 'Типов документов', value: 12, unit: '' },
        { label: 'Параметров модели', value: 350, unit: 'M' },
        { label: 'Инференс', value: 200, unit: 'ms/док' },
        { label: 'Поиск', value: 'Elasticsearch', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/nlp-pipeline' },
      features: ['Multi-task NLP', 'Fine-tuned трансформеры', 'Кастомные онтологии', 'Веб-интерфейс обучения', 'Полнотекстовый поиск'],
      screenshotType: 'dashboard'
    },
    'anomaly': {
      details: [
        'Система детекции аномалий для 5 000 финансовых метрик с оповещениями менее чем за 30 секунд и точностью 96%. Мониторит объемы транзакций, задержки, ошибки и бизнес-метрики.',
        'Python с Prophet для декомпозиции трендов и статистическими моделями для скоринга. Метрики через Kafka в TimescaleDB, Grafana для дашбордов и оповещений.',
        'Система изучает нормальное поведение за 7 и 30 дней, автоматически адаптируя пороги во время известных событий (релизы, маркетинговые кампании). Механизм группировки снижает усталость от алертов.'
      ],
      highlights: [
        { label: 'Потоков метрик', value: 5, unit: 'K' },
        { label: 'Задержка алерта', value: 30, unit: 'с' },
        { label: 'Точность', value: 96, unit: '%' },
        { label: 'Точек данных/день', value: 500, unit: 'M+' },
        { label: 'Авто-пороги', value: true, unit: '' },
        { label: 'Группировка', value: 'Умная', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/anomaly-detection' },
      features: ['Prophet декомпозиция', 'Авто-адаптивные пороги', 'Умная группировка алертов', 'Grafana интеграция', 'Метрическая корреляция'],
      screenshotType: 'dashboard'
    },
    'data-lake': {
      details: [
        'Streaming data lake на 500TB/день с кастомным Rust пайплайном, заменившим Spark, — прирост 12x и снижение затрат на инфраструктуру на 80%.',
        'Система принимает данные из 200+ источников через Kafka, обрабатывает Rust пайплайном (схема, качество, партиционирование) и сохраняет в S3 с Iceberg форматом.',
        'Trino обеспечивает федеративные SQL-запросы по data lake, хранилищу и стримам. Аналитики могут объединять исторические и живые данные в одном запросе. Платформа обслуживает 50+ команд.'
      ],
      highlights: [
        { label: 'Пропускная', value: 500, unit: 'TB/день' },
        { label: 'Ускорение', value: 12, unit: 'x' },
        { label: 'Экономия', value: 80, unit: '%' },
        { label: 'Источников', value: 200, unit: '+' },
        { label: 'Команд аналитики', value: 50, unit: '+' },
        { label: 'Движок', value: 'Trino', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/rust-data-lake' },
      features: ['Rust пайплайн приема', 'Схема и валидация', 'Iceberg формат', 'Федеративные SQL запросы', 'Холодное хранение'],
      screenshotType: 'graph'
    },
    'migration-kit': {
      details: [
        'Enterprise инструмент миграции монолитов в микросервисы, использованный в 6 проектах, мигрировавший 150+ сервисов с zero-downtime.',
        'Go, анализатор зависимостей, API gateway (Envoy) для разделения трафика, Kafka event bridge для синхронизации данных в процессе миграции.',
        'Проверенный паттерн: анализ → определение границ → strangler fig → синхронизация → переключение трафика → cutover. Автоматический откат за секунды.'
      ],
      highlights: [
        { label: 'Сервисов', value: 150, unit: '+' },
        { label: 'Проектов', value: 6, unit: '' },
        { label: 'Downtime', value: 0, unit: '' },
        { label: 'Фаз', value: 6, unit: '' },
        { label: 'Откат', value: 5, unit: 'с' },
        { label: 'Команда', value: 8, unit: '/проект' }
      ],
      links: { github: 'https://github.com/RF24KRSK/migration-kit' },
      features: ['Анализатор зависимостей', 'Strangler fig паттерн', 'Синхронизация через Kafka', 'Canary трафик', 'Мгновенный откат'],
      screenshotType: 'graph'
    },
    'k8s-operators': {
      details: [
        'Набор из 6 Kubernetes операторов для БД, canary деплоев, ротации секретов и сертификатов. 1 000+ звезд GitHub, используется в 50+ компаниях.',
        'Go на controller-runtime, каждый оператор следует best practices по reconciliation, статусам и метрикам. Helm charts с обширной конфигурацией.',
        'Ключевые операторы: PostgreSQL с авто-бэкапом, canary деплой с прогрессивным трафиком, Vault ротация секретов по расписанию и по требованию.'
      ],
      highlights: [
        { label: 'Звезд GitHub', value: 1, unit: 'K+' },
        { label: 'Операторов', value: 6, unit: '' },
        { label: 'Компаний', value: 50, unit: '+' },
        { label: 'Helm charts', value: 12, unit: '' },
        { label: 'Custom Resources', value: 18, unit: '' },
        { label: 'Загрузок', value: 100, unit: 'K+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/k8s-operators' },
      features: ['PostgreSQL lifecycle', 'Canary с трафик-шифтингом', 'Авто-ротация секретов', 'Авто-продление сертификатов', 'Prometheus метрики'],
      screenshotType: 'terminal'
    },
    'cicd': {
      details: [
        'Внутренняя self-serve CI/CD платформа для 40+ команд: 2 000 сборок в день, медиана 8 минут, uptime 99.9%.',
        'Tekton для пайплайнов, ArgoCD для GitOps, drag-and-drop веб-редактор пайплайнов. Harbor для контейнеров со сканированием уязвимостей.',
        'Интеграция с GitHub/GitLab/Bitbucket, единый вебхук и статусы. Дашборд для руководства с DORA метриками: частота деплоев, lead time, change failure rate.'
      ],
      highlights: [
        { label: 'Команд', value: 40, unit: '+' },
        { label: 'Сборок/день', value: 2, unit: 'K' },
        { label: 'Медиана', value: 8, unit: 'мин' },
        { label: 'Uptime', value: 99.9, unit: '%' },
        { label: 'Git систем', value: 3, unit: '' },
        { label: 'Пайплайнов', value: 500, unit: '+' }
      ],
      links: {},
      features: ['Drag-and-drop редактор', 'GitOps с ArgoCD', 'Сканирование уязвимостей', 'Multi-Git поддержка', 'DORA метрики'],
      screenshotType: 'dashboard'
    },
    'service-mesh': {
      details: [
        'Multi-cluster service mesh в 3 регионах с mTLS, трафик-шифтингом и наблюдаемостью. Сократил кросс-командные инциденты на 95%.',
        'Istio с Envoy sidecar-ами: единое управление трафиком, безопасность и наблюдаемость в US East, EU West и Asia Pacific. mTLS с авто-ротацией сертификатов.',
        'Глобальный rate limiter, circuit breaker с восстановлением, распределенный трейсинг. Единый Grafana дашборд с SLO compliance по регионам.'
      ],
      highlights: [
        { label: 'Регионов', value: 3, unit: '' },
        { label: 'Сервисов', value: 200, unit: '+' },
        { label: 'mTLS', value: '100%', unit: '' },
        { label: 'Инцидентов -', value: 95, unit: '%' },
        { label: 'Ротация', value: 'Авто 24ч', unit: '' },
        { label: 'Наблюдаемость', value: 'Полная', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/service-mesh' },
      features: ['Авто mTLS с ротацией', 'Глобальный rate limiting', 'Кросс-кластерный трейсинг', 'Canary + blue-green', 'Единый дашборд'],
      screenshotType: 'graph'
    },
    'paas': {
      details: [
        'Self-serve мульти-облачная платформа: от коммита до продакшена за 12 минут вместо 2 дней. AWS, GCP, Azure, 200+ приложений.',
        'Go, Terraform, Pulumi, Crossplane — единый API для облаков. Манифест описывает требования, платформа создает инфраструктуру, mesh и мониторинг.',
        'Встроенный secrets management, авто-SSL через Let\'s Encrypt, каталог из 50+ предустановленных сервисов (БД, очереди, кэши).'
      ],
      highlights: [
        { label: 'Деплой', value: 12, unit: 'мин' },
        { label: 'Было', value: 48, unit: 'ч' },
        { label: 'Приложений', value: 200, unit: '+' },
        { label: 'Облаков', value: 3, unit: '' },
        { label: 'Сервисов', value: 50, unit: '+' },
        { label: 'Разработчиков', value: 300, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/multi-cloud-paas' },
      features: ['Единый API для облаков', 'Манифест-деплой', 'Secrets management', 'Авто SSL', '50+ сервисов'],
      screenshotType: 'terminal'
    },
    'kubedbg': {
      details: [
        'Интерактивный CLI для отладки Pod-ов в Kubernetes: 2 400+ звезд GitHub, 300+ форков, используется 50+ компаниями, включая 2 FAANG.',
        'Go с client-go и Cobra. Создает эфемерный debug контейнер, разделяющий namespace пода: сеть, процессы, тома. Интерактивный shell, port forwarding, копирование файлов.',
        'Отмечен в официальном блоге Kubernetes и CNCF newsletter. Сообщество: zsh completion, VS Code extension, веб-терминал.'
      ],
      highlights: [
        { label: 'Звезд GitHub', value: 2.4, unit: 'K' },
        { label: 'Форков', value: 300, unit: '+' },
        { label: 'Компаний', value: 50, unit: '+' },
        { label: 'FAANG', value: 2, unit: '' },
        { label: 'Команд CLI', value: 8, unit: '' },
        { label: 'Контрибьюторов', value: 30, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/kubectl-debugger', demo: 'https://kubedbg.dev' },
      features: ['Эфемерные debug контейнеры', 'Общие namespace', 'Копирование файлов', 'Port forwarding', 'VS Code extension'],
      screenshotType: 'terminal'
    },
    'apitest': {
      details: [
        'Декларативный фреймворк тестирования API: 1 800+ звезд GitHub, 10 000+ npm загрузок в месяц. Тесты в YAML — читаемы разработчиками и QA.',
        'TypeScript с OpenAPI: авто-отчеты покрытия, валидация схем, data-driven тесты из CSV/JSON. Интеграция с CI/CD через CLI или API.',
        'HTTP, GraphQL, gRPC, встроенный mock сервер. Плагины сообщества: OAuth2, управление БД, Slack уведомления.'
      ],
      highlights: [
        { label: 'Звезд GitHub', value: 1.8, unit: 'K' },
        { label: 'npm/мес', value: 10, unit: 'K' },
        { label: 'Контрибьюторов', value: 40, unit: '+' },
        { label: 'Протоколов', value: 3, unit: '' },
        { label: 'Плагинов', value: 12, unit: '' },
        { label: 'CI интеграций', value: 5, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/api-test-framework' },
      features: ['YAML тесты', 'OpenAPI валидация', 'HTTP/GraphQL/gRPC', 'Mock сервер', 'Data-driven тесты'],
      screenshotType: 'terminal'
    },
    'dbmate': {
      details: [
        'Инструмент миграций БД с поддержкой PostgreSQL, MySQL, SQLite, ClickHouse. 1 200+ звезд GitHub, dry-run, откат, CI интеграция.',
        'Go, миграции в чистом SQL или Go DSL. Forward-only политика для аудита. Валидация через контрольные суммы, dry-run режим.',
        'Ветвление: тестирование на эфемерных БД, автоматическая верификация, zero-downtime паттерны для прода.'
      ],
      highlights: [
        { label: 'Звезд GitHub', value: 1.2, unit: 'K' },
        { label: 'БД движков', value: 4, unit: '' },
        { label: 'Загрузок', value: 50, unit: 'K+' },
        { label: 'Типов миграций', value: 2, unit: '' },
        { label: 'CI интеграций', value: 3, unit: '' },
        { label: 'Контр. сумма', value: 'SHA-256', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/dbmate-pro' },
      features: ['Multi-БД поддержка', 'SQL + Go DSL', 'Dry-run режим', 'Контрольные суммы', 'Zero-downtime паттерны'],
      screenshotType: 'terminal'
    },
    'jsval': {
      details: [
        'Высокопроизводительный валидатор JSON Schema на Rust → WASM. В 5x быстрее JS аналогов. 800+ звезд GitHub.',
        'Rust с serde_json, имплементация JSON Schema draft-07 и 2019-09. WASM для Node.js, браузера и edge runtime.',
        'Стабильные 5x improvement на всех уровнях сложности. Полная API совместимость с популярными JS валидаторами — drop-in замена.'
      ],
      highlights: [
        { label: 'Звезд GitHub', value: 800, unit: '+' },
        { label: 'Ускорение', value: 5, unit: 'x' },
        { label: 'Версий схемы', value: 2, unit: '' },
        { label: 'Runtime', value: 'WASM', unit: '' },
        { label: 'Загрузок', value: 100, unit: 'K+' },
        { label: 'API совместимость', value: '100%', unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/json-schema-validator' },
      features: ['Rust + WASM', '5x быстрее JS', 'Drop-in замена', 'Браузер/Node/Edge', 'Draft-07 и 2019-09'],
      screenshotType: 'code'
    },
    'tui-kit': {
      details: [
        'React библиотека TUI компонентов для CLI приложений. 1 500+ звезд GitHub, 12 компонентов.',
        'TypeScript, Ink, React: таблицы, формы, спиннеры, прогресс-бары, инпуты, меню, тосты. Кастомные темы, клавиатурная навигация.',
        'Используется в CLI-инструментах: дашборды деплоев, управление БД, мониторы CI. Интерактивные примеры в терминале.'
      ],
      highlights: [
        { label: 'Звезд GitHub', value: 1.5, unit: 'K' },
        { label: 'Компонентов', value: 12, unit: '' },
        { label: 'Фреймворк', value: 'React/Ink', unit: '' },
        { label: 'Компаний', value: 15, unit: '+' },
        { label: 'npm/мес', value: 20, unit: 'K' },
        { label: 'Тем', value: 8, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/terminal-ui-kit' },
      features: ['12 TUI компонентов', 'React + Ink', 'Кастомные темы', 'Клавиатурная навигация', 'Интерактивные примеры'],
      screenshotType: 'terminal'
    },
    'did': {
      details: [
        'Децентрализованный протокол идентификации с zero-knowledge proof для DeFi. 300 000+ личностей, -60% стоимости KYC. Аудит Trail of Bits.',
        'Solidity для on-chain, Go для off-chain оператора, IPFS для документов. ZK-SNARK на Circom. Пользователи доказывают атрибуты без раскрытия данных.',
        'Интеграция с 5 DeFi протоколами и 3 CEX. Governance DAO управляет параметрами, аппруверами и комиссиями.'
      ],
      highlights: [
        { label: 'Личностей', value: 300, unit: 'K+' },
        { label: 'Экономия KYC', value: 60, unit: '%' },
        { label: 'ZK proof', value: 60, unit: 'ms' },
        { label: 'Аудит', value: 'ToB', unit: '' },
        { label: 'Интеграций', value: 8, unit: '' },
        { label: 'DAO участников', value: 500, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/did-protocol' },
      features: ['Zero-knowledge идентификация', 'Off-chain + on-chain', 'Trail of Bits аудит', 'Multi-DAO governance', 'DeFi + CEX интеграция'],
      screenshotType: 'blocks'
    },
    'defi-analytics': {
      details: [
        'On-chain аналитика для 15 DeFi протоколов в 5 блокчейнах: TVL, объемы, кошельки в реальном времени. 50 дашбордов.',
        'Python, Web3.py, Dune Analytics. Индексация в PostgreSQL, GraphQL API для дашбордов и SQL отчетов.',
        'Профилирование кошельков с кластеризацией, симуляция транзакций для MEV анализа, кросс-протокольная агрегация рисков. Оповещения об аномалиях через 2 блока.'
      ],
      highlights: [
        { label: 'Протоколов', value: 15, unit: '' },
        { label: 'Блокчейнов', value: 5, unit: '' },
        { label: 'Дашбордов', value: 50, unit: '' },
        { label: 'TVL', value: 2.5, unit: '$B+' },
        { label: 'Оповещения', value: 2, unit: 'блока' },
        { label: 'Запросов/день', value: 1, unit: 'M' }
      ],
      links: { github: 'https://github.com/RF24KRSK/defi-analytics' },
      features: ['Мультичейн индексация', 'Профили кошельков', 'MEV симуляция', 'Агрегация рисков', 'GraphQL + SQL'],
      screenshotType: 'dashboard'
    },
    'nft-infra': {
      details: [
        'NFT инфраструктура: 500 000+ отчеканенных NFT, metadata за <100ms, uptime 99.9%. Для хай-трафик дропов и PFP коллекций.',
        'Go для metadata API, NFT.Storage для децентрализованного хранения, IPFS, Alchemy для on-chain событий. Redis кэш для стабильной задержки.',
        'Планировщик минта с оптимизацией газа, авто-генерация метаданных, трекинг в реальном времени. Калькулятор редкости и анализатор распределения атрибутов.'
      ],
      highlights: [
        { label: 'NFT отчеканено', value: 500, unit: 'K+' },
        { label: 'Metadata', value: 100, unit: 'ms' },
        { label: 'Uptime', value: 99.9, unit: '%' },
        { label: 'Пик минта', value: 1, unit: 'K/мин' },
        { label: 'Экономия газа', value: 25, unit: '%' },
        { label: 'Коллекций', value: 40, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/nft-infrastructure' },
      features: ['Высокопроизводительный минтинг', 'Оптимизация газа', 'Децентрализованное хранение', 'Трекинг в реальном времени', 'Анализ редкости'],
      screenshotType: 'blocks'
    },
    'dao-govern': {
      details: [
        'Набор инструментов управления DAO: off-chain голосование + on-chain исполнение. 10 DAO, 200 000+ предложений, явка 75%.',
        'Solidity для on-chain, TypeScript для создания предложений, Snapshot для gasless голосования. The Graph для дашбордов в реальном времени.',
        'Делегативное, квадратичное и conviction голосование. Менеджер жизненного цикла: создание → обсуждение → голосование → исполнение → вето.'
      ],
      highlights: [
        { label: 'DAO в продакшене', value: 10, unit: '' },
        { label: 'Предложений', value: 200, unit: 'K+' },
        { label: 'Явка', value: 75, unit: '%' },
        { label: 'Типов голосования', value: 3, unit: '' },
        { label: 'Gasless голосование', value: true, unit: '' },
        { label: 'Цикл', value: 72, unit: 'ч' }
      ],
      links: { github: 'https://github.com/RF24KRSK/dao-governance' },
      features: ['Off-chain + on-chain', 'Квадратичное голосование', 'Жизненный цикл предложений', 'Snapshot интеграция', 'Дашборды реального времени'],
      screenshotType: 'blocks'
    },
    'saas-engine': {
      details: [
        'Self-serve multi-tenant SaaS: 500 000+ бизнесов, изоляция, биллинг, аналитика. 99.99% SLA.',
        'Go control plane, React админка, PostgreSQL с row-level security, Redis для rate limiting. Terraform для dedicated инфраструктуры по требованию.',
        'Автоматизация онбординга, feature flags, self-service аналитика. Метринг каждого API вызова, байта и цикла для точного биллинга.'
      ],
      highlights: [
        { label: 'Активных тенантов', value: 500, unit: 'K+' },
        { label: 'SLA', value: 99.99, unit: '%' },
        { label: 'API запросов', value: 100, unit: 'K/с' },
        { label: 'Онбординг', value: 2, unit: 'мин' },
        { label: 'Изоляция', value: 'RLS + VPC', unit: '' },
        { label: 'Точность биллинга', value: 99.99, unit: '%' }
      ],
      links: {},
      features: ['Multi-tenant изоляция', 'Self-serve онбординг', 'Метринг + биллинг', 'Feature flags', 'Аналитика реального времени'],
      screenshotType: 'dashboard'
    },
    'collab-engine': {
      details: [
        'CRDT-движок совместной работы: 10 000 редакторов, разрешение конфликтов <50ms. Конкурент Figma для белых досок и диаграмм.',
        'TypeScript с Yjs CRDT, WebSockets, ScyllaDB для сессий, Redis для присутствия.',
        'Rich text, фигуры, рисование, библиотеки компонентов. Офлайн-режим с авто-синком. Undo/redo между участниками.'
      ],
      highlights: [
        { label: 'Одновременных', value: 10, unit: 'K' },
        { label: 'Конфликты', value: 50, unit: 'ms' },
        { label: 'WebSocket', value: 50, unit: 'K' },
        { label: 'Синхронизация', value: 'CRDT', unit: '' },
        { label: 'Undo', value: '∞', unit: '' },
        { label: 'Типов элементов', value: 20, unit: '' }
      ],
      links: { github: 'https://github.com/RF24KRSK/collab-engine' },
      features: ['CRDT разрешение конфликтов', 'Офлайн с авто-синком', 'Undo/redo между всеми', 'Rich text + фигуры', 'WebSocket + ScyllaDB'],
      screenshotType: 'dashboard'
    },
    'event-sourcing': {
      details: [
        'Event sourcing + CQRS платформа: 500+ типов событий, 100 000/с, exactly-once. Фундамент для аудит-совместимых систем.',
        'Go, Kafka для хранения, PostgreSQL через Debezium CDC, Kafka Connect для стримов. Schema registry с обратной совместимостью.',
        'Read models материализуются асинхронно с возможностью перестройки из replay. Снепшоты предотвращают бесконечный replay. Дашборд мониторинга.'
      ],
      highlights: [
        { label: 'Типов событий', value: 500, unit: '+' },
        { label: 'Пропускная', value: 100, unit: 'K/с' },
        { label: 'Семантика', value: 'Exactly-once', unit: '' },
        { label: 'Консьюмеров', value: 40, unit: '+' },
        { label: 'Снепшоты', value: '10K', unit: '' },
        { label: 'Read моделей', value: 30, unit: '+' }
      ],
      links: { github: 'https://github.com/RF24KRSK/event-sourcing-platform' },
      features: ['Event sourcing + CQRS', 'Exactly-once', 'Schema registry', 'Авто-проекции', 'Снепшоты + replay'],
      screenshotType: 'graph'
    },
    'api-gateway': {
      details: [
        'Единый API gateway для 200+ микросервисов: rate limiting, auth, кэш, circuit breaker. 200 000 req/с на ноду.',
        'Go на Envoy Proxy с плагинами для кастомной аутентификации и трансформации. Redis rate limiting: per-client и глобальные квоты.',
        'Портал разработчика с авто-документацией из OpenAPI, интерактивный explorer, управление API ключами. Состояния circuit breaker в реальном времени.'
      ],
      highlights: [
        { label: 'Сервисов', value: 200, unit: '+' },
        { label: 'Пропускная', value: 200, unit: 'K req/с' },
        { label: 'Rate limits', value: 'Redis', unit: '' },
        { label: 'Задержка', value: 2, unit: 'ms' },
        { label: 'Методов auth', value: 5, unit: '' },
        { label: 'Портал', value: 'Авто-доки', unit: '' }
      ],
      links: {},
      features: ['Envoy плагины', 'Redis rate limiting', 'Авто-документация', 'Multi-auth', 'Circuit breaker дашборд'],
      screenshotType: 'graph'
    },
    'dev-portal': {
      details: [
        'Backstage портал разработчика: 40+ плагинов, 200 сервисов, 1 000+ активных инженеров в день.',
        'React + Backstage, TypeScript, GraphQL для единого доступа к GitHub, Jira, PagerDuty, Datadog.',
        'Поиск сервисов, API документация, статус деплоев, on-call ротации. Scorecards отслеживают зрелость: надежность, безопасность, документация.'
      ],
      highlights: [
        { label: 'Плагинов', value: 40, unit: '+' },
        { label: 'Сервисов', value: 200, unit: '' },
        { label: 'Инженеров/день', value: 1, unit: 'K+' },
        { label: 'Интеграций', value: 8, unit: '' },
        { label: 'Измерений scorecard', value: 3, unit: '' },
        { label: 'API запросов', value: 500, unit: 'K/день' }
      ],
      links: { github: 'https://github.com/RF24KRSK/dev-portal' },
      features: ['Backstage платформа', '40+ плагинов', 'Агрегация данных', 'Scorecards зрелости', 'Единый интерфейс'],
      screenshotType: 'dashboard'
    }
  }
};

export const CAREER_DETAIL = {
  EN: [
    {
      details: [
        'Led the architecture and engineering of a multi-region payment mesh at Tech Corp, processing over $4 billion in annual transaction volume across 14 geographic regions. The system was built from scratch to replace a legacy payment infrastructure that could no longer scale.',
        'Organized 20+ engineers into 3 cross-functional squads covering payments core, compliance, and infrastructure. Implemented agile-at-scale practices including quarterly planning, squad-level OKRs, and a bi-weekly architecture review board.',
        'Drove a 42% reduction in infrastructure costs through Kubernetes optimization, spot instance adoption, and a systematic right-sizing initiative. Established SLOs for all critical services and built a real-time SLO monitoring dashboard that became the team\'s single source of truth.'
      ],
      highlights: [
        { label: 'Team Size', value: 20, unit: '+' },
        { label: 'Annual Volume', value: 4, unit: '$B+' },
        { label: 'Cost Reduction', value: 42, unit: '%' },
        { label: 'Squads', value: 3, unit: '' },
        { label: 'Regions Deployed', value: 14, unit: '' },
        { label: 'Engineers Hired', value: 12, unit: '' }
      ],
      techStack: ['Go', 'Temporal', 'PostgreSQL', 'Kafka', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana'],
      keyAchievements: [
        'Designed multi-region active-active payment architecture with <10ms p99 cross-region latency',
        'Reduced infrastructure costs by 42% through K8s optimization and spot instances',
        'Established org-wide SLO framework with real-time monitoring dashboards',
        'Migrated 12 legacy services to new architecture with zero downtime',
        'Built incident response process reducing MTTR from 45min to 8min'
      ]
    },
    {
      details: [
        'Joined FinScale as their first engineering hire and built the engineering organization from 2 to 18 people over 2.5 years. The company needed a real-time fraud detection system to meet growing regulatory requirements and reduce chargeback losses.',
        'Architected and delivered a real-time fraud detection engine processing 8,000 transactions per second with 99.2% precision. The system used an ensemble of ML models including graph neural networks and gradient-boosted trees, processing transactions in under 40ms.',
        'Led the migration of a monolithic Ruby application to 60 microservices using a strangler fig pattern, achieving zero-downtime cutover over 18 months. Established engineering practices including CI/CD, code review, on-call rotation, and quarterly architecture reviews.'
      ],
      highlights: [
        { label: 'Team Growth', value: '2→18', unit: '' },
        { label: 'Fraud Engine TPS', value: 8, unit: 'K' },
        { label: 'Precision', value: 99.2, unit: '%' },
        { label: 'Microservices', value: 60, unit: '' },
        { label: 'Migration Downtime', value: 0, unit: '' },
        { label: 'Chargebacks Reduced', value: 60, unit: '%' }
      ],
      techStack: ['Python', 'PyTorch', 'Go', 'Kafka', 'Redis', 'PostgreSQL', 'Kubernetes', 'FastAPI'],
      keyAchievements: [
        'Built engineering team from 2 to 18 across 3 locations',
        'Delivered ML fraud detection system with 99.2% precision at 8K TPS',
        'Migrated monolith to 60 microservices with zero downtime',
        'Reduced chargeback losses by 60% in first year',
        'Established engineering culture: CI/CD, code review, on-call rotations'
      ]
    },
    {
      details: [
        'As Tech Lead and Architect at DataStream, designed and built a streaming data lake processing 500TB per day. The system replaced a legacy Spark-based pipeline that was struggling with growing data volumes and escalating infrastructure costs.',
        'Led a team of 10 engineers to build a custom Rust-based ingestion pipeline that achieved 12x throughput improvement over Spark while reducing infrastructure costs by 80%. The system ingested data from 200+ sources through Kafka and stored it in S3 with Iceberg table format for ACID-compliant querying.',
        'Established the data architecture standards for the company, including schema design principles, data quality frameworks, and the event-driven architecture pattern that became the standard across all engineering teams.'
      ],
      highlights: [
        { label: 'Data Throughput', value: 500, unit: 'TB/day' },
        { label: 'Rust Speedup', value: 12, unit: 'x' },
        { label: 'Cost Reduction', value: 80, unit: '%' },
        { label: 'Team Size', value: 10, unit: '' },
        { label: 'Data Sources', value: 200, unit: '+' },
        { label: 'Analytics Teams', value: 50, unit: '+' }
      ],
      techStack: ['Rust', 'Kafka', 'S3', 'Iceberg', 'Trino', 'Spark', 'Terraform', 'Grafana'],
      keyAchievements: [
        'Replaced Spark pipeline with Rust — 12x throughput, 80% cost reduction',
        'Designed data lake architecture handling 500TB/day from 200+ sources',
        'Established company-wide data architecture standards',
        'Built analytics platform serving 50+ teams across the org',
        'Mentored 4 junior engineers to senior-level competency'
      ]
    },
    {
      details: [
        'Joined WebScale as a Senior Full Stack Engineer to build their SaaS platform serving 500,000+ businesses. The legacy PHP monolith was struggling with performance and developer productivity, with deployment cycles taking weeks.',
        'Led the transition from PHP to Go for the backend and React for the frontend, achieving an 8x improvement in API latency and a 4x increase in developer productivity. Built the new platform alongside the old system using a strangler fig pattern, enabling incremental migration without business disruption.',
        'Mentored 6 junior engineers through a structured growth program, with all 6 reaching senior engineering level within 2 years. Established the frontend architecture patterns including component libraries, state management, and testing practices that are still in use today.'
      ],
      highlights: [
        { label: 'Platform Users', value: 500, unit: 'K+' },
        { label: 'Latency Improvement', value: 8, unit: 'x' },
        { label: 'Dev Productivity', value: 4, unit: 'x' },
        { label: 'Engineers Mentored', value: 6, unit: '' },
        { label: 'Tech Stack', value: 'Go+React', unit: '' },
        { label: 'Migration', value: 'Zero-downtime', unit: '' }
      ],
      techStack: ['Go', 'React', 'PostgreSQL', 'Redis', 'PHP', 'Docker', 'AWS', 'CircleCI'],
      keyAchievements: [
        'Led PHP → Go+React migration with 8x latency improvement',
        'Grew 6 junior engineers to senior level in 2 years',
        'Built component library and frontend architecture patterns',
        'Reduced deployment cycle from weeks to hours',
        'Architected multi-tenant SaaS handling 500K+ businesses'
      ]
    },
    {
      details: [
        'First engineering hire at StartupLab, a venture-backed startup that grew to Series A. As the first and only engineer for 6 months, I built the initial product from database schema to CSS — a B2B SaaS platform that launched on time and within budget.',
        'Over 3 years, shipped 12 products across web, mobile, and API platforms. Each product followed a rapid development cycle of 2-3 months from concept to launch. This experience taught me the full product lifecycle and the importance of pragmatic engineering decisions.',
        'Built and led the engineering team as we grew from 1 to 8 engineers. Established deployment automation, monitoring, and the engineering culture that carried the company through its Series A. The experience shaped my approach to startup engineering: move fast, measure everything, and never compromise on production stability.'
      ],
      highlights: [
        { label: 'Products Shipped', value: 12, unit: '' },
        { label: 'Team Growth', value: '1→8', unit: '' },
        { label: 'Funding Stage', value: 'Seed→A', unit: '' },
        { label: 'Solo Engineer', value: '6mo', unit: '' },
        { label: 'Avg Ship Cycle', value: 3, unit: 'mo' },
        { label: 'Exit', value: 'Series A', unit: '' }
      ],
      techStack: ['PHP', 'JavaScript', 'MySQL', 'AWS', 'Linux', 'Nginx', 'Git', 'Capistrano'],
      keyAchievements: [
        'First engineer, built initial product solo in 4 months',
        'Shipped 12 products in 3 years as company grew',
        'Built and led engineering team from 1 to 8',
        'Established deployment automation and monitoring',
        'Company grew from seed to Series A'
      ]
    },
    {
      details: [
        'Earned a Bachelor of Science in Computer Science from University of Technology with honors. The four-year program covered algorithms and data structures, distributed systems, operating systems, computer networks, databases, and software engineering methodologies.',
        'Completed a thesis on distributed consensus protocols, implementing a Raft-based consensus algorithm in C with performance benchmarking against Paxos variants. The thesis received the department\'s highest grade and was published in the university\'s research repository.',
        'Active in the competitive programming community — placed in the top 15% at ACM ICPC Northeastern European Regional Contest. Also contributed to an open-source course scheduling system used by the department, gaining early exposure to collaborative development workflows.'
      ],
      highlights: [
        { label: 'GPA', value: 3.9, unit: '/4.0' },
        { label: 'Thesis Grade', value: 'A', unit: '' },
        { label: 'ACM ICPC', value: 'Top 15%', unit: '' },
        { label: 'Published Research', value: true, unit: '' },
        { label: 'Open Source', value: true, unit: '' },
        { label: 'Alumni Network', value: true, unit: '' }
      ],
      techStack: ['C', 'C++', 'Java', 'Python', 'Linux', 'Git', 'LaTeX', 'MATLAB'],
      keyAchievements: [
        'Graduated with honors (cum laude)',
        'Thesis on Raft consensus protocol published in university repository',
        'Top 15% at ACM ICPC NEERC regional contest',
        'Built scheduling system adopted by department',
        'Dean\'s list all 8 semesters'
      ]
    }
  ],
  RU: [
    {
      details: [
        'Руководил архитектурой и разработкой мультирегиональной платежной mesh в Tech Corp, обрабатывающей более $4 миллиардов годового объема в 14 регионах. Система построена с нуля для замены легаси-инфраструктуры.',
        'Организовал 20+ инженеров в 3 кросс-функциональных отряда: ядро платежей, комплаенс и инфраструктура. Внедрил agile-at-scale практики: квартальное планирование, OKR на уровне отрядов, архитектурный комитет раз в две недели.',
        'Сократил расходы на инфраструктуру на 42% через оптимизацию Kubernetes, spot-инстансы и систематический right-sizing. Установил SLO для всех критических сервисов и построил дашборд мониторинга SLO.'
      ],
      highlights: [
        { label: 'Команда', value: 20, unit: '+' },
        { label: 'Годовой объем', value: 4, unit: '$B+' },
        { label: 'Экономия', value: 42, unit: '%' },
        { label: 'Отрядов', value: 3, unit: '' },
        { label: 'Регионов', value: 14, unit: '' },
        { label: 'Нанято инженеров', value: 12, unit: '' }
      ],
      techStack: ['Go', 'Temporal', 'PostgreSQL', 'Kafka', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana'],
      keyAchievements: [
        'Спроектировал multi-region active-active архитектуру с задержкой <10ms p99',
        'Сократил затраты на инфраструктуру на 42%',
        'Внедрил SLO фреймворк с мониторингом в реальном времени',
        'Мигрировал 12 легаси-сервисов с нулевым downtime',
        'Построил процесс инцидентов — MTTR снизился с 45 до 8 минут'
      ]
    },
    {
      details: [
        'Присоединился к FinScale как первый инженер и построил организацию с 2 до 18 человек за 2.5 года. Компании требовалась система обнаружения фрода в реальном времени для регуляторных требований и снижения потерь от чарджбэков.',
        'Спроектировал и запустил ML-систему детекции фрода на 8 000 TPS с точностью 99.2%. Система использует ансамбль моделей: графовые нейросети и градиентный бустинг, обработка транзакции менее чем за 40ms.',
        'Руководил миграцией монолитного Ruby-приложения в 60 микросервисов по паттерну strangler fig с нулевым downtime за 18 месяцев. Внедрил CI/CD, code review, on-call ротации и квартальные архитектурные ревью.'
      ],
      highlights: [
        { label: 'Рост команды', value: '2→18', unit: '' },
        { label: 'TPS фрод-движка', value: 8, unit: 'K' },
        { label: 'Точность', value: 99.2, unit: '%' },
        { label: 'Микросервисов', value: 60, unit: '' },
        { label: 'Downtime миграции', value: 0, unit: '' },
        { label: 'Снижение чарджбэков', value: 60, unit: '%' }
      ],
      techStack: ['Python', 'PyTorch', 'Go', 'Kafka', 'Redis', 'PostgreSQL', 'Kubernetes', 'FastAPI'],
      keyAchievements: [
        'Построил команду с 2 до 18 человек в 3 локациях',
        'ML фрод-детекция: 99.2% точность, 8K TPS',
        'Мигрировал монолит → 60 микросервисов без downtime',
        'Снизил потери от чарджбэков на 60% в первый год',
        'Построил инженерную культуру: CI/CD, code review, on-call'
      ]
    },
    {
      details: [
        'Как Tech Lead и Архитектор в DataStream спроектировал и построил streaming data lake на 500TB/день. Система заменила легаси Spark-пайплайн, не справлявшийся с растущими объемами данных.',
        'Руководил командой из 10 инженеров, создавшей кастомный Rust-пайплайн с производительностью в 12x выше Spark и снижением затрат на 80%. Система принимает данные из 200+ источников через Kafka и хранит в S3 с Iceberg форматом.',
        'Установил стандарты архитектуры данных в компании: принципы схем, фреймворки качества данных и event-driven архитектуру, ставшую стандартом для всех команд.'
      ],
      highlights: [
        { label: 'Пропускная способность', value: 500, unit: 'TB/день' },
        { label: 'Ускорение Rust', value: 12, unit: 'x' },
        { label: 'Экономия', value: 80, unit: '%' },
        { label: 'Команда', value: 10, unit: '' },
        { label: 'Источников', value: 200, unit: '+' },
        { label: 'Команд аналитики', value: 50, unit: '+' }
      ],
      techStack: ['Rust', 'Kafka', 'S3', 'Iceberg', 'Trino', 'Spark', 'Terraform', 'Grafana'],
      keyAchievements: [
        'Заменил Spark на Rust — 12x быстрее, -80% затрат',
        'Data lake на 500TB/день из 200+ источников',
        'Стандарты архитектуры данных для всей компании',
        'Платформа аналитики для 50+ команд',
        'Вырастил 4 джунов до сеньоров'
      ]
    },
    {
      details: [
        'Присоединился к WebScale как Senior Full Stack Engineer для создания SaaS-платформы на 500 000+ бизнесов. Легаси PHP-монолит страдал от проблем с производительностью, циклы деплоя занимали недели.',
        'Руководил переходом с PHP на Go (бэкенд) и React (фронтенд), добившись 8x улучшения задержки API и 4x роста продуктивности. Новая платформа строилась параллельно со старой по паттерну strangler fig.',
        'Наставничал 6 джуниор-инженеров: все 6 достигли уровня senior за 2 года. Заложил паттерны фронтенд-архитектуры: библиотеки компонентов, управление состоянием, тестирование.'
      ],
      highlights: [
        { label: 'Пользователей', value: 500, unit: 'K+' },
        { label: 'Ускорение API', value: 8, unit: 'x' },
        { label: 'Продуктивность', value: 4, unit: 'x' },
        { label: 'Наставничество', value: 6, unit: '' },
        { label: 'Стек', value: 'Go+React', unit: '' },
        { label: 'Миграция', value: 'Zero-downtime', unit: '' }
      ],
      techStack: ['Go', 'React', 'PostgreSQL', 'Redis', 'PHP', 'Docker', 'AWS', 'CircleCI'],
      keyAchievements: [
        'PHP → Go+React: ускорение API в 8x',
        'Вырастил 6 джунов до сеньоров за 2 года',
        'Библиотека компонентов и паттерны архитектуры',
        'Цикл деплоя: с недель до часов',
        'Multi-tenant SaaS для 500K+ бизнесов'
      ]
    },
    {
      details: [
        'Первый наемный инженер в StartupLab — стартапе, доросшем до Series A. Будучи единственным инженером 6 месяцев, создал первый продукт с нуля: от схемы БД до CSS. B2B SaaS платформа запущена вовремя и в бюджет.',
        'За 3 года запустил 12 продуктов (web, mobile, API). Каждый продукт — цикл 2-3 месяца от идеи до релиза. Этот опыт научил полному циклу продукта и прагматичным инженерным решениям.',
        'Построил команду с 1 до 8 инженеров. Внедрил автоматизацию деплоя, мониторинг и инженерную культуру, которая помогла компании дойти до Series A.'
      ],
      highlights: [
        { label: 'Продуктов', value: 12, unit: '' },
        { label: 'Рост команды', value: '1→8', unit: '' },
        { label: 'Раунд', value: 'Seed→A', unit: '' },
        { label: 'Соло', value: '6мес', unit: '' },
        { label: 'Цикл продукта', value: 3, unit: 'мес' },
        { label: 'Итог', value: 'Series A', unit: '' }
      ],
      techStack: ['PHP', 'JavaScript', 'MySQL', 'AWS', 'Linux', 'Nginx', 'Git', 'Capistrano'],
      keyAchievements: [
        'Первый инженер, запустил продукт соло за 4 месяца',
        '12 продуктов за 3 года',
        'Построил команду с 1 до 8 инженеров',
        'Автоматизация деплоя и мониторинг',
        'Стартап от seed до Series A'
      ]
    },
    {
      details: [
        'Получил степень бакалавра прикладной математики и информатики с отличием. Программа включала алгоритмы и структуры данных, распределенные системы, операционные системы, компьютерные сети, базы данных и методологии разработки ПО.',
        'Защитил дипломную работу по распределенным протоколам консенсуса — реализация алгоритма Raft на C с бенчмаркингом против Paxos. Работа получила высшую оценку кафедры и опубликована в исследовательском репозитории университета.',
        'Участвовал в соревнованиях по спортивному программированию — топ 15% на ACM ICPC Northeastern European Regional Contest. Внес вклад в open-source систему расписания университета, получив ранний опыт командной разработки.'
      ],
      highlights: [
        { label: 'Средний балл', value: 3.9, unit: '/4.0' },
        { label: 'Оценка диплома', value: 'A', unit: '' },
        { label: 'ACM ICPC', value: 'Топ 15%', unit: '' },
        { label: 'Опубликовано', value: true, unit: '' },
        { label: 'Open Source', value: true, unit: '' },
        { label: 'Ассоциация', value: true, unit: '' }
      ],
      techStack: ['C', 'C++', 'Java', 'Python', 'Linux', 'Git', 'LaTeX', 'MATLAB'],
      keyAchievements: [
        'Окончил с отличием',
        'Диплом по Raft consensus protocol опубликован в репозитории университета',
        'Топ 15% на ACM ICPC NEERC',
        'Система расписания внедрена на факультете',
        'Все 8 семестров — деканатский список'
      ]
    }
  ]
};

export const ACHIEVEMENT_DETAIL = {
  EN: [
    {
      details: [
        'Delivered the keynote "Building Resilient Distributed Systems" at QCon London 2026 to an audience of 2,500+ attendees. The talk covered architectural patterns for building fault-tolerant distributed systems, drawing from 15 years of experience designing systems handling $4B+ in annual transaction volume.',
        'The session received a 97% satisfaction rating — the highest of the conference. I was invited as a keynote speaker based on my published work in ACM Queue and industry recognition in distributed systems architecture. The talk has since been requested as a repeat performance at QCon São Paulo and QCon San Francisco.'
      ],
      links: { slides: 'https://qcon.london/2026/keynote' }
    },
    {
      details: [
        'Presented "Running Go Workflows at Scale" at KubeCon North America 2025 to an audience of 1,200+ attendees. The talk covered practical lessons from running Temporal workflows in production across 14 regions, including workflow versioning strategies, rate limiting patterns, and observability at scale.',
        'The session received a 94% satisfaction rating, making it one of the highest-rated talks of the conference. The talk led to consulting engagements with 3 companies looking to adopt Temporal, and the slides have been viewed over 5,000 times online.'
      ],
      links: { slides: 'https://kubecon.na/2025/slides', video: 'https://youtube.com/kubecon2025-go-workflows' }
    },
    {
      details: [
        'Authored "Event-Driven Architectures in Fintech" for ACM Queue, the Association for Computing Machinery\'s flagship practitioner magazine. The article covers architectural patterns for building real-time event-driven systems in financial services, including event sourcing, CQRS, and stream processing at scale.',
        'The piece has accumulated 40+ academic citations and was featured as the cover story of the quarterly print edition. It has been used as reference material in university courses on distributed systems and cited in 3 follow-up papers.'
      ],
      links: { article: 'https://queue.acm.org/2024/event-driven-fintech' }
    },
    {
      details: [
        'Granted US Patent US-11789045 for "Real-time fraud detection using temporal graph neural networks." The patent covers a novel approach to detecting fraudulent transactions by modeling the temporal relationships between transaction entities using graph neural networks.',
        'The patented technology was implemented in the fraud detection engine that processes 8,000 transactions per second with 99.2% precision, preventing over $12 million in fraud losses annually. The patent has been cited by 5 subsequent patents in the financial ML space.'
      ],
      links: { patent: 'https://patents.google.com/patent/US11789045' }
    },
    {
      details: [
        'Launched kubectl-debugger, an open-source Kubernetes debugging CLI tool that hit 1,000 GitHub stars within 72 hours of release. The tool addresses a critical pain point for Kubernetes operators: debugging Pods without requiring special container images or RBAC modifications.',
        'The project has grown to 2,400+ stars, 300+ forks, and is used by 50+ companies including 2 FAANG organizations. It was featured in the official Kubernetes blog and CNCF weekly newsletter. The community has contributed plugins including VS Code extension and web terminal.'
      ],
      links: { github: 'https://github.com/RF24KRSK/kubectl-debugger' }
    },
    {
      details: [
        'Appointed Lead of the Architecture Committee, a 12-squad architecture review board responsible for establishing and enforcing technical standards across the engineering organization. The committee reviewed all major architectural decisions, technology selections, and cross-team API designs.',
        'During my tenure, the committee standardized on Go as the primary backend language, established API design guidelines, created a service template with built-in observability, and reduced review cycle time from 3 weeks to 3 days. The standards were adopted by 200+ services across the org.'
      ],
      links: {}
    },
    {
      details: [
        'Presented "Migrating 50 Microservices Without a Single Pager" at DevOpsDays, sharing the methodology and tooling used to migrate a monolith to microservices across 6 enterprise engagements with zero production incidents.',
        'The talk was rated the highest of the conference and led to 3 enterprise consulting engagements. The migration toolkit developed for these projects was later open-sourced and has been used to migrate 150+ services across 6 enterprises.'
      ],
      links: { slides: 'https://devopsdays.org/2019/talk-migration' }
    },
    {
      details: [
        'Promoted to Team Lead, managing a team of 4 engineers. This was my first formal leadership role, transitioning from individual contributor to engineering manager while continuing to contribute code.',
        'Led the team to ship the company\'s first SaaS product in 4 months — from concept to production. Established agile ceremonies, code review practices, and the on-call rotation that became the template for future teams. This role defined my leadership philosophy: lead by example, remove blockers, and never ask your team to do what you wouldn\'t.'
      ],
      links: {}
    },
    {
      details: [
        'My first production commit — a PHP application that processed form submissions for a local business. It was a simple CRUD app with more bugs than I\'d like to admit, but it worked for its purpose and the client was happy.',
        'That commit opened the door to a career in software engineering. The lessons from that first project — test your code, handle errors gracefully, and always deploy on a Tuesday — have stuck with me through 15 years and 40+ systems. Everyone starts somewhere, and that PHP app was mine.'
      ],
      links: {}
    }
  ],
  RU: [
    {
      details: [
        'Выступил с ключевым докладом "Building Resilient Distributed Systems" на QCon London 2026 перед аудиторией 2 500+ участников. Доклад охватывал архитектурные паттерны отказоустойчивых распределенных систем, основанные на 15-летнем опыте проектирования систем с оборотом $4B+.',
        'Сессия получила 97% удовлетворенности — лучший показатель конференции. Приглашение в качестве keynote спикера основано на публикациях в ACM Queue. Доклад запрошен к повторению на QCon São Paulo и QCon San Francisco.'
      ],
      links: { slides: 'https://qcon.london/2026/keynote' }
    },
    {
      details: [
        'Выступил с докладом "Running Go Workflows at Scale" на KubeCon North America 2025 перед аудиторией 1 200+ участников. Доклад охватывал практические уроки из продакшена Temporal в 14 регионах: стратегии версионирования воркфлоу, паттерны rate limiting, наблюдаемость в масштабе.',
        'Сессия получила 94% удовлетворенности — один из лучших показателей конференции. Доклад привел к консультациям с 3 компаниями, слайды просмотрены 5 000+ раз онлайн.'
      ],
      links: { slides: 'https://kubecon.na/2025/slides', video: 'https://youtube.com/kubecon2025-go-workflows' }
    },
    {
      details: [
        'Автор статьи "Event-Driven Architectures in Fintech" в ACM Queue — флагманском журнале Association for Computing Machinery. Статья охватывает паттерны event-driven архитектур в финансовых сервисах: event sourcing, CQRS, stream processing.',
        'Статья получила 40+ академических цитирований и стала обложкой печатного выпуска. Используется как учебный материал в университетах по distributed systems и цитируется в 3 последующих работах.'
      ],
      links: { article: 'https://queue.acm.org/2024/event-driven-fintech' }
    },
    {
      details: [
        'Получен патент US-11789045 на "Детекцию фрода в реальном времени с использованием темпоральных графовых нейросетей." Патент покрывает новый подход к выявлению мошеннических транзакций через моделирование временных связей между сущностями транзакций.',
        'Технология внедрена в систему фрод-детекции на 8 000 TPS с точностью 99.2%, предотвращающую убытки на $12 млн+ в год. Патент цитируется в 5 последующих патентах.'
      ],
      links: { patent: 'https://patents.google.com/patent/US11789045' }
    },
    {
      details: [
        'Запустил kubectl-debugger — open-source CLI инструмент для отладки Kubernetes, набравший 1 000 звезд GitHub за 72 часа. Инструмент решает критическую проблему: отладка Pod без специальных образов или RBAC.',
        'Проект вырос до 2 400+ звезд, 300+ форков, используется 50+ компаниями (включая 2 FAANG). Отмечен в официальном блоге Kubernetes и CNCF newsletter. Сообщество: VS Code extension, веб-терминал.'
      ],
      links: { github: 'https://github.com/RF24KRSK/kubectl-debugger' }
    },
    {
      details: [
        'Назначен руководителем Архитектурного Комитета — совета из 12 команд по стандартизации технических решений. Комитет рассматривал все ключевые архитектурные решения, выбор технологий и дизайн кросс-командных API.',
        'За время руководства стандартизировал Go как основной язык бэкенда, создал гайдлайны API, шаблон сервиса со встроенной наблюдаемостью и сократил время ревью с 3 недель до 3 дней. Стандарты приняты 200+ сервисами.'
      ],
      links: {}
    },
    {
      details: [
        'Выступил с докладом "Миграция 50 микросервисов без единой аварии" на DevOpsDays, поделившись методологией и инструментарием миграции монолитов в 6 enterprise проектах с нулем инцидентов.',
        'Доклад признан лучшим на конференции и привел к 3 консалтинговым проектам. Инструментарий миграции позже опубликован в open source и использован для миграции 150+ сервисов.'
      ],
      links: { slides: 'https://devopsdays.org/2019/talk-migration' }
    },
    {
      details: [
        'Повышение до Team Lead с командой из 4 инженеров. Первая формальная руководящая роль — переход от individual contributor к Engineering Manager с сохранением кодинга.',
        'Команда запустила первый SaaS продукт компании за 4 месяца: от концепции до продакшена. Внедрил agile-церемонии, code review и on-call ротацию. Эта роль сформировала мою философию лидерства: веди примером, убирай блокеры, не проси команду делать то, что не сделал бы сам.'
      ],
      links: {}
    },
    {
      details: [
        'Мой первый коммит в продакшен — PHP приложение для обработки форм местного бизнеса. Простое CRUD с кучей багов, но оно работало и клиент был доволен.',
        'Тот коммит открыл дверь в карьеру разработчика. Уроки первого проекта — тестируй код, обрабатывай ошибки, деплой во вторник — остались со мной на 15 лет и 40+ систем. Мы все с чего-то начинали, и мое PHP-приложение было моим началом.'
      ],
      links: {}
    }
  ]
};
