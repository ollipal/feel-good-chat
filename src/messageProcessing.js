const request = require('request');

const BASE_URL = "http://35.228.26.125:3000/"
const PREDICT_URL = BASE_URL + "http://sentiment:5000/model/predict"
const TOXIC_URL = BASE_URL + "http://toxic:5000/model/predict"

function predictSentiment(msg) {
    return new Promise((res, rej) => {
        request.post({url: PREDICT_URL, json:{text:[msg]}}, function (error, response, body) {
            if (body.status === 'ok') {
                const prediction = body.predictions[0]
                if (prediction) {
                    return res(prediction)
                }
            }
            rej(error)
        });
    })
}

function predictToxic(msg) {
    return new Promise((res, rej) => {
        request.post({url: TOXIC_URL, json:{text:[msg]}}, function (error, response, body) {
            if (body.status === 'ok') {
                const prediction = body.results[0].predictions
                if (prediction) {
                    return res(prediction)
                }
            }
            rej(error)
        });
    })
}

export {predictSentiment, predictToxic}
