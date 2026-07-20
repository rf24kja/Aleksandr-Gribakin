import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const TOKEN = '8825772515:AAHFj-czR5tdpAcUzTvFo17-5VjAMpJr8qk';
const CHAT_ID = 770419171;
const API = `https://api.telegram.org/bot${TOKEN}`;
const CWD = dirname(fileURLToPath(import.meta.url));
const LOG = fileURLToPath(new URL('./bot.log', import.meta.url));

let offset = 0;
let building = false;
let started = Date.now();
let running = true;

import { appendFileSync, writeFileSync } from 'fs';
writeFileSync(LOG, `[${new Date().toISOString()}] START\n`);

function log(m) {
  try { appendFileSync(LOG, `[${new Date().toISOString()}] ${m}\n`); } catch {}
}

const PROJECTS = [
  {id:'payment-mesh',name:'Global Payment Mesh',cat:'Fintech',tag:'Platform',stack:'Go, Temporal, Postgres, Kafka, Kubernetes',desc:'Multi-region payment orchestration. $4B+ annual volume, 99.999% uptime across 14 regions.',metrics:'$4B+ | 14 regions | 50K TPS'},
  {id:'fraud-engine',name:'Real-Time Fraud Engine',cat:'Fintech',tag:'ML/AI',stack:'Python, PyTorch, Kafka, Redis, FastAPI',desc:'ML fraud detection at 8K TPS. 99.2% precision, 40ms inference, $12M saved Y1.',metrics:'8K TPS | 99.2% | $12M saved'},
  {id:'audit-log',name:'Immutable Audit Pipeline',cat:'Fintech',tag:'Infrastructure',stack:'Rust, Kafka, ClickHouse, S3, Grafana',desc:'Immutable audit log. 1M events/sec, 5-year retention, sub-200ms queries. SOC2/PCI.',metrics:'1M/s | 5yr | 200ms queries'},
  {id:'compliance',name:'Compliance Engine',cat:'Fintech',tag:'Platform',stack:'Go, PostgreSQL, Temporal, OpenPolicyAgent',desc:'Policy-driven compliance. 4K rules/tx in <5ms. Automated regulatory reporting.',metrics:'4K rules | <5ms'},
  {id:'ledger',name:'Double-Entry Ledger Service',cat:'Fintech',tag:'Platform',stack:'Rust, SQLite, gRPC, NATS, Prometheus',desc:'Embedded ledger for payment flows. 200K entries/sec per node, strict ACID.',metrics:'200K/s | ACID'},
  {id:'billing',name:'Usage-Based Billing Platform',cat:'Fintech',tag:'Platform',stack:'Go, Stripe, Redis, Postgres, Kafka',desc:'Usage metering + billing. 10K events/sec, 99.99% invoice accuracy.',metrics:'10K/s | 99.99%'},
  {id:'kyc-orch',name:'KYC Orchestrator',cat:'Fintech',tag:'Platform',stack:'TypeScript, Node, AWS Textract, Step Functions',desc:'Document verification. 300K+ verifications, 95% auto-approval.',metrics:'300K+ | 95% auto'},
  {id:'ml-platform',name:'ML Training Platform',cat:'ML/AI',tag:'Platform',stack:'Python, PyTorch, Ray, AWS, Docker',desc:'ML platform for 200+ data scientists. Distributed training, model registry.',metrics:'200+ scientists | 3x velocity'},
  {id:'feature-store',name:'Real-Time Feature Store',cat:'ML/AI',tag:'Infrastructure',stack:'Go, Redis, Kafka, S3, Flink',desc:'Online/offline feature serving. 2ms p99 retrieval, 10K features.',metrics:'2ms p99 | 10K features'},
  {id:'model-mesh',name:'Model Serving Mesh',cat:'ML/AI',tag:'Infrastructure',stack:'Python, Triton, K8s, Envoy, Prometheus',desc:'50+ model types, auto-scaling to zero, sub-10ms p50 inference.',metrics:'50+ models | 10ms p50'},
  {id:'nlp-pipe',name:'NLP Pipeline',cat:'ML/AI',tag:'Platform',stack:'Python, Transformers, Elasticsearch',desc:'Document NLP. 10M docs/day, NER+classification+summarization, 94% F1.',metrics:'10M/day | 94% F1'},
  {id:'anomaly',name:'Anomaly Detection System',cat:'ML/AI',tag:'Platform',stack:'Python, Prophet, TimescaleDB, Grafana, Kafka',desc:'Real-time anomaly detection. 5K metric streams, <30s alert latency.',metrics:'5K streams | 96% precision'},
  {id:'data-lake',name:'Distributed Data Lake',cat:'Infrastructure',tag:'Data',stack:'Rust, Kafka, S3, Iceberg, Trino',desc:'500TB/day streaming data lake. Rust replaced Spark — 12x speed, 80% savings.',metrics:'500TB/day | 12x'},
  {id:'migration-kit',name:'Migration Toolkit',cat:'Infrastructure',tag:'Platform',stack:'Go, Envoy, Kafka, Terraform, Prometheus',desc:'Zero-downtime monolith→microservices. 6 enterprises, 150+ services.',metrics:'150+ services | 0-downtime'},
  {id:'k8s-operators',name:'K8s Operator Suite',cat:'Infrastructure',tag:'Open Source',stack:'Go, K8s, Prometheus, Helm',desc:'6 operators for DB, canary, secrets. 1K+ GitHub stars.',metrics:'6 operators | 1K+ ★'},
  {id:'cicd',name:'CI/CD Platform',cat:'Infrastructure',tag:'Platform',stack:'Go, Tekton, ArgoCD, Vault, Harbor',desc:'Self-serve CI/CD. 40+ teams, 2K builds/day, 99.9% uptime.',metrics:'40+ teams | 2K/day'},
  {id:'service-mesh',name:'Service Mesh',cat:'Infrastructure',tag:'Platform',stack:'Go, Istio, Envoy, Grafana, Kiali',desc:'Multi-cluster mesh. 3 regions, mTLS, -95% incidents.',metrics:'3 regions | -95% incidents'},
  {id:'paas',name:'Multi-Cloud PaaS',cat:'Infrastructure',tag:'Platform',stack:'Go, Terraform, Pulumi, Crossplane, K8s',desc:'Self-serve on AWS/GCP/Azure. Dev→prod in 12min vs 2 days.',metrics:'12min deploy | 200+ apps'},
  {id:'kubedbg',name:'kubectl-debugger',cat:'Open Source',tag:'CLI',stack:'Go, K8s, Cobra',desc:'K8s Pod debugging CLI. 2.4K★, used by 50+ companies.',metrics:'2.4K★ | 50+ companies'},
  {id:'apitest',name:'api-test-framework',cat:'Open Source',tag:'CLI',stack:'TypeScript, Node, OpenAPI',desc:'Declarative API testing. 1.8K★, 10K+ npm/month.',metrics:'1.8K★ | 10K+/mo'},
  {id:'dbmate',name:'dbmate-pro',cat:'Open Source',tag:'CLI',stack:'Go, PostgreSQL, MySQL, SQLite, ClickHouse',desc:'Multi-DB migration tool. 1.2K★, dry-run, rollback.',metrics:'1.2K★ | multi-DB'},
  {id:'jsval',name:'json-schema-validator',cat:'Open Source',tag:'Library',stack:'Rust, WASM, JSON Schema',desc:'Rust→WASM JSON Schema validator. 5x faster. 800★.',metrics:'5x faster | 800★'},
  {id:'tui-kit',name:'terminal-ui-kit',cat:'Open Source',tag:'Library',stack:'TypeScript, Ink, React',desc:'React TUI library for CLI apps. 12 components. 1.5K★.',metrics:'1.5K★ | 12 components'},
  {id:'did',name:'DID Protocol',cat:'Web3',tag:'Protocol',stack:'Solidity, Go, IPFS, The Graph',desc:'ZK identity for DeFi. 300K+ identities, 60% lower KYC cost. ToB audited.',metrics:'300K+ | 60% savings'},
  {id:'defi-analytics',name:'DeFi Analytics',cat:'Web3',tag:'Platform',stack:'Python, Web3.py, Postgres, Dune, GraphQL',desc:'On-chain analytics. 15 protocols, 5 chains, 50 dashboards.',metrics:'15 protocols | 50 dashboards'},
  {id:'nft-infra',name:'NFT Infrastructure',cat:'Web3',tag:'Infrastructure',stack:'Go, NFT.Storage, IPFS, Alchemy, Redis',desc:'NFT minting + metadata. 500K+ minted, 99.9% uptime.',metrics:'500K+ NFTs | 99.9%'},
  {id:'dao-govern',name:'DAO Governance Toolkit',cat:'Web3',tag:'Platform',stack:'Solidity, TypeScript, Snapshot, The Graph',desc:'Off-chain + on-chain governance. 10 DAOs, 200K+ proposals.',metrics:'10 DAOs | 200K proposals'},
  {id:'saas-engine',name:'Multi-Tenant SaaS',cat:'Platform',tag:'Platform',stack:'Go, React, Postgres, Redis, Terraform',desc:'SaaS for 500K+ businesses. 99.99% SLA.',metrics:'500K+ tenants | 99.99%'},
  {id:'collab-engine',name:'Collab Engine',cat:'Platform',tag:'Platform',stack:'TypeScript, CRDTs, WebSockets, ScyllaDB',desc:'CRDT sync engine. 10K concurrent editors, <50ms conflict resolution.',metrics:'10K editors | <50ms'},
  {id:'event-sourcing',name:'Event Sourcing Platform',cat:'Platform',tag:'Infrastructure',stack:'Go, Kafka, Postgres, Debezium',desc:'Event sourcing + CQRS. 500+ event types, 100K/s throughput.',metrics:'500 types | 100K/s'},
  {id:'api-gateway',name:'Unified API Gateway',cat:'Platform',tag:'Infrastructure',stack:'Go, Envoy, Redis, OpenAPI, OAuth2',desc:'Gateway for 200+ services. 200K req/s per node.',metrics:'200 services | 200K/s'},
  {id:'dev-portal',name:'Developer Portal',cat:'Platform',tag:'Platform',stack:'React, Backstage, TypeScript, GraphQL',desc:'Backstage portal. 40+ plugins, 200 services, 1K+ daily engineers.',metrics:'40 plugins | 1K+ engineers'},
];

