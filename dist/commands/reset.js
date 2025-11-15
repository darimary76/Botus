"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResetCommand = {
    name: "ping",
    aliases: ["r"],
    args_definitions: [],
    master_only: true,
    execute: ({ manager }) => {
        manager.resetStates();
        manager.bot.chat(manager.i18n.get(manager.language, "commands", "reset"));
    },
};
exports.default = ResetCommand;
