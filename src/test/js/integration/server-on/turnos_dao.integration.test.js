import { expect } from '../../lib/chai/index.js';
import TurnosDao from '../../../../js/control/turnos_dao.js';
import Turno from '../../../../js/entity/Turno.js';

describe('TurnosDao — Integración con backend', () => {
    let dao;

    beforeEach(() => {
        dao = new TurnosDao();
    });

    // ── GET /turnos ───────────────────────────────────────────────────────────

    describe('GET /turnos — obtener todos los turnos', () => {

        it('debe retornar un array de instancias de Turno cuando el servidor responde 200', async function () {
            this.timeout(5000);

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const resultado = await dao.obtenerTurnos();

            expect(resultado).to.be.an('array');
            if (resultado.length > 0) {
                expect(resultado[0]).to.be.instanceOf(Turno);
                expect(resultado[0].idTurnoExamen).to.exist;
                expect(resultado[0].nombreTurno).to.be.a('string');
            }
        });
    });

    // ── GET /turnos/{id} ──────────────────────────────────────────────────────

    describe('GET /turnos/{id} — obtener turno por ID', () => {

        it('debe retornar el mismo Turno al consultar por ID existente obtenido de la lista', async function () {
            this.timeout(10000);

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const turnos = await dao.obtenerTurnos();

            if (turnos.length === 0) {
                // Precondición de datos: la BD no tiene turnos — skip legítimo (no es fallo del servidor)
                this.skip();
                return;
            }

            const primeraId = turnos[0].idTurnoExamen;
            const resultado = await dao.obtenerTurnoPorId(primeraId);

            expect(resultado).to.be.instanceOf(Turno);
            expect(resultado.idTurnoExamen).to.equal(primeraId);
            expect(resultado.nombreTurno).to.be.a('string');
        });
    });
});
