

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
    enfant,
    visiteMedicale,
    acteBulletin,
    remboursementActe,
    user
} = require("../models");
const remboursementActeModel = require("../models/remboursementActe.model");
const acteBulletinModel = require("../models/acteBulletin.model");
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


////////MEDICAMENT

    if (isNaN(result.queryText)) {
      const med = await getMedicament(result.queryText);
      if (med) {
          const contractid = await getUserContractId(userId);
          const ContractPourcentage = await getContractPourcentage(contractid);
          const contractName = await getContractName(contractid);

          const remboursement = med.PRIX_PUBLIC - med.PRIX_PUBLIC * 80 / 100;
          const roudRemboursement = Math.round((remboursement + Number.EPSILON) * 100) / 100
          answer = `-Medicament: ${med.NOM_COMMERCIAL}\n\n-Prix: ${med.PRIX_PUBLIC} DT\n\nVous avez in contrat de type ${contractName} ${ContractPourcentage}% du prix du medicament sera remboursé soit : ${roudRemboursement}DT`
      }
    }

    console.log('result.intent.displayName: ', result.intent.displayName);

 /////////CONTRAT
    if (result.intent.displayName === "contrat") {

        //const acteBulletin=await getActebyBulletin(123);
        var myString ="\n"

        acteBulletin.forEach(acte => {
        myString=myString.concat(`\n📆Date: ${acte.date}\n🩺Acte Medical: ${acte.designationActe}\n💰Honoraire: ${acte.honoraire} DT\n`);
        
  
        });
       console.log(result.parameters)
        // console.log(myString);
        // console.log(`acteBulletin${acteBulletin[1].honoraire}`)

       
        // console.log()
        const contractid = await getUserContractId(userId);
        const contractName = await getContractName(contractid); //is this not UnhandledPromiseRejectionWarning: TypeError: Assignment to constant variable.ffs???
       //answer = `votre type de contrat est ${contractName} voulez vous avoir plus de détails sur votre contrat?`
       answer = `votre type de contrat est ${contractName} voulez vous avoir plus de détails sur votre contrat?`
    }


    ///CONJOINT


    ///nom
    if (result.intent.displayName === "PersonnesAssurées - yes - conjoint - nom") {

      const conj = await conjoint.findOne({
        where: { idUser: userId}});


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
    if (result.intent.displayName === "PersonnesAssurées - yes - conjoint - nom - cin") {

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


    if (result.intent.displayName == "PersonnesAssurées - yes - enfant - nom-age") {
        console.log(result.parameters)

        if(isNaN(result.queryText)){}
        // else if (result.queryText>20) {
        //     answer = 'L"age de votre enfant ne doit pas depasser les 20 ans ❌';
        // }
        else{
           
            nomEnfant=result.parameters.fields.person.structValue.fields.name.stringValue;
            const enf = await enfant.findOne({
                where: {

                    [Op.and]: [{
                            nomPrenom: {
                                [Op.like]: '%' + nomEnfant + '%'
                            }
                        },
                        {
                            idUser: userId
                        }
                    ]
                }
            });
            if(enf){
                 console.log("age",age=result.parameters.fields.number.numberValue)
                lastName=await getUserLastName(userId);

              enfant.update({
                        nomPrenom: nomEnfant+" "+lastName,
                        age: age=result.parameters.fields.number.numberValue
                    }, {
                        where: {
                           [Op.and]: [{
                            nomPrenom: {
                                [Op.like]: '%' + nomEnfant + '%'
                            }
                        },
                        {
                            idUser: userId
                        }
                    ]
                        }
                   });


            }else{
                lastName=await getUserLastName(userId);
                age=result.parameters.fields.number.numberValue
                   const e = await enfant.create({
                     nomPrenom:  nomEnfant+" "+lastName,
                     age: age,
                     idUser: userId
                 });

            }


            answer = `Les informations ont été enregistrées avec succès ✔️​`


        }

    }
/////SPECIALITE
    if (result.intent.displayName === "medecins - yes - specialité") {

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
      var con = await getConjoint(userId);
      var enfants =  await  getEnfant(userId);
      if(con==0){con="vous n'avez pas ajouté un conjoint à votre assurance"}
      if(enfants==0){enfants="vous n'avez pas ajouté d'enfant à votre assurance"}
      
      answer = `Voici la liste des personnes couvetes par votre assurance :\n\nEnfant :\n${formatDocNames(enfants)}\nConjoint :⭐ ${con}`;

  }
  ///////VISITE


  if (result.intent.displayName === "Consultation") {
    const visites = await getVisite();
 
      var myString ="\n"

      visites.forEach(visite => {
        myString=myString.concat(`⭐ ${visite.specialite}:${visite.honoraire} DT\n`);
        console.log(myString);

      });
     
    
      answer = `Voici la liste des honoraires par type de visite médicale : \n${myString}`

}

if (result.intent.displayName === "AjoutBulletin") {

     const role = await getUserRole(userId)

     if(role!=1){
         answer = 'Vous n"avez pas acces à cette fonctionnalité ❌'
     }


}

if (result.intent.displayName === "AjoutBulletin - details") {

    async function getDetails()
    {
        detailsArray = [];
        const idUnique = result.parameters.fields.idUnique.numberValue

        const numBulletin=result.parameters.fields.numBulletin.numberValue

        const honoraire=result.parameters.fields.honorair.numberValue

        const dateActe=result.parameters.fields.dateActe.stringValue

        const codeActe=result.parameters.fields.codeActe.numberValue

        if(idUnique){
            detailsArray.push(idUnique);
        }

        if(numBulletin){
            detailsArray.push(numBulletin);
        }
        if(honoraire){
            detailsArray.push(honoraire);
        }
        if(dateActe!=''){
            detailsArray.push(dateActe);
        }
        if(codeActe){
            detailsArray.push(codeActe);
        }
    
        if(detailsArray.length!=5){
            return 0
        }else
        return detailsArray
         
       
    }
    console.log("we good")
    const details = await getDetails();
    if(details!=0)
     console.log(details);
     if(details!=0){
        const designation = await getDesignation(details[4])
        console.log(designation.dataValues.Designation)
          const acteB = await db.acteBulletin.create({
              idUniqueUser: details[0],
              numBulletin: details[1],
              codeActe: details[4],
              date: details[3],
              honoraire:details[2],
              designation:designation.dataValues.Designation
           });

     }



}











//////ACTESMEDICAUX PAR CONTRAT
if (result.intent.displayName === "ActeMedical") {

   actes =await ActeContrat(userId);

   answer = actes
        

}


if (result.intent.displayName === "DetailsBulletin - numero") {
    const idUnique=await getIdUniqueUser(userId);
    details =await getActebyBulletinUser(result.queryText,idUnique);
    var myString =`Voici les détails du bulletin de numéro ${result.queryText}\n` 
    details.forEach(detail => {
       
     myString=myString.concat(`\n📑Acte: ${detail.dataValues.designation}\n📆Date: ${detail.dataValues.date}\n💰Honoraire: ${detail.dataValues.honoraire} DT\n`);
            
      
           
     });
    console.log(myString)
    return myString

 
 }






    return answer;

}














////////////////FUNCTIONS
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


function getContractPourcentage(id) {
    try {
        const ContractPourcentage = db.contrat.findByPk(id).then(contrat => contrat.pourcentage);
        return ContractPourcentage;
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


async function getUserLastName(id) {
    try {
        const userLastName = db.user.findByPk(id).then(user => user.lastName);
        return userLastName;
    } catch {

    }


}


async function getUserRole(idUser) {
    try {
        console.log("I m here 1 ")
        const roleId = await db.user.findByPk(idUser).then(user => user.idRole);
        // console.log(`I m here 2 ${roleId}`)
        // const roleNom = db.roles.findByPk(roleId).then(role => role.nom);
        // console.log(`I m here 3 ${roleNom}`)
        return roleId;
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

if(!enfant)return 0
else{
    const nomEnfant = enfants.map(enfant => enfant.nomPrenom);
return nomEnfant;
}

}



async function getConjoint(userId){

  const c = await conjoint.findOne({
    where:
      {idUser:userId}



});
if(!c){
    return 0
}else{
    const nomConjoint = c.nomPrenom;
    return nomConjoint;
}

}







async function getVisite(){
    const visite = await visiteMedicale.findAll({


  });
  //const nomVisite = visite.map(visite => visite.specialite);


  return visite;
  }








   ///////ACTE BY BULLETIN AND USER
   async function getActebyBulletinUser(numBulletin,idUniqueUser){
    const actes = await acteBulletin.findAll({
        where: {

            [Op.and]: [{
                numBulletin: numBulletin
                },
                {
                    idUniqueUser: idUniqueUser
                }
            ]
        }
    });

    return actes
   }


   ///////GET ID UNIQUE USER

   async function getIdUniqueUser(idUser){
    const user = await db.user.findOne({
        where: { id: idUser}
    
    });
    const userIdUnique = user.idUnique
    return userIdUnique
   }



///////DESIGNATION ACTE
async function getDesignation(codeActe){
    const acteDesignation = await remboursementActe.findOne({
    where: { code: codeActe}});
    return acteDesignation

}


/////ACTE MEDICAUX SELON CONTRAT
async function ActeContrat(idUser){
    nomC = await getContractName(idUser)
     const actes = await db.remboursementActe.findAll({
         where: {
            nomContrat: {
                [Op.like]: '%' + nomC + '%'
            }
         }


     });
    // console.log(actes)
   // console.log(actes[0].dataValues)
   var myString =`Voici les taux de rembousement ainsi que les plafonds des actes médicaux selon votre contrat de type ${nomC} \n`
     actes.forEach(acte => {
       
     myString=myString.concat(`\n📑Désignation: ${acte.dataValues.Designation}\n💹Taux Remboursement: ${acte.dataValues.tauxRemboursement} %\n💰plafond: ${acte.dataValues.plafond} DT\n`);
            
      
           
     });
    console.log(myString)
    return myString
   }
   