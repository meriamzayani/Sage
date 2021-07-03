

const db = require("../models");
const {
    Op
} = require("sequelize");

const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const {
    response
} = require("express");
const {
    Medecins,
    medicament,
    conjoint,
    enfant
} = require("../models");
const sessionId = uuid.v4();

// Create a new session
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: "./sage-bot-biqu-71937e2c122e.json"
});
const projectId = 'sage-bot-biqu';
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);


exports.callDialogFlow = ((req, res) => {


    if (!req.body.text)
        return;
    runSample(req.body.text, req.userId).then(data => {
        res.send({
            Reply: data
        })
    })
})


/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId 
 */
async function runSample(msg, userId) {

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: msg,
                languageCode: 'fr-CA',
            },
        },
    };


    const responses = await sessionClient.detectIntent(request);

    const result = responses[0].queryResult;
    answer = result.fulfillmentText;




    if (isNaN(result.queryText)) {
      const med = await getMedicament(result.queryText);
      if (med) {
          const contractid = await getUserContractId(userId);
          const contratPlafond = await getContractPlafond(contractid);
          const contractName = await getContractName(contractid);

          const remboursement = med.PRIX_PUBLIC - med.PRIX_PUBLIC * 80 / 100;
          const roudRemboursement = Math.round((remboursement + Number.EPSILON) * 100) / 100
          answer = `-Medicament: ${med.NOM_COMMERCIAL}\n\n-Prix: ${med.PRIX_PUBLIC} DT\n\nVous avez in contrat de type ${contractName} ${contratPlafond}% du prix du medicament sera remboursé soit : ${roudRemboursement}DT`
      } 
    } 

    console.log('result.intent.displayName: ', result.intent.displayName);

    ///CONTRAT
    if (result.intent.displayName === "contrat") {

        const contractid = await getUserContractId(userId);
        const contractName = await getContractName(contractid); //is this not UnhandledPromiseRejectionWarning: TypeError: Assignment to constant variable.ffs???
        answer = `votre type de contrat est ${contractName} voulez vous avoir plus de détails sur votre contrat?`
    }
    ///CONJOINT


    ///nom
    if (result.intent.displayName === "PersonnesAssurées - yes - conjoint - nom") {

      const conj = await conjoint.findOne({
        where: {

            [Op.and]: [{
                    nomPrenom: {
                        [Op.like]: '%' + result.queryText + '%'
                    }
                },
                {
                    idUser: userId
                }
            ]
        }
    });
    if(conj){
      conjoint.update({
                nomPrenom: result.queryText
            }, {
                where: {
                    idUser: userId
                }
           });
      
    }else{
           
           const con = await conjoint.create({
             nomPrenom: result.queryText,
             cin: "123",
             idUser: userId
         });

    }


    }


    ///cin
    if (result.intent.displayName === "PersonnesAssurées - yes - conjoint - cin") {
     
        if (isIdCardNo(result.queryText)!=true) {
            answer = 'veuillez saisir un cin valide ❌';
        }
        
       else {
        console.log("I m here")
          conjoint.update({
              cin: result.queryText
          }, {
              where: {
                  idUser: userId
              }
          });
          answer = `Les informations ont été enregistrées avec succès ✔️​`;}



       

    }



    
    ///ENFANT
    if (result.intent.displayName == "PersonnesAssurées - yes - enfant - nom") {
      const enf = await enfant.findOne({
        where: {

            [Op.and]: [{
                    nomPrenom: {
                        [Op.like]: '%' + result.queryText + '%'
                    }
                },
                {
                    idUser: userId
                }
            ]
        }
    });
    if(enf){
      enfant.update({
                nomPrenom: result.queryText
            }, {
                where: {
                    idUser: userId
                }
           });
      
    }else{
           
           const e = await enfant.create({
             nomPrenom: result.queryText,
             cin: "123",
             idUser: userId
         });

    }

    }
    if (result.intent.displayName == "PersonnesAssurées - yes - enfant - nom - age") {

        if (result.queryText>20) {
            answer = 'L"age de votre enfant ne doit pas depasser les 20 ans ❌';
        }
        
       else {
        console.log("I m here")
          enfant.update({
              age: result.queryText
          }, {
              where: {
                  idUser: userId
              }
          });
          answer = `Les informations ont été enregistrées avec succès ✔️​`;}
    }
    ///SPECIALITE
    if (result.intent.displayName == "medecins - yes - specialité") {

        ville = await getUserVille(userId);

        const medecins = await getMedecinByVilleSpecialite(ville, result.queryText);

        answer = `je vois que vous habitez à ${ville}, voici la liste des medecins ${result.queryText} à ${ville}:\n\n${formatDocNames(medecins)}
      \nPlus de détail? `;

    }

    if (result.intent.displayName == "medecins - yes - specialité - detail - yes - name") {
        // answer=DetailMedecin(result.queryText)
        answer = DetailMedecin(result.queryText)
    }


    
    ///ASSURES
    if (result.intent.displayName === "Assures") {
      const con = await getConjoint(userId);
      const enfants =  await  getEnfant(userId);
     

      answer = `Voici la liste des personnes couvetes par votre assurance :\n\nEnfant :\n${formatDocNames(enfants)}\nConjoint :⭐ ${con}`;

  }


    return answer;
}











