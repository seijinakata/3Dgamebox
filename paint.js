//newをすると重くなる構造体はjson,配列に置き換え中
import { matVecMul,matIdentity,matPers,getInverseMatrix, matMul,getInvert2, CalInvMat4x4,protMatVecMul } from "./matrix.js";
import { XRound, culVecDot, round, setVector2,setVector3, vec2Minus, vec2NoYVec3Minus, vec2OffsetMulAfterMinus, vec2Plus, vec3NoYVec2Minus, vec3notYMinus, vecMinus, vecMul } from "./vector.js";
import { SCREEN_SIZE_W,SCREEN_SIZE_H} from "./camera.js";
import { delta_X, delta_Z, position_X, position_Y, position_Z } from './enum.js';

const RED = 0;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;

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
export function setPixel(z,r,g,b,shadowFlag,lightShadowFlag,crossWorldVector3){
	let pixel = [z,r,g,b,shadowFlag,lightShadowFlag,crossWorldVector3];
	return pixel;
}
export function setPixelNoCrossWorldVector3(z,r,g,b,shadowFlag,lightShadowFlag){
	let pixel = [z,r,g,b,shadowFlag,lightShadowFlag];
	return pixel;
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
    let out = new M22();
    //逆行列の公式 ad - bc の部分
    let det = this._11 * this._22 - this._12 * this._21;
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

//vertsCopy
export function vertsCopy(verts){
    return [verts[0],verts[1],verts[2]];
}
//整数座標を求める
export function top_int(x){
    return x|0;
}
//増分を求める
export function delta_xz(edge){
  
    let ily = 1/edge[1];
    
    let  dx = edge[0]*ily;
    let  dz = edge[2]*ily;

    return setVector2(dx,dz);
}
//増分を求める
export function delta_Noy_xz(edge,y){
  
    let ily = 1/y;
    
    let  dx = edge[0]*ily;
    let  dz = edge[1]*ily;

    return setVector2(dx,dz);
}
// //ソート関数
//sortするのはY座標のみ
export function sort_Yindex(t){
	let verts = [];
	verts[0] = vertsCopy(t[0]);
	verts[1] = vertsCopy(t[1]);
	verts[2] = vertsCopy(t[2]);

    if(verts[0][1]>verts[1][1]){
		let tempVerts = verts[0];
		verts[0] = verts[1];
		verts[1] = tempVerts;
	}
    if(verts[1][1]>verts[2][1]){
		let tempVerts = verts[1];
		verts[1] = verts[2];
		verts[2] = tempVerts;
	}
    if(verts[0][1]>verts[1][1]){
		let tempVerts = verts[0];
		verts[0] = verts[1];
		verts[1] = tempVerts;
	}
	return verts;
}
export function branch(a,b,Y){
	let  t = (Y-a[1])/(b[1]-a[1]);
	let invt = (1-t);
	return setVector3(a[0]*invt+b[0]*t,Y,a[2]*invt+b[2]*t);
}
export function branchNoY(a,b,Y){
	let  t = (Y-a[1])/(b[1]-a[1]);
	let invt = (1-t);
	return [a[0]*invt+b[0]*t,a[2]*invt+b[2]*t];
}
export function pictureToPixelMap(ctx,image){

	const image_Width = image.width;
	const image_Height = image.height;

	ctx.clearRect(0,0,1500,1500);
	ctx.drawImage(image,0,0,image_Width, image_Height);
	let imageData = ctx.getImageData(0,0,image_Width, image_Height);
	let tempTwoDimensionsimageData = [];
	for(let j=0;j<image_Height;j++){
		tempTwoDimensionsimageData[j] = [];
		for(let i=0;i<image_Width;i++){
			let index = (i + j * image_Width) * 4;
			let data = [];
			data[RED] = imageData.data[index];
			data[GREEN] = imageData.data[index+1];
			data[BLUE] = imageData.data[index+2];
			data[ALPHA] = imageData.data[index+3];
			tempTwoDimensionsimageData[j][i] = data;
		}
	}
	return tempTwoDimensionsimageData;
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
	 if(startX > screen_size_w && endX > screen_size_w){
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
	//sortするのはY座標のみ
	let sortVerts = sort_Yindex(vertex_list);//ys
	let pt = sortVerts[0];
	let pm = sortVerts[1];
	let pb = sortVerts[2];

	scan_ShadowVertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb);		
}

//x,yの最初の初期値を０にするのはダメ差分を取るため。shadowMap用
function scan_ShadowVertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb){
	let topDistance = pb[1] - pt[1];
	//2以上は3角形
	if(topDistance == 0 || (topDistance == 1 && pb[1] == 0)
	|| (topDistance == 1 && pt[1] == screen_size_h-1)){
		let startY = pb[1];
		if(topDistance == 1 && pt[1] == screen_size_h-1){
			startY = screen_size_h-1;
		}
		
		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		
		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(;startX<endX;startX++){
			let z = zBufferingY[startX];
			if(z>startZ){
				zBufferingY[startX] = startZ;
			}
			startZ+=dz;
		}
		return;
	}
	if(topDistance == 1){
		let startY = pt[1];

		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(let j=0;j<=topDistance;j++){
			for(let i = startX;i<endX;i++){
				let z = zBufferingY[i];
				if(z>startZ){
					zBufferingY[i] = startZ;
				}
				startZ+=dz;
			}
			zBufferingY = zBuffering[startY++];	
		}
		return;
	}

	let mid = pm[position_Y];
	let drDeltaXZ = null;
	let dlDeltaXZ = null;
	//tmp[0]がpm[0]より大きい時の初期値
	let pl = branchNoY(pt,pb,mid);//pt->mid
	let pr;
	if(pl[0]>pm[0]){
		pr = pl;
		pl =  setVector2(pm[0],pm[2]);
        let er = vec3notYMinus(pb,pt);
        drDeltaXZ =  delta_Noy_xz(er,topDistance);
	}else{
		pr = setVector2(pm[0],pm[2]);
        let el = vec3notYMinus(pb,pt);
        dlDeltaXZ =  delta_Noy_xz(el,topDistance);
	}

	//mid=0はlowerで対応
    if(mid>0){//upper
		let triangleTop = pt[position_Y];
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec2NoYVec3Minus(pl,pt);//pt->pl
			let deltaY = mid - pt[1];
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec2NoYVec3Minus(pr,pt);//pt->pr
			let deltaY = mid - pt[1];
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
        //start position
        let sl = setVector2(pt[position_X],pt[position_Z]);
        let sr = setVector2(pt[position_X],pt[position_Z]);
		if(!(triangleEndXOver(sr,dr)) && !(triangleStartXOver(sl,dl,screen_size_w))){
			if(triangleTop<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(sl,dl,triangleTop);
				vec2OffsetMulAfterMinus(sr,dr,triangleTop);
				triangleTop = 0;
			}
			if(screen_size_h<mid)mid=screen_size_h;
			for(;triangleTop<mid;triangleTop++){
				//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_ShadowHorizontal(zBuffering,screen_size_w,triangleTop,startX,endX,startZ,endZ);					
				vec2Plus(sl,dl);//
				if(triangleStartXOver(sl,dl,screen_size_w)) break;
				vec2Plus(sr,dr);//
				if(triangleEndXOver(sr,dr)) break;
			}			
		}
    }
    if(mid<screen_size_h){//lower
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec3NoYVec2Minus(pb,pl);//pl->pb
			let deltaY = pb[1] - mid;
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec3NoYVec2Minus(pb,pr);//pr->pb
			let deltaY =  pb[1] - mid;
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
		if(!(triangleEndXOver(pr,dr)) && !(triangleStartXOver(pl,dl,screen_size_w))){
			if(mid<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(pl,dl,mid);
				vec2OffsetMulAfterMinus(pr,dr,mid);
				mid = 0;
			}
			let triangleBtm = pb[position_Y];
			if(screen_size_h<triangleBtm)triangleBtm=screen_size_h;	
			for(;mid<triangleBtm;mid++){
				//Y座標ごとの切片
				let startX = top_int(pl[0]);
				let endX = top_int(pr[0]);
				let startZ = pl[1];
				let endZ = pr[1];
				scan_ShadowHorizontal(zBuffering,screen_size_w,mid,startX,endX,startZ,endZ);
				//endX,startXが画面外でも増分では画面内に入ってくる。
				vec2Plus(pl,dl);//
				if(triangleStartXOver(pl,dl,screen_size_w)) break;
				vec2Plus(pr,dr);//
				if(triangleEndXOver(pr,dr)) break;
			}			
		}
    }
}

