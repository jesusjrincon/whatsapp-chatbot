const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const whatsappToken = process.env.WHATSAPP_TOKEN; // Token de WhatsApp
const geminiApiKey = process.env.GEMINI_API_KEY; // Clave de Gemini

// Ruta para manejar mensajes de WhatsApp
app.post('/webhook', async (req, res) => {
  const message = req.body.entry[0].changes[0].value.messages[0].text.body;
  const from = req.body.entry[0].changes[0].value.messages[0].from;

  try {
    // Realiza la solicitud a la API de Google Gemini
    const geminiResponse = await axios.post('https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-turbo:generateText', {
      prompt: {
        text: message
      },
      temperature: 0.7,
      maxOutputTokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${geminiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = geminiResponse.data.candidates[0].output;

    // Responde al usuario en WhatsApp
    await axios.post(`https://graph.facebook.com/v13.0/YOUR_PHONE_ID/messages?access_token=${whatsappToken}`, {
      messaging_product: 'whatsapp',
      to: from,
      text: { body: reply }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('Webhook is listening on port 3000');
});
