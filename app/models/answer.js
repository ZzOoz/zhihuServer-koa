const mongose = require('mongoose')
const {Schema,model} = mongose

const answerScema = new Schema({
    _v:{type:Number,select:false},
    content:{type:String,required:false}, // 介绍
    answerer:{type:Schema.Types.ObjectId,ref:"users"}, // 提问者
    questionId:{type:String,require:true}, // 提问者的用户id
    vontCount:{type:Number,default:0,required:true}
},{timestamps:true})

module.exports = model('answer',answerScema)