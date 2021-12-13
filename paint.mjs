const SCREEN_SIZE_W = 1000;
const SCREEN_SIZE_H = 800;

export class renderBuffer{

	constructor(){
		this.pixelBuffer = [];
		let Pixel = new pixel();
		this.pixelBuffer.push(Pixel);
	}
	insert(pixel){
		this.pixelBuffer.splice(0,1,pixel);
	}
	get(){
		return this.pixelBuffer[0];
	}
}

export class pixel{	
  constructor(){
    this.y = -1;
    this.x = -1;
    this.z = -1;
    this.r = -1;
    this.g = -1;
    this.b = -1;
    this.a = -1;
  }
  setPixel(y,x,z,r,g,b,a){
    this.y = y;
    this.x = x;
    this.z = z;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  setMaxX(maxX){
  	this.maxX = maxX;
  }
  setMinX(minX){
  	this.minX = minX;
  }
  getPixel(){
  	let getPixel = [];
  	getPixel.y = this.y;
  	getPixel.x = this.x;
  	getPixel.z = this.z;
  	getPixel.r = this.r;
  	getPixel.g = this.g;
  	getPixel.b = this.b;
  	getPixel.a = this.a;
  	return getPixel;
  }
  getMaxX(){
  	return this.maxX;
  }
  getMinX(){
  	return this.minX;
  }
}
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

export function pictureToPixelMap(ctx,image){

	ctx.clearRect(0,0,1500,1500);
	ctx.drawImage(image,0,0,image.width, image.height);
	var imageData = ctx.getImageData(0,0,image.width, image.height);
	let pixelImage = bufferPixelInit(imageData.height,imageData.width);
	for (let y = 0;y < imageData.height;y++) {
	    for (let x = 0;x < imageData.width;x++) {

	        let index = (x + y * imageData.width) * 4;
	        pixelImage[y][x].r = imageData.data[index];
	        pixelImage[y][x].g = imageData.data[index + 1];
	        pixelImage[y][x].b = imageData.data[index + 2];
	        pixelImage[y][x].a = imageData.data[index + 3];
	    }
	}
	return pixelImage;
}

export function bufferInit(size_H,size_W){
	let buffer = [];
	for(let j=0;j<size_H;j++){
		let tempRenderBuffer = [];
		for(let i=0;i<size_W;i++){
		let Pixel = new renderBuffer();
		tempRenderBuffer.push(Pixel);
		}
		buffer.push(tempRenderBuffer);
	}
	return buffer;
}

export function bufferPixelInit(size_H,size_W){
	let buffer = [];
	for(let j=0;j<size_H;j++){
		let tempPixel = [];
		for(let i=0;i<size_W;i++){
		let Pixel = new pixel();
		tempPixel.push(Pixel);
		}
		buffer.push(tempPixel);
	}
	return buffer;
}

export function dotPaint(y,x,r,g,b,a,ctx){
	//バッククオート
	ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
	ctx.fillRect(x,y,1,1);
}
export function dotLinePaint(Xs,Xe,Ys,Ye,r,g,b,a,ctx){
	if(Math.abs(Xe-Xs)>=Math.abs(Ye-Ys)){
	let lineStartx = 0;
	let lineEndx = 0;
		if(Xe>=Xs){
			lineStartx = Xs;
			lineEndx = Xe;
		}else{
			lineStartx = Xe;
			lineEndx = Xs;
		}
		for (let X = lineStartx; X <= lineEndx; X++) {
			let Y = Math.round(((Ye-Ys)/(Xe-Xs))*(X-Xs)+Ys);
			dotPaint(X,Y,r,g,b,a,ctx);
		}
	}else{
	let lineStarty = 0;
	let lineEndy = 0;
		if(Ye>=Ys){
			lineStarty = Ys;
			lineEndy = Ye;
		}else{
			lineStarty = Ye;
			lineEndy = Ys;
		}
		for (let Y = lineStarty; Y <= lineEndy; Y++) {
			let X = Math.round(((Xe-Xs)/(Ye-Ys))*(Y-Ys)+Xs);
			dotPaint(X,Y,r,g,b,a,ctx);
		}
	}
}
export function dotLineBufferRegister(Xs,Xe,Ys,Ye,r,g,b,a,buffer){
	if(Math.abs(Xe-Xs)>=Math.abs(Ye-Ys)){
	let lineStartx = 0;
	let lineEndx = 0;
		if(Xe>=Xs){
			lineStartx = Xs;
			lineEndx = Xe;
		}else{
			lineStartx = Xe;
			lineEndx = Xs;
		}
	if(Ye == Ys){
		buffer[Ys].setMaxX(lineEndx);
		buffer[Ys].setMinX(lineStartx);
		buffer[Ys].setPixel(Ys,lineStartx,1,r,g,b,a);	
		return;
	}
		for (let X = lineStartx; X <= lineEndx; X++) {
			let Y = Math.round(((Ye-Ys)/(Xe-Xs))*(X-Xs)+Ys);
			if(Y<0 || Y>=SCREEN_SIZE_H){
				continue;
			}
			if(buffer[Y].getMaxX()==undefined){
				buffer[Y].setMaxX(X);
			}else{
				let tempX = buffer[Y].getMaxX();
				if(X>tempX){
					buffer[Y].setMaxX(X);
					buffer[Y].setMinX(tempX);
				}else{
					buffer[Y].setMinX(X);
				}
			}
			buffer[Y].setPixel(Y,X,1,r,g,b,a);	
			//console.log(buffer[Y].getMaxX());
	
		}
	}else{
	let lineStarty = 0;
	let lineEndy = 0;
		if(Ye>=Ys){
			lineStarty = Ys;
			lineEndy = Ye;
		}else{
			lineStarty = Ye;
			lineEndy = Ys;
		}
		for (let Y = lineStarty; Y <= lineEndy; Y++) {
			if(Y<0 || Y>=SCREEN_SIZE_H){
				continue;
			}
			let X = Math.round(((Xe-Xs)/(Ye-Ys))*(Y-Ys)+Xs);
			if(buffer[Y].getMaxX()==undefined){
				buffer[Y].setMaxX(X);
			}else{
				let tempX = buffer[Y].getMaxX();
				if(X>tempX){
					buffer[Y].setMaxX(X);
					buffer[Y].setMinX(tempX);
				}else{
					buffer[Y].setMinX(X);
				}
			}
			buffer[Y].setPixel(Y,X,1,r,g,b,a);
		}
	}
}

export function triangleRasterize(buffer,bufferFrame,z,r,g,b,a,screen_size_h,screen_size_w){
	for(let j=0;j<screen_size_h;j++){
	 let startX = bufferFrame[j].getMinX();
	 let endX = bufferFrame[j].getMaxX();
	 //三角形がないところは除外
	 if(startX == undefined && endX == undefined){
	 	continue;
	 }
	 //その列の始点終点がともにはみ出している場合は作画する必要がない。
	 if(startX < 0 && endX < 0){
	 	continue;
	 }
	 if(startX > screen_size_w&& endX > screen_size_w){
	 	continue;
	 }
	 //その列の始点終点が画面内にあるがその相方がが飛び出している場合
	 if(startX < 0){
	 	startX = 0;
	 }
	 if(endX > screen_size_w-1){
	 	endX = screen_size_w-1;
	 }
		//周りの線はすべて塗りつぶす。
		for(let start = startX ;start<=endX;start++){
			buffer[j][start].setPixel(j,start,z,r,g,b,a);
		}
	}
}
export function textureTransform(a,b,c,d,h,w,imageData,screen_size_h,screen_size_w){
	let orgTexture = imageData;
	let affinedTexture = bufferPixelInit(screen_size_h,screen_size_w);
	let affinedX = 0,affinedY = 0;/* アフィン変換後画像の座標 */
	let baseAffinedX = 0,baseAffinedY = 0;/* アフィン変換後画像の座標 (0, 0)基準 */
	let selectOrgx = 0,selectOrgy = 0;/* アフィン後の座標に対応した元画像の座標 */
	let orgx,orgy = 0;/* 最近傍補間した元画像の座標 */
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

	    /* 原点0基準の値に変換 */
	    baseAffinedY = affinedY;// - affinedTexture.length / 2;
	    
	     for(affinedX = 0; affinedX < affinedTexture[0].length; affinedX++){
		      /* 原点0基準の値に変換 */
		      baseAffinedX = affinedX;// - affinedTexture[0].length / 2;

		      /* 元画像における横方向座標を計算 */
		      /* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
		      selectOrgx = baseAffinedX * iA[0] + baseAffinedY * iA[1]
		        - e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

		      /* 最近傍補間小数点の画像が無いので四捨五入して適当な近くのピクセルを頂く */
		      orgx= Math.floor(selectOrgx + 0.5); 

		      /* 元画像をはみ出る画素の場合は次の座標に飛ばす */
		      /* 飛ばされたらアフィン変換後画像は全画素のRGBZが初期値のpixelの-1になる */
		      if(orgx >= orgTexture[0].length || orgx < 0){
		        continue;
		      }
		      
		      /* 元画像における縦方向座標を計算 */
		      /* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
		      selectOrgy = baseAffinedX * iA[2] + baseAffinedY * iA[3]
		        - e * iA[2] - f * iA[3];// +  orgTexture.length / 2;
		      /* 最近傍補間小数点の画像が無いので四捨五入して適当な近くのピクセルを頂く */
		      orgy = Math.floor(selectOrgy + 0.5);
		      
		      /* 元画像をはみ出る画素の場合は次の座標に飛ばす */
		      /* 飛ばされたらアフィン変換後画像は全画素のRGBZが初期値のpixelの-1になる */
		      if(orgy >=  orgTexture.length || orgy < 0){
		        continue;
		      }
			      affinedTexture[affinedY][affinedX].r = orgTexture[orgy][orgx].r;
			      affinedTexture[affinedY][affinedX].g = orgTexture[orgy][orgx].g;
			      affinedTexture[affinedY][affinedX].b = orgTexture[orgy][orgx].b;
			      affinedTexture[affinedY][affinedX].a = orgTexture[orgy][orgx].a;
			      affinedTexture[affinedY][affinedX].z = 1;

	     }
	}
	return affinedTexture;
}