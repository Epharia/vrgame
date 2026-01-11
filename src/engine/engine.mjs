import * as THREE from "three";
import { CONFIG } from "../config.mjs";
import { Time } from "./time.mjs";

class EngineSingleton {
    constructor() {
        this.initialized = false;

        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.time = new Time();

        this._resize = this.#resize.bind(this);
    }

    /**
     * initializes the renderer, scene and camera once
     * and adds an resize eventListener
     */
    init() {
        if (this.initialized) return;
        this.initialized = true;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.settings.rendering.maxPixelRatio));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.scene.background);

        this.camera = new THREE.PerspectiveCamera(
            CONFIG.settings.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.settings.camera.near,
            CONFIG.settings.camera.far
        );
        this.camera.position.set(CONFIG.settings.camera.initialPosition.x, CONFIG.settings.camera.initialPosition.y, CONFIG.settings.camera.initialPosition.z);

        window.addEventListener("resize", this.#resize);
    }

    /**
     * sets the animation loop callback function for the renderer
     * @param {Function} fn - The callback function to be executed on each animation frame
     */
    setAnimationLoop(fn) {
        this.renderer.setAnimationLoop(fn);
    }

    /**
     * renders the scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    #resize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.settings.rendering.maxPixelRatio));
    }

    /**
     * disposes of the engine resources by removing event listeners and disposing of the renderer
     */
    dispose() {
        window.removeEventListener("resize", this.#resize);
        this.renderer?.dispose();
        this.initialized = false;
    }
}

export const Engine = new EngineSingleton();