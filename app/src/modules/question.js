const token_module = require('./token');
const tools = require('./tools');
const dal_question = require('./dal/question')
const EventBus = require("./event-bus")

const boom = require('boom')
const session = require("./session")

let config = null;

module.exports.init = (_config) => {
    config = _config
}

const create_question = async(id_presentation, id_question, question, propositions, id_response) => {
    let question_obj = null
    try {
        question_obj = await dal_question.getQuestionByIdPresentationAndIdQuestion(id_presentation, id_question)
    } catch (err) {
        throw boom.boomify(err)
    }
    if (question_obj) {
        throw boom.boomify(tools.MethodNotAllowError())
    }
    try {        
        let responses = new Array(propositions.length).fill(0);
        
        await dal_question.createQuestion({
            id_presentation,
            id_question,
            question,
            propositions,
            id_response,
            active: true,
            responses
        })
        EventBus.publish(EventBus.NEW_QUESTION, {id_presentation, id_question})
    } catch (err) {
        throw boom.boomify(err)
    }
    return true
}

const close_question = async(id_presentation, id_question) => {
    let question = null
    try {
        question = await dal_question.getQuestionByIdPresentationAndIdQuestion(id_presentation, id_question)
    } catch (err) {
        throw boom.boomify(err)
    }
    if (!question) {
        throw boom.boomify(tools.NotFoundException())
    }
    if (!question.active) {
        throw boom.boomify(tools.NotFoundException("question is already closed"))
    }
    try {
        await dal_question.setUnactive(id_presentation, id_question)
        EventBus.publish(EventBus.CLOSE_QUESTION, {id_presentation, id_question})
    } catch (err) {
        throw boom.boomify(err)
    }
    return { propositions: question.responses }
}

const get_current_question = async(id_presentation) => {
    let question = null
    try {
        question = await dal_question.getActiveQuestionForPresentationId(id_presentation)
    } catch (err) {
        throw boom.boomify(err)
    }
    return question
}
module.exports.get_current_question = get_current_question

module.exports.post_question = async(fastify, options) => {
    fastify.route({
        method: 'POST',
        url: `${config.root_uri}/presentation/:id_presentation`,
        version: config.api_version,
        schema: {
            headers: {
                type: 'object',
                properties: {
                    'Content-Type': { type: 'string' },
                    'token': { type: 'string' },
                    'Accept-Version': { type: 'string' }
                },
                required: ['Content-Type', 'token', 'Accept-Version']
            },
            body: {
                required: ['id_question', 'question', 'propositions'],
                properties: {
                    'id_question': { type: 'number' },
                    'question': { type: 'string' },
                    'propositions': {
                        type: 'array',
                        maxItems: 10,
                        items: { type: 'string' }
                    },
                    'id_response': { type: 'number' },
                }
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
                await create_question(request.params.id_presentation, request.body.id_question, request.body.question, request.body.propositions, request.body.id_response)
                return reply.statusCode = 204
            } catch (err) {
                throw boom.boomify(err)
            }
        }
    })
}

module.exports.delete_question = async(fastify, options) => {
    fastify.route({
        method: 'DELETE',
        url: `${config.root_uri}/presentation/:id_presentation/:id_question`,
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
                200: {
                    type: 'object',
                    properties: {
                        'propositions': {
                            type: 'array',
                            maxItems: 10,
                            items: { type: 'number' }
                        }
                    }
                }
            }
        },
        handler: async(request, reply) => {
            await session.check_request(request)
            try {
                return await close_question(request.params.id_presentation, request.params.id_question)
            } catch (err) {
                throw boom.boomify(err)
            }

        }
    })
}
EventBus.subscribe(`question.${EventBus.NEW_QUESTION}`, EventBus.NEW_QUESTION, ({id_presentation, id_question }) => {
    //console.log(`question.NEW_QUESTION id_presentation:${id_presentation} id_question:${id_question}`)
    dal_question.closeOtherQuestions(id_presentation, id_question)
    .then(_ => {
        //console.log("question.event triggered !!")
    })
    .catch(err => {
        //config.trace(`error question.NEW_QUESTION : ${JSON.stringify(err, null, 2) }`)
    })
})
EventBus.subscribe(`question.${EventBus.CLOSE_PRESENTATION}`, EventBus.CLOSE_PRESENTATION, id_presentation => {
    //console.log(`question.CLOSE_PRESENTATION id_presentation:${id_presentation}`)
    dal_question.setUnactiveForAll(id_presentation)
    .then(_ => {
        //console.log("event triggered !!")
    })
    .catch(err => {
        config.trace(`error question.CLOSE_PRESENTATION : ${JSON.stringify(err, null, 2) }`)
    })
})