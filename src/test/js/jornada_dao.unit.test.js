import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import JornadaDao from '../../js/control/jornada_dao.js';

describe('JornadaDao - Pruebas Unitarias con Stubs', () => {
    let jornadaDao;

    beforeEach(() => {
        jornadaDao = new JornadaDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de JornadaDao', () => {
            expect(jornadaDao).to.be.instanceOf(JornadaDao);
        });

        it('debe tener la URL base correctamente configurada', () => {
            expect(jornadaDao.BASE_URL).to.include('jornada');
        });

        it('debe incluir el prefijo /v1/ en la URL', () => {
            expect(jornadaDao.BASE_URL).to.include('/v1/');
        });

        it('debe tener URL que comience con http://localhost:9080', () => {
            expect(jornadaDao.BASE_URL).to.include('http://localhost:9080');
        });

        it('debe tener URL que termine con "jornada"', () => {
            expect(jornadaDao.BASE_URL).to.have.string('jornada');
        });

        it('debe terminar con "jornada" sin barra diagonal', () => {
            expect(jornadaDao.BASE_URL).to.match(/jornada$/);
        });
    });

    describe('obtenerJornadas con Stub', () => {
        it('debe retornar datos mockeados sin llamar al servidor real', async () => {
            const mockData = [
                { id: 1, nombre: 'Mañana' },
                { id: 2, nombre: 'Tarde' }
            ];

            const response = {
                status: 200,
                json: () => Promise.resolve(mockData)
            };

            sinon.stub(window, 'fetch').resolves(response);

            const resultado = await jornadaDao.obtenerJornadas();

            expect(resultado).to.deep.equal(mockData);
            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(2);
        });

        it('debe lanzar error cuando el servidor responde con error', async () => {
            const response = {
                status: 500,
                json: () => Promise.reject(new Error('Server Error'))
            };

            sinon.stub(window, 'fetch').resolves(response);

            try {
                await jornadaDao.obtenerJornadas();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser una función', () => {
            expect(jornadaDao.obtenerJornadas).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            const mockResponse = {
                status: 200,
                json: () => Promise.resolve([])
            };
            sinon.stub(window, 'fetch').resolves(mockResponse);

            const resultado = jornadaDao.obtenerJornadas();
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('obtenerJornadaPorId con Stub', () => {
        it('debe retornar una jornada específica mockeada', async () => {
            const mockData = { id: 1, nombre: 'Mañana', horario: '08:00' };

            const response = {
                status: 200,
                json: () => Promise.resolve(mockData)
            };

            sinon.stub(window, 'fetch').resolves(response);

            const resultado = await jornadaDao.obtenerJornadaPorId(1);

            expect(resultado).to.deep.equal(mockData);
            expect(resultado.id).to.equal(1);
            expect(resultado.nombre).to.equal('Mañana');
        });

        it('debe lanzar error cuando se llama sin ID', async () => {
            try {
                await jornadaDao.obtenerJornadaPorId();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe ser un método que acepta parámetros', () => {
            expect(jornadaDao.obtenerJornadaPorId.length).to.be.at.least(1);
        });

        it('debe lanzar error cuando el servidor devuelve 404', async () => {
            const response = {
                status: 404,
                json: () => Promise.reject(new Error('Not Found'))
            };

            sinon.stub(window, 'fetch').resolves(response);

            try {
                await jornadaDao.obtenerJornadaPorId(999);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser un método propio de la instancia o heredado', () => {
            expect(jornadaDao).to.have.property('obtenerJornadaPorId');
        });

        it('debe tener tipo function', () => {
            expect(typeof jornadaDao.obtenerJornadaPorId).to.equal('function');
        });
    });

    describe('Validación de URLs', () => {
        it('debe mantener URL consistente entre instancias', () => {
            const dao1 = new JornadaDao();
            const dao2 = new JornadaDao();
            expect(dao1.BASE_URL).to.equal(dao2.BASE_URL);
        });

        it('debe tener URL con patrón válido', () => {
            const pattern = /^http:\/\/.+:\d+\/.+\/v1\/jornada$/;
            expect(jornadaDao.BASE_URL).to.match(pattern);
        });

        it('debe contener "jornada" una sola vez', () => {
            const count = (jornadaDao.BASE_URL.match(/jornada/g) || []).length;
            expect(count).to.equal(1);
        });

        it('debe no contener valores indefinidos', () => {
            expect(jornadaDao.BASE_URL).to.not.include('undefined');
            expect(jornadaDao.BASE_URL).to.not.include('null');
            expect(jornadaDao.BASE_URL).to.not.include('NaN');
        });
    });

    describe('Estructura de herencia', () => {
        it('debe ser una instancia de JornadaDao', () => {
            expect(jornadaDao).to.be.instanceOf(JornadaDao);
        });

        it('debe tener la URL base como una propiedad pública', () => {
            expect(jornadaDao.BASE_URL).to.not.be.undefined;
            expect(jornadaDao.BASE_URL).to.be.a('string');
            expect(jornadaDao.BASE_URL.length).to.be.greaterThan(0);
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método obtenerJornadas accesible', () => {
            expect(typeof jornadaDao.obtenerJornadas).to.equal('function');
        });

        it('debe tener el método obtenerJornadaPorId accesible', () => {
            expect(typeof jornadaDao.obtenerJornadaPorId).to.equal('function');
        });

        it('debe tener los dos métodos principales implementados', () => {
            expect(jornadaDao.obtenerJornadas).to.exist;
            expect(jornadaDao.obtenerJornadaPorId).to.exist;
            expect(typeof jornadaDao.obtenerJornadas).to.equal('function');
            expect(typeof jornadaDao.obtenerJornadaPorId).to.equal('function');
        });
    });
});
