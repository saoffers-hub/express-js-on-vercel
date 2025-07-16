import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'; // <- Essencial pra funcionar na Vercel

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
    event_name: 'EVENT_FIRST_DEPOSIT',
    click_id: clickId,
    timestamp: new Date(data || Date.now()).toISOString(),
    value: valor || 0
  };

  console.log('Payload montado:', payload);

  try {
    const response = await fetch('https://ads.kwai.com/mapi/track/event/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KWAI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Resposta do Kwai:', result);

    return res.status(200).json({ message: 'Conversão enviada com sucesso', result });
  } catch (err) {
    console.error('Erro ao enviar pro Kwai:', err);
    return res.status(500).json({ message: 'Erro ao processar webhook', error: err });
  }
}
