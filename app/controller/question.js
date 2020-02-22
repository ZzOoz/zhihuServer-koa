const path = require('path')
const Question = require("../models/question")

class QuestionCtrl{
    // 检查问题是否存在
    async checkQuestionExist(ctx,next){
        // 通过问题拿到提问者
        const question = await Question.findById(ctx.params.id).select('+questioner')
        if(!question) {ctx.throw(404,'问题不存在')}
        // console.log(question)
        ctx.state.question = question //  将提问者存进ctx中去
        await next()
    }

    // 检查是否是提问者本身
    async checkQuestioner(ctx,next){
        const {question} = ctx.state; 
        console.log(ctx.state.user)
        if(question.questioner.toString() !== ctx.state.user._id){ctx.throw(403,'没有权限')}
        await next()
    }

    async find(ctx){
        const {pageSize = 10} = ctx.query
        const page = Math.max(ctx.query.page*1,1) - 1; // 页数先变成数字再减1 
        const page_size = Math.max(pageSize,1) // 每页大小
        const keyword = new RegExp(ctx.query.keyword)
        // limit是每页大小 skip是跳过多少开始
        ctx.body = await Question
                .find({$or:[{title:keyword},{desc:keyword}]})  // 通过or语法匹配两者都会命中
                .limit(page_size)    //分页
                .skip(page * page_size)   //分页
    }
    // 查询话题
    async findById(ctx){
        const {fileds = ''} = ctx.request.query;
        const selectFileds = fileds.split(";").filter(f=>f).map(f=>'+' + f).join(" ")
        // console.log(selectFileds)
        // populate 可以看到多个想要看到的属性 select是动态显示属性
        const question = await Question.findById(ctx.params.id).select(selectFileds).populate('questioner topics');
        ctx.body = question
    }

    // 创建话题
    async create(ctx){
        ctx.verifyParams({
            title:{type:'string',required:true},
            desc:{type:'string',required:true},
        })
        // 新建问题不仅仅只有问题题目和描述还有提问者
        const question = await new Question({...ctx.request.body,questioner:ctx.state.user._id}).save()  // 创建一个新的问题
        ctx.body = question
    }

    // 更新话题
    async update(ctx){
        ctx.verifyParams({
            title:{type:'string',required:false},
            desc:{type:'string',required:false},
        })
        // 通过查找id并更新话题
        const question = await Question.findByIdAndUpdate(ctx.params.id,ctx.request.body)
        console.log(question)
        // await ctx.state.question.update(ctx.request.body) // 直接更新 之前校验问题是否存在的时候已经找到该问题的id了
        // console.log(ctx.state.question)
        ctx.body = question
    }

    // 删除
    async deleteQuestion(ctx){
        await Question.findByIdAndRemove(ctx.params.id) // 获取关注了ctx.params.id的这个所有用户列表
        ctx.body = {
            status:204,
            message:"删除成功"
        }
    }

} 

module.exports = new QuestionCtrl()