import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/selector-prioridad.js';

describe('SelectorPrioridad — app-selector-prioridad — Pruebas Unitarias', () => {
    let el;

    const sr       = () => el.shadowRoot;
    const badgeEl  = () => sr().querySelector('.prioridad-badge');
    const selectEl = () => sr().querySelector('select');

    const CARRERAS_MOCK = [
        { idCarrera: 'ICS', nombreCatalogoCarrera: 'Ingeniería en Computación' },
        { idCarrera: 'MED', nombreCatalogoCarrera: 'Medicina' },
        { idCarrera: 'DER', nombreCatalogoCarrera: 'Derecho' },
    ];

    beforeEach(() => {
        el = document.createElement('app-selector-prioridad');
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

        it('el elemento .prioridad-badge existe', () => {
            expect(badgeEl()).to.not.be.null;
        });

        it('el elemento select existe', () => {
            expect(selectEl()).to.not.be.null;
        });

        it('el select tiene una opción vacía por defecto', () => {
            expect(selectEl().options.length).to.equal(1);
            expect(selectEl().options[0].value).to.equal('');
        });

        it('value es cadena vacía antes de asignar opciones', () => {
            expect(el.value).to.equal('');
        });
    });

    // ── Atributo numero ───────────────────────────────────────────────────
    describe('Atributo numero', () => {
        it('refleja el valor en el badge', () => {
            el.setAttribute('numero', '1');
            expect(badgeEl().textContent).to.equal('1');
        });

        it('está incluido en observedAttributes', () => {
            expect(el.constructor.observedAttributes).to.include('numero');
        });

        it('actualiza el badge al cambiar', () => {
            el.setAttribute('numero', '1');
            el.setAttribute('numero', '2');
            expect(badgeEl().textContent).to.equal('2');
        });
    });

    // ── Atributo placeholder ──────────────────────────────────────────────
    describe('Atributo placeholder', () => {
        it('refleja el valor en la primera opción del select', () => {
            el.setAttribute('placeholder', '— Primera opción —');
            expect(selectEl().options[0].textContent).to.equal('— Primera opción —');
        });

        it('está incluido en observedAttributes', () => {
            expect(el.constructor.observedAttributes).to.include('placeholder');
        });

        it('actualiza el aria-label del select', () => {
            el.setAttribute('placeholder', 'Primera preferencia');
            expect(selectEl().getAttribute('aria-label')).to.equal('Primera preferencia');
        });
    });

    // ── Atributo obligatorio ──────────────────────────────────────────────
    describe('Atributo obligatorio', () => {
        it('agrega required al select cuando está presente', () => {
            el.setAttribute('obligatorio', '');
            expect(selectEl().hasAttribute('required')).to.be.true;
        });

        it('el select no tiene required por defecto', () => {
            expect(selectEl().hasAttribute('required')).to.be.false;
        });

        it('está incluido en observedAttributes', () => {
            expect(el.constructor.observedAttributes).to.include('obligatorio');
        });
    });

    // ── Propiedad opciones ────────────────────────────────────────────────
    describe('Propiedad opciones', () => {
        it('pobla el select con las carreras + placeholder', () => {
            el.opciones = CARRERAS_MOCK;
            expect(selectEl().options.length).to.equal(CARRERAS_MOCK.length + 1);
        });

        it('la primera opción sigue siendo el placeholder vacío', () => {
            el.setAttribute('placeholder', '— Elegir —');
            el.opciones = CARRERAS_MOCK;
            expect(selectEl().options[0].value).to.equal('');
            expect(selectEl().options[0].textContent).to.equal('— Elegir —');
        });

        it('cada opción tiene el idCarrera como value', () => {
            el.opciones = CARRERAS_MOCK;
            expect(selectEl().options[1].value).to.equal('ICS');
            expect(selectEl().options[2].value).to.equal('MED');
            expect(selectEl().options[3].value).to.equal('DER');
        });

        it('cada opción muestra el nombreCatalogoCarrera como texto', () => {
            el.opciones = CARRERAS_MOCK;
            expect(selectEl().options[1].textContent).to.equal('Ingeniería en Computación');
        });

        it('el getter retorna el mismo array asignado', () => {
            el.opciones = CARRERAS_MOCK;
            expect(el.opciones).to.equal(CARRERAS_MOCK);
        });

        it('asignar un array vacío deja solo el placeholder', () => {
            el.opciones = CARRERAS_MOCK;
            el.opciones = [];
            expect(selectEl().options.length).to.equal(1);
        });
    });

    // ── Propiedad value ──────────────────────────────────────────────────
    describe('Propiedad value', () => {
        beforeEach(() => { el.opciones = CARRERAS_MOCK; });

        it('getter retorna el valor seleccionado del select', () => {
            selectEl().value = 'MED';
            expect(el.value).to.equal('MED');
        });

        it('setter cambia el valor del select', () => {
            el.value = 'DER';
            expect(selectEl().value).to.equal('DER');
        });

        it('retorna cadena vacía si no hay selección', () => {
            expect(el.value).to.equal('');
        });
    });

    // ── Propiedad nombreSeleccionado ─────────────────────────────────────
    describe('Propiedad nombreSeleccionado', () => {
        beforeEach(() => { el.opciones = CARRERAS_MOCK; });

        it('retorna el texto de la opción seleccionada', () => {
            selectEl().value = 'ICS';
            expect(el.nombreSeleccionado).to.equal('Ingeniería en Computación');
        });

        it('retorna cadena vacía si no hay selección', () => {
            expect(el.nombreSeleccionado).to.equal('');
        });
    });

    // ── Método reset ─────────────────────────────────────────────────────
    describe('Método reset', () => {
        it('vuelve el select al placeholder vacío', () => {
            el.opciones = CARRERAS_MOCK;
            selectEl().value = 'MED';
            el.reset();
            expect(el.value).to.equal('');
        });
    });

    // ── Múltiples instancias ─────────────────────────────────────────────
    describe('Múltiples instancias', () => {
        it('son independientes entre sí', () => {
            const el2 = document.createElement('app-selector-prioridad');
            document.body.appendChild(el2);

            el.opciones  = CARRERAS_MOCK;
            el2.opciones = CARRERAS_MOCK;

            el.shadowRoot.querySelector('select').value  = 'ICS';
            el2.shadowRoot.querySelector('select').value = 'MED';

            expect(el.value).to.equal('ICS');
            expect(el2.value).to.equal('MED');

            el2.parentNode.removeChild(el2);
        });
    });
});
