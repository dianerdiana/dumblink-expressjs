const express = require('express');
const app = express();
const cors = require('cors');
const port = 5000;
const router = require('./routes/router');

require('dotenv').config();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api/v1/', router);

app.listen(port, () => console.log(`Server is running at port: ${port}`));
