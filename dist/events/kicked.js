"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KickedEvent = {
    name: "kicked",
    once: false,
    execute: async (manager, reason, logged_in) => {
        manager.logger.warning(`Kicked from server. Reason: ${reason} (${logged_in})`);
    },
};
exports.default = KickedEvent;
