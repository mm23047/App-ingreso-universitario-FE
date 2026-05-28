import DefaultDao from './default_dao.js';

class ProcesarLentoDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'procesarlento';
    }

    async procesarLento() {
        try {
            const respuesta = await fetch(this.BASE_URL, { method: 'GET' });
            if (respuesta.status === 200) {
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al procesar lento:', error);
            throw error;
        }
    }
}

export default ProcesarLentoDao;