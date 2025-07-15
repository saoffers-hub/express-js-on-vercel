import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  // 👇 Aqui segue a lógica do seu webhook
  const { subid, evento, valor, data } = req.body;

  if (!subid || !evento) return res.status(400).send('Payload inválido');

  const [cj, cr, clickId] = subid.split('_');

  const payload = {
    event_name: 'EVENT_FIRST_DEPOSIT',
    click_id: clickId,
    timestamp: new Date(data || Date.now()).toISOString(),
    value: valor || 0
  };

  const response = await fetch('https://ads.kwai.com/mapi/track/event/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KWAI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const responseData = await response.json();
  console.log('Enviado com sucesso:', responseData);

  res.status(200).send('Webhook processado');
}
