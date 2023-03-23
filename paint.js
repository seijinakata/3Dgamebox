//newをすると重くなる構造体はjson,配列に置き換え中
import { matVecMul,matIdentity,matPers,getInverseMatrix, matMul,getInvert2, CalInvMat4x4,protMatVecMul } from "./matrix.js";
import { round, roundVector2, setVector2,setVector3, vec2Minus, vec2Plus, vecMinus, vecMul } from "./vector.js";
import { SCREEN_SIZE_W,SCREEN_SIZE_H} from "./camera.js";

export class renderBuffer{

	constructor(){
		this.z = 99999;
		this.pixelBuffer = [];
		//let Pixel = new pixel();
		//this.pixelBuffer.push(Pixel);
	}
	insert(pixel){
		this.pixelBuffer.splice(0,1,pixel);
	}
	setZ(z){
		this.z = z;
	}
	getZ(){
		return this.z;
	}
	get(){
		return this.pixelBuffer[0];
	}
}
export function setPixel(z,r,g,b,a,crossWorldVector3){
	let pixel = {"z":z,"r":r,"g":g,"b":b,"a":a,"crossWorldVector3":crossWorldVector3};
	return pixel;
}
//シャドウマップ用
export function setPixelZ(z){
	let pixelZ = {"z":z};
	return pixelZ;
}
//minZはminXのZ値、maxZはmaxXのZ値,Y列で管理
export class lineYItem{
  setMaxX(maxX){
  	this.maxX = maxX;
  }
  setMinX(minX){
  	this.minX = minX;
  }
  getMaxX(){
  	return this.maxX;
  }
  getMinX(){
  	return this.minX;
  }
  setMaxZ(maxZ){
  	this.maxZ = maxZ;
  }
  setMinZ(minZ){
  	this.minZ = minZ;
  }
  getMaxZ(){
  	return this.maxZ;
  }
  getMinZ(){
  	return this.minZ;
  }
}

export class pixel{	
  constructor(){
    //this.y = -1;
    //this.x = -1;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 255;
  }
  setPixel(r,g,b,a){
    //this.y = y;
    //this.x = x;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  getPixel(){
  	let getPixel = [];
  	//getPixel.y = this.y;
  	//getPixel.x = this.x;
  	getPixel.r = this.r;
  	getPixel.g = this.g;
  	getPixel.b = this.b;
  	getPixel.a = this.a;
  	return getPixel;
  }
}
// |a,b| |_11,_12|
// |c,d| |_21,_22|

