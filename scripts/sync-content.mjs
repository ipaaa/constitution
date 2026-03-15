import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure your Google Spreadsheet CSV Export URLs here.
 * To get these: File > Share > Publish to Web > Select Sheet > CSV
 */
const CONFIG = {
  TRACK_1_CSV: process.env.TRACK_1_CSV_URL || '', 
  TRACK_2_CSV: process.env.TRACK_2_CSV_URL || '',
  OUTPUT_DIR: path.join(__dirname, '../src/data')
};

/**
 * Simple CSV to Array of Objects parser
 * Handles empty fields and quoted values reliably
 */
function parseCSV(csv) {
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    const obj = {};
    headers.forEach((header, i) => {
      let val = values[i] || '';
      obj[header] = val.trim();
    });
    return obj;
  });
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; // unescape ""
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function syncTrack1() {
  if (!CONFIG.TRACK_1_CSV) {
    console.warn('⚠️ TRACK_1_CSV_URL not set. Skipping Track 1 sync.');
    return;
  }
  
  console.log('⏳ Fetching Track 1 (History) data...');
  try {
    const res = await fetch(CONFIG.TRACK_1_CSV);
    const csv = await res.text();
    const rows = parseCSV(csv);
    
    // Transform rows to match HistoryEvent structure
    // We allow empty status for now as Track 1 might be mostly static, but supporting filter
    const data = rows
      .filter(row => !row.status || row.status.toLowerCase() === 'approved')
      .map(row => ({
        id: row.id,
        textbook: {
          chapter: row.chapter,
          content: row.content,
          handwriting: row.handwriting
        },
        reality: {
          year: row.year,
          title: row.title,
          ruling: row.ruling,
          bgImage: row.image_url
        }
      }));
    
    fs.writeFileSync(
      path.join(CONFIG.OUTPUT_DIR, 'history.json'),
      JSON.stringify(data, null, 2)
    );
    console.log(`✅ Track 1 sync complete. (${data.length} items)`);
  } catch (err) {
    console.error('❌ Track 1 sync failed:', err.message);
  }
}

async function syncTrack2() {
  if (!CONFIG.TRACK_2_CSV) {
    console.warn('⚠️ TRACK_2_CSV_URL not set. Skipping Track 2 sync.');
    return;
  }
  
  console.log('⏳ Fetching Track 2 (Discussions) data...');
  try {
    const res = await fetch(CONFIG.TRACK_2_CSV);
    const csv = await res.text();
    const rows = parseCSV(csv);
    
    // Transform rows and filter by Status Approved
    const data = rows
      .filter(row => row.status && row.status.toLowerCase() === 'approved')
      .map(row => ({
        id: row.id,
        category: row.category,
        title: row.title,
        author: row.author,
        year: row.year,
        abstract: row.abstract,
        link: row.link,
        views: row.views ? parseInt(row.views, 10) : undefined
      }));
    
    fs.writeFileSync(
      path.join(CONFIG.OUTPUT_DIR, 'discussions.json'),
      JSON.stringify(data, null, 2)
    );
    console.log(`✅ Track 2 sync complete. (${data.length} items)`);
  } catch (err) {
    console.error('❌ Track 2 sync failed:', err.message);
  }
}

async function main() {
  console.log('🚀 Starting Content Sync...');
  await Promise.all([syncTrack1(), syncTrack2()]);
  console.log('🏁 All sync tasks finished.');
}

main();
