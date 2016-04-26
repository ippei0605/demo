/**
 * @file Memo with Text Search アプリのインストール後処理
 *
 * <pre>
 * ・データベース「memo」が無い場合は作成する。
 * ・「memo」に設計文書「_design/memos」が無い場合は作成する。
 * </pre>
 *
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');

// 設計文書 (ファンクションは空で定義)
var DESIGN_DOCUMENT = {
	"_id" : "_design/scores",
	"views" : {
		"list" : {
			"map" : ""
		}
	}
};

// 関数を読込む。
var readFunction = function(fs, fileName) {
	return fs.readFileSync(__dirname + '/' + fileName + '.function').toString();
};

// 関数を読込み設計文書を作成する。
var insertDesignDocument = function(db, doc) {
	// プロパティに関数をセットする。
	var fs = require("fs");
	doc.views.list.map = readFunction(fs, 'list');

	db.insert(doc, function(err) {
		if (!err) {
			console.log('設計文書[%s]を作成しました。', doc._id);
			console.log(doc);
		} else {
			console.log(err);
		}
	});
};

// データベースを作成する。
var createDatabese = function(database, doc) {
	// データベースの存在をチェックする。
	context.cloudant.db.get(database, function(err, body) {
		if (err && err.error === 'not_found') {
			console.log('アプリに必要なデータベースがありません。');
			context.cloudant.db.create(database, function(err) {
				if (!err) {
					console.log('データベース[%s]を作成しました。', database);
					// ビューを作成する。
					var db = context.cloudant.db.use(database);
					insertDesignDocument(db, doc);
				} else {
					console.log(err);
				}
			});
		} else {
			// ビューの存在をチェックする。
			var db = context.cloudant.db.use(database);
			db.get(doc._id, function(err, body) {
				if (!body) {
					// ビューが無いため作成する。
					console.log('アプリに必要な設計文書がありません。');
					insertDesignDocument(db, doc);
				}
			});
		}
	});
};

createDatabese(context.DB_NAME, DESIGN_DOCUMENT);