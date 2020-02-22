const path = require('path')
const Answer = require("../models/answer")

class AnswerCtrl{
    // 检查问题是否存在
    async checkAnswerExist(ctx,next){
        // 通过问题拿到提问者
        const answer = await Answer.findById(ctx.params.id).select('+questioner')
        if(!answer) {ctx.throw(404,'答案不存在')}
        // 只有包含questionId的时候（删改查）才会走下面的逻辑
        if(ctx.params.questionId && answer.questionId.toString() !== ctx.params.questionId){
            ctx.throw(404,'该问题下没有答案')
        }
        ctx.state.answer = answer //  将提问者存进ctx中去
        await next()
    }

    //  检查是否是提问者本身
    async checkAnswerer(ctx,next){
        const {answer} = ctx.state; 
        console.log(ctx.state.user)
        if(answer.answerer.toString() !== ctx.state.user._id){ctx.throw(403,'没有权限')}
        await next()
    }

    async find(ctx){
        const {pageSize = 10} = ctx.query
        const page = Math.max(ctx.query.page*1,1) - 1; // 页数先变成数字再减1 
        const page_size = Math.max(pageSize,1) // 每页大小
        const keyword = new RegExp(ctx.query.keyword)
        // limit是每页大小 skip是跳过多少开始
        ctx.body = await Answer
                .find({content:keyword,questionId:ctx.params.questionId})  // 通过关键字搜索内容已经通过questionId搜索用户回答
                .limit(page_size)    //分页
                .skip(page * page_size)   //分页
    }
    // 查询话题
    async findById(ctx){
        const {fileds = ''} = ctx.request.query;
        const selectFileds = fileds.split(";").filter(f=>f).map(f=>'+' + f).join(" ")
        // console.log(selectFileds)
        // populate 可以看到多个想要看到的属性 select是动态显示属性
        const answer = await Answer.findById(ctx.params.id).select(selectFileds).populate('answerer');
        ctx.body = answer
    }

    // 创建话题
    async create(ctx){
        ctx.verifyParams({
            content:{type:'string',required:true},
        })
        // 新建问题不仅仅只有问题题目和描述还有提问者
        const answerer = ctx.state.user._id;
        const {questionId} = ctx.params
        const answer = await new Answer({...ctx.request.body,answerer,questionId}).save()  // 创建一个新的问题
        ctx.body = answer
    }

    // 更新话题
    async update(ctx){
        ctx.verifyParams({
            content:{type:'string',required:false},
        })
        // 通过查找id并更新话题
        // const answer = await Answer.findByIdAndUpdate(ctx.params.id,ctx.request.body)
        // console.log(question)
        await ctx.state.answer.update(ctx.request.body) // 直接更新 之前校验问题是否存在的时候已经找到该问题的id了
        ctx.body = ctx.state.answer
    }

    // 删除
    async deleteAnswer(ctx){
        await Answer.findByIdAndRemove(ctx.params.id) // 获取关注了ctx.params.id的这个所有用户列表
        ctx.body = {
            status:204,
            message:"删除成功"
        }
    }

} 

module.exports = new AnswerCtrl()