import { expect }           from '../../lib/chai/index.js';
import TurnosController      from '../../../../js/control/turnos_controller.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

describe('TurnosController — Backend apagado (errores de red)', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new TurnosController();
        resetStore();
    });

    afterEach(() => {
        resetStore();
    });

    // ── cargarTodosLosTurnos() ────────────────────────────────────────────────

    describe('cargarTodosLosTurnos() — Controller → DAO → backend (apagado)', () => {

        it('debe propagar TypeError de red y dejar store.loading en false cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.cargarTodosLosTurnos();
            } catch (err) {
                errorCapturado = err;
            }

            expect(errorCapturado,
                '⚠ El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;

            expect(errorCapturado,
                'Se esperaba TypeError de red, no un Error HTTP del servidor'
            ).to.be.instanceOf(TypeError);

            expect(errorCapturado.httpStatus,
                'httpStatus definido indica que el servidor respondió — el backend debe estar APAGADO'
            ).to.be.undefined;

            expect(store.loading,
                'store.loading debe quedar en false — el finally del controller siempre lo restaura'
            ).to.be.false;
        });
    });
});
