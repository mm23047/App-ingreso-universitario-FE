export const notificar = (msg, ms = 4000, tipo = 'info') =>
    document.querySelector('app-toast')?.show(msg, ms, tipo);
