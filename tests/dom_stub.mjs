/* Minimal DOM stub sufficient to boot the BMKG app module in Node. */
export function decodeEntities(s) {
  return String(s == null ? '' : s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

class ClassList {
  constructor() { this.s = new Set(); }
  add(...c) { c.forEach(x => x && this.s.add(x)); }
  remove(...c) { c.forEach(x => this.s.delete(x)); }
  contains(c) { return this.s.has(c); }
  toggle(c, f) { if (f === undefined) f = !this.s.has(c); f ? this.s.add(c) : this.s.delete(c); return f; }
}

export function makeEl(id) {
  const el = {
    id: id || '', tagName: 'DIV', children: [], dataset: {}, attrs: {},
    style: { setProperty() {}, removeProperty() {}, cssText: '' },
    classList: new ClassList(),
    innerHTML: '', textContent: '', offsetWidth: 100, offsetHeight: 100,
    offsetParent: {}, disabled: false, scrollTop: 0, scrollHeight: 100,
    setAttribute(k, v) { this.attrs[k] = String(v); },
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    hasAttribute(k) { return k in this.attrs; },
    removeAttribute(k) { delete this.attrs[k]; },
    addEventListener() {}, removeEventListener() {},
    appendChild(c) { this.children.push(c); return c; },
    append(...c) { this.children.push(...c); },
    insertBefore(c) { this.children.push(c); return c; },
    removeChild(c) { return c; }, remove() {},
    focus() { documentStub.activeElement = el; }, blur() {}, click() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    contains() { return false; },
    getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }; },
    scrollIntoView() {}, scrollTo() {},
    cloneNode() { return makeEl(this.id); },
    getContext() {
      return {
        fillStyle: '', font: '',
        fillRect() {}, fillText() {}
      };
    },
    toDataURL() { return 'data:image/png;base64,ZGVtbw=='; }
  };
  return el;
}

export const els = {};
export function byId(id) { if (!els[id]) els[id] = makeEl(id); return els[id]; }

const documentStub = {
  readyState: 'complete',
  documentElement: makeEl('html'),
  body: makeEl('body'),
  head: makeEl('head'),
  activeElement: null,
  getElementById(id) { return byId(id); },
  querySelector() { return makeEl(); },
  querySelectorAll() { return []; },
  createElement(t) { const e = makeEl(); e.tagName = String(t).toUpperCase(); return e; },
  addEventListener() {}, removeEventListener() {}
};

export function installDom(opts) {
  opts = opts || {};
  globalThis.document = documentStub;
  globalThis.window = globalThis;
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: opts.onLine !== false, userAgent: 'node', maxTouchPoints: 0 },
    configurable: true, writable: true
  });
  const search = opts.search || '';
  globalThis.location = { href: 'https://peringatandinicuacakepri.github.io/' + search, protocol: 'https:', search: search, reload() {} };
  globalThis.scrollTo = () => {};
  globalThis.scrollY = 0;
  globalThis.innerWidth = 1280;
  globalThis.innerHeight = 900;
  const store = opts.storage || {};
  globalThis.localStorage = {
    _d: store,
    getItem(k) { return k in this._d ? this._d[k] : null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
  };
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  globalThis.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  globalThis.cancelAnimationFrame = id => clearTimeout(id);
  globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
  /* Image stub: loads only whitelisted URLs */
  globalThis.Image = class {
    constructor() {
      this._src = '';
      this.onload = null; this.onerror = null;
    }
    set src(v) {
      this._src = v;
      const ok = (opts.imageWhitelist || []).indexOf(v) !== -1;
      setTimeout(() => {
        if (ok) { if (this.onload) this.onload(); }
        else { if (this.onerror) this.onerror(new Error('img fail')); }
      }, 0);
    }
    get src() { return this._src; }
    set referrerPolicy(v) {}
    set decoding(v) {}
    set loading(v) {}
    set fetchPriority(v) {}
    set alt(v) {}
  };
  /* DOMParser stub: regex-based, covers RSS + CAP usage in the app */
  globalThis.DOMParser = class {
    parseFromString(str, type) {
      const xml = String(str || '');
      const doc = {
        querySelector(sel) {
          if (sel === 'parsererror') return /<parsererror/.test(xml) ? {} : null;
          const m = xml.match(new RegExp('<' + sel + '[^>]*>([\\s\\S]*?)</' + sel + '>'));
          return m ? { textContent: decodeEntities(m[1]) } : null;
        },
        querySelectorAll(sel) {
          if (sel === 'item') {
            const out = [];
            const re = /<item>([\s\S]*?)<\/item>/g;
            let m;
            while ((m = re.exec(xml)) !== null) {
              const inner = m[1];
              out.push({
                querySelector(tag) {
                  const mm = inner.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>'));
                  return mm ? { textContent: decodeEntities(mm[1]) } : null;
                },
                getElementsByTagName(tag) {
                  const mm = inner.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>'));
                  return mm ? [{ textContent: decodeEntities(mm[1]) }] : [];
                }
              });
            }
            return out;
          }
          return [];
        },
        getElementsByTagName(tag) {
          const out = [];
          const re = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'g');
          let m;
          while ((m = re.exec(xml)) !== null) out.push({ textContent: decodeEntities(m[1]) });
          return out;
        }
      };
      return doc;
    }
  };
}
