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
    const configObject: { [key: string]: any } = {};
    configs.forEach((config) => {
      configObject[config.key] = config.value;
    });
    res.json(configObject);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

app.post('/config', async (req, res) => {
  try {
    const configData = req.body;
    
    // Converte o objeto de configuração em registros individuais
    for (const [key, value] of Object.entries(configData)) {
      await Config.upsert({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value)
      });
    }
    
    res.status(200).json({ message: 'Configurações salvas com sucesso' });
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
    console.log('Recebendo requisição POST /charges:', req.body);

    // Se for um array, cria/atualiza múltiplas cobranças
    if (Array.isArray(req.body)) {
      const charges = await Promise.all(
        req.body.map(async (charge) => {
          try {
            if (!charge.id) {
              console.error('Erro: ID não fornecido para a cobrança:', charge);
              return null;
            }

            const [updatedCharge, created] = await Charge.upsert({
              id: charge.id,
              name: charge.name,
              whatsapp: charge.whatsapp,
              service: charge.service,
              value: charge.value,
              billingDay: charge.billingDay,
              recurrence: charge.recurrence,
              lastBillingDate: charge.lastBillingDate
            });

            console.log(
              created ? 'Cobrança criada:' : 'Cobrança atualizada:',
              updatedCharge.toJSON()
            );

            return updatedCharge;
          } catch (error) {
            console.error('Erro ao processar cobrança:', charge, error);
            return null;
          }
        })
      );

      // Remove os nulls do array
      const validCharges = charges.filter(charge => charge !== null);
      console.log('Cobranças processadas:', validCharges);

      res.status(201).json(validCharges);
    } 
    // Se for um objeto único, cria/atualiza uma única cobrança
    else {
      const charge = req.body;
      
      if (!charge.id) {
        throw new Error('ID não fornecido para a cobrança');
      }

      const [updatedCharge, created] = await Charge.upsert({
        id: charge.id,
        name: charge.name,
        whatsapp: charge.whatsapp,
        service: charge.service,
        value: charge.value,
        billingDay: charge.billingDay,
        recurrence: charge.recurrence,
        lastBillingDate: charge.lastBillingDate
      });

      console.log(
        created ? 'Cobrança criada:' : 'Cobrança atualizada:',
        updatedCharge.toJSON()
      );

      res.status(created ? 201 : 200).json(updatedCharge);
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar cobrança:', error);
    res.status(500).json({ error: 'Erro ao criar/atualizar cobrança' });
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
