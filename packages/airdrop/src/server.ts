import app from './app'

app.set('port', process.env.APP_PORT || 1337)

app.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}`)
})
