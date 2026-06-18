async function inicializarPruebas() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        // DAOs — recursos principales del flujo del aspirante
        await import('./unit/dao/aspirantes_dao.unit.test.js');
        await import('./unit/dao/carreras_dao.unit.test.js');
        await import('./unit/dao/turnos_dao.unit.test.js');
        await import('./unit/dao/examen_dao.unit.test.js');
        await import('./unit/dao/inscripciones_dao.unit.test.js');
        await import('./unit/dao/preguntas_dao.unit.test.js');
        await import('./unit/dao/respuesta_examen_dao.unit.test.js');

        // DAOs — recursos de contexto (prueba activa, etapa, carreras elegidas, árbol de áreas)
        await import('./unit/dao/pruebas_admision_dao.unit.test.js');
        await import('./unit/dao/etapas_dao.unit.test.js');
        await import('./unit/dao/carreras_elegida_dao.unit.test.js');
        await import('./unit/dao/areas_dao.unit.test.js');

        // Controllers — flujo del aspirante
        await import('./unit/control/turnos_controller.unit.test.js');
        await import('./unit/control/aspirantes_controller.unit.test.js');
        await import('./unit/control/carreras_controller.unit.test.js');
        await import('./unit/control/carreras_elegida_controller.unit.test.js');
        await import('./unit/control/etapas_controller.unit.test.js');

        // Controllers — prueba y examen
        await import('./unit/control/pruebas_admision_controller.unit.test.js');
        await import('./unit/control/inscripciones_controller.unit.test.js');
        await import('./unit/control/examen_controller.unit.test.js');
        await import('./unit/control/areas_controller.unit.test.js');
        await import('./unit/control/procesos_controller.unit.test.js');

        // Infraestructura
        await import('./unit/infra/local_storage_dao.unit.test.js');
        await import('./unit/infra/app_state.unit.test.js');
        await import('./unit/infra/router.unit.test.js');

        // Web Components — participan en los flujos evaluados del parcial
        await import('./components/arbol.unit.test.js');            // flujo: Áreas
        await import('./components/proceso-card.unit.test.js');    // flujo: Procesos
        await import('./components/toast.unit.test.js');           // flujos: Registro, Resultado
        await import('./components/recom-box.unit.test.js');       // flujo: Resultado (recomendaciones)
        await import('./components/estado-vacio.unit.test.js');    // flujos: Procesos, Áreas
        await import('./components/carrera-card.unit.test.js');    // flujo: Carreras
        await import('./components/paso-card.unit.test.js');       // flujo: Home
        await import('./components/selector-prioridad.unit.test.js'); // flujo: Registro
        await import('./components/resultado-card.unit.test.js'); // flujo: Resultado

        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebas);
