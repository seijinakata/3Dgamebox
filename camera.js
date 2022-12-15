//頂点にクラスを使うと重たくなる頂点演算のせい？
//classをjsonに置き換え中インスタンス製造じゃなくてただの文字列になるため軽くなると思われるから。
import {setVector2,setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize, round, roundVector2} from './vector.js';
import {matIdentity,mulMatTranslate,mulMatScaling, matMul,matVecMul,matPers,matCamera,mulMatRotateX,mulMatRotatePointX,mulMatRotateY,mulMatRotatePointY,mulMatRotateZ,mulMatRotatePointZ,getInverseMatrix, matRound4X4, protMatVecMul, CalInvMat4x4} from './matrix.js';
import {waistVerts,spineVerts,headVerts,rgCubeVerts,rgPlaneVerts,orgPlaneVerts, orgCubeVerts} from './orgverts.js';
import {setPixelZ,setPixel,renderBuffer,pixel,bufferPixelInit,bufferInit,pictureToPixelMap,dotPaint,dotLineBufferRegister,triangleRasterize,textureTransform,triangleToBuffer,sort_index,branch} from './paint.js';

export const SCREEN_SIZE_W = 1000;
export const SCREEN_SIZE_H = 800;

// ルックアップテーブルを生成しておく
export const sinLut = [];
export const cosLut = [];
const DEG_TO_RAD = Math.PI / 180;
//const RAD_TO_DEG = 180 / Math.PI;
for(let i = 0; i < 360; i++) {
  sinLut.push(Math.sin(i * DEG_TO_RAD));
  cosLut.push(Math.cos(i * DEG_TO_RAD));
}
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
c.width = SCREEN_SIZE_W;
c.height = SCREEN_SIZE_H;

var canvas = document.getElementById('backmyCanvas');
var backCtx = canvas.getContext('2d',{willReadFrequently: true});
canvas.width = SCREEN_SIZE_W*5;
canvas.height = SCREEN_SIZE_H*7;
//viewPortMat
let viewPortMatrix = [
  [ SCREEN_SIZE_W, 0, 0, SCREEN_SIZE_W/2],
  [ 0, SCREEN_SIZE_H, 0, SCREEN_SIZE_H/2],
  [ 0, 0, 1, 0],
  [ 0, 0, 0, 1]
];
let inverseViewPortMatrix = matIdentity();
CalInvMat4x4(viewPortMatrix,inverseViewPortMatrix);
let viewMatrix = matIdentity();
let inverseViewMatrix = matIdentity();
let sunViewMatrix = matIdentity();
// Camera
let cameraPos = setVector3(1,-1,-4);
let lookat = setVector3(0.0,-1,1);
let sunPos = setVector3(0,-4,-4);
let sunLookat = setVector3(0.0,-0.0,0);
let up = setVector3(0,1,0);
let lookatIndex = 0;

