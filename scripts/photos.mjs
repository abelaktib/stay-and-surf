import sharp from 'sharp'; import fs from 'fs';
const dir = process.argv[2];
const files = fs.readdirSync(dir).filter(f => f.startsWith('WhatsApp')).sort();
const names = ['sdb-vasque','chambre-double','sdb-baignoire','couloir-arches','cuisine','chambre-double-arche','dortoir','salon','salon-pompons','rooftop-nuit','facade','facade-escalier','salon-lumiere','chambre-double-rose','salon-table','salon-banquette','sdb-porte','rooftop-jour'];
for (let i = 0; i < files.length; i++) {
  const img = sharp(dir + files[i]).rotate();
  const meta = await img.metadata();
  await img.resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`public/photos/${names[i]}.webp`);
  console.log(names[i], meta.width + 'x' + meta.height);
}
