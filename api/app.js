// api/generate.js
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
const port = process.env.PORT || 3000;
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
require('dotenv').config();

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

const promptSetup = "We want to create a story with a user...";
let runningStory = "Initial Prompt: Where will the story begin today?";

async function generateAndLogText(inputText) {
  runningStory += "\n" + "user said: " + inputText;
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not defined in environment variables');
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro', safetySettings });
    const result = await model.generateContent([promptSetup + runningStory]);

    const generatedText = await result.response.text();
    runningStory += "\n" + "AI said: " + generatedText;
    return generatedText;

  } catch (error) {
    runningStory += "\n" + "in case of error: " + inputText;
    console.error('Error in generateAndLogText:', error);
    throw new Error(error.message || 'An error occurred while generating text');
  }
}

app.post('/generate', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const result = await generateAndLogText(text);
    console.log("Generated response:", result);
    res.json({ response: result });
  } catch (error) {
    console.error('Error in /generate endpoint:', error);
    res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;