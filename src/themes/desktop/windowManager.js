// How much of a window must stay on screen. Enough that the title bar — and
// with it the close button — can always be grabbed back.
const KEEP_VISIBLE = 96
const EDGE_GAP = 8

/** Usable height above the taskbar, which is fixed to the bottom of the shell. */
function workArea() {
  const taskbar = document.getElementById('taskbar')
  const taskbarH = taskbar ? taskbar.getBoundingClientRect().height : 42
  return { width: window.innerWidth, height: Math.max(160, window.innerHeight - taskbarH) }
}

export default class WindowManager {
  constructor(container) {
    this.container = container
    this.windows = new Map()
    this.zIndex = 100
    this.activeId = null
    this._onWindowChange = null
  }

  onWindowChange(fn) {
    this._onWindowChange = fn
  }

  open({ id, title, icon, content, width, height }) {
    if (this.windows.has(id)) { this.focus(id); return }
    const win = document.createElement('div')
    win.className = 'desk-window'
    win.id = id
    // A window used to open at its requested size wherever the cascade put it.
    // On a short viewport — a laptop with browser chrome, a phone in landscape
    // — a 640x440 window on an 801x389 screen ran off the bottom, and nothing
    // in this desktop resizes, so the content below the fold was unreachable.
    const area = workArea()
    const w = Math.min(width || 520, area.width - EDGE_GAP * 2)
    const h = Math.min(height || 360, area.height - EDGE_GAP * 2)
    const step = this.windows.size
    win.style.width = `${w}px`
    win.style.height = `${h}px`
    win.style.left = `${Math.max(EDGE_GAP, Math.min(60 + step * 28, area.width - w - EDGE_GAP))}px`
    win.style.top = `${Math.max(EDGE_GAP, Math.min(40 + step * 24, area.height - h - EDGE_GAP))}px`
    win.style.zIndex = ++this.zIndex

    win.innerHTML = `
      <div class="window-titlebar">
        <span class="wt-label">${icon || ''} ${title}</span>
        <span class="wt-actions">
          <button class="wt-btn wt-minimize" data-action="minimize" aria-label="Minimize"></button>
          <button class="wt-btn wt-close" data-action="close" aria-label="Close"></button>
        </span>
      </div>
      <div class="window-body">${content}</div>
    `

    const tb = win.querySelector('.window-titlebar')
    tb.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.wt-btn')) return
      this.focus(id)
      const rect = win.getBoundingClientRect()
      const dx = e.clientX - rect.left
      const dy = e.clientY - rect.top
      win.classList.add('dragging')
      // Only the left and top edges were clamped, so a window could be dragged
      // past the right or bottom edge until it was entirely off screen — close
      // button included — with no way to bring it back.
      function onMove(e) {
        const area = workArea()
        const width = win.offsetWidth
        const minLeft = KEEP_VISIBLE - width
        const maxLeft = area.width - KEEP_VISIBLE
        const maxTop = area.height - 32
        win.style.left = `${Math.min(Math.max(minLeft, e.clientX - dx), maxLeft)}px`
        win.style.top = `${Math.min(Math.max(0, e.clientY - dy), maxTop)}px`
      }
      function onUp() {
        win.classList.remove('dragging')
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
      }
      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    })

    win.addEventListener('click', (e) => {
      const btn = e.target.closest('.wt-btn')
      if (!btn) return
      const action = btn.dataset.action
      if (action === 'close') this.close(id)
      if (action === 'minimize') this.minimize(id)
    })

    win.addEventListener('pointerdown', () => this.focus(id))

    this.container.appendChild(win)
    this.windows.set(id, win)
    this.activeId = id
    this._notify()
    return win
  }

  close(id) {
    const win = this.windows.get(id)
    if (!win) return
    win.remove()
    this.windows.delete(id)
    if (this.activeId === id) {
      const keys = [...this.windows.keys()]
      this.activeId = keys.length ? keys[keys.length - 1] : null
    }
    this._notify()
  }

  minimize(id) {
    const win = this.windows.get(id)
    if (!win) return
    win.style.display = 'none'
    if (this.activeId === id) {
      const keys = [...this.windows.keys()]
      this.activeId = keys.length && keys[keys.length - 1] !== id ? keys[keys.length - 1] : keys.length > 1 ? keys[keys.length - 2] : null
    }
    this._notify()
  }

  restore(id) {
    const win = this.windows.get(id)
    if (!win) return
    win.style.display = 'flex'
    this.focus(id)
  }

  focus(id) {
    const win = this.windows.get(id)
    if (!win) return
    win.style.zIndex = ++this.zIndex
    this.activeId = id
    this._notify()
  }

  isOpen(id) {
    return this.windows.has(id)
  }

  isVisible(id) {
    const win = this.windows.get(id)
    return win && win.style.display !== 'none'
  }

  _notify() {
    if (this._onWindowChange) this._onWindowChange(this._getState())
  }

  _getState() {
    const list = []
    this.windows.forEach((win, id) => {
      list.push({ id, title: win.querySelector('.wt-label')?.textContent?.trim() || id, visible: win.style.display !== 'none' })
    })
    return { list, active: this.activeId }
  }

  /** Pulls every window back into the work area after the viewport changes. */
  reflow() {
    const area = workArea()
    this.windows.forEach((win) => {
      const width = Math.min(win.offsetWidth, area.width - EDGE_GAP * 2)
      const height = Math.min(win.offsetHeight, area.height - EDGE_GAP * 2)
      win.style.width = `${width}px`
      win.style.height = `${height}px`
      const left = Math.min(Math.max(KEEP_VISIBLE - width, win.offsetLeft), area.width - KEEP_VISIBLE)
      const top = Math.min(Math.max(0, win.offsetTop), area.height - 32)
      win.style.left = `${left}px`
      win.style.top = `${top}px`
    })
  }

  closeAll() {
    this.windows.forEach((_, id) => this.close(id))
  }
}
