import {M22, drawTriangle} from './texture.mjs';
import {rgCubeVerts,rgPlaneVerts,orgPlaneVerts, orgCubeVerts} from './orgverts.mjs';
import {renderBuffer,pixel,bufferPixelInit,bufferInit,pictureToPixelMap,dotPaint,dotLineBufferRegister,triangleRasterize,textureTransform,triangleToBuffer} from './paint.mjs';

const SCREEN_SIZE_W = 1000;
const SCREEN_SIZE_H = 800;

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
c.width = SCREEN_SIZE_W;
c.height = SCREEN_SIZE_H;

var canvas = document.getElementById('backmyCanvas');
var backCtx = canvas.getContext('2d');
canvas.width = SCREEN_SIZE_W*5;
canvas.height = SCREEN_SIZE_H*7;

class Matrix{
	constructor(){
    this._11 = 1,this._12 = 0, this._13 = 0,this._14 = 0,
    this._21 = 0,this._22 = 1, this._23 = 0,this._24 = 0,
    this._31 = 0,this._32 = 0, this._33 = 1,this._34 = 0,
    this._41 = 0,this._42 = 0, this._43 = 0,this._44 = 1;
 	}
 	identity(){
    this._11 = 1,this._12 = 0, this._13 = 0,this._14 = 0,
    this._21 = 0,this._22 = 1, this._23 = 0,this._24 = 0,
    this._31 = 0,this._32 = 0, this._33 = 1,this._34 = 0,
    this._41 = 0,this._42 = 0, this._43 = 0,this._44 = 1;
 	
 	}
 	mulTranslate(x,y,z){
		this._14 += this._11 * x + this._12 * y + this._13 * z;
		this._24 += this._21 * x + this._22 * y + this._23 * z;
		this._34 += this._31 * x + this._32 * y + this._33 * z;
	}
	mulScaling(x,y,z){
		this._11 *= x;    this._12 *= y;    this._13 *= z;
		this._21 *= x;    this._22 *= y;    this._23 *= z;
		this._31 *= x;    this._32 *= y;    this._33 *= z;
	}
	mulRotateX(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    let tmp;
    //1行目
    tmp = this._12 * c + this._13 * s;
    _13 = this._12 * -s + this._13 * c;
    _12 = tmp;
    //2行目
    tmp = this._22 * c + this._23 * s;
    _23 = this._22 * -s + this._23 * c;
    _22 = tmp;
    //3行目
    tmp = this._32 * c + this._33 * s;
    _33 = this._32 * -s + this._33 * c;
    _32 = tmp;
	}
	mulRotateY(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    let tmp;
    //1行目
    tmp = this._11 * c - this._13 * s;
    this._13 = this._11 * s + this._13 * c;
    this._11 = tmp;
    //2行目
    tmp = this._21 * c - this._23 * s;
    this._23 = this._21 * s + this._23 * c;
    this._21 = tmp;
    //3行目
    tmp = this._31 * c - this._33 * s;
    this._33 = this._31 * s + this._33 * c;
    this._31 = tmp;
	}
	mulRotateZ(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    let tmp;
    //1行目
    tmp = this._11 * c + this._12 * s;
    this._12 = this._11 * -s + this._12 * c;
    this._11 = tmp;
    //2行目
    tmp = this._21 * c + this._22 * s;
    this._22 = this._21 * -s + this._22 * c;
    this._21 = tmp;
    //3行目
    tmp = this._31 * c + this._32 * s;
    this._32 = this._31 * -s + this._32 * c;
    this._31 = tmp;
	}
}
let m = new Matrix();
console.log(m);
// Camera
let CRotX = 0,
    CRotY = .0,
    CRotZ = 0,

    Cx = 0,
    Cy = -0.5,
    Cz = 0.0,
 
    cOffsetX = SCREEN_SIZE_W/2,
    cOffsetY = SCREEN_SIZE_H/2,
   
    f = 0.1,
    Px = 0.06,
    Py = 0.048,
    skew = 0,

    offset = 
      [
      [ 1, 0, 0, cOffsetX ],
      [ 0, 1, 0, cOffsetY ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ],
      ],
 
 	correction =      
 	  [
      [ f/ (2 * Px), skew,  0, 0 ],
      [ 0, f / (2 * Py),  0, 0 ],
      [ 0, 0,  1,  0 ],
      [ 0, 0, 0, 1 ]
      ], 
    Extension = 
      [
      [ SCREEN_SIZE_W,0,  0, 0 ],
      [ 0, SCREEN_SIZE_H,  0, 0 ],
      [ 0, 0,  1,  0 ],
      [ 0, 0, 0, 1 ]
      ],
        
    //outrunであった、奥行きでX,Y値を割るための行列
    depth = [],
    
    ORx = [],
    ORy = [],
    ORz = [],
    
    CRx = [],
    CRy = [],
    CRz = [],
    
    distance_from_Obj_to_Camera = [],
    
    moveVecCamera = [];
    
