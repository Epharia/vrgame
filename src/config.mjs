import { COLORS } from "./config/colors.mjs";
import { LIGHTING } from "./config/lighting.mjs";
import { GEOMETRY } from "./config/geometry.mjs";
import { PLAYER } from "./config/player.mjs";
import { CAMERA } from "./config/camera.mjs";
import { RENDERING } from "./config/rendering.mjs";
import { MAZE } from "./config/maze.mjs";
import { MATERIALS } from "./config/materials.mjs";
import { CONTROLS } from "./config/controls.mjs";
import { DOOR } from "./config/door.mjs";
import { LEVER } from "./config/lever.mjs";
import { INTERACT } from "./config/interact.mjs";

export const CONFIG = {
    colors: COLORS,
    settings: {
        lighting: LIGHTING,
        geometry: GEOMETRY,
        player: PLAYER,
        camera: CAMERA,
        rendering: RENDERING,
        maze: MAZE,
        materials: MATERIALS,
        controls: CONTROLS,
        door: DOOR,
        lever: LEVER,
        interact: INTERACT,
    },
};