import DefaultDao from './default_dao.js';

// Endpoints: POST /examen_realizado, POST /respuestas_examen
// Entidad ExamenRealizado — campos POST: aspiranteId (UUID), pruebaAdmisionId (UUID), turnoId (UUID)
// Entidad RespuestaExamen  — campos POST: examenRealizadoId (UUID), preguntaId (UUID), opcionId (UUID)
// NOTA: verifica con el backend los nombres exactos de los campos del body JSON
class ExamenDao extends DefaultDao {
    constructor() {
        super();
        this.examenUrl = this.BASE_URL + 'examen_realizado';
        this.respuestasUrl = this.BASE_URL + 'respuestas_examen';
        this.BASE_URL = this.examenUrl;
    }

    async iniciarExamen(aspiranteId, pruebaId) {
        if (!aspiranteId || !pruebaId) {
            throw new Error('El ID del aspirante y el ID de la prueba son requeridos');
        }
        try {
            const respuesta = await fetch(this.examenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aspiranteId, pruebaId })
            });
            if (respuesta.status === 201) {
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al iniciar examen:', error);
            throw error;
        }
    }

    async enviarRespuestas(examenId, respuestas) {
        if (!examenId || !respuestas) {
            throw new Error('El ID del examen y las respuestas son requeridos');
        }
        try {
            const respuesta = await fetch(this.respuestasUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examenId, respuestas })
            });
            if (respuesta.status === 201) {
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al enviar respuestas del examen:', error);
            throw error;
        }
    }
}

export default ExamenDao;
