"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pwd = void 0;
const extension_1 = require("#internal/extension");
const path_1 = __importDefault(require("path"));
const pwd = (main, ...args) => {
    const output = path_1.default.resolve(process.cwd());
    return new extension_1.UnixExtension(output);
};
exports.pwd = pwd;
