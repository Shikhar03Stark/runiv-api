const models = require('../database').model;
const util = require('../middlewares/util');

module.exports = {
    new_link: async (req, res, next) => {
        try {
            const slug = req.body.slug;
            const destination = req.body.destination;

            if(!slug || !destination){
                res.status(400).json({
                    ok: false,
                    message: `Missing fields slug/destination`,
                });
                return;
            }

            if(!util.validate_slug(slug).valid){
                res.status(400).json({
                    ok: false,
                    message: util.validate_slug(slug).reason,
                });
                return;
            }

            if(!util.validate_url(destination).valid){
                res.status(400).json({
                    ok: false,
                    message: util.validate_url(destination).reason,
                });
                return;
            }

            const user_slug = await models.link.findOne({
                where: {
                    owner: req.user.id,
                    slug: slug,
                }
            });

            if(user_slug){
                res.status(400).json({
                    ok: false,
                    message: `Slug already exists`,
                });
                return;
            }

            const circular = util.detect_circular(destination);

            if(circular.isCircular){
                res.status(400).json({
                    ok: false,
                    messae: circular.reason,
                });
                return;
            }

            const metric = await models.metric.create();
            const new_link = await models.link.create({
                owner: req.user.id,
                slug,
                destination,
                metric_id: metric.id,
            });
            await models.metric.update({
                link_id: new_link.id,
            }, {
                where: {
                    id: metric.id,
                }
            });
            res.status(201).json({
                ok: true,
                link: new_link,
            })
            
        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    },

    all_links: async (req, res, next) => {
        try {
            const links = await models.link.findAll({
                where: {
                    owner: req.user.id,
                }
            });

            res.status(200).json({
                ok: true,
                links,
            });
            
        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    },

    details: async (req, res, next) => {
        try {
            const slug = req.params.slug;
            const valid = util.validate_slug(slug);
            if(!valid.valid){
                res.status(400).json({
                    ok: false,
                    message: valid.reason,
                });
            }

            const detailed_link = await models.link.findOne({
                where: {
                    owner: req.user.id,
                    slug,
                },
                include: {
                    model: models.metric,
                    attributes: ['timestamps', 'created_at', 'updated_at']
                }
            });

            if(!detailed_link){
                res.status(400).json({
                    ok: false,
                    link: `Slug not found`,
                })
                return;
            }

            res.status(200).json({
                ok: true,
                link: detailed_link,
            })
            
        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    },

    get_metrics: async (req, res, next) => {
        try {
            const slug = req.params.slug;
            const valid = util.validate_slug(slug);
            if(!valid.valid){
                res.status(400).json({
                    ok: false,
                    message: valid.reason,
                });
            }

            const detailed_link = await models.link.findOne({
                where: {
                    owner: req.user.id,
                    slug,
                },
                attributes: ['owner', 'updated_at', 'redirects'],
                include: {
                    model: models.metric,
                    attributes: ['timestamps', 'created_at', 'updated_at']
                }
            });
            //console.dir(detailed_link.getDataValue('updated_at'), {depth:4});
            if(!detailed_link){
                res.status(400).json({
                    ok: false,
                    link: `Slug not found`,
                })
                return;
            }

            const response = {
                owner_id: detailed_link.owner,
                slug,
                timestamps: detailed_link.metric.timestamps,
                redirects: detailed_link.redirects,
                last_access: detailed_link.metric.getDataValue('updated_at'),
            };

            res.status(200).json(response);

            
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
            const selected_slug = req.params.slug;

            const slug = req.body.slug;
            const destination = req.body.destination;
            const status = req.body.status;

            const update_obj = {};
            if(slug){
                const valid = util.validate_slug(slug);
                if(!valid.valid){
                    res.status(400).json({
                        ok: false,
                        message: valid.reason,
                    });
                    return;
                }
                update_obj.slug = slug;
            }

            if(destination){
                const valid = util.validate_url(destination);
                if(!valid.valid){
                    res.status(400).json({
                        ok: false,
                        message: valid.reason,
                    });
                    return;
                }
                update_obj.destination = destination;
            }

            if(status){
                if(status == 'ACTIVE' || status == 'INACTIVE' || status == 'DISABLED'){
                    update_obj.status = status;
                }
                else{
                    res.status(400).json({
                        ok: false,
                        message: `Status can be ACTIVE. INACTIVE, DISABLED`,
                    })
                    return;
                }
            }

            const circular = util.detect_circular(destination);

            if(circular.isCircular){
                res.status(400).json({
                    ok: false,
                    messae: circular.reason,
                });
                return;
            }

            const count = await models.link.update(update_obj, {
                where: {
                    slug: selected_slug,
                    owner: req.user.id,
                }
            });

            if(count[0] > 0){
                res.status(200).json({
                    ok: true,
                });
            }
            else{
                res.status(400).json({
                    ok:false,
                    message: `link not found`,
                })
            }

        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    },

    remove_link: async (req, res, next) => {
        try {
            const id = req.body.id;
            if(!id){
                res.status(403).json({
                    ok: false,
                    message: `link 'id' field is required`,
                });
                return;
            }

            const link = await models.link.findByPk(id);

            if(!link || id != link.id || link.owner != req.user.id){
                res.status(403).json({
                    ok: false,
                    messae: `link doesn't exists`,
                });
                return ;
            }

            await models.link.destroy({
                where: {
                    id: id,
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
    }
}