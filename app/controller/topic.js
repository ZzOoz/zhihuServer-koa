const path = require('path')
const Topic = require("../models/topic")
const User = require("../models/users")
const Question = require("../models/question")

class TopicCtrl{
    // 判断话题是否存在的中间件
    async checkTopicExist(ctx,next){
        const user = await Topic.findById(ctx.params.id)
        if(!user) {ctx.throw(404,'话题不存在')}
        await next() // 如果有执行下一个中间件
    }
    async find(ctx){
        const {pageSize = 10} = ctx.query
        const page = Math.max(ctx.query.page*1,1) - 1; // 页数先变成数字再减1 
        const page_size = Math.max(pageSize,1) // 每页大小
        // limit是每页大小 skip是跳过多少开始
        ctx.body = await Topic
                .find({name:new RegExp(ctx.query.keyword)})  // 通过正则表达式进行模糊查询
                .limit(page_size)    //分页
                .skip(page * page_size)   //分页
    }
    // 查询话题
    async findById(ctx){
        const {fileds = ''} = ctx.request.query;
        const selectFileds = fileds.split(";").filter(f=>f).map(f=>'+' + f).join("")
        const topic = await Topic.findById(ctx.params.id).select(selectFileds);
        ctx.body = topic
    }

    // 创建话题
    async create(ctx){
        ctx.verifyParams({
            name:{type:'string',required:true},
            avatar_url:{type:'string',required:false},
            introduction:{type:'string',required:false}
        })
        const topic = await new Topic(ctx.request.body).save()  // 创建一个新的话题
        ctx.body = topic
    }

    // 更新话题
    async update(ctx){
        ctx.verifyParams({
            name:{type:'string',required:false},
            avatar_url:{type:'string',required:false},
            introduction:{type:'string',required:false}
        })

        // 通过查找id并更新话题
        const topic = await Topic.findByIdAndUpdate(ctx.params.id,ctx.request.body) 
        ctx.body = topic
    }

    // 获取话题用户列表
    async listFollowerTopic(ctx){
        const users = await User.find({fllowingTopic:ctx.params.id}) // 获取关注了ctx.params.id的这个所有用户列表
        ctx.body = users
    }

    // 通过话题寻找问题列表
    async listQuestions(ctx){
        // 通过话题的id寻找问题
        const question = await Question.find({topics:ctx.params.id})
        ctx.body = question
    }
} 

module.exports = new TopicCtrl()