//UV
function setUV(u,v){
	let uv = {"u":u,"v":v};
	return uv;
}
// index、三角形の結び順格納
function setFaceIndex(v0,v1,v2){
	let faceIndex = [v0,v1,v2];
	return faceIndex;
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
			let tempVertices = [loadVertices[i],loadVertices[i+1],loadVertices[i+2]];
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
   			let tempUV = setUV(u,v);
   			mainUV.push(tempUV);  		
   		}
   		this.mainObject.UV = mainUV;
   		
   		//indexLoad頂点の結び順外積負の向き
   		let mainFaceIndex = [];
   		let loadFaceIndexVertices = this.json.data.index.array;
   		const triangleIndex = 3;
   		for(let i=0;i<this.json.data.index.array.length;i+=triangleIndex){
   		  let tempFaceInde = setFaceIndex(loadFaceIndexVertices[i],loadFaceIndexVertices[i+2],loadFaceIndexVertices[i+1]);
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
  
  constructor(verts,x,y,z,RotX,RotY,RotZ,scalex,scaley,scalez,numCorners,faceIndex,uv,faceUV,backGroundFlag,backCullingFlag,img){
    
    this.centerObjX = x;
    this.centerObjY = y;
    this.centerObjZ = z;
      
    this.objRotX = RotX;
    this.objRotY = RotY;
    this.objRotZ = RotZ;
    
    this.numCorners = numCorners;
    
    this.scaleX = scalex;
    this.scaleY = scaley;
    this.scaleZ = scalez;

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
  constructor(orgObject,worldMatrix,polyList){
    this.orgObject = orgObject;
    this.worldMatrix = worldMatrix;
    if(polyList!=undefined){
      this.polygonList = polyList;
      this.polygonNum = this.polygonList.length; 
    } 
    this.gravityCollision = false;
  }
}
//jsonポリゴン製造
function setPolygon(Pos1,Pos2,Pos3,worldPos1,worldPos2,worldPos3,UV,image){
  let polygonElement = {};
  let moveVertices =   [[0,0,0],
                        [0,0,0],
                        [0,0,0]];
  //[0]=x,[1]=y,[2]=z
  moveVertices[0][0] = Pos1[0];
  moveVertices[0][1] = Pos1[1];
  moveVertices[0][2] = Pos1[2];

  moveVertices[1][0] = Pos2[0];
  moveVertices[1][1] = Pos2[1];
  moveVertices[1][2] = Pos2[2];

  moveVertices[2][0] = Pos3[0];
  moveVertices[2][1] = Pos3[1];
  moveVertices[2][2] = Pos3[2];

  polygonElement.moveVertices = moveVertices;
  polygonElement.image = image;
  polygonElement.UV = UV;
  let Va = vecMinus(Pos1,Pos2);
  let Vb = vecMinus(Pos3,Pos1);
  polygonElement.crossZ = culVecCrossZ(Va,Vb);
  Va = vecMinus(worldPos1,worldPos2);
  Vb = vecMinus(worldPos3,worldPos1);
  polygonElement.crossWorldVector3 = culVecNormalize(culVecCross(Va,Vb));
  return polygonElement;
}
//jsonシャドウマップ用ポリゴン製造
function setShadowPolygon(Pos1,Pos2,Pos3){
  let polygonElement = {};
  let moveVertices =   [[0,0,0],
                        [0,0,0],
                        [0,0,0]];
  //[0]=x,[1]=y,[2]=z
  moveVertices[0][0] = Pos1[0];
  moveVertices[0][1] = Pos1[1];
  moveVertices[0][2] = Pos1[2];

  moveVertices[1][0] = Pos2[0];
  moveVertices[1][1] = Pos2[1];
  moveVertices[1][2] = Pos2[2];

  moveVertices[2][0] = Pos3[0];
  moveVertices[2][1] = Pos3[1];
  moveVertices[2][2] = Pos3[2];

  polygonElement.moveVertices = moveVertices;
  let Va = vecMinus(Pos1,Pos2);
  let Vb = vecMinus(Pos3,Pos1);
  polygonElement.crossZ = culVecCrossZ(Va,Vb);
  return polygonElement;
}
function objectPolygonPush(objects,worldMatrix,objectNumber,moveObjects,viewMatrix){
  let worldVerts = [];
  let projectedVerts = [];
  let object = objects[objectNumber];
  for (var i = 0; i < object.verts.length; i++) {
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);

    let verts = matVecMul(worldMatrix,object.verts[i])
    worldVerts.push(verts);

    projectedVerts.push(matVecMul(viewMatrix,verts));
    let projectionMatrix =  matPers(projectedVerts[i][2]);
    protMatVecMul(projectionMatrix,projectedVerts[i]);
    //projectedVerts[i] = matVecMul(viewPortMatrix,projectedVerts[i]);
    projectedVerts[i][0] = Math.floor((projectedVerts[i][0] + 0.5)*SCREEN_SIZE_W);
    projectedVerts[i][1] = Math.floor((projectedVerts[i][1] + 0.5)*SCREEN_SIZE_H);
  }
 
  let Poly = []
  for(let i=0;i<object.faceIndex.length;i++){
    let triangleFaceIndex = object.faceIndex[i];
    let UV = [];
    if(object.faceUV.length == 0){
      UV = [
           object.UV[triangleFaceIndex[0]].u, object.UV[triangleFaceIndex[0]].v,
           object.UV[triangleFaceIndex[1]].u, object.UV[triangleFaceIndex[1]].v,
           object.UV[triangleFaceIndex[2]].u, object.UV[triangleFaceIndex[2]].v,
          ]
    }else{
      let triangleChangeFaceIndex = object.faceUV[i];
      UV = [
           object.UV[triangleChangeFaceIndex[0]].u, object.UV[triangleChangeFaceIndex[0]].v,
           object.UV[triangleChangeFaceIndex[1]].u, object.UV[triangleChangeFaceIndex[1]].v,
           object.UV[triangleChangeFaceIndex[2]].u, object.UV[triangleChangeFaceIndex[2]].v,
          ]
    } 
    Poly.push(setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],UV,object.image));
  }

  let tempMoveObject = new moveObject(object,worldMatrix,Poly);
  moveObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
