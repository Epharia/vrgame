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
     * Check if a point is within interaction distance (touching the cube)
     * @param {THREE.Vector3} point - The point to check
     * @returns {boolean} Whether the point is within interaction distance
     */
    isWithinInteractionDistance(point) {
        const distance = this.position.distanceTo(point);
        // Distance should be less than button size + small margin for touching
        const touchDistance = this.buttonSize * 0.7;
        return distance <= touchDistance;
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
        // Highlight effect - full brightness
        this.button.material.emissiveIntensity = 1.0;
        this.button.material.color.setHex(0xffff00); // Change to yellow

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
        // Rotation animation - faster when not pressed
        if (!this.pressed) {
            this.button.rotation.y += dt * 1.5;
            this.button.rotation.x += dt * 0.8;
        }
    }

    dispose() {
        super.dispose();
        Engine.scene.remove(this.group);
    }
}
