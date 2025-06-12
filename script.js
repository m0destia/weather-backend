import express from "express";
import axios from "axios";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(
  cors({
    origin: "https://m0destia.onrender.com",
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.get("/clima", async (req, res) => {
  const city = req.query.city || "London";
  const encodedCity = encodeURIComponent(city);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${API_KEY}&units=metric&lang=pt_br`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error:
        "Erro ao buscar dados do clima. Verifique a cidade ou tente novamente mais tarde.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
