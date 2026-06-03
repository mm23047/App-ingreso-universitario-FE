// BE: EtapasAdmision  @Table(name="etapa_admision")
// PK: UUID idEtapaAdmision  (columna id_etapa)
class EtapasAdmision {
    constructor(idEtapaAdmision, nombre, puntajeMinimo, puntajeMaximo, descripcion, cantidadPreguntasRequeridas) {
        this.idEtapaAdmision             = idEtapaAdmision;
        this.nombre                      = nombre;
        this.puntajeMinimo               = puntajeMinimo;
        this.puntajeMaximo               = puntajeMaximo;
        this.descripcion                 = descripcion;
        this.cantidadPreguntasRequeridas = cantidadPreguntasRequeridas;
    }
}

export default EtapasAdmision;
