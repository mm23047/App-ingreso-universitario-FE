/* Template definido una sola vez a nivel de módulo — compartido entre instancias */
const _template = document.createElement('template');
_template.innerHTML = `
    <style>
        /*
         * :host representa el elemento <app-arbol> en sí mismo.
         * Reemplaza las clases .area-nodo que antes vivían en areas.html.
         * Las variables CSS (--color-primary, --radius-lg, etc.) provienen
         * de global.css y atraviesan el Shadow DOM boundary sin problema.
         */
        :host {
            display: block;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            margin-bottom: var(--space-sm);
            overflow: hidden;
        }

        /* ── Nivel 1: cabecera del área ── */
        .cabecera {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-md) var(--space-lg);
            cursor: pointer;
            user-select: none;
            transition: background var(--transition);
        }
        .cabecera:hover    { background: #EFF6FF; }
        .cabecera.expandida {
            background: #EFF6FF;
            border-bottom: 1px solid var(--color-border);
        }
        .titulo { font-weight: 600; color: var(--color-primary-dark); }
        .icono-toggle {
            font-size: 1.1rem;
            color: var(--color-primary);
            transition: transform .2s;
        }
        .cabecera.expandida .icono-toggle { transform: rotate(90deg); }

        /* ── Contenedor de temas (oculto por defecto) ── */
        .temas {
            display: none;
            padding: var(--space-md) var(--space-lg);
        }
        .sin-temas { color: var(--color-text-muted); font-size: .9rem; font-style: italic; }

        /* ── Nivel 2: ítem de tema (sin subtemas) ── */
        .tema-item {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-xs) 0;
            border-bottom: 1px solid #F1F5F9;
            font-size: .93rem;
            color: var(--color-text);
        }
        .tema-item:last-child { border-bottom: none; }
        .tema-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: var(--color-primary-light); flex-shrink: 0;
        }

        /* ── Nivel 2: ítem de tema expandible (tiene subtemas) ── */
        .tema-item.tiene-subtemas {
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
            padding: 0;
            cursor: default;
        }
        .tema-cabecera {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            width: 100%;
            padding: var(--space-xs) 0;
            cursor: pointer;
            user-select: none;
        }
        .tema-icono-toggle {
            font-size: .75rem;
            color: var(--color-primary);
            transition: transform .2s;
            margin-left: auto;
            flex-shrink: 0;
        }
        .tema-item.tiene-subtemas.abierto .tema-icono-toggle {
            transform: rotate(90deg);
        }

        /* ── Nivel 3: lista de subtemas ── */
        .subtemas-lista {
            display: none;
            width: 100%;
            padding-left: calc(8px + var(--space-md) + var(--space-md));
            padding-bottom: var(--space-xs);
        }
        .tema-item.tiene-subtemas.abierto .subtemas-lista {
            display: block;
        }
        .subtema-item {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            padding: 3px 0;
            font-size: .93rem;
            color: var(--color-text);
            border-bottom: 1px solid #F8FAFC;
        }
        .subtema-item:last-child { border-bottom: none; }
        .subtema-dot {
            width: 5px; height: 5px; border-radius: 50%;
            background: var(--color-primary-light);
            flex-shrink: 0;
            opacity: .55;
        }
    </style>

    <div class="cabecera" role="button" tabindex="0" aria-expanded="false">
        <span class="titulo"></span>
        <span class="icono-toggle" aria-hidden="true">▶</span>
    </div>
    <div class="temas" role="region"></div>
`;

class Arbol extends HTMLElement {
    constructor() {
        super();
        this._estaAbierto = false;

        this.attachShadow({ mode: 'open' });
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

    /* ── Construye el nodo DOM de un tema (nivel 2), con o sin subtemas ── */
    _crearItemTema(tema) {
        const tieneSubtemas = Array.isArray(tema.subtemas) && tema.subtemas.length > 0;
        const itemTema = document.createElement('div');

        if (!tieneSubtemas) {
            itemTema.className = 'tema-item';
            const punto    = document.createElement('span');
            punto.className = 'tema-dot';
            const etiqueta = document.createElement('span');
            etiqueta.textContent = tema.nombreTema;
            itemTema.appendChild(punto);
            itemTema.appendChild(etiqueta);
            return itemTema;
        }

        /* Tema expandible: agrega su propio toggle hacia los subtemas (nivel 2 → 3) */
        itemTema.className = 'tema-item tiene-subtemas';
        if (tema.idTema) itemTema.dataset.temaId = tema.idTema;

        /* Cabecera del tema expandible */
        const cabeceraTema = document.createElement('div');
        cabeceraTema.className = 'tema-cabecera';

        const punto        = document.createElement('span');
        punto.className     = 'tema-dot';

        const etiqueta     = document.createElement('span');
        etiqueta.textContent = tema.nombreTema;

        const iconoToggle  = document.createElement('span');
        iconoToggle.className = 'tema-icono-toggle';
        iconoToggle.setAttribute('aria-hidden', 'true');
        iconoToggle.textContent = '▶';

        cabeceraTema.appendChild(punto);
        cabeceraTema.appendChild(etiqueta);
        cabeceraTema.appendChild(iconoToggle);

        /* Lista de subtemas (nivel 3) */
        const listaSubtemas = document.createElement('div');
        listaSubtemas.className = 'subtemas-lista';

        tema.subtemas.forEach(subtema => {
            const itemSubtema      = document.createElement('div');
            itemSubtema.className   = 'subtema-item';
            const puntoSubtema     = document.createElement('span');
            puntoSubtema.className  = 'subtema-dot';
            const etiquetaSubtema  = document.createElement('span');
            etiquetaSubtema.textContent = subtema.nombreTema;
            itemSubtema.appendChild(puntoSubtema);
            itemSubtema.appendChild(etiquetaSubtema);
            listaSubtemas.appendChild(itemSubtema);
        });

        itemTema.appendChild(cabeceraTema);
        itemTema.appendChild(listaSubtemas);

        /* stopPropagation: evita que el clic en nivel 2 active el toggle de nivel 1 */
        cabeceraTema.addEventListener('click', (e) => {
            e.stopPropagation();
            itemTema.classList.toggle('abierto');
        });

        return itemTema;
    }
}

customElements.define('app-arbol', Arbol);
export default Arbol;
