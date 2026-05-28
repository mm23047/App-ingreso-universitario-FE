import { expect } from '../lib/chai/index.js';
import '../../../js/components/contador.js';

describe('ContadorComponent - Pruebas Unitarias', () => {
    let contador;

    beforeEach(() => {
        contador = document.createElement('app-contador');
        document.body.appendChild(contador);
    });

    afterEach(() => {
        if (contador && contador.parentNode) {
            contador.parentNode.removeChild(contador);
        }
    });

    describe('Creación y Registro', () => {
        it('debe existir el elemento personalizado app-contador', () => {
            expect(customElements.get('app-contador')).to.not.be.undefined;
        });

        it('debe crear una instancia del componente', () => {
            expect(contador).to.be.instanceOf(HTMLElement);
        });

        it('debe tener shadowRoot en modo open', () => {
            expect(contador.shadowRoot).to.not.be.null;
            expect(contador.shadowRoot.mode).to.equal('open');
        });
    });

    describe('Ciclo de Vida', () => {
        it('debe inicializar contador en 0 por defecto', function(done) {
            setTimeout(() => {
                const numero = contador.shadowRoot.querySelector('.numero');
                expect(numero.textContent).to.equal('0');
                done();
            }, 50);
        });

        it('debe inicializar con valor del atributo inicial', function(done) {
            const contador2 = document.createElement('app-contador');
            contador2.setAttribute('inicial', '25');
            document.body.appendChild(contador2);

            setTimeout(() => {
                const numero = contador2.shadowRoot.querySelector('.numero');
                expect(numero.textContent).to.equal('25');
                document.body.removeChild(contador2);
                done();
            }, 50);
        });

        it('debe reaccionar a cambios en el atributo inicial', function(done) {
            contador.setAttribute('inicial', '50');

            setTimeout(() => {
                const numero = contador.shadowRoot.querySelector('.numero');
                expect(numero.textContent).to.equal('50');
                done();
            }, 50);
        });
    });

    describe('Métodos Públicos', () => {
        it('debe tener método getValor()', () => {
            expect(contador.getValor).to.be.a('function');
        });

        it('debe retornar el valor actual con getValor()', () => {
            expect(contador.getValor()).to.equal(0);
        });

        it('debe tener método setValor()', () => {
            expect(contador.setValor).to.be.a('function');
        });

        it('debe actualizar el valor con setValor()', function(done) {
            contador.setValor(42);
            setTimeout(() => {
                expect(contador.getValor()).to.equal(42);
                done();
            }, 50);
        });
    });

    describe('Funcionalidad de Botones', () => {
        it('debe tener botón de incrementar', function(done) {
            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('incrementar');
                expect(boton).to.not.be.null;
                expect(boton.textContent).to.include('Aumentar');
                done();
            }, 50);
        });

        it('debe incrementar el contador al hacer click', function(done) {
            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('incrementar');
                boton.click();

                setTimeout(() => {
                    expect(contador.getValor()).to.equal(1);
                    done();
                }, 50);
            }, 50);
        });

        it('debe tener botón de disminuir', function(done) {
            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('decrementar');
                expect(boton).to.not.be.null;
                expect(boton.textContent).to.include('Disminuir');
                done();
            }, 50);
        });

        it('debe disminuir el contador al hacer click', function(done) {
            contador.setValor(5);
            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('decrementar');
                boton.click();

                setTimeout(() => {
                    expect(contador.getValor()).to.equal(4);
                    done();
                }, 50);
            }, 50);
        });

        it('debe tener botón de reiniciar', function(done) {
            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('reiniciar');
                expect(boton).to.not.be.null;
                expect(boton.textContent).to.include('Reiniciar');
                done();
            }, 50);
        });

        it('debe reiniciar el contador a 0 al hacer click', function(done) {
            contador.setValor(10);
            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('reiniciar');
                boton.click();

                setTimeout(() => {
                    expect(contador.getValor()).to.equal(0);
                    done();
                }, 50);
            }, 50);
        });
    });

    describe('Eventos Personalizados', () => {
        it('debe emitir evento contador-cambio al incrementar', function(done) {
            let eventoRecibido = false;
            let valorRecibido = null;

            contador.addEventListener('contador-cambio', (event) => {
                eventoRecibido = true;
                valorRecibido = event.detail.valor;
            });

            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('incrementar');
                boton.click();

                setTimeout(() => {
                    expect(eventoRecibido).to.be.true;
                    expect(valorRecibido).to.equal(1);
                    done();
                }, 50);
            }, 50);
        });

        it('debe incluir el valor actual en el evento', function(done) {
            contador.setValor(5);
            let valorRecibido = null;

            contador.addEventListener('contador-cambio', (event) => {
                valorRecibido = event.detail.valor;
            });

            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('incrementar');
                boton.click();

                setTimeout(() => {
                    expect(valorRecibido).to.equal(6);
                    done();
                }, 50);
            }, 50);
        });
    });

    describe('Estilos Encapsulados', () => {
        it('debe aplicar estilos mediante Shadow DOM', function(done) {
            setTimeout(() => {
                const numero = contador.shadowRoot.querySelector('.numero');
                const computed = window.getComputedStyle(numero);
                expect(numero).to.not.be.null;
                done();
            }, 50);
        });

        it('debe contener contenedor con clase contenedor', function(done) {
            setTimeout(() => {
                const contenedor = contador.shadowRoot.querySelector('.contenedor');
                expect(contenedor).to.not.be.null;
                done();
            }, 50);
        });
    });

    describe('Auto-incremento', () => {
        it('debe iniciar el auto-incremento automáticamente', function(done) {
            this.timeout(2000);
            const contador2 = document.createElement('app-contador');
            contador2.setAttribute('intervalo', '100');
            document.body.appendChild(contador2);

            setTimeout(() => {
                const valor = contador2.getValor();
                expect(valor).to.be.greaterThan(0);
                document.body.removeChild(contador2);
                done();
            }, 300);
        });

        it('debe respetar el atributo intervalo', function(done) {
            this.timeout(2000);
            const contador2 = document.createElement('app-contador');
            contador2.setAttribute('intervalo', '500');
            document.body.appendChild(contador2);

            setTimeout(() => {
                const valor = contador2.getValor();
                expect(valor).to.be.lessThanOrEqual(2);
                document.body.removeChild(contador2);
                done();
            }, 600);
        });

        it('debe tener método pausar/reanudar', function(done) {
            this.timeout(2000);
            const contador2 = document.createElement('app-contador');
            contador2.setAttribute('intervalo', '100');
            document.body.appendChild(contador2);

            setTimeout(() => {
                contador2.detener();
                const valorPausado = contador2.getValor();

                setTimeout(() => {
                    const valorDespues = contador2.getValor();
                    expect(valorDespues).to.equal(valorPausado);
                    document.body.removeChild(contador2);
                    done();
                }, 150);
            }, 150);
        });

        it('debe poder reanudarse después de pausar', function(done) {
            this.timeout(2000);
            const contador2 = document.createElement('app-contador');
            contador2.setAttribute('intervalo', '100');
            document.body.appendChild(contador2);

            setTimeout(() => {
                contador2.detener();
                const valorPausado = contador2.getValor();

                contador2.reanudar();

                setTimeout(() => {
                    const valorReanudado = contador2.getValor();
                    expect(valorReanudado).to.be.greaterThan(valorPausado);
                    document.body.removeChild(contador2);
                    done();
                }, 150);
            }, 150);
        });

        it('debe mostrar estado de auto-incremento', function(done) {
            setTimeout(() => {
                const estado = contador.shadowRoot.querySelector('.estado');
                expect(estado).to.not.be.null;
                expect(estado.textContent).to.include('Incrementando');
                done();
            }, 50);
        });

        it('debe tener botón para pausar/reanudar', function(done) {
            setTimeout(() => {
                const boton = contador.shadowRoot.getElementById('pausar');
                expect(boton).to.not.be.null;
                done();
            }, 50);
        });
    });

    describe('Validación de Parámetros', () => {
        it('debe ignorar valores no numéricos en setValor', function(done) {
            contador.setValor('abc');
            setTimeout(() => {
                expect(isNaN(contador.getValor())).to.be.false;
                done();
            }, 50);
        });

        it('debe convertir strings a números', function(done) {
            contador.setValor('42');
            setTimeout(() => {
                expect(contador.getValor()).to.equal(42);
                done();
            }, 50);
        });
    });
});
