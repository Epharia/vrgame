class InputSingleton {
    constructor() {
        this.initialized = false;

        this.keys = new Set();
        this.mouse = { dx: 0, dy: 0, locked: false };

        this._down = (e) => this.keys.add(e.code);
        this._up = (e) => this.keys.delete(e.code);

        this._move = (e) => {
            if (!this.mouse.locked) return;
            this.mouse.dx += e.movementX;
            this.mouse.dy += e.movementY;
        };

        this._plc = () => {
            this.mouse.locked = document.pointerLockElement === this.domElement;
        };

        this._click = () => {
            this.domElement?.requestPointerLock?.();
        };
    }

    /**
     * Initializes the input system by setting up event listeners for keyboard and mouse.
     * @param {HTMLElement} domElement - The DOM element to attach click event listener to.
     */
    init(domElement) {
        if (this.initialized) return;
        this.initialized = true;

        this.domElement = domElement;

        window.addEventListener("keydown", this._down);
        window.addEventListener("keyup", this._up);
        window.addEventListener("mousemove", this._move);
        document.addEventListener("pointerlockchange", this._plc);
        this.domElement.addEventListener("click", this._click);
    }

    pressed(code) {
        return this.keys.has(code);
    }

    mouseDelta() {
        const out = { dx: this.mouse.dx, dy: this.mouse.dy };
        this.mouse.dx = 0;
        this.mouse.dy = 0;
        return out;
    }

    dispose() {
        if (!this.initialized) return;
        this.initialized = false;

        window.removeEventListener("keydown", this._down);
        window.removeEventListener("keyup", this._up);
        window.removeEventListener("mousemove", this._move);
        document.removeEventListener("pointerlockchange", this._plc);
        this.domElement?.removeEventListener("click", this._click);

        this.keys.clear();
        this.domElement = null;
    }
}

export const Input = new InputSingleton();