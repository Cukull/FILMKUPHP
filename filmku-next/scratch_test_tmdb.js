const axios = require('axios');
const fs = require('fs');

const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/TMDB_API_KEY=([^\s]+)/);
const key = match ? match[1].replace(/['"]/g, '') : null;

async function run() {
  const resId = await axios.get('https://api.themoviedb.org/3/discover/tv?api_key=' + key + '&language=id-ID&with_original_language=zh&sort_by=popularity.desc&page=1');
  const resEn = await axios.get('https://api.themoviedb.org/3/discover/tv?api_key=' + key + '&language=en-US&with_original_language=zh&sort_by=popularity.desc&page=1');
  console.log('id-ID titles:', resId.data.results.slice(0,5).map(r => ({ id: r.id, name: r.name, original_name: r.original_name })));
  console.log('en-US titles:', resEn.data.results.slice(0,5).map(r => ({ id: r.id, name: r.name, original_name: r.original_name })));
}

run();
