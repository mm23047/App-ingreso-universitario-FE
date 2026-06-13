/* Estilos del componente — migrados desde carreras.css (.carrera-card, .carrera-codigo).
   :host reemplaza la clase externa; el componente hereda los design tokens de global.css. */
const estilos = new CSSStyleSheet();
estilos.replaceSync(`
    :host {
        display: block;
        border: 2px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        background: var(--color-surface);
    }

    .codigo {
        display: block;
        font-size: .8rem;
        color: var(--color-text-muted);
        margin-bottom: var(--space-xs);
    }

    .nombre {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-primary-dark);
        margin: 0;
        line-height: 1.25;
    }
`);

const _template = document.createElement('template');
_template.innerHTML = `
    <p class="codigo"></p>
    <h3 class="nombre"></h3>
`;

class CarreraCard extends HTMLElement {
    static get observedAttributes() {
        return ['id-carrera', 'nombre'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [estilos];
        this.shadowRoot.appendChild(_template.content.cloneNode(true));
    }

    attributeChangedCallback(name, _old, val) {
        if (name === 'id-carrera') {
            this.shadowRoot.querySelector('.codigo').textContent = val ?? '';
        } else if (name === 'nombre') {
            this.shadowRoot.querySelector('.nombre').textContent = val ?? '';
        }
    }
}

customElements.define('app-carrera-card', CarreraCard);
export default CarreraCard;
