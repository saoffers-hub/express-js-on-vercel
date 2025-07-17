import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'; // <- Essencial pra funcionar na Vercel
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("Webhook recebido!");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { subid, evento, valor, data } = req.body;

  if (!subid || !evento) {
    return res.status(400).json({ error: 'Payload inválido' });
  }

  const [cj, cr, clickId] = subid.split('_');

  const payload = {
    access_token: process.env.KWAI_TOKEN || '',
    clickid: clickId,
    event_name: 'EVENT_PURCHASE',
    is_attributed: 1,
    mmpcode: 'PL',
    pixelId: process.env.KWAI_PIXEL_ID || '',
    pixelSdkVersion: '9.9.9',
    testFlag: true,
    trackFlag: true
  };

  console.log('Payload montado:', payload);

  try {
    const response = await fetch('https://www.adsnebula.com/log/common/api', {
      method: 'POST',
      headers: {
        'accept': 'application/json;charset=utf-8',
        'Content-Type': 'application/json'
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

    console.log('Resposta do Kwai:', result);
    return res.status(200).json({ message: 'Conversão enviada com sucesso', result });
  } catch (err) {
    console.error('Erro ao enviar pro Kwai:', err);
    return res.status(500).json({ message: 'Erro ao processar webhook', error: err });
  }
}
