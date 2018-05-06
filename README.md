# tw2csv

Useful CLI tool for collecting tweets.

If you haven't set up Node.js environment, you should install it.  

## Install

```
npm install -g tw2csv
```

## How to use

At first, get your application's keys from [apps.twitter.com](https://apps.twitter.com/) and setup command.

```sh
# directory name "tweets" is just an example
$ mkdir ~/tweets
$ cd ~/tweets
$ tw2csv
```

If there isn't `tw2csv-config.json`, tw2csv will generate it automatically.
You have to set Twitter app's keys to `tw2csv-config.json` like below.

```json
{
    "consumer_key": "***************************",
    "consumer_secret": "***************************",
    "access_token_key": "***************************",
    "access_token_secret": "***************************",
    "output_dir": "./"
}
```

Then you can run tw2csv!

```sh
$ tw2csv search "Node.js" results.csv
```

## Commands

### Search Tweets

REST API: `search/tweets`

```sh
$ tw2csv search "KEYWORDS FOR SEARCH" OUTPUT_FILENAME.csv
```

### Search Tweets from Stream
_(expetimental)_

```sh
$ tw2csv stream "KEYWORDS FOR SEARCH" OUTPUT_FILENAME.csv
```

### Check API Access Limits

```sh
$ tw2csv limit
```


