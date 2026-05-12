
const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req,res)=> res.send({status:'OK'}));

app.use('/api/employees', require('./src/routes/employees'));

app.listen(3000, ()=> console.log('Server running on port 3000'));
