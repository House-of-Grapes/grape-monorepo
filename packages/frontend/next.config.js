const withTM = require('next-transpile-modules')([
  '@grape/shared',
  '@grape/contracts',
  '@grape/generator',
])

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,
})
