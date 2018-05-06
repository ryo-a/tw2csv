const fs = require('fs');
const whitelist = require('../res/client-whitelist.json');

const configJSONTemplate =
`{
  "consumer_key": "PUT YOUR CONSUMER KEY HERE",
  "consumer_secret": "PUT YOUR CONSUMER KEY SECRET HERE",
  "access_token_key": "PUT YOUR ACCESS TOKEN HERE",
  "access_token_secret": "PUT YOUR ACCESS TOKEN SECRET HERE",
  "output_dir":"./"
}`;

const CSVHeader = '"created_at","id_str","text","source","lang","coordinates","retweet_count","favorite_count","user_id_str","user_screen_name","user_name","user_location","user_description","user_protected","user_statuses_count","user_friends_count","user_followers_count","user_listed_count","user_favourites_count","user_created_at","user_verified"\r\n';

module.exports = class utils {

  /**
   * statSyncを用いてファイルの存在を確認
   * @param {string} file ファイルパス
   */
  fileExists(file) {
    try {
      fs.statSync(file)
      return true
    } catch (err) {
      return false
    }
  }


  /**
   * botではないかを確認
   * @param {string} source Twitterクライアント名
   */
  isHuman(source) {
    for (let index in whitelist) {
      if (source.match(whitelist[index])) {
        return true;
      }
    }
    return false;
  }

  /**
   * リツイート（非公式含む）ではないかを確認
   * @param {string} source Twitterクライアント名
   */
  isRT(text){
    if(text.includes('RT @')){
      return true;
    } else{
      return false;
    }
  }

  /**
   * Key書き込み用のJSONを生成する
   * @method
   */
  generateJSON() {
    fs.writeFileSync('./tw2csv-config.json',configJSONTemplate);
  }

  generateBlankCSVwithHeader(fileName){
    fs.writeFileSync(fileName,CSVHeader);
  }

}