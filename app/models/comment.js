const mongose = require('mongoose')
const {Schema,model} = mongose

const commentScema = new Schema({
    _v:{type:Number,select:false},
    content:{type:String,required:true}, // 介绍
    answerId:{type:String,required:true}, // 提问者
    commentator:{type:Schema.Types.ObjectId,ref:"users",required:true}, // 提问者的用户id
    questionId:{type:String,default:0,required:true},
    
    // 新增设计二级评论接口
    rootCommentId:{type:String}, // 一级评论id
    replyTo:{type:Schema.Types.ObjectId,ref:"users"}  // 回复者的详细信息
},{timestamps:true}) // 添加时间戳

module.exports = model('comment',commentScema)