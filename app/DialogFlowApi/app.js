const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const express = require ("express");
const bodyParser = require ("body-parser");
const app = express();
const port = 5000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
const sessionId = uuid.v4();

// Create a new session
const sessionClient = new dialogflow.SessionsClient({
  keyFilename:"./sage-bot-biqu-71937e2c122e.json"
});
const projectId = 'sage-bot-biqu';
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);


app.post("/send-msg",(req,res)=>{
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
app.listen(port,()=>{
  console.log("running on port"+port);
})