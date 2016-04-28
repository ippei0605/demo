/* Score Counter アプリの位置情報一覧画面の JavaScript */
$(function() {
	// 定数
	var CANVAS = document.getElementById('map-canvas');
	var MAP_OPTIONS = {
		zoom : 17, // ズーム値
		mapTypeId : google.maps.MapTypeId.SATELLITE
	};

	// グローバル変数
	var map;
	var centerLatlng;
	var pointList = [];

	// マップを表示する。
	function viewMap() {
		map = new google.maps.Map(CANVAS, MAP_OPTIONS);

		var coordinates = [];

		for (var i = 0; i < pointList.length; i++) {
			var target = pointList[i].split(',');
			var latLng = new google.maps.LatLng(target[0], target[1]);
			coordinates[i] = latLng;

			// 距離を計算する。
			var distance, distanceDisp = '';
			if (i > 0) {
				distance = google.maps.geometry.spherical.computeDistanceBetween(
						coordinates[i - 1], coordinates[i]) * 1.09361;
				distanceDisp = Math.ceil(distance) + 'yd';
			}
			new google.maps.Marker({
				map : map,
				position : latLng,
				title : '[' + String(i) + ']' + distanceDisp
			});
		}

		// 中心の位置座標をセットする。
		var teeLat = coordinates[0].lat();
		var teeLng = coordinates[0].lng();
		var cupLat = coordinates[pointList.length - 1].lat();
		var cupLng = coordinates[pointList.length - 1].lng();
		var centerLat = (teeLat + cupLat) / 2;
		var centerLng = (teeLng + cupLng) / 2;
		centerLatlng = new google.maps.LatLng(centerLat, centerLng);
		map.setCenter(centerLatlng);

		// 線を引く。
		new google.maps.Polyline({
			map : map,
			path : coordinates, // 座標配列
			strokeColor : '#FF0000', // 色（#RRGGBB形式）
			strokeOpacity : 1.0, // 透明度 0.0～1.0（デフォルト）
			strokeWeight : 2
		// 太さ（単位ピクセル）
		});
	}

	// 位置情報を記録する。
	function recordPosition() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(doSuccess, doError);
		} else {
			window.alert("このブラウザではGeolocationが使えません");
		}
	}

	// 位置情報の取得に成功した場合
	function doSuccess(pos) {
		$('#latitudeId').val(pos.coords.latitude);
		$('#longitudeId').val(pos.coords.longitude);
		$('#scoreFormId').submit();
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
		var count = 0;
		// TeeShot 未記録
		setButton(false, true, true);

		$('#tableId tbody tr').each(function() {
			if ($('#holeId').val() === $(this).find('td:eq(0)').html()) {
				if ($(this).find('td:eq(1)').html() === '0') {
					// TeeShot 記録済み
					setButton(true, false, false);
				}
				$(this).show();
				pointList.push($(this).find('td:eq(5)').html());
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
		if (pointList.length > 0) {
			viewMap();
		}
	}

	$(document).ready(function() {
		view();

		// ホールが変わったら再表示する。
		$('#holeId').change(function() {
			view();
		});
		$('#dateId').change(function() {
			var date = $('#dateId').val();
			$(location).attr('href', '/?date=' + date + '&hole=1');
		});

		// ティーショット (ホール最初の位置情報記録)
		$('#teeShotId').on('click', function() {
			$('#clubId').val('');
			recordPosition();
		});
		// ストローク追加 (1打罰など)
		$('#addStrokeId').on('click', function() {
			$('#clubId').val('');
			$('#resultId').val('1 penalty');
			recordPosition();
		});

		// 結果記録 Fairway
		$('#resultFairwayId').on('click', function() {
			$('#resultId').val('Fairway');
			recordResult();
		});
		// 結果記録 Rough
		$('#resultRoughId').on('click', function() {
			$('#resultId').val('Rough');
			recordResult();
		});
		// 結果記録 Green
		$('#resultGreenId').on('click', function() {
			$('#resultId').val('Green');
			recordResult();
		});
		// 結果記録 Creek
		$('#resultCreekId').on('click', function() {
			$('#resultId').val('Creek');
			recordResult();
		});
		// 結果記録 Bunker
		$('#resultBunkerId').on('click', function() {
			$('#resultId').val('Bunker');
			recordResult();
		});
		// 結果記録 OB
		$('#resultObId').on('click', function() {
			$('#resultId').val('OB');
			recordResult();
		});
		// 結果記録 Cup in
		$('#resultCupinId').on('click', function() {
			$('#resultId').val('Cup in');
			recordResult();
		});

		// Submit 中はボタンを無効化する。
		$('#scoreFormId').on('submit', function() {
			setButton(true, true, true);
		});

		// Submit 中はボタンを無効化する。
		$('#detailScoreFormId').on('submit', function() {
			disableDetailButton();
		});

		// ダイアログに値をセットする。
		$('#detail-dialog').on('show.bs.modal', function(event) {
			var relatedTarget = $(event.relatedTarget);
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
		$('#detailDeleteId').on('click', function() {
			var form = $('#detailScoreFormId');
			var action = $('#detailScoreFormId').attr('action');
			form.attr('action', action + '/delete');
			form.submit();
		});

		// タブを表示した時にリサイズする。
		$('a[data-toggle="tab"]').on('shown.bs.tab', function() {
			google.maps.event.trigger(map, 'resize');
			map.setCenter(centerLatlng);
		});
	});
});