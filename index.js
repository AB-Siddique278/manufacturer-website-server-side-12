const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const { ObjectID } = require('bson');
require('dotenv').config();
const app = express()
const port =process.env.PORT||8000
 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ewthq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('motor_parts').collection('services');
        const bookingCollection = client.db('motor_parts').collection('bookings');

        //for all service
        app.get('/service', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        // service for id
        app.get('/service/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectID(id)};
            const services = await serviceCollection.findOne(query);
            res.send(services);
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
