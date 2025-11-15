"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestCommand = {
    name: "test",
    aliases: [],
    args_definitions: [],
    master_only: false,
    execute: async ({ manager }) => {
        const seeds = manager.bot.inventory
            .items()
            .filter((item) => item.name === "wheat_seeds");
        manager.logger.debug(seeds.length);
    },
};
exports.default = TestCommand;
