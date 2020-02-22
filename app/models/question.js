const mongose = require('mongoose')
const {Schema,model} = mongose

const questionScema = new Schema({
    _v:{type:Number,select:false},
    desc:{type:String,required:false}, // 描述
    title:{type:String,required:false}, // 介绍
    questioner:{type:Schema.Types.ObjectId,ref:"users",select:false}, // 提问者
    // 问题中会有许多个话题，在问题数据表中新建一个topics话题属性，
    //如果在话题数据表中添加问题是不合理的，因为一个话题中可能会有很多个问题，都存入不合理，
    // 相反一个问题最多可能只有10个话题，这样更符合逻辑 
    topics:{
        type:[
            {type:Schema.Types.ObjectId,ref:'topic'}
        ]
        ,select:false}
},{timestamps:true})

module.exports = model('question',questionScema)