import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import TurnosController from '../../js/control/turnos_controller.js';
import TurnosDao from '../../js/control/turnos_dao.js';
import { store, resetStore } from '../../js/infra/app_state.js';

describe('TurnosController - Pruebas Unitarias', () => {
    let controller;
    let daoStub;

    beforeEach(() => {
        controller = new TurnosController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        localStorage.clear();
        resetStore();
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

            let callCount = 0;
            controller.turnosDao.obtenerTurnos = () => { callCount++; return Promise.resolve(mockTurnos); };

            const resultado = await controller.cargarTodosLosTurnos();

            expect(resultado).to.deep.equal(mockTurnos);
            expect(callCount).to.equal(1);
        });

        it('debe actualizar store.turnos con el array devuelto por el DAO', async () => {
            const mockTurnos = [
                { idTurnoExamen: 'uuid-1', nombreTurno: 'Mañana', horaInicio: '08:00' },
                { idTurnoExamen: 'uuid-2', nombreTurno: 'Tarde',  horaInicio: '14:00' }
            ];
            sinon.stub(controller.turnosDao, 'obtenerTurnos').resolves(mockTurnos);

            await controller.cargarTodosLosTurnos();

            expect(store.turnos).to.deep.equal(mockTurnos);
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(controller.turnosDao, 'obtenerTurnos')
                .rejects(new Error('Conexión perdida'));

            try { await controller.cargarTodosLosTurnos(); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
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

            let capturedId;
            controller.turnosDao.obtenerTurnoPorId = (id) => { capturedId = id; return Promise.resolve(mockTurno); };

            const resultado = await controller.obtenerTurnoPorId('uuid-1');

            expect(capturedId).to.equal('uuid-1');
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

        it('debe limpiar la selección del localStorage', () => {
            controller.guardarSeleccionTurno('uuid-turno-1');
            controller.limpiarSeleccion();
            expect(localStorage.getItem('turnoActual')).to.be.null;
        });

        it('debe limpiar store.turnoSeleccionado además del localStorage', () => {
            store.turnoSeleccionado = { idTurnoExamen: 'uuid-turno-1', nombreTurno: 'Mañana' };
            controller.guardarSeleccionTurno('uuid-turno-1');

            controller.limpiarSeleccion();

            expect(store.turnoSeleccionado).to.be.null;
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

    // ── seleccionarTurno — comportamiento real ───────────────────────────────
    describe('seleccionarTurno — comportamiento real', () => {
        const mockTurnos = [
            { idTurnoExamen: 'uuid-t1', nombreTurno: 'Mañana', horaInicio: '08:00' },
            { idTurnoExamen: 'uuid-t2', nombreTurno: 'Tarde',  horaInicio: '14:00' }
        ];

        beforeEach(() => {
            // Carga directa en memoria — evita stubbar el DAO en cada test
            controller.turnosEnMemoria = [...mockTurnos];
        });

        it('debe guardar el OBJETO turno completo en store.turnoSeleccionado, no solo el ID', () => {
            controller.seleccionarTurno('uuid-t1');

            expect(store.turnoSeleccionado).to.equal(mockTurnos[0]);
            expect(store.turnoSeleccionado.nombreTurno).to.equal('Mañana');
        });

        it('debe retornar el objeto turno cuando lo encuentra', () => {
            const resultado = controller.seleccionarTurno('uuid-t2');

            expect(resultado).to.equal(mockTurnos[1]);
        });

        it('debe persistir el ID del turno en localStorage al seleccionarlo', () => {
            controller.seleccionarTurno('uuid-t1');

            expect(localStorage.getItem('turnoActual')).to.equal('uuid-t1');
        });

        it('debe retornar null cuando el turno no existe en memoria', () => {
            const resultado = controller.seleccionarTurno('uuid-no-existe');

            expect(resultado).to.be.null;
        });

        it('NO debe modificar store.turnoSeleccionado cuando el turno no existe', () => {
            store.turnoSeleccionado = mockTurnos[0];

            controller.seleccionarTurno('uuid-no-existe');

            expect(store.turnoSeleccionado).to.equal(mockTurnos[0]);
        });

        it('debe retornar null cuando turnosEnMemoria está vacío', () => {
            controller.turnosEnMemoria = [];

            const resultado = controller.seleccionarTurno('uuid-t1');

            expect(resultado).to.be.null;
        });
    });
});
