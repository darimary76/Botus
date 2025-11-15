"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ComeCommand = {
    name: "come",
    aliases: [],
    args_definitions: [],
    master_only: true,
    execute: async ({ manager, username }) => {
        if (manager.getFollowing())
            return manager.bot.chat(manager.i18n.get(manager.language, "commands", "already_following"));
        if (manager.getCollecting() ||
            manager.getFalling() ||
            manager.getFarming().farmed_at ||
            manager.getGuarding())
            return manager.bot.chat(manager.i18n.get(manager.language, "commands", "is_acting"));
        const target = manager.bot.players[username]
            ? manager.bot.players[username].entity
            : undefined;
        if (!target) {
            manager.bot.chat(manager.i18n.get(manager.language, "commands", "dont_see"));
            return;
        }
        manager.bot.chat(manager.i18n.get(manager.language, "commands", "coming"));
        await manager.goTo(target.position);
        manager.bot.chat(manager.i18n.get(manager.language, "commands", "here_it_is"));
    },
};
exports.default = ComeCommand;