function scan_ShadowHorizontal(zBuffering,screen_size_w,y,startX,endX,startZ,endZ){

	let zStep = endZ - startZ;
	let xStep = endX - startX;

	if(screen_size_w<=endX)endX=screen_size_w-1;

	let dz = zStep/xStep;
	let zBufferingY = zBuffering[y];
	//Xが０未満でのｚ値の加算
	if(startX<0){
		//絶対値にしてる
		// let offset = -startX;
		// startZ += (offset * dz);
		startZ -= (startX * dz);
		startX = 0;
	}
	for(;startX<endX;startX++){
		let z = zBufferingY[startX];
		if(z>startZ){
			zBufferingY[startX] = startZ;
		}
		startZ+=dz;
	}
}
//x,yの最初の初期値を０にするのはダメ差分を取るため。基本ピクセルで処理が終わる思われるためif文は外してある。
function scan_NoTextureMappingVertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,imageData,mi,shadowFlag,lightShadowFlag,sunCosin){
	let topDistance = pb[1] - pt[1];
	//2以上は3角形
	if(topDistance == 0 || (topDistance == 1 && pb[1] == 0)
	|| (topDistance == 1 && pt[1] == screen_size_h-1)){
		let startY = pb[1];
		if(topDistance == 1 && pt[1] == screen_size_h-1){
			startY = screen_size_h-1;
		}

		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		
		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(;startX<endX;startX++){
			let z = zBufferingY[startX][0];
			if(z>startZ){
				let imageDataRGBA = imageData[mi[5]][mi[4]];
				zBufferingY[startX] = setPixel(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
					imageDataRGBA[BLUE],shadowFlag,lightShadowFlag,sunCosin);
			}
			startZ+=dz;
		}
		return;
	}
	if(topDistance == 1){
		let startY = pt[1];

		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(let j=0;j<=topDistance;j++){
			for(let i=startX;i<endX;i++){
				let z = zBufferingY[i];
				if(z>startZ){
					let imageDataRGBA = imageData[mi[5]][mi[4]];
					zBufferingY[i] = setPixel(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
						imageDataRGBA[BLUE],shadowFlag,lightShadowFlag,sunCosin);
				}
				startZ+=dz;
			}
			zBufferingY = zBuffering[startY++];	
		}
		return;
	}
	
	let mid = pm[position_Y];
	let drDeltaXZ = null;
	let dlDeltaXZ = null;
	//tmp[0]がpm[0]より大きい時の初期値
	let pl = branchNoY(pt,pb,mid);//pt->mid
	let pr;
	if(pl[0]>pm[0]){
		pr = pl;
		pl =  setVector2(pm[0],pm[2]);
        let er = vec3notYMinus(pb,pt);
        drDeltaXZ =  delta_Noy_xz(er,topDistance);
	}else{
		pr = setVector2(pm[0],pm[2]);
        let el = vec3notYMinus(pb,pt);
        dlDeltaXZ =  delta_Noy_xz(el,topDistance);
	}

	//mid=0はlowerで対応
    if(mid>0){//upper
		let triangleTop = pt[position_Y];
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec2NoYVec3Minus(pl,pt);//pt->pl
			let deltaY = mid - pt[1];
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec2NoYVec3Minus(pr,pt);//pt->pr
			let deltaY = mid - pt[1];
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
        //start position
        let sl = setVector2(pt[position_X],pt[position_Z]);
        let sr = setVector2(pt[position_X],pt[position_Z]);
		if(!(triangleEndXOver(sr,dr)) && !(triangleStartXOver(sl,dl,screen_size_w))){
			if(triangleTop<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(sl,dl,triangleTop);
				vec2OffsetMulAfterMinus(sr,dr,triangleTop);
				triangleTop = 0;
			}
			if(screen_size_h<mid)mid=screen_size_h;
			for(;triangleTop<mid;triangleTop++){
				//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_NoTextureMappingHorizontal(zBuffering,screen_size_w,triangleTop,startX,endX,startZ,endZ,imageData,mi,shadowFlag,lightShadowFlag,sunCosin);					
				vec2Plus(sl,dl);//
				if(triangleStartXOver(sl,dl,screen_size_w)) break;
				vec2Plus(sr,dr);//
				if(triangleEndXOver(sr,dr)) break;
			}			
		}	
    }
    if(mid<screen_size_h){//lower
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec3NoYVec2Minus(pb,pl);//pl->pb
			let deltaY = pb[1] - mid;
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec3NoYVec2Minus(pb,pr);//pr->pb
			let deltaY =  pb[1] - mid;
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
		if(!(triangleEndXOver(pr,dr)) && !(triangleStartXOver(pl,dl,screen_size_w))){
			if(mid<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(pl,dl,mid);
				vec2OffsetMulAfterMinus(pr,dr,mid);
				mid = 0;
			}
			let triangleBtm = pb[position_Y];
			if(screen_size_h<triangleBtm)triangleBtm=screen_size_h;	
			for(;mid<triangleBtm;mid++){
				//Y座標ごとの切片
				let startX = top_int(pl[0]);
				let endX = top_int(pr[0]);
				let startZ = pl[1];
				let endZ = pr[1];
				scan_NoTextureMappingHorizontal(zBuffering,screen_size_w,mid,startX,endX,startZ,endZ,imageData,mi,shadowFlag,lightShadowFlag,sunCosin);
				vec2Plus(pl,dl);//
				if(triangleStartXOver(pl,dl,screen_size_w)) break;
				vec2Plus(pr,dr);//	
				if(triangleEndXOver(pr,dr)) break;
			}			
		}	
    }
}
function scan_NoTextureMappingHorizontal(zBuffering,screen_size_w,y,startX,endX,startZ,endZ,imageData,mi,shadowFlag,lightShadowFlag,sunCosin){

	let zStep = endZ - startZ;
	let xStep = endX - startX;

	if(screen_size_w<=endX)endX=screen_size_w-1;

	let dz = zStep/xStep;
	let zBufferingY = zBuffering[y];
	//Xが０未満でのｚ値の加算
	if(startX<0){
		//絶対値にしてる
		// let offset = -startX;
		// startZ += (offset * dz);
		startZ -= (startX * dz);
		startX = 0;
	}
	for(;startX<endX;startX++){
		let z = zBufferingY[startX][0];
		if(z>startZ){
			let imageDataRGBA = imageData[mi[5]][mi[4]];
			zBufferingY[startX] = setPixel(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
				imageDataRGBA[BLUE],shadowFlag,lightShadowFlag,sunCosin);
		}
		startZ+=dz;
	}
}
//x,yの最初の初期値を０にするのはダメ差分を取るため。基本ピクセルで処理が終わる思われるためif文は外してある。
function scan_NoTextureMappingSunCosinVertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,imageData,mi){

	let topDistance = pb[1] - pt[1];
	//2以上は3角形
	if(topDistance == 0 || (topDistance == 1 && pb[1] == 0)
	|| (topDistance == 1 && pt[1] == screen_size_h-1)){
		let startY = pb[1];
		if(topDistance == 1 && pt[1] == screen_size_h-1){
			startY = screen_size_h-1;
		}

		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		
		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(;startX<endX;startX++){
			let z = zBufferingY[startX][0];
			if(z>startZ){
				let imageDataRGBA = imageData[mi[5]][mi[4]];
				zBufferingY[startX] = setPixelNoCrossWorldVector3(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
					imageDataRGBA[BLUE],false,false);
			}
			startZ+=dz;
		}
		return;
	}
	if(topDistance == 1){
		let startY = pt[1];
		let counter = -1;
		if(startY <0  && topDistance == 1){
			startY += 1;
			counter = 0;
		}
		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(let j=0;j<=topDistance;j++){
			for(let i = startX;i<endX;i++){
				let z = zBufferingY[i];
				if(z>startZ){
					let imageDataRGBA = imageData[mi[5]][mi[4]];
					zBufferingY[i] = setPixelNoCrossWorldVector3(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
						imageDataRGBA[BLUE],false,false);
				}
				startZ+=dz;
			}
			zBufferingY = zBuffering[startY++];	
		}
		return;
	}

	let mid = pm[position_Y];
	let drDeltaXZ = null;
	let dlDeltaXZ = null;
	//tmp[0]がpm[0]より大きい時の初期値
	let pl = branchNoY(pt,pb,mid);//pt->mid
	let pr;
	if(pl[0]>pm[0]){
		pr = pl;
		pl =  setVector2(pm[0],pm[2]);
        let er = vec3notYMinus(pb,pt);
        drDeltaXZ =  delta_Noy_xz(er,topDistance);
	}else{
		pr = setVector2(pm[0],pm[2]);
        let el = vec3notYMinus(pb,pt);
        dlDeltaXZ =  delta_Noy_xz(el,topDistance);
	}

	//mid=0はlowerで対応
    if(mid>0){//upper
		let triangleTop = pt[position_Y];
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec2NoYVec3Minus(pl,pt);//pt->pl
			let deltaY = mid - pt[1];
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec2NoYVec3Minus(pr,pt);//pt->pr
			let deltaY = mid - pt[1];
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
        //start position
        let sl = setVector2(pt[position_X],pt[position_Z]);
        let sr = setVector2(pt[position_X],pt[position_Z]);
		if(!(triangleEndXOver(sr,dr)) && !(triangleStartXOver(sl,dl,screen_size_w))){
			if(triangleTop<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(sl,dl,triangleTop);
				vec2OffsetMulAfterMinus(sr,dr,triangleTop);
				triangleTop = 0;
			}
			if(screen_size_h<mid)mid=screen_size_h;
			for(;triangleTop<mid;triangleTop++){
				//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_NoTextureMappingSunCosinHorizontal(zBuffering,screen_size_w,triangleTop,startX,endX,startZ,endZ,imageData,mi);					
				vec2Plus(sl,dl);//
				if(triangleStartXOver(sl,dl,screen_size_w)) break;
				vec2Plus(sr,dr);//
				if(triangleEndXOver(sr,dr)) break;
			}			
		}
    }
    if(mid<screen_size_h){//lower
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec3NoYVec2Minus(pb,pl);//pl->pb
			let deltaY = pb[1] - mid;
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec3NoYVec2Minus(pb,pr);//pr->pb
			let deltaY =  pb[1] - mid;
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
		if(!(triangleEndXOver(pr,dr)) && !(triangleStartXOver(pl,dl,screen_size_w))){
			if(mid<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(pl,dl,mid);
				vec2OffsetMulAfterMinus(pr,dr,mid);
				mid = 0;
			}
			let triangleBtm = pb[position_Y];
			if(screen_size_h<triangleBtm)triangleBtm=screen_size_h;	
			for(;mid<triangleBtm;mid++){
				//Y座標ごとの切片
				let startX = top_int(pl[0]);
				let endX = top_int(pr[0]);
				let startZ = pl[1];
				let endZ = pr[1];
				scan_NoTextureMappingSunCosinHorizontal(zBuffering,screen_size_w,mid,startX,endX,startZ,endZ,imageData,mi);
				vec2Plus(pl,dl);//
				if(triangleStartXOver(pl,dl,screen_size_w)) break;
				vec2Plus(pr,dr);//
				if(triangleEndXOver(pr,dr)) break;
			}			
		}	
    }
}
function scan_NoTextureMappingSunCosinHorizontal(zBuffering,screen_size_w,y,startX,endX,startZ,endZ,imageData,mi){

	let zStep = endZ - startZ;
	let xStep = endX - startX;

	if(screen_size_w<=endX)endX=screen_size_w-1;

	let dz = zStep/xStep;
	let zBufferingY = zBuffering[y];
	//Xが０未満でのｚ値の加算
	if(startX<0){
		//絶対値にしてる
		// let offset = -startX;
		// startZ += (offset * dz);
		startZ -= (startX * dz);
		startX = 0;
	}
	for(;startX<endX;startX++){
		let z = zBufferingY[startX][0];
		if(z>startZ){
			let imageDataRGBA = imageData[mi[5]][mi[4]];
			zBufferingY[startX] = setPixelNoCrossWorldVector3(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
				imageDataRGBA[BLUE],false,false);
		}
		startZ+=dz;
	}
}
//texturepaint
//x,yの最初の初期値を０にするのはダメ差分を取るため。
function scan_verticalNoSunCosin(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,inv_a,inv_c,inv_b,inv_d,tmpOrgyef,tmpOrgxef,imageData,imageHeight,imageWidth){
	let topDistance = pb[1] - pt[1];
	//2以上は3角形
	if(topDistance == 0 || (topDistance == 1 && pb[1] == 0)
	|| (topDistance == 1 && pt[1] == screen_size_h-1)){
		let startY = pb[1];
		if(topDistance == 1 && pt[1] == screen_size_h-1){
			startY = screen_size_h-1;
		}

		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		let tmpOrgy = startY * inv_d + tmpOrgyef;
		let tmpOrgx = startY * inv_c + tmpOrgxef;

		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(;startX<endX;startX++){
			let z = zBufferingY[startX][0];
			if(z>startZ){
					// if(tmpOrgy == null){
			// 	tmpOrgy = y * iA[3] + tmpOrgyef;
			// 	tmpOrgx = y * iA[1] + tmpOrgxef;
			// }

			/* 元画像における縦方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			let selectOrgy = tmpOrgy + startX * inv_b;
			/* アフィン後の座標に対応した元画像の座標 超重要な式 */
			//let selectOrgy = startX * iA[2] + y * iA[3]
			//- e * iA[2] - f * iA[3];// +  orgTexture[Image_Height] / 2;

			if(selectOrgy != imageHeight-1 || selectOrgy != 0){
				/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
				if(selectOrgy > imageHeight-1){
					selectOrgy = imageHeight-1;
				}else if(selectOrgy < 0){
					selectOrgy = 0;
				}else{
					/* 最近傍補間した元画像の座標 */
					selectOrgy |= 0;
				}					
			}			
			
			/* 元画像における横方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			let selectOrgx = tmpOrgx + startX * inv_a;
			/* アフィン後の座標に対応した元画像の座標 超重要な式*/
			//let selectOrgx = startX * iA[0] + y * iA[1]
			//	- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

			if(selectOrgx != imageWidth-1 || selectOrgx != 0){
				/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
				if(selectOrgx > imageWidth-1){
					selectOrgx = imageWidth-1;
				}else if(selectOrgx < 0){
					selectOrgx = 0;
				}else{
					/* 最近傍補間した元画像の座標 */
					selectOrgx |= 0;
				}				
			}				
			
			//zBuffering[y][startX].splice(0,1,setPixel(startZ,imageData.data[index],imageData.data[index + 1],imageData.data[index + 2],imageData.data[index + 3],crossWorldVector3))
			let imageDataRGBA = imageData[selectOrgy][selectOrgx];
			zBufferingY[startX] = setPixelNoCrossWorldVector3(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
				imageDataRGBA[BLUE],false,false);
			}
			startZ+=dz;
		}
		return;
	}
	if(topDistance == 1){
		let startY = pt[1];
	
		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		let tmpOrgy = startY * inv_d + tmpOrgyef;
		let tmpOrgx = startY * inv_c + tmpOrgxef;

		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(let j=0;j<=topDistance;j++){
			for(let i = startX;i<endX;i++){
				let z = zBufferingY[i][0];
				if(z>startZ){
				// if(tmpOrgy == null){
				// 	tmpOrgy = y * iA[3] + tmpOrgyef;
				// 	tmpOrgx = y * iA[1] + tmpOrgxef;
				// }

				/* 元画像における縦方向座標を計算 */
				/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
				let selectOrgy = tmpOrgy + i * inv_b;
				/* アフィン後の座標に対応した元画像の座標 超重要な式 */
				//let selectOrgy = startX * iA[2] + y * iA[3]
				//- e * iA[2] - f * iA[3];// +  orgTexture[Image_Height] / 2;

				if(selectOrgy != imageHeight-1 || selectOrgy != 0){
					/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
					if(selectOrgy > imageHeight-1){
						selectOrgy = imageHeight-1;
					}else if(selectOrgy < 0){
						selectOrgy = 0;
					}else{
						/* 最近傍補間した元画像の座標 */
						selectOrgy |= 0;
					}					
				}			
				
				/* 元画像における横方向座標を計算 */
				/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
				let selectOrgx = tmpOrgx + i * inv_a;
				/* アフィン後の座標に対応した元画像の座標 超重要な式*/
				//let selectOrgx = startX * iA[0] + y * iA[1]
				//	- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

				if(selectOrgx != imageWidth-1 || selectOrgx != 0){
					/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
					if(selectOrgx > imageWidth-1){
						selectOrgx = imageWidth-1;
					}else if(selectOrgx < 0){
						selectOrgx = 0;
					}else{
						/* 最近傍補間した元画像の座標 */
						selectOrgx |= 0;
					}				
				}				
				//zBuffering[y][startX].splice(0,1,setPixel(startZ,imageData.data[index],imageData.data[index + 1],imageData.data[index + 2],imageData.data[index + 3],crossWorldVector3))
				let imageDataRGBA = imageData[selectOrgy][selectOrgx];
				zBufferingY[i] = setPixelNoCrossWorldVector3(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
					imageDataRGBA[BLUE],false,false);
				}
				startZ+=dz;
			}
			zBufferingY = zBuffering[startY++];				
		}
		return;
	}
	let mid = pm[1];
	let drDeltaXZ = null;
	let dlDeltaXZ = null;
	//tmp[0]がpm[0]より大きい時の初期値
	let pl = branchNoY(pt,pb,mid);//pt->mid
	let pr;
	if(pl[0]>pm[0]){
		pr = pl;
		pl =  setVector2(pm[0],pm[2]);
        let er = vec3notYMinus(pb,pt);
        drDeltaXZ =  delta_Noy_xz(er,topDistance);
	}else{
		pr = setVector2(pm[0],pm[2]);
        let el = vec3notYMinus(pb,pt);
        dlDeltaXZ =  delta_Noy_xz(el,topDistance);
	}

	//mid=0はlowerで対応
    if(mid>0){//upper
		let triangleTop = pt[position_Y];
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec2NoYVec3Minus(pl,pt);//pt->pl
			let deltaY = mid - pt[1];
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec2NoYVec3Minus(pr,pt);//pt->pr
			let deltaY = mid - pt[1];
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
        //start position
        let sl = setVector2(pt[position_X],pt[position_Z]);
        let sr = setVector2(pt[position_X],pt[position_Z]);
		if(!(triangleEndXOver(sr,dr)) && !(triangleStartXOver(sl,dl,screen_size_w))){
			if(triangleTop<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(sl,dl,triangleTop);
				vec2OffsetMulAfterMinus(sr,dr,triangleTop);
				triangleTop = 0;
			}
			if(screen_size_h<mid)mid=screen_size_h;
			let tmpOrgy = triangleTop * inv_d + tmpOrgyef;
			let tmpOrgx = triangleTop * inv_c + tmpOrgxef;
			for(;triangleTop<mid;triangleTop++){
				//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_horizontalNoSunCosin(zBuffering,screen_size_w,triangleTop,tmpOrgy,tmpOrgx,startX,endX,startZ,endZ,inv_a,inv_b,imageData,imageHeight,imageWidth);
				vec2Plus(sl,dl);//
				//endX,startXが画面外でも増分では画面内に入ってくる。
				if(triangleStartXOver(sl,dl,screen_size_w)) break;
				vec2Plus(sr,dr);//
				if(triangleEndXOver(sr,dr)) break;
				tmpOrgy += inv_d;
				tmpOrgx += inv_c;
			}
		}
    }
    if(mid<screen_size_h){//lower
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec3NoYVec2Minus(pb,pl);//pl->pb
			let deltaY = pb[1] - mid;
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec3NoYVec2Minus(pb,pr);//pr->pb
			let deltaY =  pb[1] - mid;
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
		if(!(triangleEndXOver(pr,dr)) && !(triangleStartXOver(pl,dl,screen_size_w))){
			if(mid<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(pl,dl,mid);
				vec2OffsetMulAfterMinus(pr,dr,mid);
				mid = 0;
			}
			let triangleBtm = pb[1];
			if(screen_size_h<triangleBtm)triangleBtm=screen_size_h;
			let tmpOrgy = mid * inv_d + tmpOrgyef;
			let tmpOrgx = mid * inv_c + tmpOrgxef;
			for(;mid<triangleBtm;mid++){
				//Y座標ごとの切片
				let startX = top_int(pl[0]);
				let endX = top_int(pr[0]);
				let startZ = pl[1];
				let endZ = pr[1];
				scan_horizontalNoSunCosin(zBuffering,screen_size_w,mid,tmpOrgy,tmpOrgx,startX,endX,startZ,endZ,inv_a,inv_b,imageData,imageHeight,imageWidth);
				vec2Plus(pl,dl);//
				//endX,startXが画面外でも増分では画面内に入ってくる。
				if(triangleStartXOver(pl,dl,screen_size_w)) break;
				vec2Plus(pr,dr);//
				if(triangleEndXOver(pr,dr)) break;
				tmpOrgy += inv_d;
				tmpOrgx += inv_c;	
			}	
		}
    }
}

