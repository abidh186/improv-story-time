const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
const cors = require('cors');
const app = express();
const port = 3000;
require('dotenv').config();

app.use(bodyParser.json());
app.use(cors());

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

const promptSetup = "We want to create a story with a user. The idea is for user and chatbot (you the AI) to create a story together. Initially user is given a prompt `Let's create a story together! Where would you like the story to begin today? Start from anywhere and we'll take it from there.` and they share the start of a story. Then you tell the next part of that story. And then user tells the part after that and so it goes. Your job is to generate less 200 charaters at a time. Keep the story going. Do not wrap up the story unless it is close to 10000 characters. You want to pickup where the story left off. Do not repeat previous part of the story. You goal is to advance the story and only add to the story as it develops. Here is the story so far: "
let runningStory = "Initial Prompt: Where will the story begin today?"

async function generateAndLogText(inputText) {
  runningStory += "\n" + "user said: " + inputText;
  console.log(1, {inputText, runningStory})
  try {
  
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not defined in environment variables');
    }
    const genAI = new GoogleGenerativeAI(apiKey);

  
    const model = genAI.getGenerativeModel({ model: 'gemini-pro', safetySettings });
    const result = await model.generateContent([promptSetup + runningStory]);

  
    const generatedText = await result.response.text();
    console.log({inputText, inputPrompt: promptSetup + runningStory, generatedText})
    runningStory += "\n" + "AI said: " + generatedText;
    console.log(2, {inputText, inputPrompt: (promptSetup + runningStory), runningStory, generatedText})
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