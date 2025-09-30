import express from "express";
import TelegramBot from "node-telegram-bot-api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mysql from "mysql2/promise";

const app = express();
const PORT = 3000;

// Token del BotFather
const TOKEN = process.env.TELEGRAM_TOKEN; // Your Telegram Bot Token
const GEMINI_KEY = process.env.GEMINI_API_KEY; // Your Gemini API Key

const bot = new TelegramBot(TOKEN, { polling: true });
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Conexión a BD
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2147",
  database: "bot-telegram",
});

// Función: transformar pregunta → SQL
async function generarSQL(pregunta) {
  const schema = `
  Tablas y columnas disponibles en la base de datos:
  - clientes(id, nombre, email)
  - productos(id, nombre, precio)
  - ventas(id, cliente_id, producto_id, cantidad, fecha)
  `;

  const prompt = `
  ${schema}

  Convierte la siguiente pregunta del usuario en una consulta SQL válida para MySQL.
  La consulta debe basarse SOLO en las tablas y columnas listadas arriba.
  SOLO devuélveme la consulta SQL, nada más.

  Pregunta: "${pregunta}"
  `;
  const result = await model.generateContent(prompt);
  const rawSql = result.response.text();
  // Extract SQL from markdown block
  const sqlMatch = rawSql.match(/```sql\n([\s\S]*?)\n```/);
  return sqlMatch ? sqlMatch[1] : rawSql;
}

// Escuchar mensajes en Telegram
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const pregunta = msg.text;

  try {
    // Generar SQL con Gemini
    const sql = await generarSQL(pregunta);

    // Security check: only allow SELECT queries
    if (!sql.trim().toLowerCase().startsWith('select')) {
      bot.sendMessage(chatId, "❌ Solo se permiten consultas de tipo SELECT.");
      return;
    }

    // Ejecutar SQL
    const [rows] = await db.execute(sql);

    // Pasar resultados a Gemini para resumir bonito
    const resumenPrompt = `
      Pregunta: ${pregunta}
      Resultados de la consulta: ${JSON.stringify(rows)}
      Resume los resultados en un lenguaje natural, breve y claro.
    `;
    const resumen = await model.generateContent(resumenPrompt);
    const textoResumen = resumen.response.text();

    // Limpiar el texto de caracteres de Markdown antes de enviar
    const textoLimpio = textoResumen.replace(/\*+/g, "");
    bot.sendMessage(chatId, textoLimpio);
  } catch (err) {
    bot.sendMessage(chatId, "❌ Error procesando la consulta.");
    console.error(err);
  }
});


// Rutas de Express
app.get("/", (req, res) => {
  res.send("Servidor Express + Bot de Telegram activo 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
