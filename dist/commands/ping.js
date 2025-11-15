"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PingCommad = {
    name: "ping",
    aliases: ["p"],
    args_definitions: [],
    master_only: false,
    execute: ({ manager }) => {
        manager.bot.chat(manager.i18n.get(manager.language, "commands", "pong"));
    },
};
exports.default = PingCommad;
