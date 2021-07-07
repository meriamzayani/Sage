module.exports = (sequelize, Sequelize) => {
    const role = sequelize.define("role", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      nom: {
        type: Sequelize.STRING
      },
  
    });
  
    return role;
  };
  