

module.exports = (sequelize, Sequelize) => {
    const remboursementActe = sequelize.define("remboursementActe", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
  
     code: {
       type: Sequelize.INTEGER
     },
     Designation: {
       type: Sequelize.STRING
     },
     nomContrat: {
       type: Sequelize.STRING
     },
     plafond: {
      type: Sequelize.INTEGER
    },    
     tauxRemboursement: {
       type: Sequelize.INTEGER
     },
     

    
   });
  
      return remboursementActe;
    };
    