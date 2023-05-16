const global = {
    mongoToken: 'mongodb+srv://danchoo14:bu3oYdOFLqbn7lVU@chat-bot.u2hsxra.mongodb.net/?retryWrites=true&w=majority',
    telegramToken: '5959073086:AAHaKGHOHtoluEMJ49LRMRpcWj2zg_s_8Ss'
}

const answers = {
    start: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Товары', callback_data: 'products.' },
                    { text: 'Услуги', callback_data: 'service.' }
                ]
            ]
        })
    },
    service: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Диагностика', callback_data: 'diagnostic.' },
                    { text: 'Ремонт', callback_data: 'repair.' }
                ]
            ]
        })
    },
    phoneKeyboard: {
        reply_markup: {
            keyboard: [
                [
                    { text: 'Отправить номер телефона', request_contact: true }
                ],
                [
                    { text: 'Отмена заказа' }
                ]
            ],
            one_time_keyboard: true
        }
    },
    defaultError: 'Извини, я тебя не понял! Воспользуйся командой /help для помощи по взаимодействию со мной!'
}

module.exports = {
    global,
    answers
}