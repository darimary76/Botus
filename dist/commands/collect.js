"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CollectCommad = {
    name: "collect",
    aliases: [],
    args_definitions: [
        {
            name: "block",
            type: String,
            default: true,
        },
        {
            name: "count",
            type: Number,
            aliases: ["c", "n", "number", "limit", "l"],
        },
    ],
    master_only: true,
    execute: async ({ manager, args }) => {
        if (manager.getCollecting() ||
            manager.getFarming().farmed_at ||
            manager.getFalling() ||
            manager.getGuarding())
            return manager.bot.chat(manager.i18n.get(manager.language, "commands", "is_acting"));
        const { block, count } = args;
        if (!block)
            return manager.bot.chat(manager.i18n.get(manager.language, "commands", "enter_block_name"));
        const block_data = manager.minecraft_data?.blocksByName[block];
        if (!block_data)
            return manager.bot.chat(manager.i18n.get(manager.language, "commands", "invalid_block"));
        manager
            .collectBlock(manager, block_data.id, count)
            .then((is_collected) => {
            if (is_collected)
                manager.bot.chat(manager.i18n.get(manager.language, "commands", "blocks_collected"));
        });
    },
};
exports.default = CollectCommad;
