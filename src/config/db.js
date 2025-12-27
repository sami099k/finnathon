const mongoose = require('mongoose');
// require("dotenv").config();
 async function connectToDatabase(uri) {
//   if (!uri) {
//     throw new Error('MONGODB_URI is not set');
//   }

  await mongoose.connect(uri);
  return mongoose.connection;
}

module.exports = connectToDatabase;
