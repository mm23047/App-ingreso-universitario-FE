import './recom-box.js';

const estilos = new CSSStyleSheet();
estilos.replaceSync(`
    :host { display: block; }

    .card {
        background: var(--color-surface, #fff);
        border: 1px solid var(--color-border, #E5E7EB);
        border-radius: var(--radius-lg, 12px);
        padding: var(--space-xl, 2rem);
        box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,.10));
        margin-bottom: var(--space-md, 1rem);
    }

    .card.inscrito {
        border-left: 4px solid var(--color-info, #3B82F6);
    }

    .card.registrado {
        border-left: 4px solid var(--color-warning, #F59E0B);
    }

    .alerta-datos {
        background: #fef3c7;
        border-left: 4px solid #d97706;
        color: #92400e;
        padding: 0.65rem 1rem;
        border-radius: 4px;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
    }

    .examen-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: var(--space-md, 1rem);
        flex-wrap: wrap;
        gap: var(--space-sm, 0.5rem);
    }
    .examen-header h3 {
        margin: 0;
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--color-primary-dark, #1e2e5c);
    }

    .badges-row {
        display: flex;
        gap: var(--space-xs, 0.25rem);
        flex-wrap: wrap;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        font-size: .75rem;
        font-weight: 700;
        padding: 3px 12px;
        border-radius: 9999px;
        white-space: nowrap;
    }
    .badge-success { background: #D1FAE5; color: #065F46; }
    .badge-warning { background: #FEF3C7; color: #92400E; }
    .badge-info    { background: #DBEAFE; color: #1E40AF; }
    .badge-danger  { background: #FEE2E2; color: #991B1B; }
    .badge-neutral { background: #F3F4F6; color: var(--color-text-muted, #6B7280); }

    .puntaje-panel {
        text-align: center;
        margin: var(--space-md, 1rem) 0;
    }
    .puntaje-label {
        font-size: .85rem;
        color: var(--color-text-muted, #6B7280);
        margin-bottom: 4px;
    }
    .puntaje-num {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--color-primary-dark, #1e2e5c);
        display: block;
    }

    .examen-grid {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: var(--space-xs, 0.25rem) var(--space-lg, 1.5rem);
        font-size: .93rem;
    }
    .examen-grid dt { color: var(--color-text-muted, #6B7280); margin: 0; }
    .examen-grid dd { font-weight: 500; margin: 0; }

    p { margin: 0 0 var(--space-md, 1rem); }

    @media (max-width: 639px) {
        .examen-grid { grid-template-columns: 1fr; }
    }
`);

class ResultadoCard extends HTMLElement {
    constructor() {
        super();
        this._data = null;
        this._tipo = null;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [estilos];
    }

    set tipo(val) {
        this._tipo = val;
        this._render();
    }
    get tipo() { return this._tipo; }

    set data(val) {
        this._data = val;
        this._render();
    }
    get data() { return this._data; }

    _render() {
        if (!this._data || !this._tipo) return;

        this.shadowRoot.innerHTML = '';

        switch (this._tipo) {
            case 'examen':     this._renderExamen();     break;
            case 'inscrito':   this._renderInscrito();   break;
            case 'registrado': this._renderRegistrado(); break;
        }
    }

    _renderExamen() {
        const ex = this._data;
        const calificado        = ex.puntajeFinal != null;
        const estadoInscripcion = ex.inscripcionesPrueba?.estado ?? '—';

        const card = document.createElement('div');
        card.className = 'card';

        if (calificado && estadoInscripcion === 'INSCRITO') {
            const alerta = document.createElement('div');
            alerta.className = 'alerta-datos';
            alerta.setAttribute('role', 'alert');
            alerta.textContent =
                'El puntaje está registrado pero el estado de tu inscripción no se actualizó correctamente. ' +
                'Comunícate con la Oficina de Admisiones para verificar tu expediente.';
            card.appendChild(alerta);
        }

        const badgeCalificacion = calificado
            ? '<span class="badge badge-success">Calificado</span>'
            : '<span class="badge badge-warning">Pendiente de calificación</span>';

        let badgeAdmision = '';
        if      (ex.estadoAdmision === 'ADMITIDO')    badgeAdmision = '<span class="badge badge-info">Admitido</span>';
        else if (ex.estadoAdmision === 'NO_ADMITIDO') badgeAdmision = '<span class="badge badge-danger">No admitido</span>';
        else if (ex.estadoAdmision === 'PENDIENTE')   badgeAdmision = '<span class="badge badge-neutral">Pendiente de admisión</span>';

        const fecha = ex.fechaRealizacion
            ? new Date(ex.fechaRealizacion).toLocaleString('es-SV', {
                day:'2-digit', month:'long', year:'numeric',
                hour:'2-digit', minute:'2-digit'
              })
            : '—';

        const pruebaNombre = ex.claveExamen?.pruebaAdmision?.nombrePrueba
            ?? ex.inscripcionesPrueba?.pruebaAdmision?.nombrePrueba
            ?? 'Prueba de admisión';

        const aspirante = ex.inscripcionesPrueba?.aspiranteDato;
        const nombreAsp = aspirante
            ? `${aspirante.nombres ?? ''} ${aspirante.apellidos ?? ''}`.trim()
            : '—';

        const header = document.createElement('div');
        header.className = 'examen-header';
        header.innerHTML = `
            <h3>${pruebaNombre}</h3>
            <div class="badges-row">${badgeCalificacion}${badgeAdmision}</div>`;
        card.appendChild(header);

        if (calificado) {
            const puntajeDiv = document.createElement('div');
            puntajeDiv.className = 'puntaje-panel';
            puntajeDiv.innerHTML = `
                <p class="puntaje-label">Puntaje obtenido</p>
                <span class="puntaje-num">${ex.puntajeFinal}</span>`;
            card.appendChild(puntajeDiv);
        }

        const dl = document.createElement('dl');
        dl.className = 'examen-grid';
        dl.innerHTML = `
            <dt>Aspirante</dt>        <dd>${nombreAsp}</dd>
            <dt>Fecha de realización</dt><dd>${fecha}</dd>
            <dt>Etapa</dt>            <dd>${ex.etapaAdmision?.nombre ?? '—'}</dd>
            <dt>Estado</dt>           <dd>${estadoInscripcion}</dd>
            ${ex.carreraAsignada ? `<dt>Carrera asignada</dt><dd>${ex.carreraAsignada}</dd>` : ''}
            <dt>Clave de examen</dt>  <dd>${ex.claveExamen?.nombreClave ?? '—'}</dd>`;
        card.appendChild(dl);

        const recom = this._crearRecomBox(ex);
        if (recom) card.appendChild(recom);

        this.shadowRoot.appendChild(card);
    }

