import { expect }              from '../../lib/chai/index.js';
import InscripcionesController  from '../../../../js/control/inscripciones_controller.js';
import { store, resetStore }    from '../../../../js/infra/app_state.js';

// ID ficticio — el primer fetch dentro del controller (pruebasDao.obtenerActivas)
// falla por ECONNREFUSED antes de siquiera intentar crear la inscripción.
const ID_ASPIRANTE_FALSO = '00000000-0000-0000-0000-000000000001';

describe('InscripcionesController — Backend apagado (errores de red)', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new InscripcionesController();
        resetStore();
    });

    afterEach(() => {
        resetStore();
    });

    // ── inscribirConCarreras() ────────────────────────────────────────────────

    describe('inscribirConCarreras() — Controller → DAO → backend (apagado)', () => {

        it('debe propagar TypeError de red y dejar store.loading en false cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.inscribirConCarreras(ID_ASPIRANTE_FALSO, [{ idCarrera: 'INF', prioridad: 1 }]);
            } catch (err) {
                errorCapturado = err;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;

            expect(errorCapturado,
                'Se esperaba TypeError de red (primer fetch interno: pruebasDao.obtenerActivas)'
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
