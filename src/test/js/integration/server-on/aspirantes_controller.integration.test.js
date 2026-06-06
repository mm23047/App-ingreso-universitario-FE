import { expect } from '../../lib/chai/index.js';
import AspirantesController from '../../../../js/control/aspirantes_controller.js';
import Aspirante from '../../../../js/entity/Aspirante.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

// Genera datos únicos por llamada para evitar colisiones entre ejecuciones del test.
// No existe endpoint DELETE para aspirantes — los registros se acumulan en BD con dominio @tpi-test.sv.
function generarDatos(prefijo = 'ctrl') {
    const n = Math.floor(Math.random() * 99999999);
    const d = Math.floor(Math.random() * 9);
    return {
        nombres:         'Test Ctrl Int',
        apellidos:       'Controller Prueba',
        dui:             `${String(n).padStart(8, '0')}-${d}`,
        fechaNacimiento: '2001-06-15',
        correo:          `${prefijo}.int.${Date.now()}.${n}@tpi-test.sv`,
        usaSillaRuedas:  true
    };
}

const TIPOS_NEGOCIO_CONOCIDOS = ['DUI_DUPLICADO', 'CORREO_DUPLICADO', 'EDAD_MINIMA'];

describe('AspirantesController — Integración con backend', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new AspirantesController();
        resetStore();
    });

    afterEach(() => {
        resetStore();
    });

    // ── registrar() — Controller → DAO → backend → store ─────────────────────

    describe('registrar() — Controller → DAO → backend → store', () => {

        it('debe guardar un Aspirante en store.aspirante cuando el backend responde 201', async function () {
            this.timeout(5000);
            const datos = generarDatos();

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const resultado = await ctrl.registrar(datos);

            expect(resultado).to.be.instanceOf(Aspirante);
            expect(store.aspirante).to.not.be.null;
            expect(store.aspirante.id).to.be.a('string').and.not.equal('');
            expect(store.aspirante.dui).to.equal(datos.dui);
            expect(store.aspirante.usaSillaRuedas).to.be.true;
        });

        it('debe propagar err.tipo del backend y dejar store.aspirante en null cuando el DUI ya existe (409)', async function () {
            this.timeout(10000);
            const datos = generarDatos('dup');

            // Primera llamada: crea el aspirante — sin try/catch, falla si el servidor está apagado
            await ctrl.registrar(datos);
            resetStore();

            // Segunda llamada: DUI ya existe — el backend debe devolver 409
            let errorDuplicado;
            try {
                await ctrl.registrar(datos);
            } catch (error) {
                errorDuplicado = error;
            }

            expect(errorDuplicado, 'La segunda llamada con DUI duplicado debe ser rechazada').to.exist;
            expect(errorDuplicado.httpStatus, 'Error de red en segunda llamada — ¿cayó el servidor?').to.be.a('number');
            expect(errorDuplicado.httpStatus).to.equal(409);
            expect(TIPOS_NEGOCIO_CONOCIDOS).to.include(errorDuplicado.tipo);
            expect(errorDuplicado.mensajeNegocio).to.be.a('string').and.not.equal('');
            expect(store.aspirante).to.be.null;
        });

        it('debe mantener store.loading = false tras el registro, independientemente del resultado', async function () {
            this.timeout(5000);
            const datos = generarDatos('loading');

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente.
            // Con servidor activo y datos únicos → registrar() retorna 201, el finally siempre
            // ejecuta store.loading = false independientemente del resultado.
            await ctrl.registrar(datos);

            expect(store.loading).to.be.false;
        });
    });
});
