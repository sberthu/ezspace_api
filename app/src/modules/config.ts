import { ConfigInterface } from '../interfaces/config_interface'

let _debug = true
let _timestamp = new Date()

export const config  = () => {
	return {
		trace: text => {
			if (_debug) console.log(JSON.stringify(text, null, 2));
		},
		fastify: null,
		is_production: (process.env.NODE_ENV === "production"),
		debug: _debug,
		timestamp: _timestamp,
		port: parseInt(process.env.NODE_PORT),
		api_version: "1.0.0",
		root_uri: '/be-link/api/v4',
		start_date: "2019-12-16",
		min_user_id: parseInt(process.env.MIN_USER_ID),
		session_max_duration_in_seconds: 3 * 60 * 60 * 1000,
		redis: null,
		redis_params: {
			active: true,
			prefix: process.env.REDIS_PREFIX,
			url: `redis://redis:6379`
		},
		user: {
			id: null,
			scopes: []
		},
		jwt: {
			private: `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`,
			public: `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtAmZF+yqTPK50+CEtvsH
er+ZcJIiUeVgGSOPk/otXQJwjcs11V83cMhb0frNTad2nXn2BE+BspZcHeBhwGc/
WPqSt+HJYC+N32YDLgwjlDpsjfkJkigol/BL+GutdK1p0IPRMxA5xkLC47GuR4VO
i5PcYjTX0L4aHw0/ELhN1OVdvXIeQJFuJvWUp/DiGKgsBtNAkD4gAmcihvB8sd0C
LPmORXDuVxVhYimc5tyqBFo/iGjY9vCi+Eqas+N2yRoKufXOho3TqHd6NWvCA2IT
4hmSKSfUhHhwJ+5Cuyizzy4v+4YF1S4vKPM0WI8klJq3AYdY7+EB10HHoqJMEwIU
3HXuV3HrnYVUUyE8p0/d+zmvD57P47442SvtVXPNMgEKah2bZwC2hcGRcYJZwWZy
28MYgRKQOVGYI5/AVkXXIAg3JhkjqJB7KSyMSgOKm0HP18DWUlEy1MsmWpOHatNx
FCz7kulcxmQvjdP1jm1XuYZII/OjvMn5AdEHVxI8tNooNw/v3jGNZVaa7nc73ccS
I89mLHBxnHHNG9vHbfS2+x8qibOLhysokh266Eto5JzqQsW9owKQKySlE/60dckR
IqC34E1UPqgFFezNL7qAQiyhnnHMx/KZSQCsIPT5B89DZxb0954tC0wC8g+u3dvM
IgZ5qO9qUaMOf/kWJubTkesCAwEAAQ==
-----END PUBLIC KEY-----`,
			options: {
				issuer: "Mylan",
				subject: "twicors-presentation",
				audience: 'twicors-presenteer',
				expiresIn: "3h",
				algorithm: "RS256"
			},
			verify_options: {
				issuer: "Mylan",
				subject: "twicors-presentation",
				audience: 'twicors-presenteer',
				expiresIn: "3h",
				algorithms: ["RS256"]
			}
		}
	}
}