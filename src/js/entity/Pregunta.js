import Opcion from './Opcion.js';

// Entidad: BancoPregunta
// Endpoint: GET /preguntas  (sin opciones embebidas)
//           GET /preguntas/{id}/opciones  (opciones en endpoint aparte)
// Campos reales del backend (getters → JSON):
//   idBancoPregunta (UUID), enunciado (el campo es "enunciado", NO "textoPregunta"), tema (nested, lazy)
// NOTA: las opciones NO vienen embebidas en /preguntas — son un recurso separado.
//       Si el objeto data incluye opciones (mocks o respuestas enriquecidas), se mapean.
export default class Pregunta {
    constructor(data = {}) {
        // PK: backend usa idBancoPregunta, tests usan id
        this.idBancoPregunta = data.idBancoPregunta ?? data.id ?? null;
        this.id              = data.idBancoPregunta ?? data.id ?? null;

        // Texto: backend usa "enunciado"; los mocks de test usaban "textoPregunta"
        this.enunciado     = data.enunciado     ?? data.textoPregunta ?? '';
        this.textoPregunta = data.textoPregunta ?? data.enunciado     ?? '';

        // Relación anidada al tema (lazy, puede venir null o como objeto)
        this.tema = data.tema ?? null;

        // Opciones: no vienen en /preguntas, solo si se agregan manualmente o desde /opciones
        if (Array.isArray(data.opciones)) {
            this.opciones = data.opciones.map(o => new Opcion(o));
        } else {
            this.opciones = [];
        }
    }
}
