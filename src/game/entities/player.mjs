import * as THREE from "three";
import { CONFIG } from "../../config.mjs";
import { FirstPersonController } from "./firstPersonController.mjs";
import { VRController } from "./vrController.mjs";
import { Collider } from "./collider.mjs";
import { Engine } from "../../engine/engine.mjs";
import { BaseEntity } from "./baseEntity.mjs";
import { BlinkTeleportSystem } from "../../systems/blinkTeleport.mjs";

export class Player extends BaseEntity {
    constructor({ camera }) {
        super();
        this.camera = camera;

        this.position = new THREE.Vector3(0, CONFIG.settings.player.height, 0);

        this.cameraRig = new THREE.Group();
        this.cameraRig.add(this.camera);
        Engine.scene.add(this.cameraRig);

        this.desktopController = new FirstPersonController(camera);
        this.vrController = null;
        this.blinkTeleport = null;
        this.activeController = this.desktopController;

        this.collider = new Collider({ radius: CONFIG.settings.player.radius });

        this.light = new THREE.PointLight(
            CONFIG.settings.lighting.playerLight.color,
            CONFIG.settings.lighting.playerLight.intensity,
            CONFIG.settings.lighting.playerLight.distance,
            CONFIG.settings.lighting.playerLight.decay
        );

        Engine.scene.add(this.light);
    }

    /**
     * Initializes VR
     */
    initVR() {
        if (!CONFIG.settings.vr.enabled) return;

        this.vrController = new VRController(this.camera);
        this.vrController.init(Engine.renderer);

        this.cameraRig.add(this.vrController.getPrimaryController());
        this.cameraRig.add(this.vrController.getSecondaryController());
        this.cameraRig.add(this.vrController.grip1);
        this.cameraRig.add(this.vrController.grip2);

        //TODO this should not be here but keep it until refactoring after final presentation
        this.blinkTeleport = new BlinkTeleportSystem(this);
    }

    /**
     * Sets collision data
     * @param {THREE.Box3[]} colliders - Array of collision boxes
     */
    setColliders(colliders) {
        if (this.blinkTeleport) {
            this.blinkTeleport.setColliders(colliders);
        }
    }

    setPosition(v) {
        this.position.copy(v);
        if (Engine.isVRActive()) {
            this.cameraRig.position.copy(this.position);
        } else {
            this.camera.position.copy(this.position);
        }
    }

    /**
     * Updates the player
     * @param {number} dt - time delta
     */
    update(dt) {
        const isVR = Engine.isVRActive();

        if (isVR && this.vrController) {
            this.activeController = this.vrController;

            //Stick (left)
            const session = Engine.renderer.xr.getSession();
            if (session && this.blinkTeleport) {
                const inputSources = session.inputSources;
                for (const inputSource of inputSources) {
                    if (inputSource.gamepad && inputSource.handedness === 'left') {
                        const gamepad = inputSource.gamepad;
                        if (gamepad.axes.length > 3 && gamepad.axes[3] < -0.5) {
                            if (!this.blinkTeleport.isActive) {
                                this.blinkTeleport.startTargeting(this.vrController.getPrimaryController());
                            }
                        } else if (this.blinkTeleport.isActive) {
                            this.blinkTeleport.stopTargeting();
                        }
                    }
                }
            }

            if (this.blinkTeleport) {
                this.blinkTeleport.update(dt, this.vrController.getPrimaryController());
            }
        } else {
            this.activeController = this.desktopController;
        }

        const vel = this.activeController.update(dt);

        if (!isVR) {
            this.position.addScaledVector(vel, dt);
            this.position.y = CONFIG.settings.player.height;
        }

        if (isVR) {
            this.cameraRig.position.copy(this.position);
        } else {
            this.camera.position.copy(this.position);
        }

        const lightPos = isVR ? this.cameraRig.position : this.camera.position;
        this.light.position.copy(lightPos).add(new THREE.Vector3(
            CONFIG.settings.lighting.playerLight.offset.x,
            CONFIG.settings.lighting.playerLight.offset.y,
            CONFIG.settings.lighting.playerLight.offset.z
        ));
    }

    dispose() {
        Engine.scene.remove(this.light);
        this.light.dispose();

        if (this.blinkTeleport) {
            this.blinkTeleport.dispose();
        }
    }
}
