module.exports = (sequelize, DataTypes) => {
  const Opcao = sequelize.define(
    "Opcao",
    {
      texto: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      votos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      tirar_votos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      enquete_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "enquetes",
          key: "id",
        },
      },
    },
    {
      tableName: "opcoes",
    }
  );

  Opcao.associate = function (models) {
    Opcao.belongsTo(models.Enquete, { foreignKey: "enquete_id" });
  };

  return Opcao;
};
