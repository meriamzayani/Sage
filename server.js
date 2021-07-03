const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./app/models");



const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));

// database
const Role = db.role;

db.sequelize.sync({
  //alter:true
});
// force: true will drop the table if it already exists
 /*db.sequelize.sync({force: true}).then(() => {
   console.log('Drop and Resync Database with { force: true }');
   initial();
 });
*/
// simple route
app.get("/", (req, res) => {
  res.json({ message: " application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/dialogFlow.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });
 
  Role.create({
    id: 2,
    name: "moderator"
  });
 
  Role.create({
    id: 3,
    name: "admin"
  });
}