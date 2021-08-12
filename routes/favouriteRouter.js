const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favourites = require('../models/favourites');
const ObjectId = require('mongodb').ObjectID;

const favouriteRouter = express.Router();

favouriteRouter.use(express.json());

favouriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ "user": ObjectId(req.user._id) })
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                if (favourites) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favourites);
                } else {
                    const err = new Error('There are no favourites');
                    err.status = 404;
                    res.json({ message: err.message });
                }
            }, err => res.status(400).json({ message: err.message }))
            .catch(err => res.status(400).json({ message: err.message }));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ "user": ObjectId(req.user._id) }, '-__v')
            .then((favourites) => {
                if (!favourites) {
                    favourites = new Favourites({ user: req.user.id });
                }
                for (let i of req.body) {
                    if (favourites.dishes.some(dish => dish.equals(i._id))) {
                        continue;
                    } else {
                        favourites.dishes.push(i);
                    }
                }
                return favourites;
            }, err => res.status(400).json({ message: err.message }))
            .then(favourites => {
                Favourites.findByIdAndUpdate(favourites._id, { $set: favourites }, { new: true, upsert: true })
                    .populate('user')
                    .populate('dishes')
                    .then((favourites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourites);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favourites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.remove({ "user": ObjectId(req.user._id) })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favouriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ "user": ObjectId(req.user._id) })
            .then((favourites) => {
                if (!favourites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favourites": favourites });

                } else {
                    if (favourites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favourites": favourites });
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favourites": favourites });

                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ "user": ObjectId(req.user._id) }, '-__v')
            .then((favourites) => {
                if (!favourites) {
                    favourites = new Favourites({ user: req.user.id });
                    favourites.dishes.push(req.params.dishId);
                } else if (!favourites.dishes.some(dish => dish.equals(req.params.dishId))) {
                    favourites.dishes.push(req.params.dishId);
                }
                return favourites;
            }, err => res.status(400).json({ message: err.message }))
            .then(favourites => {
                Favourites.findByIdAndUpdate(favourites._id, { $set: favourites }, { new: true, upsert: true })
                    .populate('user')
                    .populate('dishes')
                    .then((favourites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourites);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favourites/:dishId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ "user": ObjectId(req.user._id) }, '-__v')
            .then((favourites) => {
                if (!favourites) {
                    favourites = new Favourites({ user: req.user.id });
                } else if (favourites.dishes.some(dish => dish.equals(req.params.dishId))) {
                    favourites.dishes = favourites.dishes.filter(dish => dish != req.params.dishId)
                }
                return favourites;
            }, err => res.status(400).json({ message: err.message }))
            .then(favourites => {
                Favourites.findByIdAndUpdate(favourites._id, { $set: favourites }, { new: true, upsert: true })
                    .populate('user')
                    .populate('dishes')
                    .then((favourites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourites);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            })
            .catch((err) => next(err));
    });

module.exports = favouriteRouter;