"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)();
const BOT_OPTIONS = {
    host: "127.0.0.1",
    username: "ppupy",
    port: 60914,
    version: "1.12.2",
};
const VIEWER_OPTIONS = {
    firstPerson: false,
    port: 3000,
    viewDistance: 8,
};
const INVENTORY_VIEWER_OPTION = {
    port: 3001,
};
exports.CONFIG = {
    BOT_OPTIONS,
    VIEWER_OPTIONS,
    INVENTORY_VIEWER_OPTION,
    PREFIX: "!",
    STATE_MACHINE_PORT: 3002,
    LOCALE_PARSER_OPTIONS: {
        directory: (0, path_1.join)(__dirname, "locales"),
        defaultLocale: "en",
    },
};
