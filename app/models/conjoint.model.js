module.exports = (sequelize, Sequelize) => {
  const conjoint = sequelize.define("conjoint", {
    nomPrenom: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    cin: {
      type: Sequelize.STRING
    },

  });

  return conjoint;
};
