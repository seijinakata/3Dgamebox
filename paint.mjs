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
