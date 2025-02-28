require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { default: axios } = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/", (req, res) => {
  res.send({ message: "let's crack the power of AI" });
});

app.get("/gen-test", async (req, res) => {
  const prompt = "Explain how AI works";
  const result = await model.generateContent(prompt);
  res.send({ ans: result.response.text() });
});
app.get("/generate-json", async (req, res) => {
  const prompt = req.query?.prompt;
  if (!prompt) {
    res.send({ msg: "please provide a prompt" });
  }
  const finalPrompt = ` ${prompt}a Json schema: output = {'property': value}
    return: Array<output>`;

  const result = await model.generateContent(finalPrompt);
  const output = await result.response.text().slice(7, -4);
  const jsonData = JSON.parse(output);

  res.send(jsonData);
});


app.get("/gen-img", async(req, res)=>{


 const imageUrl = "https://purepng.com/public/uploads/large/flower-4ms.png";
  const prompt = "Describe the image";


  async function imageUrlToGenerative(imageUrl, mimeType){
    const response = await axios.get(imageUrl, {responseType: "arraybuffer"})
    const base64Image = Buffer.from(response.data, "binary").toString("base64")
    return {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    }
  }
 
  const imagePart = await imageUrlToGenerative(imageUrl, "image/png");
  const result = await model.generateContent([prompt, imagePart]);
  res.send({detail: result.response.text()})
})

app.listen(port, () => {
  console.log("Server running on Port ", port);
});
