"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MasterCommad = {
    name: "master",
    aliases: [],
    args_definitions: [],
    master_only: false,
    execute: ({ manager }) => {
        const { master, master_since } = manager.getMaster();
        if (master && master_since) {
            const now = Date.now();
            const parsed = manager.parseMS(now - master_since);
            manager.bot.chat(manager.i18n.get(manager.language, "commands", "slave_of", {
                master,
                days: parsed.days.toString(),
                hours: parsed.hours.toString(),
                minutes: parsed.minutes.toString(),
                seconds: parsed.seconds.toString(),
            }));
        }
        else
            manager.bot.chat(manager.i18n.get(manager.language, "commands", "bot_free"));
    },
};
exports.default = MasterCommad;
