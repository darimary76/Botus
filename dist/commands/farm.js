"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const FarmCommand = {
    name: "farm",
    aliases: [],
    args_definitions: [
        {
            name: "crop",
            type: String,
            default: true,
        },
        {
            name: "seed",
            type: String,
            aliases: ["s"],
        },
    ],
    master_only: true,
    execute: ({ manager, args }) => {
        if (manager.getCollecting() ||
            manager.getFalling() ||
            manager.getGuarding())
            return manager.bot.chat(manager.i18n.get(manager.language, "commands", "is_acting"));
        const farm = manager.getFarming();
        if (!farm.farmed_at) {
            const chest = manager.bot.findBlock({
                matching: manager.minecraft_data.blocksByName.chest.id,
                maxDistance: 16,
            });
            if (!chest)
                return manager.bot.chat(manager.i18n.get(manager.language, "commands", "no_chests_found", { prefix: config_1.CONFIG.PREFIX }));
            const { crop, seed } = args;
            if (!crop)
                return manager.bot.chat(manager.i18n.get(manager.language, "commands", "specify_crop"));
            const crop_data = manager.minecraft_data?.itemsByName[crop];
            if (!crop_data)
                return manager.bot.chat(manager.i18n.get(manager.language, "commands", "specify_valid_crop"));
            if (!seed)
                return manager.bot.chat(manager.i18n.get(manager.language, "commands", "specify_seed"));
            const seed_data = manager.minecraft_data?.itemsByName[seed];
            if (!seed_data)
                return manager.bot.chat(manager.i18n.get(manager.language, "commands", "specify_valid_seed"));
            manager.setFarming(crop, seed, chest.position);
            manager.bot.chat(manager.i18n.get(manager.language, "commands", "will_farm", {
                crop: crop,
                seed: seed,
            }));
        }
        else {
            manager.setFarming();
            // didn't used pathfinder because bot destroys crops
            manager.bot.setControlState("forward", false);
            const now = Date.now();
            const parsed = manager.parseMS(now - farm.farmed_at);
            manager.bot.chat(manager.i18n.get(manager.language, "commands", "wont_farm", {
                days: parsed.days.toString(),
                hours: parsed.hours.toString(),
                minutes: parsed.minutes.toString(),
                seconds: parsed.seconds.toString(),
            }));
        }
    },
};
exports.default = FarmCommand;
