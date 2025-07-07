const Item = require("../models/Item");

// GET items
exports.getItems = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query.name = { $regex: new RegExp(search, "i") }; // case-insensitive
    }

    const items = await Item.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items." });
  }
};


// POST add item
exports.addItem = async (req, res) => {
  const { name, quantity, unit } = req.body;
  const item = new Item({ name, quantity, unit });
  await item.save();
  res.status(201).json(item);
};

// PUT update quantity
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const updated = await Item.findByIdAndUpdate(
    id,
    { quantity, updatedAt: Date.now() },
    { new: true }
  );

  res.json(updated);
};
