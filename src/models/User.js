const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const user_schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: null
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
user_schema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to check password
user_schema.methods.compare_password = async function(candidate_password) {
    return bcrypt.compare(candidate_password, this.password);
};

const User = mongoose.model('User', user_schema);
module.exports = User;