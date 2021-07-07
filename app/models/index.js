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
db.roles = require("../models/roles.model.js")(sequelize, Sequelize);
db.contrat = require("../models/contrat.model.js")(sequelize, Sequelize);
db.medicament = require("../models/medicament.model.js")(sequelize, Sequelize);
db.Medecins = require("../models/medecin.model.js")(sequelize, Sequelize);
db.conjoint = require("../models/conjoint.model.js")(sequelize, Sequelize);
db.enfant = require("../models/enfant.model.js")(sequelize, Sequelize);
db.visiteMedicale = require("../models/visiteMedicale.model.js")(sequelize, Sequelize);
db.appareillageMedical = require("../models/appareillageMedical.model.js")(sequelize, Sequelize);
db.acteBulletin = require("../models/acteBulletin.model.js")(sequelize, Sequelize);
db.bulletin = require("../models/bulletin.model.js")(sequelize, Sequelize);
db.remboursementActe = require("../models/remboursementActe.model.js")(sequelize, Sequelize);




// db.user.belongsToMany(db.role, {
//   through: "user_roles",
//   foreignKey: "userId",
//   otherKey: "roleId"
// });


db.user.belongsTo(db.contrat,{
  foreignKey: 'id_contrat'
});

db.conjoint.belongsTo(db.user,{
  foreignKey: 'idUser'
});

db.user.belongsTo(db.roles,{
  foreignKey: 'idRole'
});

db.user.hasMany(db.enfant,{
  foreignKey: 'idUser'
});



module.exports = db;
