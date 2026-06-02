import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import InscripcionesDao from '../../js/dao/inscripciones_dao.js';
import InscripcionPrueba from '../../js/entity/InscripcionPrueba.js';

describe('InscripcionesDao - Pruebas Unitarias con Stubs', () => {
    let inscripcionesDao;

    const mockDatos = {
        aspiranteId: 'uuid-aspirante-1',
        pruebaAdmisionId: 'uuid-prueba-1',
        turnoId: 'uuid-turno-1'
    };

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

        it('debe tener la URL base correctamente configurada', () => {
            expect(inscripcionesDao.BASE_URL).to.include('inscripciones_prueba');
        });

        it('debe incluir el prefijo /v1/ en la URL', () => {
            expect(inscripcionesDao.BASE_URL).to.include('/v1/');
        });

        it('debe tener URL que comience con http://localhost:9080', () => {
            expect(inscripcionesDao.BASE_URL).to.include('http://localhost:9080');
        });

        it('debe terminar con "inscripciones_prueba" sin barra diagonal', () => {
            expect(inscripcionesDao.BASE_URL).to.match(/inscripciones_prueba$/);
        });

        it('debe tener URL con patrón válido', () => {
            const pattern = /^http:\/\/.+:\d+\/.+\/v1\/inscripciones_prueba$/;
            expect(inscripcionesDao.BASE_URL).to.match(pattern);
        });
    });

    describe('inscribir con Stub', () => {
        it('debe retornar una instancia de InscripcionPrueba', async () => {
            const mockRespuesta = { ...mockDatos, id: 'uuid-inscripcion-1' };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await inscripcionesDao.inscribir(mockDatos);

            expect(resultado).to.be.instanceOf(InscripcionPrueba);
            expect(resultado).to.have.property('id', 'uuid-inscripcion-1');
        });

        it('debe mapear las propiedades correctamente', async () => {
            const mockRespuesta = { ...mockDatos, id: 'uuid-inscripcion-1' };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await inscripcionesDao.inscribir(mockDatos);

            expect(resultado.aspiranteId).to.equal('uuid-aspirante-1');
            expect(resultado.pruebaAdmisionId).to.equal('uuid-prueba-1');
            expect(resultado.turnoId).to.equal('uuid-turno-1');
        });

        it('debe lanzar error cuando no se proporcionan datos', async () => {
            try {
                await inscripcionesDao.inscribir();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 400', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 400, json: () => Promise.reject(new Error('Bad Request')) });

            try {
                await inscripcionesDao.inscribir(mockDatos);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 409 (ya inscrito)', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 409, json: () => Promise.reject(new Error('Conflict')) });

            try {
                await inscripcionesDao.inscribir(mockDatos);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500, json: () => Promise.reject(new Error('Server Error')) });

            try {
                await inscripcionesDao.inscribir(mockDatos);
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
            const resultado = inscripcionesDao.inscribir(mockDatos);
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('Validación de URLs', () => {
        it('debe mantener URL consistente entre instancias', () => {
            const dao1 = new InscripcionesDao();
            const dao2 = new InscripcionesDao();
            expect(dao1.BASE_URL).to.equal(dao2.BASE_URL);
        });

        it('debe contener "inscripciones_prueba" una sola vez', () => {
            const count = (inscripcionesDao.BASE_URL.match(/inscripciones_prueba/g) || []).length;
            expect(count).to.equal(1);
        });

        it('debe no contener valores indefinidos', () => {
            expect(inscripcionesDao.BASE_URL).to.not.include('undefined');
            expect(inscripcionesDao.BASE_URL).to.not.include('null');
            expect(inscripcionesDao.BASE_URL).to.not.include('NaN');
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método inscribir accesible', () => {
            expect(typeof inscripcionesDao.inscribir).to.equal('function');
        });

        it('debe tener el método inscribir implementado', () => {
            expect(inscripcionesDao.inscribir).to.exist;
        });
    });
});
