const express = require("express"); //Line 1
const cors = require("cors");
const app = express(); //Line 2
const port = process.env.PORT || 5000; //Line 3
const amrConfigYaml = require("./routes/amrConfigYaml");

app.use(cors());
app.use(express.json());
app.use("/api/amr-config", amrConfigYaml);

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

// create a GET route
app.get("/", (req, res) => {
  //Line 9
  res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" }); //Line 10
}); //Line 11
