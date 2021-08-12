const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }
    ]
},{
    timestamps: true
});

module.exports = mongoose.model('Favourite', favouriteSchema);