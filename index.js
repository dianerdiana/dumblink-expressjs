const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 5000;
const router = require('./routes/router');

require('pg');
require('dotenv').config();

app.use(express.json());
app.use(
  cors({
    origin: true,
  })
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api/v1/', router);
app.use('/uploads/', express.static(path.join(__dirname, 'uploads')));
app.use('/public/', express.static(path.join(__dirname, 'public')));

app.listen(port, () => console.log(`Server is running at port: ${port}`));
