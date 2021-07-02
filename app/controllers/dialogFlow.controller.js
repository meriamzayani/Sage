const db = require("../models");
const { Op } = require("sequelize");

const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const { response } = require("express");
const { Medecins, medicament } = require("../models");
const sessionId = uuid.v4();

// Create a new session
const sessionClient = new dialogflow.SessionsClient({
  keyFilename:"./sage-bot-biqu-71937e2c122e.json"
});
const projectId = 'sage-bot-biqu';
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);


exports.callDialogFlow=((req,res)=>{
    
    
  if(!req.body.text)
  return;
  runSample(req.body.text,req.userId).then(data=>{
    res.send({Reply:data})
  })
  })

  
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId 
 */
async function runSample(msg,userId) {

    const request = {
      session : sessionPath,
      queryInput: {
        text: {
          text: msg,
          languageCode: 'fr-CA',
        },
      },
    };
  

    const responses = await sessionClient.detectIntent(request);
    let con={nomPrenom:"",cin:0}
    let enfant={nomPrenom:"",age:0}
    
    const result = responses[0].queryResult;
    answer = result.fulfillmentText;


   
      if(!isNaN(result.queryText)){
        console.log(result.queryText)
      }else{
        const med=await getMedicament(result.queryText);
        if (med) {
          const contractid = await getUserContractId(userId);
          const contratPlafond = await getContractPlafond(contractid);
          const contractName =  await getContractName(contractid);
  
          const remboursement = med.PRIX_PUBLIC-med.PRIX_PUBLIC*80/100;
          const roudRemboursement = Math.round((remboursement + Number.EPSILON) * 100) / 100
        answer =  `-Medicament: ${med.NOM_COMMERCIAL}\n\n-Prix: ${med.PRIX_PUBLIC} DT\n\nVous avez in contrat de type ${contractName} ${contratPlafond}% du prix du medicament sera remboursé soit :${roudRemboursement}DT`
       } else{
        // answer=`${result.fulfillmentText} n'est pas un médicament remboursable`
       }
      }

      console.log('result.intent.displayName: ', result.intent.displayName);
     
    ///CONTRAT
    if (result.intent.displayName==="contrat") {

      const contractid = await getUserContractId(userId);
      const contractName =  await getContractName(contractid);//is this not UnhandledPromiseRejectionWarning: TypeError: Assignment to constant variable.ffs???
      answer = `votre type de contrat est ${contractName} voulez vous avoir plus de détails sur votre contrat?`
     } 
     ///CONJOINT
    if (result.intent.displayName==="PersonnesAssurées - yes - conjoint - nom") {
      con.nomPrenom=result.queryText;
     
      con.nomPrenom=result.queryText;
      
      console.log(con);
      
     }
     if (result.intent.displayName==="PersonnesAssurées - yes - conjoint - cin") {
      con.cin=result.queryText;
      console.log(con);
     }
     if(result.intent.displayName==="PersonnesAssurées - yes - conjoint - nom - cin - yes"){
       //ajouter con à la base de donnée
       
       answer = `conjoint ajouté avec succès ✔️​`;
     }
     ///ENFANT
     if (result.intent.displayName=="PersonnesAssurées - yes - enfant - nom") {
      

     }
     if(result.intent.displayName=="PersonnesAssurées - yes - enfant - nom - age - yes"){
       //ajouter con à la base de donnée
       console.log(enfant);
       answer = `enfant ajouté avec succès ✔️​`;
     }
    ///SPECIALITE
    if (result.intent.displayName=="medecins - yes - specialité") {

      ville = await getUserVille(userId);  
      
      const medecins=await getMedecinByVilleSpecialite(ville,result.queryText)  ;
     
      answer = `je vois que vous habitez à ${ville}, voici la liste des medecins ${result.queryText} à ${ville}:\n\n${formatDocNames(medecins)}
      \nPlus de détail? ` ;
      
    }

    if (result.intent.displayName=="medecins - yes - specialité - detail - yes - name"){
      // answer=DetailMedecin(result.queryText)
      answer = DetailMedecin(result.queryText)
    }
      
   return answer;
  }


  ////////////////
  async function DetailMedecin(NomMedecin)
  {
    const doctor = await Medecins.findOne({
      where: {
        name: {
          [Op.like]: `%${NomMedecin}%`
        }
      }
   });

   if (doctor) {
     return `-Médecin: ${doctor.name}\n\n-Adresse complète: ${doctor.fulladdress}\n\n-NumTel: ${doctor.number}`;
   } else {
     return 'Il n"y aucun médecin avec ce nom ';
   }
  }

  function formatDocNames(names) {
    // const list = '';
    return names.reduce((nameListStr, name) => {
      console.log('iteration: ', nameListStr);
      return nameListStr.concat('- ', `${name}\n`);
    }, '');
  }


   async function getUserContractId(userid) //async wra
  {

     const user = await  db.user.findByPk(userid);

   return user.id_contrat;
  }


  
 function getContractName(id)
  {
    try{
      const contratNom = db.contrat.findByPk(id).then(contrat => contrat.nom);
      return contratNom;
    }
    catch{

    }
   
    
  }

  function getContractDetails(id)
  {
    try{
      const contratDetails = db.contrat.findByPk(id).then(contrat => contrat.description);
      return contratDetails;
    }
    catch{

    }
   
    
  }

  
  function getContractPlafond(id)
  {
    try{
      const contratPlafond = db.contrat.findByPk(id).then(contrat => contrat.plafond);
      return contratPlafond;
    }
    catch{

    }
   
    
  }

  function getUserVille(id)
  {
    try{
      const userVille = db.user.findByPk(id).then(user => user.ville);
      return userVille;
    }
    catch{

    }
   
    
  }


  async function getMedecinByVilleSpecialite(ville,specialite){
  
    const doctors = await Medecins.findAll({
      where: {
        
        [Op.and]: [
          {
            speciality: {
              [Op.like]: '%'+specialite+'%'
            }
          },
          {
            address: {
              [Op.like]: '%'+ville+' '+'%'
            }
          }
        ]
      }
   });
   const names = doctors.map(doctor => doctor.name);
   return names;
  }

  
  async function getMedicament(nomMedicament)
  {
    const med = await medicament.findOne({
      where: {
        NOM_COMMERCIAL: {
          [Op.like]: '%'+nomMedicament+'%'
        }
      }
   });

   return med;

   if (medicament) {
     return `-Medicament: ${medicament.NOM_COMMERCIAL}\n\n-Prix: ${medicament.PRIX_PUBLIC}}`;
   } else {
     return  `${nomMedicament} n'est pas un médicament remboursé`;
   }
  }










  // function getMedecinByVilleSpecialite(ville,specialite)
  // {
  //    try{
  //    const medecin = db.Medecins.findAll().then(medecins => {
  //      console.log(`nombre de medecins ${medecins.length}`)
  //      medecins.forEach(med => {
         
  //        if (med.address.includes("Ariana")&&(med.speciality.includes("Généraliste"))){ 
  //          console.log(`nom des medecins generaliste a tunis ${med.name}`);
  //        }
        
  //        });
  //      });
  //    return 1;
  //    }
  //    catch{

  //    }


  //    function getMedecinByVilleSpecialite(ville,specialite)
  //    {
  //       try{
  //          Medecins.findAll({
  //           where: {
  //             address: {
  //               [Op.like]: 'ariana %'
  //             },
  //             speciality: {
  //               [Op.like]: 'generaliste %'
  //             }
  //           }
  //          }).then(medecins=>{
  //            medecins.forEach(med => {
  //             console.log(`les medecins sont${med.name}`)
  //            });
             
  //          })
  //       }
  //       catch{
   
  //       }

  // }


 


