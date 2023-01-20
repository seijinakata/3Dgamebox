//頂点にクラスを使うと重たくなる頂点演算のせい？
//classをjsonに置き換え中インスタンス製造じゃなくてただの文字列になるため軽くなると思われるから。
import {setVector2,setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize, round, roundVector2} from './vector.js';
import {matIdentity,mulMatTranslate,mulMatScaling, matMul,matVecMul,matPers,matCamera,mulMatRotateX,mulMatRotatePointX,mulMatRotateY,mulMatRotatePointY,mulMatRotateZ,mulMatRotatePointZ,getInverseMatrix, matRound4X4, protMatVecMul, CalInvMat4x4, matWaight, matPlus} from './matrix.js';
import {waistVerts,spineVerts,headVerts,orgPlaneVerts, orgCubeVerts, RightLeg1Verts, RightLeg2Verts, LeftLeg1Verts, LeftLeg2Verts, rightArm1Verts, rightArm2Verts, leftArm1Verts, leftArm2Verts} from './orgverts.js';
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
let cameraPos = setVector3(3,-1.5,-4);
let lookat = setVector3(0.0,0,1);
let sunPos = setVector3(0,-3,-2);
let sunLookat = setVector3(0.0,-0.0,0);
let up = setVector3(0,1,0);
let lookatIndex = 0;


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
   		let loadTempUV = [];
   		let loadUV = this.json.data.attributes.uv.array;
   		for(let i=0;i<this.json.data.attributes.uv.array.length;i+=this.json.data.attributes.uv.itemSize){
   			let u = loadUV[i] %1.0;
   			let v = loadUV[i+1] %1.0;
	        u = (u < 0) ? 1 + u : u;
	        v = (v < 0) ? v * -1 : 1 - v;
   			let tempUV = [u,v];
   			loadTempUV.push(tempUV);  		
   		}
   		//this.mainObject.UV = mainUV;
   		//indexLoad頂点の結び順外積負の向き
   		let mainFaceIndex = [];
   		let loadFaceIndexVertices = this.json.data.index.array;
   		const triangleIndex = 3;
   		for(let i=0;i<this.json.data.index.array.length;i+=triangleIndex){
   		  let tempFaceInde = setFaceIndex(loadFaceIndexVertices[i],loadFaceIndexVertices[i+2],loadFaceIndexVertices[i+1]);
   			mainFaceIndex.push(tempFaceInde);
   		}
      let triangleIndexUV = [];
      for(let i=0;i<this.json.data.index.array.length;i+=triangleIndex){
        let u1 = loadTempUV[loadFaceIndexVertices[i]][0];
        let v1 = loadTempUV[loadFaceIndexVertices[i]][1];
        let u2 = loadTempUV[loadFaceIndexVertices[i+2]][0];
        let v2 = loadTempUV[loadFaceIndexVertices[i+2]][1];
        let u3 = loadTempUV[loadFaceIndexVertices[i+1]][0];
        let v3 = loadTempUV[loadFaceIndexVertices[i+1]][1];
        let tempUV =  [{"u":u1,"v":v1},{"u":u2,"v":v2},{"u":u3,"v":v3}];
        triangleIndexUV.push(tempUV);
      }
      this.mainObject.UV = triangleIndexUV
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
  
  constructor(verts,x,y,z,RotX,RotY,RotZ,scalex,scaley,scalez,numCorners,backGroundFlag,backCullingFlag,img){
    
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
    this.verts = JSON.parse(JSON.stringify(verts.vertsPosition));
    this.faceIndex = verts.faceIndex;
    this.bonesIndex = verts.bonesIndex;
    this.bonesWaight = verts.bonesWaight;
    this.UV = verts.uv;
    this.faceUV = [];
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
  //ライトシミュレーション用
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
//スキンメッシュ用
function objectSkinMeshPolygonPush(objects,bones,objectNumber,projectedObjects,viewMatrix){
  let worldVerts = [];
  let projectedVerts = [];
  let mixMatrix = [];
  let object = objects[objectNumber];

  for (var i = 0; i < object.verts.length; i++) {
    let mixMatrix = [0,0,0,0,
                    0,0,0,0,
                    0,0,0,0,
                    0,0,0,0];
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);
    for(let j=0;j<object.bonesIndex[i].length;j++){
      let bonesMatrix = bones[object.bonesIndex[i][j]];
      let matrixWaight = object.bonesWaight[i][j];
      let waightMatrix = matWaight(bonesMatrix,matrixWaight);
      mixMatrix = matPlus(mixMatrix,waightMatrix); 
    }
    let verts = matVecMul(mixMatrix,object.verts[i])
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
    let UV = [
          object.UV[i][0].u, object.UV[i][0].v,
          object.UV[i][1].u, object.UV[i][1].v,
          object.UV[i][2].u, object.UV[i][2].v,
          ]
    Poly.push(setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],UV,object.image));
  }

  let tempMoveObject = new moveObject(object,mixMatrix,Poly);
  projectedObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
