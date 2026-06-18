const estilos = new CSSStyleSheet();
estilos.replaceSync(`
    :host {
        display: block;
    }

    .paso-card {
        background: var(--color-surface, #fff);
        border: 1px solid var(--color-border, #E5E7EB);
        border-radius: var(--radius-lg, 12px);
        padding: var(--space-xl, 2rem);
        text-align: center;
        box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,.10));
        transition: box-shadow 200ms ease, transform 200ms ease;
    }
    .paso-card:hover {
        box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,.12));
        transform: translateY(-3px);
    }

    .paso-numero {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: var(--color-primary, #1E3A8A);
        color: white;
        border-radius: 9999px;
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: var(--space-md, 1rem);
    }

    h3 {
        color: var(--color-primary-dark, #1e2e5c);
        font-weight: 700;
        font-size: 1.25rem;
        margin: 0 0 var(--space-sm, 0.5rem);
    }

    p {
        color: var(--color-text-muted, #6B7280);
        font-size: .9rem;
        margin: 0;
    }
`);

const _template = document.createElement('template');
_template.innerHTML = `
    <div class="paso-card">
        <div class="paso-numero"></div>
        <h3></h3>
        <p><slot></slot></p>
    </div>
`;

class PasoCard extends HTMLElement {
    static get observedAttributes() { return ['numero', 'titulo']; }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [estilos];
        this.shadowRoot.appendChild(_template.content.cloneNode(true));
    }

    attributeChangedCallback() { this._render(); }

    _render() {
        this.shadowRoot.querySelector('.paso-numero').textContent = this.getAttribute('numero') ?? '';
        this.shadowRoot.querySelector('h3').textContent = this.getAttribute('titulo') ?? '';
    }
}

customElements.define('app-paso-card', PasoCard);
export default PasoCard;
