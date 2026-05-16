import DefaultDao from "./default_dao.js";
class ProcesarLentoDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'procesarlento';
    }
    procesarLento() {
        let promesa = fetch (this.BASE_URL, {method: 'GET'});
        promesa.then(respuesta => {
            if (respuesta.status === 200) { 
                respuesta.json().then(datos =>{
                    console.log(datos);
                });
            }
        }).catch(error => {
            console.log(error);
        });
        console.log("Aqui hacer return");
    }
} 

export default ProcesarLentoDao;
console.log("Antes de procesear lento");
let dao = new ProcesarLentoDao();
dao.procesarLento();
console.log("Despues de procesear lento");