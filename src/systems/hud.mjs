/**
 * HUD Manager for displaying messages and UI elements
 */
class HUDSingleton {
    constructor() {
        this.hudContainer = null;
        this.messageElement = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Create HUD container
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

        // Create message element
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
    }

    /**
     * Display a message on the HUD
     * @param {string} message - The message to display
     * @param {number} duration - How long to display the message in milliseconds (0 = permanent)
     */
    displayMessage(message, duration = 3000) {
        if (!this.initialized) this.init();

        this.messageElement.textContent = message;
        this.messageElement.style.opacity = '1';

        if (duration > 0) {
            setTimeout(() => {
                this.messageElement.style.opacity = '0';
            }, duration);
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
    }

    dispose() {
        if (this.hudContainer && this.hudContainer.parentNode) {
            this.hudContainer.parentNode.removeChild(this.hudContainer);
        }
        this.hudContainer = null;
        this.messageElement = null;
        this.initialized = false;
    }
}

export const HUD = new HUDSingleton();
