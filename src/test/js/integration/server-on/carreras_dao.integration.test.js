import { expect } from '../../lib/chai/index.js';
import CarrerasDao from '../../../../js/control/carreras_dao.js';
import Carrera from '../../../../js/entity/Carrera.js';

describe('CarrerasDao — Integración con backend', () => {
    let dao;

    beforeEach(() => {
        dao = new CarrerasDao();
    });

    // ── GET /carreras ─────────────────────────────────────────────────────────

    describe('GET /carreras — obtener todas las carreras', () => {

        it('debe retornar un array de instancias de Carrera cuando el servidor responde 200', async function () {
            this.timeout(5000);

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const resultado = await dao.obtenerTodas();

            expect(resultado).to.be.an('array');
            if (resultado.length > 0) {
                expect(resultado[0]).to.be.instanceOf(Carrera);
                expect(resultado[0].idCarrera).to.be.a('string').and.not.equal('');
                expect(resultado[0].nombreCatalogoCarrera).to.be.a('string');
            }
        });
    });

    // ── GET /carreras/{id} ────────────────────────────────────────────────────

    describe('GET /carreras/{id} — obtener carrera por ID', () => {

        it('debe retornar la misma Carrera al consultar por ID obtenido de la lista', async function () {
            this.timeout(10000);

            const carreras = await dao.obtenerTodas();

            if (carreras.length === 0) {
                // Precondición de datos: la BD no tiene carreras — skip legítimo
                this.skip();
                return;
            }

            const primeraId = carreras[0].idCarrera;
            const resultado = await dao.obtenerPorId(primeraId);

            expect(resultado).to.be.instanceOf(Carrera);
            expect(resultado.idCarrera).to.equal(primeraId);
            expect(resultado.nombreCatalogoCarrera).to.be.a('string').and.not.equal('');
        });
    });
});
