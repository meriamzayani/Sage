module.exports = (sequelize, Sequelize) => {
    const appareil = sequelize.define("appareil", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      type: {
        type: Sequelize.STRING
      },
  
      pourcentage: {
        type: Sequelize.FLOAT
      },
      plafond: {
        type: Sequelize.FLOAT
      }
     
    });
  
    return appareil;
  };
  