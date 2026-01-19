// Configuración de bloques de deploy por red
export const DEPLOY_BLOCKS = {
    opBNBTestnet: 0n, // Buscar desde el inicio para encontrar todos los sorteos
    bscTestnet: 0n
};

// Obtener bloque de inicio para lectura de eventos
export function getDeployBlock(networkKey) {
    return DEPLOY_BLOCKS[networkKey] || 0n;
}
