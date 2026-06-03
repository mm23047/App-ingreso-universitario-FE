import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import TurnosController from '../../js/control/turnos_controller.js';
import TurnosDao from '../../js/control/turnos_dao.js';

describe('TurnosController - Pruebas Unitarias', () => {
    let controller;
    let daoStub;

    beforeEach(() => {
        controller = new TurnosController();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
        localStorage.clear();
    });

    describe('Constructor', () => {
        it('debe crear una instancia del controlador', () => {
            expect(controller).to.be.instanceOf(TurnosController);
        });

        it('debe inicializar un TurnosDao', () => {
            expect(controller.turnosDao).to.be.instanceOf(TurnosDao);
        });

        it('debe inicializar turnosEnMemoria como array vacío', () => {
            expect(controller.turnosEnMemoria).to.be.an('array');
            expect(controller.turnosEnMemoria).to.have.lengthOf(0);
        });
    });

    describe('Carga de Datos', () => {
        it('debe cargar todos los turnos del DAO', async () => {
            const mockTurnos = [
                { idTurnoExamen: 'uuid-1', nombreTurno: 'Mañana', horaInicio: '08:00' },
                { idTurnoExamen: 'uuid-2', nombreTurno: 'Tarde',  horaInicio: '14:00' }
            ];

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnos').resolves(mockTurnos);

            const resultado = await controller.cargarTodosLosTurnos();

            expect(resultado).to.deep.equal(mockTurnos);
            expect(daoStub.calledOnce).to.be.true;
        });

        it('debe lanzar error si el DAO falla', async () => {
            const error = new Error('Conexión perdida');
            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnos').rejects(error);

            try {
                await controller.cargarTodosLosTurnos();
                expect.fail('Debería haber lanzado un error');
            } catch (e) {
                expect(e.message).to.equal('Conexión perdida');
            }
        });
    });

    describe('Obtener Turno por ID', () => {
        it('debe obtener un turno específico del DAO', async () => {
            const mockTurno = { idTurnoExamen: 'uuid-1', nombreTurno: 'Mañana' };

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnoPorId').resolves(mockTurno);

            const resultado = await controller.obtenerTurnoPorId('uuid-1');

            expect(daoStub.calledWith('uuid-1')).to.be.true;
            expect(resultado).to.have.property('idTurnoExamen', 'uuid-1');
        });
    });

    describe('Buscar en memoria', () => {
        it('debe buscar un turno por idTurnoExamen', async () => {
            const mockTurnos = [
                { idTurnoExamen: 'uuid-1', nombreTurno: 'Mañana', horaInicio: '08:00' },
                { idTurnoExamen: 'uuid-2', nombreTurno: 'Tarde',  horaInicio: '14:00' }
            ];

            sinon.stub(controller.turnosDao, 'obtenerTurnos').resolves(mockTurnos);
            await controller.cargarTodosLosTurnos();

            const turno = controller.buscarTurnoEnMemoria('uuid-2');
            expect(turno).to.not.be.undefined;
            expect(turno).to.have.property('nombreTurno', 'Tarde');
        });

        it('debe retornar undefined si no encuentra turno', async () => {
            const mockTurnos = [
                { idTurnoExamen: 'uuid-1', nombreTurno: 'Mañana' }
            ];
            sinon.stub(controller.turnosDao, 'obtenerTurnos').resolves(mockTurnos);
            await controller.cargarTodosLosTurnos();

            const turno = controller.buscarTurnoEnMemoria('uuid-inexistente');
            expect(turno).to.be.undefined;
        });
    });

    describe('Persistencia - via LocalStorageDao', () => {
        it('debe guardar el ID del turno usando turnoActual', () => {
            const resultado = controller.guardarSeleccionTurno('uuid-turno-1');
            expect(resultado).to.be.true;
            expect(localStorage.getItem('turnoActual')).to.equal('uuid-turno-1');
        });

        it('debe obtener el turno guardado', () => {
            controller.guardarSeleccionTurno('uuid-turno-1');
            const turnoId = controller.obtenerTurnoGuardado();
            expect(turnoId).to.equal('uuid-turno-1');
        });

        it('debe retornar null si no hay turno guardado', () => {
            const turnoId = controller.obtenerTurnoGuardado();
            expect(turnoId).to.be.null;
        });

        it('debe limpiar la selección', () => {
            controller.guardarSeleccionTurno('uuid-turno-1');
            controller.limpiarSeleccion();
            expect(localStorage.getItem('turnoActual')).to.be.null;
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener cargarTodosLosTurnos', () => {
            expect(typeof controller.cargarTodosLosTurnos).to.equal('function');
        });
        it('debe tener seleccionarTurno', () => {
            expect(typeof controller.seleccionarTurno).to.equal('function');
        });
        it('debe tener buscarTurnoEnMemoria', () => {
            expect(typeof controller.buscarTurnoEnMemoria).to.equal('function');
        });
    });
});
