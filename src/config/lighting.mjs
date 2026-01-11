export const LIGHTING = {
    ambientLight: {
        color: 0x0000FF,
        intensity: 0.1,
    },
    directionalLight: {
        color: 0xDDDDFF,
        intensity: 0.2,
        position: { x: 5, y: 10, z: 5 },
    },
    playerLight: {
        color: 0xffffff,
        intensity: 1.2,
        distance: 12,
        decay: 2,
        offset: { x: 0, y: 0, z: 0 },
    },
};
