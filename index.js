import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/webhooksuprema2', async (req, res) => {
  const { subid, evento, valor, data, modo_teste } = req.body;

  if (!subid || !evento) {
    return res.status(400).send('Payload inválido');
  }

  const [cj, cr, clickid] = subid.split('_');

  const payload = {
    access_token: process.env.KWAI_TOKEN,
    clickid: clickid,
    event_name: "EVENT_PURCHASE",
    is_attributed: 1,
    mmpcode: "PL",
    pixelId: process.env.KWAI_PIXEL,
    pixelSdkVersion: "9.9.9",
    testFlag: !!modo_teste,
    trackFlag: !!modo_teste
  };

  try {
    const response = await fetch('https://www.adsnebula.com/log/common/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const resultText = await response.text();
    let result;
    try {
      result = resultText ? JSON.parse(resultText) : {};
    } catch (e) {
      result = { raw: resultText };
    }

    console.log('Payload enviado:', payload);
    console.log('Resposta do Kwai:', result);

    return res.status(200).json({ message: 'Conversão enviada com sucesso', kwai: result });
  } catch (err) {
    console.error('Erro ao enviar pro Kwai:', err);
    return res.status(500).json({ message: 'Erro ao processar webhook' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
