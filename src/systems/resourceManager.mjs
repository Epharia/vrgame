import * as THREE from "three";

class ResourceManagerSingleton {
    constructor() {
        this.materials = new Map();
        this.geometries = new Map();
        this.textures = new Map();
        this.initialized = false;
    }

    init() {
        this.initialized = true;
    }

    /**
     * Get or create a cached material by key.
     * @param {string} key 
     * @param {MeshStandardMaterialParameters} config - Material config, e.g. { color, roughness }
     */
    getMaterial(key, config) {
        if (this.materials.has(key)) return this.materials.get(key);
        const mat = new THREE.MeshStandardMaterial(config);
        this.materials.set(key, mat);
        return mat;
    }

    /**
     * Get or create a cached geometry by key using factory.
     * @param {string} key 
     * @param {() => THREE.BufferGeometry} factory 
     */
    getGeometry(key, factory) {
        if (this.geometries.has(key)) return this.geometries.get(key);
        const geo = factory();
        this.geometries.set(key, geo);
        return geo;
    }

    dispose() {
        for (const mat of this.materials.values()) mat.dispose?.();
        for (const geo of this.geometries.values()) geo.dispose?.();
        this.materials.clear();
        this.geometries.clear();
        this.textures.clear();
        this.initialized = false;
    }
}

export const ResourceManager = new ResourceManagerSingleton();
