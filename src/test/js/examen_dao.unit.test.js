import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import ExamenDao from '../../js/dao/examen_dao.js';
import ExamenRealizado from '../../js/entity/ExamenRealizado.js';
import RespuestaExamen from '../../js/entity/RespuestaExamen.js';

describe('ExamenDao - Pruebas Unitarias con Stubs', () => {
    let examenDao;

    beforeEach(() => {
        examenDao = new ExamenDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de ExamenDao', () => {
            expect(examenDao).to.be.instanceOf(ExamenDao);
        });

        it('debe tener examenUrl configurada con "examen_realizado"', () => {
            expect(examenDao.examenUrl).to.include('examen_realizado');
        });

        it('debe tener respuestasUrl configurada con "respuestas_examen"', () => {
            expect(examenDao.respuestasUrl).to.include('respuestas_examen');
        });

        it('debe incluir el prefijo /v1/ en examenUrl', () => {
            expect(examenDao.examenUrl).to.include('/v1/');
        });

        it('debe incluir el prefijo /v1/ en respuestasUrl', () => {
            expect(examenDao.respuestasUrl).to.include('/v1/');
        });

        it('examenUrl debe terminar con "examen_realizado"', () => {
            expect(examenDao.examenUrl).to.match(/examen_realizado$/);
        });

        it('respuestasUrl debe terminar con "respuestas_examen"', () => {
            expect(examenDao.respuestasUrl).to.match(/respuestas_examen$/);
        });

        it('examenUrl y respuestasUrl deben ser diferentes', () => {
            expect(examenDao.examenUrl).to.not.equal(examenDao.respuestasUrl);
        });
    });

    describe('iniciarExamen con Stub', () => {
        it('debe retornar una instancia de ExamenRealizado', async () => {
            const mockRespuesta = {
                id: 'uuid-examen-1',
                aspiranteId: 'uuid-asp-1',
                pruebaId: 'uuid-prueba-1'
            };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await examenDao.iniciarExamen('uuid-asp-1', 'uuid-prueba-1');

            expect(resultado).to.be.instanceOf(ExamenRealizado);
            expect(resultado).to.have.property('id', 'uuid-examen-1');
        });

        it('debe mapear las propiedades del examen', async () => {
            const mockRespuesta = {
                id: 'uuid-examen-1',
                aspiranteId: 'uuid-asp-1',
                pruebaId: 'uuid-prueba-1'
            };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await examenDao.iniciarExamen('uuid-asp-1', 'uuid-prueba-1');

            expect(resultado.aspiranteId).to.equal('uuid-asp-1');
            expect(resultado.pruebaId).to.equal('uuid-prueba-1');
        });

        it('debe lanzar error cuando no se proporciona aspiranteId', async () => {
            try {
                await examenDao.iniciarExamen(null, 'uuid-prueba-1');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando no se proporciona pruebaId', async () => {
            try {
                await examenDao.iniciarExamen('uuid-asp-1', null);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando no se proporcionan ambos parámetros', async () => {
            try {
                await examenDao.iniciarExamen();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 400', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 400, json: () => Promise.reject(new Error('Bad Request')) });

            try {
                await examenDao.iniciarExamen('uuid-asp-1', 'uuid-prueba-1');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 409 (ya tiene examen)', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 409, json: () => Promise.reject(new Error('Conflict')) });

            try {
                await examenDao.iniciarExamen('uuid-asp-1', 'uuid-prueba-1');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser una función', () => {
            expect(examenDao.iniciarExamen).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });
            const resultado = examenDao.iniciarExamen('uuid-asp-1', 'uuid-prueba-1');
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('enviarRespuestas con Stub', () => {
        const mockRespuestas = [
            { preguntaId: 'uuid-p1', opcionId: 'uuid-o1' },
            { preguntaId: 'uuid-p2', opcionId: 'uuid-o3' }
        ];

        it('debe retornar una instancia de RespuestaExamen', async () => {
            const mockRespuesta = { id: 'uuid-resp-1', examenId: 'uuid-examen-1', guardado: true };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await examenDao.enviarRespuestas('uuid-examen-1', mockRespuestas);

            expect(resultado).to.be.instanceOf(RespuestaExamen);
            expect(resultado.id).to.equal('uuid-resp-1');
        });

        it('debe mapear las propiedades de la respuesta', async () => {
            const mockRespuesta = { id: 'uuid-resp-1', examenId: 'uuid-examen-1', guardado: true };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await examenDao.enviarRespuestas('uuid-examen-1', mockRespuestas);

            expect(resultado.examenId).to.equal('uuid-examen-1');
            expect(resultado.guardado).to.equal(true);
        });

        it('debe lanzar error cuando no se proporciona examenId', async () => {
            try {
                await examenDao.enviarRespuestas(null, mockRespuestas);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando no se proporcionan respuestas', async () => {
            try {
                await examenDao.enviarRespuestas('uuid-examen-1', null);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 400', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 400, json: () => Promise.reject(new Error('Bad Request')) });

            try {
                await examenDao.enviarRespuestas('uuid-examen-1', mockRespuestas);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500, json: () => Promise.reject(new Error('Server Error')) });

            try {
                await examenDao.enviarRespuestas('uuid-examen-1', mockRespuestas);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser una función', () => {
            expect(examenDao.enviarRespuestas).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });
            const resultado = examenDao.enviarRespuestas('uuid-examen-1', mockRespuestas);
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('Validación de URLs', () => {
        it('debe mantener URLs consistentes entre instancias', () => {
            const dao1 = new ExamenDao();
            const dao2 = new ExamenDao();
            expect(dao1.examenUrl).to.equal(dao2.examenUrl);
            expect(dao1.respuestasUrl).to.equal(dao2.respuestasUrl);
        });

        it('examenUrl no debe contener valores indefinidos', () => {
            expect(examenDao.examenUrl).to.not.include('undefined');
            expect(examenDao.examenUrl).to.not.include('null');
        });

        it('respuestasUrl no debe contener valores indefinidos', () => {
            expect(examenDao.respuestasUrl).to.not.include('undefined');
            expect(examenDao.respuestasUrl).to.not.include('null');
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método iniciarExamen accesible', () => {
            expect(typeof examenDao.iniciarExamen).to.equal('function');
        });

        it('debe tener el método enviarRespuestas accesible', () => {
            expect(typeof examenDao.enviarRespuestas).to.equal('function');
        });

        it('debe tener ambos métodos implementados', () => {
            expect(examenDao.iniciarExamen).to.exist;
            expect(examenDao.enviarRespuestas).to.exist;
        });
    });
});
