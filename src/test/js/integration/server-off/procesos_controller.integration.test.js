import { expect }       from '../../lib/chai/index.js';
import ProcesosController from '../../../../js/control/procesos_controller.js';

// Mensaje exacto que lanza ProcesosController.cargar() cuando el endpoint
// de pruebas_admision falla (capturado por Promise.allSettled → status 'rejected').
const MENSAJE_SERVIDOR_APAGADO =
    'No se pudieron cargar los procesos. Verifica que el servidor esté encendido en el puerto 9080.';

describe('ProcesosController — Backend apagado (errores de red)', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new ProcesosController();
    });

    // ── cargar() ─────────────────────────────────────────────────────────────
    //
    // Usa Promise.allSettled internamente: la TypeError de red queda capturada
    // en resPruebas.status === 'rejected', y el controller lanza su propio
    // new Error(...) — no se propaga una TypeError, sino un Error con mensaje específico.

    describe('cargar() — Promise.allSettled envuelve el error de red', () => {

        it('debe lanzar Error con el mensaje de servidor apagado cuando el backend no responde', async function () {
            this.timeout(10000);
            let errorCapturado;

            try {
                await ctrl.cargar();
            } catch (err) {
                errorCapturado = err;
            }

            expect(errorCapturado,
                '⚠ El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;

            expect(errorCapturado).to.be.instanceOf(Error);

            expect(errorCapturado.message,
                'El mensaje debe indicar que el servidor no está disponible'
            ).to.include('No se pudieron cargar los procesos');

            expect(errorCapturado.message).to.equal(MENSAJE_SERVIDOR_APAGADO);
        });
    });

    // ── buscar() ─────────────────────────────────────────────────────────────
    //
    // A diferencia de cargar(), buscar() NO usa allSettled: el await fetch()
    // falla directamente con TypeError cuando el servidor no responde.

    describe('buscar() — TypeError de red se propaga sin envolver', () => {

        it('debe propagar TypeError de red cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.buscar('');
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
