/**
 * Score Counter アプリのルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const moment = require('moment');
const score = require('../models/score');

// ロケールを日本語に設定する。
moment.locale('ja');

/** 日付を取得する。 */
const getDate = (value) => {
    let date = value;
    if (typeof date === 'undefined') {
        date = moment().format('YYYY-MM-DD');
    }
    return date;
};

/** ホールを取得する。 */
const getHole = (value) => {
    let hole;
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

/** 位置情報一覧を表示する。 */
exports.list = (req, res) => {
    const date = getDate(req.query.date);
    const hole = getHole(req.query.hole);

    score.list(date, function (list) {
        res.render('index', {
            "hole": hole,
            "date": date,
            "list": list
        });
    });
};

/** HTTP リクエストより位置情報を取得する。 */
const getDoc = (req) => {
    const date = getDate(req.body.date);
    const hole = getHole(req.body.hole);
    return {
        "date": date,
        "hole": hole,
        "count": req.body.count,
        "club": req.body.club,
        "result": req.body.result,
        "latitude": req.body.latitude,
        "longitude": req.body.longitude
    };
};

/** 位置情報を登録する。 */
exports.create = (req, res) => {
    const doc = getDoc(req);
    score.save(doc, function () {
        res.redirect('/?date=' + doc.date + '&hole=' + doc.hole);
    });
};

/** 位置情報を更新する。 */
exports.update = (req, res) => {
    let doc = getDoc(req);
    doc._id = req.params._id;
    doc._rev = req.params._rev;
    score.save(doc, function () {
        res.redirect('/?date=' + doc.date + '&hole=' + doc.hole);
    });
};

/** 位置情報を削除する。 */
exports.remove = (req, res) => {
    score.remove(req.params._id, req.params._rev, function () {
        res.redirect('/?date=' + req.body.date + '&hole=' + req.body.hole);
    });
};

/** スコアを集計して JSON で返す。 */
exports.total = (req, res) => {
    const date = getDate(req.query.date);
    score.total(date, function (value) {
        res.send(value);
    });
};
