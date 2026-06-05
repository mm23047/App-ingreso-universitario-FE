import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import TurnosDao from '../../js/control/turnos_dao.js';
import Turno from '../../js/entity/Turno.js';

describe('TurnosDao - Pruebas Unitarias con Stubs', () => {
    let turnosDao;

    beforeEach(() => {
        turnosDao = new TurnosDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de TurnosDao', () => {
            expect(turnosDao).to.be.instanceOf(TurnosDao);
        });

        it('debe tener la URL base correctamente configurada', () => {
            expect(turnosDao.BASE_URL).to.include('turnos');
        });

        it('debe incluir el prefijo /v1/ en la URL', () => {
            expect(turnosDao.BASE_URL).to.include('/v1/');
        });

        it('debe tener URL que comience con http://localhost:9080', () => {
            expect(turnosDao.BASE_URL).to.include('http://localhost:9080');
        });

        it('debe tener URL que termine con "turnos"', () => {
            expect(turnosDao.BASE_URL).to.have.string('turnos');
        });

        it('debe terminar con "turnos" sin barra diagonal', () => {
            expect(turnosDao.BASE_URL).to.match(/turnos$/);
        });
    });

    describe('obtenerTurnos con Stub', () => {
        it('debe retornar instancias de Turno', async () => {
            const mockData = [
                { id: 1, nombre: 'Mañana' },
                { id: 2, nombre: 'Tarde' }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await turnosDao.obtenerTurnos();

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(2);
            expect(resultado[0]).to.be.instanceOf(Turno);
            expect(resultado[1]).to.be.instanceOf(Turno);
        });

        it('debe mapear las propiedades correctamente', async () => {
            const mockData = [
                { idTurnoExamen: 'uuid-1', nombreTurno: 'Mañana' },
                { idTurnoExamen: 'uuid-2', nombreTurno: 'Tarde' }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await turnosDao.obtenerTurnos();

            expect(resultado[0].idTurnoExamen).to.equal('uuid-1');
            expect(resultado[0].nombreTurno).to.equal('Mañana');
            expect(resultado[1].idTurnoExamen).to.equal('uuid-2');
        });

        it('debe lanzar error cuando el servidor responde con error', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500, json: () => Promise.reject(new Error('Server Error')) });

            try {
                await turnosDao.obtenerTurnos();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser una función', () => {
            expect(turnosDao.obtenerTurnos).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });
            const resultado = turnosDao.obtenerTurnos();
            expect(resultado).to.be.instanceOf(Promise);
        });
    });

    describe('obtenerTurnoPorId con Stub', () => {
        it('debe retornar una instancia de Turno', async () => {
            const mockData = { idTurnoExamen: 'uuid-1', nombreTurno: 'Mañana', horaInicio: '08:00' };
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await turnosDao.obtenerTurnoPorId('uuid-1');

            expect(resultado).to.be.instanceOf(Turno);
            expect(resultado.idTurnoExamen).to.equal('uuid-1');
            expect(resultado.nombreTurno).to.equal('Mañana');
        });

        it('debe mapear todas las propiedades', async () => {
            const mockData = { idTurnoExamen: 'uuid-1', nombreTurno: 'Mañana', horaInicio: '08:00' };
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await turnosDao.obtenerTurnoPorId('uuid-1');

            expect(resultado.horaInicio).to.equal('08:00');
        });

        it('debe lanzar error cuando se llama sin ID', async () => {
            try {
                await turnosDao.obtenerTurnoPorId();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe ser un método que acepta parámetros', () => {
            expect(turnosDao.obtenerTurnoPorId.length).to.be.at.least(1);
        });

        it('debe lanzar error cuando el servidor devuelve 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404, json: () => Promise.reject(new Error('Not Found')) });

            try {
                await turnosDao.obtenerTurnoPorId(999);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe ser un método propio de la instancia o heredado', () => {
            expect(turnosDao).to.have.property('obtenerTurnoPorId');
        });

        it('debe tener tipo function', () => {
            expect(typeof turnosDao.obtenerTurnoPorId).to.equal('function');
        });
    });

    describe('Validación de URLs', () => {
        it('debe mantener URL consistente entre instancias', () => {
            const dao1 = new TurnosDao();
            const dao2 = new TurnosDao();
            expect(dao1.BASE_URL).to.equal(dao2.BASE_URL);
        });

        it('debe tener URL con patrón válido', () => {
            const pattern = /^http:\/\/.+:\d+\/.+\/v1\/turnos$/;
            expect(turnosDao.BASE_URL).to.match(pattern);
        });

        it('debe contener "turnos" una sola vez', () => {
            const count = (turnosDao.BASE_URL.match(/turnos/g) || []).length;
            expect(count).to.equal(1);
        });

        it('debe no contener valores indefinidos', () => {
            expect(turnosDao.BASE_URL).to.not.include('undefined');
            expect(turnosDao.BASE_URL).to.not.include('null');
            expect(turnosDao.BASE_URL).to.not.include('NaN');
        });
    });

    describe('Estructura de herencia', () => {
        it('debe ser una instancia de TurnosDao', () => {
            expect(turnosDao).to.be.instanceOf(TurnosDao);
        });

        it('debe tener la URL base como una propiedad pública', () => {
            expect(turnosDao.BASE_URL).to.not.be.undefined;
            expect(turnosDao.BASE_URL).to.be.a('string');
            expect(turnosDao.BASE_URL.length).to.be.greaterThan(0);
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método obtenerTurnos accesible', () => {
            expect(typeof turnosDao.obtenerTurnos).to.equal('function');
        });

        it('debe tener el método obtenerTurnoPorId accesible', () => {
            expect(typeof turnosDao.obtenerTurnoPorId).to.equal('function');
        });

        it('debe tener los dos métodos principales implementados', () => {
            expect(turnosDao.obtenerTurnos).to.exist;
            expect(turnosDao.obtenerTurnoPorId).to.exist;
            expect(typeof turnosDao.obtenerTurnos).to.equal('function');
            expect(typeof turnosDao.obtenerTurnoPorId).to.equal('function');
        });
    });
});
