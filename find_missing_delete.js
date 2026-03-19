const fs = require('fs');
const path = require('path');

function findControllers(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findControllers(filePath, fileList);
    } else if (filePath.endsWith('.controller.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const controllers = findControllers('e:/laragon/MVC-Thang-May/src');
const missingDelete = [];
const hasDelete = [];

for (const controller of controllers) {
  const content = fs.readFileSync(controller, 'utf8');
  if (!content.includes('@Delete')) {
    missingDelete.push(controller.replace(/\\/g, '/').replace('e:/laragon/MVC-Thang-May/src/', ''));
  } else {
    hasDelete.push(controller.replace(/\\/g, '/').replace('e:/laragon/MVC-Thang-May/src/', ''));
  }
}

fs.writeFileSync('e:/laragon/MVC-Thang-May/missing_delete.json', JSON.stringify({ missingDelete, hasDelete }, null, 2));
