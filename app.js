/**
 * @file Score Counter アプリ
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('./utils/context');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var routes = require('./routes');

// アプリケーションを作成する。
var app = express();

// ミドルウェアを設定する。
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(favicon(__dirname + '/public/favicon.ico'));

// ルートを設定する。
app.get('/', routes.list);
app.post('/scores', routes.create);
app.post('/scores/:_id/:_rev', routes.update);
app.post('/scores/:_id/:_rev/delete', routes.remove);

// リクエストを受付ける。
app.listen(context.appEnv.port, function() {
	console.log('server starting on ' + context.appEnv.url);
});