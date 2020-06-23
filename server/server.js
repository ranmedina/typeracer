const express = require('express');
const app = express();
const phrases = require('./phrases.json');
const templates = require('./templates.json');
const sentencer = require('sentencer');
const cors = require('cors');

app.use(
  cors({
    origin: 'http://localhost:4200',
  })
);

app.get('/getSentences', (req, res) => {
  const amountOfSentences = req.query.amount || 1;
  let result = [];
  while (result.length != amountOfSentences) {
    const templatesRandom = Math.min(Math.round(Math.random() * templates.length), templates.length - 1);
    const phrasesRandom = Math.min(Math.round(Math.random() * phrases.length), phrases.length - 1);
    result.push(`${phrases[phrasesRandom]} ${sentencer.make(templates[templatesRandom])}`);
  }

  return res.status(200).send(result);
});

app.listen(3000, () => console.log('Server is running on port 3000!'));
