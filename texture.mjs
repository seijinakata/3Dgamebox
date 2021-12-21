// |a,b| |_11,_12|
// |c,d| |_21,_22|

export class M22
{
  constroctor(){
    this._11 = 1;  //a
    this._12 = 0;  //b
    this._21 = 0;  //c
    this._22 = 1;  //d 
  }
  getInvert(){
    var out = new M22();
    //逆行列の公式 ad - bc の部分
    var det = this._11 * this._22 - this._12 * this._21;
    if (det > -0.0001 && det < 0.0001)
      return null;

    //逆行列の公式 det=(ad - bc) で各値(a,b,c,d)を割る
    out._11 = this._22 / det;  // a = d / det
    out._22 = this._11 / det;  // d = a / det

    out._12 = -this._12 / det; // b = -b / det
    out._21 = -this._21 / det; // c = -c / det

    return out;
  }
}

export function drawTriangle(g, img, vertex_list, uv_list)
{
  
  //各点のZ座標がこれより下なら作画しない。
  if (vertex_list[6] > 0.0 && vertex_list[7] > 0.0 && vertex_list[8] > 0.0) {
    var _Ax = vertex_list[2] - vertex_list[0];
    var _Ay = vertex_list[3] - vertex_list[1];
    var _Bx = vertex_list[4] - vertex_list[0];
    var _By = vertex_list[5] - vertex_list[1];

    var Ax = (uv_list[2] - uv_list[0]) * img.width;
    var Ay = (uv_list[3] - uv_list[1]) * img.height;
    var Bx = (uv_list[4] - uv_list[0]) * img.width;
    var By = (uv_list[5] - uv_list[1]) * img.height;

    //逆行列を求める
    var m = new M22();
    m._11 = Ax;
    m._12 = Ay;
    m._21 = Bx;
    m._22 = By;
    var mi = m.getInvert();
    if (!mi) return;

    //マトリックス変換値を求める
    var a, b, c, d;
    a = mi._11 * _Ax + mi._12 * _Bx;
    c = mi._21 * _Ax + mi._22 * _Bx;

    b = mi._11 * _Ay + mi._12 * _By;
    d = mi._21 * _Ay + mi._22 * _By;

    g.save();
    /*
    var canvas = document.getElementById('sample');
    var context = canvas.getContext('2d');
    //context.clearRect(0,0,1500,1500);
    context.drawImage(img,img.width/2, img.height/2,1,1);
    var data = context.getImageData(img.width/2, img.height/2,1,1).data;
    g.strokeStyle = 'rgba(' + data[0] + ',' + data[1] +',' + data[2] + ',' + (data[3] / 255) + ')';
    */
    g.beginPath();
    g.moveTo(vertex_list[0], vertex_list[1]);
    g.lineTo(vertex_list[2], vertex_list[3]);
    g.lineTo(vertex_list[4], vertex_list[5]);
    g.stroke();
    g.clip(); //三角形に切り取る

    //平行移動を追加済み        
    g.transform(a, b, c, d,
      vertex_list[0] - (a * uv_list[0] * img.width + c * uv_list[1] * img.height),
      vertex_list[1] - (b * uv_list[0] * img.width + d * uv_list[1] * img.height));
    g.drawImage(img, 0, 0);
    g.restore();  
  }

}
/*
export function textureTransform(a,b,c,d,h,w,alpha,imageData,screen_size_h,screen_size_w){
	let orgTexture = imageData;
	let affinedTexture = bufferPixelInit(screen_size_h,screen_size_w);
	let affinedX = 0,affinedY = 0;// アフィン変換後画像の座標 
	let baseAffinedX = 0,baseAffinedY = 0;// アフィン変換後画像の座標 (0, 0)基準 
	let selectOrgx = 0,selectOrgy = 0;// アフィン後の座標に対応した元画像の座標 
	let orgx,orgy = 0;// 最近傍補間した元画像の座標
	let A = Array(4);//javascriptのtransform関数のa,b,c,dの2*2の行列
	let iA = Array(4);//Aの逆行列
	//アフィン変換の平行移動ベクトル
	let f = h;//縦移動、transform関数のf
	let e = w;//横移動、transform関数のe
	let det = 0;//逆行列のad-bc

	//アフィン変換の基定ベクトル、元画像を抽出するためのベクトル
	A[0] = a;
	A[1] = c;
	A[2] = b;
	A[3] = d;

	det = A[0] * A[3] - A[1] * A[2];
	if(det == 0) {
		return -1;
	}

	iA[0] = A[3] / det;
	iA[1] = - A[1] / det;
	iA[2] = - A[2] / det;
	iA[3] = A[0] / det;

	//変換後の座標を一つ一つ見ていく、その点に対応する元画像のピクセルを計算して写す
	//元の画像をどのように変換後に写すかじゃなく、元々の画像を変換後どこに移動するか計算する。
	for(affinedY = 0; affinedY < affinedTexture.length; affinedY++){

	    // 原点0基準の値に変換
	    baseAffinedY = affinedY;// - affinedTexture.length / 2;
	    
	     for(affinedX = 0; affinedX < affinedTexture[0].length; affinedX++){
		      // 原点0基準の値に変換
		      baseAffinedX = affinedX;// - affinedTexture[0].length / 2;

		      // 元画像における横方向座標を計算 
		      // 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 
		      selectOrgx = baseAffinedX * iA[0] + baseAffinedY * iA[1]
		        - e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

		      // 最近傍補間小数点の画像が無いので四捨五入して適当な近くのピクセルを頂く
		      orgx= Math.floor(selectOrgx + 0.5); 

		      // 元画像をはみ出る画素の場合は次の座標に飛ばす 
		      // 飛ばされたらアフィン変換後画像は全画素のRGBZが初期値のpixelの-1になる
		      if(orgx >= orgTexture[0].length || orgx < 0){
		        continue;
		      }
		      
		      // 元画像における縦方向座標を計算 
		      // 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 
		      selectOrgy = baseAffinedX * iA[2] + baseAffinedY * iA[3]
		        - e * iA[2] - f * iA[3];// +  orgTexture.length / 2;
		      // 最近傍補間小数点の画像が無いので四捨五入して適当な近くのピクセルを頂く
		      orgy = Math.floor(selectOrgy + 0.5);
		      
		      // 元画像をはみ出る画素の場合は次の座標に飛ばす
		      // 飛ばされたらアフィン変換後画像は全画素のRGBZが初期値のpixelの-1になる
		      if(orgy >=  orgTexture.length || orgy < 0){
		        continue;
		      }
			      affinedTexture[affinedY][affinedX].r = orgTexture[orgy][orgx].r;
			      affinedTexture[affinedY][affinedX].g = orgTexture[orgy][orgx].g;
			      affinedTexture[affinedY][affinedX].b = orgTexture[orgy][orgx].b;
			      affinedTexture[affinedY][affinedX].a = alpha;
			      affinedTexture[affinedY][affinedX].z = 1;

	     }
	}
	return affinedTexture;
}}*/