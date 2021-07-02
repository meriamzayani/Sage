

module.exports = (sequelize, Sequelize) => {
    const Medecins = sequelize.define("medecins", {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      url: {
        type: Sequelize.STRING,

      },
      speciality: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      number: {
        type: Sequelize.STRING
      },
      fulladdress: {
        type: Sequelize.STRING
      }
    });
  
    return Medecins;
  };
  