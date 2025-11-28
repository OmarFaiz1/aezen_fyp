// saveStructure.js
const fs = require("fs");
const path = require("path");

let output = "Project Structure:\n\n";

function buildTree(dir, prefix = "") {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach((file, index) => {
        const isLast = index === files.length - 1;
        const connector = isLast ? "└── " : "├── ";
        output += prefix + connector + file.name + "\n";

        if (file.isDirectory()) {
            const newPrefix = prefix + (isLast ? "    " : "│   ");
            buildTree(path.join(dir, file.name), newPrefix);
        }
    });
}

// Run from project root
const projectRoot = process.cwd();
buildTree(projectRoot);

// Save to txt file in root
fs.writeFileSync(path.join(projectRoot, "project-structure.txt"), output, "utf-8");

console.log("✅ Project structure saved to project-structure.txt");
