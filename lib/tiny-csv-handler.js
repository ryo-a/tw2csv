const fs = require('fs');
const colors = require('colors');

exports.dataAppend = function dataAppend(filePath, data) {
  console.log(`${colors.green('write')} : ${generateFromArray(data).toString()}`);
  fs.appendFile(filePath, generateFromArray(data) + '\r\n', 'utf-8', (err) =>{
    if (err) throw err;
  });
}

function generateFromArray(data) {
  let column = ''; //init
  data.forEach(element => {
    if (column) { //最初でない場合
      column += ',';
    }
    if (typeof (element) != 'string') {
      element = String(element);
    }
    element = element.replace(/"/g, '""').replace(/(\r\n|\n\r|\n|\r)/g, ' ');
    column += '"' + element + '"'
  });

  return column;
}
