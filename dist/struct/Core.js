"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();

Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;

const { I18n } = require("@hammerhq/localization");
const { Logger } = require("@hammerhq/logger");
const { readdirSync } = require("fs");
const { createBot } = require("mineflayer");
const path = require("path");
const { CONFIG } = require("../config");
const { plugins } = require("./Plugins");
const { Utils } = require("./Utils");

const { Movements, goals } = require("mineflayer-pathfinder");

class Core extends Utils {

    bot;
    minecraft_data;
    language = CONFIG.LOCALE_PARSER_OPTIONS.defaultLocale;
    logger = new Logger("[Mineflayer]:");
    commands = new Map();
    i18n = new I18n(CONFIG.LOCALE_PARSER_OPTIONS);

    constructor() {
        super();

        this.bot = createBot({
            ...CONFIG.BOT_OPTIONS
        });

        this.bot.loadPlugins(plugins);

        // Bind fixes
        this.isActing = this.isActing.bind(this);
        this.goTo = this.goTo.bind(this);
    }

    // -------------------------------
    // ESTADOS
    // -------------------------------
    isMoving() {
        try {
            return (
                this.bot.pathfinder?.isMoving() ||
                this.bot.pathfinder?.isBuilding() ||
                this.bot.pathfinder?.isMining()
            );
        } catch {
            return false;
        }
    }

    isOnState() {
        try {
            return (
                !!this.getFarming?.().farmed_at ||
                !!this.getCollecting?.() ||
                !!this.getGuarding?.() ||
                !!this.getFollowing?.()
            );
        } catch {
            return false;
        }
    }

    isActing() {
        return this.isMoving() || this.isOnState();
    }

    // --------------------------------------------------------
    //  goTo() — FALTA EN TU CORE ORIGINAL  (AQUÍ YA ESTÁ)
    // --------------------------------------------------------
    async goTo(vec) {
        return new Promise((resolve) => {
            const mcData = this.minecraft_data;
            const movements = new Movements(this.bot, mcData);

            movements.allowParkour = true;
            movements.allowSprinting = true;
            movements.allowScaffolding = true;
            movements.canPlaceOn = () => true;

            this.bot.pathfinder.setMovements(movements);

            const goal = new goals.GoalNear(vec.x, vec.y, vec.z, 1);
            this.bot.pathfinder.setGoal(goal);

            const listener = () => {
                this.bot.removeListener("goal_reached", listener);
                resolve();
            };

            this.bot.on("goal_reached", listener);
        });
    }

    // -------------------------------
    // LOADERS
    // -------------------------------
    async commanLoader() {
        this.logger.event("Loading commands");
        const files = readdirSync(path.resolve(__dirname, "..", "commands"));

        for (const file of files) {
            const command = (await Promise.resolve(path.resolve(__dirname, "..", "commands", file)).then(s => __importStar(require(s)))).default;

            if (!Array.isArray(command.aliases)) command.aliases = [];

            this.commands.set(command.name, command);
            for (const alias of command.aliases) {
                this.commands.set(alias, command);
            }

            this.logger.success(`Command ${command.name} loaded!`);
        }
    }

    async eventLoader() {
        this.logger.event("Loading events");
        const files = readdirSync(path.resolve(__dirname, "..", "events"));

        for (const file of files) {
            const event = (await Promise.resolve(path.resolve(__dirname, "..", "events", file)).then(s => __importStar(require(s)))).default;

            this.bot[event.once ? "once" : "on"](event.name, (...args) =>
                event.execute(this, ...args)
            );

            this.logger.success(`Event ${event.name} loaded!`);
        }
    }

    async init() {
        await this.commanLoader();
        await this.eventLoader();
        this.logger.success("All files loaded!");
    }
}

exports.Core = Core;
