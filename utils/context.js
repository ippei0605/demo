/**
 * Score Counter アプリのコンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

'use strict';

// データベース名を設定する。
const DB_NAME = 'score';

// モジュールを読込む。
const cfenv = require('cfenv');
const Cloudant = require('cloudant');
const vcapServices = require('vcap_services');

/**
 * 環境変数を取得する。
 * @typedef {object} appEnv
 */
const appEnv = cfenv.getAppEnv();

// Cloudant NoSQL DB の接続情報を取得する。
const cloudantCreds = vcapServices.getCredentials('cloudantNoSQLDB');

/**
 * Cloudant NoSQL DB に接続する。
 * @typedef {object} cloudant
 * @see {https://github.com/cloudant/nodejs-cloudant#api-reference}
 */
const cloudant = Cloudant(cloudantCreds.url);

/**
 * コンテキストを定義する。
 * @@typedef {object} context
 * @type {{DB_NAME: string, appEnv, cloudant: *}}
 */
const context = {
    "DB_NAME": DB_NAME,
    "appEnv": appEnv,
    "cloudant": cloudant
};
module.exports = context;