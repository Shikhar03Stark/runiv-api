const jwt = require('jsonwebtoken');
const util = require('./util');
const User = require('../database/models/User');

module.exports = {
    util,

    check_slug_id: async (req, res, next) => {
        try {
            const slug_id = req.params.slug_id;
            const re = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
            if(!re.test(slug_id)){
                next({
                    status: 400, 
                    message: `Invalid, UUIDv4 provided`,
                });
                return;
            }
            next();

        } catch (error) {
            next({
                status: error.status || 500,
                message: error.message || 'Internal server error',
            });
        }
    },

    verify_jwt: async (req, res, next) => {
        try {
            const bearer_token = req.get('Authorization');
            if(!bearer_token){
                next({
                    status: 401,
                    message: 'Unauthorized, provide a token'
                });
            }
            else{
                const token = bearer_token.substr('Bearer '.length);
                const id = jwt.verify(token, process.env.RUNIV_SECRET).id;
                const user = await User.findByPk(id);
                if(!user){
                    next({
                        status: 401,
                        message: `Unauthorized, invalid token`,
                    });
                }
                else{
                    req.user = user;
                    next();
                }
            }
            
        } catch (error) {
            next({
                status: error.status || 500,
                message: error.message || 'Internal server error',
            });
        }
    },

    validate_university: async (req, res, next) => {
        try {
            const email = req.body.email;
            if(!email){
                next({
                    status: 400,
                    message: `Email not found`,
                });
            }
            else{
                const re = /@thapar.edu?/;
                const valid = re.test(email);
                if(!valid){
                    next({
                        status: 400,
                        message: `Enter Thapar University email only`
                    });
                }
                else{
                    next();
                }
            }
            
        } catch (error) {
            next({
                status: error.status || 500,
                message: error.message || 'Internal server error',
            });
        }
    },

}