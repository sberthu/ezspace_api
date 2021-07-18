const subscriptions = {}

module.exports.subscribe = (id, eventType, callback) => {
    //console.log(`EventBus.subscribe:id:${id} ${eventType}`)
    if (!subscriptions[eventType])
        subscriptions[eventType] = {}
        // the callback is registered
    subscriptions[eventType][id] = callback
    return {
        unsubscribe: () => {
            delete subscriptions[eventType][id]
            if (Object.keys(subscriptions[eventType]).length === 0)
                delete subscriptions[eventType]
        }
    }
}
module.exports.publish = (eventType, arg) => {
    //console.log(`EventBus.publish:${eventType}`)
    //console.log(JSON.stringify(subscriptions, null, 2))
    if (!subscriptions[eventType])
        return
    Object.keys(subscriptions[eventType])
        .forEach(id => {
            //console.log("ok")
            //console.log(eventType, id, subscriptions[eventType][id](arg))
            subscriptions[eventType][id](arg)
        })
}
module.exports.NEW_QUESTION = "new_question"
module.exports.CLOSE_QUESTION = "close_question"
module.exports.CLOSE_PRESENTATION = "close_presentation"
module.exports.REMOVE_PARTICIPANT = "remove_participant"