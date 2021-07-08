const Link = require('../database/models/Link');
const Metric = require('../database/models/Metric');
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

            const user_slug = await Link.findOne({
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

            const metric = await Metric.create();
            const new_link = await Link.create({
                owner: req.user.id,
                slug,
                destination,
                metrics: metric.id,
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

}