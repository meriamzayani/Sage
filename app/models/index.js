const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;

db.sequelize = sequelize;


db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.contrat = require("../models/contrat.model.js")(sequelize, Sequelize);
db.medicament = require("../models/medicament.model.js")(sequelize, Sequelize);
db.Medecins = require("../models/medecin.model.js")(sequelize, Sequelize);

db.tauxRemboursementMedicament = require("../models/tauxRemboursementMedicament.model.js")(sequelize, Sequelize);
db.tauxRemboursementActeMedical = require("../models/tauxRemboursementActeMedical.model.js")(sequelize, Sequelize);



db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
// db.user.belongsToMany(db.role, {
//   through: "user_roles",
//   foreignKey: "userId",
//   otherKey: "roleId"
// });


db.user.belongsTo(db.contrat,{
  foreignKey: 'id_contrat'
});

db.tauxRemboursementMedicament.belongsTo(db.contrat,{
  foreignKey: 'id_contrat'
});
db.tauxRemboursementMedicament.belongsTo(db.medicament,{
  foreignKey: 'code_medicament'
});


db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
