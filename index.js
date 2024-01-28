const TELEGRAM_TOKEN = '6748806833:AAHM04cg4INFzXzWnH7Qvw_ld4uHB1GOGHM';
const webApp = 'https://poetic-manatee-162fdd.netlify.app'
// const webApp = 'http://localhost"'

const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const cors = require('cors')
const bodyParser = require("body-parser");
const multer = require('multer');

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true})
const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: true
}));


let storage = multer.diskStorage({
    destination: 'files/', // Location where files will be saved
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
let upload = multer({ storage: storage })

const PORT = 8080

// app.use(express.static(__dirname + '/public'));
app.use('/files', express.static('files'));
// server
app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.post('/morning', upload.any(), async (req, res) => {

    console.log(`body: ${JSON.stringify(req.body)}`);
    console.log(`files: ${JSON.stringify(req.files)}`);
    let { queryId, survey } = req.body;

    survey = JSON.parse(survey)
    try {

        let message = ''
        survey.map(item => {
            message += `${item.id}.${item.name} ${item.result} \n`
        })
        console.log(message)

        if (req.files) {
            console.log(`TEST URL = ${process.env.SERVER_HOST + '/' + req.files[0].path}`)

            let response = await bot.answerWebAppQuery(queryId, {
                type: 'photo',
                id: queryId,
                photo_url: `${process.env.SERVER_HOST}/${req.files[0].path}`,
                thumbnail_url: `${process.env.SERVER_HOST}/${req.files[0].path}`,
                caption:  message
            })
            console.log('Image is sent - ', response)
            return res.status(200).json({})
        } else {
            let response = await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Success Morning',
                input_message_content: {
                    message_text: message
                }
            })
            console.log('Message is sent - ', response)
            return res.status(200).json({})
        }
    } catch (e) {
        console.log(`ERROR - `, e)
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Failed Morning',
            input_message_content: {
                message_text: e.toString()
            }
        })
        return res.status(500).json({})
    }
})

app.listen(PORT, () => console.log(`Sever started on port ${PORT}`))


// bot
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    console.log(JSON.stringify(msg, undefined, 4))

    if (msg?.text === 'start') {
        bot.sendMessage(chatId, 'Hello', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Hello', web_app: {url: webApp + '/form'}}]
                ]
            }
        })
    }


    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg.web_app_data.data)

            let message = ''
            data.map(item => {
                message += `${item.id}.${item.name} ${item.result} \n`
            })
            console.log(message)

            await bot.sendMessage(chatId, message)
        } catch (e) {
            console.log(e)
        }
    }
})