const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('/Users/sagarkumarverma/pasr_master/pasr-partner/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;
  
  if (content.includes('http://localhost:8080')) {
    content = content.replace(/\$\{process\.env\.BACKEND_URL \|\| 'http:\/\/localhost:8080'\}/g, "${process.env.BACKEND_URL || 'https://www.pasr.in'}");
    content = content.replace(/`http:\/\/localhost:8080/g, "`${process.env.BACKEND_URL || 'https://www.pasr.in'}");
    content = content.replace(/'http:\/\/localhost:8080/g, "'https://www.pasr.in");
    content = content.replace(/\"http:\/\/localhost:8080/g, "\"https://www.pasr.in");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
