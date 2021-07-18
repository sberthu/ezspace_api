const Question = require('../models/questionModel')

module.exports.getQuestionByIdPresentationAndIdQuestion = async(id_presentation, id_question) => {
    let question = null;
    try {
        const query = Question.findOne({ id_presentation, id_question }).sort({id_question: -1})
        question = await query.exec()
    } catch (err) {
        throw new Error(err)
    }
    return question
}
module.exports.getActiveQuestionForPresentationId = async(id_presentation) => {
    let question = null;
    try {
        const query = Question.findOne({ id_presentation, active: true }).sort({id_question: -1})
        question = await query.exec()
    } catch (err) {
        throw new Error(err)
    }
    return question
}
module.exports.createQuestion = async _data => {
    try {
        const question = new Question(_data)
        await question.save()
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.setUnactive = async (id_presentation, id_question) => {
    try {
        await Question.updateOne({ id_presentation, id_question }, { active: false })
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.setUnactiveForAll = async (id_presentation) => {
    try {
        await Question.updateMany({ id_presentation }, { active: false })    
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.updateResponses = async (id_presentation, id_question, responses)  => {
    try {
        await Question.updateOne({ id_presentation, id_question }, { responses })
    } catch (err) {
        throw new Error(err)
    }
}

module.exports.closeOtherQuestions = async (id_presentation, id_question)  => {
    try {
        await Question.updateMany({ id_presentation, id_question: { $ne: id_question } }, { active: false })
    } catch (err) {
        throw new Error(err)
    }
}