// Class UV
class UV {
    constructor(u,v){
    	this.u = u;
    	this.v = v;
    }
}

// indexクラス、三角形の結び順格納
class faceIndex {
    constructor(v0,v1,v2) {
    	this.faceIndex = [];
        this.faceIndex.push(v0);
        this.faceIndex.push(v1);
        this.faceIndex.push(v2);
    }
}
//ロードしたデータ格納
class ModelLoadData{
	
	constructor(mainObject){
		this.mainObject = mainObject;
	}
	// モデルJSONデータ読み込み
    JSONLoader(file, callback) {
        var x = new XMLHttpRequest();

        x.open('GET', file);
        x.onreadystatechange = () => {
            if (x.readyState == 4) {
                this.json = JSON.parse(x.responseText);
                // 読込完了コールバック
                callback();
            }
        }
        x.send();
    }
    
   	onJSONLoaded() {
   		//verticesLoad;
   		let mainvertices = [];
   		let loadVertices = this.json.data.attributes.position.array;
   		for(let i=0;i<this.json.data.attributes.position.array.length;i+=this.json.data.attributes.position.itemSize){
			let tempVertices = [];
			let vertsX = [parseFloat(loadVertices[i]) * this.mainObject.scale];
			let vertsY = [parseFloat(loadVertices[i+1]) * this.mainObject.scale];
			let vertsZ = [parseFloat(loadVertices[i+2]) * this.mainObject.scale];
			let verts1 = [1];
   			tempVertices.push(vertsX);
			tempVertices.push(vertsY);
			tempVertices.push(vertsZ);
			tempVertices.push(verts1);
			mainvertices.push(tempVertices);
   		}
   		this.mainObject.verts = mainvertices;
   		
   		//uvLoad
   		let mainUV = [];
   		let loadUV = this.json.data.attributes.uv.array;
   		for(let i=0;i<this.json.data.attributes.uv.array.length;i+=this.json.data.attributes.uv.itemSize){
   			let u = loadUV[i] %1.0;
   			let v = loadUV[i+1] %1.0;
	        u = (u < 0) ? 1 + u : u;
	        v = (v < 0) ? v * -1 : 1 - v;
   			let tempUV = new UV(u,v);
   			mainUV.push(tempUV);  		
   		}
   		this.mainObject.UV = mainUV;
   		
   		//indexLoad頂点の結び順外積負の向き
   		let mainFaceIndex = [];
   		let loadFaceIndex = this.json.data.index.array;
   		const triangleIndex = 3;
   		for(let i=0;i<this.json.data.index.array.length;i+=triangleIndex){
   			let v1 = loadFaceIndex[i];
   			let v2 = loadFaceIndex[i+2];
   			let v3 = loadFaceIndex[i+1]; 
   			let tempFaceInde = new faceIndex(v1,v2,v3);
   			mainFaceIndex.push(tempFaceInde);
   		}
   		this.mainObject.faceIndex = mainFaceIndex;
   		this.loadFinish = true;
   	
   	}
    getLoadFinish(){
    	return this.loadFinish;
    }
    getThisClass(){
    	return this;
    }
}

class Object{
  
  constructor(verts,x,y,z,RotX,RotY,RotZ,scale,numCorners,faceIndex,uv,faceUV,backGroundFlag,backCullingFlag,img){
    
    this.centerObjX = x;
    this.centerObjY = y;
    this.centerObjZ = z;
      
    this.objRotX = RotX;
    this.objRotY = RotY;
    this.objRotZ = RotZ;
    
    this.numCorners = numCorners;
    
    this.scale = scale;

    this.image = img;
    
    this.backGroundFlag = backGroundFlag;
    this.backCullingFlag = backCullingFlag;
    
    //文字列になってる
    this.verts = JSON.parse(JSON.stringify(verts));
    this.faceIndex = faceIndex;
    this.UV = uv;
    this.faceUV = faceUV;
  }
}

class moveObject{
  
  constructor(objInfo,polyList){
    this.orgObject = objInfo.orgObject;
    this.centerObjX = objInfo.centerObjX;
    this.centerObjY = objInfo.centerObjY;
    this.centerObjZ = objInfo.centerObjZ;
    this.maxX=objInfo.maxX;
    this.minX=objInfo.minX;
    this.maxY=objInfo.maxY;
    this.minY=objInfo.minY;
    this.maxZ=objInfo.maxZ;
    this.minZ=objInfo.minZ;
    this.objectNum = parseInt(objInfo.objectNum);
    
    if(polyList!=undefined){
      this.polygonList = polyList;
      this.polygonNum = this.polygonList.length; 
    } 
    
    this.backGroundFlag = objInfo.backGroundFlag;

    this.gravityCollision = false;
  }
}

class Polygon{
  
