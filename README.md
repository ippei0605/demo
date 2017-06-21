# Score Counter

## 更新履歴
### version 1.0.1
* 使用するモジュールの最新化
* ES6 対応 (クライアント JavaScript は IE を考慮して function のまま)
* サンプルデータを直近日付 2017-06-24 に変更
* cf コマンド から bluemix (bx) コマンドに統一 (bluemix version 0.5.4 は cf を内包)

## はじめに
このアプリケーションはゴルフのスコアカウンターです。IBM Bluemix、Node.js、Cloudant NoSQL DB で次を検証するために開発しました。
* 位置情報の登録
* MapReduce による集計
* dashDB とのデータ連携 (Warehousing)


## セットアップ
1. 本サイトから Score Counter アプリをダウンロード (Download ZIP) して解凍してください。ディレクトリ名は score-counter-master から score-counter に変更してください。

1. Bluemix コンソールにログインしてください。ここでは次の条件で説明をします。ご自身のアカウント情報に読替えて手順を進めてください。  
    - Account: JIEC Co., Ltd.
    - Region: United Kingdom
    - Organization: jiec_rd
    - Space: dev

1. Bluemix コンソールで CFアプリケーション (Node.js) を作成してください。以下の ippei0605 はご自身のユーザ名などに変更してください。  
アプリケーション名: score-counter-ippei0605 (任意、前述の URL と同じ名前にならないようにしています。)  

    > 以降、score-counter-ippei0605 で説明します。


1. PC に Bluemix コマンド・ライン・インターフェースをインストールしていない場合は、インストールしてください。  
(Bluemix コンソール、アプリケーション内の開始 (Getting Started) メニューにダウンロードボタンがあります。)  

1. Bluemix コンソールで Cloudant NoSQL DB サービスを作成し、score-counter-ippei0605 にバインドしてください。  
サービス名: 任意  
プラン: 任意 (本アプリでは Lite を選択)  

1. PC のターミナルソフトを起動してください。
(私は IntelliJ IDEA や Eclipse のターミナルを使っていますが、Windows の cmd 、Mac の　ターミナルなどで操作できます。)  

1. ターミナルで、解凍したディレクトリ (score-counter アプリのホーム) に移動してください。(コマンドは以下、$はコマンドプロンプトです。)  
    ```
    $ cd score-counter
    ```

1. ターミナルで、Bluemix にログインしてください。 (御自身の環境に合わせてパラメータを変更してください。)
    ```
    $ bx login -a https://api.eu-gb.bluemix.net -u ippei0605@gmail.com -c 545122579c1b042bb40fae74b21fe87b -o jiec_rd -s dev
    ```

1. ターミナルで、アプリをデプロイしてください。  
    ```
    $ bx app push score-counter-ippei0605
    ```

1. ご使用のブラウザーで以下の URL を入力して、アプリにアクセスしてください。
    ```
    https://score-counter-ippei0605.mybluemix.net
    ```

## 使い方
1. 2017-06-24 にサンプルデータを登録しています。花咲カントリークラブ (山梨県) 1H～18H です。まずは、Hole を変更しつつ、Score、Layout、Total タブの表示内容を確認してください。
1. 各ホールのティーショット時に、Tee Shot ボタンをクリックしてください。Stroke 0 で位置情報が登録されます。(以降、Stroke 0 がある場合は Tee Shot ボタンは無効になります。)
1. Select Club に使用クラブを選択し、Point Record をクリックして結果を選択してください。Stroke n で使用クラブ、結果、位置情報が登録されます。
1. ペナルティは +1 Stroke をクリックしてください。例えば、ティーショットでOB、特設ティから前進4打の場合は、特設ティの位置でティーショットの結果をOB、+1 Stroke を2回クリックしてください。
1. 登録した位置情報は後から自由に変更できます。


## ファイル構成
    score-counter
    │  .cfignore
    │  .gitignore
    │  app.js                    Score Counter アプリ
    │  package.json
    │  README.md
    │  
    ├─install
    │      postinstall.js        Score Counter アプリのインストール後処理
    │      
    ├─models
    │      score.js              Score Counter アプリのモデル
    │      
    ├─public
    │      favicon.ico
    │      index.css             Score Counter アプリの位置情報一覧画面のCSS
    │      index.js              Score Counter アプリの位置情報一覧画面の JavaScript
    │      
    ├─routes
    │      index.js              Score Counter アプリのルーティング
    │      
    ├─utils
    │      context.js            Score Counter アプリのコンテキスト
    │      
    └─views  
           index.ejs             Score Counter アプリの位置情報一覧画面、更新ダイアログ  


