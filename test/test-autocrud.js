"use strict";
describe('Auto CRUD handler generator', () => {

	// Requires
	let trapezo		= require('trapezo');
	let chai 		= require("chai");
	let should 		= chai.should();
	let assert		= chai.assert;

	before(done => {
		
		trapezo.resolve(module, function(autoCRUD){
			
			done();
		});
	});

	after((done) => {
		Promise.all([])
			.then(meta => { done() })
			.catch(err => {  done(err) });
	});
	
    beforeEach(done => {
		Promise.all([])
			.then(meta => { done() })
			.catch(err => {  done(err) });
    });
	
	describe('library internals', done => {
		it('has expected API', done => {
			done();
		});
	});
});