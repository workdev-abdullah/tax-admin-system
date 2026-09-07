import mongoose from 'mongoose';
const schema=new mongoose.Schema({financialYear:{type:String,unique:true,required:true},prefix:{type:String,default:'INV'},nextNumber:{type:Number,default:1,min:1}},{timestamps:true});
export default mongoose.model('InvoiceSequence',schema);
