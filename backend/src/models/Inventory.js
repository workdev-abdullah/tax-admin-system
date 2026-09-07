import mongoose from 'mongoose';
const schema=new mongoose.Schema({productId:{type:mongoose.Schema.Types.ObjectId,ref:'Product',unique:true,required:true},quantity:{type:Number,default:0,min:0},lowStockThreshold:{type:Number,default:0,min:0}},{timestamps:true});
schema.index({quantity:1}); export default mongoose.model('Inventory',schema);
