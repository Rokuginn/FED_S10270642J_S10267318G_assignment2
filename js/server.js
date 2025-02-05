const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors'); // Import the cors package
const multer = require('multer'); // Import multer for file uploads
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Ensure the /mnt/data/uploads directory exists
const uploadDir = path.join('/mnt/data', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory
app.use('/uploads', express.static(uploadDir)); // Serve uploaded files

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
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
    brand: String, // Add brand field
    category: String,
    condition: String,
    price: Number,
    description: String,
    imagePaths: [String], // Change to an array to store multiple image paths
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Add userId field
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 }, // Add likes property
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Add likedBy field
});

const Listing = mongoose.model('Listing', listingSchema);

// Handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request received:', { username, password });
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            console.log('Login successful:', user);
            res.json({ success: true, userId: user._id, username: user.username, profilePicture: 'path/to/profile-picture.jpg' });
        } else {
            console.log('Login failed: User not found');
            res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Handle registration requests
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log('Register request received:', { username, email, password });

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Registration failed: Username already exists');
            return res.json({ success: false, message: 'Username already exists' });
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        console.log('Registration successful:', newUser);
        res.json({ success: true, userId: newUser._id, username: newUser.username, profilePicture: 'path/to/profile-picture.jpg' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Handle listing submissions
app.post('/listing', upload.array('images', 4), async (req, res) => {
    const { partName, brand, category, condition, price, description, userId } = req.body; // Include brand
    const imagePaths = req.files.map(file => '/uploads/' + file.filename); // Ensure the correct relative path
    try {
        console.log('Creating new listing with data:', { partName, brand, category, condition, price, description, imagePaths, userId });
        const newListing = new Listing({ partName, brand, category, condition, price, description, imagePaths, userId, date: new Date() });
        await newListing.save();
        console.log('New listing created:', newListing); // Log the new listing
        res.json({ success: true, listing: newListing });
    } catch (error) {
        console.error('Error during listing submission:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Fetch all listings
app.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find();
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Fetch listings for a specific user
app.get('/listings/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const listings = await Listing.find({ userId });
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Fetch a single listing by ID
app.get('/listing/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (listing) {
            res.json(listing);
        } else {
            res.status(404).json({ success: false, message: 'Listing not found' });
        }
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Fetch user information
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
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

// Handle like/unlike requests
app.post('/listings/:id/like', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // Get the userId from the request body
    try {
        const listing = await Listing.findById(id);
        if (listing) {
            const userIndex = listing.likedBy.indexOf(userId);
            if (userIndex === -1) {
                // User has not liked the listing, so add their ID
                listing.likedBy.push(userId);
                listing.likes += 1;
            } else {
                // User has already liked the listing, so remove their ID
                listing.likedBy.splice(userIndex, 1);
                listing.likes = Math.max(0, listing.likes - 1); // Ensure likes don't go below 0
            }
            await listing.save();
            res.json({ success: true, likes: listing.likes, likedBy: listing.likedBy });
        } else {
            res.status(404).json({ success: false, message: 'Listing not found' });
        }
    } catch (error) {
        console.error('Error liking/unliking listing:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Handle delete requests
app.delete('/listings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findByIdAndDelete(id);
        if (listing) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Listing not found' });
        }
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Handle profile picture update
app.post('/updateProfilePicture', upload.array('newProfilePicture', 1), async (req, res) => {
    const { userId } = req.body;
    const newProfilePicturePath = '/uploads/' + req.files[0].filename;
    try {
        const user = await User.findById(userId);
        if (user) {
            user.profilePicture = newProfilePicturePath;
            await user.save();
            res.json({ success: true, profilePicture: newProfilePicturePath });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to serve images from the uploads directory
app.get('/images/:imageName', (req, res) => {
    const { imageName } = req.params;
    const imagePath = path.join(uploadDir, imageName);
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send('Image not found');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});