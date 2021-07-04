

module.exports = (sequelize, Sequelize) => {
    const ActeMedical = sequelize.define("acteMedical", {
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
  
    return ActeMedical;
  };
  