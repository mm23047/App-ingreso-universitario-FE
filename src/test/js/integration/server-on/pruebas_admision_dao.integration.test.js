import { expect } from '../../lib/chai/index.js';
import PruebasAdmisionDao from '../../../../js/control/pruebas_admision_dao.js';
import PruebaAdmision from '../../../../js/entity/PruebaAdmision.js';

describe('PruebasAdmisionDao — Integración con backend', () => {
    let dao;

    beforeEach(() => {
        dao = new PruebasAdmisionDao();
    });

    // ── GET /pruebas_admision/activas ─────────────────────────────────────────

    describe('GET /pruebas_admision/activas — obtener pruebas activas', () => {

        it('debe retornar un array cuando el servidor responde 200', async function () {
            this.timeout(5000);

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const resultado = await dao.obtenerActivas();

            expect(resultado).to.be.an('array');
            if (resultado.length > 0) {
                expect(resultado[0]).to.be.instanceOf(PruebaAdmision);
                expect(resultado[0].idPruebaAdmision).to.exist;
                expect(resultado[0].nombrePrueba).to.be.a('string');
                expect(resultado[0].activa).to.be.true;
            }
        });
    });

    // ── GET /pruebas_admision?first&max ───────────────────────────────────────

    describe('GET /pruebas_admision — obtener todas las pruebas paginadas', () => {

        it('debe retornar un array de PruebaAdmision con first=0 y max=50', async function () {
            this.timeout(5000);

            const resultado = await dao.obtenerTodas(0, 50);

            expect(resultado).to.be.an('array');
            if (resultado.length > 0) {
                expect(resultado[0]).to.be.instanceOf(PruebaAdmision);
                expect(resultado[0].idPruebaAdmision).to.exist;
                expect(resultado[0].nombrePrueba).to.be.a('string');
                expect(resultado[0].anio).to.exist;
            }
        });

    });

    // ── GET /pruebas_admision/{id} ────────────────────────────────────────────

    describe('GET /pruebas_admision/{id} — obtener prueba por ID', () => {

        it('debe retornar la misma PruebaAdmision al consultar por ID obtenido de la lista', async function () {
            this.timeout(10000);

            const todas = await dao.obtenerTodas(0, 50);

            if (todas.length === 0) {
                // Precondición de datos: la BD no tiene pruebas — skip legítimo
                this.skip();
                return;
            }

            const primeraId = todas[0].idPruebaAdmision;
            const resultado = await dao.obtenerPorId(primeraId);

            expect(resultado).to.be.instanceOf(PruebaAdmision);
            expect(resultado.idPruebaAdmision).to.equal(primeraId);
            expect(resultado.nombrePrueba).to.be.a('string').and.not.equal('');
        });
    });
});
