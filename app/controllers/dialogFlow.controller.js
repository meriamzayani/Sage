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
    runSample(req.body.text).then(data=>{
      res.send({Reply:data})
    })
  })

  
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg) {
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
    console.log('Detected intent');
    const result = responses[0].queryResult;
  
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
   if (result.intent) {
     console.log(`  Intent: ${result.intent.displayName}`);
    } else {
   }
   return result.fulfillmentText;
  }
