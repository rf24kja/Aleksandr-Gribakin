// One artefact per project.
//
// The detail pages used to render four generic SVG mockups shared across
// seventeen projects — ten of them showed the identical terminal session, down
// to the same pod hash, and the dashboard mockup carried invented headline
// numbers (99.99%, 50K/s, 12M+) that belong to no project at all. Opening three
// projects in a row showed the same picture three times, which reads as filler
// and undercuts everything written beside it.
//
// Each entry below is instead the shape of the thing the project is actually
// about: the manifest, the query plan, the alert rule. Deliberately
// language-neutral — real config and code, no prose — so the same lines serve
// both locales and only the frame's caption is translated.
//
// `kind` selects the frame chrome; `caption` names the artefact. Line kinds:
//   k  key / directive        v  value / literal      c  comment
//   p  prompt or command      o  command output       h  highlighted result
//   t  plain text

export const PROJECT_SNIPPETS = {
  'bare-to-cloud': {
    kind: 'terminal', caption: 'Staged cutover, one workload at a time',
    lines: [
      { k: 'p', t: 'terraform import aws_instance.legacy_api i-0c3f9a2b' },
      { k: 'o', t: 'Import successful. State now describes the running estate.' },
      { k: 'p', t: 'make parity-soak SERVICE=api DURATION=6w' },
      { k: 'o', t: 'shadow traffic  100%   divergence  0.02%   errors  0' },
      { k: 'p', t: 'make cutover SERVICE=api WEIGHT=10' },
      { k: 'h', t: 'weight 10% → 50% → 100%   rollback armed (5 min)' },
      { k: 'c', t: '# stateful tier moves last, after the network path is proven' },
    ],
  },

  'k8s-platform': {
    kind: 'editor', caption: 'The whole manifest a product team writes',
    lines: [
      { k: 'k', t: 'apiVersion:', v: ' platform.internal/v1' },
      { k: 'k', t: 'kind:', v: ' Namespace Request' },
      { k: 'k', t: 'metadata:' },
      { k: 'k', t: '  name:', v: ' checkout' },
      { k: 'k', t: 'spec:' },
      { k: 'k', t: '  tier:', v: ' production' },
      { k: 'k', t: '  quota:', v: ' medium' },
      { k: 'k', t: '  ingress:', v: ' checkout.example.com' },
      { k: 'c', t: '# quotas, NetworkPolicy, TLS, logging and a dashboard' },
      { k: 'c', t: '# are provisioned from this. Nothing else is required.' },
    ],
  },

  'iac-baseline': {
    kind: 'terminal', caption: 'The test of whether it is really code',
    lines: [
      { k: 'p', t: 'terraform destroy -auto-approve   # staging' },
      { k: 'o', t: 'Destroy complete. Resources: 78 destroyed.' },
      { k: 'p', t: 'terraform apply -auto-approve' },
      { k: 'o', t: 'Apply complete. Resources: 78 added, 0 changed.' },
      { k: 'p', t: 'terraform plan -detailed-exitcode' },
      { k: 'h', t: 'No changes. Infrastructure matches configuration. (exit 0)' },
      { k: 'c', t: '# if rebuilding an environment is frightening, it is not IaC yet' },
    ],
  },

  'env-parity': {
    kind: 'terminal', caption: 'Same digest in every environment',
    lines: [
      { k: 'p', t: 'for env in local ci staging production; do' },
      { k: 'p', t: '  img digest "$env" app; done' },
      { k: 'o', t: 'local       sha256:9f2c41ab…' },
      { k: 'o', t: 'ci          sha256:9f2c41ab…' },
      { k: 'o', t: 'staging     sha256:9f2c41ab…' },
      { k: 'o', t: 'production  sha256:9f2c41ab…' },
      { k: 'h', t: '4/4 identical — configuration differs, the image does not' },
    ],
  },

  'pipeline-standard': {
    kind: 'editor', caption: 'One template, opted into by service type',
    lines: [
      { k: 'k', t: 'include:' },
      { k: 'k', t: '  - project:', v: ' platform/ci-templates' },
      { k: 'k', t: '    file:', v: ' /service.yml' },
      { k: 't', t: '' },
      { k: 'k', t: 'variables:' },
      { k: 'k', t: '  SERVICE_TYPE:', v: ' go-api' },
      { k: 'k', t: '  DEPLOY_ON:', v: ' tag' },
      { k: 't', t: '' },
      { k: 'c', t: '# build, unit, integration, scan, sign, promote:' },
      { k: 'c', t: '# inherited. Copies drift; an include cannot.' },
    ],
  },

  'zero-downtime': {
    kind: 'editor', caption: 'Promotion gated on health, not on a timer',
    lines: [
      { k: 'k', t: 'strategy:' },
      { k: 'k', t: '  canary:' },
      { k: 'k', t: '    steps:' },
      { k: 'k', t: '      - setWeight:', v: ' 10' },
      { k: 'k', t: '      - analysis:', v: ' [error-rate, p99-latency]' },
      { k: 'k', t: '      - setWeight:', v: ' 50' },
      { k: 'k', t: '      - analysis:', v: ' [error-rate, p99-latency]' },
      { k: 'k', t: '  abortOnFailure:', v: ' true' },
      { k: 'h', t: 'analysis fails → traffic returns to stable in ~90s' },
    ],
  },

  'gitops': {
    kind: 'editor', caption: 'The reconciler owns the cluster, not the console',
    lines: [
      { k: 'k', t: 'apiVersion:', v: ' argoproj.io/v1alpha1' },
      { k: 'k', t: 'kind:', v: ' Application' },
      { k: 'k', t: 'spec:' },
      { k: 'k', t: '  source:' },
      { k: 'k', t: '    repoURL:', v: ' git@…/platform-manifests' },
      { k: 'k', t: '    targetRevision:', v: ' main' },
      { k: 'k', t: '  syncPolicy:' },
      { k: 'k', t: '    automated:' },
      { k: 'k', t: '      prune:', v: ' true' },
      { k: 'k', t: '      selfHeal:', v: ' true' },
      { k: 'c', t: '# selfHeal reverts anything applied by hand. On purpose.' },
    ],
  },

  'monolith-split': {
    kind: 'editor', caption: 'Strangler routing: one seam moves at a time',
    lines: [
      { k: 'k', t: 'location /api/orders/ {' },
      { k: 'k', t: '  proxy_pass', v: ' http://orders-service;' },
      { k: 'k', t: '}' },
      { k: 'k', t: 'location / {' },
      { k: 'k', t: '  proxy_pass', v: ' http://monolith;' },
      { k: 'k', t: '}' },
      { k: 'c', t: '# the seam follows data ownership, not folder layout:' },
      { k: 'c', t: '# orders owns its tables outright before the route moves' },
      { k: 'h', t: 'monolith serves every other path throughout — no freeze' },
    ],
  },

  'api-layer': {
    kind: 'editor', caption: 'One contract, two transports, generated clients',
    lines: [
      { k: 'k', t: 'paths:' },
      { k: 'k', t: '  /orders/{id}:' },
      { k: 'k', t: '    get:' },
      { k: 'k', t: '      operationId:', v: ' getOrder' },
      { k: 'k', t: '      responses:' },
      { k: 'k', t: '        "200":' },
      { k: 'k', t: '          $ref:', v: ' "#/components/schemas/Order"' },
      { k: 't', t: '' },
      { k: 'p', t: 'make generate   # ts client + go server stubs' },
      { k: 'h', t: 'a breaking change fails the build, not the request' },
    ],
  },

  'async-jobs': {
    kind: 'editor', caption: 'Retries that are safe to actually retry',
    lines: [
      { k: 'k', t: '@app.task(', v: 'bind=True, max_retries=5,' },
      { k: 'k', t: '          ', v: 'autoretry_for=(TransientError,),' },
      { k: 'k', t: '          ', v: 'retry_backoff=True, retry_jitter=True)' },
      { k: 'k', t: 'def', v: ' charge_invoice(self, invoice_id, idem_key):' },
      { k: 'k', t: '    if', v: ' already_processed(idem_key):' },
      { k: 'k', t: '        return', v: ' Result.ALREADY_DONE' },
      { k: 'k', t: '    ...' },
      { k: 'c', t: '# exhausted retries land in a dead-letter queue' },
      { k: 'c', t: '# that is triaged, not just monitored' },
    ],
  },

  'pg-highload': {
    kind: 'terminal', caption: 'The win came from the plan, not the hardware',
    lines: [
      { k: 'p', t: 'EXPLAIN (ANALYZE, BUFFERS) SELECT … WHERE tenant_id = $1' },
      { k: 'o', t: 'Seq Scan on events  (rows=8420117)' },
      { k: 'o', t: '  Buffers: shared read=214883' },
      { k: 'o', t: '  Execution Time: 4211.6 ms' },
      { k: 'p', t: 'CREATE INDEX CONCURRENTLY … ON events (tenant_id, created_at);' },
      { k: 'o', t: 'Index Scan using events_tenant_created_idx  (rows=1204)' },
      { k: 'h', t: 'Execution Time: 3.9 ms   — no new hardware' },
    ],
  },

  'cache-tiers': {
    kind: 'editor', caption: 'Each tier declares what it may be wrong about',
    lines: [
      { k: 'k', t: 'cdn:', v: '     s-maxage=86400, stale-while-revalidate=60' },
      { k: 'k', t: 'edge:', v: '    s-maxage=300   key=(path, accept-language)' },
      { k: 'k', t: 'app:', v: '     ttl=60s        key=order:{id}:v3' },
      { k: 'k', t: 'query:', v: '   ttl=5s         key=stmt-hash' },
      { k: 't', t: '' },
      { k: 'c', t: '# writes bump the version in the key rather than deleting:' },
      { k: 'c', t: '# invalidation becomes a rename, which cannot half-fail' },
      { k: 'h', t: 'order:1042:v3 → order:1042:v4' },
    ],
  },

  'search-stack': {
    kind: 'terminal', caption: 'Reindex against live traffic, no window',
    lines: [
      { k: 'p', t: 'POST /_reindex  { source: products_v3, dest: products_v4 }' },
      { k: 'o', t: 'created 2,418,905   conflicts 0   took 12m41s' },
      { k: 'p', t: 'POST /_aliases' },
      { k: 'o', t: '{ actions: [ { remove: products_v3, alias: products },' },
      { k: 'o', t: '             { add:    products_v4, alias: products } ] }' },
      { k: 'h', t: 'atomic swap — readers never see a missing alias' },
      { k: 'c', t: '# v3 stays until v4 has served a full day' },
    ],
  },

  'spa-ssr': {
    kind: 'editor', caption: 'Server for first paint, client for the rest',
    lines: [
      { k: 'k', t: 'const', v: ' stream = renderToPipeableStream(<App url={req.url} />, {' },
      { k: 'k', t: '  onShellReady()', v: ' {' },
      { k: 'k', t: '    res.setHeader(', v: '"Content-Type", "text/html")' },
      { k: 'k', t: '    stream.pipe(res)', v: '            // shell goes out first' },
      { k: 'k', t: '  },' },
      { k: 'k', t: '  bootstrapModules:', v: ' ["/entry.client.js"]' },
      { k: 'k', t: '})' },
      { k: 'c', t: '# crawlers get complete HTML; the client hydrates over it' },
    ],
  },

  'ui-kit': {
    kind: 'editor', caption: 'States and tokens, not one-off styles',
    lines: [
      { k: 'k', t: '.btn {' },
      { k: 'k', t: '  background:', v: ' var(--color-action);' },
      { k: 'k', t: '  min-block-size:', v: ' var(--target-min);   /* 44px */' },
      { k: 'k', t: '}' },
      { k: 'k', t: '.btn:focus-visible {' },
      { k: 'k', t: '  outline:', v: ' 2px solid var(--color-focus);' },
      { k: 'k', t: '}' },
      { k: 'c', t: '# every component ships hover, focus, disabled, loading' },
      { k: 'h', t: 'contrast and target size asserted in CI, per state' },
    ],
  },

  'observability': {
    kind: 'editor', caption: 'Alerts on the budget, not on the spike',
    lines: [
      { k: 'k', t: '- alert:', v: ' CheckoutErrorBudgetBurn' },
      { k: 'k', t: '  expr:', v: ' (' },
      { k: 'k', t: '    error_ratio5m{svc="checkout"}', v: ' > 14.4 * 0.001' },
      { k: 'k', t: '    and' },
      { k: 'k', t: '    error_ratio1h{svc="checkout"}', v: ' > 14.4 * 0.001' },
      { k: 'k', t: '  )' },
      { k: 'k', t: '  for:', v: ' 2m' },
      { k: 'c', t: '# two windows, so a brief spike does not wake anyone;' },
      { k: 'c', t: '# a real burn does, hours before the SLO is missed' },
    ],
  },

  'incident': {
    kind: 'terminal', caption: 'The runbook is opened during drills',
    lines: [
      { k: 'p', t: 'oncall drill --service checkout --scenario db-failover' },
      { k: 'o', t: 'runbook  checkout/db-failover.md   last verified 19d ago' },
      { k: 'o', t: 'step 1/6  confirm replica lag …………… ok' },
      { k: 'o', t: 'step 2/6  promote standby ……………… ok' },
      { k: 'o', t: 'step 4/6  rotate connection pool …… STALE' },
      { k: 'h', t: 'drill filed PR #218: fix step 4, re-verify' },
      { k: 'c', t: '# a runbook nobody has followed since it was written is fiction' },
    ],
  },
};

export function snippetFor(id) {
  return PROJECT_SNIPPETS[id] || null;
}
