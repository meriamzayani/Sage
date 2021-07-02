module.exports = (sequelize, Sequelize) => {
    const Enfant = sequelize.define("enfant", {
      nomPrenom: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      age: {
        type: Sequelize.STRING
      },
  
    });
  
    return Enfant;
  };
  