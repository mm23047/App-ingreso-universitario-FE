const COLORES_BADGE = {
    '1': 'var(--color-primary, #1E3A8A)',
    '2': 'var(--color-secondary, #10B981)',
    '3': 'var(--color-text-muted, #6B7280)',
};

const estilos = new CSSStyleSheet();
estilos.replaceSync(`
    :host { display: block; }

    .sel-row {
        display: flex;
        align-items: center;
        gap: var(--space-md, 1rem);
    }

    .prioridad-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        background: var(--color-primary, #1E3A8A);
        color: white;
        border-radius: 9999px;
        font-size: .8rem;
        font-weight: 700;
        flex-shrink: 0;
    }

    select {
        flex: 1;
        padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        border: 1px solid var(--color-border, #E5E7EB);
        border-radius: var(--radius-md, 8px);
        font-size: 1rem;
        background: var(--color-surface, #fff);
        color: var(--color-text, #111827);
    }
    select:focus {
        outline: none;
        border-color: var(--color-primary, #1E3A8A);
        box-shadow: 0 0 0 3px rgba(59,130,246,.15);
    }
`);

const _template = document.createElement('template');
_template.innerHTML = `
    <div class="sel-row">
        <span class="prioridad-badge"></span>
        <select><option value=""></option></select>
    </div>
`;

class SelectorPrioridad extends HTMLElement {
    static get observedAttributes() { return ['numero', 'placeholder', 'obligatorio']; }

    constructor() {
        super();
        this._opciones = [];
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [estilos];
        this.shadowRoot.appendChild(_template.content.cloneNode(true));
        this._badge  = this.shadowRoot.querySelector('.prioridad-badge');
        this._select = this.shadowRoot.querySelector('select');
    }

    connectedCallback() { this._render(); }
    attributeChangedCallback() { this._render(); }

    get value() { return this._select.value; }
    set value(v) { this._select.value = v; }

    get nombreSeleccionado() {
        const opt = this._select.options[this._select.selectedIndex];
        return opt?.value ? opt.textContent : '';
    }

    set opciones(lista) {
        this._opciones = lista ?? [];
        this._renderOpciones();
    }
    get opciones() { return this._opciones; }

    reset() { this._select.value = ''; }

    _render() {
        const numero = this.getAttribute('numero') ?? '';
        this._badge.textContent = numero;
        this._badge.style.background = COLORES_BADGE[numero] ?? COLORES_BADGE['3'];

        const label = this.getAttribute('placeholder') ?? '';
        this._badge.title = label;
        this._select.setAttribute('aria-label', label);

        if (this.hasAttribute('obligatorio')) {
            this._select.setAttribute('required', '');
        } else {
            this._select.removeAttribute('required');
        }

        this._renderOpciones();
    }

    _renderOpciones() {
        const placeholder = this.getAttribute('placeholder') ?? '';
        const opts = this._opciones
            .map(c => `<option value="${c.idCarrera}">${c.nombreCatalogoCarrera}</option>`)
            .join('');
        this._select.innerHTML = `<option value="">${placeholder}</option>${opts}`;
    }
}

customElements.define('app-selector-prioridad', SelectorPrioridad);
export default SelectorPrioridad;
