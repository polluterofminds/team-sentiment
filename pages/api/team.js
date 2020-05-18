import axios from "axios";
const FormData = require("form-data");

const Twitter = require("twitter");
const ParallelDotsAPIKey = process.env.ParallelDotsAPIKey;

const client = new Twitter({
  consumer_key: process.env.Consumer_Key,
  consumer_secret: process.env.Consumer_Secret,
  access_token_key: process.env.Access_Token_Key,
  access_token_secret: process.env.Access_Token_Secret,
});

export default async (req, res) => {
  try {
    const { teamName } = req.body;
    const tweets = await client.get("search/tweets", {
      q: teamName,
      count: "100",
    });
    const statuses = tweets.statuses.map((tweet) => tweet.text);

    const formData = new FormData();
    formData.append("text", JSON.stringify(statuses));
    formData.append("api_key", ParallelDotsAPIKey);

    const payload = await axios.post(
      "https://apis.paralleldots.com/v4/sentiment_batch",
      formData,
      { headers: formData.getHeaders() }
    );
    console.log(payload);
    const { data } = payload;
    const { sentiment } = data;

    const realSentiment = sentiment.filter((s) => !s.code);

    let scores = [];
    for (const s of realSentiment) {
      try {
        const { positive, negative, neutral } = s;
        let scoreObject = {};
        if (positive > negative && positive > neutral) {
          scoreObject = {
            type: "positive",
            score: positive,
          };
          scores.push(scoreObject);
        } else if (negative > positive && negative > neutral) {
          scoreObject = {
            type: "negative",
            score: negative,
          };
          scores.push(scoreObject);
        } else if (neutral > positive && neutral > negative) {
          scoreObject = {
            type: "neutral",
            score: neutral,
          };
          scores.push(scoreObject);
        } else {
          console.log("No match");
        }
      } catch (error) {
        console.log(error);
      }
    }

    console.log(scores);
    res.statusCode = 200;

    res.json(scores);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};