  //[0]=x,[1]=y,[2]=z
  constructor(Pos1,Pos2,Pos3,UV,image){
    this.isdraw = false;
    this.moveVertices = [];
    this.moveVertices.push(Pos1);
    this.moveVertices.push(Pos2);
    this.moveVertices.push(Pos3);
    this.image = image;
    this.UV = UV;
    //this.centerX = (parseFloat(this.moveVertices[0][0]) + parseFloat(this.moveVertices[1][0]) + parseFloat(this.moveVertices[2][0]))/3;
    //this.centerY = (parseFloat(this.moveVertices[0][1]) + parseFloat(this.moveVertices[1][1]) + parseFloat(this.moveVertices[2][1]))/3;
    //this.centerZ = (parseFloat(this.moveVertices[0][2]) + parseFloat(this.moveVertices[1][2]) + parseFloat(this.moveVertices[2][2]))/3;
    this.crossX,this.crossY,this.crossZ = culVecCross(Pos1,Pos2,Pos3);
  }
  BufferRegister(renderZBuffer){
	triangleToBuffer(renderZBuffer,1,this.image,
        [
         this.moveVertices[0][0], this.moveVertices[0][1],this.moveVertices[0][2],
         this.moveVertices[1][0], this.moveVertices[1][1],this.moveVertices[1][2],
      	 this.moveVertices[2][0], this.moveVertices[2][1],this.moveVertices[2][2],
        ],
        [
         this.UV[0], this.UV[1],
         this.UV[2], this.UV[3],
         this.UV[4], this.UV[5]
        ]
     );
  }
}
function objectPolygonPush(objects,objectNumber,moveObjects){

		let object = objects[objectNumber];

		let projectionList = setProjectionMatrix(object,Cz,Cx,Cy);

		ORx = projectionList.Rx;
		ORy = projectionList.Ry;
		ORz = projectionList.Rz;

		distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

		let moveCameraCube = cameraModel(object,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);
		let moveObjectInfo = moveCameraCube[0];
		moveObjectInfo.orgObject = object;
		//moveCubeInfo.backGroundFlag = object.backGroundFlag;
			/*
			if(moveCubeInfo.backGroundFlag == true){
			  backGroundCounter += 1;
			}
			*/
			let Poly = []
			for(let i=0;i<object.faceIndex.length;i++){
				let triangleIndex = object.faceIndex[i];
				let UV = [];
				if(object.faceUV.length == 0){
					UV = [
				       object.UV[triangleIndex.faceIndex[0]].u, object.UV[triangleIndex.faceIndex[0]].v,
				       object.UV[triangleIndex.faceIndex[1]].u, object.UV[triangleIndex.faceIndex[1]].v,
				       object.UV[triangleIndex.faceIndex[2]].u, object.UV[triangleIndex.faceIndex[2]].v,
				      ]
				}else{
					let triangleChangeIndex = object.faceUV[i];
					UV = [
				       object.UV[triangleChangeIndex.faceIndex[0]].u, object.UV[triangleChangeIndex.faceIndex[0]].v,
				       object.UV[triangleChangeIndex.faceIndex[1]].u, object.UV[triangleChangeIndex.faceIndex[1]].v,
				       object.UV[triangleChangeIndex.faceIndex[2]].u, object.UV[triangleChangeIndex.faceIndex[2]].v,
				      ]
				}
			    Poly.push(new Polygon(moveObjectInfo[triangleIndex.faceIndex[0]],moveObjectInfo[triangleIndex.faceIndex[1]],moveObjectInfo[triangleIndex.faceIndex[2]],UV,object.image));
			}
		let tempMoveObject = new moveObject(moveObjectInfo,Poly);
		moveObjects.push(tempMoveObject);
}
function culVecCross(ver1,ver2,ver3){
  let N_x = (ver1[1]-ver2[1])*(ver2[2]-ver1[2])-(ver1[2]-ver2[2])*(ver3[1]-ver2[1]);
  let N_y = (ver1[2]-ver2[2])*(ver3[0]-ver2[0])-(ver1[0]-ver2[0])*(ver3[2]-ver2[2]);
  let N_z = (ver1[0]-ver2[0])*(ver3[1]-ver2[1])-(ver1[1]-ver2[1])*(ver3[0]-ver2[0]);

  let length = Math.sqrt(N_x * N_x + N_y * N_y + N_z * N_z);
  N_x /= length;
  N_y /= length;
  N_z /= length;
  return N_x,N_y,N_z;
}

