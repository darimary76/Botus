"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { CONFIG } = require("../config");

const ChatEvent = {
    name: "chat",
    once: false,

    async execute(manager, username, message) {
        const bot = manager.bot;

        if (!message.startsWith(CONFIG.PREFIX)) return;

        // Remover el prefijo
        const raw = message.slice(CONFIG.PREFIX.length).trim();

        // Separar comando y argumentos
        const [commandName, ...rawArgs] = raw.split(/\s+/g);

        const command = manager.commands.get(commandName);
        if (!command) return;

        // Verificar permisos
        if (command.master_only && manager.getMaster().master !== username) {
            return bot.chat(
                manager.i18n.get(manager.language, "events", "master_only", {
                    prefix: CONFIG.PREFIX,
                })
            );
        }

        // ------------------------------
        // PARSEO INTELIGENTE DE ARGS
        // ------------------------------
        let parsed = {};

        try {
            // Si argumento viene como "block,amount"
            if (rawArgs.length === 1 && rawArgs[0].includes(",")) {
                const [block, amount] = rawArgs[0].split(",");
                parsed.block = block;
                parsed.amount = Number(amount) || 1;
            }

            // Si vienen separados por espacios
            else if (rawArgs.length >= 1) {
                const def = command.args_definitions || [];

                if (def[0]) parsed[def[0].name] = rawArgs[0];
                if (def[1]) parsed[def[1].name] = Number(rawArgs[1]) || 1;
            }
        } catch (e) {
            bot.chat("❌ Error procesando argumentos.");
            console.log(e);
            return;
        }

        // Ejecutar comando
        try {
            await command.execute({
                manager,
                username,
                message,
                args: parsed
            });
        } catch (err) {
            manager.logger.error(
                `Error ejecutando "${command.name}" con args "${rawArgs}"`,
                err
            );
            bot.chat(
                manager.i18n.get(manager.language, "events", "execution_error")
            );
        }
    },
};

exports.default = ChatEvent;
