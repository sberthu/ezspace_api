const token_module = require('./token');
const tools = require('./tools');
const dal_participant = require("./dal/participant")
const dal_question = require("./dal/question")
const question = require("./question")
const boom = require('boom')
const session = require("./session")
const names = require("./names")
const EventBus = require("./event-bus")

let config = null;

module.exports.init = (_config) => {
    config = _config
}

const create_participant = async id_presentation => {
    let pseudo = names.getName()
    let token = token_module.create(id_presentation)
    let participant = null
    try {
        participant = await dal_participant.createParticipant({
            token,
            id_presentation,
            pseudo,
            active: true,
            score: 0,
            responses: new Map()
        })

    } catch (err) {
        throw boom.boomify(tools.ServerError(err.message))
    }
    return {
        token,
        pseudo
    }
}

const create_response = async(participant, id_presentation, id_question, id_response) => {

    if (participant.responses.has(`${id_question}`)) {
        throw boom.boomify(tools.MethodNotAllowError("the question has already been answered"))
    }

    let question = null
    try {
        question = await dal_question.getQuestionByIdPresentationAndIdQuestion(id_presentation, id_question)
    } catch (err) {
        throw boom.boomify(tools.ServerError(err.message))
    }
    if (!question) {
        throw boom.boomify(tools.NotFoundException("question is not found"))
    }
    if (!question.active) {
        throw boom.boomify(tools.NotFoundException("question is not active"))
    }

    if (id_response >= question.responses.length) {
        throw boom.boomify(tools.NotFoundException("id response not valide"))
    }

    question.responses[id_response]++;

    if (!isNaN(question.id_response)) {
        await dal_question.updateResponses(id_presentation, id_question, question.responses)
    }
    if (parseInt(question.id_response) === parseInt(id_response)) {
        await dal_participant.updateScore(participant.token, participant.score + 1)
    }
    participant.responses.set(`${id_question}`, id_response)
    await dal_participant.updateResponses(participant.token, participant.responses)
    return true
}

const compute_state = async presentation => {    
    let response = { state: presentation.state }
    if (presentation.state === 1) {
        let current_question = null
        try {
            current_question = await question.get_current_question(presentation.id_presentation)
        } catch (err) {
            throw boom.boomify(err)
        }
        if (current_question) {
            response.form = {
                id_question: current_question.id_question,
                question: current_question.question,
                propositions: current_question.propositions,
                id_response: current_question.id_response
            }
        }
    }

    return response
}

const compute_scores = async id_presentation => {
    let participants = []
    try {
        participants = await dal_participant.getAllForPresentation(id_presentation)
    } catch (err) {
        throw boom.boomify(tools.ServerError(err.message))
    }
    if (!participants || !Array.isArray(participants)) {
        throw boom.boomify(tools.NotFoundException("participants no found"))
    }
    let scores = {}

    participants.map(p => {
        scores[p.pseudo] = p.score
    })


    return scores
}

const remove_participant = async token => {
    try {
        await dal_participant.setUnactive(token)
        EventBus.publish(EventBus.REMOVE_PARTICIPANT, token)
    } catch (err) {
        throw boom.boomify(err)
    }
    return true
}
const check_participant = async token => {
    let participant = null
    try {
        participant = await dal_participant.getParticipantByToken(token)
    } catch (err) {
        throw boom.boomify(tools.ServerError(err.message))
    }
    if (!participant) {
        throw boom.boomify(tools.NotFoundException("participant is not found"))
    }
    if (!participant.active) {
        throw boom.boomify(tools.NotFoundException("participant is not active"))
    }
    return participant
}
module.exports.get_presentation = async(fastify, options) => {
    fastify.route({
        method: 'GET',
        url: `${config.root_uri}/presentation/:id_presentation`,
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
                        token: { type: 'string' },
                        pseudo: { type: 'string' }
                    }
                }
            }
        },
        handler: async(request, reply) => {
            await session.check_presentation(request)
            try {
                return await create_participant(request.params.id_presentation)
            } catch (err) {
                throw boom.boomify(err)
            }
        }
    })
}

module.exports.post_response = async(fastify, options) => {
    fastify.route({
        method: 'POST',
        url: `${config.root_uri}/presentation/:id_presentation/:id_question`,
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
                required: ['id_response'],
                properties: {
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
            let participant = await check_participant(request.headers.token)            
            await session.check_request(request)
            try {
                await create_response(participant, request.params.id_presentation, request.params.id_question, request.body.id_response)
                return reply.statusCode = 204
            } catch (err) {
                throw boom.boomify(err)
            }
        }
    })
}

module.exports.get_state = async(fastify, options) => {
    fastify.route({
        method: 'GET',
        url: `${config.root_uri}/presentation/:id_presentation/state`,
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
                        state: { type: 'number' },
                        form: {
                            type: 'object',
                            properties: {
                                'id_question': { type: 'number' },
                                'question': { type: 'string' },
                                'propositions': {
                                    type: 'array',
                                    maxItems: 10,
                                    items: { type: 'string' }
                                },
                                'id_response': { type: 'number' }
                            }
                        }
                    }
                }
            }
        },
        handler: async(request, reply) => {
            await check_participant(request.headers.token)
            let { presentation } = await session.check_request(request)
            try {
                return await compute_state(presentation)
            } catch (err) {
                throw boom.boomify(err)
            }
        }
    })
}

module.exports.get_scores = async(fastify, options) => {
    fastify.route({
        method: 'GET',
        url: `${config.root_uri}/presentation/:id_presentation/scores`,
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
                return await compute_scores(request.params.id_presentation)
            } catch (err) {
                throw boom.boomify(err)
            }

        }
    })
}

module.exports.delete_participant = async(fastify, options) => {
    fastify.route({
        method: 'DELETE',
        url: `${config.root_uri}/participant`,
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
            let token = request.headers.token
            await session.check_token(token)
            await check_participant(token)
            try {
                await remove_participant(token)
                return reply.statusCode = 204
            } catch (err) {
                throw boom.boomify(err)
            }
        }
    })
}
EventBus.subscribe(`participants.${EventBus.CLOSE_PRESENTATION}`, EventBus.CLOSE_PRESENTATION, id_presentation => {
    //console.log(`participants.CLOSE_PRESENTATION id_presentation:${id_presentation}`)
    dal_participant.setUnactiveForAll(id_presentation)
    .then(_ => {
        //console.log("event triggered !!")
    })
    .catch(err => {
        config.trace(`error participants.CLOSE_PRESENTATION : ${JSON.stringify(err, null, 2) }`)
    })
})