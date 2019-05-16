'use strict'

module.exports = {
  driver: 'cookie',
  cookieName: 'adonis-session',
  clearWithBrowser: true,
  age: '2h',
  cookie: {
    httpOnly: true,
    sameSite: true,
    path: '/'
  },
  file: {
    location: 'sessions'
  },
  redis: 'self::redis.local'
}
