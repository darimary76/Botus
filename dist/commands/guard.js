"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { Movements, goals } = require("mineflayer-pathfinder");

// =======================
// LISTA DE MOBS HOSTILES
// =======================
// (Nombres EXACTOS de displayName)
const HOSTILE_MOBS = new Set([
    "Zombie",
    "Husk",
    "Drowned",
    "Skeleton",        // prioridad
    "Stray",
    "Wither Skeleton", // prioridad secundaria
    "Creeper",
    "Spider",
    "Cave Spider",
    "Zombie Villager",
    "Pillager",
    "Vindicator",
    "Evoker",
    "Ravager",
    "Blaze",
    "Witch",
    "Endermite",
    "Guardian",
    "Elder Guardian",
    "Phantom",
    "Silverfish"
]);

module.exports = {
    name: "guard",
    aliases: [],
    master_only: true,
    args_definitions: [],

    async execute({ manager }) {
        const bot = manager.bot;
        const mcData = manager.minecraft_data;

        // Activar / desactivar guardia
        const guardingAt = manager.getGuarding();
        manager.setGuarding(!guardingAt);

        if (guardingAt) {
            bot.chat("🛑 Dejaré de protegerte.");
            return;
        }

        bot.chat("🛡 Ahora te protegeré de enemigos hostiles.");

        // Bucle principal
        async function guardLoop() {
            if (!manager.getGuarding()) return;

            const masterName = manager.getMaster().master;
            const masterPlayer = bot.players[masterName]?.entity;

            if (!masterPlayer) return setTimeout(guardLoop, 200);

            const masterPos = masterPlayer.position;

            // ============================
            //  1. Buscar ENEMIGO HOSTIL
            // ============================

            // PRIMERO priorizamos esqueletos
            let target = bot.nearestEntity(e =>
                e.type === "mob" &&
                e.displayName === "Skeleton" &&            // prioridad máxima
                e.position.distanceTo(bot.entity.position) < 12
            );

            // SI NO HAY ESQUELETOS, buscar cualquier mob hostil
            if (!target) {
                target = bot.nearestEntity(e =>
                    e.type === "mob" &&
                    HOSTILE_MOBS.has(e.displayName) &&
                    e.position.distanceTo(bot.entity.position) < 10
                );
            }

            // ============================
            //  2. Atacar si hay enemigo
            // ============================
            if (target) {
                // Equipar mejor arma
                const best = getBestWeapon(bot, mcData);
                if (best) await bot.equip(best, "hand");

                // Mirar al enemigo
                bot.lookAt(target.position.offset(0, target.height, 0), true);

                // Ataca con cooldown respetado
                bot.pvp.attack(target);

                return setTimeout(guardLoop, 200);
            }

            // ============================
            //  3. Si no hay enemigos: seguir al master
            // ============================
            const dist = bot.entity.position.distanceTo(masterPos);

            if (dist > 2.5) {
                const movements = new Movements(bot, mcData);

                // NO USAR BLOQUES NUNCA
                movements.allowScaffolding = false;
                movements.scaffoldingBlocks = [];

                movements.allowParkour = true;
                movements.allowSprinting = true;

                bot.pathfinder.setMovements(movements);
                bot.pathfinder.setGoal(
                    new goals.GoalNear(masterPos.x, masterPos.y, masterPos.z, 1)
                );
            }

            setTimeout(guardLoop, 200);
        }

        guardLoop();
    }
};


// ============================
// Selección de la mejor arma
// ============================
function getBestWeapon(bot, mcData) {
    const items = bot.inventory.items();
    let best = null;
    let dmg = 0;

    for (const item of items) {
        const data = mcData.itemsByName[item.name];
        if (data?.attack && data.attack > dmg) {
            dmg = data.attack;
            best = item;
        }
    }
    return best;
}
