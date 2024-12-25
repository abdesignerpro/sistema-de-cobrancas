import sequelize from './index';
import Config from './models/Config';
import Charge from './models/Charge';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  try {
    console.log('Iniciando sincronização do banco de dados...');
    
    // Sincroniza os modelos com o banco de dados
    await sequelize.sync({ force: true });
    console.log('Modelos sincronizados com sucesso!');

    // Verifica se já existem configurações
    const configCount = await Config.count();
    console.log('Número de configurações existentes:', configCount);
    
    if (configCount === 0) {
      console.log('Importando configurações do arquivo JSON...');
      // Importa configurações do arquivo JSON existente
      const configPath = path.resolve(__dirname, '../../data/api_config.json');
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Insere cada configuração no banco de dados
      for (const [key, value] of Object.entries(configData)) {
        await Config.create({
          key,
          value: String(value),
        });
        console.log(`Configuração criada: ${key} = ${value}`);
      }
      
      console.log('Configurações iniciais importadas com sucesso!');
    }

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    console.error('Detalhes do erro:', error.message);
    throw error;
  }
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

export default initializeDatabase;
