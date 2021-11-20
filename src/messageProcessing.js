const request = require('request');

const BASE_URL = "https://us-central1-feelgoodchat-f4d99.cloudfunctions.net/cors"
const BOT_URL = "https://dlm8qcwh5h.execute-api.eu-north-1.amazonaws.com/test/junctionlarge"

function predictSentiment(msg) {
    return new Promise((res, rej) => {
        request.post({url: BASE_URL, json:{to: "sentiment", data: {text:[msg]}}}, function (error, response, body) {
            if (body && body.status === 'ok') {
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
        request.post({url: BASE_URL, json:{to: "toxic", data: {text:[msg]}}}, function (error, response, body) {
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

function getBotAnswer(msg) {
    return new Promise((res, rej) => {
        request.post({url: BOT_URL, json:{to: "openAI", data: {text:[msg]}}}, function (error, response, body) {
            if (body && body.status === 'ok') {
                const prediction = body.predictions[0]
                if (prediction) {
                    return res(prediction)
                }
            }
            rej(error)
        });
    })
}

export {predictSentiment, predictToxic, getBotAnswer}
