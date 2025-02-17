const { Enquete, Opcao } = require("../models");

module.exports = {
  async listar(req, res) {
    const enquetes = await Enquete.findAll({
      include: [{ model: Opcao, as: "opcoes" }],
    });
    res.json(enquetes);
  },

  async criar(req, res) {
    try {
      const { titulo, data_inicio, data_termino, opcoes } = req.body;

      if (!opcoes || opcoes.length < 3) {
        return res
          .status(400)
          .json({ error: "A enquete deve ter pelo menos 3 opções." });
      }

      const enquete = await Enquete.create({
        titulo,
        data_inicio,
        data_termino,
        opcoes,
      });

      const opcoesCriadas = await Promise.all(
        opcoes.map((opcao) => {
          if (typeof opcao.texto !== "string") {
            throw new Error("Texto da opção precisa ser uma string.");
          }
          return Opcao.create({ texto: opcao.texto, enquete_id: enquete.id });
        })
      );

      res.status(201).json({ enquete, opcoes: opcoesCriadas });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar enquete." });
    }
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const { titulo, data_inicio, data_termino } = req.body;
    const enquete = await Enquete.findByPk(id);

    if (enquete) {
      enquete.titulo = titulo;
      enquete.data_inicio = data_inicio;
      enquete.data_termino = data_termino;
      await enquete.save();
      res.json(enquete);
    } else {
      res.status(404).json({ error: "Enquete não encontrada" });
    }
  },

  async deletar(req, res) {
    const { id } = req.params;
    const enquete = await Enquete.findByPk(id);

    if (enquete) {
      await enquete.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Enquete não encontrada" });
    }
  },

  async detalhes(req, res) {
    const { id } = req.params;
    const enquete = await Enquete.findByPk(id, {
      include: [{ model: Opcao, as: "opcoes" }],
    });

    if (enquete) {
      res.json(enquete);
    } else {
      res.status(404).json({ error: "Enquete não encontrada" });
    }
  },

  // Função para verificar se a opção existe
  async verificarOpcao(id) {
    try {
      const opcao = await Opcao.findByPk(id);
      return opcao !== null; // Retorna true se a opção existe
    } catch (error) {
      console.error("Erro ao verificar opção:", error);
      throw new Error("Erro ao verificar a opção.");
    }
  },

  // Função de votar
  async votar(req, res) {
    try {
      const { id } = req.params;
      const opcao = await Opcao.findByPk(id);

      if (!opcao) {
        return res.status(404).json({ error: "Opção não encontrada." });
      }

      opcao.votos += 1;
      await opcao.save();

      res.status(200).json(opcao);
    } catch (error) {
      console.error("Erro ao votar:", error);
      res.status(500).json({ error: "Erro ao registrar voto." });
    }
  },
  // Função no EnqueteController para tirar voto
  async tirarVoto(req, res) {
    try {
      const { id } = req.params;
      const opcao = await Opcao.findByPk(id);

      if (!opcao) {
        return res.status(404).json({ error: "Opção não encontrada." });
      }

      // Aqui você vai fazer a lógica para decrementar o voto da opção
      if (opcao.votos > 0) {
        opcao.votos -= 1;
      }

      await opcao.save();

      res.status(200).json(opcao);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao tirar voto." });
    }
  },
};
