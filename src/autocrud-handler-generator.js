'use strict';

// Requires
var mongoose    = require('mongoose');
var express     = require('express');

/*
	CRUD functions will ensure the following endpoints are created for a given Mongoose schema:

	- filtering function: simple one-step middleware:
		function(req, res, callback){
			// do relevant things like sanitize fields, check additional access rights, etc.
			callback(req, res);
		}

	- GET:
	 - One can specify what fields to return
	 - addGetAllRoute   -> GET all (/api/users)
	 - addGetRoute      -> GET by Mongo _id (/api/users/57e92092d742a006e8b4d99a)
						->  OR by supplied field name e.g. addGetRoute(router, User, 'username');
								=>  will get User instances where the user field matches the provided /:username param
									/api/users/jem/

	- POST/PUT:
	 - same as above BUT filter can be a function like explained OR can be an array (whitelist) of fields that will be processed

	- DELETE:
	 - same as above, filter is plain middleware.
*/


var crudRouteFactory = {};

// All CRUD router
crudRouteFactory.defaultCRUDRouter = defaultCRUDRouter;

// All CRUD
crudRouteFactory.addCRUDRoutes = addCRUDRoutes;


// GET
crudRouteFactory.addGetAllRoute = addGetAllRoute;
crudRouteFactory.addGetRoute = addGetRoute;

// POST
crudRouteFactory.addPostRoute = addPostRoute;

// PUT
crudRouteFactory.addPutRoute = addPutRoute;

// DELETE
crudRouteFactory.addDeleteRoute = addDeleteRoute;


function defaultCRUDRouter(model){

	var router = express.Router();
	addCRUDRoutes(router, model);
	return router;
}

function addCRUDRoutes(router, model){

	// List users
	addGetAllRoute(router, model);

	// Obtain user
	addGetRoute(router, model);

	// Create user
	addPostRoute(router, model);

	// Update user
	addPutRoute(router, model);

	// Delete user
	addDeleteRoute(router, model);
}


function addGetAllRoute(router, model, fields, filter){

	function filterAndHandleRequest(req, res){

		filter(req, res);
	}

	function handleRequest(req, res){

		model.find({}, fields, function(err, items){

			// Error handling
			if(err) return res.status(500).send(err);

			// Success
			res.json(items);
		});
	}

	router.get('/', filter ? filterAndHandleRequest : handleRequest);
}

function addGetRoute(router, model, param, fields, filter){

	param = param ? param : '_id';
	var path = getPath(param);

	function filterAndHandleRequest(req, res){

		filter(req, res, handleRequest);
	}

	function handleRequest(req, res){

		var query = getQueryByParam(req, param);

		if(query){
			model.findOne(query, fields, function(err, items){
				if(err){
					res.status(500).send(err);
				}
				else{
					res.json(items);
				}
			});
		}
		else res.sendStatus(400);
	}

	router.get(path, filter ? filterAndHandleRequest : handleRequest);
}

function addPostRoute(router, model, filter){

	/// Set handling function
	// Filter: no filter
	var handlerFunction = setPropertiesAndCreate;

	// Filter: Filtering function
	if(isFunction(filter)){
		handlerFunction = function(req, res){
			filter(req, res, setPropertiesAndCreate);
		}
	}

	// Filter: Array of authorized properties
	else if(filter){
		handlerFunction = function(req, res){
			filterByArray(req, filter);
			setPropertiesAndCreate(req, res);
		}
	}


	// Downstream handler
	function setPropertiesAndCreate(req, res){

		// Create instance
		var instance = new model();

		// Set properties
		setPropertiesBySchema(model, instance, req.body);

		// Save new instance
		instance.save(function(err, model){

			// Error handling
			if(err) switch(err.code){

				// 11000: Entry already exist
				case 11000: return res.status(400).send('duplicate unique id');

				// Default case:
				default: return res.status(500).send(err);
			}

			// Success :-)
			res.json(JSON.stringify(model));
		});
	}


	// Handle using designated function
	router.post('/', handlerFunction);
}

function addPutRoute(router, model, filter){

	/// Set handling function
	// Filter: no filter
	var handlerFunction = setPropertiesAndSave;

	// Filter: Filtering function
	if(isFunction(filter)){
		handlerFunction = function(req, res){
			filter(req, res, setPropertiesAndSave);
		}
	}

	// Filter: Array of authorized properties
	else if(filter){
		handlerFunction = function(req, res){
			filterByArray(req, filter);
			setPropertiesAndSave(req, res);
		}
	}


	// Downstream handler
	function setPropertiesAndSave(req, res){

		// Object id
		var id = req.params._id;

		model.findById(id, function(err, instance){

			// Error handling
			if(err) return res.status(500).send(err);

			if(!instance) return res.status(404);

			// Set properties
			setPropertiesBySchema(model, instance, req.body);

			// Save new instance
			instance.save(function(err, updatedModel){

				// Error handling
				if(err) switch(err.code){

					// 11000: Entry already exist
					case 11000: return res.status(400).send('duplicate unique id');

					// Default case:
					default: return res.status(500).send(err);
				}

				// Success :-)
				res.json(JSON.stringify(updatedModel));
			});
		});
	}


	// Handle using designated function
	router.put('/:_id', handlerFunction);
}

function addDeleteRoute(router, model, filter){

	function filterAndHandleRequest(req, res){

		filter(req, res, handleRequest);
	}

	function handleRequest(req, res){

		// Object id
		var id = req.params._id;
		if(!id) res.sendStatus(400);

		else model.remove({'_id': id}, function(err, obj){

			// Error handling
			if(err) return res.status(500).send(err);

			// Success
			if(obj.result.n > 0) res.sendStatus(200);
			else res.sendStatus(404);
		});
	}

	router.delete('/:_id', filter ? filterAndHandleRequest : handleRequest);
}


function filterByArray(req, filter){

	// TODO implement filter
	console.log('filtering ' + Object.keys(req.body));
}

function setPropertiesBySchema(model, instance, data){

	for(var property in model.schema.paths){
		var value = model.schema.paths[property];

		// Has this data been defined?
		if(data.hasOwnProperty(property)){
			instance[property] = data[property];
		}
	}
}

function getPath(param){
	var path = '';
	if('_id' !== param) path += '/' + param;
	 path += '/:' + param;
	 return path;
}

function getQueryByParam(req, param){
	var value = getValue(req, param);
	if(value){
		var query = {};
		query[param] = value;
	}
	return query;
}

function getValue(req, param){
	var value = req.params[param];
	if(param === '_id') try{
		mongoose.Types.ObjectId(value);
	}
	catch(error){
		return null;
	}
	return value;
}

function isFunction(functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

module.exports = {
    "crap"   : function() { return "crap" }
}