## ルート (URLマッピング)
|Action|Method|処理|
|---|-----------|-----------|
|/|GET|位置情報一覧を表示する。|
|/scores|POST|位置情報を登録して、位置情報一覧を表示する。|
|/scores/:_id/:_rev|POST|位置情報を更新して、位置情報一覧を表示する。|
|/scores/:_id/:_rev/delete|POST|位置情報を削除して、位置情報一覧を表示する。|
|/total|GET|スコアを集計して JSON で返す。|


## まとめ
### 位置情報の登録
クライアント JavaScript で　Geolocation により現在位置 (緯度、経度) を取得しています。サーバに POST して Cloudant に登録することができました。  
位置情報の一覧表示において、サーバから取得した位置情報は、クライアント JavaScript でGoogle マップと連携、地図上に地点、線分、地点間の距離 (Stroke 1 以降の地点をマウスでポイント) を表示することができました。

###  MapReduce による集計
次の view によってスコアを集計をしています。(Total タブ)
```
score/_design/scores/_view/total?group=true
```

Reduce は Map 結果だけでなく、Reduce 結果も入力されます。 (rereduce パラメータ) 従って、Reduce では複雑なことはぜず、Map 結果を単純に集計することが望ましいと思います。
MapReduce と結果を以下に示します。 

#### Map
```javascript
function(doc) {
   if(doc.count !== '0') {
     var put = 0;
     if(doc.result === 'Green') {
       put = 1;
     }
     emit([doc.date, doc.hole], {
       "count": 1,
       "put": put
     });
   }
 }
```

#### Reduce
```
_sum
```

#### 結果  
```json
{"rows":[
    {"key":["2017-06-24",1],"value":{"count":4,"putt":2}},
    {"key":["2017-06-24",2],"value":{"count":4,"putt":2}},
    {"key":["2017-06-24",3],"value":{"count":5,"putt":1}},
    ...省略...
]}
```

取得した結果は画面表示しやすいように、 models/score.js # total 関数で配列に詰め替えて使用しています。

### dashDB とのデータ連携 (Warehousing)
Cloudant NoSQL DB の Warehousing 機能で dashDB にデータ連携することを確認しました。  
* Warehousing 設定時点で、Cloudant のデータ項目を全て展開した形式で dashDB に登録されます。同期タイミングはほぼリアルタイムで、条件を指定することはできません。
* Warehousing 設定時点に無かったデータ項目をCloudant に保存すると、エラー (スキップ) としてdashDB 上のオーバーフローテーブルにIDが書き出されます。


### アプリケーションの本来あるべき設計
今回は技術検証を目的とした開発のため、サーバ送信の多い非効率な設計になっています。  
アプリケーションの機能を考えた場合、本来は初回または日付変更した際の画面要求時の位置情報一覧の取得、位置情報の登録・変更・削除処理以外はクライアント JavaScript のみで制御可能です。例えば、登録処理では サーバへの POST 通信は行わずに、クライアントメモリに保持した一覧に位置情報を加えて画面表示、非同期通信により位置情報をサーバに送信して登録する、など、極力サーバ送信を行わない設計がベターだと思います。


### 地点登録の操作について
本アプリケーションでは、ブラウザから Geolocation の機能を使用してオンラインで地点登録しています。　　
登録方法の一つとして地点の写真を後でアップロードする方法も良いかと考えています。その際、画像により結果を自動判定できる仕組みを提供できれば利便性が高いと思いました。


## リンク
* Cloudant Node.js client library  
<https://github.com/cloudant/nodejs-cloudant>
* Cloudant NoSQL DB の概要 (Bluemix)  
<https://new-console.ng.bluemix.net/docs/services/Cloudant/index.html#Cloudant>
* Cloudant.com (こちらの FOR DEVELOPERS の FAQ や Sample Apps は Blumix の文書より充実してます。)  
<https://cloudant.com/>
* Geolocation の利用  
<https://developer.mozilla.org/ja/docs/WebAPI/Using_geolocation>
* Google Maps JavaScript API  
<https://developers.google.com/maps/documentation/javascript/?hl=ja>

