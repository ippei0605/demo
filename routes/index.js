/**
 * Score Counter アプリのルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');
var score = require('../models/score');
var moment = require('moment');
moment.locale('ja');

/** 日付を取得する。 */
var getDate = function(value) {
	var date = value;
	if (typeof date === 'undefined') {
		date = moment().format('YYYY-MM-DD');
	}
	return date;
};

/** ホールを取得する。 */
var getHole = function(value) {
	var hole;
	if (isNaN(value)) {
		hole = 1;
	} else {
		hole = parseInt(value);
		if (hole < 1) {
			hole = 1;
		} else if (hole > 18) {
			hole = 18;
		}
	}
	return hole;
};

/** 地点情報一覧を表示する。 */
exports.list = function(req, res) {
	var date = getDate(req.query.date);
	var hole = getHole(req.query.hole);

	score.list(date, function(list) {
		res.render('index', {
			"hole" : hole,
			"date" : date,
			"list" : list
		});
	});
};

/** 地点情報を登録する。 */
exports.create = function(req, res) {
	var date = req.body.date;
	var hole = req.body.hole;
	var doc = {
		"date" : date,
		"hole" : hole,
		"count" : req.body.count,
		"club" : req.body.club,
		"result" : req.body.result,
		"latitude" : req.body.latitude,
		"longitude" : req.body.longitude
	};
	score.save(doc, function() {
		res.redirect('/?date=' + date + '&hole=' + hole);
	});
};

/** 地点情報を更新する。 */
exports.update = function(req, res) {
	var date = req.body.date;
	var hole = req.body.hole;
	var doc = {
		"_id" : req.params._id,
		"_rev" : req.params._rev,
		"date" : date,
		"hole" : hole,
		"count" : req.body.count,
		"club" : req.body.club,
		"result" : req.body.result,
		"latitude" : req.body.latitude,
		"longitude" : req.body.longitude
	};
	score.save(doc, function() {
		res.redirect('/?date=' + date + '&hole=' + hole);
	});
};

/** 地点情報を削除する。 */
exports.remove = function(req, res) {
	var date = req.body.date;
	var hole = req.body.hole;
	score.remove(req.params._id, req.params._rev, function() {
		res.redirect('/?date=' + date + '&hole=' + hole);
	});
};
