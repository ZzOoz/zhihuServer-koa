const Router = require("koa-router")
const router = new Router({prefix:'/topic'})
const {find,findById,update,create,listFollowerTopic,checkTopicExist,listQuestions} = require('../controller/topic')
const jwt = require('koa-jwt')
const {secret} = require('../config')

const auth  = jwt({secret})
router.get('/',find) // 查找话题
router.get('/:id',checkTopicExist,findById) // 查找话题
router.post('/',auth,create) // 创建话题
router.patch('/:id',auth,checkTopicExist,update) // 更新话题
router.get('/:id/fllowersTopic',checkTopicExist,listFollowerTopic) // 获取关注了此话题的用户列表
router.get('/:id/questions',checkTopicExist,listQuestions) // 通过话题id寻找相关问题列表
module.exports = router