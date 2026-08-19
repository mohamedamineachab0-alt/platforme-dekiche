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

function applyNeoBrutalism(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Shadows
  content = content.replace(/\bshadow-sm\b/g, "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
  content = content.replace(/\bshadow-md\b/g, "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
  content = content.replace(/\bshadow-lg\b/g, "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
  content = content.replace(/\bshadow-xl\b/g, "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
  content = content.replace(/\bshadow-inner\b/g, "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");

  // 2. Borders
  content = content.replace(/\bborder-slate-\d+\b/g, "border-[#000000]");
  content = content.replace(/\bborder-sky-\d+\b/g, "border-[#000000]");
  content = content.replace(/\bborder-blue-\d+\b/g, "border-[#000000]");
  content = content.replace(/\bborder-gray-\d+\b/g, "border-[#000000]");
  
  content = content.replace(/(?<!-)\bborder\b(?!-\[)/g, "border-[3px] border-[#000000]");
  content = content.replace(/border-\[3px\] border-\[#000000\] border-\[#000000\]/g, "border-[3px] border-[#000000]");

  // 3. Backgrounds
  content = content.replace(/\bbg-white\b/g, "bg-[#FFFFFF]");
  content = content.replace(/\bbg-slate-50\b/g, "bg-[#F8F9FA]");
  
  content = content.replace(/\bbg-sky-500\b/g, "bg-[#7E22CE] text-[#FFFFFF]");
  content = content.replace(/\bbg-sky-600\b/g, "bg-[#4C1D95] text-[#FFFFFF]");
  content = content.replace(/\bbg-blue-600\b/g, "bg-[#7E22CE] text-[#FFFFFF]");
  content = content.replace(/\bbg-indigo-600\b/g, "bg-[#7E22CE] text-[#FFFFFF]");
  
  // 4. Typography
  content = content.replace(/\bfont-semibold\b/g, "font-bold");
  content = content.replace(/\bfont-medium\b/g, "font-bold");
  
  content = content.replace(/\btext-xl\b/g, "text-xl font-black");
  content = content.replace(/\btext-2xl\b/g, "text-2xl font-black");
  content = content.replace(/\btext-3xl\b/g, "text-3xl font-black");
  content = content.replace(/\btext-4xl\b/g, "text-4xl font-black");
  content = content.replace(/font-black font-black/g, "font-black");

  // 5. Text colors
  content = content.replace(/\btext-slate-900\b/g, "text-[#000000]");
  content = content.replace(/\btext-slate-700\b/g, "text-[#000000]");
  content = content.replace(/\btext-slate-500\b/g, "text-[#000000]");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

const rootDir = '/Users/istore/platforme';
if (!fs.existsSync(path.join(rootDir, 'scripts'))) {
  fs.mkdirSync(path.join(rootDir, 'scripts'));
}

['app', 'components'].forEach(dir => {
  walkDir(path.join(rootDir, dir), applyNeoBrutalism);
});
console.log("Neo-Brutalism styling application complete.");
