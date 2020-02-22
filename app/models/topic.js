const mongose = require('mongoose')
const {Schema,model} = mongose

const topicScema = new Schema({
    _v:{type:Number,select:false},
    name:{type:String,required:true},  // 话题名
    avatar_url:{type:String,required:false}, // 图片
    introduction:{type:String,select:false}, // 介绍
    followerTopic:{type:Schema.Types.ObjectId,ref:"users"} // 关注话题的用户
},{timestamps:true})

module.exports = model('topic',topicScema)