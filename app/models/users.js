const mongose = require('mongoose')
const {Schema,model} = mongose

const userScema = new Schema({
    name:{type:String,required:true},
    password:{type:String,required:true,select:false},
    avatar_url:{type:String},
    headline:{type:String},
    business:{type:Schema.Types.ObjectId,ref:'topic',select:false}, //话题引用
    locations:{type:[{type:Schema.Types.ObjectId,ref:'topic'}],select:false}, //话题引用
    gender:{type:String,enum:['male','female'],default:'male',required:true},
    employments:{type:[{company:{type:Schema.Types.ObjectId,ref:'topic'},job:{type:Schema.Types.ObjectId,ref:'topic'}}],select:false},
    educations:{type:[{
        school:{type:Schema.Types.ObjectId,ref:'topic'},  //话题引用
        marjor:{type:Schema.Types.ObjectId,ref:'topic'}, //话题引用
        diploma:{type:String,enum:[1,2,3,4,5]},
        entrance_year:{type:Number},
        graduation_year:{type:Number}}],
        select:false
    },
    // 用户的关注人列表
    fllowing:{type:[{type:Schema.Types.ObjectId,ref:"users"}]}, // 引用users表中的OjbectId 就可以拿到关注该用户的关注人列表
    fllowingTopic:{type:[{type:Schema.Types.ObjectId,ref:"topic",select:false}]}, 

    likeAnswer:{
       type:[{type:Schema.Types.ObjectId,ref:'answer'}],
       select:false},  // 用户喜欢的答案  
    dislikeAnswer:{
        type:[{type:Schema.Types.ObjectId,ref:'answer'}],
        select:false
    }, // 用户踩的答案
    collect:{
        type:[{type:Schema.Types.ObjectId,ref:'answer'}],
        select:false
    } // 用户收藏的答案
},{timestamps:true})

module.exports = model('users',userScema)