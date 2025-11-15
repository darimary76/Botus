"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorEvent = {
    name: "error",
    once: false,
    execute: async (manager, err) => {
        manager.logger.error(err);
    },
};
exports.default = ErrorEvent;
