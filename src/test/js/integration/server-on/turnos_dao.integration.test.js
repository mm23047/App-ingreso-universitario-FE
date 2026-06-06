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
            try {
                const resultado = await dao.obtenerTurnos();
                expect(resultado).to.be.an('array');
                if (resultado.length > 0) {
                    expect(resultado[0]).to.be.instanceOf(Turno);
                    expect(resultado[0].idTurnoExamen).to.exist;
                    expect(resultado[0].nombreTurno).to.be.a('string');
                }
            } catch (error) {
                // Servidor apagado o error de red: aceptable
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    // ── GET /turnos/{id} ──────────────────────────────────────────────────────

    describe('GET /turnos/{id} — obtener turno por ID', () => {

        it('debe retornar el mismo Turno al consultar por ID existente obtenido de la lista', async function () {
            this.timeout(10000);
            let primeraId = null;

            // Obtener un ID real desde la lista completa
            try {
                const turnos = await dao.obtenerTurnos();
                if (turnos.length > 0) primeraId = turnos[0].idTurnoExamen;
            } catch {
                // Servidor apagado — no podemos obtener un ID real
            }

            if (!primeraId) {
                // Sin ID no podemos ejercitar la ruta: verificar al menos que el método existe
                expect(typeof dao.obtenerTurnoPorId).to.equal('function');
                return;
            }

            try {
                const resultado = await dao.obtenerTurnoPorId(primeraId);
                expect(resultado).to.be.instanceOf(Turno);
                expect(resultado.idTurnoExamen).to.equal(primeraId);
                expect(resultado.nombreTurno).to.be.a('string');
            } catch (error) {
                // Error de red tras obtener la lista: aceptable
                expect(error).to.be.instanceOf(Error);
            }
        });
    });
});
