const jwt = require("jsonwebtoken")
const {secret} = require('../config')
const User = require("../models/users")
const Question = require("../models/question")
const Answer = require("../models/answer")
class UserCtrl{
    // 判断用户是否存在的中间件
    async checkUserExist(ctx,next){
        const user = await User.findById(ctx.params.id)
        if(!user) {ctx.throw(404,'用户不存在')}
        await next() // 如果有执行下一个中间件
    }
    async checkOwner(ctx,next){
        if(ctx.params.id !== ctx.state.user._id){
            ctx.throw(403,"没有权限")
        }
        await next()
    }
    // async find(ctx){
    //     const users = await User.find()
    //     ctx.body = users
    // }
    async find(ctx){
        const {pageSize = 10} = ctx.query
        const page = Math.max(ctx.query.page*1,1) - 1; // 页数先变成数字再减1 
        const page_size = Math.max(pageSize,1) // 每页大小
        // limit是每页大小 skip是跳过多少开始
        ctx.body = await User
                .find({name:new RegExp(ctx.query.keyword)})  // 通过正则表达式进行模糊查询
                .limit(page_size)    //分页
                .skip(page * page_size)   //分页
    }
    async findById(ctx){
        const {fileds = ''} = ctx.query
        const selectFileds = fileds.split(';').filter(f=>f).map(f=>' +'+f).join("")
        // 动态查询
        const populateStr = fileds.split(';').filter(f=>f).map(f=>{
            if(f === 'educations'){
                return 'educations.school educations.marjor'
            }
            if(f === 'employments'){
                return 'employments.job employments.company' 
            }
            return f
        }).join(' ') // 用空格链接

        const user = await User
            .findById(ctx.params.id)
            .select(selectFileds)
            .populate(populateStr)
        if(!user) {ctx.throw(404,'用户不存在')}
        ctx.body = user
    }

    async create(ctx){
        ctx.verifyParams({
            name:{type:'string',required:true},
            password:{type:'string',require:true}
        })

        const {name} = ctx.request.body
        const verifyUser = await User.findOne({name})
        if(verifyUser){ctx.throw(409,"用户已经存在")}

        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
    async update(ctx){
        ctx.verifyParams({
            name:{type:"string",required:false},
            password:{type:"string",required:false},
            avatar_url:{type:"string",required:false},
            headline:{type:"string",required:false},
            locations:{type:"array",itemType:'string',required:false},
            gender:{type:"string",required:false},
            business:{type:"string",required:false},
            employments:{type:"array",itemType:'object',required:false},
            educations:{type:"array",itemType:'object',require:false}
        })
        const user = await User.findByIdAndUpdate(ctx.params.id,ctx.request.body)
        if(!user) {ctx.throw(404),'用户不存在'}
        ctx.body = user
    }
    async deleteById(ctx){
        const user = await User.findByIdAndRemove(ctx.params.id)
        if(!user) {ctx.throw(404),'用户不存在'}
        ctx.status = 204
    }

    async login(ctx){
        ctx.verifyParams({
            name:{type:'string',required:true},
            password:{type:'string',required:true}
        })

        const user = await User.findOne(ctx.request.body)
        if(!user) {ctx.throw(401,'用户名或密码不正确')}
        const {_id,name} = user
        const token = jwt.sign({_id,name},secret,{expiresIn:'1d'})
        ctx.body = {
            token
        }
    }

    // 获取关注人列表
    async listFollowing(ctx){
        const user =await User.findById(ctx.params.id).select("+fllowing").populate('fllowing')
        if(!user) {ctx.throw(404)}
        ctx.body = user.fllowing
    }

    // 获取粉丝列表
    async listFollower(ctx){
        const users = await User.find({fllowing:ctx.params.id}) // 获取关注了ctx.params.id的这个所有用户列表
        ctx.body = users
    }
    // 点击关注
    async fllow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+fllowing') // 拿到该用户的关注人列表
        if(!me.fllowing.map(id=>id.toString()).includes(ctx.params.id)){ // 将ctx.param.id 转成字符串（之前再mongoose是特殊类型）
            me.fllowing.push(ctx.params.id); // 将id推入fllowing数组中
            me.save() // 在数据库中保存
        }
        ctx.status = 204
    }

