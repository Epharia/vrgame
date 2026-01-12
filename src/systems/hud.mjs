import * as THREE from "three";
import { Engine } from "../engine/engine.mjs";

/**
 * HUD Manager for displaying messages and UI elements
 */
class HUDSingleton {
    constructor() {
        this.hudContainer = null;
        this.messageElement = null;
        this.initialized = false;
        this.vrTextMesh = null;
        this.vrTextGroup = null;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Create HUD container for desktop
        this.hudContainer = document.createElement('div');
        this.hudContainer.id = 'hud-container';
        this.hudContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(this.hudContainer);

        // Create message element for desktop
        this.messageElement = document.createElement('div');
        this.messageElement.id = 'hud-message';
        this.messageElement.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-family: Arial, sans-serif;
            letter-spacing: 2px;
        `;
        this.hudContainer.appendChild(this.messageElement);

        // Create 3D text for VR
        this.createVRText();
    }

    /**
     * Create 3D text mesh for VR display
     */
    createVRText() {
        // Create a canvas to render text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 256;

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create material with the texture
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false
        });

        // Create plane geometry
        const geometry = new THREE.PlaneGeometry(2, 0.5);
        this.vrTextMesh = new THREE.Mesh(geometry, material);

        this.vrTextMesh.renderOrder = 999;

        // Create group to position text in front of camera
        this.vrTextGroup = new THREE.Group();
        this.vrTextGroup.add(this.vrTextMesh);

        // Store canvas and context for later updates
        this.vrCanvas = canvas;
        this.vrContext = context;
    }

    /**
     * Update VR text canvas with message
     */
    updateVRText(message) {
        const context = this.vrContext;
        const canvas = this.vrCanvas;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (message) {
            // Draw text
            context.font = 'bold 80px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.shadowColor = 'rgba(0, 0, 0, 0.7)';
            context.shadowBlur = 10;
            context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;
            context.fillText(message, canvas.width / 2, canvas.height / 2);
        }

        // Update texture
        this.vrTextMesh.material.map.needsUpdate = true;
    }

    /**
     * Display a message on the HUD
     * @param {string} message - The message to display
     * @param {number} duration - How long to display the message in milliseconds (0 = permanent)
     */
    displayMessage(message, duration = 3000) {
        if (!this.initialized) this.init();

        const isVR = Engine.isVRActive();

        if (isVR) {
            // Display in VR
            this.updateVRText(message);

            // Position text in front of camera
            if (!this.vrTextGroup.parent) {
                Engine.camera.add(this.vrTextGroup);
            }
            this.vrTextGroup.position.set(0, 0, -2);

            // Fade in
            this.vrTextMesh.material.opacity = 1;

            if (duration > 0) {
                setTimeout(() => {
                    // Fade out
                    this.vrTextMesh.material.opacity = 0;
                    setTimeout(() => {
                        this.updateVRText('');
                    }, 300);
                }, duration);
            }
        } else {
            // Display on desktop
            this.messageElement.textContent = message;
            this.messageElement.style.opacity = '1';

            if (duration > 0) {
                setTimeout(() => {
                    this.messageElement.style.opacity = '0';
                }, duration);
            }
        }
    }

    /**
     * Clear the HUD message
     */
    clearMessage() {
        this.messageElement.style.opacity = '0';
        setTimeout(() => {
            this.messageElement.textContent = '';
        }, 300);

        if (this.vrTextMesh) {
            this.vrTextMesh.material.opacity = 0;
            setTimeout(() => {
                this.updateVRText('');
            }, 300);
        }
    }

    dispose() {
        if (this.hudContainer && this.hudContainer.parentNode) {
            this.hudContainer.parentNode.removeChild(this.hudContainer);
        }

        if (this.vrTextGroup && this.vrTextGroup.parent) {
            this.vrTextGroup.parent.remove(this.vrTextGroup);
        }

        if (this.vrTextMesh) {
            this.vrTextMesh.geometry.dispose();
            this.vrTextMesh.material.map.dispose();
            this.vrTextMesh.material.dispose();
        }

        this.hudContainer = null;
        this.messageElement = null;
        this.vrTextMesh = null;
        this.vrTextGroup = null;
        this.vrCanvas = null;
        this.vrContext = null;
        this.initialized = false;
    }
}

export const HUD = new HUDSingleton();
