blenderのmonkeyを出してみました。
2.8以降には対応していません。
3Dに見えるかもしれませんが2Dです。
箱はZバッファ法による作画です。
頂点を軸としてポリゴンのピクセル単位にZ値を振り分けました。
本物のZバッファ法による作画です。
for文をできるだけ削りました。
行列をクラスで組み立てましたが頂点計算が凄く重たくなりました。
配列にしました。
動作が軽くなりました。
transform関数を自作し。テクスチャを変形させました。
線を引くときX座標の大、小をとり、ついでにZ値もX座標の大小で振り分けて、
その範囲内でテクスチャを操作します。
a,b,c,d,e,fはtexture.mjsで求めていますのでそれを使います。
左上から右下までZ値を参考にして、一番自分に近い色のみ獲得し
レガシーなドットインパクトプリンターをすれば
モダンなZバッファ法です。
頂点の並び順は正の向きです。
カリングにオンオフを付けました。
ボックスには重力があり地面と接しています。
地面はボックスを薄くしています。
カメラの向いている方向に動きます。
1,2キーが上下回転、2,3キーが横回転,4,5キーがZ回転します。
ＵとＤでＺ方向に動きます。
方向キーがX,Y方向です。
Zソート法と背面カリングの陰面処理です。
urlはhttps://seijinakata.github.io/3Dgamebox/index
です。
youtubeのEijo TakagiさんのＣ言語をjavascriptに変換しました。
Daniel Kreuterさん、だえうさんのコードも参考にさせていただきました。
自分が実装できたのは背面カリング、Zバッファ、テクスチャマッピングです。
視錐台カリングは本当に無理です。
