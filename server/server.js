require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const itemRoutes = require("./routes/items");
const receiptRoutes = require('./routes/receipt');
const app = express();
app.use(cors());

app.use("/api/items", itemRoutes);
app.use("/api/receipt", receiptRoutes); // 

app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(4000, () => console.log("🚀 Server running on http://localhost:4000"));
  })
  .catch(err => console.error("❌ MongoDB error:", err));
