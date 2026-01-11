export const CONFIG = {
    colors: {
        materials: {
            floor: 0x393939,
            wall: 0x725956,
        },
        scene: {
            background: 0x050510,
        },
    },
    settings: {
        lighting: {
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
        },
        geometry: {
            floorSize: 50,
            wallHeight: 5,
            wallThickness: 2,
        },
        player: {
            height: 1.6,
            radius: 0.3,
        },
        camera: {
            fov: 70,
            near: 0.05,
            far: 200,
            initialPosition: { x: 0, y: 1.6, z: 3 },
        },
        rendering: {
            maxPixelRatio: 2,
        },
        maze: {
            startPosition: { x: 2, y: 1.6, z: 2 },
        },
        materials: {
            wallRoughness: 0.9,
            floorRoughness: 1,
        },
    },
};