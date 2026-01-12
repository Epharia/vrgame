import { Engine } from "../engine/engine.mjs";
import { EntityManager } from "./entityManager.mjs";
import { HUD } from "./hud.mjs";

/**
 * InteractionSystem for detecting and handling player interactions with interactive objects
 */
class InteractionSystemSingleton {
    constructor() {
        this.initialized = false;
        this.interactiveObjects = [];
        this.lastActivatedId = new Set();
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        HUD.init();
    }

    /**
     * Register an interactive object
     * @param {Object} object - Object with isWithinInteractionDistance and activate methods
     */
    register(object) {
        this.interactiveObjects.push(object);
    }

    /**
     * Update interactions based on player position
     * @param {THREE.Vector3} playerPosition - Current player position
     */
    update(playerPosition) {
        if (!this.initialized) return;

        for (const obj of this.interactiveObjects) {
            if (!obj || !obj.isWithinInteractionDistance) continue;

            const isNear = obj.isWithinInteractionDistance(playerPosition);

            if (isNear && !this.lastActivatedId.has(obj.id)) {
                this.lastActivatedId.add(obj.id);
                obj.activate();
            } else if (!isNear && this.lastActivatedId.has(obj.id)) {
                this.lastActivatedId.delete(obj.id);
            }
        }
    }

    /**
     * Unregister an interactive object
     * @param {Object} object - Object to unregister
     */
    unregister(object) {
        const idx = this.interactiveObjects.indexOf(object);
        if (idx !== -1) {
            this.interactiveObjects.splice(idx, 1);
            this.lastActivatedId.delete(object.id);
        }
    }

    dispose() {
        this.interactiveObjects.length = 0;
        this.lastActivatedId.clear();
        HUD.dispose();
        this.initialized = false;
    }
}

export const InteractionSystem = new InteractionSystemSingleton();
