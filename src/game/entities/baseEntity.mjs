import * as THREE from "three";

export class BaseEntity {
    constructor() {
        this.group = new THREE.Group();
        this.disposed = false;
        this.id = undefined;
    }

    update(dt) { }

    dispose() {
        this.disposed = true;
    }
}
