module.exports = (sequelize, Sequelize) => {
  const Conjoint = sequelize.define("conjoint", {
    nomPrenom: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    cin: {
      type: Sequelize.STRING
    },

  });

  return Conjoint;
};
