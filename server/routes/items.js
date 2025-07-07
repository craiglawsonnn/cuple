const express = require("express");
const router = express.Router();
const controller = require("../controllers/itemController");

router.get("/", controller.getItems);
router.post("/", controller.addItem);
router.put("/:id", controller.updateItem);
router.delete("/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.sendStatus(204); // No Content
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item." });
  }
});


module.exports = router;
