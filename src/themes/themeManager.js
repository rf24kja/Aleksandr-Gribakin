const MODES = ['business', 'desktop', 'terminal']

export function getMode() {
  return document.documentElement.getAttribute('data-mode') || 'business'
}

export function setMode(mode) {
  if (!MODES.includes(mode)) return
  const prev = getMode()
  if (prev === mode) return
  document.documentElement.setAttribute('data-mode', mode)
  localStorage.setItem('portfolio-mode', mode)
  document.dispatchEvent(new CustomEvent('mode:change', { detail: { from: prev, to: mode } }))
}

export function initMode() {
  const saved = localStorage.getItem('portfolio-mode')
  const mode = (saved && MODES.includes(saved)) ? saved : 'business'
  document.documentElement.setAttribute('data-mode', mode)
}

export { MODES }
