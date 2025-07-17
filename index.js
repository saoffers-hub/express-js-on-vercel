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

  // Aqui pegamos o clickid da estrutura subid vinda da Suprema (ex: cj1_cr2_clickid)
  const [cj, cr, clickid] = subid.split('_');

  const payload = {
    access_token: process.env.jyOrCfrY6cfYEAr2yh7jqxBGSK58fS3bkjyLWREx90Y,         // <- token que o Kwai te passou
    clickid: clickid,
    event_name: "EVENT_PURCHASE",
    is_attributed: 1,
    mmpcode: "PL",
    pixelId: process.env.284663902209302,           // <- seu pixelId do Kwai
    pixelSdkVersion: "9.9.9",
    testFlag: true,
    trackFlag: true
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

    const text = await response.text();
    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      result = { raw: text };
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
