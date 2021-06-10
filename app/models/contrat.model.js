module.exports = (sequelize, Sequelize) => {
    const Contrat = sequelize.define("contrats", {
      nom: {
        type: Sequelize.STRING
      },
  
      type: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      }
     
    });
  
    return Contrat;
  };
  