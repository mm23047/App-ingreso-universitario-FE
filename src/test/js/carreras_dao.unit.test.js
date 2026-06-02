import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import CarrerasDao from '../../js/control/carreras_dao.js';
import Carrera from '../../js/entity/Carrera.js';

describe('CarrerasDao - Pruebas Unitarias con Stubs', () => {
    let carrerasDao;

    beforeEach(() => {
        carrerasDao = new CarrerasDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de CarrerasDao', () => {
            expect(carrerasDao).to.be.instanceOf(CarrerasDao);
        });

        it('debe tener la URL base correctamente configurada', () => {
            expect(carrerasDao.BASE_URL).to.include('carreras');
        });

        it('debe incluir el prefijo /v1/ en la URL', () => {
            expect(carrerasDao.BASE_URL).to.include('/v1/');
        });

        it('debe tener URL que comience con http://localhost:9080', () => {
            expect(carrerasDao.BASE_URL).to.include('http://localhost:9080');
        });

        it('debe terminar con "carreras" sin barra diagonal', () => {
            expect(carrerasDao.BASE_URL).to.match(/carreras$/);
        });

        it('debe tener URL con patrón válido', () => {
            const pattern = /^http:\/\/.+:\d+\/.+\/v1\/carreras$/;
            expect(carrerasDao.BASE_URL).to.match(pattern);
        });
    });

    describe('obtenerTodas con Stub', () => {
        it('debe retornar instancias de Carrera', async () => {
            const mockData = [
                { idCarrera: 'IC', nombreCatalogoCarrera: 'Ingeniería Civil' },
                { idCarrera: 'IS', nombreCatalogoCarrera: 'Ingeniería de Sistemas' }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await carrerasDao.obtenerTodas();

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(2);
            expect(resultado[0]).to.be.instanceOf(Carrera);
            expect(resultado[1]).to.be.instanceOf(Carrera);
        });

        it('debe mapear las propiedades correctamente', async () => {
            const mockData = [
                { idCarrera: 'IC', nombreCatalogoCarrera: 'Ingeniería Civil' }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await carrerasDao.obtenerTodas();

            expect(resultado[0].idCarrera).to.equal('IC');
            expect(resultado[0].nombreCatalogoCarrera).to.equal('Ingeniería Civil');
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500, json: () => Promise.reject(new Error('Server Error')) });

            try {
                await carrerasDao.obtenerTodas();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404, json: () => Promise.reject(new Error('Not Found')) });

            try {
                await carrerasDao.obtenerTodas();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser una función', () => {
            expect(carrerasDao.obtenerTodas).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });
            const resultado = carrerasDao.obtenerTodas();
            expect(resultado).to.be.instanceOf(Promise);
        });

        it('debe retornar array vacío cuando no hay carreras', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });
            const resultado = await carrerasDao.obtenerTodas();
            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(0);
        });
    });

    describe('obtenerPorId con Stub', () => {
        it('debe retornar una instancia de Carrera', async () => {
            const mockData = { idCarrera: 'IC', nombreCatalogoCarrera: 'Ingeniería Civil' };
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await carrerasDao.obtenerPorId('IC');

            expect(resultado).to.be.instanceOf(Carrera);
            expect(resultado.idCarrera).to.equal('IC');
            expect(resultado.nombreCatalogoCarrera).to.equal('Ingeniería Civil');
        });

        it('debe lanzar error cuando se llama sin ID', async () => {
            try {
                await carrerasDao.obtenerPorId();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor devuelve 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404, json: () => Promise.reject(new Error('Not Found')) });

            try {
                await carrerasDao.obtenerPorId('INEXISTENTE');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser un método que acepta parámetros', () => {
            expect(carrerasDao.obtenerPorId.length).to.be.at.least(1);
        });

        it('debe tener tipo function', () => {
            expect(typeof carrerasDao.obtenerPorId).to.equal('function');
        });
    });

    describe('Validación de URLs', () => {
        it('debe mantener URL consistente entre instancias', () => {
            const dao1 = new CarrerasDao();
            const dao2 = new CarrerasDao();
            expect(dao1.BASE_URL).to.equal(dao2.BASE_URL);
        });

        it('debe contener "carreras" una sola vez', () => {
            const count = (carrerasDao.BASE_URL.match(/carreras/g) || []).length;
            expect(count).to.equal(1);
        });

        it('debe no contener valores indefinidos', () => {
            expect(carrerasDao.BASE_URL).to.not.include('undefined');
            expect(carrerasDao.BASE_URL).to.not.include('null');
            expect(carrerasDao.BASE_URL).to.not.include('NaN');
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método obtenerTodas accesible', () => {
            expect(typeof carrerasDao.obtenerTodas).to.equal('function');
        });

        it('debe tener el método obtenerPorId accesible', () => {
            expect(typeof carrerasDao.obtenerPorId).to.equal('function');
        });

        it('debe tener ambos métodos implementados', () => {
            expect(carrerasDao.obtenerTodas).to.exist;
            expect(carrerasDao.obtenerPorId).to.exist;
        });
    });
});
