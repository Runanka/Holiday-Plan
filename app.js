require("dotenv").config();
const express = require("express");
const parser = require("body-parser");
const axios = require("axios");
const ejs = require("ejs");

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
    const timezone = weatherData.data.timezone / 3600;
    res.render("index", {
      temperature: temperature,
      weatherDescription: weatherDescription,
      timezone: timezone,
    });
  } catch (err) {
    console.log(err.response.data.cod, err.response.data.message);
    res.status(err.response.data.cod).send(err.response.data.message);
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
