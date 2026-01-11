import * as THREE from "three";
import { CONFIG } from "../config.mjs";

export class Maze {
    constructor() {
        this.group = new THREE.Group();
        this.colliders = [];

        this.startPosition = new THREE.Vector3(CONFIG.settings.maze.startPosition.x, CONFIG.settings.maze.startPosition.y, CONFIG.settings.maze.startPosition.z);

        const wallMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.materials.wall, roughness: CONFIG.settings.materials.wallRoughness });

        // 0 = air, 1 = wall
        const grid = [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1],
        ];

        const h = CONFIG.settings.geometry.wallHeight;
        const thickness = CONFIG.settings.geometry.wallThickness;

        for (let z = 0; z < grid.length; z++) {
            for (let x = 0; x < grid[z].length; x++) {
                if (grid[z][x] !== 1) continue;

                const wx = x * thickness;
                const wz = z * thickness;

                const { mesh, box } = createWall({
                    w: thickness,
                    h,
                    d: thickness,
                    x: wx,
                    z: wz,
                    material: wallMat,
                });

                this.group.add(mesh);
                this.colliders.push(box);
            }
        }
    }
}

/**
 * Creates a wall mesh with a bounding box
 * 
 * @param {Object} options - The options for creating the wall.
 * @param {number} [options.w=1] - The width of the wall.
 * @param {number} [options.h=2.5] - The height of the wall.
 * @param {number} [options.d=1] - The depth of the wall.
 * @param {number} [options.x=0] - The x-coordinate position of the wall.
 * @param {number} [options.z=0] - The z-coordinate position of the wall.
 * @param {THREE.Material} options.material - The material to apply to the wall mesh.
 * @returns {Object} An object containing the mesh and its bounding box.
 * @returns {THREE.Mesh} mesh - The Three.js mesh representing the wall.
 * @returns {THREE.Box3} box - The bounding box of the mesh.
 */
function createWall({ w = 1, h = 2.5, d = 1, x = 0, z = 0, material }) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        material
    );
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    const box = new THREE.Box3().setFromObject(mesh);
    return { mesh, box };
}