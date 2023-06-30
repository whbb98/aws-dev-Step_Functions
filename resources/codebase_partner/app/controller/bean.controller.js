/**
 Bean controller with lazy loading + Write-through cache
 - Create: The addition of a bean make the cache of FindAll stale se we delete its entry (if it exists)
 + We add the newly created bean to the cache
 - FindOne: We add the retrieved bean to the cache
 - FindAll(JSON): We add the list of all beans to the cache
 - Update: This makes the cache for both the single bean and the FindAll list stale, so we delete both their entries
 + We replace the newly created bean's cache entry
 - Remove(one): This makes the cache for both the single bean and the FindAll list stale, so we delete both their entries
 - RemoveAll: This makes cache for all beans stale, so we delete all keys.
 */
const Bean = require("../models/bean.model.js");
const cacheTtlInSec = 300
const memcached = require('../cache/memcache')
const {body, validationResult} = require("express-validator");

exports.create = [

    body('type', 'The bean type is required').trim().isLength({min: 1}).escape(),
    body('product_name', 'The bean product name is required').trim().isLength({min: 1}).escape(),
    body('price', 'The the bean price should be in dollars').trim().isNumeric().escape(),
    body('description', 'The bean desc is required').trim().isLength({min: 1}).escape(),
    body('quantity', 'Quantity should be a whole number').trim().isInt().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        const bean = new Bean(req.body);

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('bean-add', {title: 'Create Genre', bean: bean, errors: errors.array()});
        } else {
            // Data from form is valid., save to db
            Bean.create(bean, (err, data) => {
                if (err) {
                    res.render("500", {message: `Error occurred while creating the Bean.`});
                } else {
                    // Write-through logic: add this new record to the cache
                    memcached.set('beans_' + data.id, JSON.stringify(data), cacheTtlInSec, function (err) {
                        if (err) {
                            res.render("500", {message: "The was a problem caching bean with id:" + data.id});
                        }
                    });
                    // FindAll is now stale
                    memcached.del('beans_all', function (err) {
                        if (err) {
                            return res.render("500", {message: "The was a problem removing cache key: beans_all"});
                        }
                        res.redirect("/beans");
                    });
                }
            });
        }
    }
];

exports.findAll = (req, res) => {
    memcached.get('beans_all', (err, data) => {
        if (err) {
            console.log(err);
            return res.render("500", {message: "The was a problem retrieving the list of beans"});
        }
        if (data) {
            return res.render("bean-list-all", {beans: JSON.parse(data), cache_msg: "results from Cache"});
        } else {
            Bean.getAll((err, data) => {
                if (err) {
                    res.render("500", {message: "The was a problem retrieving the list of beans"});
                } else {
                    // lazy loading
                    memcached.set('beans_all', JSON.stringify(data), cacheTtlInSec, function (err) {
                        if (err) {
                            return res.render("500", {message: "The was a problem caching the list of beans"});
                        }
                        res.render("bean-list-all", {beans: data, cache_msg: "results from Db"});
                    });

                }
            });
        }
    });
};

exports.findAllJson = (req, res) => {

    memcached.get('beans_all', (err, data) => {
        if (err) {
            console.log("beans_all:findAllJSON", err);
            return res.json({
                msg_str: "The was a problem retrieving the list of beans"
            });
        }

        if (data) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Status', "From Memcached");
            res.end(JSON.stringify(JSON.parse(data), null, 3));
        } else {
            Bean.getAll((err, data) => {
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500).end(JSON.stringify({error: "The was a problem retrieving the list of beans"}, null, 3));
                } else {
                    // lazy loading
                    memcached.set('beans_all', JSON.stringify(data), cacheTtlInSec, function (err) {
                        if (err) {
                            return res.json({"msg_str": "The was a problem caching the list of beans"});
                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('Cache-Status', "Directly from RDS");
                        res.end(JSON.stringify(data, null, 3));
                    });

                }
            });
        }
    });
};

exports.findOne = (req, res) => {

    memcached.get('beans_' + req.params.id, (err, data) => {
        if (err) {
            return res.render("500", {message: "The was a problem retrieving the list of beans"});
        }
        if (data) {
            res.render("bean-update", {bean: JSON.parse(data), cache_msg: "results from Cache"})
        } else {
            Bean.findById(req.params.id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            message: `Not found bean with id ${req.params.id}.`
                        });
                    } else {
                        res.render("500", {message: `Error retrieving bean with id ${req.params.id}`});
                    }
                } else {
                    // Lazy loading
                    memcached.set('beans_' + req.params.id, JSON.stringify(data), cacheTtlInSec, function (err) {
                        if (err) {
                            return res.render("500", {message: "The was a problem caching the bean record"});
                        }
                        res.render("bean-update", {bean: data, cache_msg: "results from Db"});
                    });

                }
            });
        }
    });
};


exports.update = [

    body('type', 'The bean type is required').trim().isLength({min: 1}).escape(),
    body('product_name', 'The bean product name is required').trim().isLength({min: 1}).escape(),
    body('price', 'The the bean price should be in dollars').trim().isNumeric().escape(),
    body('description', 'The bean desc is required').trim().isLength({min: 1}).escape(),
    body('quantity', 'Quantity should be a whole number').trim().isInt().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        const bean = new Bean(req.body);
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('bean-update', {bean: bean, errors: errors.array()});
        } else {
            // Data from form is valid., save to db
            Bean.updateById(
                req.body.id,
                bean,
                (err, data) => {
                    if (err) {
                        if (err.kind === "not_found") {
                            res.status(404).send({
                                message: `Bean with id ${req.body.id} Not found.`
                            });
                        } else {
                            res.render("500", {message: `Error updating bean with id ${req.body.id}`});
                        }
                    } else res.redirect("/beans");
                }
            );
            // Write-through logic: add this new record to the cache
            memcached.set('beans_' + bean.id, JSON.stringify(bean), cacheTtlInSec, function (err) {
                if (err) {
                    res.render("500", {message: "The was a problem caching bean with id:" + bean.id});
                }
            });
            // FindAll is now stale
            memcached.del('beans_all', function (err) {
                if (err) {
                    res.render("500", {message: "The was a problem removing cache key: beans_all"});
                }
            });
        }
    }
];

exports.remove = (req, res) => {
    Bean.delete(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Bean with id ${req.params.id}.`
                });
            } else {
                res.render("500", {message: `Could not delete Bean with id ${req.body.id}`});
            }
        } else {
            // This bean is now stale
            memcached.del('beans_' + req.params.id, function (err) {
                if (err) {
                    res.render("500", {message: "The was a problem removing cache key: beans_all"});
                }
            });
            // FindAll is now stale
            memcached.del('beans_all', function (err) {
                if (err) {
                    res.render("500", {message: "The was a problem removing cache key: beans_all"});
                }
            });
            res.redirect("/beans");
        }
    });
};

exports.removeAll = (req, res) => {
    Bean.removeAll((err, data) => {
        if (err) {
            res.render("500", {message: `Some error occurred while removing all beans.`});
        } else {
            // FindAll is now stale
            memcached.flush(function (err) {
                if (err) {
                    res.render("500", {message: "The was a problem flushing the cache"});
                }
            });
            res.send({message: `All beans were deleted successfully!`});
        }
    });
};
