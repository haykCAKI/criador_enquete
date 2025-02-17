const express = require("express");
const router = express.Router();
const EnqueteController = require("../controllers/EnqueteController");

// Middleware de validação
const validarEnquete = (req, res, next) => {
  const { titulo, data_inicio, data_termino, opcoes } = req.body;

  if (
    !titulo ||
    !data_inicio ||
    !data_termino ||
    !Array.isArray(opcoes) ||
    opcoes.length < 3
  ) {
    return res
      .status(400)
      .json({ error: "A enquete deve ter ao menos 3 opções." });
  }

  // Validar formato das datas
  if (new Date(data_inicio) >= new Date(data_termino)) {
    return res
      .status(400)
      .json({ error: "A data de início deve ser anterior à data de término." });
  }

  next();
};

// Rotas para enquetes
router.get("/enquetes", async (req, res) => {
  try {
    await EnqueteController.listar(req, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao listar as enquetes", details: error.message });
  }
});

router.post("/enquetes", validarEnquete, async (req, res) => {
  try {
    await EnqueteController.criar(req, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao criar a enquete", details: error.message });
  }
});

router.put("/enquetes/:id", async (req, res) => {
  try {
    await EnqueteController.atualizar(req, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar a enquete", details: error.message });
  }
});

router.delete("/enquetes/:id", async (req, res) => {
  try {
    await EnqueteController.deletar(req, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao deletar a enquete", details: error.message });
  }
});

// Rota para detalhes da enquete
router.get("/enquetes/:id", async (req, res) => {
  try {
    await EnqueteController.detalhes(req, res);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erro ao buscar detalhes da enquete",
        details: error.message,
      });
  }
});

// Rota para votar em uma opção
router.post("/opcoes/:id/votar", async (req, res) => {
  try {
    const { id } = req.params;
    const opcaoExiste = await EnqueteController.verificarOpcao(id);
    if (!opcaoExiste) {
      return res.status(404).json({ error: "Opção não encontrada." });
    }
    await EnqueteController.votar(req, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao registrar voto", details: error.message });
  }
});

// Rota para tirar voto de uma opção
router.post("/opcoes/:id/tirar_votos", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Chama a função de tirar voto do EnqueteController
    await EnqueteController.tirarVoto(req, res);
  } catch (error) {
    console.error("Erro ao tirar voto:", error);
    res.status(500).json({ error: "Erro ao tirar voto", details: error.message });
  }
});

module.exports = router;
