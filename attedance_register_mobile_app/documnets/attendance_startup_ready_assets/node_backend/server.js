
const express=require('express');
const jwt=require('jsonwebtoken');
const app=express();
app.use(express.json());

const SECRET="dev_secret";

app.post('/api/login',(req,res)=>{
 const token=jwt.sign({user:req.body.email},SECRET);
 res.json({token});
});

app.get('/api/attendance',(req,res)=>{
 res.json([{date:'2026-01-01',status:'Present'}]);
});

app.listen(3000,()=>console.log('Server running'));
