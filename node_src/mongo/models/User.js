const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    date: {
        default: Date.now, 
        type: Date
    }
});
const User = mongoose.model('User', UserSchema);

module.exports = User;