const path = require('path')

class HomeCtrl{
    index(ctx){
        ctx.body = '主页'
    }
    upload(ctx){
        console.log(ctx.req)
        const file = ctx.req.file
        const basename = path.basename(file.path)
        ctx.body = {
            url :`${ctx.origin}/uploads/${basename}`
        }
    }
}

module.exports = new HomeCtrl()