module.exports = {
	apps: [{
		name: "be-link",
		script: "./dist/index.js",
		env: {
			"REDIS_PREFIX": process.env.REDIS_PREFIX,
			"MIN_USER_ID": process.env.MIN_USER_ID,
			"NODE_PORT": process.env.NODE_PORT
		},
		env_development: {
			env: {
				"NODE_ENV": "development",
			},
			watch: true,
			instances: 1
		},
		env_production: {
			env: {
				"NODE_ENV": "production",
			},
			watch: true,
			instances: 2,
			exec_mode: "cluster"
		}
	}],
	deploy: {
		production: {
			"user": "root",
			"host": ["staging.be-link.fr"],
			"ref": "origin/master",
			"repo": "git@github.com:sberthu/ezspace_api.git",
			"path": "/var/www/my-repository/var/www/be-link/docker/node",
			"pre-deploy-local": '',
			"post-deploy": "npm install && pm2 reload ecosystem.config.js --env production",
			"pre-setup": ''
		}
	}
}