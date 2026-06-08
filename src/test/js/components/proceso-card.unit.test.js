import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/proceso-card.js';

describe('AppProcesoCard — app-proceso-card — Pruebas Unitarias', () => {
    let card;

    // ── Proceso base reutilizable ──────────────────────────────────────────
    const procesoActivo = {
        idPruebaAdmision: 1,
        nombrePrueba: 'Examen de Admisión 2025',
        anio: '2025',
        activa: true,
        fechaInicio: '2025-03-01',
        fechaFin:    '2025-06-30',
        jornadas: ['Matutino', 'Vespertino'],
        horarios: ['07:00 – 10:00', '13:00 – 16:00'],
        sedes: ['FMO', 'FCA', 'FC']
    };

    const procesoInactivo = {
        idPruebaAdmision: 2,
        nombrePrueba: 'Examen 2024',
        anio: '2024',
        activa: false,
        fechaInicio: null,
        fechaFin:    null,
        jornadas: [],
        horarios: [],
        sedes: []
    };

    // ── Helpers de acceso al Shadow DOM ────────────────────────────────────
    const sr        = () => card.shadowRoot;
    const badge     = () => sr().querySelector('.ps-badge-estado');
    const badgeText = () => sr().querySelector('.badge-texto');
    const btnConsultar = () => sr().querySelector('.ps-btn-consultar');

    beforeEach(() => {
        card = document.createElement('app-proceso-card');
        document.body.appendChild(card);
    });

    afterEach(() => {
        if (card?.parentNode) card.parentNode.removeChild(card);
    });

    // ── Contrato del componente ────────────────────────────────────────────
    describe('Contrato del componente', () => {
        it('debe exponer el botón "Consultar proceso" como punto de interacción', () => {
            expect(btnConsultar()).to.not.be.null;
        });
    });

    // ── Renderizado de datos ───────────────────────────────────────────────
    describe('Renderizado de datos — set proceso', () => {
        it('debe mostrar el nombre de la prueba en .ps-nombre', () => {
            card.proceso = procesoActivo;
            const nombre = sr().querySelector('.ps-nombre');
            expect(nombre.textContent).to.equal('Examen de Admisión 2025');
        });

        it('debe mostrar el año en .ps-anio-tag', () => {
            card.proceso = procesoActivo;
            const anio = sr().querySelector('.ps-anio-tag');
            expect(anio.textContent).to.equal('2025');
        });

        it('debe mostrar las jornadas unidas con coma', () => {
            card.proceso = procesoActivo;
            const jornada = sr().querySelector('.campo-jornada');
            expect(jornada.textContent).to.equal('Matutino, Vespertino');
        });

        it('debe mostrar "Sin asignar" cuando las jornadas están vacías', () => {
            card.proceso = procesoInactivo;
            const jornada = sr().querySelector('.campo-jornada');
            expect(jornada.textContent).to.equal('Sin asignar');
        });

        it('debe marcar .campo-jornada como vacío cuando no hay jornadas', () => {
            card.proceso = procesoInactivo;
            const jornada = sr().querySelector('.campo-jornada');
            expect(jornada.classList.contains('vacio')).to.be.true;
        });

        it('debe mostrar "Sin asignar" cuando fechaInicio es null', () => {
            card.proceso = procesoInactivo;
            const fechaInicio = sr().querySelector('.campo-fecha-inicio');
            expect(fechaInicio.textContent).to.equal('Sin asignar');
        });

        it('debe mostrar una fecha formateada cuando fechaInicio tiene valor', () => {
            card.proceso = procesoActivo;
            const fechaInicio = sr().querySelector('.campo-fecha-inicio');
            expect(fechaInicio.textContent).to.not.equal('Sin asignar');
            expect(fechaInicio.textContent.length).to.be.greaterThan(0);
        });
    });

    // ── Badge de estado activo / inactivo ─────────────────────────────────
    describe('Badge de estado', () => {
        it('proceso activo: badge debe tener clase activo', () => {
            card.proceso = procesoActivo;
            expect(badge().classList.contains('activo')).to.be.true;
            expect(badge().classList.contains('inactivo')).to.be.false;
        });

        it('proceso activo: badge debe mostrar el texto "Activo"', () => {
            card.proceso = procesoActivo;
            expect(badgeText().textContent).to.equal('Activo');
        });

        it('proceso inactivo: badge debe tener clase inactivo', () => {
            card.proceso = procesoInactivo;
            expect(badge().classList.contains('inactivo')).to.be.true;
            expect(badge().classList.contains('activo')).to.be.false;
        });

        it('proceso inactivo: badge debe mostrar el texto "Inactivo"', () => {
            card.proceso = procesoInactivo;
            expect(badgeText().textContent).to.equal('Inactivo');
        });

        it('cambiar de activo a inactivo actualiza el badge correctamente', () => {
            card.proceso = procesoActivo;
            expect(badge().classList.contains('activo')).to.be.true;

            card.proceso = procesoInactivo;
            expect(badge().classList.contains('activo')).to.be.false;
            expect(badge().classList.contains('inactivo')).to.be.true;
        });
    });

    // ── Renderizado de sedes ───────────────────────────────────────────────
    describe('Renderizado de sedes', () => {
        it('debe crear un chip por cada sede', () => {
            card.proceso = procesoActivo;
            const chips = sr().querySelectorAll('.ps-chip-sede');
            expect(chips.length).to.equal(3);
        });

        it('cada chip debe mostrar el nombre de la sede', () => {
            card.proceso = procesoActivo;
            const chips = [...sr().querySelectorAll('.ps-chip-sede')];
            const textos = chips.map(c => c.textContent);
            expect(textos).to.include('FMO');
            expect(textos).to.include('FCA');
        });

        it('sedes vacías debe mostrar chip "Sin sedes asignadas"', () => {
            card.proceso = procesoInactivo;
            const chipVacio = sr().querySelector('.ps-chip-empty');
            expect(chipVacio).to.not.be.null;
            expect(chipVacio.textContent).to.include('Sin sedes');
        });

        it('sedes vacías no debe mostrar chips de sede', () => {
            card.proceso = procesoInactivo;
            const chips = sr().querySelectorAll('.ps-chip-sede');
            expect(chips.length).to.equal(0);
        });
    });

    // ── Getter de proceso ─────────────────────────────────────────────────
    describe('Getter de proceso', () => {
        it('get proceso() debe retornar el mismo objeto que se asignó', () => {
            card.proceso = procesoActivo;
            expect(card.proceso).to.equal(procesoActivo);
        });

        it('get proceso() debe retornar null antes de asignar', () => {
            expect(card.proceso).to.be.null;
        });
    });

    // ── Evento proceso-seleccionado ────────────────────────────────────────
    describe('Evento proceso-seleccionado', () => {
        it('el clic en "Consultar proceso" debe emitir el evento', () => {
            card.proceso = procesoActivo;
            let disparado = false;
            card.addEventListener('proceso-seleccionado', () => { disparado = true; });
            btnConsultar().click();
            expect(disparado).to.be.true;
        });

        it('el evento debe incluir el proceso en detail.proceso', () => {
            card.proceso = procesoActivo;
            let detalle = null;
            card.addEventListener('proceso-seleccionado', e => { detalle = e.detail.proceso; });
            btnConsultar().click();
            expect(detalle).to.equal(procesoActivo);
        });

        it('el evento debe propagar hacia arriba (bubbles: true)', () => {
            card.proceso = procesoActivo;
            let recibidoEnPadre = false;
            document.body.addEventListener('proceso-seleccionado', function h() {
                recibidoEnPadre = true;
                document.body.removeEventListener('proceso-seleccionado', h);
            });
            btnConsultar().click();
            expect(recibidoEnPadre).to.be.true;
        });

        it('no debe emitir el evento si proceso es null', () => {
            let disparado = false;
            card.addEventListener('proceso-seleccionado', () => { disparado = true; });
            btnConsultar().click();
            expect(disparado).to.be.false;
        });
    });
});
