const express = require("express");
const app = express();
const { getTask } = require("./controllers/taskScheduler");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());

const port = 4000;

app.use(express.json());

app.get("/getTask", getTask).post("/getTask", getTask);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
