import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/notificacion-toast.js';

describe('NotificacionToast — app-toast — Pruebas Unitarias', () => {
    let toast;

    // ── Helpers de acceso al Shadow DOM ────────────────────────────────────
    const wrapper = () => toast.shadowRoot.querySelector('.toast-wrapper');

    // ¡AQUÍ ESTÁ LA MAGIA! Filtramos los hijos para ignorar el <slot>
    const getShadowItems = () => Array.from(wrapper().children).filter(el => el.tagName !== 'SLOT');

    const getShadowItem = (index = 0) => getShadowItems()[index] || null;

    const getItem = (index = 0) => {
        const si = getShadowItem(index);
        return si ? si.shadowRoot.querySelector('.toast-item') : null;
    };

    const getMensaje = (index = 0) => {
        const si = getShadowItem(index);
        return si ? si.shadowRoot.querySelector('.toast-message') : null;
    };

    beforeEach(() => {
        // Limpiamos la pantalla completamente por seguridad
        document.body.innerHTML = ''; 
        toast = document.createElement('app-toast');
        document.body.appendChild(toast);
    });

    afterEach(() => {
        if (toast?.parentNode) toast.parentNode.removeChild(toast);
    });

    // ── Mostrar mensajes ───────────────────────────────────────────────────
    describe('Mostrar mensajes — show()', () => {
        it('show() agrega un ítem al wrapper', () => {
            toast.show('Mensaje', 0);
            expect(getShadowItems().length).to.equal(1); // Actualizado
        });

        it('show() establece el texto del mensaje en .toast-message', () => {
            toast.show('Hola mundo', 0);
            const msg = getMensaje();
            expect(msg).to.not.be.null;
            expect(msg.textContent).to.equal('Hola mundo');
        });

        it('show() aplica la clase de tipo al ítem', () => {
            toast.show('Mensaje', 0, 'success');
            expect(getItem().classList.contains('success')).to.be.true;
        });

        it('el tipo por defecto es "info"', () => {
            toast.show('Mensaje');
            expect(getItem().classList.contains('info')).to.be.true;
        });

        it('múltiples show() apilan ítems independientes', () => {
            toast.show('Primero', 0);
            toast.show('Segundo', 0);
            toast.show('Tercero', 0);
            expect(getShadowItems().length).to.equal(3); // Actualizado
        });

        it('cada ítem muestra su propio texto de mensaje', () => {
            toast.show('Alpha', 0);
            toast.show('Beta', 0);
            expect(getMensaje(0).textContent).to.equal('Alpha');
            expect(getMensaje(1).textContent).to.equal('Beta');
        });
    });

    // ── Métodos de conveniencia ────────────────────────────────────────────
    describe('Métodos de conveniencia', () => {
        it('success() crea un toast con clase success', () => {
            toast.success('Operación exitosa');
            expect(getItem().classList.contains('success')).to.be.true;
        });

        it('error() crea un toast con clase error', () => {
            toast.error('Ocurrió un error');
            expect(getItem().classList.contains('error')).to.be.true;
        });

        it('warning() crea un toast con clase warning', () => {
            toast.warning('Advertencia');
            expect(getItem().classList.contains('warning')).to.be.true;
        });

        it('info() crea un toast con clase info', () => {
            toast.info('Información');
            expect(getItem().classList.contains('info')).to.be.true;
        });
    });

    // ── Accesibilidad ─────────────────────────────────────────────────────
    describe('Accesibilidad', () => {
        it('el ítem de toast debe tener role="alert"', () => {
            toast.show('Alerta', 0);
            expect(getItem().getAttribute('role')).to.equal('alert');
        });

        it('el ítem de toast debe tener aria-live="assertive"', () => {
            toast.show('Alerta', 0);
            expect(getItem().getAttribute('aria-live')).to.equal('assertive');
        });
    });

    // ── Cierre del toast ──────────────────────────────────────────────────
    describe('Cierre del toast', () => {
        it('el clic en el botón cerrar inicia el estado de salida (clase saliendo)', () => {
            toast.show('Cerrando', 0);
            const item     = getItem();
            const closeBtn = getShadowItem().shadowRoot.querySelector('.toast-close');
            closeBtn.click();
            expect(item.classList.contains('saliendo')).to.be.true;
        });

        it('el clic en cerrar elimina la clase visible del ítem', () => {
            toast.show('Cerrando', 0);
            const item     = getItem();
            const closeBtn = getShadowItem().shadowRoot.querySelector('.toast-close');
            item.classList.add('visible');
            closeBtn.click();
            expect(item.classList.contains('visible')).to.be.false;
        });

        it('auto-cierre: inicia el estado saliendo después del tiempo indicado', function(done) {
            this.timeout(600);
            toast.show('Auto', 100);
            const item = getItem();

            setTimeout(() => {
                expect(item.classList.contains('saliendo')).to.be.true;
                done();
            }, 150);
        });

        it('duration=0 no activa el auto-cierre automáticamente', function(done) {
            this.timeout(400);
            toast.show('Persistente', 0);
            const item = getItem();

            setTimeout(() => {
                expect(item.classList.contains('saliendo')).to.be.false;
                done();
            }, 200);
        });
    });
});