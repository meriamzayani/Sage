

module.exports = (sequelize, Sequelize) => {
    const ActeMedical = sequelize.define("acteMedical", {
      nom: {
        type: Sequelize.STRING
      },
      prix: {
        type: Sequelize.FLOAT
      },
  
    });
  
    return ActeMedical;
  };
  