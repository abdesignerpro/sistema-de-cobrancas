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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Cobranças está funcionando!' });
});

// Rotas de Configuração
app.get('/config', async (req, res) => {
  try {
    const configs = await Config.findAll();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

app.post('/config', async (req, res) => {
  try {
    // Atualiza ou cria uma nova configuração
    const [config, created] = await Config.upsert(req.body);
    res.status(created ? 201 : 200).json(config);
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ error: 'Erro ao salvar configuração' });
  }
});

// Rotas de Cobranças
app.get('/charges', async (req, res) => {
  try {
    const charges = await Charge.findAll();
    res.json(charges);
  } catch (error) {
    console.error('Erro ao buscar cobranças:', error);
    res.status(500).json({ error: 'Erro ao buscar cobranças' });
  }
});

app.post('/charges', async (req, res) => {
  try {
    const charge = await Charge.create(req.body);
    res.status(201).json(charge);
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    res.status(500).json({ error: 'Erro ao criar cobrança' });
  }
});

app.put('/charges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Charge.update(req.body, {
      where: { id }
    });
    if (updated) {
      const updatedCharge = await Charge.findByPk(id);
      res.json(updatedCharge);
    } else {
      res.status(404).json({ error: 'Cobrança não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar cobrança:', error);
    res.status(500).json({ error: 'Erro ao atualizar cobrança' });
  }
});

app.delete('/charges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Charge.destroy({
      where: { id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Cobrança não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao excluir cobrança:', error);
    res.status(500).json({ error: 'Erro ao excluir cobrança' });
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
