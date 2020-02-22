const Router = require("koa-router")
// 路由三级嵌套 问题 -> 答案 -> 评论
const router = new Router({prefix:`/question/:questionId/answer/:answerId/comment`})
const {find,findById,update,create,deleteComment,checkCommentExist,checkCommentator} = require('../controller/comment')
const jwt = require('koa-jwt')
const {secret} = require('../config')

const auth  = jwt({secret})
router.get('/',find) // 查找问题答案
router.get('/:id',checkCommentExist,findById) // 查找答案
router.post('/',auth,create) // 创建答案
router.patch('/:id',auth,checkCommentExist,checkCommentator,update) // 更新答案
router.delete('/:id',auth,checkCommentExist,checkCommentator,deleteComment) // 删除
module.exports = router