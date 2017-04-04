'use strict';
module.exports = function configure(injector) {
    
    injector.register('autoCRUD', require('./autocrud-handler-generator-factory'));
};