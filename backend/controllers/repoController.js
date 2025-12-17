const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues")
      .sort({ createdAt: -1 }) 
      .limit(10);              

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.find({ _id: id })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.find({ name })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  console.log(req.params);
  const { userID } = req.params;

  try {
    const repositories = await Repository.find({ owner: userID });

    // if (!repositories || repositories.length == 0) {
    //   return res.status(404).json({ error: "User Repositories not found!" });
    // }
    console.log(repositories);
    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.content.push(content);
    repository.description = description;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function createFile(req, res) {
  const { id } = req.params;
  const { name, content } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    
    repository.content.push({ name, content });

    repository.commits.push({
        message: `Created file: ${name}`,
        date: new Date()
    });

    await repository.save();

    res.status(201).json({ message: "File created successfully!", file: { name, content } });
  } catch (err) {
    console.error("Error during file creation : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchFileContent(req, res) {
  const { id, fileName } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    
    const file = repository.content.find((f) => f.name === fileName);

    if (!file) {
      return res.status(404).json({ error: "File not found!" });
    }

    res.json(file);
  } catch (err) {
    console.error("Error reading file : ", err.message);
    res.status(500).send("Server error");
  }
}

async function searchRepositories(req, res) {
  const { query } = req.query; 

  try {
  
    const repositories = await Repository.find({
      name: { $regex: query, $options: "i" },
      visibility: true 
    });

    res.json(repositories);
  } catch (err) {
    console.error("Error during search : ", err.message);
    res.status(500).send("Server error");
  }
}

async function updateFile(req, res) {
  const { id } = req.params;
  const { name, content } = req.body;

  try {
    
    const result = await Repository.updateOne(
      { _id: id, "content.name": name },
      { $set: { "content.$.content": content } } 
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "File not found!" });
    }

    res.json({ message: "File updated successfully!" });
  } catch (err) {
    console.error("Error updating file:", err.message);
    res.status(500).send("Server error");
  }
}
async function updateFile(req, res) {
  const { id } = req.params;
  const { name, content } = req.body;

  try {
    const result = await Repository.updateOne(
      { _id: id, "content.name": name },
      { 
          $set: { "content.$.content": content },
      
          $push: { commits: { message: `Updated file: ${name}`, date: new Date() } }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "File not found!" });
    }

    res.json({ message: "File updated successfully!" });
  } catch (err) {
    console.error("Error updating file:", err.message);
    res.status(500).send("Server error");
  }
}
async function deleteFile(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await Repository.updateOne(
      { _id: id },
      { 
          $pull: { content: { name: name } },
          
          $push: { commits: { message: `Deleted file: ${name}`, date: new Date() } }
      } 
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "File not found!" });
    }

    res.json({ message: "File deleted successfully!" });
  } catch (err) {
    console.error("Error deleting file:", err.message);
    res.status(500).send("Server error");
  }
}

async function forkRepository(req, res) {
  const { id } = req.params; 
  const { userId } = req.body; 

  try {
    const originalRepo = await Repository.findById(id);
    if (!originalRepo) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    
    const newRepo = new Repository({
      name: `fork-${originalRepo.name}`, 
      description: originalRepo.description,
      content: originalRepo.content, 
      commits: originalRepo.commits, 
      owner: userId, 
      visibility: originalRepo.visibility,
      issues: [] 
    });

    const savedRepo = await newRepo.save();

    
    await User.findByIdAndUpdate(userId, {
        $push: { repositories: savedRepo._id }
    });

    res.status(201).json({ message: "Repository forked successfully!", repo: savedRepo });
  } catch (err) {
    console.error("Error forking repository:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  createFile,       
  fetchFileContent,
  searchRepositories,
  updateFile, 
  deleteFile, 
  forkRepository,
};