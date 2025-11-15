"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EndEvent = {
    name: "end",
    once: false,
    execute: async (manager) => {
        manager.logger.error("Bot closed");
    },
};
exports.default = EndEvent;