    _renderInscrito() {
        const insc = this._data;
        const pruebaNombre = insc.pruebaAdmision?.nombrePrueba ?? 'Prueba de admisión';
        const aspirante    = insc.aspiranteDato;
        const nombreAsp    = aspirante
            ? `${aspirante.nombres ?? ''} ${aspirante.apellidos ?? ''}`.trim()
            : '—';

        const card = document.createElement('div');
        card.className = 'card inscrito';
        card.innerHTML = `
            <div class="examen-header">
                <h3>${pruebaNombre}</h3>
                <div class="badges-row">
                    <span class="badge badge-warning">Pendiente de examen</span>
                </div>
            </div>
            <dl class="examen-grid">
                <dt>Aspirante</dt><dd>${nombreAsp}</dd>
                <dt>Estado</dt>   <dd>${insc.estado ?? 'INSCRITO'}</dd>
            </dl>`;

        const recom = document.createElement('app-recom-box');
        recom.data = {
            tipo:      'PENDIENTE',
            titulo:    'Próximos pasos',
            subtitulo: 'Estás inscrito — el examen aún no ha sido realizado',
            pasos: [
                'Verifica la fecha y hora de tu examen en la Oficina de Admisiones.',
                'Ten a mano tu DUI y comprobante de inscripción el día de la prueba.',
                'Llega al aula asignada con al menos 30 minutos de anticipación.',
                'Descansa bien la noche anterior y lleva lapicero negro.',
                'Consulta esta página después del examen para ver tu resultado.'
            ]
        };
        card.appendChild(recom);

        this.shadowRoot.appendChild(card);
    }

    _renderRegistrado() {
        const aspirante = this._data;
        const nombreAsp = `${aspirante.nombres ?? ''} ${aspirante.apellidos ?? ''}`.trim() || 'Aspirante';

        const card = document.createElement('div');
        card.className = 'card registrado';
        card.innerHTML = `
            <div class="examen-header">
                <h3>¡Registro Encontrado!</h3>
                <div class="badges-row">
                    <span class="badge badge-warning" style="background-color:#fef3c7;color:#d97706;">Sin convocatorias activas</span>
                </div>
            </div>
            <p>
                Hola <strong>${nombreAsp}</strong>, tu cuenta ha sido creada exitosamente en nuestra
                plataforma, pero detectamos que aún no te has inscrito a ninguna prueba de admisión
                para el ciclo actual.
            </p>`;

        const recom = document.createElement('app-recom-box');
        recom.data = {
            tipo:      'PENDIENTE',
            titulo:    '¿Qué debes hacer ahora?',
            subtitulo: 'Sigue estos pasos para activar tu proceso de selección:',
            pasos: [
                'Dirígete al apartado de <strong>Inscripciones</strong> en el menú principal.',
                'Selecciona la carrera a la que deseas aplicar y la convocatoria disponible.',
                'Descarga tu mandamiento de pago (si aplica) y efectúa el pago en las agencias autorizadas.',
                'Una vez procesado tu pago, regresa a esta pestaña para verificar la asignación de tu aula, fecha y clave de examen.'
            ]
        };
        card.appendChild(recom);

        this.shadowRoot.appendChild(card);
    }

    _crearRecomBox(examen) {
        let estadoClave = examen.estadoAdmision;
        if (!estadoClave && examen.inscripcionesPrueba?.estado) {
            estadoClave = examen.inscripcionesPrueba.estado;
        }
        if (!estadoClave) return null;

        const recom = document.createElement('app-recom-box');
        recom.data = { tipo: estadoClave };
        return recom;
    }
}

customElements.define('app-resultado-card', ResultadoCard);
export default ResultadoCard;
