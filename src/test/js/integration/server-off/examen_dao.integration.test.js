import { expect }         from '../../lib/chai/index.js';
import ExamenRealizadoDao from '../../../../js/control/examen_realizado_dao.js';

// IDs ficticios — los fetch fallan por ECONNREFUSED antes de alcanzar el servidor.
const UUID_FALSO_1 = '00000000-0000-0000-0000-000000000001';
const UUID_FALSO_2 = '00000000-0000-0000-0000-000000000002';

describe('ExamenRealizadoDao — Backend apagado (errores de red)', () => {
    let dao;

    beforeEach(() => {
        dao = new ExamenRealizadoDao();
    });

    // ── GET /examen_realizado/aspirante/{id} ──────────────────────────────────

    describe('obtenerPorAspirante(aspiranteId)', () => {

        it('debe propagar TypeError de red cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.obtenerPorAspirante(UUID_FALSO_1);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado,
                'Se esperaba TypeError de red, no un Error HTTP del servidor'
            ).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus,
                'httpStatus definido indica que el servidor respondió'
            ).to.be.undefined;
        });
    });

    // ── GET /examen_realizado/{id}/preguntas ──────────────────────────────────

    describe('obtenerPreguntas(examenId)', () => {

        it('debe propagar TypeError de red cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.obtenerPreguntas(UUID_FALSO_1);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus).to.be.undefined;
        });
    });

    // ── POST /examen_realizado ────────────────────────────────────────────────

    describe('iniciarExamen(inscripcionId, etapaId)', () => {

        it('debe propagar TypeError de red cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.iniciarExamen(UUID_FALSO_1, UUID_FALSO_2);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus).to.be.undefined;
        });
    });
});
