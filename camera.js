//頂点にクラスを使うと重たくなる頂点演算のせい？
import {setVector2,setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize} from './vector.js';
import {matIdentity,mulMatTranslate,mulMatScaling, matMul,matVecMul,matPers,matCamera,mulMatRotateX,mulMatRotateY,mulMatRotateZ, getInverseMatrix} from './matrix.js';
import {rgCubeVerts,rgPlaneVerts,orgPlaneVerts, orgCubeVerts} from './orgverts.js';
import {renderBuffer,pixel,bufferPixelInit,bufferInit,pictureToPixelMap,dotPaint,dotLineBufferRegister,triangleRasterize,textureTransform,triangleToBuffer,sort_index,branch} from './paint.js';

export const SCREEN_SIZE_W = 1000;
export const SCREEN_SIZE_H = 800;

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
let inverseViewPortMatrix = getInverseMatrix(viewPortMatrix);
let viewMatrix = matIdentity();
let inverseViewMatrix = matIdentity();
let sunViewMatrix = matIdentity();
// Camera
let cameraPos = setVector3(0,-2,-3);
let lookat = setVector3(0.0,-0.0,1);
let sunPos = setVector3(0,-6,5);
let sunLookat = setVector3(0.0,-0.0,0);
let up = setVector3(0,1,0);
let lookatIndex = 0;

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
   		tempVertices.push(loadVertices[i]);
			tempVertices.push(loadVertices[i+1]);
			tempVertices.push(loadVertices[i+2]);
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
    let Va = vecMinus(Pos1,Pos2);
    let Vb = vecMinus(Pos3,Pos1);
    this.crossVector3 = culVecCross(Va,Vb);
  }
  BufferRegister(renderZBuffer,shadowMap,inverseViewMatrix,inverseViewPortMatrix,sunViewMatrix,viewPortMatrix){
	triangleToBuffer(renderZBuffer,shadowMap,inverseViewMatrix,inverseViewPortMatrix,sunViewMatrix,viewPortMatrix,1,this.image,this.moveVertices,
    [
      this.UV[0], this.UV[1],
      this.UV[2], this.UV[3],
      this.UV[4], this.UV[5]
    ]
     );
  }
}
function objectPolygonPush(objects,objectNumber,moveObjects,viewMatrix){
  let worldVerts = [];
  let object = objects[objectNumber];
  let worldMatrix = matIdentity();
  mulMatTranslate(worldMatrix,object.centerObjX,object.centerObjY,object.centerObjZ);  
  mulMatRotateX(worldMatrix,object.objRotX);
  mulMatRotateY(worldMatrix,object.objRotY); 
  mulMatRotateZ(worldMatrix,object.objRotZ);
  mulMatScaling(worldMatrix,object.scaleX,object.scaleY,object.scaleZ);
  let worldViewMatrix = matMul(viewMatrix,worldMatrix);
  for (var i = 0; i < object.verts.length; i++) {
    worldVerts.push(matVecMul(worldViewMatrix,object.verts[i]));
    let projectionMatrix = matIdentity();
    matPers(projectionMatrix,worldVerts[i][2])
    worldVerts[i] = matVecMul(projectionMatrix,worldVerts[i]);
    //worldVerts[i] = matVecMul(viewPortMatrix,worldVerts[i]);
    worldVerts[i][0] = Math.floor((worldVerts[i][0] + 0.5)*SCREEN_SIZE_W);
    worldVerts[i][1] = Math.floor((worldVerts[i][1] + 0.5)*SCREEN_SIZE_H);
  }
 
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
    Poly.push(new Polygon(worldVerts[triangleIndex.faceIndex[0]],worldVerts[triangleIndex.faceIndex[1]],worldVerts[triangleIndex.faceIndex[2]],UV,object.image));
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
	monkeys.push(new Object(monkeyVerts,0.0,-0.6,1.5,-180,0,0,0.5,0.5,0.5,0,faceIndex,uv,faceUV,false,true,monkeyPixelImage));
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
/**/
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
	cubes.push(new Object(orgCubeVerts,0,-1.8,2.5,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
  cubes.push(new Object(orgCubeVerts,-1.0,-1.1,2.0,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-0.6,-0.90,3.0,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,0.6,-0.90,3,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,1.5,-0.35,0.5,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-1.5,-0.35,4,0,0,0,1,1,1,0,cubeFaceIndex,cubePlaneUV,cubeFaceUV,false,true,cubePixelImage));
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
  inverseViewMatrix = getInverseMatrix(viewMatrix);
  sunViewMatrix = matIdentity();
  matCamera(sunViewMatrix,sunPos,sunLookat,up);

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
		//objectPolygonPush(monkeys,num,moveObjects,viewMatrix);
    objectPolygonPush(monkeys,num,moveObjects,sunViewMatrix);
	}
	//cuberegister
	for(let num=0;num<cubes.length;num++){
		//objectPolygonPush(cubes,num,moveObjects,viewMatrix);
    objectPolygonPush(cubes,num,moveObjects,sunViewMatrix);
	}
	//planesregister
	for(let num=0;num<planes.length;num++){
		//objectPolygonPush(planes,num,moveObjects,viewMatrix);
    objectPolygonPush(planes,num,moveObjects,sunViewMatrix);
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
let shadowMap = bufferInit(SCREEN_SIZE_H,SCREEN_SIZE_W);
//シャドウマップ用に＋１して0から200の行列を作る。小数点3桁まで。
let Map = bufferInit(100,100);

for(let j=0;j<moveObjects.length;j++){
	for(let i=0;i<moveObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(moveObjects[j].orgObject.backCullingFlag == true){
	    if(moveObjects[j].polygonList[i].crossVector3[2]<0){
		  moveObjects[j].polygonList[i].BufferRegister(shadowMap,null,inverseViewMatrix,inverseViewPortMatrix,sunViewMatrix,viewPortMatrix);
	    } 
	  }else{
		  moveObjects[j].polygonList[i].BufferRegister(shadowMap,null,inverseViewMatrix,inverseViewPortMatrix,sunViewMatrix,viewPortMatrix);
	  }
	}
}
moveObjects = [];
let renderZBuffer = bufferInit(SCREEN_SIZE_H,SCREEN_SIZE_W);
  
	//blender2.7xjsonload
	for(let num=0;num<monkeys.length;num++){
		objectPolygonPush(monkeys,num,moveObjects,viewMatrix);
    //objectPolygonPush(monkeys,num,moveObjects,sunViewMatrix);

	}
	//cuberegister
	for(let num=0;num<cubes.length;num++){
		objectPolygonPush(cubes,num,moveObjects,viewMatrix);
    //objectPolygonPush(cubes,num,moveObjects,viewMatrix);

	}
	//planesregister
	for(let num=0;num<planes.length;num++){
		objectPolygonPush(planes,num,moveObjects,viewMatrix);
    //objectPolygonPush(planes,num,moveObjects,sunViewMatrix);

	}
for(let j=0;j<moveObjects.length;j++){
	for(let i=0;i<moveObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(moveObjects[j].orgObject.backCullingFlag == true){
	    if(moveObjects[j].polygonList[i].crossVector3[2]<0){
		  moveObjects[j].polygonList[i].BufferRegister(renderZBuffer,shadowMap,inverseViewMatrix,inverseViewPortMatrix,sunViewMatrix,viewPortMatrix);
	    } 
	  }else{
		  moveObjects[j].polygonList[i].BufferRegister(renderZBuffer,shadowMap,inverseViewMatrix,inverseViewPortMatrix,sunViewMatrix,viewPortMatrix);
	  }
	}
}
var myImageData = ctx.createImageData(SCREEN_SIZE_W, SCREEN_SIZE_H);

//レンダリングZバッファ作画
for(let j=0;j<SCREEN_SIZE_H;j++){
	for(let i=0;i<SCREEN_SIZE_W;i++){
	let base = (j * SCREEN_SIZE_W + i) * 4;
		if(renderZBuffer[j][i].getZ() < 99999){
      let getPixel = renderZBuffer[j][i].get();
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