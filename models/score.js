/**
 * Score Counter アプリのモデル
 *
 * @module models/memo
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');

// データベース「memo」を使用する。
var cloudant = context.cloudant;
var db = cloudant.db.use(context.DB_NAME);

/** Hole, Count を昇順で比較する。 */
var compareHoleCountAscending = function(a, b) {
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
};

/**
 * 地点情報の一覧を取得する。
 *
 * @see db.view 関数
 *      {@link https://github.com/apache/couchdb-nano#dbviewdesignname-viewname-params-callback}
 */
exports.list = function(date, callback) {
	db.view('scores', 'list', {
		descending : false,
		key : date
	}, function(err, body) {
		// ビュー結果を Hole, Count 順にソートする。
		var list = body.rows;
		list.sort(compareHoleCountAscending);
		callback(list);
	});
};

/**
 * 地点情報を保存する。
 *
 * @see db.insert 関数
 *      {@link https://github.com/apache/couchdb-nano#dbinsertdoc-params-callback}
 */
exports.save = function(doc, callback) {
	db.insert(doc, callback);
};

/**
 * 地点情報を削除する。
 *
 * @see db.destroy 関数
 *      {@link https://github.com/apache/couchdb-nano#dbdestroydocname-rev-callback}
 */
exports.remove = function(_id, _rev, callback) {
	db.destroy(_id, _rev, callback);
};

/**
 * スコアを集計する。
 *
 * @see db.view 関数
 *      {@link https://github.com/apache/couchdb-nano#dbviewdesignname-viewname-params-callback}
 */
exports.total = function(date, callback) {
	db.view('scores', 'total', {
		descending : false,
		group : true
	}, function(err, body) {
		var initValue = {
			"count" : 0,
			"put" : 0
		};
		var value = [ initValue, initValue, initValue, initValue, initValue,
				initValue, initValue, initValue, initValue, initValue, initValue,
				initValue, initValue, initValue, initValue, initValue, initValue,
				initValue, initValue ];
		body.rows.forEach(function(row) {
			if (row.key[0] === date) {
				value[parseInt(row.key[1])] = row.value;
			}
		});
		callback(value);
	});
};