

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    ville: {
      type: Sequelize.STRING
    },
    idUnique: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    }
  });

  return User;
};
