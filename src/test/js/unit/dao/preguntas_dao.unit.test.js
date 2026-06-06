import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import PreguntasDao from '../../../../js/control/preguntas_dao.js';
import Pregunta from '../../../../js/entity/Pregunta.js';
import Opcion from '../../../../js/entity/Opcion.js';

describe('PreguntasDao - Pruebas Unitarias con Stubs', () => {
    let preguntasDao;

    beforeEach(() => {
        preguntasDao = new PreguntasDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de PreguntasDao', () => {
            expect(preguntasDao).to.be.instanceOf(PreguntasDao);
        });

        it('debe tener la URL base correctamente configurada', () => {
            expect(preguntasDao.BASE_URL).to.include('preguntas');
        });

        it('debe incluir el prefijo /v1/ en la URL', () => {
            expect(preguntasDao.BASE_URL).to.include('/v1/');
        });

        it('debe tener URL que comience con http://localhost:9080', () => {
            expect(preguntasDao.BASE_URL).to.include('http://localhost:9080');
        });

        it('debe terminar con "preguntas" sin barra diagonal', () => {
            expect(preguntasDao.BASE_URL).to.match(/preguntas$/);
        });

        it('debe tener URL con patrón válido', () => {
            const pattern = /^http:\/\/.+:\d+\/.+\/v1\/preguntas$/;
            expect(preguntasDao.BASE_URL).to.match(pattern);
        });
    });

    describe('obtenerTodas con Stub', () => {
        it('debe retornar instancias de Pregunta', async () => {
            const mockData = [
                { idBancoPregunta: 'uuid-p1', enunciado: '¿Cuál es la capital de El Salvador?', tema: null },
                { idBancoPregunta: 'uuid-p2', enunciado: '¿Cuánto es 2+2?', tema: null }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await preguntasDao.obtenerTodas();

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(2);
            expect(resultado[0]).to.be.instanceOf(Pregunta);
        });

        it('debe mapear idBancoPregunta y enunciado correctamente', async () => {
            const mockData = [
                { idBancoPregunta: 'uuid-p1', enunciado: '¿Cuál es la capital?', tema: null }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await preguntasDao.obtenerTodas();

            expect(resultado[0].idBancoPregunta).to.equal('uuid-p1');
            expect(resultado[0].enunciado).to.equal('¿Cuál es la capital?');
        });

        it('URL debe incluir los parámetros first y max', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await preguntasDao.obtenerTodas();

            expect(capturedUrl).to.include('first=');
            expect(capturedUrl).to.include('max=');
        });

        it('debe retornar array vacío cuando no hay preguntas', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });
            const resultado = await preguntasDao.obtenerTodas();
            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(0);
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500 });

            try {
                await preguntasDao.obtenerTodas();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser una función', () => {
            expect(preguntasDao.obtenerTodas).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });
            const resultado = preguntasDao.obtenerTodas();
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('obtenerOpcionesDePregunta con Stub', () => {
        it('debe retornar instancias de Opcion', async () => {
            const mockOpciones = [
                { idPreguntaOpcion: 'uuid-o1', textoRespuesta: 'San Salvador' },
                { idPreguntaOpcion: 'uuid-o2', textoRespuesta: 'Santa Ana' },
                { idPreguntaOpcion: 'uuid-o3', textoRespuesta: 'Sonsonate' }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockOpciones) });

            const resultado = await preguntasDao.obtenerOpcionesDePregunta('uuid-p1');

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(3);
            expect(resultado[0]).to.be.instanceOf(Opcion);
        });

        it('debe mapear las propiedades de cada opción', async () => {
            const mockOpciones = [
                {
                    idPreguntaOpcion: 'uuid-o1',
                    idRespuestaGlobal: { idBancoRespuesta: 'uuid-r1', textoRespuesta: 'San Salvador', areaConocimiento: null }
                }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockOpciones) });

            const resultado = await preguntasDao.obtenerOpcionesDePregunta('uuid-p1');

            expect(resultado[0].idPreguntaOpcion).to.equal('uuid-o1');
            // textoRespuesta está en idRespuestaGlobal (BancoRespuesta), no como propiedad directa de Opcion
            expect(resultado[0].idRespuestaGlobal.textoRespuesta).to.equal('San Salvador');
        });

        it('debe lanzar error cuando se llama sin ID', async () => {
            try {
                await preguntasDao.obtenerOpcionesDePregunta();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor devuelve 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404, json: () => Promise.reject(new Error('Not Found')) });

            try {
                await preguntasDao.obtenerOpcionesDePregunta('uuid-inexistente');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser un método que acepta parámetros', () => {
            expect(preguntasDao.obtenerOpcionesDePregunta.length).to.be.at.least(1);
        });

        it('debe tener tipo function', () => {
            expect(typeof preguntasDao.obtenerOpcionesDePregunta).to.equal('function');
        });
    });

    describe('Validación de URLs', () => {
        it('debe mantener URL consistente entre instancias', () => {
            const dao1 = new PreguntasDao();
            const dao2 = new PreguntasDao();
            expect(dao1.BASE_URL).to.equal(dao2.BASE_URL);
        });

        it('debe contener "preguntas" una sola vez', () => {
            const count = (preguntasDao.BASE_URL.match(/preguntas/g) || []).length;
            expect(count).to.equal(1);
        });

        it('debe no contener valores indefinidos', () => {
            expect(preguntasDao.BASE_URL).to.not.include('undefined');
            expect(preguntasDao.BASE_URL).to.not.include('null');
            expect(preguntasDao.BASE_URL).to.not.include('NaN');
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método obtenerTodas accesible', () => {
            expect(typeof preguntasDao.obtenerTodas).to.equal('function');
        });

        it('debe tener el método obtenerOpcionesDePregunta accesible', () => {
            expect(typeof preguntasDao.obtenerOpcionesDePregunta).to.equal('function');
        });

        it('debe tener ambos métodos implementados', () => {
            expect(preguntasDao.obtenerTodas).to.exist;
            expect(preguntasDao.obtenerOpcionesDePregunta).to.exist;
        });
    });
});
