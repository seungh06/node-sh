"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whoami = void 0;
const extension_1 = require("internal/extension");
const node_os_1 = __importDefault(require("node:os"));
const whoami = (main, ...args) => {
    const user = node_os_1.default.userInfo().username;
    return new extension_1.UnixExtension(user);
};
exports.whoami = whoami;
