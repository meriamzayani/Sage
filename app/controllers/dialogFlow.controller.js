const db = require("../models");

const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const sessionId = uuid.v4();

// Create a new session
const sessionClient = new dialogflow.SessionsClient({
  keyFilename:"./sage-bot-biqu-71937e2c122e.json"
});
const projectId = 'sage-bot-biqu';
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);


  exports.callDialogFlow=((req,res)=>{
    
    console.log(req.body.text);
    if(!req.body.text)
    return;
    runSample(req.body.text,req.userId).then(data=>{
      console.log('data', data);
      res.send({Reply:data})
    })
  })

  
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg,userId) {
    // A unique identifier for the given session
   
    // The text query request.
    const request = {
      session : sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: msg,
          // The language used by the client (en-US)
          languageCode: 'fr-CA',
        },
      },
    };
  
    // Send request and log result
    const responses = await sessionClient.detectIntent(request);

    const result = responses[0].queryResult;
   if (result.queryText.includes("contrat")) {
     const contractid = await getUserContractId(userId);
     console.log('contractid', contractid);
     const contractName =  await getContractName(contractid);
     console.log(contractName);
     response = `votre type de contrat est ${contractName}`
     return response;

    // console.log(getContractName(contractid));
     
   
    } else {
   }
   return result.fulfillmentText;
  }


   async function getUserContractId(userid) //async wra
  {
   //const id_contrat = db.user.findByPk(userid).then(user => user.id_contrat);
   //return id_contrat;

     const user = await  db.user.findByPk(userid);

   return user.id_contrat;
  }


  
 function getContractName(id)//why need try catch why await why then
  {
    try{
      const contratNom = db.contrat.findByPk(id).then(contrat => contrat.nom);
      return contratNom;
    }
    catch{

    }
   
    
  }