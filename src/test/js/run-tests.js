async function inicializarPruebas() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        // DAOs — recursos principales del flujo del aspirante
        await import('./aspirantes_dao.unit.test.js');
        await import('./carreras_dao.unit.test.js');
        await import('./turnos_dao.unit.test.js');
        await import('./examen_dao.unit.test.js');
        await import('./inscripciones_dao.unit.test.js');
        await import('./preguntas_dao.unit.test.js');
        await import('./respuesta_examen_dao.unit.test.js');

        // DAOs — recursos de contexto (prueba activa, etapa, carreras elegidas, árbol de áreas)
        await import('./pruebas_admision_dao.unit.test.js');
        await import('./etapas_dao.unit.test.js');
        await import('./carreras_elegida_dao.unit.test.js');
        await import('./areas_dao.unit.test.js');

        // Controllers — flujo del aspirante
        await import('./turnos_controller.unit.test.js');
        await import('./aspirantes_controller.unit.test.js');
        await import('./carreras_controller.unit.test.js');
        await import('./carreras_elegida_controller.unit.test.js');
        await import('./etapas_controller.unit.test.js');

        // Controllers — prueba y examen
        await import('./pruebas_admision_controller.unit.test.js');
        await import('./inscripciones_controller.unit.test.js');
        await import('./examen_controller.unit.test.js');
        await import('./areas_controller.unit.test.js');

        // Infraestructura
        await import('./local_storage_dao.unit.test.js');

        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebas);
