const TELEGRAM_TOKEN = '6748806833:AAHlzajMxLKXSsfJ08_1ppiRfSx-ssZ9csI';
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

const upload = multer({
    dest: 'files/', // Location where files will be saved
});
const PORT = 8080

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
    let {queryId, survey } = req.body;
    let { files } = req.files;

    survey = JSON.parse(survey)
    try {

        let message = ''
        survey.map(item => {
            message += `${item.id}.${item.name} ${item.result} \n`
        })
        console.log(message)

        let response = await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Success Morning',
            input_message_content: {
                message_text: message
            }
        })

        console.log('Survey is sent - ', response)

        console.log(`TEST URL = ${process.env.SERVER_HOST + '/' + files[0].path}`)
        if (files) {
            let response = await bot.answerWebAppQuery(queryId, {
                type: 'photo',
                id: queryId,
                photo_url: process.env.SERVER_HOST + '/' + files[0].path,
                thumbnail_url: process.env.SERVER_HOST + '/' + files[0].path,
            })
            console.log('Image is sent - ', response)

        }



    } catch (e) {

        console.log(`ERROR - `, e)
        // await bot.answerWebAppQuery(queryId, {
        //     type: 'article',
        //     id: queryId,
        //     title: 'Failed Morning',
        //     input_message_content: {
        //         message_text: e
        //     }
        // })
        // return res.status(500).json({})
    }
    return res.status(200).json({})

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