//シャドウマップ用ポリゴン格納
function objectShadowMapPolygonPush(objects,worldMatrix,objectNumber,moveObjects,viewMatrix){
  let projectedVerts = [];
  let object = objects[objectNumber];
  let worldViewMatrix = matMul(viewMatrix,worldMatrix);
  for (var i = 0; i < object.verts.length; i++) {
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);
    projectedVerts.push(matVecMul(worldViewMatrix,object.verts[i]));
    let projectionMatrix =  matPers(projectedVerts[i][2]);
    protMatVecMul(projectionMatrix,projectedVerts[i]);
    //projectedVerts[i] = matVecMul(viewPortMatrix,projectedVerts[i]);
    projectedVerts[i][0] = Math.floor((projectedVerts[i][0] + 0.5)*SCREEN_SIZE_W);
    projectedVerts[i][1] = Math.floor((projectedVerts[i][1] + 0.5)*SCREEN_SIZE_H);
  }
 
  let Poly = []
  for(let i=0;i<object.faceIndex.length;i++){
    let triangleFaceIndex = object.faceIndex[i]; 
    Poly.push(setShadowPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]]));
  }
  let tempMoveObject = new moveObject(object,worldMatrix,Poly);
  moveObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
function renderbufferInit(buffer,pixelY,pixelX){
  for(let y=0;y<pixelY;y++){
    let pixelColumn = [];
    for(let x=0;x<pixelX;x++){
      let pixel = [];
      pixel.push({z:99999});
      pixelColumn.push(pixel);
    }
    buffer.push(pixelColumn);
  }
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

function AABBcollision(obj1,obj2){
  if(obj1 == obj2){
    return null;
  }else{
    return (obj1.minX <= obj2.maxX && obj1.maxX >= obj2.minX) &&
    (obj1.minY <= obj2.maxY && obj1.maxY >= obj2.minY) &&
    (obj1.minZ <= obj2.maxZ  && obj1.maxZ  >= obj2.minZ)
   }
}

function vertsCulAABBMaxMinCenter(orgObject,worldMatrix,offsetX,offsetY,offsetZ){

  let cubesSelectWorldMatrix = worldMatrix;
  let objectOrgVerts = [];
  for (var i = 0; i < orgObject.verts.length; i++) {
    objectOrgVerts[i] = matVecMul(cubesSelectWorldMatrix,orgObject.verts[i]);
   }
  let maxminCenterObject = [];
  
  let vertsX = [];
  let vertsY = [];
  let vertsZ = [];

  for(let i=0;i<orgObject.verts.length;i++){
    vertsX.push(objectOrgVerts[i][0]);
    vertsY.push(objectOrgVerts[i][1]);
    vertsZ.push(objectOrgVerts[i][2]);
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
	monkeys.push(new Object(monkeyVerts,-1.0,-0.6,0,180,0,0,0.5,0.5,0.5,0,faceIndex,uv,faceUV,false,true,monkeyPixelImage));
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
cubeFaceIndex.push(setFaceIndex(0,1,3));
cubeFaceIndex.push(setFaceIndex(2,3,1));

//上面
cubeFaceIndex.push(setFaceIndex(4,5,0));
cubeFaceIndex.push(setFaceIndex(1,0,5));
//後面
cubeFaceIndex.push(setFaceIndex(5,4,6));
cubeFaceIndex.push(setFaceIndex(7,6,4));

//下面
cubeFaceIndex.push(setFaceIndex(3,2,7));
cubeFaceIndex.push(setFaceIndex(6,7,2));

//左側面
cubeFaceIndex.push(setFaceIndex(4,0,7));
cubeFaceIndex.push(setFaceIndex(3,7,0));
//右側面
cubeFaceIndex.push(setFaceIndex(1,5,2));
cubeFaceIndex.push(setFaceIndex(6,2,5));
/**/
let planeFaceIndex = [];
//上面
planeFaceIndex.push(setFaceIndex(4,5,0));
planeFaceIndex.push(setFaceIndex(1,0,5));

let cubePlaneUV = [];
cubePlaneUV.push(setUV(0,0));
cubePlaneUV.push(setUV(1,0));
cubePlaneUV.push(setUV(0,1));
cubePlaneUV.push(setUV(1,1));
cubePlaneUV.push(setUV(0,1));
cubePlaneUV.push(setUV(1,0));

let cubeFaceUV = [];
for(let i=0;i<cubeFaceIndex.length/2;i++){
	cubeFaceUV.push(setFaceIndex(0,1,2));
	cubeFaceUV.push(setFaceIndex(3,4,5));
}
let bodys = [];
//一番下は-0.27から積み重ねる場合+0.5,-0.27
cubeImage.addEventListener("load", function() {
	cubePixelImage = pictureToPixelMap(backCtx,cubeImage);
  //waist
	bodys.push(new Object(waistVerts,0,0,0,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
  //spine
  bodys.push(new Object(spineVerts,0.0,0,0,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
  //head
  bodys.push(new Object(headVerts,0.0,0,0,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));


  cubes.push(new Object(orgCubeVerts,0,-1,2,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
  cubes.push(new Object(orgCubeVerts,0.-1,0,3,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-0.6,-0.90,1.0,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,0.6,-0.90,1,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,1.5,-1.35,0.5,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-1.5,-1.35,1,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
}, true);

//ground
let planes = [];
let roadImage = new Image();
roadImage.src = 'road.png';

let roadPixelImage = [];

roadImage.addEventListener("load", function() {
	roadPixelImage = pictureToPixelMap(backCtx,roadImage);
  planes.push(new Object(orgPlaneVerts,0,0,0.0,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,roadPixelImage));
  planes.push(new Object(orgPlaneVerts,0,0,1.5,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,roadPixelImage));
  planes.push(new Object(orgPlaneVerts,0,0,3.0,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,roadPixelImage));

}, true);

let groundImage = new Image();
groundImage.src = 'sand.jpg';

let sandPixelImage = [];

groundImage.addEventListener("load", function() {
	sandPixelImage = pictureToPixelMap(backCtx,groundImage);
  planes.push(new Object(orgPlaneVerts,-1.25,0,0.0,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,-1.25,0,1.5,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,-1.25,0,3.0,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,0.0,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,1.5,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,3.0,0,0,0,2.5,1,3,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,false,sandPixelImage));
}, true);

const gravity = 0.01;
let theta = 0;

var mainLoopId = setInterval(function(){

if( skyPixelImage.length == 0  || cubePixelImage.length == 0 ||
	roadPixelImage.length == 0 || sandPixelImage.length == 0 || monkeyLoad[0].getLoadFinish() != true){
	ctx.font = '50pt Arial';
 	ctx.fillStyle = 'rgba(0, 0, 255)';
 	ctx.fillText("now loding", SCREEN_SIZE_W/2, SCREEN_SIZE_H/2);
	return 0;
}

//lookat = setVector3(moveObjects[lookatIndex].orgObject.centerObjX,moveObjects[lookatIndex].orgObject.centerObjY,moveObjects[lookatIndex].orgObject.centerObjZ);
  viewMatrix = matIdentity();
  matCamera(viewMatrix,cameraPos,lookat,up);
  matRound4X4(viewMatrix);

  inverseViewMatrix = matIdentity();
  CalInvMat4x4(viewMatrix,inverseViewMatrix);
  matRound4X4(inverseViewMatrix);

  sunViewMatrix = matIdentity();
  matCamera(sunViewMatrix,sunPos,sunLookat,up);
  matRound4X4(sunViewMatrix);

  let backGroundCounter = 0;

  //移動後の情報格納
  let moveObjects = [];
    
  //sphereregister
  for(let num =0;num<spheres.length;num++){
    /*
    let sphere = spheres[num];
   
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
    */
  }  

	//blender2.7xjsonload
	for(let num=0;num<monkeys.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,monkeys[num].centerObjX,monkeys[num].centerObjY,monkeys[num].centerObjZ);  
    mulMatRotateX(worldMatrix,monkeys[num].objRotX);
    mulMatRotateY(worldMatrix,monkeys[num].objRotY);
    mulMatRotateZ(worldMatrix,monkeys[num].objRotZ); 
    mulMatScaling(worldMatrix,monkeys[num].scaleX,monkeys[num].scaleY,monkeys[num].scaleZ);
    objectShadowMapPolygonPush(monkeys,worldMatrix,num,moveObjects,sunViewMatrix);	
  }
  bodys[0].objRotX = 0;
  bodys[0].centerObjY  = -0.5;
  let waistMatrix = matIdentity();
      let spainMatrix = matIdentity();
        let headMatrix = matIdentity();
  mulMatTranslate(waistMatrix,bodys[0].centerObjX,bodys[0].centerObjY,bodys[0].centerObjZ);  
  mulMatRotateX(waistMatrix,bodys[0].objRotX);
  mulMatRotateY(waistMatrix,bodys[0].objRotY);
  mulMatRotateZ(waistMatrix,bodys[0].objRotZ); 
  mulMatScaling(waistMatrix,bodys[0].scaleX,bodys[0].scaleY,bodys[0].scaleZ);
  objectShadowMapPolygonPush(bodys,waistMatrix,0,moveObjects,sunViewMatrix);
  let s = Math.sin(theta);
  let ns = s<0 ? 0 : s;
  //bodys[0].objRotY = -45;
  bodys[1].objRotX = Math.floor(45 * ns);
  theta += 0.4;
  //bodys[0].objRotZ += 10;

  if(theta >=2000){
    theta = 0;
  }
  mulMatRotateX(spainMatrix,bodys[1].objRotX);
  mulMatRotateY(spainMatrix,bodys[1].objRotY);
  mulMatRotateZ(spainMatrix,bodys[1].objRotZ); 
  mulMatScaling(spainMatrix,bodys[1].scaleX,bodys[1].scaleY,bodys[1].scaleZ);
  let waistspainMatrix = matMul(waistMatrix,spainMatrix);
  objectShadowMapPolygonPush(bodys,waistspainMatrix,1,moveObjects,sunViewMatrix);

  mulMatRotateX(headMatrix,bodys[1].objRotX);
  mulMatRotateY(headMatrix,bodys[1].objRotY);
  mulMatRotateZ(headMatrix,bodys[1].objRotZ); 
  mulMatScaling(headMatrix,bodys[1].scaleX,bodys[1].scaleY,bodys[1].scaleZ);
  let waistspainHeadMatrix = matMul(waistspainMatrix,headMatrix);
  objectShadowMapPolygonPush(bodys,waistspainHeadMatrix,1,moveObjects,sunViewMatrix);

	//cuberegister
	for(let num=0;num<cubes.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,cubes[num].centerObjX,cubes[num].centerObjY,cubes[num].centerObjZ);  
    mulMatRotateX(worldMatrix,cubes[num].objRotX);
    mulMatRotateY(worldMatrix,cubes[num].objRotY);
    mulMatRotateZ(worldMatrix,cubes[num].objRotZ); 
    mulMatScaling(worldMatrix,cubes[num].scaleX,cubes[num].scaleY,cubes[num].scaleZ);
    objectShadowMapPolygonPush(cubes,worldMatrix,num,moveObjects,sunViewMatrix);
	}
	//planesregister
	for(let num=0;num<planes.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,planes[num].centerObjX,planes[num].centerObjY,planes[num].centerObjZ);  
    mulMatRotateX(worldMatrix,planes[num].objRotX);
    mulMatRotateY(worldMatrix,planes[num].objRotY);
    mulMatRotateZ(worldMatrix,planes[num].objRotZ); 
    mulMatScaling(worldMatrix,planes[num].scaleX,planes[num].scaleY,planes[num].scaleZ);
    objectShadowMapPolygonPush(planes,worldMatrix,num,moveObjects,sunViewMatrix);
  }
  /*
  lookat = setVector3(moveObjects[lookatIndex].orgObject.centerObjX,moveObjects[lookatIndex].orgObject.centerObjY,moveObjects[lookatIndex].orgObject.centerObjZ);
  for(let i = spheres.length;i<spheres.length+monkeys.length+cubes.length;i++){
  	let currentObject = moveObjects[i];
  	let currentMaxMinCenter = vertsCulAABBMaxMinCenter(currentObject.orgObject,currentObject.worldMatrix,0,gravity,0);
  	for(let j = spheres.length;j<spheres.length+monkeys.length+cubes.length+planes.length;j++){
  		let gravityUnderMaxMinCenter = vertsCulAABBMaxMinCenter(moveObjects[j].orgObject,moveObjects[j].worldMatrix,0,0,0);
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
  }*/
let shadowMap = [];
renderbufferInit(shadowMap,SCREEN_SIZE_H,SCREEN_SIZE_W);
for(let j=0;j<moveObjects.length;j++){
	for(let i=0;i<moveObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(moveObjects[j].orgObject.backCullingFlag == true){
	    if(moveObjects[j].polygonList[i].crossZ<0){
        let image = null;
        let crossWorldVector3 = null;
        let UV = null;
       triangleToBuffer(shadowMap,null,1,image,moveObjects[j].polygonList[i].moveVertices,crossWorldVector3,UV);
        } 
	  }else{
      let image = null;
      let crossWorldVector3 = null;
      let UV = null;
     triangleToBuffer(shadowMap,null,1,image,moveObjects[j].polygonList[i].moveVertices,crossWorldVector3,UV);
	  }
	}
}
moveObjects = [];

	//blender2.7xjsonload
	for(let num=0;num<monkeys.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,monkeys[num].centerObjX,monkeys[num].centerObjY,monkeys[num].centerObjZ);  
    mulMatRotateX(worldMatrix,monkeys[num].objRotX);
    mulMatRotateY(worldMatrix,monkeys[num].objRotY);
    mulMatRotateZ(worldMatrix,monkeys[num].objRotZ); 
    mulMatScaling(worldMatrix,monkeys[num].scaleX,monkeys[num].scaleY,monkeys[num].scaleZ);
    objectPolygonPush(monkeys,worldMatrix,num,moveObjects,viewMatrix);	
  }
  //ボーンアニメーション
  waistMatrix = matIdentity();
      spainMatrix = matIdentity();
          headMatrix = matIdentity();

  mulMatTranslate(waistMatrix,bodys[0].centerObjX,bodys[0].centerObjY,bodys[0].centerObjZ);  
  mulMatRotateX(waistMatrix,bodys[0].objRotX);
  mulMatRotateY(waistMatrix,bodys[0].objRotY);
  mulMatRotateZ(waistMatrix,bodys[0].objRotZ); 
  mulMatScaling(waistMatrix,bodys[0].scaleX,bodys[0].scaleY,bodys[0].scaleZ);
  objectPolygonPush(bodys,waistMatrix,0,moveObjects,viewMatrix);

  mulMatRotateX(spainMatrix,bodys[1].objRotX);
  mulMatRotateY(spainMatrix,bodys[1].objRotY);
  mulMatRotateZ(spainMatrix,bodys[1].objRotZ); 
  mulMatScaling(spainMatrix,bodys[1].scaleX,bodys[1].scaleY,bodys[1].scaleZ);
  waistspainMatrix = matMul(waistMatrix,spainMatrix);
  objectPolygonPush(bodys,waistspainMatrix,1,moveObjects,viewMatrix);

  mulMatRotateX(headMatrix,bodys[2].objRotX);
  mulMatRotateY(headMatrix,bodys[2].objRotY);
  mulMatRotateZ(headMatrix,bodys[2].objRotZ); 
  mulMatScaling(headMatrix,bodys[2].scaleX,bodys[2].scaleY,bodys[2].scaleZ);
  waistspainHeadMatrix = matMul(waistspainMatrix,headMatrix);
  objectPolygonPush(bodys,waistspainHeadMatrix,2,moveObjects,viewMatrix);
	//cuberegister
	for(let num=0;num<cubes.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,cubes[num].centerObjX,cubes[num].centerObjY,cubes[num].centerObjZ);  
    mulMatRotateX(worldMatrix,cubes[num].objRotX);
    mulMatRotateY(worldMatrix,cubes[num].objRotY);
    mulMatRotateZ(worldMatrix,cubes[num].objRotZ); 
    mulMatScaling(worldMatrix,cubes[num].scaleX,cubes[num].scaleY,cubes[num].scaleZ);
    objectPolygonPush(cubes,worldMatrix,num,moveObjects,viewMatrix);
	}
	//planesregister
	for(let num=0;num<planes.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,planes[num].centerObjX,planes[num].centerObjY,planes[num].centerObjZ);  
    mulMatRotateX(worldMatrix,planes[num].objRotX);
    mulMatRotateY(worldMatrix,planes[num].objRotY);
    mulMatRotateZ(worldMatrix,planes[num].objRotZ); 
    mulMatScaling(worldMatrix,planes[num].scaleX,planes[num].scaleY,planes[num].scaleZ);
    objectPolygonPush(planes,worldMatrix,num,moveObjects,viewMatrix);
  }

let zBuffering = [];
renderbufferInit(zBuffering,SCREEN_SIZE_H,SCREEN_SIZE_W);
let newDate = new Date();
let newsecond = newDate.getMilliseconds();

for(let j=0;j<moveObjects.length;j++){
	for(let i=0;i<moveObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(moveObjects[j].orgObject.backCullingFlag == true){
	    if(moveObjects[j].polygonList[i].crossZ<0){
        triangleToBuffer(zBuffering,shadowMap,1,moveObjects[j].polygonList[i].image,moveObjects[j].polygonList[i].moveVertices,moveObjects[j].polygonList[i].crossWorldVector3,
          [
            moveObjects[j].polygonList[i].UV[0], moveObjects[j].polygonList[i].UV[1],
            moveObjects[j].polygonList[i].UV[2], moveObjects[j].polygonList[i].UV[3],
            moveObjects[j].polygonList[i].UV[4], moveObjects[j].polygonList[i].UV[5]
          ]
           );
	    } 
	  }else{
      triangleToBuffer(zBuffering,shadowMap,1,moveObjects[j].polygonList[i].image,moveObjects[j].polygonList[i].moveVertices,moveObjects[j].polygonList[i].crossWorldVector3,
        [
          moveObjects[j].polygonList[i].UV[0], moveObjects[j].polygonList[i].UV[1],
          moveObjects[j].polygonList[i].UV[2], moveObjects[j].polygonList[i].UV[3],
          moveObjects[j].polygonList[i].UV[4], moveObjects[j].polygonList[i].UV[5]
        ]
         );
	  }
	}
}
var myImageData = ctx.createImageData(SCREEN_SIZE_W, SCREEN_SIZE_H);

//レンダリングZバッファ作画
//ライトシミュレーション
for(let j=0;j<SCREEN_SIZE_H;j++){
	for(let i=0;i<SCREEN_SIZE_W;i++){
	let base = (j * SCREEN_SIZE_W + i) * 4;
		if(zBuffering[j][i][0].z < 99999){
      let getPixel = zBuffering[j][i][0];
      let sunVec = culVecNormalize(vecMinus(sunPos,sunLookat));
      let sunCosin = culVecDot(sunVec,zBuffering[j][i][0].crossWorldVector3);
      getPixel.r = getPixel.r*sunCosin*1.2;
      getPixel.g = getPixel.g*sunCosin*1.2;
      getPixel.b = getPixel.b*sunCosin*1.2;
    }
  }
}
for(let j=0;j<SCREEN_SIZE_H;j++){
	for(let i=0;i<SCREEN_SIZE_W;i++){
	let base = (j * SCREEN_SIZE_W + i) * 4;
		if(zBuffering[j][i][0].z < 99999){
      let getPixel = zBuffering[j][i][0];
          //シャドウマップ
      		//camera
					let pixelVector3 = setVector3(i,j,getPixel.z);
					//pixelVector3 = matVecMul(inverseViewPortMatrix,pixelVector3);
					pixelVector3[0] = pixelVector3[0]/SCREEN_SIZE_W  - 0.5;
					pixelVector3[1] = pixelVector3[1]/SCREEN_SIZE_H  - 0.5;
					//let projectionMatrix = matPers(pixelVector3[2]);
					//let inverseProjectionMatrix = matIdentity();
					//CalInvMat4x4(projectionMatrix,inverseProjectionMatrix);
					//getInverseMatrix(projectionMatrix);
					//pixelVector3 = matVecMul(inverseProjectionMatrix,pixelVector3);
					pixelVector3[0] *= pixelVector3[2];
					pixelVector3[1] *= pixelVector3[2];
					protMatVecMul(inverseViewMatrix,pixelVector3);
					//view
					protMatVecMul(sunViewMatrix,pixelVector3);
					//projectionMatrix = matPers(pixelVector3[2]);
					//pixelVector3 = matVecMul(projectionMatrix,pixelVector3);
					pixelVector3[0] /= pixelVector3[2];
					pixelVector3[1] /= pixelVector3[2];
					pixelVector3[0] = Math.floor((pixelVector3[0]  + 0.5)*SCREEN_SIZE_W);
					pixelVector3[1] = Math.floor((pixelVector3[1]  + 0.5)*SCREEN_SIZE_H);
					//pixelVector3 = matVecMul(viewPortMatrix,pixelVector3);
					//pixelVector3[0] = Math.floor(pixelVector3[0] + 0.5);
					//pixelVector3[1] = Math.floor(pixelVector3[1] + 0.5);
					if(pixelVector3[0]>0 && pixelVector3[0]<SCREEN_SIZE_W){
						if(pixelVector3[1]>0 && pixelVector3[1]<SCREEN_SIZE_H){
							if(shadowMap[pixelVector3[1]][pixelVector3[0]][0].z+0.2<pixelVector3[2]){
								getPixel.r = getPixel.r/2.2;
								getPixel.g = getPixel.g/2.2;
								getPixel.b = getPixel.b/2.2;	
              }
						}
					}
      //let getPixel = renderZBuffer[j][i].get();
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
newDate = new Date();
let aftersecond = newDate.getMilliseconds();
let result = aftersecond - newsecond;
//console.log(result);
ctx.putImageData(myImageData, 0, 0);

}, 1000/60);

document.addEventListener('keydown',e => {

  switch(e.key){
    case 'ArrowLeft':
      cameraPos[0] -= 0.1;
      break;
    case 'ArrowRight':
      cameraPos[0]  += 0.1;
      break;
    case 'ArrowUp': 
      cameraPos[1]  -= 0.1;
      break;
    case 'ArrowDown':
      cameraPos[1]  += 0.1;
      break;
    case 'u':
      cameraPos[2]  += 0.1;
      break;   
    case 'd':
      cameraPos[2]  -= 0.1;
      break;
    case '1':
      lookatIndex += 1;
      if(lookatIndex>1){
        lookatIndex = 0
      }
      break;
    case '2':

      break;
    case '3':

      break;
    case '4':
 
      break;
    case '5':

      break;
    case '6':

      break;
    case 'a':
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