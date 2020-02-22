const path = require('path')
const Comment = require("../models/comment")

class CommentCtrl{
    // 检查问题是否存在
    async checkCommentExist(ctx,next){
        // 通过问题拿到提问者
        const comment = await Comment.findById(ctx.params.id).select('+commentator') // 获取用户，展示评论人信息
        if(!comment) {ctx.throw(404,'评论不存在不存在')}
        // 只有包含questionId的时候（删改查）才会走下面的逻辑
        if(ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId){
            ctx.throw(404,'该问题下没有评论')
        }
        if(ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId){
            ctx.throw(404,'该答案下没有评论')
        }
        ctx.state.comment = comment //  将提问者存进ctx中去
        await next()
    }

    //  检查是否是提问者本身
    async checkCommentator(ctx,next){
        const {comment} = ctx.state; 
        // console.log(ctx.state.user)
        if(comment.commentator.toString() !== ctx.state.user._id){ctx.throw(403,'没有权限')}
        await next()
    }

    async find(ctx){
        const {pageSize = 10} = ctx.query
        const page = Math.max(ctx.query.page*1,1) - 1; // 页数先变成数字再减1 
        const page_size = Math.max(pageSize,1) // 每页大小
        const keyword = new RegExp(ctx.query.keyword)
        const {questionId,answerId} = ctx.params
        const {rootCommentId} = ctx.query // 一级评论id，如果有就是一级评论
        // limit是每页大小 skip是跳过多少开始
        ctx.body = await Comment
                .find({content:keyword,questionId,answerId,rootCommentId})  // 通过关键字搜索内容已经通过questionId搜索用户回答
                .limit(page_size)    //分页
                .skip(page * page_size)   //分页
                .populate("commentator replyTo")  // 将评论人的信息展示出来 以及将回复者展示出来
    }
    // 查询话题
    async findById(ctx){
        const {fileds = ''} = ctx.request.query;
        const selectFileds = fileds.split(";").filter(f=>f).map(f=>'+' + f).join(" ")
        // console.log(selectFileds)
        // populate 可以看到多个想要看到的属性 select是动态显示属性
        const comment = await Comment.findById(ctx.params.id).select(selectFileds).populate('commentator');
        ctx.body = comment
    }

    // 创建话题
    async create(ctx){
        ctx.verifyParams({
            content:{type:'string',required:true},
            rootCommentId:{type:'string',required:false}, // 一级评论id
            replyTo:{type:"string",required:false}  // 回复者的详细信息
        })
        // 新建问题不仅仅只有问题题目和描述还有提问者
        const commentator = ctx.state.user._id;
        const {questionId,answerId} = ctx.params
        const answer = await new Comment({...ctx.request.body,commentator,questionId,answerId}).save()  // 创建一个新的问题
        ctx.body = answer
    }

    // 更新评论
    async update(ctx){
        ctx.verifyParams({
            content:{type:'string',required:false},
        })
        // 通过查找id并更新话题
        // const answer = await Answer.findByIdAndUpdate(ctx.params.id,ctx.request.body)
        // console.log(question)
        const {content} = ctx.request.body // 只允许更新content 其他例如rootCommentid\replyTo 等不更新 如果由用户更新一级评论是不可以的
        await ctx.state.comment.update(content) // 直接更新 之前校验问题是否存在的时候已经找到该问题的id了
        ctx.body = ctx.state.comment
    }

    // 删除
    async deleteComment(ctx){
        await Comment.findByIdAndRemove(ctx.params.id) // 获取关注了ctx.params.id的这个所有用户列表
        ctx.body = {
            status:204,
            message:"删除成功"
        }
    }

} 

module.exports = new CommentCtrl()