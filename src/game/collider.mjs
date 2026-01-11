import * as THREE from "three";

export class Collider {
    constructor({ radius = 0.3 } = {}) {
        this.radius = radius;
        this._closest = new THREE.Vector3();
    }

    /**
     * Resolves collisions by adjusting the position to avoid overlapping with colliders.
     * For each collider box, it calculates the closest point on the box to the current position,
     * checks if the distance is less than the collider's radius, and pushes the position away
     * along the vector from the closest point to the position.
     * @param {THREE.Vector3} position - The current position vector to resolve collisions for.
     * @param {THREE.Box3[]} colliders - An array of bounding boxes representing colliders.
     */
    resolve(position, colliders) {
        for (const box of colliders) {
            box.clampPoint(position, this._closest);

            const dx = position.x - this._closest.x;
            const dz = position.z - this._closest.z;
            const dist2 = dx * dx + dz * dz;

            if (dist2 < this.radius * this.radius) {
                const dist = Math.sqrt(dist2) || 0.0001;
                const push = this.radius - dist;

                position.x += (dx / dist) * push;
                position.z += (dz / dist) * push;
            }
        }
    }
}