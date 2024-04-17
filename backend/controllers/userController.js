const ApiError = require("../Error/ApiError");
const router = require("../routes"); 
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const {User} = require('../models/models');
const { json } = require("sequelize");
const {tokenService} = require('../middleware/tokenService');

const generateJWT = (id, name, email) => {
    return jwt.sign({id, name, email}, 
        "random_secret",
        {expiresIn: '24h'});
};

class UserController {
    async registration(req, res, next){
        const {name, email, password} = req.body;
        if(!email || !password || !name){
            return next(ApiError.badRequest('Uncorrect password or email!'));
        }
        const candidate = await User.findOne({where: {email}});
        if (candidate){
            return next(ApiError.badRequest('User was registered already!'));
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({name, email, password: hashPassword});
        const token = generateJWT(user.id, user.name, user.email); 
        return res.json({token});
    };

    async login(req, res, next){
        const {email, password} = req.body;
        const user = await User.findOne({where: {email}});
        if(!user){
            return next(ApiError.badRequest('User was not found!'));
        }
        let comparePassword = bcrypt.compareSync(password, user.password);
        if(!comparePassword){
            return next(ApiError.badRequest('Uncorrect password'));
        }
        const token = generateJWT(user.id, user.name, user.email);
        return res.json({token: token});
    }

    async getUserId(req, res, next) {
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            return next(ApiError.badRequest('Token is empty'));
        }
        const decoded = jwt.verify(token, "random_secret");
        const userId = decoded.id;
        return res.json({ userId });
    }

    async getName(req, res, next) {
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            return next(ApiError.badRequest('Token is empty'));
        }
        const decoded = jwt.verify(token, "random_secret");
        const name = decoded.name;
        return res.json({ name });
    }

    
}

module.exports = new UserController();