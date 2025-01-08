const mongoose = require('mongoose');

const fridgeItemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    quantity: {
        value: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            required: true,
            enum: ['grams', 'kg', 'pieces', 'ml', 'liters', 'cups', 'tbsp', 'tsp']
        }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt timestamp before saving
fridgeItemSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const FridgeItem = mongoose.model('FridgeItem', fridgeItemSchema);

module.exports = FridgeItem; 