    // 点击取消关注
    async unfllow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+fllowing') // 拿到该用户的关注人列表
        const index = await me.fllowing.map(id => id.toString()).indexOf(ctx.params.id)
        if(index > -1){ // 如果有关注过这个用户
            me.fllowing.splice(index,1); // 取消这个关注
            me.save() // 在数据库中保存
        }
        ctx.status = 204
    }

    // 点击关注话题
    async fllowTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+fllowingTopic') // 拿到该用户的关注人列表
        if(!me.fllowingTopic.map(id=>id.toString()).includes(ctx.params.id)){ // 将ctx.param.id 转成字符串（之前再mongoose是特殊类型）
            me.fllowingTopic.push(ctx.params.id); // 将id推入fllowing数组中
            me.save() // 在数据库中保存
        }
        ctx.body = {
            status:204,
            message:"关注话题成功"
        }
    }

    // 用户点击取消关注话题
    async unfllowTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+fllowingTopic') // 拿到该用户的关注人列表
        const index = await me.fllowingTopic.map(id => id.toString()).indexOf(ctx.params.id)
        if(index > -1){ // 如果有关注过这个用户
            me.fllowingTopic.splice(index,1); // 取消这个关注
            me.save() // 在数据库中保存
        }
        ctx.body = {
            status:204,
            message:"取消关注话题成功"
        }
    }

    // 获取关注话题列表
    async listFollowingTopic(ctx){
        const user =await User.findById(ctx.params.id).select("+fllowingTopic").populate('fllowingTopic')
        if(!user) {ctx.throw(404)}
        ctx.body = user.fllowingTopic
    }

    // 获取用户的问题列表
    async listQuestion(ctx){
        const question = await Question.find({questioner:ctx.params.id})
        ctx.body = question
    }

    // 列出用户喜欢的答案列表
    async listLikeAnswer(ctx){
        const user = await User.findById(ctx.params.id).select("+likeAnswer").populate('likeAnswer');
        if(!user) {ctx.throw(404,'用户不存在')};
        ctx.body = user.likeAnswer
    }

    // 列出用户踩的答案列表
    async listDisLikeAnswer(ctx){
        const user = await User.findById(ctx.params.id).select("+dislikeAnswer").populate('dislikeAnswer');
        if(!user) {ctx.throw(404,'用户不存在')};
        ctx.body = user.dislikeAnswer
    }

    // 用户点击喜欢答案加1
    async likeAnswers(ctx,next){
        const me = await User.findById(ctx.state.user._id).select('+likeAnswer').populate("likeAnswer");
        // console.log(me,'hhhh')
        if(!me.likeAnswer.map(id => id.toString()).includes(ctx.params.id)){
            me.likeAnswer.push(ctx.params.id);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{vontCount:1}})
        }
        ctx.body = {
            status:204,
            message:'点赞成功'
        }
        await next()
    }

    // 用户点击取消点赞答案
    async unlikeAnswer(ctx){
        const me = await User.findById(ctx.state.user._id).select('+likeAnswer')
        console.log(me.likeAnswer,'我')
        const index = me.likeAnswer.map(id=>id.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.likeAnswer.splice(index,1);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{vontCount:-1}})

        }
        ctx.body = {
            status:204,
            message:'取消点赞成功'
        }
    }


    // 用户点击踩答案
    async dislikeAnswers(ctx,next){
        const me = await User.findById(ctx.state.user._id).select('+dislikeAnswer') 
        // console.log(me,'hhhh')
        if(!me.dislikeAnswer.map(id => id.toString()).includes(ctx.params.id)){
            me.dislikeAnswer.push(ctx.params.id);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{vontCount:1}})
        }
        ctx.body = {
            status:204,
            message:'点赞成功'
        }
        await next()
    }


    // 用户点击取消踩答案
    async undislikeAnswer(ctx){
        const me = await User.findById(ctx.state.user._id).select('+dislikeAnswer')
        console.log(me)
        // const index = 1;
        const index = me.dislikeAnswer.map(id=>id.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.dislikeAnswer.splice(index,1);
            me.save();
        }
        ctx.body = {
            status:204,
            message:'取消踩答案'
        }
    }

    // 获取用户收藏的答案
    async collectAnswerList(ctx){
        const user = await User.findById(ctx.params.id).select("+collect").populate("collect");
        if(!user) {ctx.throw(404,'该用户不存在')}
        ctx.body = user.collect
    }


    // 收藏答案
    async collectAnswer(ctx){
        const me = await User.findById(ctx.state.user._id).select("+collect");
        if(!me.collect.map(id=>id.toString()).includes(ctx.params.id)){
            me.collect.push(ctx.params.id) // 将收藏答案push进去
            me.save()
        }
        ctx.body = {
            status:204,
            message:"收藏成功"
        }
    }

    // 取消收藏
    async discollectAnswer(ctx){
        const me = await User.findById(ctx.state.user._id).select("+collect");
        const index = me.collect.map(id => id.toString()).indexOf(ctx.params.id)
        if(index > -1){
            me.collect.splice(index,1);
            me.save()
        }

        ctx.body = {
            status:204,
            message:"取消收藏成功"
        }
    }
}   

module.exports = new UserCtrl()