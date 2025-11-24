const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config();

async function signup(req, res) {
  const { username, password, email } = req.body;
  try {
    // 1. Check if user exists using Mongoose
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and Save User
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    });

    const result = await newUser.save();

    // 4. Generate Token
    const token = jwt.sign(
      { id: result._id },
      process.env.JWT_SECRET_KEY, // Ensure this matches your .env file
      { expiresIn: "1h" }
    );
    res.json({ token, userId: result._id });
  } catch (err) {
    console.error("Error during signup : ", err.message);
    res.status(500).send("Server error");
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login : ", err.message);
    res.status(500).send("Server error!");
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).send("Server error!");
  }
}

async function getUserProfile(req, res) {
  const currentID = req.params.id;
  try {
    const user = await User.findById(currentID);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.send(user);
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).send("Server error!");
  }
}

async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  // 👇 Accept new fields
  const { email, password, description, profileImage } = req.body; 

  try {
    let updateFields = { email };
    
    // Add optional fields if they exist
    if (description !== undefined) updateFields.description = description;
    if (profileImage !== undefined) updateFields.profileImage = profileImage;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const result = await User.findByIdAndUpdate(
      currentID,
      { $set: updateFields },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.send(result);
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).send("Server error!");
  }
}
async function deleteUserProfile(req, res) {
  const currentID = req.params.id;
  try {
    const result = await User.findByIdAndDelete(currentID);
    if (!result) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).send("Server error!");
  }
}

  async function likeRepo(req, res) {
  const { id } = req.body; // Repository ID
  const user = req.params.userId; // User ID (passed in URL)

  try {
    const currentUser = await User.findById(user);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check if repo is already starred
    const index = currentUser.starRepos.indexOf(id);

    if (index === -1) {
      // Not starred yet -> Add it
      currentUser.starRepos.push(id);
      await currentUser.save();
      return res.json({ message: "Repository starred!", starred: true });
    } else {
      // Already starred -> Remove it
      currentUser.starRepos.splice(index, 1);
      await currentUser.save();
      return res.json({ message: "Repository unstarred!", starred: false });
    }
  } catch (err) {
    console.error("Error during starring repository : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  likeRepo,
};