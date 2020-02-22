const fs = require('fs')


// 导出所有路由 除去index.js文件
module.exports = (app)=>{
    fs.readdirSync(__dirname).forEach(file=>{
        if(file === 'index.js') {return}
        const route = require(`./${file}`)
        app.use(route.routes()).use(route.allowedMethods()) // 支持所有的方法 包括opti ons
    })
}