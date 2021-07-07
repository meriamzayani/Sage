

module.exports = (sequelize, Sequelize) => {
    const bulletin = sequelize.define("bulletin", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
  
    numBulletin: {
       type: Sequelize.INTEGER
     },
     
     remboursement: {
       type: Sequelize.DATEONLY
     },
     idUniqueUser: {
      type: Sequelize.INTEGER
    }
    
   });
  
      return bulletin;
    };
    