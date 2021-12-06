3Dに見えるかもしれませんが2Dです。
Zバッファ実装を試してみます。
transform関数を自作し。テクスチャを変形させました。
左の絵がcanvasのtransform、右が自作のtransformです。
左右対称になっていると思います。
a,b,c,d,e,fはtexture.mjsで求めていますのでそれを使います。
これと、ラスタライズした三角形でマスクによるクリッピングし、
ラスタライズした三角形はクリップ関数です。
できたのをZバッファに登録し、
左上から右下までZ値を参考にして、一番自分に近い色のみ獲得し
レガシーなドットインパクトをすれば
モダンなZバッファ法です。
その時、後ろの隠れている色を捨ててしまうため。
Zバッファの泣き所が起こるわけですね。
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
