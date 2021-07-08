const init = require('./init');
const model = require('./models');
//establish associations for models

model.user.hasMany(model.link, {
    foreignKey: 'owner',
});
model.link.belongsTo(model.user, {
    foreignKey: 'owner',
});

model.link.hasOne(model.metric, {
    foreignKey: 'id',
});
model.metric.belongsTo(model.link, {
    foreignKey: 'metrics'
});

module.exports = {
    init: init,
    model,
}