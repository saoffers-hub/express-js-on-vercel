import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/webhooksuprema2', async (req, res) => {
  const { subid, evento, valor, data } = req.body;

  if (!subid || !evento) {
    return res.status(400).send('Payload inválido');
  }

  const [cj, cr, clickId] = subid.split('_');

  const payload = {
    access_token: process.env.KWAI_TOKEN,
    clickid: clickId,
    event_name: 'EVENT_PURCHASE', // ou 'EVENT_FIRST_DEPOSIT' se for outro evento
    is_attributed: 1,
    mmpcode: 'PL',
    pixelId: process.env.KWAI_PIXEL_ID,
    pixelSdkVersion: '9.9.9',
    testFlag: true,
    trackFlag: false
  };

  try {
    const response = await fetch('https://www.adsnebula.com/log/common/api', {
      method: 'POST',
      headers: {
        'accept': 'application/json;charset=utf-8',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Payload enviado:', payload);
    console.log('Resposta do Kwai:', result);

    return res.status(200).json({ message: 'Conversão enviada com sucesso', result });

  } catch (err) {
    console.error('Erro ao enviar pro Kwai:', err);
    return res.status(500).json({ message: 'Erro ao processar webhook' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
