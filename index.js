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
    event_name: 'EVENT_FIRST_DEPOSIT',
    click_id: clickId,
    timestamp: new Date(data || Date.now()).toISOString(),
    value: valor || 0,
  };

  try {
    const response = await fetch('https://ads.kwai.com/mapi/track/event/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KWAI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result;

    try {
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      result = { raw: text };
    }

    console.log('Payload enviado:', payload);
    console.log('Resposta do Kwai:', result);

    return res.status(200).json({ message: 'Conversão enviada com sucesso' });
  } catch (err) {
    console.error('Erro ao enviar pro Kwai:', err);
    return res.status(500).json({ message: 'Erro ao processar webhook' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