function makeSphereVerts(numCorners,radius){
  let sphereVerts = []

  let numRings = numCorners/2+1;
  let circleDeg = 360/numCorners;

  for(let j=0;j<numRings;j++){
    let r = Math.sin(circleDeg * j*Math.PI/180);
    let z = Math.cos(circleDeg * j*Math.PI/180);
    for(let i=0;i<numCorners;i++){
      let verts = [];
      let orginX = Math.sin(circleDeg * i*Math.PI/180) * r;
      let orginY = Math.cos(circleDeg * i*Math.PI/180) * r;
      let orginZ = z//1.0 - 2.0/(numRings-1)*j;//zを0.5刻みにする
      let vertsX = [orginX*radius];
      let vertsY = [orginY*radius];
      let vertsZ = [orginZ*radius];
      let verts1 = [1];
      verts.push(vertsX);
      verts.push(vertsY);
      verts.push(vertsZ);
      verts.push(verts1);

      sphereVerts.push(verts);
    }
  }
  return sphereVerts;
}

function cameraModel(data,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset){
  let result = [];
  let vertsResult = [];
  for (var i = 0; i < data.verts.length; i++) {
    result[i] = multiplyMatrix (ORz ,data.verts[i]);
    result[i] = multiplyMatrix (ORy ,result[i]);
    result[i] = multiplyMatrix (ORx ,result[i]);
    
    result[i] = multiplyMatrix (distance_from_Obj_to_Camera ,result[i]);
    
    result[i] = multiplyMatrix (CRz ,result[i]);
    result[i] = multiplyMatrix (CRy ,result[i]);
    result[i] = multiplyMatrix (CRx ,result[i]);
    
    depth = 
      [
      [ 1/(result[i][2]) , 0, 0, 0 ],
      [ 0, 1/(result[i][2])  , 0, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
    
    result[i] = multiplyMatrix (depth ,result[i]);
    result[i] = multiplyMatrix (correction ,result[i]);
    vertsResult[i] = JSON.parse(JSON.stringify(result[i]));
    
    result[i] = multiplyMatrix (Extension ,result[i]);
    result[i] = multiplyMatrix (offset ,result[i]);
    result[i][0] = Math.floor(parseFloat(result[i][0]) + 0.5);
    result[i][1] = Math.floor(parseFloat(result[i][1]) + 0.5);
  }
  return [result,vertsResult];
}

function setProjectionMatrix(object,Cz,Cx,Cy){
  
	let projectionList = rotMatrix(object.objRotZ,object.objRotX,object.objRotY);

	let distance_from_Obj_to_Camera = translationMatrix((object.centerObjX-Cx),(object.centerObjY-Cy),(object.centerObjZ-Cz));
  
	projectionList.distance_from_Obj_to_Camera = distance_from_Obj_to_Camera;

	return projectionList;
}

function translationMatrix(moveX,moveY,moveZ){
	let translationMatrix = 
      [
      [ 1, 0, 0,moveX],
      [ 0, 1, 0,moveY],
      [ 0, 0, 1,moveZ],
      [ 0, 0, 0, 1 ]
    ];

	return translationMatrix;
}
//オブジェクトもカメラも同じ方向に動くので注意。カメラを動かす時は逆ベクトルにする。sinを逆にすれば逆回転になる。
function rotMatrix(rotZ,rotX,rotY){
  
  let rotMatrix = [];

     let Rx = 
      [
      [ 1, 0, 0, 0 ],
      [ 0, Math.cos(rotX*Math.PI/180), Math.sin(rotX*Math.PI/180), 0 ],
      [ 0, -Math.sin(rotX*Math.PI/180), Math.cos(rotX*Math.PI/180), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let Ry = 
      [
      [ Math.cos(rotY*Math.PI/180), 0, Math.sin(rotY*Math.PI/180), 0 ],
      [ 0, 1, 0, 0 ],
      [ -Math.sin(rotY*Math.PI/180), 0, Math.cos(rotY*Math.PI/180), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let Rz = 
      [
      [ Math.cos(rotZ*Math.PI/180), Math.sin(rotZ*Math.PI/180), 0, 0 ],
      [ -Math.sin(rotZ*Math.PI/180), Math.cos(rotZ*Math.PI/180), 0, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
  
  rotMatrix.Rx = Rx;
  rotMatrix.Ry = Ry;
  rotMatrix.Rz = Rz;
  
  return rotMatrix;
}

function cameraMoveVecCal(cameraVec,CRz,CRy,CRx){
  var result = [];
  for (var i = 0; i < cameraVec[0].length; i++) {
        
    result[i] = multiplyMatrix (CRz ,cameraVec);
    result[i] = multiplyMatrix (CRy ,result[i]);
    result[i] = multiplyMatrix (CRx ,result[i]);
  }
  return result;
}
function AABBcollision(obj1,obj2){
  if(obj1 == obj2){
    return null;
  }else{
    return (obj1.minX <= obj2.maxX && obj1.maxX >= obj2.minX) &&
    (obj1.minY <= obj2.maxY && obj1.maxY >= obj2.minY) &&
    (obj1.minZ <= obj2.maxZ  && obj1.maxZ  >= obj2.minZ)
   }
}

function vertsCulAABBMaxMinCenter(orgObject,offsetX,offsetY,offsetZ){

  let cubeVerts1Mat = translationMatrix(orgObject.centerObjX+offsetX,orgObject.centerObjY+offsetY,orgObject.centerObjZ+offsetZ);
  let objectOrgVerts = [];
  for (var i = 0; i < orgObject.verts.length; i++) {
    objectOrgVerts[i] = multiplyMatrix (cubeVerts1Mat , orgObject.verts[i]);
   }
  let maxminCenterObject = [];
  
  let vertsX = [];
  let vertsY = [];
  let vertsZ = [];

  for(let i=0;i<orgObject.verts.length;i++){
    vertsX.push(parseFloat(objectOrgVerts[i][0]));
    vertsY.push(parseFloat(objectOrgVerts[i][1]));
    vertsZ.push(parseFloat(objectOrgVerts[i][2]));
  }
  let maxX = Math.max(...vertsX);
  let minX = Math.min(...vertsX);
  let maxY = Math.max(...vertsY);
  let minY = Math.min(...vertsY);
  let maxZ = Math.max(...vertsZ);
  let minZ = Math.min(...vertsZ);
  let centerX = vertsX.reduce((sum, element) => sum + element, 0)/orgObject.length;
  let centerY = vertsY.reduce((sum, element) => sum + element, 0)/orgObject.length;
  let centerZ = vertsZ.reduce((sum, element) => sum + element, 0)/orgObject.length;

  maxminCenterObject.maxX = maxX;
  maxminCenterObject.minX = minX;
  maxminCenterObject.maxY = maxY;
  maxminCenterObject.minY = minY;  
  maxminCenterObject.maxZ = maxZ;
  maxminCenterObject.minZ = minZ;
  maxminCenterObject.centerObjX = centerX;
  maxminCenterObject.centerObjY = centerY;
  maxminCenterObject.centerObjZ = centerZ;
  return maxminCenterObject;
}
function vertsCulMaxMinCenter(moveVerts){
  let maxminCenterObject = [];
  
  let maxX = 0;
  let minX = 0;
  let maxY = 0;
  let minY = 0;
  let maxZ = 0;
  let minZ = 0;
  
  let vertsX = [];
  let vertsY = [];
  let vertsZ = [];

  for(let i=0;i<moveVerts.length;i++){
    vertsX.push(parseFloat(moveVerts[i][0]));
    vertsY.push(parseFloat(moveVerts[i][1]));
    vertsZ.push(parseFloat(moveVerts[i][2]));
  }
  
  let centerX = vertsX.reduce((sum, element) => sum + element, 0)/moveVerts.length;
  let centerY = vertsY.reduce((sum, element) => sum + element, 0)/moveVerts.length;
  let centerZ = vertsZ.reduce((sum, element) => sum + element, 0)/moveVerts.length;

  let vertsXMaxMin = [];
  for(let i=0;i<moveVerts.length;i++){
    vertsXMaxMin.push(moveVerts[i][0]);    
  }
  maxX = Math.max(...vertsXMaxMin);
  minX = Math.min(...vertsXMaxMin);

  let vertsYMaxMin = [];
  for(let i=0;i<moveVerts.length;i++){
      vertsYMaxMin.push(moveVerts[i][1]);   
  }
  maxY = Math.max(...vertsYMaxMin);
  minY = Math.min(...vertsYMaxMin);

  let vertsZMaxMin = [];
  for(let i=0;i<moveVerts.length;i++){
      vertsZMaxMin.push(moveVerts[i][2]);   
  }

  maxZ = Math.max(...vertsZMaxMin);
  minZ = Math.min(...vertsZMaxMin);
  
  maxminCenterObject.maxX = maxX;
  maxminCenterObject.minX = minX;
  maxminCenterObject.maxY = maxY;
  maxminCenterObject.minY = minY;  
  maxminCenterObject.maxZ = maxZ;
  maxminCenterObject.minZ = minZ;
  maxminCenterObject.centerObjX = centerX;
  maxminCenterObject.centerObjY = centerY;
  maxminCenterObject.centerObjZ = centerZ;
  return maxminCenterObject;
}

function multiplyMatrix(m1, m2) {
  var result = [];
  for(var j = 0; j < m1.length; j++) {
    result[j] = [];
    for(var k = 0; k < m2[0].length; k++) {
      var sum = 0;
      for(var i = 0; i < m2.length; i++) {
        sum += m2[i][k] * m1[j][i];
      }
      result[j].push(sum);
    }
  }
  return result;
}
//blenderLoad
let monkeys = [];
let monkeysImage = new Image();
monkeysImage.src = 'box.jpg';
let monkeyPixelImage = [];
let monkeyLoad = [];
let monkeyLoad1 = [];
monkeysImage.addEventListener("load", function() {
	monkeyPixelImage = pictureToPixelMap(backCtx,monkeysImage);
	let monkeyVerts = [];
	let faceIndex = [];
	let uv = [];
	let faceUV = [];
	monkeys.push(new Object(monkeyVerts,0.0,-0.6,2.5,-180,0,0,0.5,0,faceIndex,uv,faceUV,false,true,monkeyPixelImage));
	monkeyLoad.push(new ModelLoadData(monkeys[0]));
	monkeyLoad[0].JSONLoader("cube.json", (() => monkeyLoad[0].onJSONLoaded()));	
}, true);	
	
//sky
let sphereVerts8 = makeSphereVerts(16,10);
let spheres = [];
let skyImage = new Image();
skyImage.src = 'sky.jpg';

let skyPixelImage = [];

skyImage.addEventListener("load", function() {
	skyPixelImage = pictureToPixelMap(backCtx,skyImage);
	//spheres.push(new Object(sphereVerts8,0.0,0.0,5,0,0,0,16,true,false,skyPixelImage));
}, true);

//box
let cubes = [];
let cubeImage = new Image();
cubeImage.src = 'box.jpg';

let cubePixelImage = [];
let cubeFaceIndex = [];
//前面
cubeFaceIndex.push(new faceIndex(0,1,3));
cubeFaceIndex.push(new faceIndex(2,3,1));
//上面
cubeFaceIndex.push(new faceIndex(4,5,0));
cubeFaceIndex.push(new faceIndex(1,0,5));
//後面
cubeFaceIndex.push(new faceIndex(5,4,6));
cubeFaceIndex.push(new faceIndex(7,6,4));
//下面
cubeFaceIndex.push(new faceIndex(3,2,7));
cubeFaceIndex.push(new faceIndex(6,7,2));
//左側面
cubeFaceIndex.push(new faceIndex(4,0,7));
cubeFaceIndex.push(new faceIndex(3,7,0));
//右側面
cubeFaceIndex.push(new faceIndex(1,5,2));
cubeFaceIndex.push(new faceIndex(6,2,5));

let planeFaceIndex = [];
//上面
planeFaceIndex.push(new faceIndex(4,5,0));
planeFaceIndex.push(new faceIndex(1,0,5));

let cubePlaneUV = [];
cubePlaneUV.push(new UV(0,0));
cubePlaneUV.push(new UV(1,0));
cubePlaneUV.push(new UV(0,1));
cubePlaneUV.push(new UV(1,1));
cubePlaneUV.push(new UV(0,1));
cubePlaneUV.push(new UV(1,0));

let cubeFaceUV = [];
for(let i=0;i<cubeFaceIndex.length/2;i++){
	cubeFaceUV.push(new faceIndex(0,1,2));
	cubeFaceUV.push(new faceIndex(3,4,5));
}

//一番下は-0.27から積み重ねる場合+0.5,-0.27
cubeImage.addEventListener("load", function() {
	cubePixelImage = pictureToPixelMap(backCtx,cubeImage);
	cubes.push(new Object(orgCubeVerts,0.0,-0.35,4.5,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-0.6,-0.35,4.9,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-0.6,-0.90,5.0,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,0.6,-0.90,5,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,0.6,-0.35,4.9,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,1.5,-0.35,3,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-1.5,-0.35,4,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
}, true);

//ground
let planes = [];
let roadImage = new Image();
roadImage.src = 'road.png';

let roadPixelImage = [];

roadImage.addEventListener("load", function() {
	roadPixelImage = pictureToPixelMap(backCtx,roadImage);
	for(let j=0;j<2;j++){
  		for(let i=0;i<9;i++){
    		planes.push(new Object(orgPlaneVerts,-0.5+0.5*j,0,1.5+0.5*i,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,roadPixelImage));
  		}
	}
}, true);

let groundImage = new Image();
groundImage.src = 'sand.jpg';

let sandPixelImage = [];

groundImage.addEventListener("load", function() {
	sandPixelImage = pictureToPixelMap(backCtx,groundImage);
	for(let j=0;j<3;j++){
	  for(let i=0;i<9;i++){
	    planes.push(new Object(orgPlaneVerts,-2.0+0.5*j,0,1.5+0.5*i,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,sandPixelImage));
	  }
	}
	for(let j=0;j<3;j++){
	  for(let i=0;i<9;i++){
	   planes.push(new Object(orgPlaneVerts,0.5+0.5*j,0,1.5+0.5*i,0,0,0,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,sandPixelImage));
	  }
	}	
}, true);

const gravity = 0.01;

var mainLoopId = setInterval(function(){

if( skyPixelImage.length == 0  || cubePixelImage.length == 0 ||
	roadPixelImage.length == 0 || sandPixelImage.length == 0 || monkeyLoad[0].getLoadFinish() != true){
	ctx.font = '50pt Arial';
 	ctx.fillStyle = 'rgba(0, 0, 255)';
 	ctx.fillText("now loding", SCREEN_SIZE_W/2, SCREEN_SIZE_H/2);
	return 0;
}
  let cameraRotMatrix = [];
  cameraRotMatrix = rotMatrix(CRotZ,CRotX,CRotY);
    
  CRx = cameraRotMatrix.Rx;
  CRy = cameraRotMatrix.Ry;
  CRz = cameraRotMatrix.Rz;
  
  let backGroundCounter = 0;

  //移動後の情報格納
  let moveObjects = [];
    
  //sphereregister
  for(let num =0;num<spheres.length;num++){
    let sphere = spheres[num];
    
    let projectionList = setProjectionMatrix(sphere,Cz,Cx,Cy);
    
    ORx = projectionList.Rx;
    ORy = projectionList.Ry;
    ORz = projectionList.Rz;
   
    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;
    let moveCameraSphere = cameraModel(sphere,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);
    let moveSphereInfo = moveCameraSphere[0];
    moveSphereInfo.orgObject = spheres[num];
    moveSphereInfo.image = sphere.image;
    moveSphereInfo.backGroundFlag = sphere.backGroundFlag;
    moveSphereInfo.backCullingFlag = sphere.backCullingFlag;
    
    if(moveSphereInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    
    let Poly = [];

    for(let i= 0;i<sphere.numCorners*sphere.numCorners/2;i++){
    let  j = i + sphere.numCorners;
    let p = i+sphere.numCorners+1; 
    if(p % sphere.numCorners == 0) p -= sphere.numCorners;
    let k = i + 1;
    if(k % sphere.numCorners == 0) k -= sphere.numCorners;
    let upUV = [
       0, 0,
       1, 0,
       0, 1
      ]
    let downUV = [
       0, 1,
       1, 1,
       1, 0
      ]

      Poly.push(new Polygon(moveSphereInfo[i],moveSphereInfo[j],moveSphereInfo[k],upUV,moveSphereInfo.image));
    //    Polygones.push(new Polygon(spheres[num].dotMovePos[i],spheres[num].dotMovePos[j],spheres[num].dotMovePos[p],spheres[num].dotMovePos[k],4,sphereImage));
      Poly.push(new Polygon(moveSphereInfo[j],moveSphereInfo[p],moveSphereInfo[k],downUV,moveSphereInfo.image));
    }
    let movesphere = new moveObject(moveSphereInfo,Poly);
    moveObjects.push(movesphere);
  }  
  
	//blender2.7xjsonload
	for(let num=0;num<monkeys.length;num++){
		objectPolygonPush(monkeys,num,moveObjects);
	}
	
	//cuberegister
	for(let num=0;num<cubes.length;num++){
		objectPolygonPush(cubes,num,moveObjects);
	}
	//planesregister
	for(let num=0;num<planes.length;num++){
		objectPolygonPush(planes,num,moveObjects);
	}
  for(let i = spheres.length;i<spheres.length+monkeys.length+cubes.length;i++){
  	let currentObject = moveObjects[i];
  	let currentMaxMinCenter = vertsCulAABBMaxMinCenter(currentObject.orgObject,0,gravity,0);
  	for(let j = spheres.length;j<spheres.length+monkeys.length+cubes.length+planes.length;j++){
  		let gravityUnderMaxMinCenter = vertsCulAABBMaxMinCenter(moveObjects[j].orgObject,0,0,0);
  	  if(AABBcollision(currentMaxMinCenter,gravityUnderMaxMinCenter) == true && (currentObject.orgObject.centerObjY<moveObjects[j].orgObject.centerObjY)){
  		currentObject.gravityCollision = true;
  		break;
	  }
	}
  }
  for(let i = spheres.length;i<spheres.length+monkeys.length+cubes.length;i++){
  	if(moveObjects[i].gravityCollision == false){
  		moveObjects[i].orgObject.centerObjY += gravity;
  	}
  }

let renderZBuffer = bufferInit(SCREEN_SIZE_H,SCREEN_SIZE_W);

for(let j=0;j<moveObjects.length;j++){
	for(let i=0;i<moveObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(moveObjects[j].orgObject.backCullingFlag == true){
	    if(moveObjects[j].polygonList[i].crossZ<0){
		  moveObjects[j].polygonList[i].BufferRegister(renderZBuffer);
	    } 
	  }else{
		  moveObjects[j].polygonList[i].BufferRegister(renderZBuffer);
	  }
	}
}
var myImageData = ctx.createImageData(SCREEN_SIZE_W, SCREEN_SIZE_H);

//レンダリングZバッファ作画
for(let j=0;j<SCREEN_SIZE_H;j++){
	for(let i=0;i<SCREEN_SIZE_W;i++){
	let base = (j * SCREEN_SIZE_W + i) * 4;;
	let getPixel = renderZBuffer[j][i].get().getPixel();
		if(getPixel.z < 99999){
			myImageData.data[base + 0] = getPixel.r;  // Red
		    myImageData.data[base + 1] = getPixel.g;  // Green
		    myImageData.data[base + 2] = getPixel.b  // Blue
		    myImageData.data[base + 3] = 255 * getPixel.a; // Alpha
		//dotPaint(j,i,getPixel.r,getPixel.g,getPixel.b,getPixel.a,ctx);    
		}else{
			//何もないところは黒
			//dotPaint(j,i,0,0,0,255,ctx);
			myImageData.data[base + 0] =0;  // Red
		    myImageData.data[base + 1] = 0;  // Green
		    myImageData.data[base + 2] = 0  // Blue
		    myImageData.data[base + 3] = 255; // Alpha
		}
	}
}
ctx.putImageData(myImageData, 0, 0);

}, 1000/60);

document.addEventListener('keydown',e => {

  switch(e.key){
    case 'ArrowLeft':
      moveVecCamera = 
       [
        [ 0.25 ],
        [ 0 ],
        [ 0 ],
        [ 1 ]
        ];
      moveVecCamera = cameraMoveVecCal(moveVecCamera,CRz,CRy,CRx);
      Cx -= parseFloat(moveVecCamera[0][0]);
      Cy -= parseFloat(moveVecCamera[0][1]);
      Cz += parseFloat(moveVecCamera[0][2]);
      break;
    case 'ArrowRight':
      moveVecCamera = 
       [
        [ -0.25 ],
        [ 0 ],
        [ 0 ],
        [ 1 ]
        ];
      moveVecCamera = cameraMoveVecCal(moveVecCamera,CRz,CRy,CRx);
      Cx -= parseFloat(moveVecCamera[0][0]);
      Cy -= parseFloat(moveVecCamera[0][1]);
      Cz += parseFloat(moveVecCamera[0][2]); 
      break;
    case 'ArrowUp':
      moveVecCamera = 
       [
        [ 0 ],
        [ 0.25 ],
        [ 0 ],
        [ 1 ]
        ];
      moveVecCamera = cameraMoveVecCal(moveVecCamera,CRz,CRy,CRx);
      Cx -= parseFloat(moveVecCamera[0][0]);
      Cy -= parseFloat(moveVecCamera[0][1]);
      Cz += parseFloat(moveVecCamera[0][2]);
      break;
    case 'ArrowDown':
      moveVecCamera = 
       [
        [ 0 ],
        [ -0.25 ],
        [ 0 ],
        [ 1 ]
        ];
      moveVecCamera = cameraMoveVecCal(moveVecCamera,CRz,CRy,CRx);
      Cx -= parseFloat(moveVecCamera[0][0]);
      Cy -= parseFloat(moveVecCamera[0][1]);
      Cz += parseFloat(moveVecCamera[0][2]);
      break;
    case 'u':
      moveVecCamera = 
       [
        [ 0 ],
        [ 0 ],
        [ 0.2 ],
        [ 1 ]
        ];
      moveVecCamera = cameraMoveVecCal(moveVecCamera,CRz,CRy,CRx);
      Cx -= parseFloat(moveVecCamera[0][0]);
      Cy -= parseFloat(moveVecCamera[0][1]);
      Cz += parseFloat(moveVecCamera[0][2]);
      break;   
    case 'd':
      moveVecCamera = 
       [
        [ 0 ],
        [ 0 ],
        [ -0.2 ],
        [ 1 ]
        ];
      moveVecCamera = cameraMoveVecCal(moveVecCamera,CRz,CRy,CRx);
      Cx -= parseFloat(moveVecCamera[0][0]);
      Cy -= parseFloat(moveVecCamera[0][1]);
      Cz += parseFloat(moveVecCamera[0][2]);
      break;
    case '1':
      CRotX += 5;
      if(CRotX>=360){
        CRotX = 0;
      }
      break;
    case '2':
      CRotX -= 5;
      if(CRotX<0){
        CRotX = 360-5;
      }
      break;
    case '3':
      CRotY += 5;
      if(CRotY>=360){
        CRotY = 0;
      }
      break;
    case '4':
      CRotY -= 5;
      if(CRotY<0){
        CRotY = 360-5;
      }
      break;
    case '5':
      CRotZ += 5;
      if(CRotZ>=360){
        CRotZ = 0;
      }
      break;
    case '6':
      CRotZ -= 5;
      if(CRotY<0){
        CRotY = 360-5;
      }
      break;
    case 'a':
      cubes[0].objY += 0.01;
      break;
  }
});

function drawPolygon(Polygon) {
    if (Polygon.moveVertices[0][2] > 0.5 && Polygon.moveVertices[1][2] > 0.5 && Polygon.moveVertices[2][2] > 0.5) {
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.moveTo(Polygon.moveVertices[0][0],(Polygon.moveVertices[0][1]));
      ctx.lineTo(Polygon.moveVertices[1][0],(Polygon.moveVertices[1][1]));
      ctx.lineTo(Polygon.moveVertices[2][0],(Polygon.moveVertices[2][1]));
      ctx.closePath();

      ctx.fill();
    }
}