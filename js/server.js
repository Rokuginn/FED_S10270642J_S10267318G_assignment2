const express = require('express');
const cors = require('cors'); // Import the cors package
const multer = require('multer'); // Import multer for file uploads
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Serve uploaded files

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public/uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Connect to MongoDB Cluster
const mongoURI = 'mongodb+srv://Rokuginn:ac,1300101@mokesellcluster.8luqw.mongodb.net/?retryWrites=true&w=majority&appName=MokeSellCluster';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for user login information
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Add following field
});

const User = mongoose.model('User', userSchema);

// Define a schema and model for listings
const listingSchema = new mongoose.Schema({
    partName: String,
    category: String,
    condition: String,
    price: Number,
    description: String,
    imagePath: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Add userId field
    date: { type: Date, default: Date.now }
});

const Listing = mongoose.model('Listing', listingSchema);

// Handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ success: true, userId: user._id, username: user.username, profilePicture: 'path/to/profile-picture.jpg' });
    } else {
        res.json({ success: false });
    }
});

// Handle registration requests
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log('Register request received:', { username, email, password });

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists' });
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.json({ success: true, userId: newUser._id, username: newUser.username, profilePicture: 'path/to/profile-picture.jpg' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Handle listing submissions
app.post('/listing', upload.single('image'), async (req, res) => {
    const { partName, category, condition, price, description, userId } = req.body; // Include userId
    const imagePath = '/uploads/' + req.file.filename; // Ensure the correct relative path
    try {
        const newListing = new Listing({ partName, category, condition, price, description, imagePath, userId });
        await newListing.save();
        console.log('New listing created:', newListing); // Log the new listing
        res.json({ success: true, listing: newListing });
    } catch (error) {
        console.error('Error during listing submission:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Fetch listings for a specific user
app.get('/listings', async (req, res) => {
    const { userId } = req.query; // Get userId from query parameters
    try {
        const user = await User.findById(userId).populate('following');
        const followingIds = user.following.map(user => user._id);
        const listings = await Listing.find({ userId: { $in: followingIds } });
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Handle follow requests
app.post('/follow', async (req, res) => {
    const { followerId, followingId } = req.body;
    try {
        const follower = await User.findById(followerId);
        const following = await User.findById(followingId);
        if (!follower.following.includes(followingId)) {
            follower.following.push(followingId);
            await follower.save();
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Already following' });
        }
    } catch (error) {
        console.error('Error during follow:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Handle unfollow requests
app.post('/unfollow', async (req, res) => {
    const { followerId, followingId } = req.body;
    try {
        const follower = await User.findById(followerId);
        follower.following = follower.following.filter(id => id.toString() !== followingId);
        await follower.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error during unfollow:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});