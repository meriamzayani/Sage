

module.exports = (sequelize, Sequelize) => {
    const tauxRemboursementMedicament = sequelize.define("tauxRemboursementMedicament", {
      tauxRemboursement: {
        type: Sequelize.INTEGER
      },
 
    });
  
    return tauxRemboursementMedicament;
  };
  