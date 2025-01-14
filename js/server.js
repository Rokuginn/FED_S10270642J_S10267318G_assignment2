const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB Cluster
const mongoURI = 'mongodb+srv://Rokuginn:ac,1300101@mokesellcluster.8luqw.mongodb.net/?retryWrites=true&w=majority&appName=MokeSellCluster';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema and model for user login information
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});