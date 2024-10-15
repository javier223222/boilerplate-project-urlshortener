require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns =require("node:dns")
const isNumber = require('is-number'); 
const app = express();
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const {Schema}=mongoose

main().then(()=>{
  console.log('Connected to MongoDB');
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const UrlSchema=new Schema({
  
  originalUrl:{type:String,required:true}

})
UrlSchema.plugin(AutoIncrement, {inc_field: 'shortUrl'});

const Url=mongoose.model('Url',UrlSchema)






app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// Basic Configuration
const port = process.env.PORT || 3000;


app.use(cors());



app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function dnsmiddleware(req,res,next){
  const options={
    all:true
  }
  let {url}=req.body
  url=new URL(url)
  

  dns.lookup(url.hostname,options,(err,address,family)=>{
    if(err){
      console.log(err)
      res.json({"error":"Invalid URL"})
    }else{
      next()
    }
  })
  

}

  app.post('/api/shorturl/',dnsmiddleware,async (req, res) => {
    const {url}=req.body
    const result=await Url.create({originalUrl:url})
    res.json(result)
    
    
  });
  app.get('/api/shorturl/:short_url',async (req, res) => {
    const shortUrl = req.params.short_url;
    const urldb=await Url.findOne({shortUrl:shortUrl})
    res.redirect(urldb.originalUrl)
  
    
  });
  

  


  

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
