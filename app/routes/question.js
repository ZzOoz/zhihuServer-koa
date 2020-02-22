const Router = require("koa-router")
const router = new Router({prefix:'/question'})
const {find,findById,update,create,deleteQuestion,checkQuestionExist,checkQuestioner} = require('../controller/question')
const jwt = require('koa-jwt')
const {secret} = require('../config')

const auth  = jwt({secret})
router.get('/',find) // 查找话题
router.get('/:id',checkQuestionExist,findById) // 查找话题
router.post('/',auth,create) // 创建话题
router.patch('/:id',auth,checkQuestionExist,checkQuestioner,update) // 更新话题
router.delete('/:id',auth,checkQuestionExist,checkQuestioner,deleteQuestion) // 删除
module.exports = router