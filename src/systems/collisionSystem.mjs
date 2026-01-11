import { EntityManager } from "./entityManager.mjs";

/**
 * CollisionSystem for centralized collision resolution.
 * Handles all physics-based collision detection and response
 */
class CollisionSystemSingleton {
    constructor() {
        this.initialized = false;
        this.colliders = null;
    }

    /**
     * Initializes the collision system
     */
    init() {
        if (this.initialized) return;
        this.initialized = true;
    }

    /**
     * Sets the collision data (colliders array)
     * @param {Object} levelData - Object with colliders array
     */
    setWorld(levelData) {
        if (levelData?.colliders) {
            this.colliders = levelData.colliders;
        }
    }

    /**
     * Resolves collision for a single entity
     * @param {Object} entity - Entity with position and collider properties
     */
    resolve(entity) {
        if (!entity.collider || !this.colliders) return;

        entity.collider.resolve(entity.position, this.colliders);
    }

    /**
     * Automatically resolves collisions for all entities with colliders
     * @param {number} dt - Delta time
     */
    update(dt) {
        if (!this.colliders) return;

        const entities = EntityManager.getAll();
        for (const entity of entities) {
            if (entity.collider && entity.position) {
                this.resolve(entity);
            }
        }
    }

    /**
     * Disposes the collision system
     */
    dispose() {
        this.colliders = null;
        this.initialized = false;
    }
}

export const CollisionSystem = new CollisionSystemSingleton();
