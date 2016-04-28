/**
 * Score Counter アプリのコンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

// Cloudantサービス名
var CLOUDANT_SERVICE_NAME = 'Cloudant NoSQL DB-go';

// データベース名
var DB_NAME = 'score';

// 環境変数を取得する。
var appEnv = require('cfenv').getAppEnv();
var cloudantCreds = appEnv.getServiceCreds(CLOUDANT_SERVICE_NAME);

/** 環境変数 */
exports.appEnv = appEnv;

/** データベース名 */
exports.DB_NAME = DB_NAME;

/** データベース接続 */
exports.cloudant = require('cloudant')(cloudantCreds.url);
