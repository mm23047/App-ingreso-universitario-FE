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
                { id: 1, nombre: 'Mañana', horario: '08:00' },
                { id: 2, nombre: 'Tarde', horario: '14:00' }
            ];

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnos')
                .resolves(mockTurnos);

            const resultado = await controller.cargarTodosLosTurnos();

            expect(resultado).to.deep.equal(mockTurnos);
            expect(daoStub.calledOnce).to.be.true;
        });

        it('debe procesar los turnos después de cargarlos', async () => {
            const mockTurnos = [
                { id: 1, nombre: 'Mañana', horario: '08:00' }
            ];

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnos')
                .resolves(mockTurnos);

            await controller.cargarTodosLosTurnos();

            expect(controller.turnosEnMemoria[0]).to.have.property('etiqueta');
            expect(controller.turnosEnMemoria[0]).to.have.property('esValida');
        });

        it('debe lanzar error si el DAO falla', async () => {
            const error = new Error('Conexión perdida');
            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnos')
                .rejects(error);

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
            const mockTurno = { id: 1, nombre: 'Mañana', horario: '08:00' };

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnoPorId')
                .resolves(mockTurno);

            const resultado = await controller.obtenerTurnoPorId(1);

            expect(daoStub.calledWith(1)).to.be.true;
            expect(resultado).to.have.property('id', 1);
        });

        it('debe procesar el turno individual', async () => {
            const mockTurno = { id: 1, nombre: 'Mañana', horario: '08:00' };

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnoPorId')
                .resolves(mockTurno);

            const resultado = await controller.obtenerTurnoPorId(1);

            expect(resultado).to.have.property('etiqueta');
            expect(resultado).to.have.property('esValida');
            expect(resultado).to.have.property('formateada');
        });
    });

    describe('Lógica de Negocio - Validación', () => {
        it('debe validar un turno válido', () => {
            const turno = { id: 1, nombre: 'Mañana' };
            const valido = controller.validarTurno(turno);
            expect(valido).to.be.true;
        });

        it('debe rechazar turno sin ID', () => {
            const turno = { nombre: 'Mañana' };
            const valido = controller.validarTurno(turno);
            expect(valido).to.be.false;
        });

        it('debe rechazar turno sin nombre', () => {
            const turno = { id: 1 };
            const valido = controller.validarTurno(turno);
            expect(valido).to.be.false;
        });

        it('debe rechazar turno nulo', () => {
            const valido = controller.validarTurno(null);
            expect(valido).to.be.false;
        });
    });

    describe('Lógica de Negocio - Formateo', () => {
        it('debe formatear un turno correctamente', () => {
            const turno = { id: 1, nombre: 'mañana' };
            const formateado = controller.formatearTurno(turno);

            expect(formateado).to.have.property('codigo', 1);
            expect(formateado).to.have.property('titulo', 'MAÑANA');
            expect(formateado).to.have.property('descripcion');
        });

        it('debe generar descripción correcta', () => {
            const turno = { id: 1, nombre: 'Tarde' };
            const formateado = controller.formatearTurno(turno);

            expect(formateado.descripcion).to.include('Tarde');
        });
    });

    describe('Lógica de Negocio - Procesamiento', () => {
        it('debe procesar múltiples turnos', () => {
            const turnos = [
                { id: 1, nombre: 'Mañana', horario: '08:00' },
                { id: 2, nombre: 'Tarde', horario: '14:00' }
            ];

            const procesados = controller.procesarTurnos(turnos);

            expect(procesados).to.have.lengthOf(2);
            expect(procesados[0]).to.have.property('etiqueta');
            expect(procesados[1]).to.have.property('etiqueta');
        });

        it('debe crear etiqueta combinada en procesamiento', () => {
            const turno = { id: 1, nombre: 'Mañana', horario: '08:00' };
            const procesado = controller.procesarTurno(turno);

            expect(procesado.etiqueta).to.include('Mañana');
            expect(procesado.etiqueta).to.include('08:00');
        });
    });

    describe('Persistencia - Guardar Selección', () => {
        it('debe guardar el ID de un turno en localStorage', () => {
            const resultado = controller.guardarSeleccionTurno(5);

            expect(resultado).to.be.true;
            expect(localStorage.getItem('turnoSeleccionado')).to.equal('5');
        });

        it('debe retornar true cuando se guarda exitosamente', () => {
            const resultado = controller.guardarSeleccionTurno(1);
            expect(resultado).to.be.true;
        });

        it('debe guardar solo el ID, no el objeto completo', () => {
            controller.guardarSeleccionTurno(42);
            const valor = localStorage.getItem('turnoSeleccionado');

            expect(valor).to.equal('42');
            expect(valor).to.not.include('{');
        });
    });

    describe('Persistencia - Obtener Selección', () => {
        it('debe obtener el turno guardado', () => {
            controller.guardarSeleccionTurno(7);
            const turnoId = controller.obtenerTurnoGuardado();

            expect(turnoId).to.equal(7);
        });

        it('debe retornar null si no hay turno guardado', () => {
            const turnoId = controller.obtenerTurnoGuardado();
            expect(turnoId).to.be.null;
        });

        it('debe retornar un número, no una cadena', () => {
            controller.guardarSeleccionTurno(3);
            const turnoId = controller.obtenerTurnoGuardado();

            expect(turnoId).to.be.a('number');
        });
    });

    describe('Persistencia - Limpiar', () => {
        it('debe limpiar la selección guardada', () => {
            controller.guardarSeleccionTurno(5);
            controller.limpiarSeleccion();

            const turnoId = controller.obtenerTurnoGuardado();
            expect(turnoId).to.be.null;
        });

        it('debe eliminar el item de localStorage', () => {
            controller.guardarSeleccionTurno(5);
            expect(localStorage.getItem('turnoSeleccionado')).to.not.be.null;

            controller.limpiarSeleccion();
            expect(localStorage.getItem('turnoSeleccionado')).to.be.null;
        });
    });

    describe('Acceso a Datos en Memoria', () => {
        it('debe retornar turnos en memoria', async () => {
            const mockTurnos = [
                { id: 1, nombre: 'Mañana', horario: '08:00' }
            ];

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnos')
                .resolves(mockTurnos);

            await controller.cargarTodosLosTurnos();
            const turnos = controller.getTurnosEnMemoria();

            expect(turnos).to.be.an('array');
            expect(turnos.length).to.be.greaterThan(0);
        });

        it('debe buscar un turno en memoria por ID', async () => {
            const mockTurnos = [
                { id: 1, nombre: 'Mañana', horario: '08:00' },
                { id: 2, nombre: 'Tarde', horario: '14:00' }
            ];

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnos')
                .resolves(mockTurnos);

            await controller.cargarTodosLosTurnos();
            const turno = controller.buscarTurnoEnMemoria(2);

            expect(turno).to.not.be.undefined;
            expect(turno).to.have.property('nombre', 'Tarde');
        });

        it('debe retornar undefined si no encuentra turno', async () => {
            const mockTurnos = [
                { id: 1, nombre: 'Mañana', horario: '08:00' }
            ];

            daoStub = sinon.stub(controller.turnosDao, 'obtenerTurnos')
                .resolves(mockTurnos);

            await controller.cargarTodosLosTurnos();
            const turno = controller.buscarTurnoEnMemoria(999);

            expect(turno).to.be.undefined;
        });
    });
});
