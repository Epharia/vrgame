import { Engine } from "./engine/engine.mjs";
import { Game } from "./game/game.mjs";

Game.init();

Engine.setAnimationLoop(() => {
    const dt = Engine.time.delta();
    Game.update(dt);
    Engine.render();
});