import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const leads = [
  { name: 'Halifax Central Library', type: 'Public Service' },
  { name: 'The Piece Hall', type: 'Historic Site' },
  { name: 'Dean Clough', type: 'Business Park' },
  { name: "Eureka! The National Children's Museum", type: 'Museum' },
  { name: 'Holdsworth House', type: 'Hotel' }
];

const outputPath = path.join(__dirname, 'leads.json');
fs.writeFileSync(outputPath, JSON.stringify(leads, null, 2));
console.log('✅ Leads saved to ' + outputPath);
