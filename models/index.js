const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/database");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const Enquete = require("./Enquete")(sequelize, DataTypes);
const Opcao = require("./Opcao")(sequelize, DataTypes);

if (Enquete.associate) {
  Enquete.associate({ Opcao });
}

if (Opcao.associate) {
  Opcao.associate({ Enquete });
}

module.exports = {
  sequelize,
  Enquete,
  Opcao,
};
