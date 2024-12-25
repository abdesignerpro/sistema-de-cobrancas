import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initializeDatabase from './database/init';
import Charge from './database/models/Charge';
import Config from './database/models/Config';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.get('/config', async (req, res) => {
  try {
    const configs = await Config.findAll();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

app.get('/charges', async (req, res) => {
  try {
    const charges = await Charge.findAll();
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cobranças' });
  }
});

app.post('/charges', async (req, res) => {
  try {
    const charge = await Charge.create(req.body);
    res.status(201).json(charge);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cobrança' });
  }
});

// Inicializa o banco de dados e inicia o servidor
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar o servidor:', error);
    process.exit(1);
  });
