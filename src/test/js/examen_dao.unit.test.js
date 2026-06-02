import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import ExamenDao from '../../js/control/examen_dao.js';
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

            const resultado = await examenDao.iniciarExamen('uuid-inscripcion-1', 'uuid-etapa-1');

            expect(resultado).to.be.instanceOf(ExamenRealizado);
            expect(resultado).to.have.property('id', 'uuid-examen-1');
        });

        it('debe enviar el body con idInscripcion e idEtapa', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });

            await examenDao.iniciarExamen('uuid-inscripcion-1', 'uuid-etapa-1');

            const bodyEnviado = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(bodyEnviado).to.have.property('idInscripcion', 'uuid-inscripcion-1');
            expect(bodyEnviado).to.have.property('idEtapa', 'uuid-etapa-1');
        });

        it('debe lanzar error cuando no se proporciona inscripcionId', async () => {
            try {
                await examenDao.iniciarExamen(null, 'uuid-etapa-1');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando no se proporciona etapaId', async () => {
            try {
                await examenDao.iniciarExamen('uuid-inscripcion-1', null);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 409 (examen ya existe)', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 409, json: () => Promise.reject(new Error('Conflict')) });

            try {
                await examenDao.iniciarExamen('uuid-inscripcion-1', 'uuid-etapa-1');
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
            const resultado = examenDao.iniciarExamen('uuid-inscripcion-1', 'uuid-etapa-1');
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('enviarRespuestasLote con Stub', () => {
        const mockOpcionesIds = ['uuid-o1', 'uuid-o2', 'uuid-o3'];

        it('debe retornar true al enviar lote exitosamente', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve('Respuestas procesadas') });

            const resultado = await examenDao.enviarRespuestasLote('uuid-examen-1', mockOpcionesIds);

            expect(resultado).to.be.true;
        });

        it('debe enviar el body con idExamen y opcionesSeleccionadas', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });

            await examenDao.enviarRespuestasLote('uuid-examen-1', mockOpcionesIds);

            const bodyEnviado = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(bodyEnviado).to.have.property('idExamen', 'uuid-examen-1');
            expect(bodyEnviado).to.have.property('opcionesSeleccionadas');
            expect(bodyEnviado.opcionesSeleccionadas).to.deep.equal(mockOpcionesIds);
        });

        it('debe lanzar error cuando no se proporciona examenId', async () => {
            try {
                await examenDao.enviarRespuestasLote(null, mockOpcionesIds);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando la lista de opciones está vacía', async () => {
            try {
                await examenDao.enviarRespuestasLote('uuid-examen-1', []);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe ser una función', () => {
            expect(examenDao.enviarRespuestasLote).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });
            const resultado = examenDao.enviarRespuestasLote('uuid-examen-1', mockOpcionesIds);
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('enviarRespuesta individual con Stub', () => {
        it('debe enviar el body con examenRealizado y preguntaOpcion', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });

            await examenDao.enviarRespuesta('uuid-examen-1', 'uuid-opcion-1');

            const bodyEnviado = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(bodyEnviado).to.have.property('examenRealizado');
            expect(bodyEnviado).to.have.property('preguntaOpcion');
            expect(bodyEnviado.examenRealizado.idExamenRealizado).to.equal('uuid-examen-1');
            expect(bodyEnviado.preguntaOpcion.idPreguntaOpcion).to.equal('uuid-opcion-1');
        });

        it('debe retornar una instancia de RespuestaExamen', async () => {
            const mockRespuesta = { id: 'uuid-resp-1', guardado: true };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await examenDao.enviarRespuesta('uuid-examen-1', 'uuid-opcion-1');

            expect(resultado).to.be.instanceOf(RespuestaExamen);
        });

        it('debe lanzar error cuando no se proporciona examenId', async () => {
            try {
                await examenDao.enviarRespuesta(null, 'uuid-opcion-1');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
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

        it('debe tener el método enviarRespuestasLote accesible', () => {
            expect(typeof examenDao.enviarRespuestasLote).to.equal('function');
        });

        it('debe tener el método enviarRespuesta accesible', () => {
            expect(typeof examenDao.enviarRespuesta).to.equal('function');
        });

        it('debe tener el método obtenerPreguntasDelExamen accesible', () => {
            expect(typeof examenDao.obtenerPreguntasDelExamen).to.equal('function');
        });

        it('debe tener el método obtenerRespuestasGuardadas accesible', () => {
            expect(typeof examenDao.obtenerRespuestasGuardadas).to.equal('function');
        });
    });
});
