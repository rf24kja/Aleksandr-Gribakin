/**
 * One copy-to-clipboard handler for the whole site.
 *
 * Business and desktop both offer the wallet address, and a button that
 * silently does nothing is worse than no button — so the failure path matters
 * as much as the happy one. `navigator.clipboard` needs a secure context and
 * permission; where it is missing or refused, the selection fallback still
 * works, and where even that fails the label says so instead of claiming a
 * success that did not happen.
 */

const RESTORE_MS = 1600;

async function writeText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to the selection fallback */ }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    // Off-screen rather than hidden: a display:none textarea cannot be selected.
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Delegated, so markup rendered after this runs is covered too.
 * A button carries the text in `data-copy` and its confirmation in
 * `data-copy-done`; `data-copy-failed` is optional and falls back to the text
 * itself staying selectable on the page.
 */
export function wireCopyButtons(root = document) {
  if (root.__copyWired) return;
  root.__copyWired = true;
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    e.preventDefault();
    const label = btn.dataset.copyLabel || btn.textContent;
    btn.dataset.copyLabel = label;
    const ok = await writeText(btn.dataset.copy);
    btn.textContent = ok
      ? (btn.dataset.copyDone || '✓')
      : (btn.dataset.copyFailed || label);
    if (!ok) btn.setAttribute('data-copy-state', 'failed');
    clearTimeout(btn.__copyTimer);
    btn.__copyTimer = setTimeout(() => {
      btn.textContent = label;
      btn.removeAttribute('data-copy-state');
    }, RESTORE_MS);
  });
}