function triangleEndXOver(pr,dr){
	if(pr[0]<0 && dr[0]<=0){				
		 return true;
	}
}
function triangleStartXOver(pl,dl,screen_size_w){
	if(pl[0]>screen_size_w && dl[0]>=0){			
		 return true;
	}
}

function scan_horizontalNoSunCosin(zBuffering,screen_size_w,y,tmpOrgy,tmpOrgx,startX,endX,startZ,endZ,iA_0,iA_2,imageData,imageHeight,imageWidth){

	//アフィン変換の平行移動ベクトル
	//縦移動、transform関数のf
	//横移動、transform関数のe
    //if(l<0)l=0;
	let zStep = endZ - startZ;
	let xStep = endX - startX;

    if(screen_size_w<=endX)endX=screen_size_w-1;

	let dz = zStep/xStep;
	let zBufferingY = zBuffering[y];
	//Xが０未満でのｚ値の加算
	if(startX<0){
		//絶対値にしてる
		// let offset = -startX;
		// startZ += (offset * dz);
		startZ -= (startX * dz);
		startX = 0;
	}
	for(;startX<=endX;startX++){
		let z = zBufferingY[startX][0];
			if(z>startZ){
				// if(tmpOrgy == null){
				// 	tmpOrgy = y * iA[3] + tmpOrgyef;
				// 	tmpOrgx = y * iA[1] + tmpOrgxef;
				// }

				/* 元画像における縦方向座標を計算 */
				/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
				let selectOrgy = tmpOrgy + startX * iA_2;
				/* アフィン後の座標に対応した元画像の座標 超重要な式 */
				//let selectOrgy = startX * iA[2] + y * iA[3]
				//- e * iA[2] - f * iA[3];// +  orgTexture[Image_Height] / 2;

				if(selectOrgy != imageHeight-1 || selectOrgy != 0){
					/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
					if(selectOrgy > imageHeight-1){
						selectOrgy = imageHeight-1;
					}else if(selectOrgy < 0){
						selectOrgy = 0;
					}else{
						/* 最近傍補間した元画像の座標 */
						selectOrgy |= 0;
					}					
				}			
				
				/* 元画像における横方向座標を計算 */
				/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
				let selectOrgx = tmpOrgx + startX * iA_0;
				/* アフィン後の座標に対応した元画像の座標 超重要な式*/
				//let selectOrgx = startX * iA[0] + y * iA[1]
				//	- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

				if(selectOrgx != imageWidth-1 || selectOrgx != 0){
					/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
					if(selectOrgx > imageWidth-1){
						selectOrgx = imageWidth-1;
					}else if(selectOrgx < 0){
						selectOrgx = 0;
					}else{
						/* 最近傍補間した元画像の座標 */
						selectOrgx |= 0;
					}				
				}				
				
				//zBuffering[y][startX].splice(0,1,setPixel(startZ,imageData.data[index],imageData.data[index + 1],imageData.data[index + 2],imageData.data[index + 3],crossWorldVector3))
				let imageDataRGBA = imageData[selectOrgy][selectOrgx];
				zBufferingY[startX] = setPixelNoCrossWorldVector3(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
					imageDataRGBA[BLUE],false,false);

			}
		startZ+=dz;	
	}
}

