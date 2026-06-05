import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import InscripcionesDao from '../../js/control/inscripciones_dao.js';
import InscripcionPrueba from '../../js/entity/InscripcionPrueba.js';

describe('InscripcionesDao - Pruebas Unitarias con Stubs', () => {
    let inscripcionesDao;

    const ASPIRANTE_ID    = 'uuid-aspirante-1';
    const PRUEBA_ID       = 'uuid-prueba-1';

    beforeEach(() => {
        inscripcionesDao = new InscripcionesDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de InscripcionesDao', () => {
            expect(inscripcionesDao).to.be.instanceOf(InscripcionesDao);
        });

        it('debe configurar BASE_URL con "inscripciones_prueba"', () => {
            expect(inscripcionesDao.BASE_URL).to.include('inscripciones_prueba');
        });

        it('debe incluir el prefijo /v1/ en BASE_URL', () => {
            expect(inscripcionesDao.BASE_URL).to.include('/v1/');
        });
    });

    // NOTA: InscripcionesDao no tiene método inscribir.
    // El POST /aspirantes/{id}/inscripciones pertenece a AspirantesDao.crearInscripcion().
    // Las pruebas de ese contrato HTTP están en aspirantes_dao.unit.test.js.

    describe('obtenerPorId con Stub', () => {
        it('debe retornar una instancia de InscripcionPrueba', async () => {
            const mockRespuesta = {
                idInscripcionPrueba: 'uuid-inscripcion-1',
                aspiranteDato:       { id: ASPIRANTE_ID },
                pruebaAdmision:      { idPruebaAdmision: PRUEBA_ID },
                estado:              'INSCRITO'
            };
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await inscripcionesDao.obtenerPorId('uuid-inscripcion-1');

            expect(resultado).to.be.instanceOf(InscripcionPrueba);
            expect(resultado.idInscripcionPrueba).to.equal('uuid-inscripcion-1');
        });

        it('URL debe incluir inscripciones_prueba/{id}', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve({}) }); };

            await inscripcionesDao.obtenerPorId('uuid-inscripcion-1');

            expect(capturedUrl).to.include('inscripciones_prueba/uuid-inscripcion-1');
        });

        it('debe usar método GET', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 200, json: () => Promise.resolve({}) }); };

            await inscripcionesDao.obtenerPorId('uuid-inscripcion-1');

            expect(capturedOpts.method).to.equal('GET');
        });

        it('debe lanzar error si id no se proporciona', async () => {
            try {
                await inscripcionesDao.obtenerPorId(null);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404 });

            try {
                await inscripcionesDao.obtenerPorId('uuid-no-existe');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método obtenerPorId accesible', () => {
            expect(typeof inscripcionesDao.obtenerPorId).to.equal('function');
        });
    });
});
