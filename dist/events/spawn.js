"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ❌ SE QUITÓ prismarine-viewer
// const prismarine_viewer_1 = require("prismarine-viewer");

const config_1 = require("../config");
const root_1 = require("../states/root");
const minecraft_data_1 = __importDefault(require("minecraft-data"));
const Farming_1 = require("../struct/Farming");

// ❌ SE QUITÓ MINEFLAYER WEB INVENTORY
// const mineflayer_web_inventory_1 = __importDefault(require("mineflayer-web-inventory"));

const SpawnEvent = {
    name: "spawn",
    once: true,
    execute: async (manager) => {
        // reset everything on spawn
        manager.reset();
        manager.minecraft_data = (0, minecraft_data_1.default)(manager.bot.version);

        // ❌ viewer DESACTIVADO
        // (0, prismarine_viewer_1.mineflayer)(manager.bot, config_1.CONFIG.VIEWER_OPTIONS);

        // ❌ web inventory viewer DESACTIVADO
        // (0, mineflayer_web_inventory_1.default)(manager.bot, config_1.CONFIG.INVENTORY_VIEWER_OPTION);

        (0, root_1.create_root_state)(manager);
        manager.fetchChests(manager, manager.minecraft_data);

        // physicsTick doesn't works and this one looks kinda messy. Might be changed in the future
        (0, Farming_1.farming)(manager);

        manager.logger.success("Bot successfully spawned");
    },
};
exports.default = SpawnEvent;