//シャドウマップ用ポリゴン格納
function objectShadowMapSkinMeshPolygonPush(objects,bones,objectNumber,projectedObjects,viewMatrix){
  let projectedVerts = [];
  let object = objects[objectNumber];
  let mixMatrix = [];
  for (var i = 0; i < object.verts.length; i++) {
    mixMatrix = [0,0,0,0,
                  0,0,0,0,
                  0,0,0,0,
                  0,0,0,0];
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);
    for(let j=0;j<object.bonesIndex[i].length;j++){
      let bonesMatrix = bones[object.bonesIndex[i][j]];
      let matrixWaight = object.bonesWaight[i][j];
      let waightMatrix = matWaight(bonesMatrix,matrixWaight);
      mixMatrix = matPlus(mixMatrix,waightMatrix); 
    }
    let verts = matVecMul(mixMatrix,object.verts[i])
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
    Poly.push(setShadowPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]]));
  }
  let tempMoveObject = new moveObject(object,mixMatrix,Poly);
  projectedObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}

//ボーンなし
function objectPolygonPush(objects,worldMatrix,objectNumber,projectedObjects,viewMatrix){
  let worldVerts = [];
  let projectedVerts = [];
  let mixMatrix = [];
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
    let UV = [
          object.UV[i][0].u, object.UV[i][0].v,
          object.UV[i][1].u, object.UV[i][1].v,
          object.UV[i][2].u, object.UV[i][2].v,
          ]
    Poly.push(setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],UV,object.image));
  }

  let tempMoveObject = new moveObject(object,worldMatrix,Poly);
  projectedObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
