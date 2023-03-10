"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
const kebabCase_1 = __importDefault(require("lodash/kebabCase"));
const process = (input) => (0, kebabCase_1.default)(input.data);
exports.process = process;
