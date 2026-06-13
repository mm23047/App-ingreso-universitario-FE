/* Estilos del componente — migrados desde procesos.css (.ps-empty*).
   grid-column: 1 / -1 en :host garantiza que, cuando el padre es un CSS grid,
   el estado vacío ocupe el ancho completo (sin efecto si el padre no es grid). */
const estilos = new CSSStyleSheet();
estilos.replaceSync(`
    :host {
        display: block;
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--space-2xl);
        color: var(--color-text-muted);
    }

    .icono {
        font-size: 2.5rem;
        opacity: .35;
        margin-bottom: var(--space-md);
    }

    .titulo {
        font-size: 1rem;
        font-weight: 500;
        margin: 0;
    }

    /* Variante error: el título adopta color de peligro */
    :host([tipo="error"]) .titulo { color: var(--color-danger); }

    .descripcion {
        font-size: .88rem;
        margin-top: 4px;
        margin-bottom: 0;
    }

    .acciones { margin-top: var(--space-md); }
`);

const _template = document.createElement('template');
_template.innerHTML = `
    <div class="icono" aria-hidden="true"></div>
    <p class="titulo"></p>
    <p class="descripcion"></p>
    <div class="acciones">
        <slot name="acciones"></slot>
    </div>
`;

class EstadoVacio extends HTMLElement {
    static get observedAttributes() {
        return ['titulo', 'descripcion', 'icono', 'tipo'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [estilos];
        this.shadowRoot.appendChild(_template.content.cloneNode(true));
    }

    attributeChangedCallback(name, _old, val) {
        switch (name) {
            case 'titulo':
                this.shadowRoot.querySelector('.titulo').textContent = val ?? '';
                break;
            case 'descripcion': {
                const el = this.shadowRoot.querySelector('.descripcion');
                el.textContent = val ?? '';
                el.hidden = !val;
                break;
            }
            case 'icono':
                this.shadowRoot.querySelector('.icono').textContent = val ?? '';
                break;
            // 'tipo' se refleja como atributo en :host y lo maneja CSS (:host([tipo="error"]))
        }
    }
}

customElements.define('app-estado-vacio', EstadoVacio);
export default EstadoVacio;
