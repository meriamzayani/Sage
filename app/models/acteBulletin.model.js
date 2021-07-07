

module.exports = (sequelize, Sequelize) => {
  const acteBulletin = sequelize.define("acteBulletin", {
  id: {
      type: Sequelize.INTEGER,
      primaryKey: true
  },

   numBulletin: {
     type: Sequelize.INTEGER
   },
   codeActe: {
     type: Sequelize.INTEGER
   },
   date: {
     type: Sequelize.DATEONLY
   },
   honoraire: {
     type: Sequelize.FLOAT
   },
   idUniqueUser: {
    type: Sequelize.INTEGER
  },

  designation: {
    type: Sequelize.STRING
  },
   

  
 });

    return acteBulletin;
  };
  