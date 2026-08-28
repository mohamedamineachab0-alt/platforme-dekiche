const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(
  '  subjectIds String[]        @default([])\n  streams   Stream[]         @default([])\n  quiz      Quiz? // One-to-one relation with AI Quiz',
  '  subjectIds String[]        @default([])\n  streams   Stream[]         @default([])\n  levels    Level[]          @default([])\n  isPublished Boolean        @default(true)\n  quiz      Quiz? // One-to-one relation with AI Quiz'
);

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Schema updated");
