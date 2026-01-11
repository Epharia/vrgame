import { SystemManager } from "./systems/systemManager.mjs";
import { Engine } from "./engine/engine.mjs";
import { ResourceManager } from "./systems/resourceManager.mjs";
import { Input } from "./systems/input.mjs";
import { CollisionSystem } from "./systems/collisionSystem.mjs";
import { World } from "./game/world/world.mjs";
import { Player } from "./game/entities/player.mjs";
import { EntityManager } from "./systems/entityManager.mjs";

try {
    // Systems
    SystemManager.register("Engine", Engine, []);
    SystemManager.register("ResourceManager", ResourceManager, []);
    SystemManager.register("Input", Input, ["Engine"]);
    SystemManager.register("World", World, ["Engine"]);
    SystemManager.register("CollisionSystem", CollisionSystem, []);

    SystemManager.init();

    // Init
    const player = new Player({
        camera: Engine.camera,
    });
    player.setPosition(World.getStartPosition());
    EntityManager.register(player, "Player");

    const { colliders } = World.getCollisionData();
    CollisionSystem.setWorld({ colliders });

    // Game Loop
    Engine.setAnimationLoop(() => {
        const dt = Engine.time.delta();
        SystemManager.update(dt);
        EntityManager.updateAll(dt);
        Engine.render();
    });
} catch (error) {
    console.error("Application startup failed:", error);
    document.body.innerHTML = `<p style="color: red; padding: 20px;">Failed to initialize application. Check console for details.</p>`;
}