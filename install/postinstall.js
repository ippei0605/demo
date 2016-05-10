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

// 設計文書
var DESIGN_DOCUMENT = {
	"_id" : "_design/scores",
	"views" : {
		"list" : {
			"map" : "function(doc) {\n\tvar row = {\n\t\t\"_id\" : doc._id,\n\t\t\"_rev\" : doc._rev,\n\t\t\"date\" : doc.date,\n\t\t\"hole\" : doc.hole,\n\t\t\"count\" : doc.count,\n\t\t\"club\" : doc.club,\n\t\t\"result\" : doc.result,\n\t\t\"latitude\" : doc.latitude,\n\t\t\"longitude\" : doc.longitude\n\t};\n\temit(doc.date, row);\n}"
		},
		"total" : {
			"map" : "function(doc) {\r\n  if(doc.count !== '0') {\r\n    var put = 0;\r\n    if(doc.result === 'Green') {\r\n      put = 1;\r\n    }\r\n  \temit([doc.date, doc.hole], {\r\n      \"count\": 1,\r\n      \"put\": put\r\n    });\r\n  }\r\n}",
			"reduce" : "_sum"
		}
	}
};

// 関数を読込み設計文書を作成する。
var insertDesignDocument = function(db, doc) {
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