//シャドウマップ用ポリゴン格納
function objectShadowMapPolygonPush(objects,worldMatrix,objectNumber,projectedObjects,viewMatrix){
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
  projectedObjects.push(tempMoveObject);
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
	let monkeyVerts = {};
  monkeyVerts.vertsPosition = [];
	monkeys.push(new Object(monkeyVerts,-1.0,-0.6,0,180,0,0,0.5,0.5,0.5,0,false,true,monkeyPixelImage));
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

let planeFaceIndex = [];
//上面
planeFaceIndex.push(setFaceIndex(4,5,0));
planeFaceIndex.push(setFaceIndex(1,0,5));

let bodys = [];
//一番下は-0.27から積み重ねる場合+0.5,-0.27
cubeImage.addEventListener("load", function() {
	cubePixelImage = pictureToPixelMap(backCtx,cubeImage);
  //waist
	bodys.push(new Object(waistVerts,0,-1.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //RightLeg1Verts
	bodys.push(new Object(RightLeg1Verts,0,-1,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //RightLeg2Verts
	bodys.push(new Object(RightLeg2Verts,0,-0.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //LeftLeg1Verts
	bodys.push(new Object(LeftLeg1Verts,0,-1,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //LeftLeg2Verts
	bodys.push(new Object(LeftLeg2Verts,0,-0.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));

  //spine
	bodys.push(new Object(spineVerts,0,-1.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //rightArm1
  bodys.push(new Object(rightArm1Verts,-0.25,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //rightArm2
  bodys.push(new Object(rightArm2Verts,-0.75,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //leftArm1
  bodys.push(new Object(leftArm1Verts,0.25,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //leftArm2
  bodys.push(new Object(leftArm2Verts,0.75,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //head
	bodys.push(new Object(headVerts,0,-2,0,0,0,0,1,1,1,0,false,true,cubePixelImage));

	cubes.push(new Object(orgCubeVerts,-0.0,-1.0,0.0,0,0,0,1,1,1,0,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,0.6,-0.90,1,0,0,0,1,1,1,0,false,true,cubePixelImage));
  cubes.push(new Object(orgCubeVerts,1.5,-1.35,0.5,0,0,0,1,1,1,0,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-1.5,-1.35,1,0,0,0,1,1,1,0,false,true,cubePixelImage));
}, true);

//ground
let planes = [];
let roadImage = new Image();
roadImage.src = 'road.png';

let roadPixelImage = [];

roadImage.addEventListener("load", function() {
	roadPixelImage = pictureToPixelMap(backCtx,roadImage);
  planes.push(new Object(orgPlaneVerts,0,0,0.0,0,0,0,2.5,1,3,0,false,false,roadPixelImage));
  planes.push(new Object(orgPlaneVerts,0,0,1.5,0,0,0,2.5,1,3,0,false,false,roadPixelImage));
  planes.push(new Object(orgPlaneVerts,0,0,3.0,0,0,0,2.5,1,3,0,false,false,roadPixelImage));

}, true);

let groundImage = new Image();
groundImage.src = 'sand.jpg';

let sandPixelImage = [];

groundImage.addEventListener("load", function() {
	sandPixelImage = pictureToPixelMap(backCtx,groundImage);
  planes.push(new Object(orgPlaneVerts,-1.25,0,0.0,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,-1.25,0,1.5,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,-1.25,0,3.0,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,0.0,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,1.5,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,3.0,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
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
let newDate = new Date();
let newsecond = newDate.getMilliseconds();
//lookat = setVector3(shadowProjectedObjects[lookatIndex].orgObject.centerObjX,shadowProjectedObjects[lookatIndex].orgObject.centerObjY,shadowProjectedObjects[lookatIndex].orgObject.centerObjZ);
  viewMatrix = matIdentity();
  matCamera(viewMatrix,cameraPos,lookat,up);
  matRound4X4(viewMatrix);

  inverseViewMatrix = matIdentity();
  CalInvMat4x4(viewMatrix,inverseViewMatrix);
  matRound4X4(inverseViewMatrix);

  sunViewMatrix = matIdentity();
  matCamera(sunViewMatrix,sunPos,sunLookat,up);
  matRound4X4(sunViewMatrix);

  //シャドウの投影後の情報格納
  let shadowProjectedObjects = [];
  //投影後の情報格納
  let projectedObjects = [];

  //sphereregister
  /*
  for(let num =0;num<spheres.length;num++){
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
    shadowProjectedObjects.push(movesphere);
  }*/
	//blender2.7xjsonload
	for(let num=0;num<monkeys.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,monkeys[num].centerObjX,monkeys[num].centerObjY,monkeys[num].centerObjZ);  
    mulMatRotateX(worldMatrix,monkeys[num].objRotX);
    mulMatRotateY(worldMatrix,monkeys[num].objRotY);
    mulMatRotateZ(worldMatrix,monkeys[num].objRotZ); 
    mulMatScaling(worldMatrix,monkeys[num].scaleX,monkeys[num].scaleY,monkeys[num].scaleZ);
    objectShadowMapPolygonPush(monkeys,worldMatrix,num,shadowProjectedObjects,sunViewMatrix);
    objectPolygonPush(monkeys,worldMatrix,num,projectedObjects,viewMatrix);	
  }
  
  let s = Math.sin(theta);
  let ns = s<0 ? -s : s;
  bodys[1].objRotX =  Math.floor(60 * s);
  bodys[2].objRotX =  Math.floor(-60 * s);

  bodys[3].objRotX =  Math.floor(-60 * s);
  bodys[4].objRotX =  Math.floor(60 * s);

  bodys[5].objRotX =  Math.floor(60 * ns);

  bodys[6].objRotY =  Math.floor(-60 * s);
  bodys[7].objRotY =  Math.floor(-60 * s);

  bodys[8].objRotY =  Math.floor(-60 * s);
  bodys[9].objRotY =  Math.floor(-60 * s);

  bodys[10].objRotX =  Math.floor(60 * ns);



  //bodys[0].objRotZ += 10;
  theta += 0.4;
  if(theta >=2000){
    theta = 0;
  }

  let masterMatrix = matIdentity();
    let waistMatrix = matIdentity();
        let rightLeg1Matrix = matIdentity();
        let rightLeg2Matrix = matIdentity();
        let leftLeg1Matrix = matIdentity();
        let leftLeg2Matrix = matIdentity();
        let spainMatrix = matIdentity();
          let rightArm1Matrix = matIdentity();
          let rightArm2Matrix = matIdentity();
          let leftArm1Matrix = matIdentity();
          let leftArm2Matrix = matIdentity();
          let headMatrix = matIdentity();


  let masterXYZ = setVector3(1,-0.2,0);
  let masterRotXYZ = setVector3(0,0,0);
  let masterScalingXYZ = setVector3(0.7,0.7,0.7);

  let boxHumanBones = [];
  
  mulMatTranslate(masterMatrix,masterXYZ[0],masterXYZ[1],masterXYZ[2]);  
  mulMatRotateX(masterMatrix,masterRotXYZ[0]);
  mulMatRotateY(masterMatrix,masterRotXYZ[1]);
  mulMatRotateZ(masterMatrix,masterRotXYZ[2]);
  mulMatScaling(masterMatrix,masterScalingXYZ[0],masterScalingXYZ[1],masterScalingXYZ[2]);
  //waist
  mulMatTranslate(waistMatrix,bodys[0].centerObjX,bodys[0].centerObjY,bodys[0].centerObjZ);  
  mulMatRotateX(waistMatrix,bodys[0].objRotX);
  mulMatRotateY(waistMatrix,bodys[0].objRotY);
  mulMatRotateZ(waistMatrix,bodys[0].objRotZ);
  mulMatScaling(waistMatrix,bodys[0].scaleX,bodys[0].scaleY,bodys[0].scaleZ);
  //これが原点移動のボーンオフセット行列
  mulMatTranslate(waistMatrix,-bodys[0].centerObjX,-bodys[0].centerObjY,-bodys[0].centerObjZ);  
  
  waistMatrix = matMul(masterMatrix,waistMatrix);
  boxHumanBones.push(waistMatrix);

  //rightLeg
  mulMatTranslate(rightLeg1Matrix,bodys[1].centerObjX,bodys[1].centerObjY,bodys[1].centerObjZ);  
  mulMatRotateX(rightLeg1Matrix,bodys[1].objRotX);
  mulMatRotateY(rightLeg1Matrix,bodys[1].objRotY);
  mulMatRotateZ(rightLeg1Matrix,bodys[1].objRotZ);
  mulMatScaling(rightLeg1Matrix,bodys[1].scaleX,bodys[1].scaleY,bodys[1].scaleZ);
  mulMatTranslate(rightLeg1Matrix,-bodys[1].centerObjX,-bodys[1].centerObjY,-bodys[1].centerObjZ);  
  let waistRightLeg1Matrix = matMul(waistMatrix,rightLeg1Matrix);
  boxHumanBones.push(waistRightLeg1Matrix);
  
  mulMatTranslate(rightLeg2Matrix,bodys[2].centerObjX,bodys[2].centerObjY,bodys[2].centerObjZ);  
  mulMatRotateX(rightLeg2Matrix,bodys[2].objRotX);
  mulMatRotateY(rightLeg2Matrix,bodys[2].objRotY);
  mulMatRotateZ(rightLeg2Matrix,bodys[2].objRotZ);
  mulMatScaling(rightLeg2Matrix,bodys[2].scaleX,bodys[2].scaleY,bodys[2].scaleZ);
  mulMatTranslate(rightLeg2Matrix,-bodys[2].centerObjX,-bodys[2].centerObjY,-bodys[2].centerObjZ);  
  
  let waistRightLeg12Matrix = matMul(waistRightLeg1Matrix,rightLeg2Matrix);
  boxHumanBones.push(waistRightLeg12Matrix);
  //leftLeg
  mulMatTranslate(leftLeg1Matrix,bodys[3].centerObjX,bodys[3].centerObjY,bodys[3].centerObjZ);
  mulMatRotateX(leftLeg1Matrix,bodys[3].objRotX);
  mulMatRotateY(leftLeg1Matrix,bodys[3].objRotY);
  mulMatRotateZ(leftLeg1Matrix,bodys[3].objRotZ);
  mulMatScaling(leftLeg1Matrix,bodys[3].scaleX,bodys[3].scaleY,bodys[3].scaleZ);
  mulMatTranslate(leftLeg1Matrix,-bodys[3].centerObjX,-bodys[3].centerObjY,-bodys[3].centerObjZ);  
  
  let waistleftLeg1Matrix = matMul(waistMatrix,leftLeg1Matrix);
  boxHumanBones.push(waistleftLeg1Matrix);

  mulMatTranslate(leftLeg2Matrix,bodys[4].centerObjX,bodys[4].centerObjY,bodys[4].centerObjZ);  
  mulMatRotateX(leftLeg2Matrix,bodys[4].objRotX);
  mulMatRotateY(leftLeg2Matrix,bodys[4].objRotY);
  mulMatRotateZ(leftLeg2Matrix,bodys[4].objRotZ);
  mulMatScaling(leftLeg2Matrix,bodys[4].scaleX,bodys[4].scaleY,bodys[4].scaleZ);
  mulMatTranslate(leftLeg2Matrix,-bodys[4].centerObjX,-bodys[4].centerObjY,-bodys[4].centerObjZ);  
  
  let waistleftLeg12Matrix = matMul(waistleftLeg1Matrix,leftLeg2Matrix);
  boxHumanBones.push(waistleftLeg12Matrix);

  //spain
  mulMatTranslate(spainMatrix,bodys[5].centerObjX,bodys[5].centerObjY,bodys[5].centerObjZ);  
  mulMatRotateX(spainMatrix,bodys[5].objRotX);
  mulMatRotateY(spainMatrix,bodys[5].objRotY);
  mulMatRotateZ(spainMatrix,bodys[5].objRotZ);
  mulMatScaling(spainMatrix,bodys[5].scaleX,bodys[5].scaleY,bodys[5].scaleZ);
  mulMatTranslate(spainMatrix,-bodys[5].centerObjX,-bodys[5].centerObjY,-bodys[5].centerObjZ);  
  
  let spainWaistMatrix = matMul(waistMatrix,spainMatrix);
  boxHumanBones.push(spainWaistMatrix);

  //rightArm
  mulMatTranslate(rightArm1Matrix,bodys[6].centerObjX,bodys[6].centerObjY,bodys[6].centerObjZ);  
  mulMatRotateX(rightArm1Matrix,bodys[6].objRotX);
  mulMatRotateY(rightArm1Matrix,bodys[6].objRotY);
  mulMatRotateZ(rightArm1Matrix,bodys[6].objRotZ);
  mulMatScaling(rightArm1Matrix,bodys[6].scaleX,bodys[6].scaleY,bodys[6].scaleZ);
  mulMatTranslate(rightArm1Matrix,-bodys[6].centerObjX,-bodys[6].centerObjY,-bodys[6].centerObjZ);  
  
  let spainWaistRightArm1Matrix = matMul(spainWaistMatrix,rightArm1Matrix);
  boxHumanBones.push(spainWaistRightArm1Matrix);

  mulMatTranslate(rightArm2Matrix,bodys[7].centerObjX,bodys[7].centerObjY,bodys[7].centerObjZ);  
  mulMatRotateX(rightArm2Matrix,bodys[7].objRotX);
  mulMatRotateY(rightArm2Matrix,bodys[7].objRotY);
  mulMatRotateZ(rightArm2Matrix,bodys[7].objRotZ);
  mulMatScaling(rightArm2Matrix,bodys[7].scaleX,bodys[7].scaleY,bodys[7].scaleZ);
  mulMatTranslate(rightArm2Matrix,-bodys[7].centerObjX,-bodys[7].centerObjY,-bodys[7].centerObjZ);  
  
  let spainWaistRightArm12Matrix = matMul(spainWaistRightArm1Matrix,rightArm2Matrix);
  boxHumanBones.push(spainWaistRightArm12Matrix);

  //leftArm
  mulMatTranslate(leftArm1Matrix,bodys[8].centerObjX,bodys[8].centerObjY,bodys[8].centerObjZ);  
  mulMatRotateX(leftArm1Matrix,bodys[8].objRotX);
  mulMatRotateY(leftArm1Matrix,bodys[8].objRotY);
  mulMatRotateZ(leftArm1Matrix,bodys[8].objRotZ);
  mulMatScaling(leftArm1Matrix,bodys[8].scaleX,bodys[8].scaleY,bodys[8].scaleZ);
  mulMatTranslate(leftArm1Matrix,-bodys[8].centerObjX,-bodys[8].centerObjY,-bodys[8].centerObjZ);  
  
  let spainWaistLeftArm1Matrix = matMul(spainWaistMatrix,leftArm1Matrix);
  boxHumanBones.push(spainWaistLeftArm1Matrix);

  mulMatTranslate(leftArm2Matrix,bodys[9].centerObjX,bodys[9].centerObjY,bodys[9].centerObjZ);  
  mulMatRotateX(leftArm2Matrix,bodys[9].objRotX);
  mulMatRotateY(leftArm2Matrix,bodys[9].objRotY);
  mulMatRotateZ(leftArm2Matrix,bodys[9].objRotZ);
  mulMatScaling(leftArm2Matrix,bodys[9].scaleX,bodys[9].scaleY,bodys[9].scaleZ);
  mulMatTranslate(leftArm2Matrix,-bodys[9].centerObjX,-bodys[9].centerObjY,-bodys[9].centerObjZ);  
  
  let spainWaistLeftArm12Matrix = matMul(spainWaistLeftArm1Matrix,leftArm2Matrix);
  boxHumanBones.push(spainWaistLeftArm12Matrix);
  //head
  mulMatTranslate(headMatrix,bodys[10].centerObjX,bodys[10].centerObjY,bodys[10].centerObjZ);  
  mulMatRotateX(headMatrix,bodys[10].objRotX);
  mulMatRotateY(headMatrix,bodys[10].objRotY);
  mulMatRotateZ(headMatrix,bodys[10].objRotZ);
  mulMatScaling(headMatrix,bodys[10].scaleX,bodys[10].scaleY,bodys[10].scaleZ);
  mulMatTranslate(headMatrix,-bodys[10].centerObjX,-bodys[10].centerObjY,-bodys[10].centerObjZ); 

  let spainWaistHeadMatrix = matMul(spainWaistMatrix,headMatrix);
  boxHumanBones.push(spainWaistHeadMatrix);
 
  //waist
  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,0,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,0,projectedObjects,viewMatrix);

  //rightLeg
  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,1,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,1,projectedObjects,viewMatrix);

  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,2,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,2,projectedObjects,viewMatrix);

  //leftLeg
  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,3,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,3,projectedObjects,viewMatrix);

  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,4,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,4,projectedObjects,viewMatrix);

  //spain
  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,5,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,5,projectedObjects,viewMatrix);

  //rightArm
  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,6,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,6,projectedObjects,viewMatrix);

  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,7,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,7,projectedObjects,viewMatrix);

  //leftArm
  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,8,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,8,projectedObjects,viewMatrix);

  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,9,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,9,projectedObjects,viewMatrix);

  //head
  objectShadowMapSkinMeshPolygonPush(bodys,boxHumanBones,10,shadowProjectedObjects,sunViewMatrix);
  objectSkinMeshPolygonPush(bodys,boxHumanBones,10,projectedObjects,viewMatrix);

	//cuberegister
	for(let num=0;num<cubes.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,cubes[num].centerObjX,cubes[num].centerObjY,cubes[num].centerObjZ);  
    mulMatRotateX(worldMatrix,cubes[num].objRotX);
    mulMatRotateY(worldMatrix,cubes[num].objRotY);
    mulMatRotateZ(worldMatrix,cubes[num].objRotZ); 
    mulMatScaling(worldMatrix,cubes[num].scaleX,cubes[num].scaleY,cubes[num].scaleZ);
    objectShadowMapPolygonPush(cubes,worldMatrix,num,shadowProjectedObjects,sunViewMatrix);
    objectPolygonPush(cubes,worldMatrix,num,projectedObjects,viewMatrix);
	}
  
	//planesregister
	for(let num=0;num<planes.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,planes[num].centerObjX,planes[num].centerObjY,planes[num].centerObjZ);  
    mulMatRotateX(worldMatrix,planes[num].objRotX);
    mulMatRotateY(worldMatrix,planes[num].objRotY);
    mulMatRotateZ(worldMatrix,planes[num].objRotZ); 
    mulMatScaling(worldMatrix,planes[num].scaleX,planes[num].scaleY,planes[num].scaleZ);
    objectShadowMapPolygonPush(planes,worldMatrix,num,shadowProjectedObjects,sunViewMatrix);
    objectPolygonPush(planes,worldMatrix,num,projectedObjects,viewMatrix);
  }
  
  /*
  lookat = setVector3(shadowProjectedObjects[lookatIndex].orgObject.centerObjX,shadowProjectedObjects[lookatIndex].orgObject.centerObjY,shadowProjectedObjects[lookatIndex].orgObject.centerObjZ);
  for(let i = spheres.length;i<spheres.length+monkeys.length+cubes.length;i++){
  	let currentObject = shadowProjectedObjects[i];
  	let currentMaxMinCenter = vertsCulAABBMaxMinCenter(currentObject.orgObject,currentObject.worldMatrix,0,gravity,0);
  	for(let j = spheres.length;j<spheres.length+monkeys.length+cubes.length+planes.length;j++){
  		let gravityUnderMaxMinCenter = vertsCulAABBMaxMinCenter(shadowProjectedObjects[j].orgObject,shadowProjectedObjects[j].worldMatrix,0,0,0);
  	  if(AABBcollision(currentMaxMinCenter,gravityUnderMaxMinCenter) == true && (currentObject.orgObject.centerObjY<shadowProjectedObjects[j].orgObject.centerObjY)){
        currentObject.gravityCollision = true;
        break;
	    }
	  }
  }
  for(let i = spheres.length;i<spheres.length+monkeys.length+cubes.length;i++){
  	if(shadowProjectedObjects[i].gravityCollision == false){
  		shadowProjectedObjects[i].orgObject.centerObjY += gravity;
  	}
  }*/
let shadowMap = [];
renderbufferInit(shadowMap,SCREEN_SIZE_H,SCREEN_SIZE_W);
for(let j=0;j<shadowProjectedObjects.length;j++){
	for(let i=0;i<shadowProjectedObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(shadowProjectedObjects[j].orgObject.backCullingFlag == true){
	    if(shadowProjectedObjects[j].polygonList[i].crossZ<0){
        let image = null;
        let crossWorldVector3 = null;
        let UV = null;
       triangleToBuffer(shadowMap,null,1,image,shadowProjectedObjects[j].polygonList[i].moveVertices,crossWorldVector3,UV);
        } 
	  }else{
      let image = null;
      let crossWorldVector3 = null;
      let UV = null;
     triangleToBuffer(shadowMap,null,1,image,shadowProjectedObjects[j].polygonList[i].moveVertices,crossWorldVector3,UV);
	  }
	}
}
let zBuffering = [];
renderbufferInit(zBuffering,SCREEN_SIZE_H,SCREEN_SIZE_W);
for(let j=0;j<projectedObjects.length;j++){
	for(let i=0;i<projectedObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(projectedObjects[j].orgObject.backCullingFlag == true){
	    if(projectedObjects[j].polygonList[i].crossZ<0){
        triangleToBuffer(zBuffering,shadowMap,1,projectedObjects[j].polygonList[i].image,projectedObjects[j].polygonList[i].moveVertices,projectedObjects[j].polygonList[i].crossWorldVector3,
          [
            projectedObjects[j].polygonList[i].UV[0], projectedObjects[j].polygonList[i].UV[1],
            projectedObjects[j].polygonList[i].UV[2], projectedObjects[j].polygonList[i].UV[3],
            projectedObjects[j].polygonList[i].UV[4], projectedObjects[j].polygonList[i].UV[5]
          ]
           );
	    } 
	  }else{
      triangleToBuffer(zBuffering,shadowMap,1,projectedObjects[j].polygonList[i].image,projectedObjects[j].polygonList[i].moveVertices,projectedObjects[j].polygonList[i].crossWorldVector3,
        [
          projectedObjects[j].polygonList[i].UV[0], projectedObjects[j].polygonList[i].UV[1],
          projectedObjects[j].polygonList[i].UV[2], projectedObjects[j].polygonList[i].UV[3],
          projectedObjects[j].polygonList[i].UV[4], projectedObjects[j].polygonList[i].UV[5]
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