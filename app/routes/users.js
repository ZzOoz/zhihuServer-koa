const Router = require("koa-router")
const router = new Router({prefix:'/users'})
const { deleteById,find,create,
        findById,update,login,
        checkOwner,listFollowing,
        fllow,unfllow,listFollower,
        checkUserExist,fllowTopic,unfllowTopic,
        listFollowingTopic,listQuestion,
        listLikeAnswer,likeAnswers,unlikeAnswer,
        dislikeAnswers,undislikeAnswer,listDisLikeAnswer,
        collectAnswer,discollectAnswer,collectAnswerList} = require('../controller/users') // 拿到类实例里面方法


const {checkTopicExist} = require("../controller/topic")
const {checkAnswerExist} = require("../controller/answer")

const jwt = require('koa-jwt')
// const jwt = require('jsonwebtoken')
const {secret} = require('../config')

// 自己编写的认证中间件
// const auth = async (ctx,next)=>{
//     const {authorization=''} = ctx.request.header
//     const token = authorization.replace('Bearer ','')
//     try {
//         const user = jwt.verify(token,secret)
//         ctx.state.user = user // 赋值
//     } catch (error) {
//         ctx.throw(401,error.message)
//     }
//     await next()
// }

// 使用koa-jwt编写的中间件
const auth = jwt({secret})

router.get('/',find)   // 找到所有用户
router.get("/:id",findById) // 根据id找到用户
router.post("/",create) // 创建
router.patch("/:id",auth,checkOwner,update)  // 更新
router.delete("/:id",auth,checkOwner,deleteById) // 删除

router.post("/login",login) //登录

router.get("/:id/fllowing",listFollowing) // 获取用户的关注人列表
router.get("/:id/fllowers",listFollower) // 获取用户的关注人列表

router.put('/fllowing/:id',auth,checkUserExist,fllow) // 点击关注
router.delete('/fllowing/:id',auth,checkUserExist,unfllow) // 点击取消关注

router.put('/fllowingTopic/:id',auth,checkTopicExist,fllowTopic) // 点击关注
router.delete('/unfllowingTopic/:id',auth,checkTopicExist,unfllowTopic) // 点击取消关注

router.get("/:id/fllowingTopic",listFollowingTopic) // 获取用户的关注话题列表

router.get("/:id/question",listQuestion) // 获取用户的提出问题列表

router.get("/:id/likingAnswers",listLikeAnswer) // 获取用户赞的答案列s表
router.put("/likingAnswers/:id",auth,checkAnswerExist,likeAnswers,undislikeAnswer) // 用户点击赞答案
router.delete("/likingAnswers/:id",auth,checkAnswerExist,unlikeAnswer) // 用户取s消赞答案

router.get("/:id/dislikingAnswers",listDisLikeAnswer) // 获取用户踩的答案列表
router.put("/dislikingAnswers/:id",auth,checkAnswerExist,dislikeAnswers,unlikeAnswer) // 用户点击踩答案
router.delete("/dislikingAnswers/:id",auth,checkAnswerExist,undislikeAnswer) // 用户取消踩答案

router.get("/:id/collectList",collectAnswerList) // 获取用户踩的答案列表
router.delete("/discollect/:id",auth,checkAnswerExist,discollectAnswer) // 用户取消收藏
router.put("/collect/:id",auth,checkAnswerExist,collectAnswer) // 用户收藏
module.exports = router