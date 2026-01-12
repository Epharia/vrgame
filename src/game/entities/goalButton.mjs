import * as THREE from "three";
import { CONFIG } from "../../config.mjs";
import { ResourceManager } from "../../systems/resourceManager.mjs";
import { BaseEntity } from "./baseEntity.mjs";
import { Engine } from "../../engine/engine.mjs";

export class GoalButton extends BaseEntity {
    constructor(position = { x: 5, y: 1, z: 5 }) {
        super();

        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.pressed = false;
        this.buttonSize = 0.3;

        const buttonGeo = new THREE.BoxGeometry(
            this.buttonSize,
            this.buttonSize,
            this.buttonSize
        );
        const buttonMat = ResourceManager.getMaterial("goalButton", {
            color: 0xff0000,
            roughness: 0.4,
            metalness: 0.8,
            emissive: 0xff0000,
            emissiveIntensity: 0.3,
        });

        this.button = new THREE.Mesh(buttonGeo, buttonMat);
        this.button.position.copy(this.position);
        this.button.castShadow = true;
        this.button.receiveShadow = true;

        this.group.add(this.button);
        Engine.scene.add(this.group);

        this.interactionBox = new THREE.Box3().setFromObject(this.button);
    }

    /**
     * Check if a point is within interaction distance
     * @param {THREE.Vector3} point - The point to check
     * @returns {boolean} Whether the point is within interaction distance
     */
    isWithinInteractionDistance(point) {
        const distance = this.position.distanceTo(point);
        return distance <= CONFIG.settings.interact.maxDistance;
    }

    /**
     * Activate the goal button
     */
    activate() {
        if (this.pressed) return;
        this.pressed = true;
        this.onPressed();
    }

    /**
     * Callback when button is pressed
     */
    onPressed() {
        this.button.material.emissiveIntensity = 0.1;

        if (window.onGoalButtonPressed) {
            window.onGoalButtonPressed();
        }
    }

    /**
     * Gets the button's interaction point (center)
     * @returns {THREE.Vector3} The button's center position
     */
    getInteractionPoint() {
        return this.position.clone();
    }

    update(dt) {
        if (!this.pressed) {
            this.button.rotation.y += dt * 1.5;
        }
    }

    dispose() {
        super.dispose();
        Engine.scene.remove(this.group);
    }
}
