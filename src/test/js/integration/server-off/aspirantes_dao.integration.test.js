import { expect } from '../../lib/chai/index.js';
import AspirantesDao from '../../../../js/control/aspirantes_dao.js';

// Datos mínimos para intentar un POST /aspirantes.
// Con el backend apagado, fetch falla antes de enviar el cuerpo — los datos no importan.
function datosPostEjemplo() {
    return {
        nombres:         'Test ServerOff',
        apellidos:       'Aspirante Red',
        dui:             '12345678-9',
        fechaNacimiento: '2001-06-15',
        correo:          'server.off.test@tpi-test.sv',
        usaSillaRuedas:  false
    };
}

// UUID sintético válido para GET /aspirantes/{id}.
// Con el backend apagado, fetch falla antes de llegar al servidor — el ID no importa.
const ID_FAKE = '00000000-0000-0000-0000-000000000001';

describe('AspirantesDao — Backend apagado (errores de red)', () => {
    let dao;

    beforeEach(() => {
        dao = new AspirantesDao();
    });

    // ── POST /aspirantes ──────────────────────────────────────────────────────

    describe('POST /aspirantes — crear aspirante', () => {

        it('debe propagar TypeError con httpStatus indefinido cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.crear(datosPostEjemplo());
            } catch (err) {
                errorCapturado = err;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;

            expect(errorCapturado,
                'Se esperaba TypeError de red, no un Error HTTP del servidor'
            ).to.be.instanceOf(TypeError);

            expect(errorCapturado.httpStatus,
                'httpStatus definido indica que el servidor respondió — el backend debe estar APAGADO'
            ).to.be.undefined;
        });
    });

    // ── GET /aspirantes/{id} ──────────────────────────────────────────────────

    describe('GET /aspirantes/{id} — obtener aspirante por ID', () => {

        it('debe propagar TypeError con httpStatus indefinido cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.obtenerPorId(ID_FAKE);
            } catch (err) {
                errorCapturado = err;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
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
