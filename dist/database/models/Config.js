"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("../index"));
class Config extends sequelize_1.Model {
}
Config.init({
    key: {
        type: sequelize_1.DataTypes.STRING(50),
        primaryKey: true,
    },
    value: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: index_1.default,
    modelName: 'Config',
    tableName: 'configs',
});
exports.default = Config;
