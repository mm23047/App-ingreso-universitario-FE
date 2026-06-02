/* Template definido una sola vez a nivel de módulo — compartido entre instancias */
const _template = document.createElement('template');
_template.innerHTML = `
    <style>
        :host {
            display: block;
            padding: 20px;
            text-align: center;
            font-family: Arial, sans-serif;
        }
        .contenedor {
            max-width: 300px;
            margin: 0 auto;
            padding: 20px;
            border: 2px solid #007bff;
            border-radius: 8px;
            background-color: #f8f9fa;
        }
        .numero {
            font-size: 48px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
        }
        .botones {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        #decrementar { background-color: #dc3545; color: white; }
        #decrementar:hover { background-color: #c82333; }
        #incrementar { background-color: #28a745; color: white; }
        #incrementar:hover { background-color: #218838; }
        #reiniciar { background-color: #6c757d; color: white; }
        #reiniciar:hover { background-color: #5a6268; }
        #pausar { background-color: #ffc107; color: #333; }
        #pausar:hover { background-color: #e0a800; }
        .estado {
            margin-top: 15px;
            font-size: 14px;
            color: #666;
        }
        .estado.activo { color: #28a745; font-weight: bold; }
        .estado.pausado { color: #ffc107; font-weight: bold; }
    </style>

    <div class="contenedor">
        <!-- slot "label": permite personalizar el título desde fuera
             Uso: <app-contador><span slot="label">Mi Contador</span></app-contador> -->
        <slot name="label"><h2>Contador Automático</h2></slot>

        <div class="numero">0</div>

        <div class="botones">
            <button id="decrementar">- Disminuir</button>
            <button id="incrementar">+ Aumentar</button>
            <button id="pausar">&#9208; Pausar</button>
            <button id="reiniciar">Reiniciar</button>
        </div>

        <div class="estado activo">&#128260; Incrementando automáticamente</div>
    </div>
`;

class ContadorComponent extends HTMLElement {
    static get observedAttributes() {
        return ['inicial', 'intervalo'];
    }

    constructor() {
        super();
        this.contador = 0;
        this.intervaloId = null;
        this.velocidad = 1000;
        this.autoIncrementando = true;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(_template.content.cloneNode(true));
    }

    connectedCallback() {
        const inicial = this.getAttribute('inicial');
        if (inicial && !isNaN(inicial)) {
            this.contador = parseInt(inicial);
        }
        const intervalo = this.getAttribute('intervalo');
        if (intervalo && !isNaN(intervalo)) {
            this.velocidad = parseInt(intervalo);
        }
        this._sincronizarDisplay();
        this.setupEventListeners();
        this.iniciarAutoIncremento();
    }

    disconnectedCallback() {
        this.detenerAutoIncremento();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === 'inicial') {
            this.contador = parseInt(newValue) || 0;
            this._sincronizarDisplay();
        }
        if (name === 'intervalo') {
            this.velocidad = parseInt(newValue) || 1000;
            this.detenerAutoIncremento();
            this.iniciarAutoIncremento();
        }
    }

    setupEventListeners() {
        this.shadowRoot.getElementById('incrementar').addEventListener('click', () => this.aumentar());
        this.shadowRoot.getElementById('decrementar').addEventListener('click', () => this.disminuir());
        this.shadowRoot.getElementById('pausar').addEventListener('click', () => this.alternarPausa());
        this.shadowRoot.getElementById('reiniciar').addEventListener('click', () => this.reiniciar());
    }

    _sincronizarDisplay() {
        const numero = this.shadowRoot.querySelector('.numero');
        if (numero) numero.textContent = this.contador;
    }

    _sincronizarEstado() {
        const btnPausar = this.shadowRoot.getElementById('pausar');
        const estado = this.shadowRoot.querySelector('.estado');
        if (btnPausar) {
            btnPausar.textContent = this.autoIncrementando ? '⏸ Pausar' : '▶ Reanudar';
        }
        if (estado) {
            estado.textContent = this.autoIncrementando
                ? '🔄 Incrementando automáticamente'
                : '⏸ Pausado';
            estado.className = `estado ${this.autoIncrementando ? 'activo' : 'pausado'}`;
        }
    }

    aumentar() {
        this.contador++;
        this.actualizarDisplay();
    }

    disminuir() {
        this.contador--;
        this.actualizarDisplay();
    }

    reiniciar() {
        const inicial = this.getAttribute('inicial');
        this.contador = (inicial && !isNaN(inicial)) ? parseInt(inicial) : 0;
        this.autoIncrementando = true;
        this.detenerAutoIncremento();
        this.iniciarAutoIncremento();
        this._sincronizarEstado();
        this.actualizarDisplay();
    }

    actualizarDisplay() {
        this._sincronizarDisplay();
        this.dispatchEvent(new CustomEvent('contador-cambio', {
            detail: { valor: this.contador },
            bubbles: true,
            composed: true
        }));
    }

    iniciarAutoIncremento() {
        this.detenerAutoIncremento();
        if (this.autoIncrementando) {
            this.intervaloId = setInterval(() => {
                this.contador++;
                this.actualizarDisplay();
            }, this.velocidad);
        }
    }

    detenerAutoIncremento() {
        if (this.intervaloId) {
            clearInterval(this.intervaloId);
            this.intervaloId = null;
        }
    }

    alternarPausa() {
        this.autoIncrementando = !this.autoIncrementando;
        if (this.autoIncrementando) {
            this.iniciarAutoIncremento();
        } else {
            this.detenerAutoIncremento();
        }
        this._sincronizarEstado();
    }

    getValor() { return this.contador; }

    setValor(valor) {
        if (!isNaN(valor)) {
            this.contador = parseInt(valor);
            this.actualizarDisplay();
        }
    }

    detener() {
        this.autoIncrementando = false;
        this.detenerAutoIncremento();
        this._sincronizarEstado();
    }

    reanudar() {
        this.autoIncrementando = true;
        this.iniciarAutoIncremento();
        this._sincronizarEstado();
    }
}

customElements.define('app-contador', ContadorComponent);

export default ContadorComponent;
