import { expect } from '../../lib/chai/index.js';
import { store, subscribe, resetStore } from '../../../../js/infra/app_state.js';

describe('AppState — Pruebas Unitarias', () => {
    beforeEach(() => {
        resetStore();
    });

    // ── store — valores iniciales ────────────────────────────────────────────
    describe('store — estado inicial', () => {
        it('debe iniciar con aspirante = null', () => {
            expect(store.aspirante).to.be.null;
        });

        it('debe iniciar con route = "/"', () => {
            expect(store.route).to.equal('/');
        });

        it('debe iniciar con loading = false', () => {
            expect(store.loading).to.be.false;
        });

        it('las propiedades array deben iniciar vacías', () => {
            expect(store.carreras).to.be.an('array').that.is.empty;
            expect(store.turnos).to.be.an('array').that.is.empty;
            expect(store.preguntas).to.be.an('array').that.is.empty;
            expect(store.notificaciones).to.be.an('array').that.is.empty;
        });
    });

    // ── store — Proxy de lectura/escritura ───────────────────────────────────
    describe('store — Proxy lectura/escritura y evento state-changed', () => {
        it('debe permitir asignar y leer valores', () => {
            store.route = '/registro';
            expect(store.route).to.equal('/registro');
        });

        it('debe emitir "state-changed" al mutar una propiedad', done => {
            window.addEventListener('state-changed', e => {
                expect(e.detail.prop).to.equal('loading');
                expect(e.detail.newValue).to.be.true;
                expect(e.detail.oldValue).to.be.false;
                done();
            }, { once: true });
            store.loading = true;
        });

        it('state-changed incluye oldValue correcto', done => {
            store.route = '/areas';
            window.addEventListener('state-changed', e => {
                if (e.detail.prop === 'route') {
                    expect(e.detail.oldValue).to.equal('/areas');
                    expect(e.detail.newValue).to.equal('/procesos');
                    done();
                }
            }, { once: true });
            store.route = '/procesos';
        });
    });

    // ── subscribe — registro de callbacks ───────────────────────────────────
    describe('subscribe — notificación a listeners', () => {
        it('el callback se invoca cuando la propiedad suscrita cambia', () => {
            let llamado = false;
            const unsub = subscribe('loading', () => { llamado = true; });
            store.loading = true;
            unsub();
            expect(llamado).to.be.true;
        });

        it('el callback recibe (newValue, oldValue)', () => {
            let nuevoValor, anteriorValor;
            const unsub = subscribe('route', (n, o) => { nuevoValor = n; anteriorValor = o; });
            store.route = '/areas';
            unsub();
            expect(nuevoValor).to.equal('/areas');
            expect(anteriorValor).to.equal('/');
        });

        it('puede haber múltiples callbacks para la misma propiedad', () => {
            let conteo = 0;
            const unsub1 = subscribe('loading', () => { conteo++; });
            const unsub2 = subscribe('loading', () => { conteo++; });
            store.loading = true;
            unsub1();
            unsub2();
            expect(conteo).to.equal(2);
        });

        it('el callback NO se invoca para cambios en otras propiedades', () => {
            let llamado = false;
            const unsub = subscribe('aspirante', () => { llamado = true; });
            store.route = '/registro';
            unsub();
            expect(llamado).to.be.false;
        });
    });

    // ── unsubscribe — eliminación de callbacks ───────────────────────────────
    describe('unsubscribe — eliminación de callbacks', () => {
        it('el callback no se invoca después de llamar al unsubscribe', () => {
            let llamado = false;
            const unsub = subscribe('loading', () => { llamado = true; });
            unsub();
            store.loading = true;
            expect(llamado).to.be.false;
        });

        it('unsubscribe no afecta a otros callbacks de la misma propiedad', () => {
            let conteo = 0;
            const unsub1 = subscribe('loading', () => { conteo++; });
            const unsub2 = subscribe('loading', () => { conteo++; });
            unsub1();
            store.loading = true;
            unsub2();
            expect(conteo).to.equal(1);
        });

        it('unsubscribe es idempotente: llamarlo dos veces no lanza error', () => {
            const unsub = subscribe('loading', () => {});
            expect(() => { unsub(); unsub(); }).to.not.throw();
        });
    });

    // ── resetStore — reinicio del estado ────────────────────────────────────
    describe('resetStore — reinicio del estado global', () => {
        it('debe restablecer propiedades escalares a su valor inicial', () => {
            store.route = '/carreras';
            store.loading = true;
            resetStore();
            expect(store.route).to.equal('/');
            expect(store.loading).to.be.false;
        });

        it('debe restablecer propiedades de objeto a null', () => {
            store.aspirante = { id: 'uuid-1', nombres: 'Juan' };
            store.prueba    = { idPruebaAdmision: 'p-1' };
            resetStore();
            expect(store.aspirante).to.be.null;
            expect(store.prueba).to.be.null;
        });

        it('debe restablecer arrays a arreglo vacío', () => {
            store.carreras = [{ id: 1 }];
            store.turnos   = [{ idTurno: 2 }];
            resetStore();
            expect(store.carreras).to.be.an('array').that.is.empty;
            expect(store.turnos).to.be.an('array').that.is.empty;
        });

        it('debe reiniciar todas las propiedades en un solo llamado', () => {
            store.route     = '/registro';
            store.loading   = true;
            store.aspirante = { id: 'uuid-x' };
            store.carreras  = [{ id: 5 }];
            resetStore();
            expect(store.route).to.equal('/');
            expect(store.loading).to.be.false;
            expect(store.aspirante).to.be.null;
            expect(store.carreras).to.be.an('array').that.is.empty;
        });
    });
});
