import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import ProcesosController from '../../../../js/control/procesos_controller.js';

describe('ProcesosController - Pruebas Unitarias', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new ProcesosController();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de ProcesosController', () => {
            expect(ctrl).to.be.instanceOf(ProcesosController);
        });

        it('debe inicializar _turnosBrutos como array vacío', () => {
            expect(ctrl._turnosBrutos).to.be.an('array').that.is.empty;
        });

        it('debe inicializar _dispsBrutos como array vacío', () => {
            expect(ctrl._dispsBrutos).to.be.an('array').that.is.empty;
        });

        it('debe inicializar _abortController en null', () => {
            expect(ctrl._abortController).to.be.null;
        });
    });

    // ── agruparPorAnio ───────────────────────────────────────────────────────
    describe('agruparPorAnio — agrupación y ordenamiento cronológico', () => {
        it('debe retornar un Map vacío cuando la lista está vacía', () => {
            const mapa = ctrl.agruparPorAnio([]);
            expect(mapa).to.be.instanceOf(Map);
            expect(mapa.size).to.equal(0);
        });

        it('debe retornar un Map con una sola clave cuando todos los procesos son del mismo año', () => {
            const lista = [
                { anio: 2026, idPruebaAdmision: 'uuid-1' },
                { anio: 2026, idPruebaAdmision: 'uuid-2' }
            ];
            const mapa = ctrl.agruparPorAnio(lista);
            expect(mapa.size).to.equal(1);
            expect(mapa.get(2026)).to.have.lengthOf(2);
        });

        it('debe ordenar los años de mayor a menor (2026 primero, 2024 último)', () => {
            const lista = [
                { anio: 2024 },
                { anio: 2026 },
                { anio: 2025 }
            ];
            const llaves = [...ctrl.agruparPorAnio(lista).keys()];
            expect(llaves[0]).to.equal(2026);
            expect(llaves[1]).to.equal(2025);
            expect(llaves[2]).to.equal(2024);
        });

        it('debe agrupar los procesos del mismo año bajo la misma clave del Map', () => {
            const lista = [
                { anio: 2026 },
                { anio: 2025 },
                { anio: 2026 }
            ];
            const mapa = ctrl.agruparPorAnio(lista);
            expect(mapa.get(2026)).to.have.lengthOf(2);
            expect(mapa.get(2025)).to.have.lengthOf(1);
        });

        it('debe usar "—" como clave cuando anio es undefined en un proceso', () => {
            const lista = [{ idPruebaAdmision: 'p-sin-anio' }];
            const mapa  = ctrl.agruparPorAnio(lista);
            expect(mapa.has('—')).to.be.true;
            expect(mapa.get('—')).to.have.lengthOf(1);
        });

        it('no debe modificar el orden de la lista original al ordenar internamente', () => {
            const lista = [
                { anio: 2025 },
                { anio: 2026 }
            ];
            ctrl.agruparPorAnio(lista);
            expect(lista[0].anio).to.equal(2025);
            expect(lista[1].anio).to.equal(2026);
        });
    });

    // ── _ensamblar ───────────────────────────────────────────────────────────
    describe('_ensamblar — join cliente: prueba → turnos → sedes', () => {
        it('debe retornar el mismo número de elementos que pruebas recibidas', () => {
            const pruebas = [{ idPruebaAdmision: 'p1' }, { idPruebaAdmision: 'p2' }];
            const resultado = ctrl._ensamblar(pruebas, [], []);
            expect(resultado).to.have.lengthOf(2);
        });

        it('debe retornar array vacío cuando pruebas está vacía', () => {
            const resultado = ctrl._ensamblar([], [], []);
            expect(resultado).to.be.an('array').that.is.empty;
        });

        it('debe mapear correctamente los campos base de la prueba (id, nombre, anio, activa)', () => {
            const pruebas = [{
                idPruebaAdmision: 'p1',
                nombrePrueba:     'Proceso 2026',
                anio:             2026,
                activa:           true
            }];
            const [p] = ctrl._ensamblar(pruebas, [], []);
            expect(p.idPruebaAdmision).to.equal('p1');
            expect(p.nombrePrueba).to.equal('Proceso 2026');
            expect(p.anio).to.equal(2026);
            expect(p.activa).to.be.true;
        });

        it('debe asignar "—" como nombrePrueba cuando el campo es undefined', () => {
            const [p] = ctrl._ensamblar([{ idPruebaAdmision: 'p1', activa: false }], [], []);
            expect(p.nombrePrueba).to.equal('—');
        });

        it('debe asignar null a fechaInicio y fechaFin cuando no hay turnos asociados a la prueba', () => {
            const [p] = ctrl._ensamblar([{ idPruebaAdmision: 'p1', activa: false }], [], []);
            expect(p.fechaInicio).to.be.null;
            expect(p.fechaFin).to.be.null;
        });

        it('debe asociar los turnos de la prueba y extraer jornadas y horarios formateados', () => {
            const pruebas = [{ idPruebaAdmision: 'p1', activa: true }];
            const turnos  = [
                {
                    idTurnoExamen:  't1',
                    pruebaAdmision: { idPruebaAdmision: 'p1' },
                    nombreTurno:    'Matutina',
                    fecha:          '2026-03-01',
                    horaInicio:     '07:00:00',
                    horaFin:        '10:00:00'
                }
            ];
            const [p] = ctrl._ensamblar(pruebas, turnos, []);
            expect(p.jornadas).to.include('Matutina');
            expect(p.horarios).to.include('07:00 – 10:00');
            expect(p.fechaInicio).to.equal('2026-03-01');
        });

        it('debe eliminar jornadas duplicadas cuando dos turnos tienen el mismo nombreTurno', () => {
            const pruebas = [{ idPruebaAdmision: 'p1', activa: true }];
            const turnos  = [
                { idTurnoExamen: 't1', pruebaAdmision: { idPruebaAdmision: 'p1' }, nombreTurno: 'Matutina' },
                { idTurnoExamen: 't2', pruebaAdmision: { idPruebaAdmision: 'p1' }, nombreTurno: 'Matutina' }
            ];
            const [p] = ctrl._ensamblar(pruebas, turnos, []);
            expect(p.jornadas.filter(j => j === 'Matutina')).to.have.lengthOf(1);
        });

        it('debe ignorar los turnos que pertenecen a una prueba diferente', () => {
            const pruebas = [{ idPruebaAdmision: 'p1', activa: true }];
            const turnos  = [
                { idTurnoExamen: 't1', pruebaAdmision: { idPruebaAdmision: 'p-otro' }, nombreTurno: 'Matutina' }
            ];
            const [p] = ctrl._ensamblar(pruebas, turnos, []);
            expect(p.jornadas).to.be.empty;
        });

        it('debe extraer y asociar sedes de disponibilidad a la prueba a través del turno', () => {
            const pruebas = [{ idPruebaAdmision: 'p1', activa: true }];
            const turnos  = [{ idTurnoExamen: 't1', pruebaAdmision: { idPruebaAdmision: 'p1' } }];
            const disps   = [
                { turnoExamen: { idTurnoExamen: 't1' }, aula: { codigoAulaApi: 'FMO' } },
                { turnoExamen: { idTurnoExamen: 't1' }, aula: { codigoAulaApi: 'FCC' } }
            ];
            const [p] = ctrl._ensamblar(pruebas, turnos, disps);
            expect(p.sedes).to.include('FMO');
            expect(p.sedes).to.include('FCC');
        });

        it('debe eliminar sedes duplicadas cuando la misma sede aparece más de una vez para el mismo turno', () => {
            const pruebas = [{ idPruebaAdmision: 'p1', activa: true }];
            const turnos  = [{ idTurnoExamen: 't1', pruebaAdmision: { idPruebaAdmision: 'p1' } }];
            const disps   = [
                { turnoExamen: { idTurnoExamen: 't1' }, aula: { codigoAulaApi: 'FMO' } },
                { turnoExamen: { idTurnoExamen: 't1' }, aula: { codigoAulaApi: 'FMO' } }
            ];
            const [p] = ctrl._ensamblar(pruebas, turnos, disps);
            expect(p.sedes.filter(s => s === 'FMO')).to.have.lengthOf(1);
        });
    });

    // ── cargar() ─────────────────────────────────────────────────────────────
    describe('cargar() — carga paralela con degradación controlada (Promise.allSettled)', () => {
        it('debe retornar { procesos: [], avisos: [] } cuando los 3 endpoints responden OK y no hay datos', async () => {
            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve([]) });

            const resultado = await ctrl.cargar();

            expect(resultado).to.have.keys(['procesos', 'avisos']);
            expect(resultado.procesos).to.be.an('array');
            expect(resultado.avisos).to.be.an('array').that.is.empty;
        });

        it('debe lanzar Error con mensaje de servidor apagado cuando el endpoint de pruebas falla', async () => {
            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.reject(new TypeError('Failed to fetch'));

            try {
                await ctrl.cargar();
                expect.fail('Debería haber lanzado un error');
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.include('No se pudieron cargar los procesos');
                expect(e.message).to.include('9080');
            }
        });

        it('debe incluir aviso de turnos en el resultado cuando ese endpoint falla pero pruebas responde OK', async () => {
            sinon.stub(window, 'fetch');
            let callCount = 0;
            window.fetch = () => {
                callCount++;
                if (callCount === 1) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
                if (callCount === 2) return Promise.reject(new TypeError('Failed to fetch'));
                return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            };

            const resultado = await ctrl.cargar();

            expect(resultado.avisos).to.be.an('array').with.length.at.least(1);
            expect(resultado.avisos.some(a => a.includes('turnos'))).to.be.true;
        });

    it('debe poblar _turnosBrutos con los datos del endpoint de turnos al cargar exitosamente', async () => {
            const mockTurnos = [{ idTurnoExamen: 't1' }, { idTurnoExamen: 't2' }];
            sinon.stub(window, 'fetch');
            
            window.fetch = (url) => {
                if (url.includes('turnos') && !url.includes('aulas_turnos')) {
                    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTurnos) });
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            };

            await ctrl.cargar();

            expect(ctrl._turnosBrutos).to.deep.equal(mockTurnos);
        });
        it('debe dejar _turnosBrutos vacío cuando el endpoint de turnos falla', async () => {
            sinon.stub(window, 'fetch');
            let callCount = 0;
            window.fetch = () => {
                callCount++;
                if (callCount === 1) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
                if (callCount === 2) return Promise.reject(new TypeError('Failed to fetch'));
                return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            };

            await ctrl.cargar();

            expect(ctrl._turnosBrutos).to.be.an('array').that.is.empty;
        });

    it('debe retornar procesos ensamblados con los datos recibidos del endpoint de pruebas', async () => {
            console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXP"); 
            
            const mockPruebas = [{ idPruebaAdmision: 'p1', nombrePrueba: 'Proceso 2026', anio: 2026, activa: true }];
            sinon.stub(window, 'fetch');
            
            // Evaluamos la URL directamente
            window.fetch = (url) => {
                if (url.includes('pruebas_admision')) {
                    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPruebas) });
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            };

            const resultado = await ctrl.cargar();

            expect(resultado.procesos).to.have.lengthOf(1);
            expect(resultado.procesos[0].idPruebaAdmision).to.equal('p1');
            expect(resultado.procesos[0].nombrePrueba).to.equal('Proceso 2026');
        });
    });

    // ── buscar() ─────────────────────────────────────────────────────────────
    describe('buscar() — filtrado de procesos con AbortController', () => {
        it('debe retornar array de procesos ensamblados cuando el servidor responde con resultados', async () => {
            const mockPruebas = [{ idPruebaAdmision: 'p1', nombrePrueba: 'Proceso 2026', anio: 2026, activa: true }];
            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPruebas) });

            const resultado = await ctrl.buscar('2026');

            expect(resultado).to.be.an('array');
            expect(resultado[0].idPruebaAdmision).to.equal('p1');
        });

        it('debe incluir el query codificado (encodeURIComponent) en la URL de la petición', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => {
                capturedUrl = url;
                return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            };

            await ctrl.buscar('proceso 2026');

            expect(capturedUrl).to.include(encodeURIComponent('proceso 2026'));
        });

        it('debe retornar array vacío cuando el servidor responde con lista vacía', async () => {
            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve([]) });

            const resultado = await ctrl.buscar('');

            expect(resultado).to.be.an('array').that.is.empty;
        });

        it('debe crear un nuevo AbortController en cada llamada a buscar()', async () => {
            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve([]) });

            await ctrl.buscar('q1');
            const primerCtrl = ctrl._abortController;

            await ctrl.buscar('q2');
            const segundoCtrl = ctrl._abortController;

            expect(primerCtrl).to.not.equal(segundoCtrl);
        });

        it('debe pasar el signal del AbortController al fetch para que la red pueda cancelar la petición', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => {
                capturedOpts = opts;
                return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            };

            await ctrl.buscar('test');

            expect(capturedOpts).to.have.property('signal');
            expect(capturedOpts.signal).to.be.instanceOf(AbortSignal);
        });

        it('debe abortar la petición anterior cuando se llama buscar() dos veces antes de que la primera resuelva', async () => {
            sinon.stub(window, 'fetch');
            let primerSignal = null;
            let callCount    = 0;

            window.fetch = (url, opts) => {
                callCount++;
                if (callCount === 1) {
                    primerSignal = opts?.signal;
                    // La primera petición nunca resuelve hasta ser abortada
                    return new Promise((_, reject) => {
                        opts?.signal?.addEventListener('abort', () =>
                            reject(new DOMException('The operation was aborted.', 'AbortError'))
                        );
                    });
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            };

            const p1 = ctrl.buscar('primero');
            const p2 = ctrl.buscar('segundo');

            await p2;
            p1.catch(() => {}); // silencia el AbortError esperado de p1

            expect(primerSignal, 'El signal del primer buscar debe haberse capturado').to.not.be.null;
            expect(primerSignal.aborted, 'El primer AbortController debe haber sido abortado por la segunda llamada').to.be.true;
            expect(callCount).to.equal(2);
        });

        it('debe usar los _turnosBrutos cargados previamente para ensamblar los resultados de la búsqueda', async () => {
            ctrl._turnosBrutos = [
                {
                    idTurnoExamen:  't1',
                    pruebaAdmision: { idPruebaAdmision: 'p1' },
                    nombreTurno:    'Matutina',
                    horaInicio:     '07:00:00',
                    horaFin:        '10:00:00'
                }
            ];

            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ idPruebaAdmision: 'p1', activa: true }])
            });

            const resultado = await ctrl.buscar('matutina');

            expect(resultado[0].jornadas).to.include('Matutina');
        });
    });
});
