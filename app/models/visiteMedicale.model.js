module.exports = (sequelize, Sequelize) => {
    const visiteMedicale = sequelize.define("visiteMedicale", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      specialite: {
        type: Sequelize.STRING
      },
  
      honoraire: {
        type: Sequelize.STRING
      }
     
    });
  
    return visiteMedicale;
  };
  