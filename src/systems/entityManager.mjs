/**
 * EntityManager for centralized entity lifecycle and organization system
 */
class EntityManagerSingleton {
    constructor() {
        this.entities = new Map();
        this.entitiesByType = new Map();
        this._nextId = 0;
    }

    /**
     * Registers an entity in the manager
     * @param {Object} entity - The entity to register (must have id, update, dispose methods)
     * @param {string} type - The type/class name of the entity for categorization
     * @returns {number} The assigned entity ID
     */
    register(entity, type) {
        if (!entity.id) {
            entity.id = this._nextId++;
        }

        this.entities.set(entity.id, entity);

        if (!this.entitiesByType.has(type)) {
            this.entitiesByType.set(type, []);
        }
        this.entitiesByType.get(type).push(entity);

        return entity.id;
    }

    /**
     * Unregisters an entity from the manager
     * @param {Object|number} entityOrId - The entity object or its ID
     */
    unregister(entityOrId) {
        const id = typeof entityOrId === "number" ? entityOrId : entityOrId.id;
        const entity = this.entities.get(id);

        if (!entity) return;

        for (const [type, entities] of this.entitiesByType.entries()) {
            const idx = entities.indexOf(entity);
            if (idx !== -1) {
                entities.splice(idx, 1);
                if (entities.length === 0) {
                    this.entitiesByType.delete(type);
                }
            }
        }

        this.entities.delete(id);
    }

    /**
     * Gets all entities
     * @returns {Array} Array of all entities
     */
    getAll() {
        return Array.from(this.entities.values());
    }

    /**
     * Gets entities by type
     * @param {string} type - The type to filter by
     * @returns {Array} Array of entities of the specified type
     */
    getByType(type) {
        return this.entitiesByType.get(type) || [];
    }

    /**
     * Gets a single entity by ID
     * @param {number} id - The entity ID
     * @returns {Object|null} The entity or null if not found
     */
    getById(id) {
        return this.entities.get(id) || null;
    }

    /**
     * Gets entity count
     * @param {string} [type] - Optional type filter
     * @returns {number} Count of entities (or entities of type if specified)
     */
    count(type) {
        if (type) {
            return (this.entitiesByType.get(type) || []).length;
        }
        return this.entities.size;
    }

    /**
     * Updates all entities
     * @param {number} dt - Delta time
     */
    updateAll(dt) {
        for (const entity of this.entities.values()) {
            if (entity.update && !entity.disposed) {
                entity.update(dt);
            }
        }
    }

    /**
     * Disposes all entities and clears the manager
     */
    disposeAll() {
        const entitiesToDispose = Array.from(this.entities.values());

        for (const entity of entitiesToDispose) {
            if (entity.dispose && !entity.disposed) {
                entity.dispose();
            }
        }

        this.clear();
    }

    /**
     * Clears all entity data without disposal
     */
    clear() {
        this.entities.clear();
        this.entitiesByType.clear();
        this._nextId = 0;
    }
}

export const EntityManager = new EntityManagerSingleton();
