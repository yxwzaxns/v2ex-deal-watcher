const fs = require('fs')
const path = require('path')
const config = require('./config')
const https = require('https')
const cors = require('@koa/cors')
const notifier = require('node-notifier')

const Koa = require('koa')
const app = new Koa()
app.use(cors())

app.use(async (ctx, next) => {
    const rt = ctx.response.get('X-Response-Time')
    await next()
    console.log(`${ctx.method} ${ctx.path} - ${rt}`)
})

const urlCache = []

app.use(async ctx => {
    if(ctx.path == '/point'){
        try {
            const msg = JSON.parse(ctx.request.query.t)
            const url = msg.id.split('#')[0]
            if(!urlCache.includes(url)){
                notifier.notify({
                  title: '有关注的交易信息',
                  message: msg.title,
                  open: msg.id,
                  sound: true,
                  wait: true,
                  timeout: 10
                })
                urlCache.push(url)
            }
            ctx.body = text
        }catch(e){
            ctx.body = {msg:'parse json error'}
        }
    }else if(ctx.path == '/url'){
        ctx.body = urlCache
    }else{
        ctx.body = undefined
    }
});

const httpsOptions = {
  key: fs.readFileSync(path.resolve(process.cwd(), `certs/${config.domain}-key.pem`), 'utf8').toString(),
  cert: fs.readFileSync(path.resolve(process.cwd(), `certs/${config.domain}.pem`), 'utf8').toString(),
}

const serverCallback = app.callback()

try {
  const httpsServer = https.createServer(httpsOptions, serverCallback)
  httpsServer
    .listen(config.port, function(err) {
      if (!!err) {
        console.error('HTTPS server FAIL: ', err, (err && err.stack))
      }
      else {
        console.log(`HTTPS server OK: http://${config.domain}:${config.port}`)
      }
    })
}catch (ex) {
  console.error('Failed to start HTTPS server\n', ex, (ex && ex.stack))
}
