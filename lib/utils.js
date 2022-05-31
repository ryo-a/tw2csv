const fs = require('fs');
const path = require('path');
const colors = require('colors');

const configJSONTemplatePath = path.join(process.argv[1], './res/tw2csv.config.json.template');
const configJSONTemplate = fs.readFileSync(configJSONTemplatePath);

console.log(configJSONTemplatePath);

module.exports = class utils {
  /**
   * generate JSON for Twitter authentication keys
   * @method
   */
  generateJSON() {
    fs.writeFileSync('./tw2csv.config.json', configJSONTemplate);
  }

  /**
   * removeLineBreak
   * @method
   */
  removeLineBreakFromString(targetString, enable = false) {
    if (enable == true) {
      return targetString.replace(/(\r\n|\n\r|\n|\r)/g, ' ');
    } else { //return as is
      return targetString;
    }
  }

  /**
   * decorate true/false
   * @method
   */
  decorateBoolean(targetBoolean) {
    if (targetBoolean == true) {
      return colors.cyan(targetBoolean);
    } else {
      return colors.gray(targetBoolean);
    }
  }
}