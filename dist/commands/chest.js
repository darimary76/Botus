"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChestCommand = {
    name: "chest",
    aliases: [],
    args_definitions: [],
    master_only: true,
    execute: ({ manager }) => {
        manager.fetchChests(manager, manager.minecraft_data);
    },
};
exports.default = ChestCommand;