////////////////
async function DetailMedecin(NomMedecin) {
    const doctor = await Medecins.findOne({
        where: {
            name: {
                [Op.like]: `%${NomMedecin}%`
            }
        }
    });

    if (doctor) {
        return `👨‍⚕️ Médecin: ${doctor.name}\n\n🏥 Adresse complète: ${doctor.fulladdress}\n\n☎️ NumTel: ${doctor.number}`;
    } else {
        return 'Il n"y aucun médecin avec ce nom ';
    }
}

function formatDocNames(names) {
    // const list = '';
    return names.reduce((nameListStr, name) => {
        console.log('iteration: ', nameListStr);
        return nameListStr.concat('⭐ ', `${name}\n`);
    }, '');
}


async function getUserContractId(userid) //async wra
{

    const user = await db.user.findByPk(userid);

    return user.id_contrat;
}



function getContractName(id) {
    try {
        const contratNom = db.contrat.findByPk(id).then(contrat => contrat.nom);
        return contratNom;
    } catch {

    }


}

function getContractDetails(id) {
    try {
        const contratDetails = db.contrat.findByPk(id).then(contrat => contrat.description);
        return contratDetails;
    } catch {

    }


}


function getContractPlafond(id) {
    try {
        const contratPlafond = db.contrat.findByPk(id).then(contrat => contrat.plafond);
        return contratPlafond;
    } catch {

    }


}

function getUserVille(id) {
    try {
        const userVille = db.user.findByPk(id).then(user => user.ville);
        return userVille;
    } catch {

    }


}


async function getMedecinByVilleSpecialite(ville, specialite) {

    const doctors = await Medecins.findAll({
        where: {

            [Op.and]: [{
                    speciality: {
                        [Op.like]: '%' + specialite + '%'
                    }
                },
                {
                    address: {
                        [Op.like]: '%' + ville + ' ' + '%'
                    }
                }
            ]
        }
    });
    const names = doctors.map(doctor => doctor.name);
    return names;
}


async function getMedicament(nomMedicament) {
    const med = await medicament.findOne({
        where: {
            NOM_COMMERCIAL: {
                [Op.like]: '%' + nomMedicament + '%'
            }
        }
    });

    return med;





}




function isIdCardNo(num) {
    console.log("niaw",);
    console.log("meow",num.toString().length);
  if(isNaN(num)||String(num).charAt(0)!=0||num.toString().length!=8)return false;
 
  return true;
    
}



async function getEnfant(userId){
  const enfants = await enfant.findAll({
    where: 
      {idUser:userId}
        
  
        
});
const nomEnfant = enfants.map(enfant => enfant.nomPrenom);
return nomEnfant;
}



async function getConjoint(userId){
  
  const c = await conjoint.findOne({
    where: 
      {idUser:userId}
        
  
        
});

const nomConjoint = c.nomPrenom;
return nomConjoint;
}






