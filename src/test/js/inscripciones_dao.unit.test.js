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

        it('debe tener aspirantesUrl configurada con "aspirantes"', () => {
            expect(inscripcionesDao.aspirantesUrl).to.include('aspirantes');
        });

        it('debe tener inscripcionesUrl configurada con "inscripciones_prueba"', () => {
            expect(inscripcionesDao.inscripcionesUrl).to.include('inscripciones_prueba');
        });

        it('debe incluir el prefijo /v1/ en las URLs', () => {
            expect(inscripcionesDao.aspirantesUrl).to.include('/v1/');
            expect(inscripcionesDao.inscripcionesUrl).to.include('/v1/');
        });
    });

    describe('inscribir con Stub', () => {
        it('debe retornar una instancia de InscripcionPrueba', async () => {
            const mockRespuesta = {
                id: 'uuid-inscripcion-1',
                aspiranteId: ASPIRANTE_ID,
                pruebaAdmisionId: PRUEBA_ID
            };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await inscripcionesDao.inscribir(ASPIRANTE_ID, PRUEBA_ID);

            expect(resultado).to.be.instanceOf(InscripcionPrueba);
            expect(resultado).to.have.property('id', 'uuid-inscripcion-1');
        });

        it('debe enviar el body con pruebaAdmision.idPruebaAdmision', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });

            await inscripcionesDao.inscribir(ASPIRANTE_ID, PRUEBA_ID);

            const bodyEnviado = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(bodyEnviado).to.have.property('pruebaAdmision');
            expect(bodyEnviado.pruebaAdmision.idPruebaAdmision).to.equal(PRUEBA_ID);
        });

        it('debe usar la URL del endpoint anidado de aspirantes', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });

            await inscripcionesDao.inscribir(ASPIRANTE_ID, PRUEBA_ID);

            const urlLlamada = window.fetch.firstCall.args[0];
            expect(urlLlamada).to.include(`aspirantes/${ASPIRANTE_ID}/inscripciones`);
        });

        it('debe lanzar error cuando no se proporciona aspiranteId', async () => {
            try {
                await inscripcionesDao.inscribir(null, PRUEBA_ID);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando no se proporciona pruebaAdmisionId', async () => {
            try {
                await inscripcionesDao.inscribir(ASPIRANTE_ID, null);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 409 (ya inscrito)', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 409, json: () => Promise.reject(new Error('Conflict')) });

            try {
                await inscripcionesDao.inscribir(ASPIRANTE_ID, PRUEBA_ID);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 400', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 400, json: () => Promise.reject(new Error('Bad Request')) });

            try {
                await inscripcionesDao.inscribir(ASPIRANTE_ID, PRUEBA_ID);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser una función', () => {
            expect(inscripcionesDao.inscribir).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });
            const resultado = inscripcionesDao.inscribir(ASPIRANTE_ID, PRUEBA_ID);
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método inscribir accesible', () => {
            expect(typeof inscripcionesDao.inscribir).to.equal('function');
        });

        it('debe tener el método obtenerPorId accesible', () => {
            expect(typeof inscripcionesDao.obtenerPorId).to.equal('function');
        });
    });
});
