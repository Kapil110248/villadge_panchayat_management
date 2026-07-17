const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb+srv://kapil:09876@cluster0.zte6he4.mongodb.net/panchayat_db?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('panchayat_db');
    const employees = db.collection('employee');
    
    // Drop the unique index that is causing issues
    try {
      await employees.dropIndex("employee_user_id_key");
      console.log("Dropped index employee_user_id_key");
    } catch(e) {
      console.log("Could not drop index", e.message);
    }

    // Also remove duplicate nulls just in case
    const docs = await employees.find({ user_id: { $eq: null } }).toArray();
    console.log("Docs with null user_id:", docs.length);
    if (docs.length > 1) {
      for (let i = 1; i < docs.length; i++) {
        await employees.deleteOne({ _id: docs[i]._id });
        console.log("Deleted", docs[i]._id);
      }
    }

  } finally {
    await client.close();
  }
}

main().catch(console.dir);
