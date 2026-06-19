import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/recom-box.js';

describe('RecomBox — app-recom-box — Pruebas Unitarias', () => {
    let recom;

    // ── Helpers de acceso al Shadow DOM ────────────────────────────────────
    const sr         = () => recom.shadowRoot;
    const caja       = () => sr().querySelector('.caja');
    const tituloEl   = () => sr().querySelector('.titulo-texto');
    const subtitulo  = () => sr().querySelector('.subtitulo');
    const iconoEl    = () => sr().querySelector('.icono');
    const items      = () => [...sr().querySelectorAll('.lista li')];

    beforeEach(() => {
        recom = document.createElement('app-recom-box');
        document.body.appendChild(recom);
    });

    afterEach(() => {
        if (recom?.parentNode) recom.parentNode.removeChild(recom);
    });

    // ── Estructura inicial ─────────────────────────────────────────────────
    describe('Estructura inicial', () => {
        it('la caja existe en el shadow DOM', () => {
            expect(caja()).to.not.be.null;
        });

        it('la lista .lista existe en el shadow DOM', () => {
            expect(sr().querySelector('.lista')).to.not.be.null;
        });

        it('data es null antes de asignar', () => {
            expect(recom.data).to.be.null;
        });
    });

    // ── Variante ADMITIDO ──────────────────────────────────────────────────
    describe('Variante ADMITIDO', () => {
        beforeEach(() => { recom.data = { tipo: 'ADMITIDO' }; });

        it('caja debe tener clase admitido', () => {
            expect(caja().classList.contains('admitido')).to.be.true;
        });

        it('no debe tener clases de otras variantes', () => {
            expect(caja().classList.contains('pendiente')).to.be.false;
            expect(caja().classList.contains('no-admitido')).to.be.false;
        });

        it('muestra el subtítulo por defecto del CONFIG', () => {
            expect(subtitulo().textContent).to.include('admitido');
        });

        it('el contenedor de icono existe en el shadow DOM y está vacío por diseño actual', () => {
            expect(iconoEl()).to.not.be.null;
            expect(iconoEl().textContent).to.equal('');
        });

        it('renderiza los pasos por defecto del CONFIG', () => {
            expect(items().length).to.be.greaterThan(0);
        });

        it('muestra el titulo por defecto del CONFIG', () => {
            expect(tituloEl().textContent.length).to.be.greaterThan(0);
        });
    });

    // ── Variante PENDIENTE ─────────────────────────────────────────────────
    describe('Variante PENDIENTE', () => {
        beforeEach(() => { recom.data = { tipo: 'PENDIENTE' }; });

        it('caja debe tener clase pendiente', () => {
            expect(caja().classList.contains('pendiente')).to.be.true;
        });

        it('no debe tener clases de otras variantes', () => {
            expect(caja().classList.contains('admitido')).to.be.false;
            expect(caja().classList.contains('no-admitido')).to.be.false;
        });
    });

    // ── Variante NO_ADMITIDO ───────────────────────────────────────────────
    describe('Variante NO_ADMITIDO', () => {
        beforeEach(() => { recom.data = { tipo: 'NO_ADMITIDO' }; });

        it('caja debe tener clase no-admitido', () => {
            expect(caja().classList.contains('no-admitido')).to.be.true;
        });
    });

    // ── Variante CALIFICADO (reutiliza estilos de pendiente) ──────────────
    describe('Variante CALIFICADO', () => {
        beforeEach(() => { recom.data = { tipo: 'CALIFICADO' }; });

        it('caja debe tener clase pendiente (comparte estilos con PENDIENTE)', () => {
            expect(caja().classList.contains('pendiente')).to.be.true;
        });

        it('muestra un subtítulo diferente al de PENDIENTE', () => {
            const subtPendiente = 'Tu resultado está siendo procesado';
            expect(subtitulo().textContent).to.not.equal(subtPendiente);
        });
    });

    // ── Overrides de titulo, subtitulo y pasos ────────────────────────────
    describe('Overrides de datos desde la vista', () => {
        const datos = {
            tipo:      'PENDIENTE',
            titulo:    'Próximos pasos',
            subtitulo: 'Estás inscrito — el examen no ha sido realizado',
            pasos:     ['Verifica la fecha.', 'Ten tu DUI a mano.', 'Llega con anticipación.']
        };

        beforeEach(() => { recom.data = datos; });

        it('usa el titulo provisto en vez del default del CONFIG', () => {
            expect(tituloEl().textContent).to.equal('Próximos pasos');
        });

        it('usa el subtitulo provisto en vez del default del CONFIG', () => {
            expect(subtitulo().textContent).to.equal('Estás inscrito — el examen no ha sido realizado');
        });

        it('renderiza exactamente los pasos provistos', () => {
            expect(items().length).to.equal(3);
        });

        it('el primer paso coincide con el primero de los datos', () => {
            expect(items()[0].textContent).to.equal('Verifica la fecha.');
        });

        it('el último paso coincide con el último de los datos', () => {
            expect(items()[2].textContent).to.equal('Llega con anticipación.');
        });
    });

    // ── Getter de data ─────────────────────────────────────────────────────
    describe('Getter de data', () => {
        it('retorna el mismo objeto que fue asignado', () => {
            const d = { tipo: 'ADMITIDO' };
            recom.data = d;
            expect(recom.data).to.equal(d);
        });

        it('retorna null si no se asignó nada', () => {
            expect(recom.data).to.be.null;
        });
    });

    // ── Reasignación ──────────────────────────────────────────────────────
    describe('Reasignación de data', () => {
        it('al cambiar tipo la clase de la caja se actualiza correctamente', () => {
            recom.data = { tipo: 'ADMITIDO' };
            expect(caja().classList.contains('admitido')).to.be.true;

            recom.data = { tipo: 'NO_ADMITIDO' };
            expect(caja().classList.contains('admitido')).to.be.false;
            expect(caja().classList.contains('no-admitido')).to.be.true;
        });

        it('al reasignar pasos la lista se reconstruye', () => {
            recom.data = { tipo: 'PENDIENTE', pasos: ['A', 'B'] };
            expect(items().length).to.equal(2);

            recom.data = { tipo: 'PENDIENTE', pasos: ['X', 'Y', 'Z'] };
            expect(items().length).to.equal(3);
            expect(items()[0].textContent).to.equal('X');
        });

        it('al cambiar de tipo los pasos provienen del nuevo CONFIG', () => {
            recom.data = { tipo: 'ADMITIDO' };
            const pasosAdmitido = items().length;

            recom.data = { tipo: 'PENDIENTE' };
            const pasosPendiente = items().length;

            expect(pasosAdmitido).to.be.greaterThan(0);
            expect(pasosPendiente).to.be.greaterThan(0);
        });
    });
});
