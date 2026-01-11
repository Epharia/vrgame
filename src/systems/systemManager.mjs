/**
 * SystemManager for centralized system lifecycle and dependency management
 * Enables scalable system architecture with proper initialization order and dependency resolution
 */
class SystemManagerSingleton {
    constructor() {
        this.systems = new Map();
        this.systemOrder = [];
        this.initialized = false;
    }

    /**
     * Registers a system with the manager
     * @param {string} name - Unique identifier for the system
     * @param {Object} system - The system object (must have init, update, dispose methods)
     * @param {Array<string>} [dependencies=[]] - Names of systems this depends on
     * @returns {SystemManager} Returns this for chaining
     */
    register(name, system, dependencies = []) {
        if (this.systems.has(name)) {
            console.warn(`System "${name}" is already registered`);
            return this;
        }

        this.systems.set(name, {
            name,
            system,
            dependencies: new Set(dependencies),
            initialized: false,
        });

        return this;
    }

    /**
     * Gets a registered system
     * @param {string} name - The system name
     * @returns {Object|null} The system or null if not found
     */
    getSystem(name) {
        const entry = this.systems.get(name);
        return entry ? entry.system : null;
    }

    /**
     * Checks if a system is registered
     * @param {string} name - The system name
     * @returns {boolean} True if registered
     */
    has(name) {
        return this.systems.has(name);
    }

    /**
     * Initializes all systems in dependency order
     * @throws {Error} If circular dependencies or missing dependencies are detected
     */
    init() {
        if (this.initialized) {
            console.warn("SystemManager already initialized");
            return;
        }

        this.systemOrder = this.#topologicalSort();

        for (const name of this.systemOrder) {
            const entry = this.systems.get(name);
            if (!entry) continue;

            try {
                const deps = Array.from(entry.dependencies).map((depName) => {
                    const dep = this.systems.get(depName);
                    if (!dep) {
                        throw new Error(`System "${name}" depends on "${depName}" which is not registered`);
                    }
                    return dep.system;
                });

                if (entry.system.init) {
                    entry.system.init(...deps);
                }

                entry.initialized = true;
            } catch (error) {
                console.error(`Failed to initialize system "${name}":`, error);
                throw error;
            }
        }

        this.initialized = true;
    }

    /**
     * Updates all systems in order
     * @param {number} dt - Delta time
     */
    update(dt) {
        if (!this.initialized) {
            console.warn("SystemManager not initialized");
            return;
        }

        for (const name of this.systemOrder) {
            const entry = this.systems.get(name);
            if (entry?.system.update && entry.initialized) {
                entry.system.update(dt);
            }
        }
    }

    /**
     * Disposes all systems in reverse order
     */
    dispose() {
        for (let i = this.systemOrder.length - 1; i >= 0; i--) {
            const name = this.systemOrder[i];
            const entry = this.systems.get(name);

            if (entry?.system.dispose && entry.initialized) {
                try {
                    entry.system.dispose();
                    entry.initialized = false;
                } catch (error) {
                    console.error(`Error disposing system "${name}":`, error);
                }
            }
        }

        this.initialized = false;
    }

    /**
     * Performs topological sort on system dependencies
     * @private
     * @returns {Array<string>} Ordered system names
     * @throws {Error} If circular dependencies are detected
     */
    #topologicalSort() {
        const visited = new Set();
        const visiting = new Set();
        const result = [];

        const visit = (name) => {
            if (visited.has(name)) return;
            if (visiting.has(name)) {
                throw new Error(`Circular dependency detected involving system "${name}"`);
            }

            visiting.add(name);

            const entry = this.systems.get(name);
            if (entry) {
                for (const depName of entry.dependencies) {
                    if (!this.systems.has(depName)) {
                        throw new Error(`System "${name}" depends on unknown system "${depName}"`);
                    }
                    visit(depName);
                }
            }

            visiting.delete(name);
            visited.add(name);
            result.push(name);
        };

        for (const name of this.systems.keys()) {
            visit(name);
        }

        return result;
    }

    /**
     * Gets all registered system names
     * @returns {Array<string>} Array of system names
     */
    getSystemNames() {
        return Array.from(this.systems.keys());
    }

    /**
     * Gets initialization order
     * @returns {Array<string>} Array of system names in initialization order
     */
    getInitOrder() {
        return [...this.systemOrder];
    }

    /**
     * Resets the manager state
     */
    reset() {
        this.systems.clear();
        this.systemOrder = [];
        this.initialized = false;
    }
}

export const SystemManager = new SystemManagerSingleton();
