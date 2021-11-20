'use strict';

const functions = require('firebase-functions');
const axios = require("axios").default;

exports.cors = functions.https.onRequest((req, res) => {
  
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "*");
  res.set("Access-Control-Allow-Headers", "*");
  if (req.method !== "POST") {
    res.status(200).json({})
    return
  }
  
  const to = req.body.to
  let url = null
  if (to === "sentiment") {
    url = "http://35.228.26.125:5555/model/predict"
  } else if (to === "toxic") {
    url = "http://35.228.26.125:5556/model/predict"
  } else {
    res.status(400).send()
    return
  }
  const req_data = req.body.data

  axios.post(url, req_data)
    .then(data => {
      res.status(200).json(data.data);
    })
    .catch(err => {
      console.error("asd error:", err)
      res.status(500).json({error: err})
    });
});