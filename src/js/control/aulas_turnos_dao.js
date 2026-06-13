import DefaultDao from './default_dao.js';

// Resource: AulasTurnosResource  @Path("aulas_turnos")
// GET /aulas_turnos/disponibilidad  → DisponibilidadAulaTurno[]
class AulasTurnosDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'aulas_turnos';
    }

    async obtenerDisponibilidad() {
        return this._get(`${this.BASE_URL}/disponibilidad`);
    }
}

export default AulasTurnosDao;
