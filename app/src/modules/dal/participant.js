const Participant = require('../models/participantModel')

module.exports.getParticipantByToken = async token => {
    let participant = null;
    try {
        const query = Participant.findOne({ token })
        participant = await query.exec()
    } catch (err) {
        throw new Error(err)
    }
    return participant
}
module.exports.getAllForPresentation = async id_presentation => {
    let participants = [];
    try {
        const query = Participant.find({ id_presentation })
        participants = await query.exec()
    } catch (err) {
        throw new Error(err)
    }
    return participants
}
module.exports.createParticipant = async  _data => {
    try {
        const participant = new Participant(_data)
        await participant.save()
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.setUnactive = async  token => {
    try {
        const query = await Participant.updateOne({ token }, { active: false })
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.setUnactiveForAll = async  id_presentation => {
    try {
        const query = await Participant.update({ id_presentation }, { active: false })
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.updateScore = async (token, score)  => {
    try {
        await Participant.updateOne({ token },  { score })
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.updateResponses = async (token, responses)  => {
    try {
        await Participant.updateOne({ token },  { responses })
    } catch (err) {
        throw new Error(err)
    }
}