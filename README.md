ここでいったん終了にします。
3Dに見えるかもしれませんが2Dです。
箱はZバッファ法による作画です。
かなり動作が重いです。
for文をできるだけ削りました。
transform関数を自作し。テクスチャを変形させました。
線を引くとき縦横座標の大、小をとり、
その範囲内でテクスチャを操作します。
テクスチャマッピングにおもらしがあります。
a,b,c,d,e,fはtexture.mjsで求めていますのでそれを使います。
左上から右下までZ値を参考にして、一番自分に近い色のみ獲得し
レガシーなドットインパクトプリンターをすれば
モダンなZバッファ法です。
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
頂点の登録はㇵの字で、下へのベクトルが先、横が後です。
自分が実装できたのは背面カリング、Zバッファ、簡単なテクスチャマッピングです。
視錐台カリングは本当に無理です。
