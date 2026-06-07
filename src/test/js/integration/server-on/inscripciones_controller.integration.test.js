import { expect }             from '../../lib/chai/index.js';
import InscripcionesController from '../../../../js/control/inscripciones_controller.js';
import AspirantesDao           from '../../../../js/control/aspirantes_dao.js';
import InscripcionesDao        from '../../../../js/control/inscripciones_dao.js';
import CarrerasElegidaDao      from '../../../../js/control/carreras_elegida_dao.js';
import CarrerasDao             from '../../../../js/control/carreras_dao.js';
import InscripcionPrueba       from '../../../../js/entity/InscripcionPrueba.js';
import { store, resetStore }   from '../../../../js/infra/app_state.js';

function generarDatos() {
    const n = Math.floor(Math.random() * 99999999);
    const d = Math.floor(Math.random() * 9);
    return {
        nombres:         'Test InscCtrl',
        apellidos:       'Controller Int',
        dui:             `${String(n).padStart(8, '0')}-${d}`,
        fechaNacimiento: '2001-06-15',
        correo:          `inscctrl.int.${Date.now()}.${n}@tpi-test.sv`,
        usaSillaRuedas:  false
    };
}

describe('InscripcionesController — Integración con backend', () => {
    let ctrl;
    let aspirantesDao;
    let inscripcionesDao;
    let carrerasElegidaDao;
    let carrerasDao;

    // { aspiranteId, inscripcionId, carrerasIds: string[] }
    const creados = [];

    beforeEach(() => {
        ctrl               = new InscripcionesController();
        aspirantesDao      = new AspirantesDao();
        inscripcionesDao   = new InscripcionesDao();
        carrerasElegidaDao = new CarrerasElegidaDao();
        carrerasDao        = new CarrerasDao();
        resetStore();
    });

    afterEach(async function () {
        this.timeout(20000);
        while (creados.length > 0) {
            const { aspiranteId, inscripcionId, carrerasIds } = creados.pop();
            for (const idCarrera of (carrerasIds ?? [])) {
                try { await carrerasElegidaDao.eliminarCarrera(inscripcionId, idCarrera); }
                catch (e) { console.warn(`[cleanup] carrera ${idCarrera}: ${e.message}`); }
            }
            if (inscripcionId) {
                try { await inscripcionesDao.eliminar(inscripcionId); }
                catch (e) { console.warn(`[cleanup] inscripcion ${inscripcionId}: ${e.message}`); }
            }
            if (aspiranteId) {
                try { await aspirantesDao.eliminar(aspiranteId); }
                catch (e) { console.warn(`[cleanup] aspirante ${aspiranteId}: ${e.message}`); }
            }
        }
        resetStore();
    });

    // ── inscribirConCarreras() ─────────────────────────────────────────────────

    describe('inscribirConCarreras() — flujo completo de inscripción con carreras', () => {

        it('debe retornar { inscripcion, carreras } y actualizar el store cuando el backend responde 201', async function () {
            this.timeout(25000);

            // Precondición 1: carreras disponibles
            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const carreras = await carrerasDao.obtenerTodas();
            if (carreras.length === 0) { this.skip(); return; }

            // Precondición 2: crear aspirante
            const aspirante = await aspirantesDao.crear(generarDatos());
            const registro  = { aspiranteId: aspirante.id, inscripcionId: null, carrerasIds: [] };
            creados.push(registro);

            // Flujo principal — el controller internamente obtiene la prueba activa y crea la inscripción
            const carrerasConPrioridad = [{ idCarrera: carreras[0].idCarrera, prioridad: 1 }];
            const resultado = await ctrl.inscribirConCarreras(aspirante.id, carrerasConPrioridad);

            if (resultado === null) {
                // No hay prueba activa — skip legítimo (precondición de datos)
                this.skip();
                return;
            }

            // Registrar para limpieza
            registro.inscripcionId = resultado.inscripcion.idInscripcionPrueba;
            for (const elegida of (resultado.carreras ?? [])) {
                const id = elegida.catalogoCarrera?.idCarrera;
                if (id) registro.carrerasIds.push(id);
            }

            expect(resultado.inscripcion).to.be.instanceOf(InscripcionPrueba);
            expect(resultado.inscripcion.idInscripcionPrueba).to.be.a('string').and.not.equal('');
            expect(resultado.carreras).to.be.an('array').with.length.at.least(1);

            expect(store.inscripcionActiva,
                'store.inscripcionActiva debe quedar poblado tras la inscripción'
            ).to.not.be.null;
            expect(store.inscripcionActiva.idInscripcionPrueba)
                .to.equal(resultado.inscripcion.idInscripcionPrueba);

            expect(store.prueba,
                'store.prueba debe quedar poblado con la prueba activa usada'
            ).to.not.be.null;

            expect(store.carrerasElegidas,
                'store.carrerasElegidas debe contener al menos la carrera registrada'
            ).to.be.an('array').with.length.at.least(1);

            expect(store.loading).to.be.false;
        });
    });
});
