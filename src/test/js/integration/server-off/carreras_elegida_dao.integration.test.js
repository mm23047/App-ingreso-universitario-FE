import { expect }        from '../../lib/chai/index.js';
import CarrerasElegidaDao from '../../../../js/control/carreras_elegida_dao.js';

// IDs ficticios — el fetch fallará antes de llegar al backend (ECONNREFUSED).
const ID_INSCRIPCION_FALSO = '00000000-0000-0000-0000-000000000001';
const ID_CARRERA_FALSO     = 'CAR-TEST';

describe('CarrerasElegidaDao — Backend apagado (errores de red)', () => {
    let dao;

    beforeEach(() => {
        dao = new CarrerasElegidaDao();
    });

    // ── agregarCarrera() ──────────────────────────────────────────────────────

    describe('POST /inscripciones_prueba/{id}/carreras — backend apagado', () => {

        it('debe propagar TypeError de red cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.agregarCarrera(ID_INSCRIPCION_FALSO, ID_CARRERA_FALSO, 1);
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

    // ── obtenerPorInscripcion() ───────────────────────────────────────────────

    describe('GET /inscripciones_prueba/{id}/carreras — backend apagado', () => {

        it('debe propagar TypeError de red cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.obtenerPorInscripcion(ID_INSCRIPCION_FALSO);
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
