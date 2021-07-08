const init = require('./init');
const model = require('./models');
//establish associations for models

model.user.hasMany(model.link, {
    foreignKey: 'owner',
});
model.link.belongsTo(model.user, {
    foreignKey: 'owner',
    constraints: false,
});

model.link.hasOne(model.metric, {
    foreignKey: 'link_id',
})

model.metric.belongsTo(model.link, {
    foreignKey: 'link_id',
})

module.exports = {
    init: init,
    model,
}