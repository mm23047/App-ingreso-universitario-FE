function functionTradicional () {
    console.log(this);
}

class ClaseTradicional {
    constructor() {
        this.texto = 'texto';
        this.numeros = [1, 2, 3];
    }   

    metodoTradicional() {
        console.log(this);
    }

    iterar() {
        this.numeros.forEach(function(numero) {
            console.log(this);
        });
    }
    
    //() => {} es una funcion flecha o funcion de tipo arrow
    iterarArrow() {
        this.numeros.forEach((numero) => {
            console.log(this);
        });
    }
}

functionTradicional(); 
let claseTradicional = new ClaseTradicional();
claseTradicional.metodoTradicional();
claseTradicional.iterar(); 
claseTradicional.iterarArrow();
