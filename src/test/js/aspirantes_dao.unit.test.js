import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import AspirantesDao from '../../js/control/aspirantes_dao.js';
import Aspirante from '../../js/entity/Aspirante.js';

describe('AspirantesDao - Pruebas Unitarias con Stubs', () => {
    let aspirantesDao;

    const mockAspirante = {
        nombres: 'Juan',
        apellidos: 'Pérez',
        fechaNacimiento: '2000-05-15',
        dui: '01234567-8',
        correo: 'juan@mail.com',
        usaSillaRuedas: false
    };

    beforeEach(() => {
        aspirantesDao = new AspirantesDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de AspirantesDao', () => {
            expect(aspirantesDao).to.be.instanceOf(AspirantesDao);
        });

        it('debe tener la URL base correctamente configurada', () => {
            expect(aspirantesDao.BASE_URL).to.include('aspirantes');
        });

        it('debe incluir el prefijo /v1/ en la URL', () => {
            expect(aspirantesDao.BASE_URL).to.include('/v1/');
        });

        it('debe tener URL que comience con http://localhost:9080', () => {
            expect(aspirantesDao.BASE_URL).to.include('http://localhost:9080');
        });

        it('debe terminar con "aspirantes" sin barra diagonal', () => {
            expect(aspirantesDao.BASE_URL).to.match(/aspirantes$/);
        });

        it('debe tener URL con patrón válido', () => {
            const pattern = /^http:\/\/.+:\d+\/.+\/v1\/aspirantes$/;
            expect(aspirantesDao.BASE_URL).to.match(pattern);
        });
    });

    describe('crear con Stub', () => {
        it('debe retornar una instancia de Aspirante', async () => {
            const mockRespuesta = { ...mockAspirante, id: 'uuid-123', fechaCreacionPerfil: '2026-06-01' };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await aspirantesDao.crear(mockAspirante);

            expect(resultado).to.be.instanceOf(Aspirante);
            expect(resultado).to.have.property('id', 'uuid-123');
        });

        it('debe mapear las propiedades correctamente', async () => {
            const mockRespuesta = { ...mockAspirante, id: 'uuid-123', fechaCreacionPerfil: '2026-06-01' };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await aspirantesDao.crear(mockAspirante);

            expect(resultado.nombres).to.equal('Juan');
            expect(resultado.apellidos).to.equal('Pérez');
            expect(resultado.dui).to.equal('01234567-8');
            expect(resultado.correo).to.equal('juan@mail.com');
        });

        it('debe lanzar error cuando no se proporcionan datos', async () => {
            try {
                await aspirantesDao.crear();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 400', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 400, json: () => Promise.reject(new Error('Bad Request')) });

            try {
                await aspirantesDao.crear(mockAspirante);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 409 (DUI duplicado)', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 409, json: () => Promise.reject(new Error('Conflict')) });

            try {
                await aspirantesDao.crear(mockAspirante);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser una función', () => {
            expect(aspirantesDao.crear).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });
            const resultado = aspirantesDao.crear(mockAspirante);
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('obtenerPorId con Stub', () => {
        it('debe retornar una instancia de Aspirante', async () => {
            const mockData = { ...mockAspirante, id: 'uuid-abc' };
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await aspirantesDao.obtenerPorId('uuid-abc');

            expect(resultado).to.be.instanceOf(Aspirante);
            expect(resultado.id).to.equal('uuid-abc');
        });

        it('debe mapear todas las propiedades', async () => {
            const mockData = { ...mockAspirante, id: 'uuid-abc' };
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await aspirantesDao.obtenerPorId('uuid-abc');

            expect(resultado.nombres).to.equal('Juan');
            expect(resultado.correo).to.equal('juan@mail.com');
            expect(resultado.usaSillaRuedas).to.equal(false);
        });

        it('debe lanzar error cuando se llama sin ID', async () => {
            try {
                await aspirantesDao.obtenerPorId();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor devuelve 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404, json: () => Promise.reject(new Error('Not Found')) });

            try {
                await aspirantesDao.obtenerPorId('uuid-inexistente');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser un método que acepta parámetros', () => {
            expect(aspirantesDao.obtenerPorId.length).to.be.at.least(1);
        });

        it('debe tener tipo function', () => {
            expect(typeof aspirantesDao.obtenerPorId).to.equal('function');
        });
    });

    describe('Validación de URLs', () => {
        it('debe mantener URL consistente entre instancias', () => {
            const dao1 = new AspirantesDao();
            const dao2 = new AspirantesDao();
            expect(dao1.BASE_URL).to.equal(dao2.BASE_URL);
        });

        it('debe contener "aspirantes" una sola vez', () => {
            const count = (aspirantesDao.BASE_URL.match(/aspirantes/g) || []).length;
            expect(count).to.equal(1);
        });

        it('debe no contener valores indefinidos', () => {
            expect(aspirantesDao.BASE_URL).to.not.include('undefined');
            expect(aspirantesDao.BASE_URL).to.not.include('null');
            expect(aspirantesDao.BASE_URL).to.not.include('NaN');
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método crear accesible', () => {
            expect(typeof aspirantesDao.crear).to.equal('function');
        });

        it('debe tener el método obtenerPorId accesible', () => {
            expect(typeof aspirantesDao.obtenerPorId).to.equal('function');
        });

        it('debe tener ambos métodos implementados', () => {
            expect(aspirantesDao.crear).to.exist;
            expect(aspirantesDao.obtenerPorId).to.exist;
        });
    });
});
