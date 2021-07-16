const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const reserved = require('../constants/reserved');

module.exports = {
    issue_jwt: async (user) => {
        const id = user.id;
        const token = jwt.sign(id, process.env.RUNIV_SECRET);
        return token;
    },

    hash_password: async (password) => {
        const hashed_pass = await bcrypt.hash(password, 10);
        return hashed_pass;
    },

    compare_pass: async (plain_pass, hashed_pass) => {
        const same = await bcrypt.compare(plain_pass, hashed_pass);
        return same;
    },

    validate_alias: (alias) => {
        if(alias.lenght < 3 || alias.length > 14){
            return {
                valid: false,
                reason: `Alias length must be between 3 to 14`,
            };
        }
        const last_re = /[a-z0-9]$/i;
        const start_re = /^[a-z]/i;
        const exclude_re = /^[a-zA-Z0-9-]*$/i;
        const match = start_re.test(alias) && last_re.test(alias) && exclude_re.test(alias);
        if(!match){
            return {
                valid: false,
                reason: `Alias can only include number, english letters, hyphens. Must start with letter, end with letter or number`,
            }
        }

        const is_reserved = reserved.alias.findIndex(alias);
        if(is_reserved != -1){
            return {
                valid: false,
                reason: `Alias can not be a reserved word. ${reserved.alias.join(' ')}`,
            }
        }

        return {
            valid: true,
            reason: null,
        }
    },

    validate_slug: (slug) => {
        if(slug.length == 0){
            return {
                valid: false,
                reason: `Slug can not be empty`,
            }
        }

        if(slug.length > 60){
            return {
                valid: false,
                reason: `Slug length must be less than 60 characters`,
            }
        }

        const re = /^[a-zA-Z0-9-*_]*$/;
        const match = re.test(slug);
        if(!match){
            return{
                valid: false,
                reason: `Slug can only include letters, numbers and special characters -_*`
            }
        }

        const is_reserved = reserved.slug.findIndex(slug);
        if(is_reserved != -1){
            return {
                valid: false,
                reason: `Slug can not be a reserved word. ${reserved.slug.join(' ')}`,
            }
        }

        return {
            valid: true,
            reason: null,
        }
    },

    validate_url: (url) => {
        if(url.length == 0){
            return {
                valid: false,
                reason: `Url can not be empty`,
            };
        }

        if(url.length > 300){
            return {
                valid: false,
                reason: `Url must be less than 300 characters`
            }
        }

        const re = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        const match = re.test(url);
        if(!match){
            return {
                valid: false,
                reason: `Invalid Url`,
            }
        }

        return {
            valid: true,
            reason: null,
        }
    },

    detect_circular: (url, also_check_slug = null) => {
        const re = /^(https?:\/\/)/;
        if(!re.test(url)) url = 'http://'+url;
        const Url = new URL(url);
        //console.log(Url.origin, Url.pathname, Url.protocol, Url.hostname, Url.href);
        const host = Url.hostname;
        const host_re = /runiv.in$/i;
        const host_match = host_re.test(host);
        if(host_match){
            return {
                isCircular: true,
                reason: `Destination url can not point to *runiv.in/*`
            }
        }

        return {
            isCircular: false,
            reason: null,
        }
    }
}