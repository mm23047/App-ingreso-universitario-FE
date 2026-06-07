import { expect }       from '../../lib/chai/index.js';
import ProcesosController from '../../../../js/control/procesos_controller.js';

describe('ProcesosController — Integración con backend', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new ProcesosController();
    });

    // ── cargar() ─────────────────────────────────────────────────────────────

    describe('cargar() — carga paralela de pruebas, turnos y disponibilidad', () => {

        it('debe retornar { procesos, avisos } con la forma correcta cuando el backend responde', async function () {
            this.timeout(10000);

            // Sin try/catch: el controller lanza su propio Error si pruebas falla → test falla correctamente
            const resultado = await ctrl.cargar();

            expect(resultado).to.be.an('object');
            expect(resultado).to.have.keys(['procesos', 'avisos']);

            expect(resultado.procesos).to.be.an('array');
            expect(resultado.avisos).to.be.an('array');

            if (resultado.procesos.length > 0) {
                const p = resultado.procesos[0];
                expect(p).to.have.property('idPruebaAdmision').that.is.a('string').and.not.equal('');
                expect(p).to.have.property('nombrePrueba').that.is.a('string');
                expect(p).to.have.property('activa').that.is.a('boolean');
                expect(p).to.have.property('jornadas').that.is.an('array');
                expect(p).to.have.property('horarios').that.is.an('array');
                expect(p).to.have.property('sedes').that.is.an('array');
            }

            // avisos solo contiene strings de degradación (vacío si todos los endpoints respondieron)
            resultado.avisos.forEach(aviso =>
                expect(aviso).to.be.a('string').and.not.equal('')
            );
        });
    });

    // ── buscar() ─────────────────────────────────────────────────────────────

    describe('buscar() — búsqueda de procesos con filtro', () => {

        it('debe retornar un array de procesos cuando el backend responde 200', async function () {
            this.timeout(10000);

            // Precondición: el controller necesita los datos crudos de turnos/sedes para ensamblar.
            // Llamar cargar() primero carga los caches internos (_turnosBrutos, _dispsBrutos).
            await ctrl.cargar();

            const resultado = await ctrl.buscar('');

            expect(resultado).to.be.an('array');

            if (resultado.length > 0) {
                const p = resultado[0];
                expect(p).to.have.property('idPruebaAdmision').that.is.a('string');
                expect(p).to.have.property('activa').that.is.a('boolean');
            }
        });
    });
});
