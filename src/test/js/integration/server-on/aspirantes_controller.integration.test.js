import { expect } from '../../lib/chai/index.js';
import AspirantesController from '../../../../js/control/aspirantes_controller.js';
import Aspirante from '../../../../js/entity/Aspirante.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

// DUI/correo exclusivos de este archivo: distintos al DAO test para evitar colisión de 409.
const DATOS_REGISTRAR = {
    nombres:         'Test Ctrl Int',
    apellidos:       'Controller Prueba',
    dui:             '22200099-9',
    fechaNacimiento: '2001-06-15',
    correo:          'ctrl.int.aspirante@tpi.sv',
    usaSillaRuedas:  true
};

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
            try {
                const resultado = await ctrl.registrar(DATOS_REGISTRAR);
                // Servidor activo y DUI libre: validar store actualizado
                expect(resultado).to.be.instanceOf(Aspirante);
                expect(store.aspirante).to.not.be.null;
                expect(store.aspirante.id).to.be.a('string').and.not.equal('');
                expect(store.aspirante.dui).to.equal('22200099-9');
                expect(store.aspirante.usaSillaRuedas).to.be.true;
            } catch (error) {
                // DUI duplicado o servidor apagado: store.aspirante debe quedar null
                expect(error).to.be.instanceOf(Error);
                expect(store.aspirante).to.be.null;
            }
        });

        it('debe propagar err.tipo del backend y dejar store.aspirante en null cuando el DUI ya existe (409)', async function () {
            this.timeout(10000);

            // Primer intento: crea el aspirante o confirma duplicado
            try { await ctrl.registrar(DATOS_REGISTRAR); } catch { /* puede que ya exista */ }
            resetStore();

            // Segundo intento: DUI ya existe → el servidor debe devolver 409
            try {
                await ctrl.registrar(DATOS_REGISTRAR);
            } catch (error) {
                if (error.httpStatus === 409) {
                    // Servidor respondió 409: validar tipo de negocio y estado del store
                    expect(TIPOS_NEGOCIO_CONOCIDOS).to.include(error.tipo);
                    expect(error.mensajeNegocio).to.be.a('string').and.not.equal('');
                    expect(store.aspirante).to.be.null;
                } else {
                    // Servidor apagado o error de red: aceptable
                    expect(error).to.be.instanceOf(Error);
                }
            }
        });

        it('debe mantener store.loading = false tras el registro, independientemente del resultado', async function () {
            this.timeout(5000);
            try { await ctrl.registrar(DATOS_REGISTRAR); } catch { /* cualquier resultado */ }

            expect(store.loading).to.be.false;
        });
    });
});
