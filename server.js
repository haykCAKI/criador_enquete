const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./models");
const enqueteRoutes = require("./routes/enqueteRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static("public"));

// Conexão com o banco de dados
const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
  } catch (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    process.exit(1); // Caso haja erro na conexão, o servidor para
  }
};

conectarDB();

// Rotas
app.use("/api", enqueteRoutes);

// Middleware para tratar erros globais
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Algo deu errado!" });
});

// Inicia o servidor
app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor rodando`);
});