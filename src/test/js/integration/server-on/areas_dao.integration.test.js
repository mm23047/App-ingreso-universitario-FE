import { expect }           from '../../lib/chai/index.js';
import AreasConocimientoDao  from '../../../../js/control/areas_dao.js';
import PruebasAdmisionDao    from '../../../../js/control/pruebas_admision_dao.js';
import AreaConocimiento      from '../../../../js/entity/AreaConocimiento.js';

describe('AreasConocimientoDao — Integración con backend', () => {
    let dao;
    let pruebasDao;

    beforeEach(() => {
        dao       = new AreasConocimientoDao();
        pruebasDao = new PruebasAdmisionDao();
    });

    // ── GET /areas — obtener todas las áreas de conocimiento ──────────────────

    describe('GET /areas — obtenerTodas()', () => {

        it('debe retornar un array de instancias de AreaConocimiento cuando el backend responde 200', async function () {
            this.timeout(5000);

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const resultado = await dao.obtenerTodas();

            expect(resultado).to.be.an('array');
            if (resultado.length > 0) {
                expect(resultado[0]).to.be.instanceOf(AreaConocimiento);
                expect(resultado[0].idAreaConocimiento).to.exist;
                expect(resultado[0].nombreArea).to.be.a('string').and.not.equal('');
            }
        });
    });

    // ── GET /pruebas_admision/{id}/areas — árbol de áreas por prueba ──────────
    //
    // Este endpoint es el punto de entrada del flujo "árbol de áreas" del examen.
    // El backend retorna JSON crudo (no mapeado a AreaConocimiento) con la estructura:
    //   [{ idAreaConocimiento, nombreArea, temas: [{ idTema, nombreTema }] }]

    describe('GET /pruebas_admision/{id}/areas — obtenerAreasPorPrueba()', () => {

        it('debe retornar un array con la estructura de áreas y temas cuando el backend responde 200', async function () {
            this.timeout(10000);

            // Precondición: necesitamos una prueba existente para usar su ID
            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const pruebas = await pruebasDao.obtenerTodas(0, 1);

            if (pruebas.length === 0) {
                // Precondición de datos: no hay pruebas en la BD — skip legítimo
                this.skip();
                return;
            }

            const idPrueba = pruebas[0].idPruebaAdmision;
            const resultado = await dao.obtenerAreasPorPrueba(idPrueba);

            expect(resultado).to.be.an('array');

            if (resultado.length > 0) {
                const area = resultado[0];

                expect(area).to.have.property('idAreaConocimiento').that.is.not.null;
                expect(area).to.have.property('nombreArea').that.is.a('string').and.not.equal('');
                expect(area).to.have.property('temas').that.is.an('array');

                if (area.temas.length > 0) {
                    const tema = area.temas[0];
                    expect(tema).to.have.property('idTema').that.is.not.null;
                    expect(tema).to.have.property('nombreTema').that.is.a('string');
                }
            }
        });
    });
});
