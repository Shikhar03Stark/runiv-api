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
            const response = {
                owner_id: detailed_link.owner,
                slug,
                timestamps: detailed_link.metric.timestamps,
                last_access: detailed_link.getDataValue('updated_at'),
                redirects: detailed_link.redirects,
            };

            res.status(200).json(response);

            
        } catch (error) {
            console.log(error);
            next({
                status: 500,
                message: `Internal server error`,
            })
        }
    }
}