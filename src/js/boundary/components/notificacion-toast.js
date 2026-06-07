/* ── Template del contenedor del componente ── */
const _containerTemplate = document.createElement('template');
_containerTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            pointer-events: none;
        }

        .toast-wrapper {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-end;
        }

        ::slotted(*) {
            pointer-events: auto;
        }
    </style>
    <div class="toast-wrapper">
        <slot></slot>
    </div>
`;

/* ── Template de un ítem de toast individual ── */
const _itemTemplate = document.createElement('template');
_itemTemplate.innerHTML = `
    <style>
        .toast-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            background: #1e293b;
            color: #f8fafc;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,.25);
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 360px;
            pointer-events: auto;
            cursor: default;
            opacity: 0;
            transform: translateX(60px);
            transition: opacity 280ms ease, transform 280ms ease;
        }
        .toast-item.visible {
            opacity: 1;
            transform: translateX(0);
        }
        .toast-item.saliendo {
            opacity: 0;
            transform: translateX(60px);
        }
        .toast-item.success { border-left: 4px solid #10B981; }
        .toast-item.error   { border-left: 4px solid #EF4444; }
        .toast-item.warning { border-left: 4px solid #F59E0B; }
        .toast-item.info    { border-left: 4px solid #3B82F6; }
        .toast-icon { font-size: 18px; flex-shrink: 0; }
        .toast-message { flex: 1; }
        .toast-close {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 16px;
            cursor: pointer;
            padding: 0 4px;
            line-height: 1;
        }
        .toast-close:hover { color: #f8fafc; }
    </style>
    <div class="toast-item" role="alert" aria-live="assertive">
        <span class="toast-icon"></span>
        <span class="toast-message">
            <slot name="message"></slot>
        </span>
        <button class="toast-close" aria-label="Cerrar">&#10005;</button>
    </div>
`;

const ICONOS = {
    success: '',
    error:   '',
    warning: '',
    info:    ''
};

class NotificacionToast extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(_containerTemplate.content.cloneNode(true));
        this._wrapper = this.shadowRoot.querySelector('.toast-wrapper');
    }

    show(message, duration = 3000, tipo = 'info') {
        const shadowItem = document.createElement('div');
        shadowItem.attachShadow({ mode: 'open' });
        shadowItem.shadowRoot.appendChild(_itemTemplate.content.cloneNode(true));

        const item     = shadowItem.shadowRoot.querySelector('.toast-item');
        const iconEl   = shadowItem.shadowRoot.querySelector('.toast-icon');
        const msgEl    = shadowItem.shadowRoot.querySelector('.toast-message');
        const closeBtn = shadowItem.shadowRoot.querySelector('.toast-close');

        item.classList.add(tipo);
        iconEl.textContent = ICONOS[tipo] ?? ICONOS.info;
        msgEl.textContent  = message;

        this._wrapper.appendChild(shadowItem);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => item.classList.add('visible'));
        });

        const _cerrar = () => {
            item.classList.remove('visible');
            item.classList.add('saliendo');
            item.addEventListener('transitionend', () => shadowItem.remove(), { once: true });
        };

        closeBtn.addEventListener('click', _cerrar);

        if (duration > 0) {
            setTimeout(_cerrar, duration);
        }
    }

    success(msg, ms = 3000) { this.show(msg, ms, 'success'); }
    error(msg, ms = 4000)   { this.show(msg, ms, 'error');   }
    warning(msg, ms = 4000) { this.show(msg, ms, 'warning'); }
    info(msg, ms = 3000)    { this.show(msg, ms, 'info');    }
}

customElements.define('app-toast', NotificacionToast);

export default NotificacionToast;
