import * as THREE from "three";
import { Input } from "../systems/input.mjs";

export class FirstPersonController {
    constructor(camera) {
        this.camera = camera;

        this.yaw = 0;
        this.pitch = 0;

        this.sensitivity = 0.002;
        this.maxPitch = Math.PI / 2 - 0.1;

        this.moveSpeed = 3.0;

        this._forward = new THREE.Vector3();
        this._right = new THREE.Vector3();
        this._up = new THREE.Vector3(0, 1, 0);
        this._move = new THREE.Vector3();
    }

    /**
     * Updates the camera rotation and calculates the movement vector
     * 
     * @param {number} dt - time delta
     * @returns {THREE.Vector3} the calculated movement vector for the controller
     */
    update(dt) {
        const { dx, dy } = Input.mouseDelta();
        this.yaw -= dx * this.sensitivity;
        this.pitch -= dy * this.sensitivity;
        this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));
        this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");

        const forwardInput =
            (Input.pressed("KeyW") ? 1 : 0) - (Input.pressed("KeyS") ? 1 : 0);
        const strafeInput =
            (Input.pressed("KeyD") ? 1 : 0) - (Input.pressed("KeyA") ? 1 : 0);

        this.camera.getWorldDirection(this._forward);
        this._forward.y = 0;
        this._forward.normalize();

        this._right.crossVectors(this._forward, this._up).normalize();

        this._move.set(0, 0, 0);
        this._move.addScaledVector(this._forward, forwardInput);
        this._move.addScaledVector(this._right, strafeInput);

        if (this._move.lengthSq() > 0) this._move.normalize();
        this._move.multiplyScalar(this.moveSpeed);

        return this._move;
    }
}
