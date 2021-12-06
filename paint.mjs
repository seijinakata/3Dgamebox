export class pixel{	
  constructor(){
    this.x = -1;
    this.y = -1;
    this.z = -1;
    this.r = -1;
    this.g = -1;
    this.b = -1;
    this.a = -1;
  }
  setPixel(y,x,z,r,g,b,a){
    this.x = y;
    this.y = x;
    this.z = z;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  getPixel(){
  	let getPixel = [];
  	getPixel.x = this.x;
  	getPixel.y = this.y;
  	getPixel.z = this.z;
  	getPixel.r = this.r;
  	getPixel.g = this.g;
  	getPixel.b = this.b;
  	getPixel.a = this.a;
  	return getPixel;
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
		for (let X = lineStartx; X <= lineEndx; X++) {
			let Y = Math.round(((Ye-Ys)/(Xe-Xs))*(X-Xs)+Ys);
			buffer[Y][X].setPixel(Y,X,1,r,g,b,a);
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
			buffer[Y][X].setPixel(Y,X,1,r,g,b,a);
		}
	}
}

export function triangleRasterize(buffer,z,r,g,b,a,screen_size_h,screen_size_w){
	for(let j=0;j<screen_size_h;j++){
	 let rasterizeStart = -1;
	 let rasterizeEnd = -1;
		for(let i=0;i<screen_size_w;i++){;
			if(buffer[j][i].z >-1){
			rasterizeStart = i;
			break;
			}
		}
		for(let i =screen_size_w-1;i>=0;i--){
			if(buffer[j][i].z >-1){
			rasterizeEnd = i;
			break;
			}
		}
			if(rasterizeStart>-1 && rasterizeEnd>-1){
				//周りの線はすべて塗りつぶす。
				for(let start = rasterizeStart;start<=rasterizeEnd;start++){
				buffer[j][start].setPixel(j,start,z,r,g,b,a);
			}
		}
	}
}
export function texturetransform(a,b,c,d,h,w,imageData,screen_size_h,screen_size_w){
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
