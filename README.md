# Score Counter

## はじめに
このアプリケーションは、IBM Bluemix、Node.js、Cloudant NoSQL DB で次を検証するために開発しました。
* 位置情報の登録
* MapReduce による集計
* dashDB とのデータ連携 (Warehousing)


## セットアップ
1. 本サイトから Score Counter アプリをダウンロード (Download ZIP) して解凍してください。ディレクトリ名は score-counter-master から score-counter に変更してください。

1. Bluemix コンソールから CFアプリケーション (Node.js) を作成してください。  
アプリケーション名: score-counter-ippei (任意)  

    > 以降、score-counter-ippei で説明します。


1. CF コマンド・ライン・インターフェースをインストールしていない場合は、インストールしてください。

1. Cloudant NoSQL DB を作成し、score-counter-ippei にバインドしてください。  
サービス名: Cloudant NoSQL DB-go (固定)  

    > 名前を変更したい場合は、 utils/context.js の CLOUDANT_SERVICE_NAME の設定値を変更してください。

1. 解凍したディレクトリ (Score Counter アプリのホーム) に移動してください。

        > cd score-counter-ippei

1. Bluemixに接続してください。

        > cf api https://api.ng.bluemix.net
    

1. Bluemix にログインしてください。(ユーザ、組織、スペースは御自身の環境に合わせて変更してください。)

        > cf login -u e87782@jp.ibm.com -o e87782@jp.ibm.com -s dev

1. アプリをデプロイしてください。

        > cf push score-counter-ippei

1. ご使用のブラウザーで以下の URL を入力して、アプリにアクセスしてください。

        https://score-counter-ippei.mybluemix.net


## 使い方
1. 2016-04-02 にサンプルデータを登録しています。花咲カントリークラブ (山梨県) 1H～18H です。まずは、Hole を変更しつつ、Score、Layout、Total タブの表示内容を確認してください。
1. 各ホールのティーショット時に、Tee Shot ボタンをクリックしてください。Stroke 0 で位置情報が登録されます。(以降、Stroke 0 がある場合は Tee Shot ボタンは無効になります。)
1. Select Club に使用クラブを選択し、Point Record をクリックして結果を選択してください。Stroke n で使用クラブ、結果、位置情報が登録されます。
1. ペナルティは +1 Stroke をクリックしてください。例えば、ティーショットでOB、特設ティから前進4打の場合は、特設ティの位置でティーショットの結果をOB、+1 Stroke を2回クリックしてください。
1. 登録した位置情報は後から自由に変更できます。


## ファイル構成
    score-counterscore-counter-ippei
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
#### 位置情報の登録
* MapReduce による集計
* dashDB とのデータ連携 (Warehousing)


Cloudant NoSQL DB のインデックス機能により、複数項目のテキスト検索が簡単に実装できることが分かりました。  
Node.js において、Cloudant のドキュメント操作は非同期処理のため、リストで取得したドキュメントを、ループ処理で個別操作して、結果セットを画面  (EJS) に渡すことは難しいです。非同期処理の結果を待つ仕組みが必要だからです。また、SQLのようにサブクエリを実行することもできません。インデックスとビュー (マップファンクション) を組合わせて記述することが Node.js では効率的だと思いました。データ構造や画面レイアウトがより複雑な場合は、当たり前のことですがインデックスとビューの設計が鍵となります。  
些細なことですが、Java Script の予約語は、要素や関数に利用されていることがあり、その場合は工夫が必要だと思いました。 (Express の delete関数、今回のインデックスの default など)

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

