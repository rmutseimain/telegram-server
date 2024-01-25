const TELEGRAM_TOKEN = '6748806833:AAHWB9az9q5kLEE4IDneG2-XXOlLqGIv7Jc';
const webApp = 'https://poetic-manatee-162fdd.netlify.app'
// const webApp = 'http://localhost"'

const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const cors = require('cors')


const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true})
const app = express()
app.use(express.json())
const PORT = 8080

// server
app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.post('/morning', async (req, res) => {
    console.log(JSON.stringify(req.body, undefined, 4))
    const {queryId, survey} = req.body;

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Success Morning',
            input_message_content: {
                message_text: survey
            }
        })
        return res.status(200).json({})

    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Failed Morning',
            input_message_content: {
                message_text: e
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

            await bot.sendMessage(chatId,`Ваши данние: \n
            Страна - ${data.country}\n 
            Улица - ${data.street}\n 
            Subject - ${data?.subject}\n`
            )
        } catch (e) {
            console.log(e)
        }
    }
})