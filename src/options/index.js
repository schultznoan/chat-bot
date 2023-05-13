const global = {
    mongoToken: 'mongodb+srv://danchoo14:bu3oYdOFLqbn7lVU@chat-bot.u2hsxra.mongodb.net/?retryWrites=true&w=majority',
    telegramToken: '5959073086:AAHaKGHOHtoluEMJ49LRMRpcWj2zg_s_8Ss'
}

const answers = {
    start: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Товары', callback_data: JSON.stringify({ code: 'products', children: null }) },
                    { text: 'Услуги', callback_data: JSON.stringify({ code: 'service', children: null }) }
                ]
            ]
        })
    },
    service: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Диагностика', callback_data: JSON.stringify({ code: 'diagnostic', children: null }) },
                    { text: 'Ремонт', callback_data: JSON.stringify({ code: 'repair', children: null }) }
                ]
            ]
        })
    },
    defaultError: 'Извини, я тебя не понял! Воспользуйся командой /help для помощи по взаимодействию со мной!'
}

module.exports = {
    global,
    answers
}