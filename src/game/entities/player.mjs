import * as THREE from "three";
import { CONFIG } from "../../config.mjs";
import { FirstPersonController } from "./firstPersonController.mjs";
import { Collider } from "./collider.mjs";
import { Engine } from "../../engine/engine.mjs";
import { BaseEntity } from "./baseEntity.mjs";

export class Player extends BaseEntity {
    constructor({ camera }) {
        super();
        this.camera = camera;

        this.position = new THREE.Vector3(0, CONFIG.settings.player.height, 0);

        this.controller = new FirstPersonController(camera);
        this.collider = new Collider({ radius: CONFIG.settings.player.radius });

        this.light = new THREE.PointLight(
            CONFIG.settings.lighting.playerLight.color,
            CONFIG.settings.lighting.playerLight.intensity,
            CONFIG.settings.lighting.playerLight.distance,
            CONFIG.settings.lighting.playerLight.decay
        );

        Engine.scene.add(this.light);
    }

    setPosition(v) {
        this.position.copy(v);
        this.camera.position.copy(this.position);
    }

    /**
     * Updates the player
     * @param {number} dt - time delta
     */
    update(dt) {
        const vel = this.controller.update(dt);

        this.position.addScaledVector(vel, dt);

        this.position.y = CONFIG.settings.player.height;
        this.camera.position.copy(this.position);

        this.light.position.copy(this.camera.position).add(new THREE.Vector3(
            CONFIG.settings.lighting.playerLight.offset.x,
            CONFIG.settings.lighting.playerLight.offset.y,
            CONFIG.settings.lighting.playerLight.offset.z
        ));
    }

    dispose() {
        Engine.scene.remove(this.light);
        this.light.dispose();
    }
}
