const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors'); // Import the cors package
const multer = require('multer'); // Import multer for file uploads
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Grid = require('gridfs-stream');
const { GridFsStorage } = require('multer-gridfs-storage');

const app = express();
const port = 3000;

// Enable CORS for all requests
app.use(cors({
    origin: 'https://your-frontend-domain.com', // Replace with your frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// Connect to MongoDB Cluster
const mongoURI = 'mongodb+srv://username:password@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority';
const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000 // Increase socket timeout to 45 seconds
});

let gfs;
conn.once('open', () => {
    // Initialize GridFS stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Set up GridFS storage for multer
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            bucketName: 'uploads', // Bucket name should match the collection name
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});
const upload = multer({ storage });

// Define a schema and model for user login information
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profilePicture: String,
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
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 }, // Add likes property
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Add likedBy field
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
    const imagePath = `/image/${req.file.id}`; // Use the file ID from GridFS
    try {
        console.log('Creating new listing with data:', { partName, category, condition, price, description, imagePath, userId });
        const newListing = new Listing({ partName, category, condition, price, description, imagePath, userId, date: new Date() });
        await newListing.save();
        console.log('New listing created:', newListing); // Log the new listing
        res.json({ success: true, listing: newListing });
    } catch (error) {
        console.error('Error during listing submission:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Serve images from GridFS
app.get('/image/:id', (req, res) => {
    const fileId = req.params.id;
    gfs.files.findOne({ _id: mongoose.Types.ObjectId(fileId) }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const readstream = gfs.createReadStream(file.filename);
        res.set('Content-Type', file.contentType);
        readstream.pipe(res);
    });
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
app.post('/updateProfilePicture', upload.single('newProfilePicture'), async (req, res) => {
    const { userId } = req.body;
    const newProfilePicturePath = `/image/${req.file.id}`; // Use the file ID from GridFS
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});