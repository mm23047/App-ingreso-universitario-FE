/* Configuración interna de cada variante de estado de admisión.
   Centraliza icon, clase visual y valores por defecto (subtítulo + pasos).
   Las vistas pueden sobreescribir subtitulo, titulo y pasos via la propiedad .data */
const CONFIG = {
    ADMITIDO: {
        cls:             'admitido',
        icon:            '',
        tituloDefault:   'Recomendaciones y siguientes pasos',
        subtituloDefault: '¡Felicitaciones! Has sido admitido',
        pasosDefault: [
            'Presenta tus documentos originales en la Oficina Central de Registros.',
            'Realiza el pago de matrícula en Colecturía.',
            'Consulta el sistema en línea para confirmar tu aula y sección.'
        ]
    },
    PENDIENTE: {
        cls:             'pendiente',
        icon:            '',
        tituloDefault:   'Recomendaciones y siguientes pasos',
        subtituloDefault: 'Tu resultado está siendo procesado',
        pasosDefault: [
            'El sistema está calificando tu examen; los puntajes se actualizan periódicamente.',
            'Vuelve a consultar esta página en 24–48 horas hábiles.',
            'No necesitas realizar ningún trámite adicional mientras esté pendiente.'
        ]
    },
    NO_ADMITIDO: {
        cls:             'no-admitido',
        icon:            '',
        tituloDefault:   'Recomendaciones y siguientes pasos',
        subtituloDefault: 'Opciones disponibles para ti',
        pasosDefault: [
            'Infórmate sobre la próxima convocatoria de admisión.',
            'Explora otras carreras donde tu puntaje podría ser competitivo.',
            'Acude al servicio de orientación vocacional de la universidad.'
        ]
    },
    CALIFICADO: {
        cls:             'pendiente',
        icon:            '',
        tituloDefault:   'Recomendaciones y siguientes pasos',
        subtituloDefault: 'Tu examen ya ha sido calificado',
        pasosDefault: [
            'Tu nota ha sido registrada en el sistema de manera exitosa.',
            'Espera a que finalice la etapa actual para conocer la distribución competitiva de cupos.',
            'Monitorea periódicamente este panel para verificar si tu estado cambia a Admitido.'
        ]
    }
};

/* Estilos del componente — migrados desde global.css (.recom-*).
   CSS custom properties de global.css se heredan a través del Shadow DOM. */
const estilos = new CSSStyleSheet();
estilos.replaceSync(`
    :host { display: block; }

    .caja {
        margin-top: var(--space-lg);
        border-radius: var(--radius-md);
        padding: var(--space-md) var(--space-lg);
        border-left: 4px solid;
    }

    /* Variante ADMITIDO */
    .caja.admitido {
        background: #EFF6FF;
        border-color: var(--color-primary-light);
        color: var(--color-primary-dark);
    }
    .caja.admitido .titulo { color: var(--color-primary); }
    .caja.admitido .subtitulo { color: var(--color-secondary); }

    /* Variante PENDIENTE / CALIFICADO */
    .caja.pendiente {
        background: #FFFBEB;
        border-color: var(--color-warning);
        color: #78350F;
    }
    .caja.pendiente .titulo  { color: #92400E; }
    .caja.pendiente .subtitulo { color: #92400E; }

    /* Variante NO_ADMITIDO */
    .caja.no-admitido {
        background: #FEF2F2;
        border-color: var(--color-danger);
        color: #7F1D1D;
    }
    .caja.no-admitido .titulo  { color: var(--color-danger); }
    .caja.no-admitido .subtitulo { color: #991B1B; }

    .titulo {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-size: .72rem;
        font-weight: 700;
        letter-spacing: .07em;
        text-transform: uppercase;
        margin-bottom: var(--space-xs);
    }

    .subtitulo {
        font-weight: 600;
        font-size: .95rem;
        margin: 0 0 var(--space-sm);
    }

    .lista {
        margin: 0;
        padding-left: var(--space-lg);
        font-size: .875rem;
        line-height: 1.75;
    }
    .lista li + li { margin-top: var(--space-xs); }
`);

const _template = document.createElement('template');
_template.innerHTML = `
    <div class="caja" role="region" aria-label="Recomendaciones">
        <div class="titulo">
            <span class="icono" aria-hidden="true"></span>
            <span class="titulo-texto"></span>
        </div>
        <p class="subtitulo"></p>
        <ol class="lista"></ol>
    </div>
`;

class RecomBox extends HTMLElement {
    constructor() {
        super();
        this._data = null;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [estilos];
        this.shadowRoot.appendChild(_template.content.cloneNode(true));
    }

    set data(val) {
        this._data = val;
        this._render();
    }

    get data() { return this._data; }

    _render() {
        const d = this._data;
        if (!d?.tipo) return;

        const cfg = CONFIG[d.tipo];
        if (!cfg) return;

        const caja = this.shadowRoot.querySelector('.caja');
        caja.className = `caja ${cfg.cls}`;

        this.shadowRoot.querySelector('.icono').textContent         = cfg.icon;
        this.shadowRoot.querySelector('.titulo-texto').textContent  = d.titulo    ?? cfg.tituloDefault;
        this.shadowRoot.querySelector('.subtitulo').textContent     = d.subtitulo ?? cfg.subtituloDefault;

        const lista = this.shadowRoot.querySelector('.lista');
        lista.innerHTML = '';
        const pasos = d.pasos ?? cfg.pasosDefault;
        pasos.forEach(paso => {
            const li = document.createElement('li');
            li.innerHTML = paso; // permite <strong> en pasos definidos por el desarrollador
            lista.appendChild(li);
        });
    }
}

customElements.define('app-recom-box', RecomBox);
export default RecomBox;
