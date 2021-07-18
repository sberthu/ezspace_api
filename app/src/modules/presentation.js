const token_module = require('./token');
const tools = require('./tools');
const dal_presentation = require("./dal/presentation")
const boom = require('boom')
const session = require("./session")
const EventBus = require("./event-bus")

let config = null;

module.exports.init = (_config) => {
    config = _config
}

const create_presentation = async() => {
    let isOK = false
    let attempts = 10
    let id_presentation = null;

    while (!isOK && attempts) {
        id_presentation = tools.create_id()
        try {
            presentation = await dal_presentation.getPresentationById(id_presentation)
        } catch (err) {
            throw boom.boomify(tools.ServerError(err.message))
        }
        isOK = !presentation
        attempts--;
    }
    if (!isOK) {
        throw boom.boomify(tools.ServerError('no id presentation available, try latter'))
    }

    let token = token_module.create(id_presentation)

    let start_date = new Date().valueOf();
    let active = true

    try {
        await dal_presentation.createPresentation({
            id_presentation,
            start_date,
            active,
            state: 0
        })

    } catch (err) {
        throw boom.boomify(err)
    }

    return {
        id_presentation,
        token
    }
}
const close_presentation = async id_presentation => {
    try {
        await dal_presentation.setUnactive(id_presentation)
        EventBus.publish(EventBus.CLOSE_PRESENTATION, id_presentation)
    } catch (err) {
        throw boom.boomify(err)
    }
    return true
}
module.exports.close_presentation = close_presentation
const checkPresentation = async id_presentation => {
    let presentation = null;
    try {
        presentation = await dal_presentation.getPresentationById(id_presentation)
    } catch (err) {
        throw boom.boomify(err)
    }
    if (!presentation) {
        throw boom.boomify(tools.NotFoundException())
    } else if (!presentation.active) {
        throw boom.boomify(tools.NotFoundException("presentation is closed"))
    } else if (tools.IsItExpired(presentation.start_date, config.session_max_duration_in_seconds)) {
        if (presentation.active) {
            dal_presentation.setUnactive(id_presentation)
        }
        throw boom.boomify(tools.NotFoundException("presentation has expired"))
    }
    return presentation
}
module.exports.checkPresentation = checkPresentation

module.exports.post_presentation = async(fastify, options) => {
    fastify.route({
        method: 'POST',
        url: `${config.root_uri}/presentation`,
        version: config.api_version,
        schema: {
            headers: {
                type: 'object',
                properties: {
                    'Accept-Version': { type: 'string' }
                },
                required: ['Accept-Version']
            },
            body: {
                type: 'null'
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id_presentation: { type: 'string' },
                        token: { type: 'string' }
                    }
                }
            }
        },
        handler: async(request, reply) => {
            return await create_presentation()
        }
    })
}
module.exports.delete_presentation = async(fastify, options) => {
    fastify.route({
        method: 'DELETE',
        url: `${config.root_uri}/presentation/:id_presentation`,
        version: config.api_version,
        schema: {
            headers: {
                type: 'object',
                properties: {
                    'token': { type: 'string' },
                    'Accept-Version': { type: 'string' }
                },
                required: ['token', 'Accept-Version']
            },
            body: {
                type: 'null'
            },
            response: {
                204: {
                    type: 'null'
                }
            }
        },
        handler: async(request, reply) => {
            await session.check_request(request)
            try {
                await close_presentation(request.params.id_presentation)
                return reply.statusCode = 204
            } catch (err) {
                throw boom.boomify(err)
            }
        }
    })
}
EventBus.subscribe(`presentation.${EventBus.NEW_QUESTION}`, EventBus.NEW_QUESTION, ({ id_presentation, id_question }) => {
    //console.log(`presentation.NEW_QUESTION id_presentation:${id_presentation} id_question:${id_question}`)
    dal_presentation.setState(id_presentation, 1)
        .then(_ => {
            //console.log("event triggered !!")
        })
        .catch(err => {
            config.trace(`error presentation.NEW_QUESTION : ${JSON.stringify(err, null, 2) }`)
        })
})
EventBus.subscribe(`presentation.${EventBus.CLOSE_QUESTION}`, EventBus.CLOSE_QUESTION, ({ id_presentation, id_question }) => {
    //console.log(`presentation.CLOSE_QUESTION id_presentation:${id_presentation} id_question:${id_question}`)
    dal_presentation.setState(id_presentation, 0)
        .then(_ => {
            //console.log("event triggered !!")
        })
        .catch(err => {
            config.trace(`error presentation.CLOSE_QUESTION : ${JSON.stringify(err, null, 2) }`)
        })
})