export class M22
{
  constructor(){
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

//Y座標ごとの切片
class scan_entry{
	constructor(){
		this.min = [];
		this.max = [];	
	}

};
//整数座標を求める
export function top_int(x){
    return (x+0.5)|0;
}
//増分を求める
export function delta_xz(edge){
  
    let ily = 1/edge[1];
    
    let  dx = edge[0]*ily;
    let  dz = edge[2]*ily;

    return setVector2(dx,dz);
}
//ソート関数
function swap(a,b){
	let t = a.concat();
	for(let i=0;i<3;i++){
		a[i]=b[i];
		b[i]=t[i];
	}
}
export function sort_index(t,i){
    if(t[0][i]>t[1][i])swap(t[0],t[1]);
    if(t[1][i]>t[2][i])swap(t[1],t[2]);
    if(t[0][i]>t[1][i])swap(t[0],t[1]);
}
export function branch(a,b,Y){
    let  t = (Y-a[1])/(b[1]-a[1]);
    return setVector3(a[0]*(1-t)+b[0]*t,Y,a[2]*(1-t)+b[2]*t);
}

export function pictureToPixelMap(ctx,image){

	ctx.clearRect(0,0,1500,1500);
	ctx.drawImage(image,0,0,image.width, image.height);
	var imageData = ctx.getImageData(0,0,image.width, image.height);
	return imageData;
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
export function dotLineBufferRegister(Xs,Xe,Ys,Ye,Zs,Ze,buffer){
	let distanceY = Math.abs(Ys-Ye);
	let distanceZ = Math.abs(Zs-Ze);
	let offsetZ = 0;
	if(distanceY != 0){
		offsetZ = distanceZ/distanceY;
	}
	let startX = 0;
	let startY = 0;
	let endX = 0;
	let endY = 0;
	let startZ = 0;
	let endZ = 0;
	if(Zs>Ze){
		startX = Xe;
		startY = Ye;
		endX = Xs;
		endY = Ys;
		startZ = Ze;
		endZ = Zs;
		
	}else{
		startX = Xs;
		startY = Ys;
		endX = Xe;
		endY = Ye;
		startZ = Zs;
		endZ = Ze;
	}
	//console.log("startZ",startZ);
	//console.log("endZ",endZ);
	//画面外は考える必要ないので即return一本しか判定していないのですごく危険
	if(Ye == Ys){
		if((Ys>=0 && Ys<SCREEN_SIZE_H) && (Ye>=0 && Ye<SCREEN_SIZE_H)){
			if(Xs>Xe){
				buffer[Ys].setMaxX(parseFloat(Xs));
				buffer[Ys].setMaxZ(parseFloat(Zs));
				buffer[Ys].setMinX(parseFloat(Xe));
				buffer[Ys].setMinZ(parseFloat(Ze));
			}else{
				buffer[Ys].setMaxX(parseFloat(Xe));
				buffer[Ys].setMaxZ(parseFloat(Ze));
				buffer[Ys].setMinX(parseFloat(Xs));
				buffer[Ys].setMinZ(parseFloat(Zs));
			}
		}
		return;
	}
	if(Math.abs(Xe-Xs)>=Math.abs(Ye-Ys)){
		let counter = startX;
		if(startX<endX){
			counter -= 1;
		}else{
			counter += 1;
		}
		while(true){
			if(startX<endX){
				counter +=  1;
				if(endX<counter){
					break;
				}
			}else{
				counter -=  1;		
				if(counter<endX){
					break;
				}
			}
			let Y = Math.round(((Ye-Ys)/(Xe-Xs))*(counter-Xs)+Ys);
			if(Y<0 || Y>=SCREEN_SIZE_H){
				continue;
			}
			if(buffer[Y].getMinX()==undefined && buffer[Y].getMaxX()==undefined && buffer[Y].getMaxZ()==undefined && buffer[Y].getMinZ()==undefined){
				buffer[Y].setMinX(counter);
				buffer[Y].setMaxX(counter);
				buffer[Y].setMaxZ(parseFloat(startZ)+offsetZ*Math.abs((Y-startY)));
				buffer[Y].setMinZ(parseFloat(startZ)+offsetZ*Math.abs((Y-startY)));
			}else{
				let currentMaxX = buffer[Y].getMaxX();
				let currentMinX = buffer[Y].getMinX();
				if(counter>currentMaxX){
					buffer[Y].setMaxX(counter);
					buffer[Y].setMaxZ(parseFloat(startZ)+offsetZ*Math.abs((Y-startY)));
				}
				if(counter<currentMinX){
					buffer[Y].setMinX(counter);
					buffer[Y].setMinZ(parseFloat(startZ)+offsetZ*Math.abs((Y-startY)));
				}
			}
		}
	}else{
	let counter = startY;
	if(startY>endY){
		counter += 1;
	}else{
		counter -= 1;
	}
	while(true){
		if(startY>endY){
			counter -=  1;
			if(endY>counter){
				break;
			}
		}else{
			counter +=  1;		
			if(counter>endY){
				break;
			}
		}
		if(counter<0 || counter>=SCREEN_SIZE_H){
			continue;
		}
		let X = Math.round(((Xe-Xs)/(Ye-Ys))*(counter-Ys)+Xs);
		if(buffer[counter].getMinX()==undefined && buffer[counter].getMaxX()==undefined && buffer[counter].getMaxZ()==undefined && buffer[counter].getMinZ()==undefined){
			buffer[counter].setMinX(X);
			buffer[counter].setMaxX(X);
			buffer[counter].setMaxZ(parseFloat(startZ)+offsetZ*Math.abs((counter-startY)));
			buffer[counter].setMinZ(parseFloat(startZ)+offsetZ*Math.abs((counter-startY)));
		}else{
			let currentMaxX = buffer[counter].getMaxX();
			let currentMinX = buffer[counter].getMinX();
			if(X>currentMaxX){
					buffer[counter].setMaxX(X);
					buffer[counter].setMaxZ(parseFloat(startZ)+offsetZ*Math.abs((counter-startY)));
				}
				if(X<currentMinX){
					buffer[counter].setMinX(X);
					buffer[counter].setMinZ(parseFloat(startZ)+offsetZ*Math.abs((counter-startY)));
				}
			}
		}
	}
}
/*
export function dotLineBufferRegister(Xs,Xe,Ys,Ye,r,g,b,a,buffer){
	let minY = null;
	let maxY = null;
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
			minY = Ys;
			maxY = Ys;
			if((Ys>=0 && Ys<SCREEN_SIZE_H) && (Ye>=0 && Ye<SCREEN_SIZE_H)){
				buffer[Ys].setMaxX(lineEndx);
				buffer[Ys].setMinX(lineStartx);
			}
			return [minY,maxY];
		}
		for (let X = lineStartx; X <= lineEndx; X++) {
			let Y = Math.round(((Ye-Ys)/(Xe-Xs))*(X-Xs)+Ys);
			//縦３ピクセルならだったら添え字は0,1,2縦の総数の要素数は3-1	
			if(minY == null && maxY == null){
				minY = Y;
				maxY = Y;
			}else{
				if(minY>Y){
					minY = Y;
				}
				if(maxY<Y){
					maxY = Y;
				}
			}
			if(Y<0 || Y>=SCREEN_SIZE_H){
				continue;
			}
			if(buffer[Y].getMaxX()==undefined && buffer[Y].getMinX()==undefined){
				buffer[Y].setMaxX(X);
				buffer[Y].setMinX(X);
			}else{
				let currentMaxX = buffer[Y].getMaxX();
				let currentMinX = buffer[Y].getMinX();
				if(X>currentMaxX){
					buffer[Y].setMaxX(X);
				}
				if(X<currentMinX){
					buffer[Y].setMinX(X);
				}
			}
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
			if(minY == null && maxY == null){
				minY = Y;
				maxY = Y;
			}else{
				if(minY>Y){
					minY = Y;
				}
				if(maxY<Y){
					maxY = Y;
				}
			}			
			if(Y<0 || Y>=SCREEN_SIZE_H){
				continue;
			}
			let X = Math.round(((Xe-Xs)/(Ye-Ys))*(Y-Ys)+Xs);
			if(buffer[Y].getMaxX()==undefined && buffer[Y].getMinX()==undefined){
				buffer[Y].setMaxX(X);
				buffer[Y].setMinX(X);
			}else{
				let currentMaxX = buffer[Y].getMaxX();
				let currentMinX = buffer[Y].getMinX();
				if(X>currentMaxX){
					buffer[Y].setMaxX(X);
				}
				if(X<currentMinX){
					buffer[Y].setMinX(X);
				}
			}
		}
	}
	return [minY,maxY];
}*/

export function triangleRasterize(buffer,bufferFrame,z,r,g,b,a,screen_size_h,screen_size_w,minY,maxY){
	for(let j=minY;j<maxY;j++){
	 let startX = bufferFrame[j].getMinX();
	 let endX = bufferFrame[j].getMaxX();
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
			buffer[j][start].setPixel(r,g,b,a);
		}
	}
}

//lengthが高さ、length[0]が横
export function triangleToShadowBuffer(zBuffering,vertex_list,screen_size_h,screen_size_w)
{
  //各点のZ座標がこれより下なら作画しない。
  if (vertex_list[0][2] > 0.0 && vertex_list[1][2]> 0.0 && vertex_list[2][2] > 0.0) {

	let tempverts = vertex_list.concat();

	sort_index(tempverts,1);//ys
	let pt = tempverts[0];
	let pm = tempverts[1];
	let pb = tempverts[2];

	scan_ShadowVertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb);		
  }
}

//x,yの最初の初期値を０にするのはダメ差分を取るため。shadowMap用
function scan_ShadowVertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb){

	//viewport前は0から1000で管理4桁で四捨五入0.5は画面の中央
	let mid = pm[1];

    let tmp = branch(pt,pb,mid);//pt->

    let triangleTop = pt[1];
    let triangleBtm = pb[1];

    if(!(triangleTop<triangleBtm))return;

	//if(triangleTop<0)triangleTop=0;
    if(screen_size_h<triangleBtm)triangleBtm=screen_size_h;

    let pl = [],pr = [];

    if(tmp[0]<pm[0]){
        pl = tmp;
        pr = pm;
    }else{
        pl = pm;
        pr = tmp;           
    }

    let m = mid;
    //if(m<0)m=0;
    if(screen_size_h<m)m=screen_size_h;

    if(triangleTop<m){//upper 
        let el = vecMinus(pl,pt);//pt->pl
        let er = vecMinus(pr,pt);//pt->pr
        let dl = delta_xz(el);
        let dr = delta_xz(er);
        //start position
        let sl = setVector2(pt[0],pt[2]);
        let sr = setVector2(pt[0],pt[2]);
        let y=triangleTop;
        do{
			if(y>=0){
				//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_ShadowHorizontal(zBuffering,screen_size_w,y,startX,endX,startZ,endZ);				
			}
            sl = vec2Plus(sl,dl);//
            sr = vec2Plus(sr,dr);//

            y++;
        }while(y<m);
    }
    if(m<triangleBtm){//lower
		let el = vecMinus(pb,pl);//pl->pb
		let er = vecMinus(pb,pr);//pr->pb
        let dl = delta_xz(el);
        let dr = delta_xz(er);
        //start position
        let sl = setVector2(pl[0],pl[2]);
        let sr = setVector2(pr[0],pr[2]);

        let y=m;
        do{
			if(y>=0){
			//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_ShadowHorizontal(zBuffering,screen_size_w,y,startX,endX,startZ,endZ);				
			}
            sl = vec2Plus(sl,dl);//
            sr = vec2Plus(sr,dr);//

            y++;
        }while(y<triangleBtm);
    }
}