const CAREER = [
  {period:'2023–2026',role:'Principal Engineer',company:'Tech Corp',desc:'Architected multi-region payment mesh handling $4B+ annually. Led 20+ engineers.'},
  {period:'2020–2023',role:'Head of Engineering',company:'FinScale',desc:'Built team 2→18. Fraud detection at 8K TPS. Monolith→60 microservices.'},
  {period:'2017–2020',role:'Tech Lead / Architect',company:'DataStream',desc:'Data lake processing 500TB/day. Spark→Rust: 12x throughput.'},
  {period:'2014–2017',role:'Sr Full Stack Engineer',company:'WebScale',desc:'SaaS for 500K+ businesses. PHP→Go+React: 8x improvement.'},
  {period:'2011–2014',role:'Full Stack Developer',company:'StartupLab',desc:'Shipped 12 products in 3 years. First hire→Series A exit.'},
];

const ACHIEVEMENTS = [
  {year:'2026',title:'Keynote — QCon London',desc:'"Building Resilient Distributed Systems" — 2,500+ attendees, 97% rating.'},
  {year:'2025',title:'Speaker — KubeCon NA',desc:'"Running Go Workflows at Scale" — 1,200+ attendees.'},
  {year:'2024',title:'Published — ACM Queue',desc:'Authored "Event-Driven Architectures in Fintech". 40+ citations.'},
  {year:'2023',title:'Patent — US-11789045',desc:'Real-time fraud detection using temporal graph neural networks.'},
  {year:'2022',title:'OSS Launch — K8s Debugger',desc:'kubectl plugin hit 1K★ in 72 hours. 2.4K★ current.'},
  {year:'2021',title:'Lead — Architecture Committee',desc:'Led 12-squad architecture review board.'},
  {year:'2019',title:'Speaker — DevOpsDays',desc:'"Migrating 50 Microservices Without a Single Pager" — best talk.'},
  {year:'2016',title:'First Team Lead Role',desc:'Led 4 engineers. Shipped first SaaS product in 4 months.'},
  {year:'2011',title:'First Production Commit',desc:'A PHP app. It worked. Mostly.'},
];

