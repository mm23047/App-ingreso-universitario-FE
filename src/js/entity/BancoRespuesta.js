// BE: BancoRespuesta  @Table(name="banco_respuesta")
// PK: UUID idBancoRespuesta  (columna id_respuesta_global)
// Relaciones:
//   areaConocimiento @ManyToOne AreasConocimiento (LAZY, optional=true — puede ser null para respuestas globales)
// NOTA: esta entidad llega siempre anidada dentro de PreguntaOpcion.idRespuestaGlobal
//       El texto de la opción visible para el aspirante está en textoRespuesta
class BancoRespuesta {
    constructor(idBancoRespuesta, textoRespuesta, areaConocimiento) {
        this.idBancoRespuesta  = idBancoRespuesta;
        this.textoRespuesta    = textoRespuesta;
        this.areaConocimiento  = areaConocimiento;
    }
}

export default BancoRespuesta;
