const { MongoClient, ServerApiVersion } = require('mongodb')
const TelegramBot = require('node-telegram-bot-api')

const {
    global: { mongoToken, telegramToken },
    answers: { start, service, defaultError }
} = require('./options')

const client = new MongoClient(mongoToken, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

client.connect()

const telegramBot = new TelegramBot(telegramToken, { polling: true })

const init = () => {
    telegramBot.setMyCommands([
        { command: '/start', description: 'Начать взаимодействие с ботом' },
        { command: '/help', description: 'Помощь в пользовании чат-ботом' },
        { command: '/contacts', description: 'Информация о чат-боте' }
    ])

    telegramBot.on('message', async ({ chat: { id }, text }) => {
        onMessageHandler(id, text)
    })

    telegramBot.on('callback_query', async ({ message: { chat: { id } }, data }) => {
        const { code, children } = JSON.parse(data)
        onKeyboardHandler(id, code, children)
    })
}

const onMessageHandler = async (id, text) => {
    switch (text) {
        case '/start': {
            await telegramBot.sendMessage(id, 'Приветствую! Я чат-бот организации ООО "Маяк", выберите нужный раздел для дальнейшей работы', start)
            break
        }
        case '/help': {
            await telegramBot.sendMessage(id, 'Для начала работы с ботом используйте команду /start\nДля получения контактной информации используйте команду /contacts')
            break
        }
        case '/contacts': {
            await telegramBot.sendMessage(id, `Адрес организации: 155908, Ивановская область, Шуйский район, г. Шуя, ул. Свердлова, д. 34А, кв. 25\nНомер телефона: +7 493 514-22-19`)
            break
        }
        default: {
            await telegramBot.sendMessage(id, defaultError)
            break
        }
    }
}

const onKeyboardHandler = async (id, code, category) => {
    switch (code) {
        case 'products': {
            try {
                const categories = await getCategories()

                await telegramBot.sendMessage(id, 'Выберите категорию, по которому хотите найти товар', {
                    reply_markup: JSON.stringify({
                        inline_keyboard: categories.map(({ title: text, code }) => {
                            return [{ text, callback_data: JSON.stringify({ code: 'category', children: code }) }]
                        })
                    })
                })
            } catch (err) {
                await telegramBot.sendMessage(id, 'Произошла ошибка при получении категорий. Пожалуйста, повторите запрос')
            }

            break
        }
        case 'service': {
            await telegramBot.sendMessage(id, 'Выберите раздел, по которому хотите оформить услугу', service)
            break
        }
        case 'category': {
            try {
                const categories = await getProducts({ category })

                await telegramBot.sendMessage(id, `По данной категории было найдено ${categories.length} позиций. Для оформления заказа выберите нужный Вам товар`, {
                    reply_markup: JSON.stringify({
                        inline_keyboard: categories.map(({ title: text }) => {
                            return [{ text, callback_data: JSON.stringify({ code: 'product', children: null }) }]
                        })
                    })
                })
            } catch (err) {
                await telegramBot.sendMessage(id, 'Произошла ошибка при получении категорий. Пожалуйста, повторите запрос')
            }

            break
        }
        case 'product':
        case 'diagnostic':
        case 'repair': {
            await telegramBot.sendMessage(id, 'Здесь будет введите номер телефона для оформления заказа и т.д.')
            break
        }
        default: {
            await telegramBot.sendMessage(id, defaultError)
        }
    }
}

const getCategories = async (params) => {
    try {
        return await client
            .db('node-chat')
            .collection('categories')
            .find(params)
            .toArray()
    } catch (err) {
        throw new Error(err)
    }
}

const getProducts = async (params) => {
    try {
        return await client
            .db('node-chat')
            .collection('products')
            .find(params)
            .toArray()
    } catch (err) {
        throw new Error(err)
    }
}

init()