interface LPTag {
  wl?: unknown
  scp?: unknown
  site?: string
  section?: string
  tagletSection?: unknown
  autoStart?: boolean
  ovr?: { domain?: string }
  _v?: string
  _tagCount?: number
  protocol?: string
  events?: {
    bind: (t: unknown, e: unknown, i: unknown) => void
    trigger: (t: unknown, e: unknown, i: unknown) => void
  }
  defer?: (t: unknown, e: number) => void
  load?: (t?: string, e?: string, i?: string) => void
  _load?: (t?: string, e?: string, i?: string) => void
  init?: () => void
  start?: () => void
  _domReady?: (t: string) => void
  isDom?: boolean
  _timing?: Record<string, number>
  vars?: unknown[]
  dbs?: unknown[]
  ctn?: unknown[]
  sdes?: unknown[]
  hooks?: unknown[]
  identities?: unknown[]
  ev?: unknown[]
  sections?: string
  _defB?: unknown[]
  _defT?: unknown[]
  _defL?: unknown[]
}

declare const window: Window &
typeof globalThis & {
  lpTag: LPTag
  attachEvent?: unknown
  _lptStop?: unknown
}

export const runLPTag = (args: { sections: string, siteId: string }) => {
  try {
    console.info('running LP monitoring tag')
    console.info(args)
    const { sections, siteId } = args
    /* eslint-disable */
    window.lpTag = window.lpTag || {}, typeof window.lpTag._tagCount === 'undefined' ? (
      window.lpTag = {
        wl: window.lpTag.wl || null,
        scp: window.lpTag.scp || null,
        site: siteId || '',
        section: window.lpTag.section || '',
        tagletSection: window.lpTag.tagletSection || null,
        autoStart: window.lpTag.autoStart !== !1,
        ovr: window.lpTag.ovr || {},
        _v: '1.10.0',
        _tagCount: 1,
        protocol: 'https:',
        events: {
          bind: function (t: unknown, e: unknown, i: unknown) { window.lpTag.defer?.(function () { window.lpTag.events?.bind(t, e, i) }, 0) },
          trigger: function (t: unknown, e: unknown, i: unknown) { window.lpTag.defer?.(function () { window.lpTag.events?.trigger(t, e, i) }, 1) }
        },
        defer: function (t: unknown, e: number) { e === 0 ? (this._defB = this._defB || [], this._defB.push(t)) : e === 1 ? (this._defT = this._defT || [], this._defT.push(t)) : (this._defL = this._defL || [], this._defL.push(t)) },
        load: function (t?: string, e?: string, i?: string) { const n = this; setTimeout(function () { n._load?.(t, e, i) }, 0) },
        _load: function (t?: string, e?: string, i?: string) {
          let n = t; t || (n = this.protocol + '//' + (this.ovr && this.ovr.domain ? this.ovr.domain : 'lptag.liveperson.net') + '/tag/tag.js?site=' + this.site)
          const o = document.createElement('script'); o.setAttribute('charset', e || 'UTF-8'), i && o.setAttribute('id', i), o.setAttribute('src', n ?? ''), document!.getElementsByTagName('head')!.item(0)!.appendChild(o)
        },
        init: function () {

          this._timing = this._timing || {}, this._timing.start = (new Date()).getTime(); const t = this; window.attachEvent ? (window.attachEvent as (event: string, listener: () => void) => void)('onload', function () { t._domReady?.('domReady') }) : (window.addEventListener('DOMContentLoaded', function () { t._domReady?.('contReady') }, !1), window.addEventListener('load', function () { t._domReady?.('domReady') }, !1)),
          typeof window._lptStop === 'undefined' && this.load?.()
        },
        start: function () {
          this.autoStart = !0
        },
        _domReady: function (t: string) {




          this.isDom || (this.isDom = !0, this.events?.trigger('LPT', 'DOM_READY', { t: t })), this._timing && (this._timing[t] = (new Date()).getTime())
        },
        vars: window.lpTag.vars || [],
        dbs: window.lpTag.dbs || [],
        ctn: window.lpTag.ctn || [],
        sdes: window.lpTag.sdes || [],
        hooks: window.lpTag.hooks || [],
        identities: window.lpTag.identities || [],
        ev: window.lpTag.ev || []
      },
      window.lpTag.init?.()
    )
      : window.lpTag._tagCount += 1
    window.lpTag.hooks = window.lpTag.hooks || []
    if (sections) window.lpTag.sections = sections
  } catch {
    // Silent catch - error ignored
  }
    setTimeout(() => {
      return
    }, 1000);
}
