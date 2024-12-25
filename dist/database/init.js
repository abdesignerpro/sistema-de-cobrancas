"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const Config_1 = __importDefault(require("./models/Config"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Iniciando sincronização do banco de dados...');
            // Sincroniza os modelos com o banco de dados
            yield index_1.default.sync({ force: true });
            console.log('Modelos sincronizados com sucesso!');
            // Verifica se já existem configurações
            const configCount = yield Config_1.default.count();
            console.log('Número de configurações existentes:', configCount);
            if (configCount === 0) {
                console.log('Importando configurações do arquivo JSON...');
                // Importa configurações do arquivo JSON existente
                const configPath = path_1.default.resolve(__dirname, '../../data/api_config.json');
                const configData = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
                // Insere cada configuração no banco de dados
                for (const [key, value] of Object.entries(configData)) {
                    yield Config_1.default.create({
                        key,
                        value: String(value),
                    });
                    console.log(`Configuração criada: ${key} = ${value}`);
                }
                console.log('Configurações iniciais importadas com sucesso!');
            }
            console.log('Banco de dados inicializado com sucesso!');
        }
        catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
            console.error('Detalhes do erro:', error.message);
            throw error;
        }
    });
}
// Executa a inicialização se este arquivo for executado diretamente
if (require.main === module) {
    initializeDatabase()
        .then(() => {
        console.log('Inicialização completa!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Falha na inicialização:', error);
        process.exit(1);
    });
}
exports.default = initializeDatabase;
