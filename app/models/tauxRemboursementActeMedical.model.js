

module.exports = (sequelize, Sequelize) => {
    const tauxRemboursementActeMedical = sequelize.define("tauxRemboursementActeMedical", {
      tauxRemboursement: {
        type: Sequelize.INTEGER
      },
 
    });
  
    return tauxRemboursementActeMedical;
  };
  