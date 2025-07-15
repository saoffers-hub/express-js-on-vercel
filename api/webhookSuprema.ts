import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { subid, evento, valor, data } = req.body;

  if (!subid || !evento) return res.status(400).send('Payload inválido');

  if (evento !== 'ftd' && evento !== 'deposito') {
    return res.status(200).send('Evento ignorado');
  }

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
  console.log('Conversão enviada pro Kwai:', responseData);
  res.status(200).send('Conversão enviada com sucesso');
}
