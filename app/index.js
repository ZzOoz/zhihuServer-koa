const Koa = require("koa")
// const bodyParser = require('koa-bodyparser') 
const KoaBody = require('koa-body')
const routing = require('./routes')
const path = require('path')
const KoaStatic = require('koa-static')
const error = require('koa-json-error') // 错误中间件
const Parameter = require('koa-parameter') // 校验参数
const mongoose = require('mongoose')

// const {  } = require('./config.js')
const app = new Koa()

mongoose.connect('mongodb://http://14.126.109.92:27017/zhihu',{useNewUrlParser:true},()=>{
    console.log('成功！！')
})

// mongoose.connection.on('error',console.log(error))

app.use(KoaStatic(path.join(__dirname,'/public'))) // 放在公有目录
// 错误中间件写在所有中间件的前面
app.use(error({
    postFormat:(e,{stack,...rest})=>process.env.NODE_ENV==="production" ? rest : {stack,...rest}
}))
// app.use(async(ctx,next)=>{
//     try {
//         await next()
//     } catch (error) {
//         ctx.status = error.status || error.statusCode || 500
//         ctx.body = {
//             message : error.message
//         }
//     }
// })

// app.use(bodyParser()) // 获取body

// 使用koa-body
app.use(KoaBody({
    multipart:true, // 启用多级文件，支持文件上传
    formidable:{
        uploadDir:path.join(__dirname,'/public/uploads'), // 上传目录
        keepExtensions:true // 保证拓展名
    }
}))
app.use(Parameter(app)) // 注册校验参数中间件
routing(app) // 将app作为参数给到index.js
app.listen(3000) 