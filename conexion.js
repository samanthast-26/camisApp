const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://samcita:clavecita26@cluster0.v0beqat.mongodb.net/?appName=Cluster0';

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB en la nube conectado correctamente");

  } finally {
    await client.close();
  }
}

run().catch(console.error);

module.exports = conectarDB;