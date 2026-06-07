import { expect }            from '../../lib/chai/index.js';
import CarrerasController      from '../../../../js/control/carreras_controller.js';
import Carrera                 from '../../../../js/entity/Carrera.js';
import { store, resetStore }   from '../../../../js/infra/app_state.js';

describe('CarrerasController — Integración con backend', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new CarrerasController();
        resetStore();
    });

    afterEach(() => {
        resetStore();
    });

    // ── cargarTodas() ────────────────────────────────────────────────────────

    describe('cargarTodas() — Controller → DAO → backend → store', () => {

        it('debe poblar store.carreras y dejar store.loading en false cuando el backend responde 200', async function () {
            this.timeout(5000);

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const resultado = await ctrl.cargarTodas();

            expect(resultado).to.be.an('array');
            expect(store.carreras).to.be.an('array');
            expect(store.loading).to.be.false;

            if (resultado.length > 0) {
                expect(resultado[0]).to.be.instanceOf(Carrera);
                expect(resultado[0].idCarrera).to.be.a('string').and.not.equal('');
                expect(resultado[0].nombreCatalogoCarrera).to.be.a('string').and.not.equal('');
            }
        });
    });
});
