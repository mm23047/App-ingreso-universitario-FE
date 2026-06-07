import { expect }           from '../../lib/chai/index.js';
import AspirantesController  from '../../../../js/control/aspirantes_controller.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

// Datos válidos para que el controller no rechace por validación local.
// Con el backend apagado, el fetch falla antes de llegar al servidor.
function datosValidos() {
    return {
        nombres:         'Test ServerOff Ctrl',
        apellidos:       'Controller Red',
        dui:             '12345678-9',
        fechaNacimiento: '2001-06-15',
        correo:          'server.off.ctrl@tpi-test.sv',
        usaSillaRuedas:  false
    };
}

describe('AspirantesController — Backend apagado (errores de red)', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new AspirantesController();
        resetStore();
    });

    afterEach(() => {
        resetStore();
    });

    // ── registrar() ───────────────────────────────────────────────────────────

    describe('registrar() — Controller → DAO → backend (apagado)', () => {

        it('debe propagar TypeError de red cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.registrar(datosValidos());
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
        });

    });
});
