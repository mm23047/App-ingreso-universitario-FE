import { expect }           from '../../lib/chai/index.js';
import TurnosController      from '../../../../js/control/turnos_controller.js';
import Turno                 from '../../../../js/entity/Turno.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

describe('TurnosController — Integración con backend', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new TurnosController();
        resetStore();
    });

    afterEach(() => {
        resetStore();
    });

    // ── cargarTodosLosTurnos() ────────────────────────────────────────────────

    describe('cargarTodosLosTurnos() — Controller → DAO → backend → store', () => {

        it('debe poblar store.turnos y dejar store.loading en false cuando el backend responde 200', async function () {
            this.timeout(5000);

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const resultado = await ctrl.cargarTodosLosTurnos();

            expect(resultado).to.be.an('array');
            expect(store.turnos).to.be.an('array');
            expect(store.turnos).to.equal(resultado); // misma referencia — el controller asigna directamente
            expect(store.loading).to.be.false;

            if (resultado.length > 0) {
                expect(resultado[0]).to.be.instanceOf(Turno);
                expect(resultado[0].idTurnoExamen).to.exist;
                expect(resultado[0].nombreTurno).to.be.a('string');
            }
        });
    });

    // ── seleccionarTurno() ────────────────────────────────────────────────────

    describe('seleccionarTurno() — búsqueda en memoria y actualización del store', () => {

        it('debe retornar null cuando el id no corresponde a ningún turno cargado', async function () {
            this.timeout(8000);

            await ctrl.cargarTodosLosTurnos();
            const resultado = ctrl.seleccionarTurno('id-turno-inexistente');

            expect(resultado).to.be.null;
        });

        it('debe retornar la instancia de Turno y actualizar store.turnoSeleccionado cuando el id es válido', async function () {
            this.timeout(8000);

            const turnos = await ctrl.cargarTodosLosTurnos();
            if (turnos.length === 0) { this.skip(); return; }

            const turnoEsperado = turnos[0];
            const resultado     = ctrl.seleccionarTurno(turnoEsperado.idTurnoExamen);

            expect(resultado).to.be.instanceOf(Turno);
            expect(resultado.idTurnoExamen).to.equal(turnoEsperado.idTurnoExamen);
            expect(store.turnoSeleccionado).to.equal(resultado);
        });
    });
});
