"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vec3_1 = require("vec3");

const MoveEvent = {
    name: "move",
    once: false,

    execute: async (manager) => {
        const bot = manager.bot;

        // ---------------------------
        // DETECCIÓN DE CAÍDA
        // ---------------------------
        if (bot.entity.velocity.y < -0.6) {
            manager.setFalling(true);

            // ---------------------------
            // DETECTAR ENTIDAD CERCANA
            // ---------------------------
            const neighbour = bot.nearestEntity();

            if (
                neighbour &&
                neighbour.displayName &&  // reemplazo de mobType
                ["Boat", "Donkey", "Horse", "Minecart"].includes(neighbour.displayName) &&
                bot.entity.position.distanceTo(neighbour.position) < 6
            ) {
                bot.mount(neighbour);
                setTimeout(bot.dismount, 100);
                return;
            }

            // ---------------------------
            // MANEJAR WATERBUCKET MLG / COLOCAR BLOQUES
            // ---------------------------
            try {
                // Equipar items útiles para frenar la caída
                for (const item of bot.inventory.slots) {
                    if (
                        item &&
                        (
                            ["water_bucket", "slime_block", "sweet_berries", "cobweb", "hay_block"]
                                .includes(item.name) ||
                            item.name.endsWith("_boat")
                        )
                    ) {
                        await bot.equip(item, "hand");
                        break;
                    }
                }

                // Mirar hacia abajo
                await bot.look(bot.entity.yaw, -Math.PI / 2, true);

                const reference = bot.blockAtCursor(5);

                if (reference && bot.heldItem) {
                    if (
                        bot.heldItem.name.endsWith("_bucket") ||
                        bot.heldItem.name.endsWith("_boat")
                    ) {
                        await bot.activateItem();
                    } else {
                        await bot.placeBlock(reference, new vec3_1.Vec3(0, 1, 0))
                            .catch(() => null);
                    }
                }

                // Volver a mirar recto
                await bot.look(bot.entity.yaw, 0);
            } catch (err) {
                manager.logger.error(err);
            }
        }

        // ---------------------------
        // SALIÓ DE LA CAÍDA
        // ---------------------------
        else if (manager.getFalling()) {
            manager.setFalling(false);

            // Intentar colocar agua al caer en un waterMLG
            const waterBlock = bot.findBlock({
                matching: [26], // water id
                maxDistance: 6,
            });

            if (!waterBlock) return;

            await bot.lookAt(waterBlock.position, true);
            await bot.activateItem();
        }
    },
};

exports.default = MoveEvent;