//x,yの最初の初期値を０にするのはダメ差分を取るため。
function scan_vertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,inv_a,inv_c,inv_b,inv_d,tmpOrgyef,tmpOrgxef,imageData,imageHeight,imageWidth,shadowFlag,lightShadowFlag,sunCosin){
	let topDistance = pb[1] - pt[1];
	//2以上は3角形
	if(topDistance == 0 || (topDistance == 1 && pb[1] == 0)
	|| (topDistance == 1 && pt[1] == screen_size_h-1)){
		let startY = pb[1];
		if(topDistance == 1 && pt[1] == screen_size_h-1){
			startY = screen_size_h-1;
		}

		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		let tmpOrgy = startY * inv_d + tmpOrgyef;
		let tmpOrgx = startY * inv_c + tmpOrgxef;

		let zStep = endZ - startZ;
		let xStep = endX - startX;
	
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(;startX<endX;startX++){
			let z = zBufferingY[startX][0];
			if(z>startZ){
					// if(tmpOrgy == null){
			// 	tmpOrgy = y * iA[3] + tmpOrgyef;
			// 	tmpOrgx = y * iA[1] + tmpOrgxef;
			// }

			/* 元画像における縦方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			let selectOrgy = tmpOrgy + startX * inv_b;
			/* アフィン後の座標に対応した元画像の座標 超重要な式 */
			//let selectOrgy = startX * iA[2] + y * iA[3]
			//- e * iA[2] - f * iA[3];// +  orgTexture[Image_Height] / 2;

			if(selectOrgy != imageHeight-1 || selectOrgy != 0){
				/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
				if(selectOrgy > imageHeight-1){
					selectOrgy = imageHeight-1;
				}else if(selectOrgy < 0){
					selectOrgy = 0;
				}else{
					/* 最近傍補間した元画像の座標 */
					selectOrgy |= 0;
				}					
			}			
			
			/* 元画像における横方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			let selectOrgx = tmpOrgx + startX * inv_a;
			/* アフィン後の座標に対応した元画像の座標 超重要な式*/
			//let selectOrgx = startX * iA[0] + y * iA[1]
			//	- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

			if(selectOrgx != imageWidth-1 || selectOrgx != 0){
				/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
				if(selectOrgx > imageWidth-1){
					selectOrgx = imageWidth-1;
				}else if(selectOrgx < 0){
					selectOrgx = 0;
				}else{
					/* 最近傍補間した元画像の座標 */
					selectOrgx |= 0;
				}				
			}				
			
			//zBuffering[y][startX].splice(0,1,setPixel(startZ,imageData.data[index],imageData.data[index + 1],imageData.data[index + 2],imageData.data[index + 3],crossWorldVector3))
			let imageDataRGBA = imageData[selectOrgy][selectOrgx];
			zBufferingY[startX] = setPixel(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
				imageDataRGBA[BLUE],shadowFlag,lightShadowFlag,sunCosin);
			}
			startZ+=dz;
		}
		return;
	}
	if(topDistance == 1){
		let startY = pt[1];
	
		let startX = pt[0];
		let startZ = pt[2];
		if(startX>pm[0]){
			startX = pm[0];
			startZ = pm[2];
		}
		if(startX>pb[0]){
			startX = pb[0];
			startZ = pb[2];
		}
		let endX = pt[0];
		let endZ = pt[2];
		if(endX<pm[0]){
			endX = pm[0];
			endZ = pm[2];
		}
		if(endX<pb[0]){
			endX = pb[0];
			endZ = pb[2];
		}
		let tmpOrgy = startY * inv_d + tmpOrgyef;
		let tmpOrgx = startY * inv_c + tmpOrgxef;

		let zStep = endZ - startZ;
		let xStep = endX - startX;
		
		if(screen_size_w<=endX)endX=screen_size_w-1;
	
		let dz = zStep/xStep;
		let zBufferingY = zBuffering[startY];
		//Xが０未満でのｚ値の加算
		if(startX<0){
			//絶対値にしてる
			// let offset = -startX;
			// startZ += (offset * dz);
			startZ -= (startX * dz);
			startX = 0;
		}
		for(let j=0;j<=topDistance;j++){
			for(let i = startX;i<endX;i++){
				let z = zBufferingY[i][0];
				if(z>startZ){
				// if(tmpOrgy == null){
				// 	tmpOrgy = y * iA[3] + tmpOrgyef;
				// 	tmpOrgx = y * iA[1] + tmpOrgxef;
				// }

				/* 元画像における縦方向座標を計算 */
				/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
				let selectOrgy = tmpOrgy + i * inv_b;
				/* アフィン後の座標に対応した元画像の座標 超重要な式 */
				//let selectOrgy = startX * iA[2] + y * iA[3]
				//- e * iA[2] - f * iA[3];// +  orgTexture[Image_Height] / 2;

				if(selectOrgy != imageHeight-1 || selectOrgy != 0){
					/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
					if(selectOrgy > imageHeight-1){
						selectOrgy = imageHeight-1;
					}else if(selectOrgy < 0){
						selectOrgy = 0;
					}else{
						/* 最近傍補間した元画像の座標 */
						selectOrgy |= 0;
					}					
				}			
				
				/* 元画像における横方向座標を計算 */
				/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
				let selectOrgx = tmpOrgx + i * inv_a;
				/* アフィン後の座標に対応した元画像の座標 超重要な式*/
				//let selectOrgx = startX * iA[0] + y * iA[1]
				//	- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

				if(selectOrgx != imageWidth-1 || selectOrgx != 0){
					/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
					if(selectOrgx > imageWidth-1){
						selectOrgx = imageWidth-1;
					}else if(selectOrgx < 0){
						selectOrgx = 0;
					}else{
						/* 最近傍補間した元画像の座標 */
						selectOrgx |= 0;
					}				
				}				
				//zBuffering[y][startX].splice(0,1,setPixel(startZ,imageData.data[index],imageData.data[index + 1],imageData.data[index + 2],imageData.data[index + 3],crossWorldVector3))
				let imageDataRGBA = imageData[selectOrgy][selectOrgx];
				zBufferingY[i] = setPixel(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
					imageDataRGBA[BLUE],shadowFlag,lightShadowFlag,sunCosin);
				}
				startZ+=dz;
			}
			zBufferingY = zBuffering[startY++];				
		}
		return;
	}

	let mid = pm[1];
	let drDeltaXZ = null;
	let dlDeltaXZ = null;
	//tmp[0]がpm[0]より大きい時の初期値
	let pl = branchNoY(pt,pb,mid);//pt->mid
	let pr;
	if(pl[0]>pm[0]){
		pr = pl;
		pl =  setVector2(pm[0],pm[2]);
        let er = vec3notYMinus(pb,pt);
        drDeltaXZ =  delta_Noy_xz(er,topDistance);
	}else{
		pr = setVector2(pm[0],pm[2]);
        let el = vec3notYMinus(pb,pt);
        dlDeltaXZ =  delta_Noy_xz(el,topDistance);
	}

	//mid=0はlowerで対応
    if(mid>0){//upper
		let triangleTop = pt[position_Y];
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec2NoYVec3Minus(pl,pt);//pt->pl
			let deltaY = mid - pt[1];
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec2NoYVec3Minus(pr,pt);//pt->pr
			let deltaY = mid - pt[1];
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
        //start position
        let sl = setVector2(pt[position_X],pt[position_Z]);
        let sr = setVector2(pt[position_X],pt[position_Z]);
		if(!(triangleEndXOver(sr,dr)) && !(triangleStartXOver(sl,dl,screen_size_w))){
			if(triangleTop<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(sl,dl,triangleTop);
				vec2OffsetMulAfterMinus(sr,dr,triangleTop);
				triangleTop = 0;
			}
			if(screen_size_h<mid)mid=screen_size_h;
			let tmpOrgy = triangleTop * inv_d + tmpOrgyef;
			let tmpOrgx = triangleTop * inv_c + tmpOrgxef;
			for(;triangleTop<mid;triangleTop++){
				//Y座標ごとの切片
				let startX = top_int(sl[0]);
				let endX = top_int(sr[0]);
				let startZ = sl[1];
				let endZ = sr[1];
				scan_horizontal(zBuffering,screen_size_w,triangleTop,tmpOrgy,tmpOrgx,startX,endX,startZ,endZ,inv_a,inv_b,imageData,imageHeight,imageWidth,shadowFlag,lightShadowFlag,sunCosin);
				vec2Plus(sl,dl);//
				//endX,startXが画面外でも増分では画面内に入ってくる。
				if(triangleStartXOver(sl,dl,screen_size_w)) break;
				vec2Plus(sr,dr);//
				if(triangleEndXOver(sr,dr)) break;
				tmpOrgy += inv_d;
				tmpOrgx += inv_c;		
			}			
		}
    }
    if(mid<screen_size_h){//lower
		let dl,dr;
		if(drDeltaXZ != null){
			let el = vec3NoYVec2Minus(pb,pl);//pl->pb
			let deltaY = pb[1] - mid;
			dl = delta_Noy_xz(el,deltaY);
			dr = drDeltaXZ;
		}
		if(dlDeltaXZ != null){
			let er = vec3NoYVec2Minus(pb,pr);//pr->pb
			let deltaY =  pb[1] - mid;
			dr = delta_Noy_xz(er,deltaY);
			dl = dlDeltaXZ;
		}
		if(!(triangleEndXOver(pr,dr)) && !(triangleStartXOver(pl,dl,screen_size_w))){
			if(mid<0){
				//horizonのXのoffsetと同じ考え方。
				vec2OffsetMulAfterMinus(pl,dl,mid);
				vec2OffsetMulAfterMinus(pr,dr,mid);
				mid = 0;
			}
			let triangleBtm = pb[1];
			if(screen_size_h<triangleBtm)triangleBtm=screen_size_h;
			let tmpOrgy = mid * inv_d + tmpOrgyef;
			let tmpOrgx = mid * inv_c + tmpOrgxef;
			for(;mid<triangleBtm;mid++){
				//Y座標ごとの切片
				let startX = top_int(pl[0]);
				let endX = top_int(pr[0]);
				let startZ = pl[1];
				let endZ = pr[1];
				scan_horizontal(zBuffering,screen_size_w,mid,tmpOrgy,tmpOrgx,startX,endX,startZ,endZ,inv_a,inv_b,imageData,imageHeight,imageWidth,shadowFlag,lightShadowFlag,sunCosin);
				vec2Plus(pl,dl);//
				//endX,startXが画面外でも増分では画面内に入ってくる。
				if(triangleStartXOver(pl,dl,screen_size_w)) break;
				vec2Plus(pr,dr);//
				if(triangleEndXOver(pr,dr)) break;
				tmpOrgy += inv_d;
				tmpOrgx += inv_c;						
			}	
		}
    }
}

