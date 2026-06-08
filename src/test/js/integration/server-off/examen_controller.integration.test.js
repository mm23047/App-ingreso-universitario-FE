import { expect }          from '../../lib/chai/index.js';
import ExamenController    from '../../../../js/control/examen_controller.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

// IDs ficticios — los fetch fallan por ECONNREFUSED antes de alcanzar el servidor.
const UUID_FALSO     = '00000000-0000-0000-0000-000000000001';
const DUI_FALSO      = '12345678-9';
const CORREO_FALSO   = 'test.server.off@tpi-test.sv';

describe('ExamenController — Backend apagado (errores de red)', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = new ExamenController();
        resetStore();
    });

    afterEach(() => {
        resetStore();
    });

    // ── consultarEstadoAspirante — CASO A (UUID) ──────────────────────────────

    describe('consultarEstadoAspirante() — CASO A (UUID)', () => {

        it('debe propagar TypeError de red y dejar store.loading en false cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.consultarEstadoAspirante(UUID_FALSO);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado,
                'Se esperaba TypeError de red (primer fetch: examenRealizadoDao.obtenerPorAspirante)'
            ).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus,
                'httpStatus definido indica que el servidor respondió'
            ).to.be.undefined;
            expect(store.loading,
                'store.loading debe quedar en false — el finally del controller siempre lo restaura'
            ).to.be.false;
        });
    });

    // ── consultarEstadoAspirante — CASO B (DUI) ───────────────────────────────

    describe('consultarEstadoAspirante() — CASO B (DUI)', () => {

        it('debe propagar TypeError de red y dejar store.loading en false cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.consultarEstadoAspirante(DUI_FALSO);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado,
                'Se esperaba TypeError de red (fetch a /examen_realizado/buscar?dui=)'
            ).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus).to.be.undefined;
            expect(store.loading).to.be.false;
        });
    });

    // ── consultarEstadoAspirante — CASO B (correo) ────────────────────────────

    describe('consultarEstadoAspirante() — CASO B (correo)', () => {

        it('debe propagar TypeError de red y dejar store.loading en false cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.consultarEstadoAspirante(CORREO_FALSO);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado,
                'Se esperaba TypeError de red (fetch a /examen_realizado/buscar?correo=)'
            ).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus).to.be.undefined;
            expect(store.loading).to.be.false;
        });
    });

    // ── consultarInscripciones ────────────────────────────────────────────────

    describe('consultarInscripciones(aspiranteId)', () => {

        it('debe propagar TypeError de red y dejar store.loading en false cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.consultarInscripciones(UUID_FALSO);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado,
                'Se esperaba TypeError de red (aspirantesDao.obtenerInscripciones)'
            ).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus).to.be.undefined;
            expect(store.loading).to.be.false;
        });
    });

    // ── consultarResultados ───────────────────────────────────────────────────

    describe('consultarResultados(aspiranteId)', () => {

        it('debe propagar TypeError de red y dejar store.loading en false cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await ctrl.consultarResultados(UUID_FALSO);
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado,
                'Se esperaba TypeError de red (examenRealizadoDao.obtenerPorAspirante)'
            ).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus).to.be.undefined;
            expect(store.loading).to.be.false;
        });
    });

    // ── iniciar (flujo de examen) ─────────────────────────────────────────────

    describe('iniciar()', () => {

        it('debe propagar TypeError de red y dejar store.loading en false cuando el backend no responde', async function () {
            this.timeout(5000);
            store.inscripcionActiva = { idInscripcionPrueba: UUID_FALSO };
            store.etapa             = { idEtapaAdmision: UUID_FALSO };

            let errorCapturado;
            try {
                await ctrl.iniciar();
            } catch (e) {
                errorCapturado = e;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;
            expect(errorCapturado).to.be.instanceOf(TypeError);
            expect(errorCapturado.httpStatus).to.be.undefined;
            expect(store.loading).to.be.false;
        });
    });
});
