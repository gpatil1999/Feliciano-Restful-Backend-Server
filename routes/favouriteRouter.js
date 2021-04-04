const express=require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const authenticate=require('../authenticate');
const cors=require('./cors');
const Favourites = require('../models/favourite');
const favouriteRouter=express.Router();
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favourites.findOne({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favourites)=>{
        //if(favourites){
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favourites);

        /*}else {
            var err = new Error('There are no favourites');
            err.status = 404;
            return next(err);
        }*/
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user:req.user._id})
    .then((favourite)=>{
        if(favourite!=null){
            for(var i = 0; i< req.body.length; i++)
                {
                    if(favourite.dishes.indexOf(req.body[i])< 0){
                        favourite.dishes.push(req.body[i]);
                    }
                }
                favourite.save()
                .then((favorite) =>{
                    console.log('favorite added ', favourite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }, (err) => next(err));
        }else{
            Favourites.create({ user: req.user._id})
            .then((favourite) => {
                for(var i = 0; i< req.body.length; i++)
                {
                    favourite.dishes.push(req.body[i]);
                }
                favourite.save()
                .then((favourite) =>{
                    console.log('favorite Created ', favourite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                })
            }, (err) => next(err));    
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favourites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end('GET operation is not supported on /favourites/:dishId');
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user:req.user._id})
    .then((favourite)=>{
        if(favourite!=null){
            if(favourite.dishes.indexOf(req.params.dishId)<0){
                favourite.dishes.push(req.params.dishId);
                favourite.save()
                .then((favourite) =>{
                    console.log('favorite added ', favourite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }, (err) => next(err));

            }else{
                res.statusCode = 200;
                res.end("Favorite already added!!");
            }
        }else{
            Favourites.create({ user: req.user._id})
            .then((favourite) => {
                favourite.dishes.push(req.params.dishId);
                favourite.save()
                .then((favourite) =>{
                    console.log('favorite Created ', favourite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                })
            }, (err) => next(err));    
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favourites.findOne({user:req.user._id})
    .then((favourites)=>{
        if(favourites){
            var index = favourites.dishes.indexOf(req.params.dishId);
            if(index>-1)
            {
                favourites.dishes.splice(index,1);
                favourites.save()
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                }, (err) => next(err));
            }
        }else{
            res.statusCode = 200;
            res.end("No favorite to delete");
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});

module.exports=favouriteRouter;