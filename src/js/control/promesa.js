let promesa = new Promise((resolve, reject) => {
   setTimeout  (() => {
    if (Math.random() > 0.5) {
       resolve('Promesa resuelta');
   }  else{
       reject('Promesa rechazada');
   }
   }, 2000);
});

promesa.then((resultado) => {
    console.log("Manejo de resultado: " + resultado);
}).catch((error) => {
    console.error("Manejo de error: " + error);
}).finally(() => {
    console.log("Promesa finalizada");
});
console.log("Después de la promesa");