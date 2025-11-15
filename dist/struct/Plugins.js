"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugins = void 0;

const mineflayer_collectblock_1 = require("mineflayer-collectblock");
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const mineflayer_auto_eat_1 = require("mineflayer-auto-eat");
const mineflayer_pvp_1 = require("mineflayer-pvp");

// ⚠️ ARMOR MANAGER REMOVIDO – CAUSA SPAM Y ERRORES EN 1.21+
exports.plugins = [
    mineflayer_collectblock_1.plugin,
    mineflayer_pathfinder_1.pathfinder,
    mineflayer_auto_eat_1.plugin,
    mineflayer_pvp_1.plugin,
];
