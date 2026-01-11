import * as THREE from "three";
import { CONFIG } from "../../config.mjs";
import { ResourceManager } from "../../systems/resourceManager.mjs";
import { Engine } from "../../engine/engine.mjs";

class MazeLevel {
    constructor() {
        this.group = new THREE.Group();
        this.colliders = [];
        this.startPosition = new THREE.Vector3(
            CONFIG.settings.maze.startPosition.x,
            CONFIG.settings.maze.startPosition.y,
            CONFIG.settings.maze.startPosition.z
        );

        this.setupLighting();
        this.setupFloor();
        this.setupWalls();
    }

    setupLighting() {
        const ambient = new THREE.AmbientLight(
            CONFIG.settings.lighting.ambientLight.color,
            CONFIG.settings.lighting.ambientLight.intensity
        );
        this.group.add(ambient);

        const dir = new THREE.DirectionalLight(
            CONFIG.settings.lighting.directionalLight.color,
            CONFIG.settings.lighting.directionalLight.intensity
        );
        dir.position.set(
            CONFIG.settings.lighting.directionalLight.position.x,
            CONFIG.settings.lighting.directionalLight.position.y,
            CONFIG.settings.lighting.directionalLight.position.z
        );
        this.group.add(dir);
    }

    setupFloor() {
        const floor = new THREE.Mesh(
            ResourceManager.getGeometry("floor", () => new THREE.PlaneGeometry(
                CONFIG.settings.geometry.floorSize,
                CONFIG.settings.geometry.floorSize
            )),
            ResourceManager.getMaterial("floor", {
                color: CONFIG.colors.materials.floor,
                roughness: CONFIG.settings.materials.floorRoughness,
            })
        );
        floor.rotation.x = -Math.PI / 2;
        this.group.add(floor);
    }

    setupWalls() {
        const wallMat = ResourceManager.getMaterial("wall", {
            color: CONFIG.colors.materials.wall,
            roughness: CONFIG.settings.materials.wallRoughness
        });
        const grid = CONFIG.settings.maze.grid;
        const h = CONFIG.settings.geometry.wallHeight;
        const thickness = CONFIG.settings.geometry.wallThickness;

        for (let z = 0; z < grid.length; z++) {
            for (let x = 0; x < grid[z].length; x++) {
                if (grid[z][x] !== 1) continue;

                const wx = x * thickness;
                const wz = z * thickness;

                const { mesh, box } = this.#createWall({
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

    #createWall({ w = 1, h = 2.5, d = 1, x = 0, z = 0, material }) {
        const geoKey = `wall_${w}_${h}_${d}`;
        const mesh = new THREE.Mesh(
            ResourceManager.getGeometry(geoKey, () => new THREE.BoxGeometry(w, h, d)),
            material
        );
        mesh.position.set(x, h / 2, z);
        mesh.castShadow = false;
        mesh.receiveShadow = true;

        const box = new THREE.Box3().setFromObject(mesh);
        return { mesh, box };
    }

    dispose() {
        this.colliders.length = 0;
    }
}

/**
 * manages all world/level data and geometry
 */
class WorldSingleton {
    constructor() {
        this.initialized = false;
        this.maze = null;
        this.sceneRoot = null;
    }

    /**
     * Initializes the world system
     */
    init() {
        if (this.initialized) return;
        this.initialized = true;

        this.sceneRoot = new THREE.Group();
        Engine.scene.add(this.sceneRoot);

        this.maze = new MazeLevel();
        this.sceneRoot.add(this.maze.group);
    }

    /**
     * Gets the world's scene root group
     * @returns {THREE.Group} The root group for world objects
     */
    getRoot() {
        return this.sceneRoot;
    }

    /**
     * Gets the starting position for the player
     * @returns {THREE.Vector3} A copy of the start position
     */
    getStartPosition() {
        return this.maze.startPosition.clone();
    }

    /**
     * Gets collision data for physics resolution
     * @returns {Object} Object containing colliders array
     */
    getCollisionData() {
        return {
            colliders: this.maze.colliders,
        };
    }

    /**
     * Update method for SystemManager compatibility
     * @param {number} dt - Delta time
     */
    update(dt) {
        // empty for now
    }

    /**
     * Disposes the world and all its resources
     */
    dispose() {
        this.maze?.dispose?.();
        this.sceneRoot = null;
        this.initialized = false;
    }
}

export const World = new WorldSingleton();
