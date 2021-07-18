const dal_presentation = require('./modules/dal/presentation')
const presentation_mod = require('./modules/presentation')
const main = require("./modules/main")
const EventBus = require("./modules/event-bus")


const {db, config} = main.init()

const purge_presentations = async _ => {
	let min_ts = new Date().valueOf() - config.session_max_duration_in_seconds
	let presentations = await dal_presentation.getAllExpiredPresentations(min_ts)
	presentations.map(async (pres) => {
		console.log(pres)
		try {
			await presentation_mod.close_presentation(pres.id_presentation)
		} catch (err) {
			console.error(JSON.stringify(err, null, 2))
		}
	})
	return presentations
}

module.exports.getPresentations = async => {
	(async ()=>{
		db.init(config)
		.then(_ => {
			main.run(config)

			let presentations = [];

			purge_presentations()
			.then(_presentations => {
				console.log(_presentations)
//				presentations = _presentations
			})
		
			/* setTimeout(_ => {
				console.log("check...")
				console.log(presentations)
				resolve(true)
			}, 3000) */
			})
	})();

	
}