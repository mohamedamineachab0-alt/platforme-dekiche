const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function cleanupNeoBrutalism(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Fix directional borders
  // "border-[3px] border-[#000000]-b" -> "border-b-[3px] border-[#000000]"
  content = content.replace(/border-\[3px\] border-\[#000000\]-b/g, "border-b-[3px] border-[#000000]");
  content = content.replace(/border-\[3px\] border-\[#000000\]-t/g, "border-t-[3px] border-[#000000]");
  content = content.replace(/border-\[3px\] border-\[#000000\]-l/g, "border-l-[3px] border-[#000000]");
  content = content.replace(/border-\[3px\] border-\[#000000\]-r/g, "border-r-[3px] border-[#000000]");
  content = content.replace(/border-\[3px\] border-\[#000000\]-x/g, "border-x-[3px] border-[#000000]");
  content = content.replace(/border-\[3px\] border-\[#000000\]-y/g, "border-y-[3px] border-[#000000]");

  // 2. Remove broken specific colored borders
  // "border-[3px] border-[#000000]-amber-200" -> "border-[3px] border-[#000000]" (or just remove if already there)
  content = content.replace(/border-\[3px\] border-\[#000000\]-[a-z]+-\d+(?:\/\d+)?/g, "");
  
  // 3. Remove weird artifacts like border-[3px] border-[#000000]-dashed
  content = content.replace(/border-\[3px\] border-\[#000000\]-dashed/g, "border-dashed");
  content = content.replace(/border-\[3px\] border-\[#000000\]-none/g, "border-none");
  content = content.replace(/border-\[3px\] border-\[#000000\]-transparent/g, "border-transparent");
  content = content.replace(/border-\[3px\] border-\[#000000\]-\d/g, ""); // border-2 etc.
  
  // 4. Clean up duplicate consecutive border declarations
  // e.g. "border-[3px] border-[#000000] border-[3px] border-[#000000]"
  content = content.replace(/(border-\[3px\] border-\[#000000\]\s*)+/g, "border-[3px] border-[#000000] ");

  // 5. Clean up duplicate "border-[#000000]" (e.g. from border-b-[3px] border-[#000000] border-[3px] border-[#000000])
  content = content.replace(/border-[#000000] border-[#000000]/g, "border-[#000000]");
  content = content.replace(/border-\[3px\] border-\[3px\]/g, "border-[3px]");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned up: ${filePath}`);
  }
}

const rootDir = '/Users/istore/platforme';
['app', 'components'].forEach(dir => {
  walkDir(path.join(rootDir, dir), cleanupNeoBrutalism);
});
console.log("Cleanup script complete.");
