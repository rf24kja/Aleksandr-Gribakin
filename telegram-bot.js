import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { appendFileSync, writeFileSync, readFileSync } from 'fs';
import { get as httpsGet } from 'https';

const TOKEN = '8825772515:AAHFj-czR5tdpAcUzTvFo17-5VjAMpJr8qk';
const CHAT_ID = 770419171;
const API = `https://api.telegram.org/bot${TOKEN}`;
const CWD = dirname(fileURLToPath(import.meta.url));
const LOG = fileURLToPath(new URL('./bot.log', import.meta.url));
const OFFSET_FILE = fileURLToPath(new URL('./bot.offset', import.meta.url));
let offset = (() => { try { return parseInt(readFileSync(OFFSET_FILE, 'utf8')); } catch { return -1; } })();
let started = Date.now();
let lastHeartbeat = Date.now();
let currentProject = CWD;
let currentAgent = 'supervisor';

function log(m) {
  const line = `[${new Date().toISOString()}] ${m}`;
  try { appendFileSync(LOG, line + '\n'); } catch {}
}

// ── Projects data (retained from portfolio) ──
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

// ── Telegram API (using https.get — fetch is unreliable from this env) ──
function tgApi(m, params) {
  return new Promise((resolve, reject) => {
    const qs = params ? '?' + Object.entries(params).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&') : '';
    const url = `${API}/${m}${qs}`;
    const req = httpsGet(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(new Error(`tgApi parse: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('tgApi timeout')); });
  });
}

async function send(c, t) {
  log(`send ${c}: ${t.slice(0,60)}`);
  try {
    const r = await tgApi('sendMessage', { chat_id: c, text: t });
    if (!r.ok) log(`send api nok: ${r.error_code} ${r.description}`);
  } catch (e) { log(`send fail: ${e.message}`); }
}

// ── Session context (continue same session for coherent conversation) ──
const SESSION_FILE = fileURLToPath(new URL('./bot.session', import.meta.url));
const SESSION_TTL = 10 * 60 * 1000; // 10 min
let sessionId = (() => { try { const d = JSON.parse(readFileSync(SESSION_FILE, 'utf8')); if (Date.now() - d.ts < SESSION_TTL) return d.id; } catch {} return null; })();

// ── OpenCode Integration ──
async function runOpenCode(text) {
  // Append instruction for brief answer to keep conversation fluid
  const fullText = text + '\n\n(Ответь кратко, без лишнего анализа. Если нужны уточнения — спроси коротко.)';
  const label = `run oc "${text.slice(0,40)}..."`;
  log(label);
  const start = Date.now();
  try {
    const args = ['run', '--agent', currentAgent, '--format', 'json',
      '--dir', currentProject, '--model', 'opencode/deepseek-v4-flash-free'];
    if (sessionId) args.push('--continue', '--session', sessionId);
    args.push(fullText);

    const r = spawnSync('opencode', args,
      { encoding: 'utf8', timeout: 300000, cwd: currentProject, maxBuffer: 10 * 1024 * 1024, shell: true });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    if (r.error) return `Error: ${r.error.message}`;
    if (r.status !== 0) return `Exit ${r.status}: ${(r.stderr||'').slice(0,200)}`;

    // Parse JSON lines for text parts and sessionID
    const parts = [];
    let newSessionId = null;
    for (const line of (r.stdout || '').split('\n').filter(Boolean)) {
      try {
        const ev = JSON.parse(line);
        if (ev.type === 'step_start' && ev.sessionID) newSessionId = ev.sessionID;
        if (ev.type === 'text' && ev.part?.text) parts.push(ev.part.text);
      } catch {}
    }

    // Persist session
    if (newSessionId) {
      sessionId = newSessionId;
      try { writeFileSync(SESSION_FILE, JSON.stringify({ id: sessionId, ts: Date.now() })); } catch {}
    } else if (sessionId) {
      // Update timestamp on existing session
      try { writeFileSync(SESSION_FILE, JSON.stringify({ id: sessionId, ts: Date.now() })); } catch {}
    }

    const reply = parts.join('\n').trim() || '(no text output)';
    log(`${label} done in ${elapsed}s session=${(sessionId||'').slice(0,20)}`);
    return reply;
  } catch (e) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    log(`${label} fail in ${elapsed}s: ${e.message}`);
    return `Error: ${e.message}`;
  }
}

function execCmd(cmd, opts = {}) {
  if (!cmd || !cmd.trim()) return 'No command';
  const r = spawnSync(cmd, [], { encoding: 'utf8', shell: true, cwd: currentProject, timeout: 60000, maxBuffer: 1024 * 1024, ...opts });
  if (r.error) return `Error: ${r.error.message}`;
  const out = (r.stdout || '').trim();
  const err = (r.stderr || '').trim();
  let res = '';
  if (out) res += out.slice(0, 2000);
  if (err) res += (res ? '\n' : '') + err.slice(0, 2000);
  return res || `(exit ${r.status})`;
}

function getGitStatus() {
  const b = execCmd('git branch --show-current');
  const s = execCmd('git status --short');
  const d = execCmd('git log --oneline -5');
  return `Branch: ${b}\n\nChanges:\n${s || '(clean)'}\n\nRecent:\n${d}`;
}

function getUptime() {
  const s = Math.floor((Date.now() - started) / 1000);
  return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`;
}

// ── Portfolio helpers (retained) ──
async function getStatus() {
  try {
    const t = Date.now();
    const r = await fetch('http://localhost:3000', { signal: AbortSignal.timeout(5000) });
    return r.ok ? `UP (${r.status}) ${Date.now()-t}ms` : `ERR ${r.status}`;
  } catch (e) { return `DOWN ${e.message}`; }
}

let building = false;
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

// ── Command Handler ──
async function handle(msg) {
  const cid = msg.chat.id;
  const txt = (msg.text || '').trim();
  const cmd = txt.split(' ')[0].toLowerCase();
  const arg = txt.slice(cmd.length).trim();
  log(`handle ${cmd} from ${cid}`);

  try {
    // ── OpenCode management commands (checked first) ──
    if (cmd === '/run' || (cmd !== '/start' && cmd !== '/help' && !cmd.startsWith('/'))) {
      // Any non-command text or /run → send to OpenCode
      const task = cmd === '/run' ? arg : txt;
      if (!task) { await send(cid, 'Send a task or use /run <текст>'); return; }
      await send(cid, '⏳ Processing...');
      const result = await runOpenCode(task);
      await send(cid, result.slice(0, 4000));
      return;
    }

    if (cmd === '/status') {
      const lines = [
        `Project: ${currentProject}`,
        `Agent: ${currentAgent}`,
        `Uptime: ${getUptime()}`,
        `Site: ${await getStatus()}`,
        `Git: ${execCmd('git branch --show-current').trim() || '?'}`,
      ];
      await send(cid, lines.join('\n'));
      return;
    }

    if (cmd === '/project') {
      if (!arg) { await send(cid, `Current project:\n${currentProject}`); return; }
      const resolved = resolve(CWD, arg);
      try {
        readFileSync(resolved);
        currentProject = resolved;
        await send(cid, `Switched to:\n${currentProject}`);
      } catch {
        await send(cid, `Directory not found: ${resolved}`);
      }
      return;
    }

    if (cmd === '/agent') {
      if (!arg) { await send(cid, `Current agent:\n${currentAgent}`); return; }
      const name = arg.toLowerCase();
      if (name !== 'supervisor' && name !== 'executor') {
        await send(cid, 'Available: supervisor, executor');
        return;
      }
      currentAgent = name;
      await send(cid, `Switched agent to: ${currentAgent}`);
      return;
    }

    if (cmd === '/session') {
      await send(cid, `Session status — use /status or /stats for details`);
      return;
    }

    if (cmd === '/stats') {
      const ocStats = execCmd('opencode stats').slice(0, 1000);
      const impact = ['15+ years in production','40+ systems','7 teams led','24 open source repos','14 countries','12M+ users served'];
      await send(cid, `── OpenCode ──\n${ocStats || '(no stats)'}\n── Impact ──\n${impact.map((l,i) => `${i+1}. ${l}`).join('\n')}`);
      return;
    }

    if (cmd === '/exec') {
      if (!arg) { await send(cid, 'Usage: /exec <command>'); return; }
      await send(cid, `$ ${arg}\n${execCmd(arg).slice(0, 3000)}`);
      return;
    }

    if (cmd === '/git') {
      await send(cid, getGitStatus().slice(0, 3000));
      return;
    }

    if (cmd === '/restart') {
      await send(cid, 'Restarting...');
      process.exit(0);
      return;
    }

    // ── Portfolio commands (retained) ──
    if (cmd === '/start' || cmd === '/help') {
      await send(cid, [
        'AG Portfolio Bot — OpenCode Control',
        '',
        '── OpenCode ──',
        '/run <text> — send task to OpenCode (two-agent: supervisor→executor)',
        '<any text> — same as /run (auto-detected)',
        '/status — project, agent, model, uptime, git',
        '/project — show current project',
        '/project <path> — switch project',
        '/agent — show current agent',
        '/agent <name> — switch agent (supervisor/executor)',
        '/stats — token usage & cost',
        '/exec <cmd> — run shell command',
        '/git — git status',
        '/restart — restart bot',
        '── Portfolio ──',
        '/projects — list all 32 projects',
        '/projects <cat> — filter',
        '/p<N> — project detail',
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


    if (cmd === '/uptime') { await send(cid, `Uptime: ${getUptime()}`); return; }
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

    // Fallback: send to OpenCode (any non-command text)
    if (txt) {
      await send(cid, '⏳ Processing...');
      const result = await runOpenCode(txt);
      await send(cid, result.slice(0, 4000));
    }
  } catch (e) {
    log(`handle error: ${e.message}`);
    try { await send(cid, 'Error. Try again.'); } catch {}
  }
}

// ── Polling ──
async function poll() {
  try {
    const d = await tgApi('getUpdates', { offset, timeout: 10 });
    if (!d.ok && d.error_code === 409) {
      log(`poll conflict — waiting 10s`);
      await new Promise(r => setTimeout(r, 10000));
    } else if (d.ok && d.result) {
      if (d.result.length) {
        for (const u of d.result) {
          offset = u.update_id + 1;
          const txt = (u.message?.text||'').slice(0,40);
          log(`update ${u.update_id}: "${txt}" from ${u.message?.from?.id}`);
          if (u.message?.text) await handle(u.message);
        }
        try { writeFileSync(OFFSET_FILE, String(offset)); } catch {}
      }
    } else if (!d.ok) {
      log(`poll api error: ${d.error_code} ${d.description}`);
    }
  } catch (e) {
    log(`poll err: ${e.message}`);
    await new Promise(r => setTimeout(r, 3000));
  }
}

// ── Exports (for api/consult.js) ──
export async function notifySubmission({ name, email, message }) {
  const text = [
    `📩 New Consult Submission`,
    `━━━━━━━━━━━━━━━━`,
    `Name: ${name || '—'}`,
    `Email: ${email || '—'}`,
    `Message: ${(message || '').slice(0, 200)}`,
    `━━━━━━━━━━━━━━━━`,
    `Received: ${new Date().toLocaleString()}`,
  ].join('\n');
  await tgApi('sendMessage', { chat_id: CHAT_ID, text }).catch(() => {});
}

// ── Entry point ──
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  writeFileSync(LOG, `[${new Date().toISOString()}] START\n`);
  log('started');

  async function pollLoop() {
    while (true) {
      try { await poll(); } catch (e) { log(`pollLoop error: ${e.message}`); }
      await new Promise(r => setTimeout(r, 1000));
      if (Date.now() - lastHeartbeat > 60000) { log('heartbeat: alive'); lastHeartbeat = Date.now(); }
    }
  }
  pollLoop();

  tgApi('sendMessage', { chat_id: CHAT_ID, text: '🤖 Bot restarted (OpenCode control)' }).catch(() => {});
  process.on('uncaughtException', e => log(`uncaught: ${e.message}`));
  process.on('unhandledRejection', e => log(`unhandled: ${e?.message||e}`));
}
