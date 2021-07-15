const models = require('../database').model;
const util = require('../middlewares/util');
const rc = require('../database/redis');

module.exports = {
    signup: async (req, res, next) => {
        try {
            const name = req.body.name;
            const email = req.body.email;
            const password = req.body.password;
            const gender = req.body.gender;
            const dob = req.body.dob;

            if(!name || !email || !password){
                res.status(400).json({
                    ok: false,
                    message: `Missing fields, name/email/password`,
                    data: {
                        name: name || null,
                        email: email || null,
                    }
                });
                return;
            }

            const user = await models.user.findOne({
                where: {
                    email: email,
                }
            });

            if(user){
                res.status(409).json({
                    ok: false,
                    message: `User already exists with same email`,
                    data: {
                        name: name,
                    }
                });
                return;
            }
            
            const hashed_pass = await util.hash_password(password);

            const user_obj = {
                name,
                email,
                password: hashed_pass,
                gender: gender || null,
                dob: dob || null,
            };

            const new_user = await models.user.create(user_obj);
            const jwt_token = await util.issue_jwt(new_user);

            const data = {
                id: new_user.id,
                name: new_user.name,
                email: new_user.email,
                alias: new_user.alias,
                plan: new_user.plan,
                banned: new_user.banned,
                gender: new_user.gender,
                dob: new_user.dob,
            }

            res.status(201).json({
                ok: true,
                user: data,
                token: jwt_token,
            });
            return;


        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    },

    login: async (req, res, next) => {
        try {
            const email = req.body.email;
            const password = req.body.password;

            if(!email || !password){
                res.status(401).json({
                    ok: false,
                    message: `Missing fields email/password`,
                    data: {
                        email: email || null,
                    }
                });
                return;
            }

            const user = await models.user.findOne({
                where:{
                    email: email,
                }
            });

            if(!user){
                res.status(400).json({
                    ok: false,
                    message: `User doesn't exist, signup`
                });
                return;
            }

            const match = await util.compare_pass(password, user.password);

            if(!match){
                res.status(401).json({
                    ok: false,
                    message: `Email/password doesn't match`,
                });
                return;
            }

            const token = await util.issue_jwt(user);
            const data = {
                id: user.id,
                name: user.name,
                email: user.email,
                alias: user.alias,
                plan: user.plan,
                banned: user.banned,
                gender: user.gender,
                dob: user.dob,
            }
            res.status(200).json({
                ok: true,
                user: data,
                token,
            });

            return;
            
        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    },

    update: async (req, res, next) => {
        try {
            const name = req.body.name;
            const gender = req.body.gender;
            const dob = req.body.dob;
            let alias = req.body.alias;
            if(name && name.length == 0){
                res.status(400).json({
                    ok:false,
                    message: `Name can't be empty string`,
                });
                return;
            }
            if(alias){
                alias = alias.toLowerCase();
                const valid = util.validate_alias(alias);
                if(!valid.valid){
                    res.status(400).json({
                        ok:false,
                        message: valid.reason,
                    });
                    return;
                }
            }

            const new_obj = {};
            if(alias && alias != req.user.alias){
                if(alias) new_obj.alias = alias;
                const check_alias = await models.user.findOne({
                    where: {
                        alias: alias,
                    }
                });
                if(check_alias){
                    res.status(400).json({
                        ok: false,
                        message: `Alias already exists`,
                    });
                    return;
                }
                
                rc.SCAN(0, 'MATCH', `${req.user.alias}:*`, (err, data) => {
                    if(err){
                        next({
                            status: 500,
                            messae: `Error connecting to redis`
                        })
                        return;
                    }
                    const keys = data[1];
                    if(keys.length > 0){
                        rc.DEL(...keys);
                    }
                })
            }
            if(name) new_obj.name = name;
            if(gender) new_obj.gender = gender;
            if(dob) new_obj.dob = dob;

            const updated_user = await models.user.update(new_obj, {
                where: {
                    id: req.user.id,
                }
            });
            if(updated_user[0] > 0){
                res.status(200).json({
                    ok: true,
                });
            }
            else{

            }
            
        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    },

    terminate: async (req, res, next) => {
        try {
            const id = req.body.id;
            if(!id){
                res.status(403).json({
                    ok: false,
                    message: `user 'id' field is required`,
                });
                return;
            }

            if(id != req.user.id){
                res.status(403).json({
                    ok: false,
                    messae: `user id doesn't match with current session`,
                });
                return ;
            }

            await models.user.destroy({
                where: {
                    id: id,
                }
            });

            rc.SCAN(0, 'MATCH', `${req.user.alias}:*`, (err, data) => {
                if(err){
                    next({
                        status: 500,
                        messae: `Error connecting to redis`
                    })
                    return;
                }
                const keys = data[1];
                if(keys.length > 0){
                    rc.DEL(...keys);
                }
            });

            res.status(200).json({
                ok: true,
            });
            
        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    },

    view: async (req, res, next) => {
        try {
            const user = req.user;
            const attached_link = await models.link.findAll({
                where: {
                    owner: user.id,
                }
            });
            const total_links = attached_link.length;
            let active_links = 0, disabled_links = 0;
            attached_link.forEach(link => {
                if(link.status == 'ACTIVE'){
                    active_links++;
                }
                if(link.status == 'DISABLED'){
                    disabled_links++;
                }
            });
            const inactive_links = total_links - active_links - disabled_links;
            const data = {
                id: user.id,
                name: user.name,
                email: user.email,
                alias: user.alias,
                plan: user.plan,
                banned: user.banned,
                dob: user.dob,
                created_at: user.created_at,
                active_links: active_links,
                inactive_links: inactive_links,
                total_links: total_links,
                links: attached_link,
            }

            res.status(200).json({
                ok: true,
                user: data,
            });
            
        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    }
}