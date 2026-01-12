//TODO use this when implementing interations like the experimental door opened by lever (saved in backup)
// unused for now
class EventBusSingleton {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        const arr = this.listeners.get(event);
        if (!arr) return;
        const idx = arr.indexOf(callback);
        if (idx !== -1) arr.splice(idx, 1);
        if (arr.length === 0) this.listeners.delete(event);
    }

    emit(event, data) {
        const arr = this.listeners.get(event) || [];
        for (const cb of arr) {
            try { cb(data); } catch (e) { console.error(`EventBus error for ${event}:`, e); }
        }
    }
}

export const EventBus = new EventBusSingleton();
