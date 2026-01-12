import * as THREE from "three";
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
        this.triggerPressed = false;
        this.vrController = null;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        HUD.init();
    }

    /**
     * Set the VR controller reference for trigger detection
     * @param {VRController} vrController - The VR controller instance
     */
    setVRController(vrController) {
        this.vrController = vrController;
    }

    /**
     * Register an interactive object
     * @param {Object} object - Object with isWithinInteractionDistance and activate methods
     */
    register(object) {
        this.interactiveObjects.push(object);
    }

    /**
     * Check if the right trigger is currently pressed
     * @returns {boolean} Whether the right trigger is pressed
     */
    isRightTriggerPressed() {
        if (!Engine.isVRActive()) return false;

        const session = Engine.renderer.xr.getSession();
        if (!session) return false;

        const inputSources = session.inputSources;
        for (const inputSource of inputSources) {
            if (inputSource.handedness === 'right' && inputSource.gamepad) {
                const gamepad = inputSource.gamepad;
                if (gamepad.buttons.length > 0 && gamepad.buttons[0]) {
                    return gamepad.buttons[0].pressed;
                }
            }
        }
        return false;
    }

    //TODO FIX this mess
    /**
     * Get the world position of the right VR controller
     * @returns {THREE.Vector3|null} The world position or null if not available
     */
    getRightControllerPosition() {
        if (!Engine.isVRActive() || !this.vrController) return null;

        const rightController = this.vrController.getSecondaryController();
        if (!rightController) return null;

        const worldPos = new THREE.Vector3();
        rightController.getWorldPosition(worldPos);
        return worldPos;
    }

    /**
     * Update interactions based on right controller position and VR trigger
     */
    update() {
        if (!this.initialized) return;

        const triggerPressed = this.isRightTriggerPressed();
        const controllerPos = this.getRightControllerPosition();

        if (!controllerPos) return;

        for (const obj of this.interactiveObjects) {
            if (!obj || !obj.isWithinInteractionDistance) continue;

            const isNear = obj.isWithinInteractionDistance(controllerPos);

            if (isNear && triggerPressed && !this.lastActivatedId.has(obj.id)) {
                this.lastActivatedId.add(obj.id);
                obj.activate();
            } else if ((!isNear || !triggerPressed) && this.lastActivatedId.has(obj.id)) {
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
