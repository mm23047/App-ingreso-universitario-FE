import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/estado-vacio.js';

describe('EstadoVacio — app-estado-vacio — Pruebas Unitarias', () => {
    let el;

    // ── Helpers de acceso al Shadow DOM ────────────────────────────────────
    const sr          = () => el.shadowRoot;
    const tituloEl    = () => sr().querySelector('.titulo');
    const descripEl   = () => sr().querySelector('.descripcion');
    const iconoEl     = () => sr().querySelector('.icono');

    beforeEach(() => {
        el = document.createElement('app-estado-vacio');
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

        it('el elemento .titulo existe', () => {
            expect(tituloEl()).to.not.be.null;
        });

        it('el elemento .descripcion existe', () => {
            expect(descripEl()).to.not.be.null;
        });

        it('el slot "acciones" existe', () => {
            const slot = sr().querySelector('slot[name="acciones"]');
            expect(slot).to.not.be.null;
        });
    });

    // ── Atributo titulo ───────────────────────────────────────────────────
    describe('Atributo titulo', () => {
        it('refleja el valor en el elemento .titulo', () => {
            el.setAttribute('titulo', 'No se encontraron procesos.');
            expect(tituloEl().textContent).to.equal('No se encontraron procesos.');
        });

        it('actualiza el texto cuando cambia el atributo', () => {
            el.setAttribute('titulo', 'Primero');
            el.setAttribute('titulo', 'Segundo');
            expect(tituloEl().textContent).to.equal('Segundo');
        });

        it('muestra texto vacío cuando el atributo no tiene valor', () => {
            expect(tituloEl().textContent).to.equal('');
        });
    });

    // ── Atributo descripcion ───────────────────────────────────────────────
    describe('Atributo descripcion', () => {
        it('refleja el valor en el elemento .descripcion', () => {
            el.setAttribute('descripcion', 'Intenta con otro término.');
            expect(descripEl().textContent).to.equal('Intenta con otro término.');
        });

        it('el elemento .descripcion está oculto si el atributo está vacío', () => {
            el.setAttribute('descripcion', '');
            expect(descripEl().hidden).to.be.true;
        });

        it('el elemento .descripcion es visible cuando tiene contenido', () => {
            el.setAttribute('descripcion', 'Algo de texto');
            expect(descripEl().hidden).to.be.false;
        });
    });

    // ── Atributo icono ────────────────────────────────────────────────────
    describe('Atributo icono', () => {
        it('refleja el valor en el elemento .icono', () => {
            el.setAttribute('icono', '');
            expect(iconoEl().textContent).to.equal('');
        });

        it('icono vacío muestra texto vacío', () => {
            expect(iconoEl().textContent).to.equal('');
        });
    });

    // ── Atributo tipo ─────────────────────────────────────────────────────
    describe('Atributo tipo', () => {
        it('tipo="error" queda reflejado en el host como atributo', () => {
            el.setAttribute('tipo', 'error');
            expect(el.getAttribute('tipo')).to.equal('error');
        });

        it('el atributo tipo está en observedAttributes', () => {
            expect(el.constructor.observedAttributes).to.include('tipo');
        });
    });

    // ── Slot de acciones ──────────────────────────────────────────────────
    describe('Slot de acciones', () => {
        it('un hijo con slot="acciones" se asigna al slot correcto', () => {
            const btn = document.createElement('button');
            btn.slot        = 'acciones';
            btn.textContent = 'Ver procesos →';
            el.appendChild(btn);

            const slot    = sr().querySelector('slot[name="acciones"]');
            const asignados = slot.assignedElements();
            expect(asignados.length).to.equal(1);
            expect(asignados[0]).to.equal(btn);
        });

        it('sin hijos asignados el slot está vacío', () => {
            const slot = sr().querySelector('slot[name="acciones"]');
            expect(slot.assignedElements().length).to.equal(0);
        });
    });

    // ── Combinación de atributos ──────────────────────────────────────────
    describe('Combinación de atributos', () => {
        it('titulo y descripcion pueden setearse independientemente', () => {
            el.setAttribute('titulo',      'Sin datos');
            el.setAttribute('descripcion', 'Prueba otro filtro.');
            expect(tituloEl().textContent).to.equal('Sin datos');
            expect(descripEl().textContent).to.equal('Prueba otro filtro.');
        });
    });
});
