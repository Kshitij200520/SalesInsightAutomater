const csv = require('csv-parser');
const stream = require('stream');
const xlsx = require('xlsx');

function parseFile(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    if (mimetype === 'text/csv') {
      const results = [];
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    } else {
      try {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const results = xlsx.utils.sheet_to_json(worksheet);
        resolve(results);
      } catch (err) {
        reject(err);
      }
    }
  });
}

module.exports = { parseFile };