const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map(p => [p.id, p]));

async function api(m, b) {
  const r = await fetch(`${API}/${m}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(b ?? {}),
  });
  return r.json();
}

async function send(c, t) {
  log(`send ${c}: ${t.slice(0,60)}`);
  await api('sendMessage', { chat_id: c, text: t }).catch(e => log(`send fail ${e.message}`));
}

async function getStatus() {
  try {
    const t = Date.now();
    const r = await fetch('http://localhost:3000', { signal: AbortSignal.timeout(5000) });
    return r.ok ? `UP (${r.status}) ${Date.now()-t}ms` : `ERR ${r.status}`;
  } catch (e) { return `DOWN ${e.message}`; }
}

async function doBuild() {
  if (building) return 'Build in progress';
  building = true;
  try {
    const r = spawnSync('npm', ['run', 'build'], { cwd: CWD, timeout: 60000, encoding: 'utf8' });
    const ok = r.status === 0;
    const tail = (r.stdout || '').split('\n').filter(l => l.includes('✓')||l.includes('error')).slice(-3).join('\n').trim();
    return ok ? `OK\n${tail||'ok'}` : `FAIL\n${tail||'no output'}`;
  } catch (e) { return `FAIL ${e.message}`; }
  finally { building = false; }
}

async function handle(msg) {
  const cid = msg.chat.id;
  const txt = (msg.text || '').trim();
  const cmd = txt.split(' ')[0].toLowerCase();
  const arg = txt.slice(cmd.length).trim();
  log(`handle ${cmd} from ${cid}`);

  try {
    if (cmd === '/start' || cmd === '/help') {
      await send(cid, [
        'AG Portfolio Bot',
        '',
        '/projects — list all 32 projects',
        '/projects <cat> — filter (Fintech, ML/AI, Infrastructure, Open Source, Web3, Platform)',
        '/p<N> — project detail (e.g. /p1)',
        '/career — timeline',
        '/c<N> — career detail',
        '/achievements — milestones',
        '/a<N> — achievement detail',
        '/stats — impact stats',
        '/status — site health',
        '/build — rebuild',
        '/uptime — bot uptime',
        '/contact — info',
        '/help — this',
      ].join('\n'));
      return;
    }

    if (cmd === '/contact') {
      await send(cid, `Aleksandr Gribakin\n${'Lead Full Stack Engineer & System Architect'}\nRF24KRSK@gmail.com\ngithub.com/RF24KRSK\ndev24.pro`);
      return;
    }

    if (cmd === '/stats') {
      const s = ['15+ years in production','40+ systems','7 teams led','24 open source repos','14 countries','12M+ users served'];
      await send(cid, s.map((l,i) => `${i+1}. ${l}`).join('\n'));
      return;
    }

    if (cmd === '/status') { await send(cid, `/status ${await getStatus()}`); return; }
    if (cmd === '/uptime') {
      const s = Math.floor((Date.now()-started)/1000);
      await send(cid, `Uptime: ${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`);
      return;
    }
    if (cmd === '/build') { await send(cid, 'Building...'); await send(cid, await doBuild()); return; }

    if (cmd === '/career') {
      await send(cid, CAREER.map((c,i) => `${i+1}. ${c.role} @ ${c.company} /c${i+1}`).join('\n'));
      return;
    }

    if (cmd === '/achievements' || cmd === '/ach') {
      await send(cid, ACHIEVEMENTS.map((a,i) => `${i+1}. ${a.year}: ${a.title} /a${i+1}`).join('\n'));
      return;
    }

    if (cmd === '/projects' || cmd === '/proj') {
      const cat = arg.toLowerCase();
      const list = !cat || cat === 'all' ? PROJECTS : PROJECTS.filter(p => p.cat.toLowerCase() === cat);
      if (!list.length) { await send(cid, `No projects in "${arg}". Try: /projects`); return; }
      await send(cid, list.map((p,i) => `${i+1}. ${p.name} (${p.cat}) /p${i+1}`).join('\n'));
      return;
    }

    const pm = txt.match(/^\/p(\d+)$/i);
    if (pm) {
      const idx = parseInt(pm[1])-1;
      const p = PROJECTS[idx];
      if (!p) { await send(cid, 'Not found. Use /projects'); return; }
      await send(cid, `▸ ${p.name}\n${p.cat} / ${p.tag}\n${p.desc}\n\nStack: ${p.stack}\nMetrics: ${p.metrics}`);
      return;
    }

    const cm = txt.match(/^\/c(\d+)$/i);
    if (cm) {
      const idx = parseInt(cm[1])-1;
      const c = CAREER[idx];
      if (!c) { await send(cid, 'Not found. Use /career'); return; }
      await send(cid, `▸ ${c.role} @ ${c.company}\n${c.period}\n${c.desc}`);
      return;
    }

    const am = txt.match(/^\/a(\d+)$/i);
    if (am) {
      const idx = parseInt(am[1])-1;
      const a = ACHIEVEMENTS[idx];
      if (!a) { await send(cid, 'Not found. Use /achievements'); return; }
      await send(cid, `▸ ${a.year}: ${a.title}\n${a.desc}`);
      return;
    }

    await send(cid, `Unknown: ${cmd}. /help`);
  } catch (e) {
    log(`handle error: ${e.message}`);
    try { await send(cid, 'Error. Try again.'); } catch {}
  }
}

async function poll() {
  try {
    const d = await api('getUpdates', { offset, timeout: 0 });
    if (d.ok && d.result) {
      for (const u of d.result) {
        offset = u.update_id + 1;
        log(`update ${u.update_id}: "${(u.message?.text||'').slice(0,40)}" from ${u.message?.from?.id}`);
        if (u.message?.text) await handle(u.message);
      }
    }
  } catch (e) { log(`poll error: ${e.message}`); }
}

log('started');
poll().then(() => { setInterval(poll, 3000); });
api('sendMessage', { chat_id: CHAT_ID, text: '🤖 Bot restarted' }).catch(() => {});
process.on('uncaughtException', e => log(`uncaught: ${e.message}`));
process.on('unhandledRejection', e => log(`unhandled: ${e?.message||e}`));
