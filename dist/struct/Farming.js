"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.farming = farming;
const config_1 = require("../config");
const vec3_1 = require("vec3");
async function farming(manager) {
    if (manager.getFarming().farmed_at) {
        if (manager.bot.inventory.slots.filter((item) => item == null).length <
            11)
            await depositLoop(manager);
        else
            await farmLoop(manager);
    }
    setTimeout(() => farming(manager), 500);
}
async function depositLoop(manager) {
    const { farming, farming_chest } = manager.getFarming();
    if (!farming_chest)
        return manager.bot.chat(manager.i18n.get(manager.language, "commands", "no_chests_found", {
            prefix: config_1.CONFIG.PREFIX,
        }));
    const chest = manager.bot.blockAt(farming_chest);
    if (!chest)
        return manager.bot.chat(manager.i18n.get(manager.language, "commands", "no_chests_found", {
            prefix: config_1.CONFIG.PREFIX,
        }));
    if (manager.bot.entity.position.distanceTo(farming_chest) < 2) {
        // didn't used pathfinder because bot destroys crops
        manager.bot.setControlState("forward", false);
        const window = await manager.bot.openChest(chest);
        for (const slot of manager.bot.inventory.items()) {
            try {
                if (slot.name == farming)
                    await deposit(window, slot);
            }
            catch (err) {
                manager.logger.error(err);
                manager.bot.chat(manager.i18n.get(manager.language, "utils", "chest_full", {
                    prefix: config_1.CONFIG.PREFIX,
                }));
                manager.setFarming();
                break;
            }
        }
        await window.close();
    }
    else {
        // didn't used pathfinder because bot destroys crops
        manager.bot.lookAt(farming_chest);
        manager.bot.setControlState("forward", true);
    }
}
async function deposit(window, slot) {
    return new Promise((resolve, reject) => {
        window.deposit(slot.type, null, slot.count).then(resolve).catch(reject);
    });
}
async function farmLoop(manager) {
    const { seed, farming } = manager.getFarming();
    const crop = manager.bot.findBlock({
        matching: (block) => {
            return block.name == farming && block.metadata == 7;
        },
    });
    if (crop) {
        manager.bot.lookAt(crop.position);
        try {
            if (manager.bot.entity.position.distanceTo(crop.position) < 2) {
                manager.bot.setControlState("forward", false);
                await manager.bot.dig(crop);
                if (!manager.bot.heldItem || manager.bot.heldItem.name != seed)
                    for (const item of manager.bot.inventory.slots) {
                        if (item && item.name === seed) {
                            await manager.bot.equip(item, "hand");
                            break;
                        }
                    }
                if (!manager.bot.heldItem)
                    return;
                const dirt = manager.bot.blockAt(crop.position.offset(0, -1, 0));
                if (!dirt)
                    return;
                await manager.bot
                    .placeBlock(dirt, new vec3_1.Vec3(0, 1, 0))
                    .catch(() => undefined); // idk why but sometimes bot places seed but throws error
            }
            else
                manager.bot.setControlState("forward", true); // didn't used pathfinder because bot destroys crops
        }
        catch (err) {
            manager.logger.error(err);
        }
    }
}
