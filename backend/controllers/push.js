const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");
const Repository = require("../models/repoModel");

async function pushRepo() {
    const repoPath = path.resolve(process.cwd(), ".Commitly");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const configData = await fs.readFile(path.join(repoPath, "config.json"));
        const config = JSON.parse(configData);
        const repoId = config.repoId;

        const commitDirs = await fs.readdir(commitsPath);
        for (const commitDir of commitDirs) {
            const commitPath = path.join(commitsPath, commitDir);
            const files = await fs.readdir(commitPath);

            for (const file of files) {
                if(file === "commit.json") continue;

                const filePath = path.join(commitPath, file);
                const fileContent = await fs.readFile(filePath, "utf-8");
                const params = {
                    Bucket: S3_BUCKET,
                    Key: `commits/${commitDir}/${file}`,
                    Body: fileContent,
                };
    
                await s3.upload(params).promise();
         
         
                //Update MongoDB for the Web View
                const repo = await Repository.findById(repoId);
                if (repo) {
                    // Check if file exists in content array
                    const existingFileIndex = repo.content.findIndex(f => f.name === file);
                    
                    if (existingFileIndex > -1) {
                        // Update existing file
                        repo.content[existingFileIndex].content = fileContent;
                    } else {
                        // Add new file
                        repo.content.push({ name: file, content: fileContent });
                    }
                    
                    // Log the commit in history
                    repo.commits.push({
                        message: `Pushed from CLI: ${commitDir.substring(0, 7)}`,
                        date: new Date()
                    });

                    await repo.save();
                }
            }
        }

        console.log("All commits pushed to S3 and synced with MongoDB.");
    } catch (err) {
        console.error("Error pushing to S3/DB : ", err);
    }
}

module.exports = { pushRepo };