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

        this.render();
        this.setupEventListeners();
        this.iniciarAutoIncremento();
    }

    disconnectedCallback() {
        this.detenerAutoIncremento();
        this.removeEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'inicial' && oldValue !== newValue) {
            this.contador = parseInt(newValue) || 0;
            this.render();
        }
        if (name === 'intervalo' && oldValue !== newValue) {
            this.velocidad = parseInt(newValue) || 1000;
            this.detenerAutoIncremento();
            this.iniciarAutoIncremento();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
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

                h2 {
                    color: #333;
                    margin-top: 0;
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

                #decrementar {
                    background-color: #dc3545;
                    color: white;
                }

                #decrementar:hover {
                    background-color: #c82333;
                }

                #incrementar {
                    background-color: #28a745;
                    color: white;
                }

                #incrementar:hover {
                    background-color: #218838;
                }

                #reiniciar {
                    background-color: #6c757d;
                    color: white;
                }

                #reiniciar:hover {
                    background-color: #5a6268;
                }

                #pausar {
                    background-color: #ffc107;
                    color: #333;
                }

                #pausar:hover {
                    background-color: #e0a800;
                }

                .estado {
                    margin-top: 15px;
                    font-size: 14px;
                    color: #666;
                }

                .estado.activo {
                    color: #28a745;
                    font-weight: bold;
                }

                .estado.pausado {
                    color: #ffc107;
                    font-weight: bold;
                }
            </style>

            <div class="contenedor">
                <h2>Contador Automático</h2>
                <div class="numero">${this.contador}</div>
                <div class="botones">
                    <button id="decrementar">- Disminuir</button>
                    <button id="incrementar">+ Aumentar</button>
                    <button id="pausar">${this.autoIncrementando ? '⏸ Pausar' : '▶ Reanudar'}</button>
                    <button id="reiniciar">Reiniciar</button>
                </div>
                <div class="estado ${this.autoIncrementando ? 'activo' : 'pausado'}">
                    ${this.autoIncrementando ? '🔄 Incrementando automáticamente' : '⏸ Pausado'}
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.getElementById('incrementar').addEventListener('click', () => this.aumentar());
        this.shadowRoot.getElementById('decrementar').addEventListener('click', () => this.disminuir());
        this.shadowRoot.getElementById('pausar').addEventListener('click', () => this.alternarPausa());
        this.shadowRoot.getElementById('reiniciar').addEventListener('click', () => this.reiniciar());
    }

    removeEventListeners() {
        const incrementar = this.shadowRoot.getElementById('incrementar');
        const decrementar = this.shadowRoot.getElementById('decrementar');
        const pausar = this.shadowRoot.getElementById('pausar');
        const reiniciar = this.shadowRoot.getElementById('reiniciar');

        if (incrementar) incrementar.removeEventListener('click', () => this.aumentar());
        if (decrementar) decrementar.removeEventListener('click', () => this.disminuir());
        if (pausar) pausar.removeEventListener('click', () => this.alternarPausa());
        if (reiniciar) reiniciar.removeEventListener('click', () => this.reiniciar());
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
        this.actualizarDisplay();
    }

    actualizarDisplay() {
        const numero = this.shadowRoot.querySelector('.numero');
        if (numero) {
            numero.textContent = this.contador;
        }
        this.dispatchEvent(new CustomEvent('contador-cambio', {
            detail: { valor: this.contador }
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
        this.render();
        this.setupEventListeners();
    }

    getValor() {
        return this.contador;
    }

    setValor(valor) {
        if (!isNaN(valor)) {
            this.contador = parseInt(valor);
            this.actualizarDisplay();
        }
    }

    detener() {
        this.autoIncrementando = false;
        this.detenerAutoIncremento();
        this.render();
        this.setupEventListeners();
    }

    reanudar() {
        this.autoIncrementando = true;
        this.iniciarAutoIncremento();
        this.render();
        this.setupEventListeners();
    }
}

customElements.define('app-contador', ContadorComponent);

export default ContadorComponent;
