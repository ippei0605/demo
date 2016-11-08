/**
 * Score Counter アプリのコンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

/** データベース名 */
exports.DB_NAME = 'score';

/** 環境変数 */
exports.appEnv = require('cfenv').getAppEnv();

// VCAP_SERVICES
var vcapServices = JSON.parse(process.env.VCAP_SERVICES);

/** データベース接続 */
var cloudantCreds = vcapServices.cloudantNoSQLDB[0].credentials;
exports.cloudant = require('cloudant')(cloudantCreds.url);