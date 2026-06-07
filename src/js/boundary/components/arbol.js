import estilos from './arbol-estilos.js';

const ICONO_TOGGLE = '▶';

/* Template definido una sola vez a nivel de módulo — compartido entre instancias */
const _template = document.createElement('template');
_template.innerHTML = `
    <div class="cabecera" role="button" tabindex="0" aria-expanded="false">
        <span class="titulo"></span>
        <span class="icono-toggle" aria-hidden="true">${ICONO_TOGGLE}</span>
    </div>
    <div class="temas" role="region"></div>
`;

class Arbol extends HTMLElement {
    constructor() {
        super();
        this._estaAbierto = false;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [estilos];
        this.shadowRoot.appendChild(_template.content.cloneNode(true));

        this._cabecera   = this.shadowRoot.querySelector('.cabecera');
        this._panelTemas = this.shadowRoot.querySelector('.temas');

        /* Bind para poder remover exactamente el mismo handler en disconnectedCallback */
        this._alternarApertura = this._alternarApertura.bind(this);
        this._manejarTeclado   = this._manejarTeclado.bind(this);
    }

    connectedCallback() {
        this._cabecera.addEventListener('click',   this._alternarApertura);
        this._cabecera.addEventListener('keydown', this._manejarTeclado);
    }

    disconnectedCallback() {
        this._cabecera.removeEventListener('click',   this._alternarApertura);
        this._cabecera.removeEventListener('keydown', this._manejarTeclado);
    }

    /* ── API pública: recibe el objeto área completo desde la vista ── */
    set area(area) {
        this._cabecera.querySelector('.titulo').textContent = area.nombreArea ?? '';

        /* Asocia el botón de cabecera con el panel de temas vía ARIA */
        const idRegionAria = `temas-${area.idAreaConocimiento}`;
        this._panelTemas.id = idRegionAria;
        this._cabecera.setAttribute('aria-controls', idRegionAria);

        this._panelTemas.innerHTML = '';

        if (!area.temas?.length) {
            const mensajeSinTemas = document.createElement('p');
            mensajeSinTemas.className = 'sin-temas';
            mensajeSinTemas.textContent = 'Esta área no tiene temas registrados.';
            this._panelTemas.appendChild(mensajeSinTemas);
            return;
        }

        area.temas.forEach(tema => this._panelTemas.appendChild(this._crearItemTema(tema)));
    }

    /* ── Abre o cierra el panel de temas (nivel 1) ── */
    _alternarApertura() {
        this._estaAbierto = !this._estaAbierto;
        this._panelTemas.style.display = this._estaAbierto ? 'block' : 'none';
        this._cabecera.classList.toggle('expandida', this._estaAbierto);
        this._cabecera.setAttribute('aria-expanded', String(this._estaAbierto));
    }

    /* ── Activa la apertura con teclado (Enter / Espacio) ── */
    _manejarTeclado(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._alternarApertura();
        }
    }

    /* ── Despacha la construcción del nodo según si el tema tiene subtemas ── */
    _crearItemTema(tema) {
        return tema.subtemas?.length
            ? this._crearItemExpandible(tema)
            : this._crearItemSimple(tema);
    }

    /* ── Tema sin subtemas (nivel 2 simple) ── */
    _crearItemSimple(tema) {
        const item = document.createElement('div');
        item.className = 'tema-item';
        item.appendChild(this._fila(tema.nombreTema, 'tema-dot'));
        return item;
    }

    /* ── Tema con subtemas: cabecera expandible + lista de subtemas (niveles 2 → 3) ── */
    _crearItemExpandible(tema) {
        const item = document.createElement('div');
        item.className = 'tema-item tiene-subtemas';
        if (tema.idTema) item.dataset.temaId = tema.idTema;

        const cabecera = document.createElement('div');
        cabecera.className = 'tema-cabecera';
        cabecera.appendChild(this._fila(tema.nombreTema, 'tema-dot'));

        const icono = document.createElement('span');
        icono.className = 'tema-icono-toggle';
        icono.setAttribute('aria-hidden', 'true');
        icono.textContent = ICONO_TOGGLE;
        cabecera.appendChild(icono);

        const lista = document.createElement('div');
        lista.className = 'subtemas-lista';
        tema.subtemas.forEach(subtema => {
            const sub = document.createElement('div');
            sub.className = 'subtema-item';
            sub.appendChild(this._fila(subtema.nombreTema, 'subtema-dot'));
            lista.appendChild(sub);
        });

        item.append(cabecera, lista);

        /* stopPropagation: evita que el clic en nivel 2 active el toggle de nivel 1 */
        cabecera.addEventListener('click', e => {
            e.stopPropagation();
            item.classList.toggle('abierto');
        });

        return item;
    }

    /* ── Helper: par punto + etiqueta de texto, usado en los tres niveles ── */
    _fila(texto, dotClass) {
        const f = document.createDocumentFragment();
        const punto = document.createElement('span');
        punto.className = dotClass;
        const etiqueta = document.createElement('span');
        etiqueta.textContent = texto;
        f.append(punto, etiqueta);
        return f;
    }
}

customElements.define('app-arbol', Arbol);
export default Arbol;
