"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const mineflayer_pathfinder = require("mineflayer-pathfinder");
const { Movements, goals } = mineflayer_pathfinder;

exports.default = {
    name: "mine",
    aliases: [],
    master_only: false,
    args_definitions: [
        { name: "block", type: "string" },
        { name: "amount", type: "number", default: 1 },
    ],

    async execute({ manager, args }) {
        const bot = manager.bot;
        const mcData = manager.minecraft_data;

        // ---------------------------------------
        // PROCESAR INPUT (soporta block,amount)
        // ---------------------------------------
        let rawBlock = args.block;
        let rawAmount = args.amount;

        if (typeof rawBlock === "string" && rawBlock.includes(",")) {
            const parts = rawBlock.split(",");
            rawBlock = parts[0];
            rawAmount = Number(parts[1]) || 1;
        }

        if (!rawBlock) {
            bot.chat("❌ Debes especificar un bloque.");
            return;
        }

        const blockName = rawBlock.toLowerCase();
        const amount = Number(rawAmount) || 1;

        const blockInfo = mcData.blocksByName[blockName];
        if (!blockInfo) {
            bot.chat(`❌ Bloque desconocido: ${blockName}`);
            bot.chat("ℹ Ejemplos: diamond_ore, deepslate_diamond_ore, iron_ore");
            return;
        }

        bot.chat(`⛏ Minando ${amount}x ${blockName}...`);

        let mined = 0;
        const checked = new Set();

        const movements = new Movements(bot, mcData);
        movements.allowParkour = true;
        movements.allowSprinting = true;
        movements.allowScaffolding = true;
        movements.canPlaceOn = () => true;

        bot.pathfinder.setMovements(movements);

        // ----------------------------------------------------
        // 🔍 Buscar un bloque accesible REAL
        // ----------------------------------------------------
        function findAccessibleBlock() {
            const block = bot.findBlock({
                matching: blockInfo.id,
                maxDistance: 60,
            });

            if (!block) return null;

            const key = `${block.position.x},${block.position.y},${block.position.z}`;
            if (checked.has(key)) return null;

            // --------------------------------------
            // A) Revisar vecinos del bloque
            // --------------------------------------
            const neighbors = [
                bot.blockAt(block.position.offset(1, 0, 0)),
                bot.blockAt(block.position.offset(-1, 0, 0)),
                bot.blockAt(block.position.offset(0, 1, 0)),
                bot.blockAt(block.position.offset(0, -1, 0)),
                bot.blockAt(block.position.offset(0, 0, 1)),
                bot.blockAt(block.position.offset(0, 0, -1)),
            ];

            // A1 − Prisión de BEDROCK (imposible de romper)
            const allBedrock = neighbors.every(
                (b) => b && b.name === "bedrock"
            );

            if (allBedrock) {
                checked.add(key);
                return null;
            }

            // B) ¿Tiene contacto con aire/agua?
            const hasAir = neighbors.some(
                (b) => !b || b.name === "air" || b.name.includes("water")
            );

            if (hasAir) return block;

            // C) Intento final por pathfinding
            const goal = new goals.GoalNear(
                block.position.x,
                block.position.y,
                block.position.z,
                1
            );

            const path = bot.pathfinder.getPathTo(movements, goal);

            if (path && path.status !== "noPath") {
                return block;
            }

            checked.add(key);
            return null;
        }

        // ----------------------------------------------------
        // 🔄 LOOP PRINCIPAL DE MINERÍA
        // ----------------------------------------------------
        async function loop() {
            if (mined >= amount) {
                bot.chat("✔ Minado completado 🎉");
                return;
            }

            const block = findAccessibleBlock();
            if (!block) {
                bot.chat("❌ No quedan bloques accesibles.");
                return;
            }

            const key = `${block.position.x},${block.position.y},${block.position.z}`;

            // Moverse al bloque
            const goal = new goals.GoalNear(
                block.position.x,
                block.position.y,
                block.position.z,
                1
            );

            bot.pathfinder.setGoal(goal);

            await waitGoal(bot);
            await sleep(250);

            // ------------------------------
            // EQUIPO MEJOR HERRAMIENTA
            // ------------------------------
            const tool = getBestTool(bot);
            if (tool) await bot.equip(tool, "hand");

            // MINAR
            try {
                await bot.dig(block);
                mined++;
                bot.chat(`✔ Progreso: ${mined}/${amount}`);
            } catch {
                checked.add(key);
            }

            await sleep(250);
            loop();
        }

        loop();
    },
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

function waitGoal(bot) {
    return new Promise((res) => bot.once("goal_reached", res));
}

// --------------------------------------------------
// 🔧 SELECCIÓN REAL DE HERRAMIENTA (fix tierra)
// --------------------------------------------------
function getBestTool(bot) {
    const items = bot.inventory.items();

    // Lista de picos ordenada por calidad
    const pickNames = [
        "netherite_pickaxe",
        "diamond_pickaxe",
        "iron_pickaxe",
        "stone_pickaxe",
        "golden_pickaxe",
        "wooden_pickaxe"
    ];

    for (const pick of pickNames) {
        const item = items.find(i => i.name === pick);
        if (item) return item;
    }

    // Herramientas secundarias
    const fallbackTools = [
        "netherite_axe", "diamond_axe", "iron_axe", "stone_axe", "golden_axe", "wooden_axe",
        "netherite_shovel", "diamond_shovel", "iron_shovel", "stone_shovel", "golden_shovel", "wooden_shovel"
    ];

    for (const tool of fallbackTools) {
        const item = items.find(i => i.name === tool);
        if (item) return item;
    }

    return null; // mano como última opción
}
