const { MongoClient, ServerApiVersion } = require('mongodb')
const TelegramBot = require('node-telegram-bot-api')

const {
    global: { mongoToken, telegramToken },
    answers: { start, service, phoneKeyboard, defaultError }
} = require('./options')

const client = new MongoClient(mongoToken, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

client.connect()

const order = {
    service: '',
    product: undefined
}

const telegramBot = new TelegramBot(telegramToken, { polling: true })

const init = async () => {
    telegramBot.setMyCommands([
        { command: '/start', description: 'Начать взаимодействие с ботом' },
        { command: '/help', description: 'Помощь в пользовании чат-ботом' },
        { command: '/contacts', description: 'Информация о чат-боте' }
    ])

    telegramBot.on('message', async (msg) => {
        await onMessageHandler(id, text)
    })

    telegramBot.on('contact', async ({ chat: { id }, contact }) => {
        await onPhoneHandler(id, contact)
    })

    telegramBot.on('callback_query', async ({ message: { chat: { id } }, data }) => {
        const splited = data.split('.')
        await onKeyboardHandler(id, splited[0], splited[1])
    })
}

const onMessageHandler = async (id, text) => {
    if (text) {
        switch (text) {
            case '/start': {
                order.service = ''
                order.product = undefined
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
            case 'Отмена заказа': {
                order.service = ''
                order.product = undefined
                await telegramBot.sendMessage(id, 'Ваш заказ отменен!\nДля начала взаимодействия с чат-ботом - /start\nДля получения помощи - /help')
                break
            }
            default: {
                await telegramBot.sendMessage(id, defaultError)
                break
            }
        }
    }
}

const onKeyboardHandler = async (id, code, additional) => {
    switch (code) {
        case 'products': {
            try {
                const categories = await getCategories()

                await telegramBot.sendMessage(id, 'Выберите категорию, по которому хотите найти товар', {
                    reply_markup: JSON.stringify({
                        inline_keyboard: categories.map(({ title: text, code }) => {
                            return [{ text, callback_data: `category.${code}` }]
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
                const products = await getProducts({ category: additional })

                await telegramBot.sendMessage(id, `По данной категории было найдено ${products.length} позиций. Для оформления заказа выберите нужный Вам товар`, {
                    reply_markup: JSON.stringify({
                        inline_keyboard: products.map(({ title: text }) => {
                            return [{ text, callback_data: `product.${text}` }]
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
            order.service = code
            order.product = additional
            await telegramBot.sendMessage(id, 'Оставьте свой номер телефона, менеджер свяжется с вами в ближайшее время', phoneKeyboard);
            order.service = ''
            order.product = undefined
            break
        }
        default: {
            await telegramBot.sendMessage(id, defaultError)
        }
    }
}

const onPhoneHandler = async (id, contact) => {
    if (contact) {
        try {
            await putOrder({
                name: contact.first_name,
                phone: contact.phone_number,
                service: order.service,
                product: order.product
            })
            await telegramBot.sendMessage(id, contact.first_name + ', спасибо за оформленный заказ! Ожидайте звонка менеджера')
        } catch (err) {
            throw new Error(err)
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

const putOrder = async (data) => {
    try {
        await client
            .db('node-chat')
            .collection('order')
            .insertOne(data)
    } catch (err) {
        throw new Error(err)
    }
}

init()