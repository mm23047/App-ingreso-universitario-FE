import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import PreguntasDao from '../../js/dao/preguntas_dao.js';
import Pregunta from '../../js/entity/Pregunta.js';
import Opcion from '../../js/entity/Opcion.js';

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

    describe('obtenerPorPrueba con Stub', () => {
        it('debe retornar instancias de Pregunta', async () => {
            const mockData = [
                {
                    idBancoPregunta: 'uuid-p1',
                    textoPregunta: '¿Cuál es la capital de El Salvador?',
                    opciones: [
                        { idPreguntaOpcion: 'uuid-o1', textoRespuesta: 'San Salvador' },
                        { idPreguntaOpcion: 'uuid-o2', textoRespuesta: 'Santa Ana' }
                    ]
                }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await preguntasDao.obtenerPorPrueba('uuid-prueba-1');

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(1);
            expect(resultado[0]).to.be.instanceOf(Pregunta);
        });

        it('debe mapear opciones como instancias de Opcion', async () => {
            const mockData = [
                {
                    idBancoPregunta: 'uuid-p1',
                    textoPregunta: '¿Cuál es la capital de El Salvador?',
                    opciones: [
                        { idPreguntaOpcion: 'uuid-o1', textoRespuesta: 'San Salvador' }
                    ]
                }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await preguntasDao.obtenerPorPrueba('uuid-prueba-1');

            expect(resultado[0].opciones[0]).to.be.instanceOf(Opcion);
            expect(resultado[0].opciones[0].textoRespuesta).to.equal('San Salvador');
        });

        it('debe mapear las propiedades de la pregunta correctamente', async () => {
            const mockData = [
                {
                    idBancoPregunta: 'uuid-p1',
                    textoPregunta: '¿Cuál es la capital?',
                    opciones: []
                }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await preguntasDao.obtenerPorPrueba('uuid-prueba-1');

            expect(resultado[0].idBancoPregunta).to.equal('uuid-p1');
            expect(resultado[0].textoPregunta).to.equal('¿Cuál es la capital?');
        });

        it('debe lanzar error cuando no se proporciona pruebaId', async () => {
            try {
                await preguntasDao.obtenerPorPrueba();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500, json: () => Promise.reject(new Error('Server Error')) });

            try {
                await preguntasDao.obtenerPorPrueba('uuid-prueba-1');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe retornar array vacío cuando no hay preguntas', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });
            const resultado = await preguntasDao.obtenerPorPrueba('uuid-prueba-1');
            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(0);
        });

        it('debe ser una función', () => {
            expect(preguntasDao.obtenerPorPrueba).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });
            const resultado = preguntasDao.obtenerPorPrueba('uuid-prueba-1');
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
                { idPreguntaOpcion: 'uuid-o1', textoRespuesta: 'San Salvador' }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockOpciones) });

            const resultado = await preguntasDao.obtenerOpcionesDePregunta('uuid-p1');

            expect(resultado[0].idPreguntaOpcion).to.equal('uuid-o1');
            expect(resultado[0].textoRespuesta).to.equal('San Salvador');
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
        it('debe tener el método obtenerPorPrueba accesible', () => {
            expect(typeof preguntasDao.obtenerPorPrueba).to.equal('function');
        });

        it('debe tener el método obtenerOpcionesDePregunta accesible', () => {
            expect(typeof preguntasDao.obtenerOpcionesDePregunta).to.equal('function');
        });

        it('debe tener ambos métodos implementados', () => {
            expect(preguntasDao.obtenerPorPrueba).to.exist;
            expect(preguntasDao.obtenerOpcionesDePregunta).to.exist;
        });
    });
});
