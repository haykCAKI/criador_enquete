module.exports = (sequelize, DataTypes) => {
  const Enquete = sequelize.define("Enquete", {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    data_termino: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  Enquete.associate = (models) => {
    Enquete.hasMany(models.Opcao, {
      foreignKey: "enquete_id",
      as: "opcoes",
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Enquete;
};
