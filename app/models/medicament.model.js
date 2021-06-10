

module.exports = (sequelize, Sequelize) => {
  const Medicament = sequelize.define("medicaments", {
   
	CODE_PCT: {
    type: Sequelize.INTEGER,
	  primaryKey : true,
	  autoIncrement : false,
    },
    NOM_COMMERCIAL: {
      type: Sequelize.STRING
    },
    PRIX_PUBLIC: {
      type: Sequelize.FLOAT
    },
	TARIF_REFERENCE: {
      type: Sequelize.FLOAT
    },
	CATEGORIE: {
      type: Sequelize.STRING
    },
	DCI: {
      type: Sequelize.STRING
    },
	AP: {
      type: Sequelize.STRING
    },
    freezeTableName: true, // Model tableName will be the same as the model name
    timestamps: false,
    underscored: true
  });

  return Medicament;
};
