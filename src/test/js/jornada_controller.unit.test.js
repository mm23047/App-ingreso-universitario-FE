import { expect } from '../lib/chai/index.js';
import sinon from '../lib/sinon/sinon.js';
import JornadaController from '../../js/control/jornada_controller.js';
import JornadaDao from '../../js/control/jornada_dao.js';

describe('JornadaController - Pruebas Unitarias', () => {
    let controller;
    let daoStub;

    beforeEach(() => {
        controller = new JornadaController();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
        localStorage.clear();
    });

    describe('Constructor', () => {
        it('debe crear una instancia del controlador', () => {
            expect(controller).to.be.instanceOf(JornadaController);
        });

        it('debe inicializar un JornadaDao', () => {
            expect(controller.jornadaDao).to.be.instanceOf(JornadaDao);
        });

        it('debe inicializar jornadasEnMemoria como array vacío', () => {
            expect(controller.jornadasEnMemoria).to.be.an('array');
            expect(controller.jornadasEnMemoria).to.have.lengthOf(0);
        });
    });

    describe('Carga de Datos', () => {
        it('debe cargar todas las jornadas del DAO', async () => {
            const mockJornadas = [
                { id: 1, nombre: 'Mañana', horario: '08:00' },
                { id: 2, nombre: 'Tarde', horario: '14:00' }
            ];

            daoStub = sinon.stub(controller.jornadaDao, 'obtenerJornadas')
                .resolves(mockJornadas);

            const resultado = await controller.cargarTodasLasJornadas();

            expect(resultado).to.deep.equal(mockJornadas);
            expect(daoStub.calledOnce).to.be.true;
        });

        it('debe procesar las jornadas después de cargarlas', async () => {
            const mockJornadas = [
                { id: 1, nombre: 'Mañana', horario: '08:00' }
            ];

            daoStub = sinon.stub(controller.jornadaDao, 'obtenerJornadas')
                .resolves(mockJornadas);

            await controller.cargarTodasLasJornadas();

            // Verificar que al menos tiene propiedades adicionales después del procesamiento
            expect(controller.jornadasEnMemoria[0]).to.have.property('etiqueta');
            expect(controller.jornadasEnMemoria[0]).to.have.property('esValida');
        });

        it('debe lanzar error si el DAO falla', async () => {
            const error = new Error('Conexión perdida');
            daoStub = sinon.stub(controller.jornadaDao, 'obtenerJornadas')
                .rejects(error);

            try {
                await controller.cargarTodasLasJornadas();
                expect.fail('Debería haber lanzado un error');
            } catch (e) {
                expect(e.message).to.equal('Conexión perdida');
            }
        });
    });

    describe('Obtener Jornada por ID', () => {
        it('debe obtener una jornada específica del DAO', async () => {
            const mockJornada = { id: 1, nombre: 'Mañana', horario: '08:00' };

            daoStub = sinon.stub(controller.jornadaDao, 'obtenerJornadaPorId')
                .resolves(mockJornada);

            const resultado = await controller.obtenerJornadaPorId(1);

            expect(daoStub.calledWith(1)).to.be.true;
            expect(resultado).to.have.property('id', 1);
        });

        it('debe procesar la jornada individual', async () => {
            const mockJornada = { id: 1, nombre: 'Mañana', horario: '08:00' };

            daoStub = sinon.stub(controller.jornadaDao, 'obtenerJornadaPorId')
                .resolves(mockJornada);

            const resultado = await controller.obtenerJornadaPorId(1);

            expect(resultado).to.have.property('etiqueta');
            expect(resultado).to.have.property('esValida');
            expect(resultado).to.have.property('formateada');
        });
    });

    describe('Lógica de Negocio - Validación', () => {
        it('debe validar una jornada válida', () => {
            const jornada = { id: 1, nombre: 'Mañana' };
            const valida = controller.validarJornada(jornada);
            expect(valida).to.be.true;
        });

        it('debe rechazar jornada sin ID', () => {
            const jornada = { nombre: 'Mañana' };
            const valida = controller.validarJornada(jornada);
            expect(valida).to.be.false;
        });

        it('debe rechazar jornada sin nombre', () => {
            const jornada = { id: 1 };
            const valida = controller.validarJornada(jornada);
            expect(valida).to.be.false;
        });

        it('debe rechazar jornada nula', () => {
            const valida = controller.validarJornada(null);
            expect(valida).to.be.false;
        });
    });

    describe('Lógica de Negocio - Formateo', () => {
        it('debe formatear una jornada correctamente', () => {
            const jornada = { id: 1, nombre: 'mañana' };
            const formateada = controller.formatearJornada(jornada);

            expect(formateada).to.have.property('codigo', 1);
            expect(formateada).to.have.property('titulo', 'MAÑANA');
            expect(formateada).to.have.property('descripcion');
        });

        it('debe generar descripción correcta', () => {
            const jornada = { id: 1, nombre: 'Tarde' };
            const formateada = controller.formatearJornada(jornada);

            expect(formateada.descripcion).to.include('Tarde');
        });
    });

    describe('Lógica de Negocio - Procesamiento', () => {
        it('debe procesar múltiples jornadas', () => {
            const jornadas = [
                { id: 1, nombre: 'Mañana', horario: '08:00' },
                { id: 2, nombre: 'Tarde', horario: '14:00' }
            ];

            const procesadas = controller.procesarJornadas(jornadas);

            expect(procesadas).to.have.lengthOf(2);
            expect(procesadas[0]).to.have.property('etiqueta');
            expect(procesadas[1]).to.have.property('etiqueta');
        });

        it('debe crear etiqueta combinada en procesamiento', () => {
            const jornada = { id: 1, nombre: 'Mañana', horario: '08:00' };
            const procesada = controller.procesarJornada(jornada);

            expect(procesada.etiqueta).to.include('Mañana');
            expect(procesada.etiqueta).to.include('08:00');
        });
    });

    describe('Persistencia - Guardar Selección', () => {
        it('debe guardar el ID de una jornada en localStorage', () => {
            const resultado = controller.guardarSeleccionJornada(5);

            expect(resultado).to.be.true;
            expect(localStorage.getItem('jornadaSeleccionada')).to.equal('5');
        });

        it('debe retornar true cuando se guarda exitosamente', () => {
            const resultado = controller.guardarSeleccionJornada(1);
            expect(resultado).to.be.true;
        });

        it('debe guardar solo el ID, no el objeto completo', () => {
            controller.guardarSeleccionJornada(42);
            const valor = localStorage.getItem('jornadaSeleccionada');

            expect(valor).to.equal('42');
            expect(valor).to.not.include('{');
        });
    });

    describe('Persistencia - Obtener Selección', () => {
        it('debe obtener la jornada guardada', () => {
            controller.guardarSeleccionJornada(7);
            const jornadaId = controller.obtenerJornadaGuardada();

            expect(jornadaId).to.equal(7);
        });

        it('debe retornar null si no hay jornada guardada', () => {
            const jornadaId = controller.obtenerJornadaGuardada();
            expect(jornadaId).to.be.null;
        });

        it('debe retornar un número, no una cadena', () => {
            controller.guardarSeleccionJornada(3);
            const jornadaId = controller.obtenerJornadaGuardada();

            expect(jornadaId).to.be.a('number');
        });
    });

    describe('Persistencia - Limpiar', () => {
        it('debe limpiar la selección guardada', () => {
            controller.guardarSeleccionJornada(5);
            controller.limpiarSeleccion();

            const jornadaId = controller.obtenerJornadaGuardada();
            expect(jornadaId).to.be.null;
        });

        it('debe eliminar el item de localStorage', () => {
            controller.guardarSeleccionJornada(5);
            expect(localStorage.getItem('jornadaSeleccionada')).to.not.be.null;

            controller.limpiarSeleccion();
            expect(localStorage.getItem('jornadaSeleccionada')).to.be.null;
        });
    });

    describe('Acceso a Datos en Memoria', () => {
        it('debe retornar jornadas en memoria', async () => {
            const mockJornadas = [
                { id: 1, nombre: 'Mañana', horario: '08:00' }
            ];

            daoStub = sinon.stub(controller.jornadaDao, 'obtenerJornadas')
                .resolves(mockJornadas);

            await controller.cargarTodasLasJornadas();
            const jornadas = controller.getJornadasEnMemoria();

            expect(jornadas).to.be.an('array');
            expect(jornadas.length).to.be.greaterThan(0);
        });

        it('debe buscar una jornada en memoria por ID', async () => {
            const mockJornadas = [
                { id: 1, nombre: 'Mañana', horario: '08:00' },
                { id: 2, nombre: 'Tarde', horario: '14:00' }
            ];

            daoStub = sinon.stub(controller.jornadaDao, 'obtenerJornadas')
                .resolves(mockJornadas);

            await controller.cargarTodasLasJornadas();
            const jornada = controller.buscarJornadaEnMemoria(2);

            expect(jornada).to.not.be.undefined;
            expect(jornada).to.have.property('nombre', 'Tarde');
        });

        it('debe retornar undefined si no encuentra jornada', async () => {
            const mockJornadas = [
                { id: 1, nombre: 'Mañana', horario: '08:00' }
            ];

            daoStub = sinon.stub(controller.jornadaDao, 'obtenerJornadas')
                .resolves(mockJornadas);

            await controller.cargarTodasLasJornadas();
            const jornada = controller.buscarJornadaEnMemoria(999);

            expect(jornada).to.be.undefined;
        });
    });
});
