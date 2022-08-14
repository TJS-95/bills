const Koa = require('koa')
const parser = require('koa-bodyparser')
const router = require('./routers/index')
const cors = require('koa2-cors');
const static = require('koa-static')
const path = require('path')


const app = new Koa()

app.use(
    cors({
        origin: function(ctx) { //设置允许来自指定域名请求
            if (ctx.url === '/test') {
                return '*'; // 允许来自所有域名请求
            }
            return 'http://localhost:8000'; //只允许http://localhost:8080这个域名的请求
        },
        maxAge: 5, //指定本次预检请求的有效期，单位为秒。
        credentials: true, //是否允许发送Cookie
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法'
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
    })
)

app.use(parser())
app.use(router.routes())
app.use(static(path.join(__dirname, './web')))


app.listen(3000, '0.0.0.0', () => console.log('http://localhost:3000'))
