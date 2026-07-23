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
    win.style.width = `${width || 520}px`
    win.style.height = `${height || 360}px`
    win.style.left = `${60 + this.windows.size * 28}px`
    win.style.top = `${40 + this.windows.size * 24}px`
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
      function onMove(e) {
        win.style.left = `${Math.max(0, e.clientX - dx)}px`
        win.style.top = `${Math.max(0, e.clientY - dy)}px`
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

  closeAll() {
    this.windows.forEach((_, id) => this.close(id))
  }
}
