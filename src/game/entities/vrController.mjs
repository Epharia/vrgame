import * as THREE from "three";
import { CONFIG } from "../../config.mjs";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";

export class VRController {
    constructor(camera, xrSession) {
        this.camera = camera;
        this.xrSession = xrSession;

        this.controller1 = null;
        this.controller2 = null;
        this.grip1 = null;
        this.grip2 = null;

        this._forward = new THREE.Vector3();
        this._move = new THREE.Vector3(0, 0, 0);
    }

    /**
     * Initializes VR controllers
     * @param {THREE.WebGLRenderer} renderer - The renderer
     */
    init(renderer) {
        //right/primary
        this.controller1 = renderer.xr.getController(0);
        this.grip1 = renderer.xr.getControllerGrip(0);

        //left/secondary
        this.controller2 = renderer.xr.getController(1);
        this.grip2 = renderer.xr.getControllerGrip(1);

        const controllerModelFactory = new XRControllerModelFactory();

        this.grip1.add(controllerModelFactory.createControllerModel(this.grip1));
        this.grip2.add(controllerModelFactory.createControllerModel(this.grip2));
    }

    /**
     * Gets the primary controller
     * @returns {THREE.XRTargetRaySpace}
     */
    getPrimaryController() {
        return this.controller1;
    }

    /**
     * Gets the secondary controller
     * @returns {THREE.XRTargetRaySpace}
     */
    getSecondaryController() {
        return this.controller2;
    }

    /**
     * Updates
     * @param {number} dt - time delta
     * @returns {THREE.Vector3} movement vector ({0,0,0} as the player blinks)
     */
    update(dt) {
        //keep this for future continuos vr controlls
        return this._move;
    }
}
