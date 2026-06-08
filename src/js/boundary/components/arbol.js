/* Estilos del componente — se aplican dentro del Shadow DOM */
const estilos = new CSSStyleSheet();
estilos.replaceSync(`
    :host {
        display: block;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-sm);
        overflow: hidden;
    }
    /* Cabecera del área (nivel 1) */
    .cabecera {
        display: flex; align-items: center; justify-content: space-between;
        padding: var(--space-md) var(--space-lg);
        cursor: pointer; user-select: none;
        transition: background var(--transition);
    }
    .cabecera:hover, .cabecera.expandida { background: #EFF6FF; }
    .cabecera.expandida { border-bottom: 1px solid var(--color-border); }
    .titulo { font-weight: 600; color: var(--color-primary-dark); }
    .icono-toggle {
        font-size: 1.1rem; color: var(--color-primary);
        transition: transform .2s;
    }
    .cabecera.expandida .icono-toggle { transform: rotate(90deg); }

    /* Panel de temas (oculto por defecto) */
    .temas { display: none; padding: var(--space-md) var(--space-lg); }
    .sin-temas { color: var(--color-text-muted); font-size: .9rem; font-style: italic; }

    /* Nivel 2: tema sin subtemas */
    .tema-item {
        display: flex; align-items: center; gap: var(--space-md);
        padding: var(--space-xs) 0;
        border-bottom: 1px solid #F1F5F9;
        font-size: .93rem; color: var(--color-text);
    }
    .tema-item:last-child { border-bottom: none; }
    .tema-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary-light); flex-shrink: 0; }

    /* Nivel 2: tema expandible (tiene subtemas) */
    .tema-item.tiene-subtemas { flex-direction: column; align-items: flex-start; gap: 0; padding: 0; cursor: default; }
    .tema-cabecera {
        display: flex; align-items: center; gap: var(--space-md);
        width: 100%; padding: var(--space-xs) 0; cursor: pointer; user-select: none;
    }
    .tema-icono-toggle { font-size: .75rem; color: var(--color-primary); transition: transform .2s; margin-left: auto; flex-shrink: 0; }
    .tema-item.tiene-subtemas.abierto .tema-icono-toggle { transform: rotate(90deg); }

    /* Nivel 3: subtemas */
    .subtemas-lista { display: none; width: 100%; padding-left: calc(8px + var(--space-md) + var(--space-md)); padding-bottom: var(--space-xs); }
    .tema-item.tiene-subtemas.abierto .subtemas-lista { display: block; }
    .subtema-item {
        display: flex; align-items: center; gap: var(--space-sm);
        padding: 3px 0; font-size: .93rem; color: var(--color-text);
        border-bottom: 1px solid #F8FAFC;
    }
    .subtema-item:last-child { border-bottom: none; }
    .subtema-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--color-primary-light); flex-shrink: 0; opacity: .55; }
`);

const ICONO = '▶';

/* Template HTML compartido entre todas las instancias del componente */
const _template = document.createElement('template');
_template.innerHTML = `
    <div class="cabecera" role="button" tabindex="0" aria-expanded="false">
        <span class="titulo"></span>
        <span class="icono-toggle" aria-hidden="true">${ICONO}</span>
    </div>
    <div class="temas" role="region"></div>
`;

class Arbol extends HTMLElement {
    constructor() {
        super();
        this._abierto = false;

        /* Shadow DOM aislado con estilos adoptados */
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [estilos];
        this.shadowRoot.appendChild(_template.content.cloneNode(true));

        this._cabecera = this.shadowRoot.querySelector('.cabecera');
        this._panel    = this.shadowRoot.querySelector('.temas');

        /* Bind necesario para poder remover los listeners al desconectar */
        this._toggle  = this._toggle.bind(this);
        this._teclado = this._teclado.bind(this);
    }

    connectedCallback() {
        this._cabecera.addEventListener('click',   this._toggle);
        this._cabecera.addEventListener('keydown', this._teclado);
    }

    disconnectedCallback() {
        this._cabecera.removeEventListener('click',   this._toggle);
        this._cabecera.removeEventListener('keydown', this._teclado);
    }

    /* Propiedad pública: recibe el objeto área desde la vista padre */
    set area(area) {
        this._cabecera.querySelector('.titulo').textContent = area.nombreArea ?? '';

        /* Conecta cabecera y panel mediante ARIA para accesibilidad */
        const regionId = `temas-${area.idAreaConocimiento}`;
        this._panel.id = regionId;
        this._cabecera.setAttribute('aria-controls', regionId);

        this._panel.innerHTML = '';

        if (!area.temas?.length) {
            const p = document.createElement('p');
            p.className = 'sin-temas';
            p.textContent = 'Esta área no tiene temas registrados.';
            this._panel.appendChild(p);
            return;
        }

        area.temas.forEach(t => this._panel.appendChild(this._crearTema(t)));
    }

    /* Abre o cierra el panel de temas */
    _toggle() {
        this._abierto = !this._abierto;
        this._panel.style.display = this._abierto ? 'block' : 'none';
        this._cabecera.classList.toggle('expandida', this._abierto);
        this._cabecera.setAttribute('aria-expanded', String(this._abierto));
    }

    /* Permite abrir/cerrar con Enter o Espacio (accesibilidad teclado) */
    _teclado(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggle(); }
    }

    /* Decide si el tema es simple o expandible según si tiene subtemas */
    _crearTema(tema) {
        return tema.subtemas?.length ? this._crearExpandible(tema) : this._crearSimple(tema);
    }

    /* Tema sin subtemas — solo muestra el nombre con un punto */
    _crearSimple(tema) {
        const div = document.createElement('div');
        div.className = 'tema-item';
        div.appendChild(this._fila(tema.nombreTema, 'tema-dot'));
        return div;
    }

    /* Tema con subtemas — cabecera clickeable que despliega la lista (nivel 2 → 3) */
    _crearExpandible(tema) {
        const item = document.createElement('div');
        item.className = 'tema-item tiene-subtemas';
        if (tema.idTema) item.dataset.temaId = tema.idTema;

        const cab = document.createElement('div');
        cab.className = 'tema-cabecera';
        cab.appendChild(this._fila(tema.nombreTema, 'tema-dot'));

        const ico = document.createElement('span');
        ico.className = 'tema-icono-toggle';
        ico.setAttribute('aria-hidden', 'true');
        ico.textContent = ICONO;
        cab.appendChild(ico);

        const lista = document.createElement('div');
        lista.className = 'subtemas-lista';
        tema.subtemas.forEach(sub => {
            const el = document.createElement('div');
            el.className = 'subtema-item';
            el.appendChild(this._fila(sub.nombreTema, 'subtema-dot'));
            lista.appendChild(el);
        });

        item.append(cab, lista);

        /* stopPropagation evita que el clic en nivel 2 active el toggle de nivel 1 */
        cab.addEventListener('click', e => { e.stopPropagation(); item.classList.toggle('abierto'); });

        return item;
    }

    /* Helper: crea un fragmento con [punto · texto], reutilizado en los 3 niveles */
    _fila(texto, dotClass) {
        const f = document.createDocumentFragment();
        const dot = document.createElement('span');
        dot.className = dotClass;
        const txt = document.createElement('span');
        txt.textContent = texto;
        f.append(dot, txt);
        return f;
    }
}

customElements.define('app-arbol', Arbol);
export default Arbol;
