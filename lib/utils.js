const fs = require('fs');
const colors = require('colors');

const configJSONTemplate = fs.readFileSync('./res/tw2csv.config.json.template');

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