function scan_horizontal(zBuffering,screen_size_w,y,tmpOrgy,tmpOrgx,startX,endX,startZ,endZ,iA_0,iA_2,imageData,imageHeight,imageWidth,shadowFlag,lightShadowFlag,sunCosin){

	//アフィン変換の平行移動ベクトル
	//縦移動、transform関数のf
	//横移動、transform関数のe

	//if(l<0)l=0;
	let zStep = endZ - startZ;
	let xStep = endX - startX;

	if(screen_size_w<=endX)endX=screen_size_w-1;

	let dz = zStep/xStep;
	let zBufferingY = zBuffering[y];
	//Xが０未満でのｚ値の加算
	if(startX<0){
		// let offset = -startX;
		// startZ += (offset * dz);
		startZ -= (startX * dz);
		startX = 0;
	}
	for(;startX<=endX;startX++){
		let z = zBufferingY[startX][0];
		if(z>startZ){
			// if(tmpOrgy == null){
			// 	tmpOrgy = y * iA[3] + tmpOrgyef;
			// 	tmpOrgx = y * iA[1] + tmpOrgxef;
			// }

			/* 元画像における縦方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			let selectOrgy = tmpOrgy + startX * iA_2;
			/* アフィン後の座標に対応した元画像の座標 超重要な式 */
			//let selectOrgy = startX * iA[2] + y * iA[3]
			//- e * iA[2] - f * iA[3];// +  orgTexture[Image_Height] / 2;
			if(selectOrgy != imageHeight-1 || selectOrgy != 0){
				/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
				if(selectOrgy > imageHeight-1){
					selectOrgy = imageHeight-1;
				}else if(selectOrgy < 0){
					selectOrgy = 0;
				}else{
					/* 最近傍補間した元画像の座標 */
					selectOrgy |= 0;
				}					
			}
			/* 元画像における横方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			let selectOrgx = tmpOrgx + startX * iA_0;
			/* アフィン後の座標に対応した元画像の座標 超重要な式*/
			//let selectOrgx = startX * iA[0] + y * iA[1]
			//	- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

			if(selectOrgx != imageWidth-1 || selectOrgx != 0){
				/* 元画像をはみ出る画素の場合ラスタライズは端のピクセルを頂く */
				if(selectOrgx > imageWidth-1){
					selectOrgx = imageWidth-1;
				}else if(selectOrgx < 0){
					selectOrgx = 0;
				}else{
					/* 最近傍補間した元画像の座標 */
					selectOrgx |= 0;
				}				
			}
			//zBuffering[y][startX].splice(0,1,setPixel(startZ,imageData.data[index],imageData.data[index + 1],imageData.data[index + 2],imageData.data[index + 3],crossWorldVector3))
			let imageDataRGBA = imageData[selectOrgy][selectOrgx];
			zBufferingY[startX] = setPixel(startZ,imageDataRGBA[RED],imageDataRGBA[GREEN],
				imageDataRGBA[BLUE],shadowFlag,lightShadowFlag,sunCosin);

		}
		startZ+=dz;	
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
			baseAffinedX = affinedX;// - affinedTexture[Image_Width] / 2;

			/* 元画像における横方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			selectOrgx = baseAffinedX * iA[0] + baseAffinedY * iA[1]
				- e * iA[0] - f * iA[1];// + orgTexture[0].length / 2;

			/* 最近傍補間小数点の画像が無いので四捨五入して適当な近くのピクセルを頂く */
			orgx= Math.floor(selectOrgx + 0.5); 

			/* 元画像をはみ出る画素の場合ははみ出る前の前のピクセルを詰める */
			if(orgx >= orgTexture[Image_Width]){
				orgx = orgTexture[Image_Width] -1;
			}if(orgx < 0){
				orgx = 0;
			}
			
			/* 元画像における縦方向座標を計算 */
			/* 座標変換を行ってから原点(width / 2, height / 2)基準の値に変換 */
			selectOrgy = baseAffinedX * iA[2] + baseAffinedY * iA[3]
				- e * iA[2] - f * iA[3];// +  orgTexture[Image_Height] / 2;
			/* 最近傍補間小数点の画像が無いので四捨五入して適当な近くのピクセルを頂く */
			orgy = Math.floor(selectOrgy + 0.5);
			
			/* 元画像をはみ出る画素の場合ははみ出る前のピクセルを詰める */
			if(orgy >=  orgTexture[Image_Height]){
				orgy = orgTexture[Image_Height] -1;
			}if(orgy < 0){
				orgy = 0;
			}
			let pixelZ = parseFloat(startZ)+offsetXZ*Math.abs(affinedX-currentMinX);	
	    	//バッファに登録
			if(renderZBuffer[affinedY][affinedX].get().getPixel().z>=pixelZ){
				let index = (orgx + orgy * orgTexture[Image_Width]) * 4;
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
export function triangleToBuffer(zBuffering,imageData,vertex_list,crossWorldVector3,mi,sunVec,shadowFlag,lightShadowFlag,screen_size_h,screen_size_w)
{
	//sortするのはY座標のみ
	let sortVerts = sort_Yindex(vertex_list);
	let pt = sortVerts[0];
	let pm = sortVerts[1];
	let pb = sortVerts[2];
	
	let _Ax = vertex_list[1][0] - vertex_list[0][0];
	let _Ay = vertex_list[1][1] - vertex_list[0][1];
	let _Bx = vertex_list[2][0] - vertex_list[0][0];
	let _By = vertex_list[2][1] - vertex_list[0][1];

	//アフィン変換の基定ベクトル、元画像を抽出するためのベクトル
	let a = mi[0][0] * _Ax + mi[0][1] * _Bx;
	let c = mi[1][0] * _Ax + mi[1][1] * _Bx;

	let b = mi[0][0] * _Ay + mi[0][1] * _By;
	let d = mi[1][0] * _Ay + mi[1][1] * _By;

	//逆行列のad-bc
	let ad = a*d;
	let cb = c*b;
	
	if(ad == cb) {
		if(shadowFlag == true){
			let sunCosin = culVecDot(sunVec, crossWorldVector3)*1.5;//1.5掛けるのは明るさの調節
			scan_NoTextureMappingVertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,imageData,mi,true,lightShadowFlag,sunCosin)
		}else{
			scan_NoTextureMappingSunCosinVertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,imageData,mi);
		} 
	}else{
		let inv_det = 1.0/(ad - cb);
		//acbdの逆行列
		let inv_a = d * inv_det;
		let inv_c = - c * inv_det;
		let inv_b = - b * inv_det;
		let inv_d = a * inv_det;
		// let h = vertex_list[0][1] - (b * uv_list[0] * imageData[Image_Width] + d * uv_list[1] * imageData[Image_Height]);
		// let w = vertex_list[0][0] - (a * uv_list[0] * imageData[Image_Width] + c * uv_list[1] * imageData[Image_Height]);
		let f = vertex_list[0][1] - (b * mi[2] + d * mi[3]);
		let e = vertex_list[0][0] - (a * mi[2] + c * mi[3]);
		let tmpOrgyef =  - (e * inv_b) - f * inv_d;
		let tmpOrgxef =  - (e * inv_a) - f * inv_c;
		let imageHeight = imageData.length;
		let imageWidth = imageData[1].length;
		if(shadowFlag == true){
			let sunCosin = culVecDot(sunVec, crossWorldVector3)*1.5;//1.5掛けるのは明るさの調節
			scan_vertical(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,inv_a,inv_c,inv_b,inv_d,tmpOrgyef,tmpOrgxef,imageData,imageHeight,imageWidth,true,lightShadowFlag,sunCosin);
		}else{
			scan_verticalNoSunCosin(zBuffering,screen_size_h,screen_size_w,pt,pm,pb,inv_a,inv_c,inv_b,inv_d,tmpOrgyef,tmpOrgxef,imageData,imageHeight,imageWidth);
		}
	}
}