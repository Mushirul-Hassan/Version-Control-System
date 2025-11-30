// const fs = require('fs').promises;
// const path = require('path');
// const {v4:uuidv4} = require('uuid');

// async function commitRepo(message){
//     const repoPath = path.resolve(process.cwd(), ".Commitly");
//     const stagedPath = path.join(repoPath, "staging");
//     const commitPath = path.join(repoPath, "commits");

//     try {
//         const commitID = uuidv4();
//         const commitDir = path.join(commitPath, commitID);
//         await fs.mkdir(commitDir, { recursive: true });

//         const files = await fs.readdir(stagedPath);
//         for(const file of files){
//             await fs.copyFile(
//                 path.join(stagedPath, file),
//                 path.join(commitDir, file)
//             );

//         }

//         await fs.writeFile(
//             path.join(commitDir, "commit.json"),
//             JSON.stringify({ message, date: new Date().toISOString() })
//         );

//         console.log(`Commit ${commitID} created with message: ${message}` );
//     } catch (err) {
//         console.error("Error committing files : ", err);
//     }


//     }
// module.exports = { commitRepo };



const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".Commitly");
  const stagingPath = path.join(repoPath, "staging");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const commitID = uuidv4();
    const commitDir = path.join(commitsPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagingPath);
    if (files.length === 0) {
      console.log("No files to commit.");
      return;
    }

    // FIX: Use recursive copy logic instead of simple copyFile
    await copyRecursive(stagingPath, commitDir);

    // Save commit metadata
    const commitData = {
      message,
      date: new Date().toISOString(),
      id: commitID
    };
    
    await fs.writeFile(
      path.join(commitDir, "commit.json"), 
      JSON.stringify(commitData)
    );

    console.log(`Commit ${commitID} created with message: ${message}`);
    
    // Optional: Clear staging area after commit
    // await fs.rm(stagingPath, { recursive: true });
    // await fs.mkdir(stagingPath); 
    
  } catch (err) {
    console.error("Error committing files : ", err);
  }
}

// 👇 Helper function to copy folders recursively (Same as in add.js)
async function copyRecursive(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyRecursive(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

module.exports = { commitRepo };