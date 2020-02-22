const Router = require("koa-router")
const router = new Router({prefix:`/question/:questionId/answer`})
const {find,findById,update,create,deleteAnswer,checkAnswerer,checkAnswerExist} = require('../controller/answer')
const jwt = require('koa-jwt')
const {secret} = require('../config')

const auth  = jwt({secret})
router.get('/',find) // 查找问题答案
router.get('/:id',checkAnswerExist,findById) // 查找问题答案
router.post('/',auth,create) // 创建答案
router.patch('/:id',auth,checkAnswerExist,checkAnswerer,update) // 更新答案
router.delete('/:id',auth,checkAnswerExist,checkAnswerer,deleteAnswer) // 删除
module.exports = router