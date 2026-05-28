async function inicializarPruebasContador() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        await import('./components/contador.unit.test.js');
        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas del contador:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebasContador);
