const ICO_CALENDARIO = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const ICO_RELOJ = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

const ICO_SOL = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`;

const ICO_PIN = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/></svg>`;

function esc(s) {
    return String(s ?? '')
        .replaceAll(/&/g, '&amp;').replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;').replaceAll(/"/g, '&quot;');
}

function fmtFecha(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso + 'T12:00:00').toLocaleDateString('es-SV', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch { return iso; }
}

const _template = document.createElement('template');
_template.innerHTML = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        transition: box-shadow var(--transition), transform var(--transition);
        font-family: inherit;
    }
    :host(:hover) { box-shadow: var(--shadow-md); transform: translateY(-2px); }

    .ps-card-head {
        background: linear-gradient(135deg, #1e2e5c 0%, #1E3A8A 65%, #2563EB 100%);
        padding: var(--space-md) var(--space-lg);
        display: flex; flex-direction: column; gap: var(--space-xs);
    }
    .ps-card-head-top {
        display: flex; justify-content: space-between;
        align-items: center; gap: var(--space-sm);
    }
    .ps-badge-estado {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: .68rem; font-weight: 700;
        padding: 2px 10px; border-radius: var(--radius-full);
        text-transform: uppercase; letter-spacing: .05em;
    }
    .ps-badge-estado.activo {
        background: rgba(16,185,129,.25); color: #6EE7B7;
        border: 1px solid rgba(16,185,129,.35);
    }
    .ps-badge-estado.inactivo {
        background: rgba(255,255,255,.1); color: rgba(255,255,255,.55);
        border: 1px solid rgba(255,255,255,.18);
    }
    .ps-badge-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: currentColor; flex-shrink: 0;
    }
    .ps-anio-tag {
        color: rgba(255,255,255,.65); font-size: .78rem; font-weight: 600;
        background: rgba(255,255,255,.12); padding: 2px 9px;
        border-radius: var(--radius-full);
    }
    .ps-nombre { color: #fff; font-size: 1rem; font-weight: 700; line-height: 1.35; }

    .ps-card-body {
        padding: var(--space-lg); flex: 1;
        display: flex; flex-direction: column; gap: var(--space-md);
    }
    .ps-info-grid {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: var(--space-md) var(--space-lg);
    }
    .ps-campo { display: flex; flex-direction: column; gap: 3px; }
    .ps-campo.full { grid-column: 1 / -1; }
    .ps-campo-label {
        font-size: .7rem; font-weight: 700; color: var(--color-text-muted);
        text-transform: uppercase; letter-spacing: .06em;
        display: flex; align-items: center; gap: 4px;
    }
    .ps-campo-val { font-size: .9rem; font-weight: 500; color: var(--color-text); }
    .ps-campo-val.vacio { font-style: italic; font-weight: 400; color: var(--color-text-muted); }

    .ps-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 3px; }
    .ps-chip { font-size: .77rem; font-weight: 600; padding: 2px 10px; border-radius: var(--radius-full); }
    .ps-chip-sede { background: #EFF6FF; color: var(--color-primary); border: 1px solid #BFDBFE; }
    .ps-chip-empty {
        background: var(--color-bg); color: var(--color-text-muted);
        border: 1px solid var(--color-border); font-style: italic; font-weight: 400;
    }

    .ps-card-foot { padding: 0 var(--space-lg) var(--space-lg); }
    .ps-btn-consultar {
        width: 100%; padding: .6rem var(--space-md);
        background: var(--color-primary); color: #fff;
        border: none; border-radius: var(--radius-md);
        font-size: .92rem; font-weight: 600; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: var(--space-sm);
        transition: background var(--transition), transform var(--transition);
    }
    .ps-btn-consultar:hover { background: var(--color-primary-dark); transform: translateY(-1px); }
    .ps-btn-consultar:active { transform: none; }
</style>

<div class="ps-card-head">
    <div class="ps-card-head-top">
        <span class="ps-badge-estado">
            <span class="ps-badge-dot"></span>
            <span class="badge-texto"></span>
        </span>
        <span class="ps-anio-tag"></span>
    </div>
    <span class="ps-nombre"></span>
</div>

<div class="ps-card-body">
    <div class="ps-info-grid">
        <div class="ps-campo">
            <span class="ps-campo-label">${ICO_CALENDARIO} Fecha inicio</span>
            <span class="ps-campo-val campo-fecha-inicio"></span>
        </div>
        <div class="ps-campo">
            <span class="ps-campo-label">${ICO_CALENDARIO} Fecha fin</span>
            <span class="ps-campo-val campo-fecha-fin"></span>
        </div>
        <div class="ps-campo">
            <span class="ps-campo-label">${ICO_SOL} Jornada</span>
            <span class="ps-campo-val campo-jornada"></span>
        </div>
        <div class="ps-campo">
            <span class="ps-campo-label">${ICO_RELOJ} Horario</span>
            <span class="ps-campo-val campo-horario"></span>
        </div>
        <div class="ps-campo full">
            <span class="ps-campo-label">${ICO_PIN} Ubicaciones</span>
            <div class="ps-chips campo-sedes"></div>
        </div>
    </div>
</div>

<div class="ps-card-foot">
    <button class="ps-btn-consultar">
        Consultar proceso
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
    </button>
</div>
`;

class AppProcesoCard extends HTMLElement {
    constructor() {
        super();
        this._proceso = null;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(_template.content.cloneNode(true));

        this.shadowRoot.querySelector('.ps-btn-consultar').addEventListener('click', () => {
            if (!this._proceso) return;
            this.dispatchEvent(new CustomEvent('proceso-seleccionado', {
                detail: { proceso: this._proceso },
                bubbles: true,
                composed: true
            }));
        });
    }

    set proceso(data) {
        this._proceso = data;
        this._render();
    }

    get proceso() { return this._proceso; }

    _render() {
        const p = this._proceso;
        if (!p) return;

        const sr = this.shadowRoot;
        const badge = sr.querySelector('.ps-badge-estado');
        badge.classList.toggle('activo',   !!p.activa);
        badge.classList.toggle('inactivo', !p.activa);
        sr.querySelector('.badge-texto').textContent = p.activa ? 'Activo' : 'Inactivo';
        sr.querySelector('.ps-anio-tag').textContent = p.anio;
        sr.querySelector('.ps-nombre').textContent   = p.nombrePrueba;

        const setVal = (sel, val) => {
            const el = sr.querySelector(sel);
            el.textContent = val || 'Sin asignar';
            el.classList.toggle('vacio', !val);
        };
        setVal('.campo-fecha-inicio', p.fechaInicio ? fmtFecha(p.fechaInicio) : '');
        setVal('.campo-fecha-fin',    p.fechaFin    ? fmtFecha(p.fechaFin)    : '');
        setVal('.campo-jornada',      p.jornadas?.join(', ') || '');
        setVal('.campo-horario',      p.horarios?.join(' / ') || '');

        const sedesEl = sr.querySelector('.campo-sedes');
        sedesEl.innerHTML = p.sedes?.length
            ? p.sedes.map(s => `<span class="ps-chip ps-chip-sede">${esc(s)}</span>`).join('')
            : `<span class="ps-chip ps-chip-empty">Sin sedes asignadas</span>`;
    }
}

customElements.define('app-proceso-card', AppProcesoCard);
export default AppProcesoCard;
