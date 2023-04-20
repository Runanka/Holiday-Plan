const express = require("express");
const parser = require("body-parser");
const axios = require("axios");
const ejs = require("ejs");

require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  organization: "org-1y8mjnjVnwP86A6Yw2L9mqnc",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const weatherAPIKey = process.env.WEATHER_API_KEY;

const app = express();

app.use(express.static("public"));

app.use(parser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", {
    temperature: "",
    weatherDescription: "",
    timezone: "",
    plan: "",
  });
});

app.post("/", async (req, res) => {
  try {
    const cityName = req.body.cityName.toString();
    const weatherURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&appid=" +
      weatherAPIKey +
      "&units=metric";
    const weatherData = await axios.get(weatherURL);
    const temperature = weatherData.data.main.temp;
    const weatherDescription = weatherData.data.weather[0].description;
    const icon = weatherData.data.weather[0].icon;
    const timezone = weatherData.data.timezone;

    const now = new Date(Date.now() + timezone * 1000);
    now.setUTCMinutes(now.getUTCMinutes() + 30); // add 30 minutes (1800 seconds)
    now.setUTCMinutes(0, 0, 0); // round down to the nearest hour
    const utcTime =
      Number(now.toISOString().substr(11, 2)) > 9
        ? now.toISOString().substr(11, 2)
        : "9";
    console.log(utcTime);

    const prompt =
      "Plan my unique holiday in " +
      cityName +
      " with detail spots by time. Starting time is " +
      utcTime +
      +":00. Today's weather is " +
      temperature +
      " Celsius, and weather description is " +
      weatherDescription +
      ". Also keep in mind the weather while planning. Example: 8:00 - Visit the zoo. It is a wonderful place. Full of shades from trees. 19:00 - Enjoy a boat ride on the Yamuna River";

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const plan = completion.data.choices[0].message.content;
    console.log(plan);

    res.render("index", {
      temperature: temperature,
      weatherDescription: weatherDescription,
      timezone: timezone,
      plan: plan,
    });
  } catch (err) {
    console.log(err.response.data.cod, err.response.data.message);
    res.status(err.response.data.cod).send(err.response.data.message);
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