function scan_ShadowHorizontal(zBuffering,screen_size_w,y,startX,endX,startZ,endZ){

    //if(l<0)l=0;
    if(screen_size_w<endX)endX=screen_size_w;
	//ここでstartXがスクリーンを超えてるか判定できる。
    if(startX<endX){
		
        let zStep = endZ - startZ;
		let xStep = endX- startX;

        let dz = zStep/xStep;

        do{
			if(startX>=0){
				let z = zBuffering[y][startX][0].z;
				if(z>startZ){
					let shadowPixelZ = setPixelZ(startZ);
					zBuffering[y][startX].splice(0,1,shadowPixelZ);
				}
			}

			startZ+=dz;
			startX++;
        }while(startX<endX);
    }
}
//x,yの最初の初期値を０にするのはダメ差分を取るため。
function scan_vertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,iA,h,w,imageData,textureVMax,textureVMin,textureUMax,textureUMin,
	crossWorldVector3){

	//viewport前は0から1000で管理4桁で四捨五入0.5は画面の中央
	let mid = pm[1];

    let tmp = branch(pt,pb,mid);//pt->

    let triangleTop = pt[1];
    let triangleBtm = pb[1];

    if(!(triangleTop<triangleBtm))return;

	//if(triangleTop<0)triangleTop=0;
    if(screen_size_h<triangleBtm)triangleBtm=screen_size_h;

    let pl = [],pr = [];

    if(tmp[0]<pm[0]){
        pl = tmp;
        pr = pm;
    }else{
        pl = pm;
        pr = tmp;           
    }

    //if(m<0)m=0;
    if(screen_size_h<mid)mid=screen_size_h;

    if(triangleTop<mid){//upper 
        let el = vecMinus(pl,pt);//pt->pl
        let er = vecMinus(pr,pt);//pt->pr
        let dl = delta_xz(el);
        let dr = delta_xz(er);
        //start position
        let sl = setVector2(pt[0],pt[2]);
        let sr = setVector2(pt[0],pt[2]);
        do{
			if(triangleTop>=0){
				//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_horizontal(zBuffering,screen_size_w,triangleTop,startX,endX,startZ,endZ,iA,h,w,
					imageData,textureVMax,textureVMin,textureUMax,textureUMin,crossWorldVector3);				
			}
            sl = vec2Plus(sl,dl);//
            sr = vec2Plus(sr,dr);//
            triangleTop++;
        }while(triangleTop<mid);
    }
    if(mid<triangleBtm){//lower
		let el = vecMinus(pb,pl);//pl->pb
		let er = vecMinus(pb,pr);//pr->pb
        let dl = delta_xz(el);
        let dr = delta_xz(er);
        //start position
        let sl = setVector2(pl[0],pl[2]);
        let sr = setVector2(pr[0],pr[2]);

        do{
			if(mid>=0){
			//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_horizontal(zBuffering,screen_size_w,mid,startX,endX,startZ,endZ,iA,h,w,imageData,textureVMax,textureVMin,textureUMax,textureUMin,
					crossWorldVector3);				
			}
            sl = vec2Plus(sl,dl);//
            sr = vec2Plus(sr,dr);//
            mid++;
        }while(mid<triangleBtm);
    }
}
function scan_horizontal(zBuffering,screen_size_w,y,startX,endX,startZ,endZ,iA,f,e,imageData,textureVMax,textureVMin,textureUMax,textureUMin,crossWorldVector3){

	//アフィン変換の平行移動ベクトル
	//縦移動、transform関数のf
	//横移動、transform関数のe

    //if(l<0)l=0;
    if(screen_size_w<endX)endX=screen_size_w;
	//ここでstartXがスクリーンを超えてるか判定できる。
    if(startX<endX){
		
        let zStep = endZ - startZ;
		let xStep = endX- startX;

        let dz = zStep/xStep;

        do{
			if(startX>=0){
				let z = zBuffering[y][startX][0].z;
				if(z>startZ){
					/* 元画像における縦方向座標を計算 */
					/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
					let selectOrgy = startX * iA[2] + y * iA[3]/* アフィン後の座標に対応した元画像の座標 */
					- e * iA[2] - f * iA[3];// +  orgTexture.height / 2;
					let orgy = selectOrgy|0;/* 最近傍補間した元画像の座標 */
					/* 元画像をはみ出る画素の場合ははみ出る前のピクセルを詰める */
					if(orgy >=  textureVMax){
						//画像配列は０から始まってるからheight,widthともに-1
						orgy =  textureVMax - 1;
					}if(orgy <= textureVMin){
						orgy = textureVMin;
					}
					/* 元画像における横方向座標を計算 */
					/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
					let selectOrgx = startX * iA[0] + y * iA[1]/* アフィン後の座標に対応した元画像の座標 */
						- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;
					let orgx = selectOrgx|0; /* 最近傍補間した元画像の座標 */
					/* 元画像をはみ出る画素の場合ははみ出る前の前のピクセルを詰める */
					if(orgx >= textureUMax){
						//画像配列は０から始まってるからheight,widthともに-1
						orgx = textureUMax -1;
					}if(orgx <= textureUMin){
						orgx = textureUMin
					}
					let index = (orgx + orgy * imageData.width) * 4;
					let affinedPixel = setPixel(startZ,imageData.data[index],imageData.data[index + 1],imageData.data[index + 2],imageData.data[index + 3],crossWorldVector3);

					zBuffering[y][startX].splice(0,1,affinedPixel);
				}
			}
			startZ+=dz;
			startX++;
        }while(startX<endX);
    }
}
export function textureTransform(a,b,c,d,h,w,alpha,imageData,vertex_list,screen_size_h,screen_size_w,clipMinY,clipMaxY,bufferFrame,
	renderZBuffer,shadowMap,inverseViewMatrix,inverseViewPortMatrix,sunViewMatrix,viewPortMatrix){
	let orgTexture = imageData;
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
	for(affinedY = clipMinY; affinedY <= clipMaxY; affinedY++){

	    baseAffinedY = affinedY;// - affinedTexture.length / 2;
	    let currentMinX = bufferFrame[baseAffinedY].getMinX();
	 	let currentMaxX = bufferFrame[baseAffinedY].getMaxX();
	 	let startZ = bufferFrame[baseAffinedY].getMinZ();
	 	let offsetZ = bufferFrame[baseAffinedY].getMaxZ() -bufferFrame[baseAffinedY].getMinZ();
	 	let distanceX = Math.abs(currentMinX-currentMaxX);
	 	let offsetXZ = 0;
	 	if(distanceX != 0){
	 		offsetXZ = offsetZ/distanceX;
	 	}
	 	//その列の始点終点がともにはみ出している場合は作画する必要がない。
	 	if(currentMinX < 0 && currentMaxX < 0){
		 	continue;
		}
		if(currentMinX > screen_size_w&& currentMaxX > screen_size_w){
		 	continue;
		}
		//その列の始点終点が画面内にあるがその相方がが飛び出している場合
		 if(currentMinX < 0){
		 	currentMinX = 0;
		 }
		 if(currentMaxX > screen_size_w-1){
		 	currentMaxX = screen_size_w-1;
		 }
	     for(affinedX = currentMinX; affinedX <= currentMaxX; affinedX++){
	     
			/* 原点0基準の値に変換 */
			baseAffinedX = affinedX;// - affinedTexture.width / 2;

			/* 元画像における横方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			selectOrgx = baseAffinedX * iA[0] + baseAffinedY * iA[1]
				- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

			/* 最近傍補間小数点の画像が無いので四捨五入して適当な近くのピクセルを頂く */
			orgx= Math.floor(selectOrgx + 0.5); 

			/* 元画像をはみ出る画素の場合ははみ出る前の前のピクセルを詰める */
			if(orgx >= orgTexture.width){
				orgx = orgTexture.width -1;
			}if(orgx < 0){
				orgx = 0;
			}
			
			/* 元画像における縦方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			selectOrgy = baseAffinedX * iA[2] + baseAffinedY * iA[3]
				- e * iA[2] - f * iA[3];// +  orgTexture.height / 2;
			/* 最近傍補間小数点の画像が無いので四捨五入して適当な近くのピクセルを頂く */
			orgy = Math.floor(selectOrgy + 0.5);
			
			/* 元画像をはみ出る画素の場合ははみ出る前のピクセルを詰める */
			if(orgy >=  orgTexture.height){
				orgy = orgTexture.height -1;
			}if(orgy < 0){
				orgy = 0;
			}
			let pixelZ = parseFloat(startZ)+offsetXZ*Math.abs(affinedX-currentMinX);	
	    	//バッファに登録
			if(renderZBuffer[affinedY][affinedX].get().getPixel().z>=pixelZ){
				let index = (orgx + orgy * orgTexture.width) * 4;
				let affinedPixel = new pixel();
				affinedPixel.setPixel(orgTexture.data[index],orgTexture.data[index + 1],orgTexture.data[index + 2],orgTexture.data[index + 3]);
				if(shadowMap !=null){
					//camera
					let pixelVector3 = setVector3(affinedX,affinedY,pixelZ);
					pixelVector3 = matVecMul(inverseViewPortMatrix,pixelVector3);
					let projectionMatrix = matIdentity();
					matPers(projectionMatrix,pixelVector3[2])
					let inverseProjectionMatrix = getInverseMatrix(projectionMatrix);
					let inverseProjectionViewMatrix = matMul(inverseViewMatrix,inverseProjectionMatrix);
					pixelVector3 = matVecMul(inverseProjectionViewMatrix,pixelVector3);
					//view
					pixelVector3 = matVecMul(sunViewMatrix,pixelVector3);
					projectionMatrix = matIdentity();
					matPers(projectionMatrix,pixelVector3[2]);
					let viewPortProjectionMatrix = matMul(viewPortMatrix,projectionMatrix);
					pixelVector3 = matVecMul(viewPortProjectionMatrix,pixelVector3);
					pixelVector3[0] = Math.floor(parseFloat(pixelVector3[0]) + 0.5);
					pixelVector3[1] = Math.floor(parseFloat(pixelVector3[1]) + 0.5);
					if(pixelVector3[0]>0 && pixelVector3[0]<SCREEN_SIZE_W){
						if(pixelVector3[1]>0 && pixelVector3[1]<SCREEN_SIZE_H){
							if(shadowMap[pixelVector3[1]][pixelVector3[0]].get().getPixel().z+0.12<pixelVector3[2]){
								affinedPixel.r = affinedPixel.r/2.2;
								affinedPixel.g = affinedPixel.g/2.2;
								affinedPixel.b = affinedPixel.b/2.2;	
							}
						}
					}
					renderZBuffer[affinedY][affinedX].insert(affinedPixel);
				}else{
					renderZBuffer[affinedY][affinedX].insert(affinedPixel);
				}				
			}
	    }
	}
}

