import { expect }      from '../../lib/chai/index.js';
import InscripcionesDao from '../../../../js/control/inscripciones_dao.js';

const ID_FAKE = '00000000-0000-0000-0000-000000000005';

describe('InscripcionesDao — Backend apagado (errores de red)', () => {
    let dao;

    beforeEach(() => {
        dao = new InscripcionesDao();
    });

    // ── GET /inscripciones_prueba/{id} ────────────────────────────────────────

    describe('GET /inscripciones_prueba/{id} — obtener inscripción por ID', () => {

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

    // ── DELETE /inscripciones_prueba/{id} ─────────────────────────────────────

    describe('DELETE /inscripciones_prueba/{id} — eliminar inscripción', () => {

        it('debe propagar TypeError con httpStatus indefinido cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.eliminar(ID_FAKE);
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
