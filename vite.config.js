import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
    base: "/vrgame/",
    plugins: [basicSsl()],
    // server: {
    //     host: true,
    //     port: 5173,
    //     strictPort: true,
    //     https: true,
    //     hmr: {
    //         protocol: "wss",
    //     },
    // },
    build: {
        chunkSizeWarningLimit: 1000,
    },
});