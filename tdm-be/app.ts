
import express from 'express';
const path = require('path');

const app = express();
const port = 3000;
const cors = require("cors")

// Serve static files from the 'build' directory


app.use(cors())
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', '_next','server','app', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public'));
});
app.listen(port, () => {
  console.log(`Running on ${port}`);
});