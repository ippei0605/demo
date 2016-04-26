/**
 * Score Counter アプリのルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');
var score = require('../models/score');

// ホールを取得する。
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
	var hole = getHole(req.query.hole);
	var date = typeof req.query.date === 'undefined' ? context.TODAY
			: req.query.date;

	score.list(date, function(err, body) {
		// ビュー結果を Hole, Count 順にソートする。
		var list = body.rows;
		list.sort(function(a, b) {
			if (a.value.hole < b.value.hole) {
				return -1;
			}
			if (a.value.hole > b.value.hole) {
				return 1;
			}
			if (a.value.count < b.value.count) {
				return -1;
			}
			if (a.value.count > b.value.count) {
				return 1;
			}
			return 0;
		});

		// 画面を表示する。
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
