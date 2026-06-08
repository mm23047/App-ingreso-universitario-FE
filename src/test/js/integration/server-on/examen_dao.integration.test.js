import { expect }          from '../../lib/chai/index.js';
import ExamenRealizadoDao  from '../../../../js/control/examen_realizado_dao.js';
import AspirantesDao       from '../../../../js/control/aspirantes_dao.js';

// UUID con formato válido pero garantizado inexistente en la BD de test
const UUID_INEXISTENTE = '00000000-dead-beef-dead-000000000000';

function generarDatos() {
    const n = Math.floor(Math.random() * 99999999);
    const d = Math.floor(Math.random() * 9);
    return {
        nombres:         'Test Examen DAO',
        apellidos:       'Integración',
        dui:             `${String(n).padStart(8, '0')}-${d}`,
        fechaNacimiento: '2001-06-15',
        correo:          `examen.dao.on.${Date.now()}.${n}@tpi-test.sv`,
        usaSillaRuedas:  false
    };
}

describe('ExamenRealizadoDao — Integración con backend', () => {
    let dao;
    let aspirantesDao;
    const idsCreados = [];

    beforeEach(() => {
        dao           = new ExamenRealizadoDao();
        aspirantesDao = new AspirantesDao();
    });

    afterEach(async function () {
        this.timeout(5000);
        while (idsCreados.length > 0) {
            const id = idsCreados.pop();
            try {
                await aspirantesDao.eliminar(id);
            } catch (e) {
                console.warn(`[cleanup] No se pudo eliminar aspirante ${id}: ${e.message}`);
            }
        }
    });

    // ── GET /examen_realizado/aspirante/{id} ──────────────────────────────────

    describe('obtenerPorAspirante(aspiranteId)', () => {

        it('debe retornar array vacío cuando el aspirante existe pero no tiene exámenes', async function () {
            this.timeout(10000);

            const aspirante = await aspirantesDao.crear(generarDatos());
            idsCreados.push(aspirante.id);

            const resultado = await dao.obtenerPorAspirante(aspirante.id);

            expect(resultado).to.be.an('array');
            expect(resultado).to.have.lengthOf(0);
        });

        it('debe retornar array vacío cuando el UUID de aspirante no existe en la BD (404 → [])', async function () {
            this.timeout(5000);

            const resultado = await dao.obtenerPorAspirante(UUID_INEXISTENTE);

            expect(resultado).to.be.an('array');
            expect(resultado).to.have.lengthOf(0);
        });
    });

    // ── GET /examen_realizado/{id}/preguntas ──────────────────────────────────

    describe('obtenerPreguntas(examenId)', () => {

        it('debe lanzar error cuando el ID de examen no existe en la BD', async function () {
            this.timeout(5000);

            let errorCapturado;
            try {
                await dao.obtenerPreguntas(UUID_INEXISTENTE);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado, 'Debe lanzar error para examen inexistente').to.exist;
            expect(errorCapturado).to.be.instanceOf(Error);
            expect(errorCapturado.message).to.match(/Error HTTP: [45]\d\d/);
        });
    });

    // ── POST /examen_realizado (precondición inválida) ────────────────────────

    describe('iniciarExamen(inscripcionId, etapaId)', () => {

        it('debe lanzar error cuando la inscripción o etapa no existen en la BD', async function () {
            this.timeout(5000);

            let errorCapturado;
            try {
                await dao.iniciarExamen(UUID_INEXISTENTE, UUID_INEXISTENTE);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado, 'Debe lanzar error para IDs inexistentes').to.exist;
            expect(errorCapturado).to.be.instanceOf(Error);
            expect(errorCapturado.message).to.match(/Error HTTP: [45]\d\d/);
        });
    });
});
