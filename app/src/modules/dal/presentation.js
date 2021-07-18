const Presentation = require('../models/presentationModel')

module.exports.getPresentationById = async id_presentation => {
    let presentation = null;
    try {
        const query = Presentation.findOne({ id_presentation })
        presentation = await query.exec()
    } catch (err) {
        throw new Error(err)
    }
    return presentation
}
module.exports.createPresentation = async  _data => {
    try {
        const presentation = new Presentation(_data)
        await presentation.save()
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.setUnactive = async  id_presentation => {
    try {
        await Presentation.updateOne({ id_presentation }, { active: false })
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.setState = async  (id_presentation, state) => {
    try {
        await Presentation.updateOne({ id_presentation }, { state })
    } catch (err) {
        throw new Error(err)
    }
}
module.exports.getAllExpiredPresentations = async min_ts => {
    let presentations = null;
    try {
        const query = Presentation.find({start_date: {$lt: min_ts },  active: true })
        presentations = await query.exec()
    } catch (err) {
        throw new Error(err)
    }
    return presentations
}