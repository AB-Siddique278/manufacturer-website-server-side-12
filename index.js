const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { ObjectID } = require('bson');
require('dotenv').config();
const app = express()
const port =process.env.PORT||8000
 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ewthq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
     const authorization =req.headers.authorization;
     if(!authorization){
         return res.status(401).send({message: 'UnAuthorization access'})
     }
     const token = authorization.split(' ')[1];
     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
         if(err){
             return res.status(403).send({message: 'Forbiden access'})
         }
         req.decoded=decoded;
         next();
     });
}




async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('motor_parts').collection('services');
        const bookingCollection = client.db('motor_parts').collection('bookings');
        const userCollection = client.db('motor_parts').collection('users');
        
        //for all service
        app.get('/service', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // make admin and users
        app.put('/user/:email', async(req, res)=>{
            const email=req.params.email;
            const user = req.body;
            const filter= {email:email};
            const options = {upsert: true};
            const updateDoc = {
                $set:user,

            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
            
            res.send({result,token});
        })

        // service for id
        app.get('/service/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectID(id)};
            const services = await serviceCollection.findOne(query);
            res.send(services);
        })

        //for dashbord bookin show 

        app.get('/booking', verifyJWT, async(req, res)=>{
            const customer_email = req.query.customer_email



            const decodedEmail = req.decoded.email
            if(customer_email===decodedEmail){
                const query ={customer_email: customer_email};
                const bookings = await bookingCollection.find(query).toArray();
               return res.send(bookings);

            }
            else{
                return res.status(403).send({message:'forbiden access'})
            }
         

        })


        //for booking service 
        app.post('/booking', async(req, res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send({success: true, result});
        })


    }
    finally{

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})
 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