//lengthが高さ、length[0]が横
export function triangleToBuffer(zBuffering,imageData,vertex_list,crossWorldVector3,uv_list,screen_size_h,screen_size_w)
{
  //各点のZ座標がこれより下なら作画しない。
  if (vertex_list[0][2] > 0.0 && vertex_list[1][2]> 0.0 && vertex_list[2][2] > 0.0) {
    var _Ax = vertex_list[1][0] - vertex_list[0][0];
    var _Ay = vertex_list[1][1] - vertex_list[0][1];
    var _Bx = vertex_list[2][0] - vertex_list[0][0];
    var _By = vertex_list[2][1] - vertex_list[0][1];
	/*
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
	*/
	//マトリックス変換値を求める
	var Ax = (uv_list[2] - uv_list[0]) * imageData.width;
	var Ay = (uv_list[3] - uv_list[1]) * imageData.height;
	var Bx = (uv_list[4] - uv_list[0]) * imageData.width;
	var By = (uv_list[5] - uv_list[1]) * imageData.height;
	var mi = getInvert2(Ax,Ay,Bx,By);
	if (!mi) return;
	
	let textureVMax = imageData.height*Math.max(uv_list[1],uv_list[3],uv_list[5]);
	textureVMax |= 0;
	/* 元画像をはみ出る画素の場合ははみ出る前の前のピクセルを詰める */
	let textureVMin = imageData.height*Math.min(uv_list[1],uv_list[3],uv_list[5]) + 0.5;
	textureVMin |= 0;
	let textureUMax = imageData.width*Math.max(uv_list[0],uv_list[2],uv_list[4]);
	textureUMax |= 0;
	/* 元画像をはみ出る画素の場合ははみ出る前の前のピクセルを詰める */
	let textureUMin = imageData.width*Math.min(uv_list[0],uv_list[2],uv_list[4]) + 0.5;
	textureUMin |= 0;
	
	

	//アフィン変換の基定ベクトル、元画像を抽出するためのベクトル
	let a = mi[0][0] * _Ax + mi[0][1] * _Bx;
	let c = mi[1][0] * _Ax + mi[1][1] * _Bx;

	let b = mi[0][0] * _Ay + mi[0][1] * _By;
	let d = mi[1][0] * _Ay + mi[1][1] * _By;

	//逆行列のad-bc
	let det = a * d - c * b;
	if(det == 0) {
		return -1;
	}
	let iA = [0,0,0,0];//Aの逆行列
	iA[0] = d / det;
	iA[1] = - c/ det;
	iA[2] = - b / det;
	iA[3] = a / det;
	let h = vertex_list[0][1] - (b * uv_list[0] * imageData.width + d * uv_list[1] * imageData.height);
	let w = vertex_list[0][0] - (a * uv_list[0] * imageData.width + c * uv_list[1] * imageData.height);
		
	let tempverts = vertex_list.concat();

	sort_index(tempverts,1);//ys
	let pt = tempverts[0];
	let pm = tempverts[1];
	let pb = tempverts[2];

	scan_vertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,iA,h,w,imageData,textureVMax,textureVMin,textureUMax,textureUMin,
		crossWorldVector3);

 	/*
	let triangleFrame = new Array(SCREEN_SIZE_H);
	for(let j=0;j<SCREEN_SIZE_H;j++){
		triangleFrame[j] = new lineYItem();
	}
	//頂点はコの字の並び
	dotLineBufferRegister(vertex_list[0][0],vertex_list[1][0],vertex_list[0][1],vertex_list[1][1],vertex_list[0][2],vertex_list[1][2],triangleFrame);//八の字の左側
	dotLineBufferRegister(vertex_list[1][0],vertex_list[2][0],vertex_list[1][1],vertex_list[2][1],vertex_list[1][2],vertex_list[2][2],triangleFrame);//左上から右下。
	dotLineBufferRegister(vertex_list[2][0],vertex_list[0][0],vertex_list[2][1],vertex_list[0][1],vertex_list[2][2],vertex_list[0][2],triangleFrame);//八の字の右側

	//作画範囲の高さ
	let minY = vertex_list[0][1];
	let maxY = vertex_list[0][1];

	if(minY>vertex_list[1][1]){
		minY =vertex_list[1][1];
	}
	if(maxY<vertex_list[1][1]){
		maxY =vertex_list[1][1];
	}	
	if(minY>vertex_list[2][1]){
		minY = vertex_list[2][1];
	}
	if(maxY<vertex_list[2][1]){
		maxY = vertex_list[2][1];
	}
	if(minY < 0) minY = 0;
	if(maxY < 0) maxY = 0;
	if(minY >= SCREEN_SIZE_H) minY = SCREEN_SIZE_H - 1;
	if(maxY >= SCREEN_SIZE_H) maxY = SCREEN_SIZE_H - 1;

	textureTransform(a,b,c,d,vertex_list[0][1]
	 - (b * uv_list[0] * imageData.width + d * uv_list[1] * imageData.height), vertex_list[0][0] - (a * uv_list[0] * imageData.width + c * uv_list[1] * imageData.height),textureAlpha,imageData,vertex_list,SCREEN_SIZE_H,SCREEN_SIZE_W,minY,maxY,triangleFrame,
	 renderZBuffer,shadowMap,inverseViewMatrix,inverseViewPortMatrix,sunViewMatrix,viewPortMatrix);

    //平行移動を追加済み        
    g.transform(a, b, c, d,
      vertex_list[0] - (a * uv_list[0] * imageData.width + c * uv_list[1] * imageData.height),
      vertex_list[1] - (b * uv_list[0] * imageData.width + d * uv_list[1] * imageData.height));
    g.drawImage(imageData, 0, 0);
    g.restore();*/  
  }

}