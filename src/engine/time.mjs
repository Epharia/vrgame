export class Time {
    //TODO imporve if needed outside of dt
    constructor() {
        this.last = performance.now();
    }

    /**
     * calculates the time delta since the last call, capped at 0.05 seconds to prevent large jumps
     * @returns {number} time delta in seconds
     */
    delta() {
        const now = performance.now();
        const dt = (now - this.last) / 1000;
        this.last = now;
        return Math.min(dt, 0.05);
    }
}