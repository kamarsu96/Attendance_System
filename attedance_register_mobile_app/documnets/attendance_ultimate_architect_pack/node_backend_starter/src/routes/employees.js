
const router = require('express').Router();

router.get('/', (req,res)=>{
  res.json({message:'List employees'});
});

router.post('/', (req,res)=>{
  res.json({message:'Create employee'});
});

module.exports = router;
