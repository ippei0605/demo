/**
 * Score Counter アプリの位置情報一覧画面の JavaScript
 *
 * @author Ippei SUZUKI
 */

'use strict';

$(function () {
    // 定数
    const CANVAS = document.getElementById('map-canvas');
    const MAP_OPTIONS = {
        zoom: 17,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };
    const DEFAULT_LAT_LNG = new google.maps.LatLng(35.678371, 139.7873187); // HZ

    // グローバル変数
    let map;
    let centerLatlng = DEFAULT_LAT_LNG;
    let pointList = [];

    // 位置情報を取得する。
    function getLatLng(point) {
        return new google.maps.LatLng(point.lat, point.lng);
    }

    // 中心の位置座標をセットする。
    function setCenterLatlng(latLngList) {
        const length = latLngList.length;
        switch (length) {
            case 0:
                setCenterLatlngOfCurrentPosition();
                break;
            case 1:
                centerLatlng = new google.maps.LatLng(latLngList[0].lat(), latLngList[0]
                    .lng());
                break;
            default:
                centerLatlng = new google.maps.LatLng(
                    (latLngList[0].lat() + latLngList[length - 1].lat()) / 2,
                    (latLngList[0].lng() + latLngList[length - 1].lng()) / 2);
                break;
        }
    }

    // マップを表示する。
    function viewMap() {
        map = new google.maps.Map(CANVAS, MAP_OPTIONS);

        let latLngList = [];
        for (let i = 0, length = pointList.length; i < length; i++) {
            latLngList[i] = getLatLng(pointList[i]);

            // 距離を計算する。
            let distance, distanceDisp = '';
            if (i > 0) {
                distance = google.maps.geometry.spherical.computeDistanceBetween(
                        latLngList[i - 1], latLngList[i]) * 1.09361;
                distanceDisp = Math.ceil(distance) + 'yd';
            }
            // マーカーをセットする。
            new google.maps.Marker({
                map: map,
                position: latLngList[i],
                title: '[' + String(i) + ']' + distanceDisp
            });
        }

        // 中心の位置座標をセットする。
        setCenterLatlng(latLngList);
        map.setCenter(centerLatlng);

        // 線を引く。
        new google.maps.Polyline({
            map: map,
            path: latLngList,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
    }

    // Geolocation により現在位置を取得して、コールバックする。
    function getCurrentPosition(callbackOk, callbackNg) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(callbackOk, callbackNg);
        } else {
            window.alert("このブラウザではGeolocationが使えません");
        }
    }

    // 現在位置を中心の位置座標にセットする。
    function setCenterLatlngOfCurrentPosition() {
        getCurrentPosition(function (pos) {
            centerLatlng = new google.maps.LatLng(pos.coords.latitude,
                pos.coords.longitude);
        }, doError);
    }

    // 位置情報を記録する。
    function recordPosition() {
        getCurrentPosition(function (pos) {
            $('#latitudeId').val(pos.coords.latitude);
            $('#longitudeId').val(pos.coords.longitude);
            $('#scoreFormId').submit();
        }, doError);
    }

    // 位置情報の取得に失敗した場合
    function doError(error) {
        // エラーコードに合わせたエラー内容をアラート表示
        alert('[' + error.code + ']' + error.message);
    }

    // ボタン制御 (有効/無効)
    function setButton(teeShotDisabled, addStrokeDisabled, recordDisabled) {
        $('#teeShotId').prop('disabled', teeShotDisabled);
        $('#addStrokeId').prop('disabled', addStrokeDisabled);
        $('#recordId').prop('disabled', recordDisabled);
    }

    // ダイアログのボタン制御 (有効/無効)
    function disableDetailButton() {
        $('#detailSaveId').prop('disabled', true);
        $('#detailCancelId').prop('disabled', true);
        $('#detailDeleteId').prop('disabled', true);
    }

    // 位置情報一覧を表示する。
    function viewTable() {
        pointList = [];
        let count = 0;
        // TeeShot 未記録
        setButton(false, true, true);

        $('#tableId tbody tr').each(function () {
            if ($('#holeId').val() === $(this).find('td:eq(0)').html()) {
                if ($(this).find('td:eq(1)').html() === '0') {
                    // TeeShot 記録済み
                    setButton(true, false, false);
                }
                $(this).show();
                pointList.push({
                    "lat": $(this).find('td:eq(5)').html(),
                    "lng": $(this).find('td:eq(6)').html()
                });
                count++;
            } else {
                $(this).hide();
            }
        });
        $('#countId').val(count);
    }

    // 結果記録 共通処理
    function recordResult() {
        if ($('#clubId').val() === '') {
            $('#clubMessageId').html('Please choose the club.');
            $('#clubId').focus();
        } else {
            recordPosition();
        }
    }

    // 位置情報一覧とマップを表示する。
    function view() {
        viewTable();
        viewMap();
    }

    // TD ID を返す。 type = C: Count, P: Putt
    function getTdId(type, hole) {
        return '#' + type + ('0' + hole).slice(-2) + 'Id';
    }

    // ハーフスコアを集計する。
    function sumHalfScore(hole, holeScore, halfScore) {
        const count = holeScore.count;
        const putt = holeScore.putt;
        $(getTdId('C', hole)).text(count);
        $(getTdId('P', hole)).text(putt);
        halfScore[0] += count;
        halfScore[1] += putt;
        return halfScore;
    }

    // スコアを集計する。
    function viewTotal() {
        const date = $('#dateId').val();
        $.getJSON('total?date=' + date, function (list) {
            let outScore = [0, 0], inScore = [0, 0];
            for (let i = 1; i <= 9; i++) {
                outScore = sumHalfScore(i, list[i], outScore);
                inScore = sumHalfScore(i + 9, list[i + 9], inScore);
            }
            $('#C01-09Id').text(outScore[0]);
            $('#P01-09Id').text(outScore[1]);
            $('#C10-18Id').text(inScore[0]);
            $('#P10-18Id').text(inScore[1]);
            $('#C01-18Id').text(outScore[0] + inScore[0]);
            $('#P01-18Id').text(outScore[1] + inScore[1]);
        });
    }

    function spinHole(step) {
        let hole = parseInt($('#holeId').val()) + step;
        if (hole > 18) {
            hole = 1;
        } else if (hole < 1) {
            hole = 18;
        }
        $('#holeId').val(hole);
        view();
    }

    $(document).ready(function () {
        view();
        viewTotal();

        // ホールのスピンダウンボタンにより下げる。
        $('#holeSpinDownId').on('click', function () {
            spinHole(-1);
        });

        // ホールのスピンアップボタンにより上げる。
        $('#holeSpinUpId').on('click', function () {
            spinHole(1);
        });

        // Hole が変わったら再表示する。
        $('#holeId').change(function () {
            view();
        });

        // Date が変わったらサーバに地点情報一覧を要求する。
        $('#dateId').change(function () {
            const date = $('#dateId').val();
            const hole = $('#holeId').val();
            $(location).attr('href', '/?date=' + date + '&hole=' + hole);
        });

        // ティーショット (ホール最初の位置情報記録)
        $('#teeShotId').on('click', function () {
            $('#clubId').val('');
            recordPosition();
        });

        // ストローク追加 (1打罰など)
        $('#addStrokeId').on('click', function () {
            $('#clubId').val('');
            $('#resultId').val('1 penalty');
            recordPosition();
        });

        // 結果記録 Fairway
        $('#resultFairwayId').on('click', function () {
            $('#resultId').val('Fairway');
            recordResult();
        });
        // 結果記録 Rough
        $('#resultRoughId').on('click', function () {
            $('#resultId').val('Rough');
            recordResult();
        });
        // 結果記録 Green
        $('#resultGreenId').on('click', function () {
            $('#resultId').val('Green');
            recordResult();
        });
        // 結果記録 Creek
        $('#resultCreekId').on('click', function () {
            $('#resultId').val('Creek');
            recordResult();
        });
        // 結果記録 Bunker
        $('#resultBunkerId').on('click', function () {
            $('#resultId').val('Bunker');
            recordResult();
        });
        // 結果記録 OB
        $('#resultObId').on('click', function () {
            $('#resultId').val('OB');
            recordResult();
        });
        // 結果記録 Cup in
        $('#resultCupinId').on('click', function () {
            $('#resultId').val('Cup in');
            recordResult();
        });

        // Submit 中はボタンを無効化する。
        $('#scoreFormId').on('submit', function () {
            // 緯度がセットされて無い場合は Submit しない。
            if ($('#latitudeId').val() === '') {
                return false;
            }
            setButton(true, true, true);
        });

        // Submit 中はボタンを無効化する。
        $('#detailScoreFormId').on('submit', function () {
            disableDetailButton();
        });

        // ダイアログに値をセットする。
        $('#detail-dialog').on('show.bs.modal', function (event) {
            const relatedTarget = $(event.relatedTarget);
            $('#detailScoreFormId').attr('action', relatedTarget.data('action'));
            $('#detailCountId').val(relatedTarget.data('count'));
            $('#detailClubId').val(relatedTarget.data('club'));
            $('#detailResultId').val(relatedTarget.data('result'));
            $('#detailLatitudeId').val(relatedTarget.data('latitude'));
            $('#detailLongitudeId').val(relatedTarget.data('longitude'));
            $('#detailDateId').val($('#dateId').val());
            $('#detailHoleId').val($('#holeId').val());
        });

        // 位置情報を削除する。
        $('#detailDeleteId').on('click', function () {
            const form = $('#detailScoreFormId');
            const action = $('#detailScoreFormId').attr('action');
            form.attr('action', action + '/delete');
            form.submit();
        });

        // タブを表示した時にリサイズする。
        $('a[data-toggle="tab"]').on('shown.bs.tab', function () {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(centerLatlng);
        });
    });
});