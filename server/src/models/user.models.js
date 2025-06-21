import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 4,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  collegeIdProof: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  dob:{
    type: Date,
  },
  regNo:{
    type: String,
  },
  gender:{
    type: String,
    enum : ['Male', 'Female', 'Other']
  },
  avatarUrl :{
    type: String,
    default: '', 
  },
  avatarPublicId: { 
    type: String, 
    default: ""
   },
  hobbies:{
    type: [String],
    default: [],
  },
  description:{
    type: String,
  },
  friends: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
],
  
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},{timestamps: true});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    // Hash the password before saving
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}


export default mongoose.model('User', userSchema);
