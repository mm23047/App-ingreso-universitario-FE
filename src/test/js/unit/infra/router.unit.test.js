import { expect } from '../../lib/chai/index.js';
import { navigate, getCurrentRoute, RUTAS } from '../../../../js/infra/router.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

describe('Router — Pruebas Unitarias', () => {
    let hashOriginal;

    beforeEach(() => {
        hashOriginal = window.location.hash;
        resetStore();
    });

    afterEach(() => {
        // Restaurar hash sin disparar hashchange (asignamos directamente)
        window.location.hash = hashOriginal || '#/';
    });

    // ── RUTAS — mapa estático ────────────────────────────────────────────────
    describe('RUTAS — mapa de rutas registradas', () => {
        it('debe mapear "/" a "home"', () => {
            expect(RUTAS['/']).to.equal('home');
        });

        it('debe contener todas las rutas del flujo de inscripción', () => {
            ['/carreras', '/registro', '/procesos', '/areas', '/resultado'].forEach(r => {
                expect(RUTAS).to.have.property(r);
            });
        });

        it('ninguna ruta debe mapear a un valor vacío o nulo', () => {
            Object.values(RUTAS).forEach(nombre => {
                expect(nombre).to.be.a('string').and.to.have.length.greaterThan(0);
            });
        });
    });

    // ── getCurrentRoute — lectura del hash actual ────────────────────────────
    describe('getCurrentRoute — lectura del hash actual', () => {
        it('debe retornar la ruta cuando el hash corresponde a una ruta registrada', () => {
            window.location.hash = '#/carreras';
            expect(getCurrentRoute()).to.equal('/carreras');
        });

        it('debe retornar "/" para un hash no registrado', () => {
            window.location.hash = '#/ruta-inexistente';
            expect(getCurrentRoute()).to.equal('/');
        });

        it('debe retornar "/" cuando el hash está vacío', () => {
            window.location.hash = '';
            expect(getCurrentRoute()).to.equal('/');
        });

        it('debe reconocer cada ruta registrada en RUTAS', () => {
            Object.keys(RUTAS).forEach(ruta => {
                window.location.hash = `#${ruta}`;
                expect(getCurrentRoute()).to.equal(ruta);
            });
        });
    });

    // ── navigate — escritura del hash ────────────────────────────────────────
    describe('navigate — escritura del hash', () => {
        it('debe actualizar window.location.hash a la ruta indicada', () => {
            navigate('/areas');
            expect(window.location.hash).to.equal('#/areas');
        });

        it('debe redirigir a "#/" cuando la ruta no existe en RUTAS', () => {
            navigate('/ruta-que-no-existe');
            expect(window.location.hash).to.equal('#/');
        });

        it('navigate a "/" establece el hash a "#/"', () => {
            navigate('/');
            expect(window.location.hash).to.equal('#/');
        });

        it('navigate a "/registro" establece el hash correcto', () => {
            navigate('/registro');
            expect(window.location.hash).to.equal('#/registro');
        });
    });

    // ── _manejarCambioRuta — integración hashchange → store + evento ─────────
    describe('_manejarCambioRuta — integración hashchange → store y route-changed', () => {
        it('al disparar hashchange actualiza store.route a la ruta del hash', () => {
            window.location.hash = '#/procesos';
            window.dispatchEvent(new Event('hashchange'));
            expect(store.route).to.equal('/procesos');
        });

        it('hash inválido → store.route queda en "/"', () => {
            window.location.hash = '#/no-existe';
            window.dispatchEvent(new Event('hashchange'));
            expect(store.route).to.equal('/');
        });

        it('debe emitir el evento "route-changed" con ruta y nombre correctos', done => {
            window.location.hash = '#/carreras';
            window.addEventListener('route-changed', e => {
                expect(e.detail.ruta).to.equal('/carreras');
                expect(e.detail.nombre).to.equal('carreras');
                done();
            }, { once: true });
            window.dispatchEvent(new Event('hashchange'));
        });

        it('el nombre en route-changed debe coincidir con el valor en RUTAS', done => {
            window.location.hash = '#/areas';
            window.addEventListener('route-changed', e => {
                expect(e.detail.nombre).to.equal(RUTAS['/areas']);
                done();
            }, { once: true });
            window.dispatchEvent(new Event('hashchange'));
        });
    });
});
