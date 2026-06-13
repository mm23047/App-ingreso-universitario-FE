import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/carrera-card.js';

describe('CarreraCard — app-carrera-card — Pruebas Unitarias', () => {
    let card;

    // ── Helpers de acceso al Shadow DOM ────────────────────────────────────
    const sr       = () => card.shadowRoot;
    const codigoEl = () => sr().querySelector('.codigo');
    const nombreEl = () => sr().querySelector('.nombre');

    beforeEach(() => {
        card = document.createElement('app-carrera-card');
        document.body.appendChild(card);
    });

    afterEach(() => {
        if (card?.parentNode) card.parentNode.removeChild(card);
    });

    // ── Estructura inicial ─────────────────────────────────────────────────
    describe('Estructura inicial', () => {
        it('el shadow DOM está inicializado', () => {
            expect(sr()).to.not.be.null;
        });

        it('el elemento .codigo existe', () => {
            expect(codigoEl()).to.not.be.null;
        });

        it('el elemento .nombre existe', () => {
            expect(nombreEl()).to.not.be.null;
        });
    });

    // ── Atributos observables ──────────────────────────────────────────────
    describe('Atributo id-carrera', () => {
        it('refleja el valor en el elemento .codigo', () => {
            card.setAttribute('id-carrera', 'ICS');
            expect(codigoEl().textContent).to.equal('ICS');
        });

        it('está incluido en observedAttributes', () => {
            expect(card.constructor.observedAttributes).to.include('id-carrera');
        });

        it('cadena vacía produce texto vacío en .codigo', () => {
            card.setAttribute('id-carrera', '');
            expect(codigoEl().textContent).to.equal('');
        });
    });

    describe('Atributo nombre', () => {
        it('refleja el valor en el elemento .nombre', () => {
            card.setAttribute('nombre', 'Ingeniería en Computación');
            expect(nombreEl().textContent).to.equal('Ingeniería en Computación');
        });

        it('está incluido en observedAttributes', () => {
            expect(card.constructor.observedAttributes).to.include('nombre');
        });

        it('cadena vacía produce texto vacío en .nombre', () => {
            card.setAttribute('nombre', '');
            expect(nombreEl().textContent).to.equal('');
        });
    });

    // ── Ambos atributos juntos ─────────────────────────────────────────────
    describe('Ambos atributos combinados', () => {
        it('id-carrera y nombre se pueden setear juntos sin interferencia', () => {
            card.setAttribute('id-carrera', 'ADM');
            card.setAttribute('nombre',     'Administración de Empresas');
            expect(codigoEl().textContent).to.equal('ADM');
            expect(nombreEl().textContent).to.equal('Administración de Empresas');
        });
    });

    // ── Reactividad ───────────────────────────────────────────────────────
    describe('Reactividad de atributos', () => {
        it('cambiar id-carrera actualiza el .codigo', () => {
            card.setAttribute('id-carrera', 'X');
            card.setAttribute('id-carrera', 'Y');
            expect(codigoEl().textContent).to.equal('Y');
        });

        it('cambiar nombre actualiza el .nombre', () => {
            card.setAttribute('nombre', 'Medicina');
            card.setAttribute('nombre', 'Odontología');
            expect(nombreEl().textContent).to.equal('Odontología');
        });

        it('múltiples instancias son independientes entre sí', () => {
            const card2 = document.createElement('app-carrera-card');
            document.body.appendChild(card2);

            card.setAttribute('nombre',  'Medicina');
            card2.setAttribute('nombre', 'Derecho');

            expect(card.shadowRoot.querySelector('.nombre').textContent).to.equal('Medicina');
            expect(card2.shadowRoot.querySelector('.nombre').textContent).to.equal('Derecho');

            card2.parentNode.removeChild(card2);
        });
    });
});
