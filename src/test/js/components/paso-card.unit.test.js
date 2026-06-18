import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/paso-card.js';

describe('PasoCard — app-paso-card — Pruebas Unitarias', () => {
    let el;

    const sr       = () => el.shadowRoot;
    const numeroEl = () => sr().querySelector('.paso-numero');
    const tituloEl = () => sr().querySelector('h3');
    const descripP = () => sr().querySelector('p');

    beforeEach(() => {
        el = document.createElement('app-paso-card');
        document.body.appendChild(el);
    });

    afterEach(() => {
        if (el?.parentNode) el.parentNode.removeChild(el);
    });

    // ── Estructura inicial ─────────────────────────────────────────────────
    describe('Estructura inicial', () => {
        it('el shadow DOM está inicializado', () => {
            expect(sr()).to.not.be.null;
        });

        it('el elemento .paso-numero existe', () => {
            expect(numeroEl()).to.not.be.null;
        });

        it('el elemento h3 existe', () => {
            expect(tituloEl()).to.not.be.null;
        });

        it('el elemento p con slot existe', () => {
            expect(descripP()).to.not.be.null;
            const slot = descripP().querySelector('slot');
            expect(slot).to.not.be.null;
        });
    });

    // ── Atributo numero ───────────────────────────────────────────────────
    describe('Atributo numero', () => {
        it('refleja el valor en el elemento .paso-numero', () => {
            el.setAttribute('numero', '1');
            expect(numeroEl().textContent).to.equal('1');
        });

        it('está incluido en observedAttributes', () => {
            expect(el.constructor.observedAttributes).to.include('numero');
        });

        it('cadena vacía produce texto vacío', () => {
            el.setAttribute('numero', '');
            expect(numeroEl().textContent).to.equal('');
        });
    });

    // ── Atributo titulo ───────────────────────────────────────────────────
    describe('Atributo titulo', () => {
        it('refleja el valor en el elemento h3', () => {
            el.setAttribute('titulo', 'Regístrate');
            expect(tituloEl().textContent).to.equal('Regístrate');
        });

        it('está incluido en observedAttributes', () => {
            expect(el.constructor.observedAttributes).to.include('titulo');
        });

        it('cadena vacía produce texto vacío en h3', () => {
            el.setAttribute('titulo', '');
            expect(tituloEl().textContent).to.equal('');
        });
    });

    // ── Ambos atributos juntos ────────────────────────────────────────────
    describe('Ambos atributos combinados', () => {
        it('numero y titulo se pueden setear juntos sin interferencia', () => {
            el.setAttribute('numero', '2');
            el.setAttribute('titulo', 'Elige tu carrera');
            expect(numeroEl().textContent).to.equal('2');
            expect(tituloEl().textContent).to.equal('Elige tu carrera');
        });
    });

    // ── Reactividad ──────────────────────────────────────────────────────
    describe('Reactividad de atributos', () => {
        it('cambiar numero actualiza el .paso-numero', () => {
            el.setAttribute('numero', '1');
            el.setAttribute('numero', '3');
            expect(numeroEl().textContent).to.equal('3');
        });

        it('cambiar titulo actualiza el h3', () => {
            el.setAttribute('titulo', 'Primero');
            el.setAttribute('titulo', 'Segundo');
            expect(tituloEl().textContent).to.equal('Segundo');
        });

        it('múltiples instancias son independientes entre sí', () => {
            const el2 = document.createElement('app-paso-card');
            document.body.appendChild(el2);

            el.setAttribute('titulo',  'Regístrate');
            el2.setAttribute('titulo', 'Inscríbete');

            expect(tituloEl().textContent).to.equal('Regístrate');
            expect(el2.shadowRoot.querySelector('h3').textContent).to.equal('Inscríbete');

            el2.parentNode.removeChild(el2);
        });
    });

    // ── Slot de descripción ──────────────────────────────────────────────
    describe('Slot de descripción', () => {
        it('el contenido de texto se proyecta a través del slot', () => {
            el.textContent = 'Completa tu perfil.';
            const slot = descripP().querySelector('slot');
            const asignados = slot.assignedNodes();
            expect(asignados.length).to.be.greaterThan(0);
            expect(asignados[0].textContent).to.equal('Completa tu perfil.');
        });

        it('sin contenido el slot está vacío', () => {
            const slot = descripP().querySelector('slot');
            expect(slot.assignedNodes().length).to.equal(0);
        });
    });
});
