const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config();

async function signup(req, res) {
  const { username, password, email } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    });

    const result = await newUser.save();

    const token = jwt.sign(
      { id: result._id },
      process.env.JWT_SECRET_KEY,
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
    const user = await User.findById(currentID)
      .populate("repositories") 
      .populate("starRepos");   

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
  const { email, password, description, profileImage } = req.body;

  try {
    let updateFields = { email };

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
  const { id } = req.body;
  const user = req.params.userId;

  try {
    const currentUser = await User.findById(user);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    const index = currentUser.starRepos.indexOf(id);

    if (index === -1) {
      currentUser.starRepos.push(id);
      await currentUser.save();
      return res.json({ message: "Repository starred!", starred: true });
    } else {
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