"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const config_1 = require("../config");
class Utils {
    master;
    master_since;
    followed_at;
    collected_at;
    fall_at;
    guard_at;
    farming;
    seed;
    farmed_at;
    farming_chest;
    getFarming() {
        const { farming, farmed_at, seed, farming_chest } = this;
        return { farming, farmed_at, seed, farming_chest };
    }
    setFarming(farming, seed, farming_chest) {
        this.farming = farming;
        this.seed = seed;
        this.farming_chest = farming_chest;
        this.farmed_at = farming ? Date.now() : undefined;
    }
    getMaster() {
        const { master, master_since } = this;
        return { master, master_since };
    }
    getFollowing() {
        return this.followed_at;
    }
    getGuarding() {
        return this.guard_at;
    }
    getCollecting() {
        return this.collected_at;
    }
    getFalling() {
        return this.fall_at;
    }
    setMaster(master) {
        this.master = master;
        this.master_since = master ? Date.now() : undefined;
    }
    setFollowing(is_following) {
        this.followed_at = is_following ? Date.now() : undefined;
    }
    setGuarding(is_following) {
        this.guard_at = is_following ? Date.now() : undefined;
    }
    setCollecting(is_collecting) {
        this.collected_at = is_collecting ? Date.now() : undefined;
    }
    setFalling(is_falling) {
        this.fall_at = is_falling ? Date.now() : undefined;
    }
    parseMS(ms) {
        return {
            days: Math.trunc(ms / 86400000),
            hours: Math.trunc(ms / 3600000) % 24,
            minutes: Math.trunc(ms / 60000) % 60,
            seconds: Math.trunc(ms / 1000) % 60,
            milliseconds: Math.trunc(ms) % 1000,
            microseconds: Math.trunc(ms * 1000) % 1000,
            nanoseconds: Math.trunc(ms * 1e6) % 1000,
        };
    }
    collectBlock(manager, blockID, count) {
        const limit = count || 1;
        return new Promise((resolve, reject) => {
            const blocks = manager.bot.findBlocks({
                matching: blockID,
                maxDistance: 64,
                count: limit,
            });
            if (blocks.length < 1) {
                manager.bot.chat(manager.i18n.get(manager.language, "utils", "no_blocks_nearby"));
                resolve(false);
            }
            else {
                const targets = [];
                for (let i = 0; i < Math.min(blocks.length, limit); i++) {
                    targets.push(manager.bot.blockAt(blocks[i]));
                }
                manager.bot.chat(manager.i18n.get(manager.language, "utils", "found_blocks", {
                    count: targets.length.toString(),
                }));
                manager.setCollecting(true);
                manager.bot.collectBlock.collect(targets.filter(t => t !== null), (err) => {
                    manager.setCollecting(false);
                    if (err) {
                        reject(err);
                    }
                    else
                        resolve(true);
                });
            }
        });
    }
    fetchChests(manager, minecraft_data) {
        manager.bot.collectBlock.chestLocations = manager.bot.findBlocks({
            matching: minecraft_data.blocksByName.chest.id,
            maxDistance: 32,
            count: 999999,
        });
        if (manager.bot.collectBlock.chestLocations && manager.bot.collectBlock.chestLocations.length)
            manager.bot.chat(manager.i18n.get(manager.language, "utils", "no_chest_found", {
                prefix: config_1.CONFIG.PREFIX,
            }));
        else
            manager.bot.chat(manager.i18n.get(manager.language, "utils", "found_chest", {
                count: manager.bot.collectBlock.chestLocations.length.toString(),
            }));
    }
    resetStates() {
        this.setCollecting(false);
        this.setFalling(false);
        this.setFollowing(false);
        this.setGuarding(false);
        this.setFarming();
    }
    reset() {
        this.resetStates();
        this.setMaster();
    }
}
exports.Utils = Utils;
