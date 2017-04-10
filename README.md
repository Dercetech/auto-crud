# Auto-crud
The auto-crud plugin is designed to fit [Trapezo-express](https://github.com/Dercetech/trapezo-express) and automate creation of CRUD handlers on REST APIs.

**Trapezo-Express** is the project stub proposed by [Jérémie Mercier (Jem)](https://www.linkedin.com/in/jeremiemercier/) implementing the seamless [Trapezo](https://github.com/Dercetech/trapezo) dependency injection framework for Node.js. [Follow Jem's projects on twitter](https://twitter.com/dercetech).

## Background
Lots of developer bandwidth is spent writing boilerplate CRUD API endpoints:
- get document
- get documents
- get documents, but not all as I'm a normal user
- create document
- update document
- update document, but only allow some fields - i.e. I cant change my own rights as a plain user
- delete user
- create power user, only if I'm a super power user
- etc.

That, and just all the redundant unit testing. Copy paste, mistakes, motivation lowering, etc. adverse effects are countered by automation - the only way to stay enthusiastic about developing most REST API endpoints involving CRUD.

## Capabilities
- Add all CRUD routes with only a few lines of code.
- Flexible predicate: based on their roles, user should only see subsets of the full document
- Filtering based on user rights:
-- a basic user may only see himself when calling `/api/users`
-- a power user must list all users when `/api/users`
- Restrict operations based on roles and rights.

## Current state
On hold due to development bandwidth limitation.

## Version history
- v0.0.x : Not yet working. Hang in there.
