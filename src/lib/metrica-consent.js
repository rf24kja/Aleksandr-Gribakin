import PONYTAIL from '../config/ponytail.config.js';
import './metrica-consent.css';

const KEY = 'dev24_metrica_consent_v1';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const remember = (value) => { try { localStorage.setItem(KEY, value); } catch { /* Session-only choice when storage is blocked. */ } };

export function initMetricaConsent(onChange) {
  let choice = read();
  let panel;
  const language = () => document.documentElement.lang.toUpperCase() === 'RU' ? 'RU' : 'EN';
  const settings = document.createElement('button');
  settings.type = 'button'; settings.dataset.metricaSettings = ''; settings.className = 'metrica-settings';
  const close = () => { panel?.remove(); panel = null; };
  const render = () => {
    const lang = language();
    const copy = PONYTAIL.LOCALE[lang].METRICA;
    settings.textContent = copy.SETTINGS;
    close();
    if (choice !== null) return;
    panel = document.createElement('section'); panel.dataset.metricaConsent = ''; panel.className = 'metrica-consent';
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', copy.TITLE);
    const title = document.createElement('strong'); title.textContent = copy.TITLE;
    const text = document.createElement('p'); text.textContent = copy.TEXT;
    const actions = document.createElement('div'); actions.className = 'metrica-consent-actions';
    const choose = (value) => { choice = value; remember(value); onChange(value === 'accepted'); close(); settings.focus(); };
    const accept = document.createElement('button'); accept.type = 'button'; accept.dataset.metricaAccept = ''; accept.textContent = copy.ACCEPT; accept.addEventListener('click', () => choose('accepted'));
    const decline = document.createElement('button'); decline.type = 'button'; decline.dataset.metricaDecline = ''; decline.textContent = copy.DECLINE; decline.addEventListener('click', () => choose('declined'));
    const privacy = document.createElement('a'); privacy.href = lang === 'RU' ? '/ru/privacy' : '/privacy'; privacy.textContent = copy.PRIVACY;
    actions.append(decline, accept, privacy); panel.append(title, text, actions); document.body.appendChild(panel);
  };
  settings.addEventListener('click', () => { remember('declined'); choice = null; onChange(false); render(); });
  document.body.appendChild(settings);
  document.addEventListener('locale:change', () => queueMicrotask(render));
  window.addEventListener('storage', (event) => { if (event.key === KEY) { choice = read(); onChange(choice === 'accepted'); render(); } });
  render(); onChange(choice === 'accepted');
}
