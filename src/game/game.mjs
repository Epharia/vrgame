import * as THREE from "three";
import { CONFIG } from "../config.mjs";
import { Engine } from "../engine/engine.mjs";
import { Input } from "../systems/input.mjs";
import { Player } from "./player.mjs";
import { Maze } from "./maze.mjs";

class GameSingleton {
    constructor() {
        this.initialized = false;
        this.maze = null;
        this.player = null;
    }

    /**
     * initializes the game
     */
    init() {
        if (this.initialized) return;
        this.initialized = true;

        Engine.init();
        Input.init(Engine.renderer.domElement);

        const ambient = new THREE.AmbientLight(CONFIG.settings.lighting.ambientLight.color, CONFIG.settings.lighting.ambientLight.intensity);
        Engine.scene.add(ambient);

        const dir = new THREE.DirectionalLight(CONFIG.settings.lighting.directionalLight.color, CONFIG.settings.lighting.directionalLight.intensity);
        dir.position.set(CONFIG.settings.lighting.directionalLight.position.x, CONFIG.settings.lighting.directionalLight.position.y, CONFIG.settings.lighting.directionalLight.position.z);
        Engine.scene.add(dir);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(CONFIG.settings.geometry.floorSize, CONFIG.settings.geometry.floorSize),
            new THREE.MeshStandardMaterial({ color: CONFIG.colors.materials.floor, roughness: CONFIG.settings.materials.floorRoughness })
        );
        floor.rotation.x = -Math.PI / 2;
        Engine.scene.add(floor);

        this.maze = new Maze();
        Engine.scene.add(this.maze.group);

        this.player = new Player({
            camera: Engine.camera,
            colliders: this.maze.colliders,
        });
        this.player.setPosition(this.maze.startPosition);
    }

    /**
     * Updates the game state
     * @param {number} dt - time delta
     */
    update(dt) {
        this.player?.update(dt);
    }

    /**
     * Disposes of the game instance by cleaning up resources
     */
    dispose() {
        this.player?.dispose?.();
        this.maze?.dispose?.();
        Input.dispose();
        Engine.dispose();
        this.initialized = false;
    }
}

export const Game = new GameSingleton();