require('dotenv').config()
const express = require("express")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = require('./userModel.')

const router = express.Router()


const accessToken = (payload)=>{
    return jwt.sign(payload, process.env.Access_token_key , {expiresIn:'10m'})
}
const refreshToken = (payload)=>{
    return jwt.sign(payload, process.env.Refresh_token_key, {expiresIn:`${24*7}h`})
}

router.post("/register",async (req , res) => {
    const {username , password} = req.body

    const exist = await user.findOne(username)
    if(exist){return res.status(400).json({msg:"Username already exists"})}
    const hashPswd = await bcrypt.hash(password,10)
    const newUser = new user({username,hashPswd,tokenVersion:0})
    await newUser.save()
    res.cookie("accessToken", accessToken({username , tokenVersion:0}))
    res.cookie("refreshToken",refreshToken({username , tokenVersion:0}))
    return res.status(200).json({msg:"Registered"})
})

router.post("/login",async(req,res) => {
    const {username , password} = req.body
    const exist = await user.findOne(username)
    if(!exist){return res.status(400).json({msg:"Username Don't exists"})}
    const valid = await bcrypt.compare(password,exist.password)
    if(!valid){return res.status(400).json({msg:"Wrong Password"})}
    exist.tokenVersion+=1
    await exist.save()
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.cookie("accessToken", accessToken({username , tokenVersion:exist.tokenVersion}))
    res.cookie("refreshToken",refreshToken({username , tokenVersion:exist.tokenVersion}))
    return res.status(200).json({msg:"Logged In"})
})

router.post('/logout', (req,res)=>{
    const {username} = req.body
    const userInstance = user.findOne(username)
    userInstance.tokenVersion+=1
    userInstance.save()
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    return res.status(200).json({msg:"Logged Out"})
})

module.exports = {router:router , accessToken}