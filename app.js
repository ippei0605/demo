/**
 * @file Score Counter アプリ
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const context = require('./utils/context');
const routes = require('./routes');

// アプリケーションを作成する。
const app = express();

// ミドルウェアを設定する。
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(favicon(__dirname + '/public/favicon.ico'));

// ルートを設定する。
app.get('/', routes.list);
app.post('/scores', routes.create);
app.post('/scores/:_id/:_rev', routes.update);
app.post('/scores/:_id/:_rev/delete', routes.remove);
app.get('/total', routes.total);

// リクエストを受付ける。
app.listen(context.appEnv.port, () => {
    console.log('server starting on ' + context.appEnv.url);
});