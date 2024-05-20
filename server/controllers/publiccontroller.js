const User = require("../models/userModel");
const Post = require("../models/postModel");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

async function getPublicPosts(req, res) {
  try {
    const posts = await Post.getPublicPosts();
    res.status(200).json(posts);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

async function updateUpvotes(req, res) {
  try {
    const { id, userObj } = req.body;
    console.log("id, userObj: ", id, userObj);
    const post = await Post.updateUpvotes(id, userObj);
    res.status(200).json(post);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

async function updateDownvotes(req, res) {
  try {
    const { id, userObj } = req.body;
    console.log("id, userObj: ", id, userObj);
    const post = await Post.updateDownvotes(id, userObj);
    res.status(200).json(post);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

async function addComment(req, res) {
  try {
    const { id, author, content } = req.body;
    const post = await Post.addComment(id, author, content);
    res.status(200).json(post);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

async function getPostById(req, res) {
  try {
    console.log(req.query.id);
    const post = await Post.findById(req.query.id);
    console.log(post);
    res.status(200).json(post);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

async function getPublicInfo(req, res) {
  const username = req.query.username;
  try {
    const publicinfo = await User.getPublicInfo(username);
    res.status(200).json(publicinfo);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

async function getMostFollowedUsers(req, res) {
    try {
        const mostFollowedUsers = await User.find().sort({followers: -1}).limit(10);
        // console.log(mostFollowedUsers);
        const response = mostFollowedUsers.map((user) => {
            return {
                id: user._id,
                username: user.username,
                avtar: user.avtar,
            }
        })
        res.status(200).json(response);
    }catch(error) {
        console.log(error.message);
        res.status(400).json({ error: error.message });
    
    }
}

async function handleFiles(req, res) {
  try {
    const filename = req.query.filename;
    const client = await mongoClient.connect(process.env.MONGO_URI);
    const db = client.db(process.env.DB_NAME);
    const bucket = new mongodb.GridFSBucket(db, {
      bucketName: "uploads",
    });

    const file = await bucket.find({ filename: filename }).toArray();

    if(file.length === 0 || !file) {
      throw Error("File not found");
    }

    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getPublicPosts,
  updateUpvotes,
  updateDownvotes,
  addComment,
  getPostById,
  getPublicInfo,
  getAllUsers,
  getMostFollowedUsers,
  handleFiles,
};
