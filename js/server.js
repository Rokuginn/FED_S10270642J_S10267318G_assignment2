const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB Cluster
const mongoURI = 'mongodb+srv://Rokuginn:ac,1300101@mokesellcluster.8luqw.mongodb.net/?retryWrites=true&w=majority&appName=MokeSellCluster';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for user login information
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ success: true, username: user.username, profilePicture: 'path/to/profile-picture.jpg' }); // Include username and profile picture in response
    } else {
        res.json({ success: false });
    }
});

// Handle registration requests
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log('Register request received:', { username, email, password }); // Log the request data

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists' });
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.json({ success: true, username: newUser.username, profilePicture: 'path/to/profile-picture.jpg' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});