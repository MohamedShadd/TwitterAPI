# External Twitter API

#### This API works by scraping the latest tweets from a user

## Features

- Fetch Tweets from a user without Twitter API keys

## Prerequisites

- NodeJS
- Username, password, and email or phone numnber of twitter account

## Setup

1. **Clone the repository:**

   ```console
   https://github.com/MohamedShadd/TwitterAPI.git
   cd TwitterAPI
   ```

2. **Setup Environment Variables:**

   Rename `.env.example` to `.env` then fill in the information

   ```env
   USERNAME= # username
   PASSWORD= # password
   VERIFICATION= # email or phone number
   ```

3. **Install dependencies:**

   run `npm i` to install the dependencies

4. **Run the server:**

   run `npm start` to start the server
   You should see a message in the console printing

   ```console
   API running on port 3333
   ```

   Now you can call the API using a get request

## Examples of running the API

##### OPENING IN BROWSER

You can directly open the link http://localhost:3333/fetchTweets?targetProfile=elonmusk in browser

##### FETCHING USING POSTMAN

- Create a new `GET` Request using the url http://localhost:3333/fetchTweets
- Insert a new Param called **targetProfile** with the value of the profile you are fetching tweets from
- Press Send to get the request

#### FETCHING IN PROGRAM USING e.g AXIOS

- install axios using `npm i axios`

```js
import axios from "axios";

const targetProfile = "elonmusk";

const checkForNewTweets = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3333/fetchTweets?targetProfile=${targetProfile}`
    );

    const tweets = response.data.tweets || [];
    console.log(tweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
  }
};

// Set interval to check for new tweets every 5 minutes
setInterval(checkForNewTweets, 5 * 60 * 1000);
```
