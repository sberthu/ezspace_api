module.exports = {
	apps : [{
	  name        : "be-link",
	  script      : "./dist/index.js",
	  watch       : true,
	  instances  : 1,
	  exec_mode  : "cluster",
	  env: {
		"NODE_ENV": "development",
	  },
	  env_production : {
		 "NODE_ENV": "production"
	  }
	}]
  }