const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("database connected successfully!");
  })
  .catch((err) => {
    console.log("something error,", err);
  });