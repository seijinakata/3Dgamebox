import {M22, drawTriangle} from './texture.mjs';
import {rgCubeVerts,orgPlaneVerts, orgCubeVerts} from './orgverts.mjs';
import {renderBuffer,pixel,bufferPixelInit,bufferInit,pictureToPixelMap,dotPaint,dotLineBufferRegister,triangleRasterize,textureTransform,triangleToBuffer} from './paint.mjs';

const SCREEN_SIZE_W = 1000;
const SCREEN_SIZE_H = 800;

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
c.width = SCREEN_SIZE_W;
c.height = SCREEN_SIZE_H;

var canvas = document.getElementById('backmyCanvas');
var backCtx = canvas.getContext('2d');
canvas.width = SCREEN_SIZE_W;
canvas.height = SCREEN_SIZE_H;

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

// Camera
let CRotX = 0,
    CRotY = 0,
    CRotZ = 0,

    Cx = 0,
    Cy = -1.0,
    Cz = 0,
 
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
    this.centerX = (parseFloat(this.moveVertices[0][0]) + parseFloat(this.moveVertices[1][0]) + parseFloat(this.moveVertices[2][0]))/3;
    this.centerY = (parseFloat(this.moveVertices[0][1]) + parseFloat(this.moveVertices[1][1]) + parseFloat(this.moveVertices[2][1]))/3;
    this.centerZ = (parseFloat(this.moveVertices[0][2]) + parseFloat(this.moveVertices[1][2]) + parseFloat(this.moveVertices[2][2]))/3;
    this.crossX,this.crossY,this.crossZ = culVecCross(Pos1,Pos2,Pos3);
  }
  draw(ctx){
    if(this.UV.isup == true){
      drawTriangle(ctx, this.image, 
        [
         this.moveVertices[0][0], this.moveVertices[0][1],
         this.moveVertices[1][0], this.moveVertices[1][1],
         this.moveVertices[2][0], this.moveVertices[2][1],
        //各Z座標
         this.moveVertices[0][2], this.moveVertices[1][2],this.moveVertices[2][2],
        ],
        [
         this.UV[0], this.UV[1],
         this.UV[2], this.UV[3],
         this.UV[4], this.UV[5]
        ]
      );
    }else{
      drawTriangle(ctx, this.image, 
        [
         this.moveVertices[1][0], this.moveVertices[1][1],
         this.moveVertices[0][0], this.moveVertices[0][1],
         this.moveVertices[2][0], this.moveVertices[2][1],
        //各Z座標
         this.moveVertices[0][2], this.moveVertices[1][2],this.moveVertices[2][2],
        ],
        [
         this.UV[0], this.UV[1],
         this.UV[2], this.UV[3],
         this.UV[4], this.UV[5]
        ]
      ); 
    }
  }
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

class Object{
  
  constructor(verts,x,y,z,RotX,RotY,RotZ,numCorners,backGroundFlag,backCullingFlag,img){
    
    this.centerObjX = x;
    this.centerObjY = y;
    this.centerObjZ = z;
      
    this.objRotX = RotX;
    this.objRotY = RotY;
    this.objRotZ = RotZ;
    
    this.numCorners = numCorners;

    this.image = img;
    
    this.backGroundFlag = backGroundFlag;
    this.backCullingFlag = backCullingFlag;
    
    //文字列になってる
    this.verts = JSON.parse(JSON.stringify(verts));
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
    this.backCullingFlag = objInfo.backCullingFlag;

    this.isDraw = false;
    this.preGravityCollision = false;
    this.gravityCollision = false;
  }
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

function upDownSerch(obj1,obj2){
  if(obj1 == obj2){
    return null;
  }else{
    return (obj1.minX <= obj2.maxX && obj1.maxX >= obj2.minX) &&
     (obj1.minZ <= obj2.maxZ  && obj1.maxZ  >= obj2.minZ)
   }
}

let sphereVerts8 = makeSphereVerts(16,10);
let spheres = [];
let skyImage = new Image();
skyImage.src = 'sky.jpg';
//spheres.push(new Object(sphereVerts8,0.0,0.0,5,0,0,0,16,true,false,skyImage));

let cubes = [];
let cubeImage = new Image();
cubeImage.src = 'box.jpg';

//一番下は-0.27から積み重ねる場合+0.5
cubes.push(new Object(orgCubeVerts,0.0,-0.27,8,0,0,0,0,false,true,cubeImage));
//cubes.push(new Object(orgCubeVerts,-0.6,-0.27,4.9,0,0,0,0,false,true,cubeImage));
//cubes.push(new Object(orgCubeVerts,-0.6,-0.77,5.0,0,0,0,0,false,true,cubeImage));
//cubes.push(new Object(orgCubeVerts,0.6,-0.77,5,0,0,0,0,false,true,cubeImage));
//cubes.push(new Object(orgCubeVerts,0.6,-0.27,4.9,0,0,0,0,false,true,cubeImage));
//cubes.push(new Object(orgCubeVerts,1.5,-0.6,3,0,0,0,0,false,true,cubeImage));
//cubes.push(new Object(orgCubeVerts,-1.5,-0.6,4,0,0,0,0,false,true,cubeImage));

let planes = [];
let roadImage = new Image();
//roadImage.src = 'road.png';
for(let j=0;j<2;j++){
  for(let i=0;i<9;i++){
    //planes.push(new Object(orgPlaneVerts,-0.5+1.0*j,0,1.5+1.0*i,-90,0,0,0,false,false,roadImage));
  }
}

let groundImage = new Image();
groundImage.src = 'sand.jpg';
for(let j=0;j<3;j++){
  for(let i=0;i<9;i++){
    //planes.push(new Object(orgPlaneVerts,-1.5-1.0*j,0,1.5+1.0*i,-90,0,0,0,false,false,groundImage));
  }
}
for(let j=0;j<3;j++){
  for(let i=0;i<9;i++){
    //planes.push(new Object(orgPlaneVerts,1.5+1.0*j,0,1.5+1.0*i,-90,0,0,0,false,false,groundImage));
  }
}
let catImage = new Image();
catImage.src = 'cat.jpg';


let catPixelImage = [];

catImage.addEventListener("load", function() {
	catPixelImage = pictureToPixelMap(backCtx,catImage);
}, true);

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
  }
  return [result,vertsResult];
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

function setProjectionMatrix(object,Cz,Cx,Cy){
  
  let projectionList = [];
  let cameraRotMatrix = [];

    let ORx = 
      [
      [ 1, 0, 0, 0 ],
      [ 0, Math.cos(object.objRotX*Math.PI/180), - Math.sin(object.objRotX*Math.PI/180), 0 ],
      [ 0, Math.sin(object.objRotX*Math.PI/180), Math.cos(object.objRotX*Math.PI/180), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let ORy = 
      [
      [ Math.cos(object.objRotY*Math.PI/180), 0, Math.sin(object.objRotY*Math.PI/180), 0 ],
      [ 0, 1, 0, 0 ],
      [ -Math.sin(object.objRotY*Math.PI/180), 0, Math.cos(object.objRotY*Math.PI/180), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let ORz = 
      [
      [ Math.cos(object.objRotZ*Math.PI/180), - Math.sin(object.objRotZ*Math.PI/180), 0, 0 ],
      [ Math.sin(object.objRotZ*Math.PI/180), Math.cos(object.objRotZ*Math.PI/180), 0, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
  

    let distance_from_Obj_to_Camera = 
      [
      [ 1, 0, 0, (object.centerObjX-Cx)],
      [ 0, 1, 0, (object.centerObjY-Cy)],
      [ 0, 0, 1, (object.centerObjZ-Cz)],
      [ 0, 0, 0, 1 ]
    ];
  
  projectionList.ORx = ORx;
  projectionList.ORy = ORy;
  projectionList.ORz = ORz;
  
  projectionList.distance_from_Obj_to_Camera = distance_from_Obj_to_Camera;

  return projectionList;
}

//オブジェクトもカメラも同じ方向に動くので注意。カメラを動かす時は逆ベクトルにする。sinを逆にすれば逆回転になる。
function cameraRotMatritx(CRotZ,CRotX,CRotY){
  
  let cameraRotMatrix = [];

     let CRx = 
      [
      [ 1, 0, 0, 0 ],
      [ 0, Math.cos(CRotX*Math.PI/180), Math.sin(CRotX*Math.PI/180), 0 ],
      [ 0, -Math.sin(CRotX*Math.PI/180), Math.cos(CRotX*Math.PI/180), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let CRy = 
      [
      [ Math.cos(CRotY*Math.PI/180), 0, Math.sin(CRotY*Math.PI/180), 0 ],
      [ 0, 1, 0, 0 ],
      [ -Math.sin(CRotY*Math.PI/180), 0, Math.cos(CRotY*Math.PI/180), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let CRz = 
      [
      [ Math.cos(CRotZ*Math.PI/180), Math.sin(CRotZ*Math.PI/180), 0, 0 ],
      [ -Math.sin(CRotZ*Math.PI/180), Math.cos(CRotZ*Math.PI/180), 0, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
  
  cameraRotMatrix.CRx = CRx;
  cameraRotMatrix.CRy = CRy;
  cameraRotMatrix.CRz = CRz;
  
  return cameraRotMatrix;
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

function cubeDrawAdjuster(object1,object2,offsetObjectLength,moveObjects){
  
  let object1Length = object1.length;
  if(object1 == object2){
    object1Length = 0;
  }
  
  for(let j=offsetObjectLength;j<offsetObjectLength+object1.length;j++){
    let object = moveObjects[j];
    for(let i=offsetObjectLength+object1Length;i<offsetObjectLength+object1Length+object2.length;i++){
      if(object != moveObjects[i]){ 
        if(object.orgObject.centerObjY<moveObjects[i].orgObject.centerObjY){       
          object.preGravityCollision = AABBcollision(object,moveObjects[i]);
            if(object.preGravityCollision == true){
              let upIndex = j;
              let downIndex = i;
              let twoCollisionVerts = [];
              let upObjectY = Math.floor(moveObjects[downIndex].centerObjY*10)/10;
              let projectionList  = setProjectionMatrix(moveObjects[upIndex].orgObject,Cz,Cx,upObjectY);

              ORx = projectionList.ORx;
              ORy = projectionList.ORy;
              ORz = projectionList.ORz;

              distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;
              let moveCubeInfo = cameraModel(moveObjects[upIndex].orgObject,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);

              let maxminObject = vertsCulMaxMinCenter(moveCubeInfo[0]);
              moveCubeInfo.maxX = maxminObject.maxX;
              moveCubeInfo.minX = maxminObject.minX;
              moveCubeInfo.maxY = maxminObject.maxY;
              moveCubeInfo.minY = maxminObject.minY;  
              moveCubeInfo.maxZ = maxminObject.maxZ;
              moveCubeInfo.minZ = maxminObject.minZ;

              let moveCube = new moveObject(moveCubeInfo);

              twoCollisionVerts.push(moveCube)
              projectionList = setProjectionMatrix(moveObjects[downIndex].orgObject,Cz,Cx,upObjectY);

              ORx = projectionList.ORx;
              ORy = projectionList.ORy;
              ORz = projectionList.ORz;

              distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;
              moveCubeInfo = cameraModel(moveObjects[downIndex].orgObject,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);

              maxminObject = vertsCulMaxMinCenter(moveCubeInfo[0]);
              moveCubeInfo.maxX = maxminObject.maxX;
              moveCubeInfo.minX = maxminObject.minX;
              moveCubeInfo.maxY = maxminObject.maxY;
              moveCubeInfo.minY = maxminObject.minY;  
              moveCubeInfo.maxZ = maxminObject.maxZ;
              moveCubeInfo.minZ = maxminObject.minZ;

              moveCube = new moveObject(moveCubeInfo);
              twoCollisionVerts.push(moveCube)
              moveObjects[upIndex].gravityCollision = AABBcollision(twoCollisionVerts[0],twoCollisionVerts[1])
                if(moveObjects[upIndex].gravityCollision){
                  break
                }
              }
          }
        }
      }
  }
}
var mainLoopId = setInterval(function(){

if(catPixelImage.length == 0){
	return 0;
}

  //画面を黒でクリア
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle="rgb(0,0,0)";
	ctx.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);
  
  let cameraRotMatrix = [];
  cameraRotMatrix = cameraRotMatritx(CRotZ,CRotX,CRotY);
    
  CRx = cameraRotMatrix.CRx;
  CRy = cameraRotMatrix.CRy;
  CRz = cameraRotMatrix.CRz;
  
  let backGroundCounter = 0;

  //移動後の情報格納
  let moveObjects = [];
    
  //sphereregister
  for(let num =0;num<spheres.length;num++){
    let sphere = spheres[num];
    let projectionList = [];

    projectionList = setProjectionMatrix(sphere,Cz,Cx,Cy);
    
    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;
   
    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;
    let moveCameraSphere = cameraModel(sphere,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);
    let moveSphereInfo = moveCameraSphere[0];

    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let maxX = 0;
    let minX = 0;
    let maxY = 0;
    let minY = 0;
    let maxZ = 0;
    let minZ = 0;
    let maxminCenterObject = vertsCulMaxMinCenter(moveCameraSphere[1]);
    moveSphereInfo.orgObject = spheres[num];
    moveSphereInfo.image = sphere.image;
    moveSphereInfo.maxX = maxminCenterObject.maxX;
    moveSphereInfo.minX = maxminCenterObject.minX;
    moveSphereInfo.maxY = maxminCenterObject.maxY;
    moveSphereInfo.minY = maxminCenterObject.minY;  
    moveSphereInfo.maxZ = maxminCenterObject.maxZ;
    moveSphereInfo.minZ = maxminCenterObject.minZ;
    moveSphereInfo.centerObjX = maxminCenterObject.centerObjX;
    moveSphereInfo.centerObjY = maxminCenterObject.centerObjY;
    moveSphereInfo.centerObjZ = maxminCenterObject.centerObjZ;
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
    upUV.isup = true;
    let downUV = [
       0, 1,
       1, 1,
       1, 0
      ]
    downUV.isup = false;

      Poly.push(new Polygon(moveSphereInfo[i],moveSphereInfo[j],moveSphereInfo[k],upUV,moveSphereInfo.image));
    //    Polygones.push(new Polygon(spheres[num].dotMovePos[i],spheres[num].dotMovePos[j],spheres[num].dotMovePos[p],spheres[num].dotMovePos[k],4,sphereImage));
      Poly.push(new Polygon(moveSphereInfo[j],moveSphereInfo[p],moveSphereInfo[k],downUV,moveSphereInfo.image));
    }
    let movesphere = new moveObject(moveSphereInfo,Poly);
    moveObjects.push(movesphere);
  }
  //cuberegister
  for(let num=0;num<cubes.length;num++){
    
    let cube = cubes[num];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(cube,Cz,Cx,Cy);
    
    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;

    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

    let moveCameraCube = cameraModel(cube,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);
    let moveCubeInfo = moveCameraCube[0];
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let maxX = 0;
    let minX = 0;
    let maxY = 0;
    let minY = 0;
    let maxZ = 0;
    let minZ = 0;
    let maxminCenterObject = vertsCulMaxMinCenter(moveCameraCube[1]);
    moveCubeInfo.orgObject = cubes[num];
    moveCubeInfo.image = cube.image;
    moveCubeInfo.maxX = maxminCenterObject.maxX;
    moveCubeInfo.minX = maxminCenterObject.minX;
    moveCubeInfo.maxY = maxminCenterObject.maxY;
    moveCubeInfo.minY = maxminCenterObject.minY;  
    moveCubeInfo.maxZ = maxminCenterObject.maxZ;
    moveCubeInfo.minZ = maxminCenterObject.minZ;
    moveCubeInfo.centerObjX = maxminCenterObject.centerObjX;
    moveCubeInfo.centerObjY = maxminCenterObject.centerObjY;
    moveCubeInfo.centerObjZ = maxminCenterObject.centerObjZ;
    moveCubeInfo.backGroundFlag = cube.backGroundFlag;
    moveCubeInfo.backCullingFlag = cube.backCullingFlag;
    
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    
    let upUV = [
       0, 0,
       1, 0,
       0, 1
      ]
    upUV.isup = true;
    let downUV = [
       0, 1,
       1, 1,
       1, 0
      ]
    downUV.isup = false;
    
    let Poly = [];
    
    //前面
    Poly.push(new Polygon(moveCubeInfo[0],moveCubeInfo[1],moveCubeInfo[3],upUV,moveCubeInfo.image));
    Poly.push(new Polygon(moveCubeInfo[2],moveCubeInfo[3],moveCubeInfo[1],downUV,moveCubeInfo.image));
    //後面
    Poly.push(new Polygon(moveCubeInfo[5],moveCubeInfo[4],moveCubeInfo[6],upUV,moveCubeInfo.image));
    Poly.push(new Polygon(moveCubeInfo[7],moveCubeInfo[6],moveCubeInfo[4],downUV,moveCubeInfo.image));
    //上面
    Poly.push(new Polygon(moveCubeInfo[4],moveCubeInfo[5],moveCubeInfo[0],upUV,moveCubeInfo.image));
    Poly.push(new Polygon(moveCubeInfo[1],moveCubeInfo[0],moveCubeInfo[5],downUV,moveCubeInfo.image));
    //下面
    Poly.push(new Polygon(moveCubeInfo[3],moveCubeInfo[2],moveCubeInfo[7],upUV,moveCubeInfo.image));
    Poly.push(new Polygon(moveCubeInfo[6],moveCubeInfo[7],moveCubeInfo[2],downUV,moveCubeInfo.image));
    //左側面
    Poly.push(new Polygon(moveCubeInfo[4],moveCubeInfo[0],moveCubeInfo[7],upUV,moveCubeInfo.image));
    Poly.push(new Polygon(moveCubeInfo[3],moveCubeInfo[7],moveCubeInfo[0],downUV,moveCubeInfo.image));
    //右側面
    Poly.push(new Polygon(moveCubeInfo[1],moveCubeInfo[5],moveCubeInfo[2],upUV,moveCubeInfo.image));
    Poly.push(new Polygon(moveCubeInfo[6],moveCubeInfo[2],moveCubeInfo[5],downUV,moveCubeInfo.image));
    let moveCube = new moveObject(moveCubeInfo,Poly);
    moveObjects.push(moveCube);
  }
  
  //planesregister
  for(let num=0;num<planes.length;num++){
    
    let plane = planes[num];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(plane,Cz,Cx,Cy);
    
    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;

    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

    let moveCameraPlane = cameraModel(plane,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);
    let movePlaneInfo = moveCameraPlane[0];
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let maxX = 0;
    let minX = 0;
    let maxY = 0;
    let minY = 0;
    let maxZ = 0;
    let minZ = 0;
    let maxminCenterObject = vertsCulMaxMinCenter( moveCameraPlane[1]);
    movePlaneInfo.orgObject = planes[num];
    movePlaneInfo.image = plane.image;
    movePlaneInfo.maxX = maxminCenterObject.maxX;
    movePlaneInfo.minX = maxminCenterObject.minX;
    movePlaneInfo.maxY = maxminCenterObject.maxY;
    movePlaneInfo.minY = maxminCenterObject.minY;  
    movePlaneInfo.maxZ = maxminCenterObject.maxZ;
    movePlaneInfo.minZ = maxminCenterObject.minZ;
    movePlaneInfo.centerObjX = maxminCenterObject.centerObjX;
    movePlaneInfo.centerObjY = maxminCenterObject.centerObjY;
    movePlaneInfo.centerObjZ = maxminCenterObject.centerObjZ;
    movePlaneInfo.backGroundFlag = plane.backGroundFlag;
    movePlaneInfo.backCullingFlag = plane.backCullingFlag;
    
    if(movePlaneInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    let upUV = [
       0, 0,
       1, 0,
       0, 1
      ]
    upUV.isup = true;
    let downUV = [
       0, 1,
       1, 1,
       1, 0
      ]
    downUV.isup = false;
    
    let Poly = [];
    
    //前面
    Poly.push(new Polygon(movePlaneInfo[0],movePlaneInfo[1],movePlaneInfo[3],upUV,movePlaneInfo.image));
    Poly.push(new Polygon(movePlaneInfo[2],movePlaneInfo[3],movePlaneInfo[1],downUV,movePlaneInfo.image));

    let movePlane = new moveObject(movePlaneInfo,Poly);
    moveObjects.push(movePlane);
  }
  
  const cubeStart = spheres.length;
  cubeDrawAdjuster(cubes,planes,cubeStart,moveObjects);
  cubeDrawAdjuster(cubes,cubes,cubeStart,moveObjects);

  for(let i=spheres.length;i<spheres.length+cubes.length;i++){
    if(moveObjects[i].gravityCollision == false){
      moveObjects[i].orgObject.centerObjY += 0.01;
   } 
  }
  
  let maxObjCenterX = -99999;
  let maxObjCenterZ = -99999;

  let objectCounter = 0;
  
  //背景作画
  while(true){
    let drawObjectNum = -1;
    //Zの最大値を探す
    for(let i=0;i<moveObjects.length;i++){
      if((moveObjects[i].backGroundFlag == true) && (moveObjects[i].isDraw == false) && (Math.abs(moveObjects[i].centerObjZ)>=maxObjCenterZ)){
        maxObjCenterZ = Math.abs(moveObjects[i].centerObjZ);
      }
    }
    //Zの最大値のオブジェクトを探す
    for(let i=0;i<moveObjects.length;i++){
       if((moveObjects[i].backGroundFlag == true) && (moveObjects[i].isDraw == false) && (Math.abs(moveObjects[i].centerObjZ)>=maxObjCenterZ)){
        drawObjectNum = i;
        objectCounter += 1;
        moveObjects[drawObjectNum].isDraw = true;
        break;
      }
    }
    if(backGroundCounter>0){
      for(let i=0;i<moveObjects[drawObjectNum].polygonNum;i++){
        //-の方がこちらに近くなる座標軸だから
        if(moveObjects[drawObjectNum].backCullingFlag == true){
          if(moveObjects[drawObjectNum].polygonList[i].crossZ<0){
            moveObjects[drawObjectNum].polygonList[i].draw(ctx);
          } 
        }else{
            moveObjects[drawObjectNum].polygonList[i].draw(ctx);
        }
      }
    }
    
    maxObjCenterX = -99999;
    maxObjCenterZ = -99999;
    
    if(objectCounter>=backGroundCounter){
      break;
    }
  }
  maxObjCenterX = -99999;
  maxObjCenterZ = -99999;
    
  //作画
  while(true){
    let drawObjectNum = -1;{
      //Zの最大値を探す
      for(let i=0;i<moveObjects.length;i++){
        if((moveObjects[i].isDraw == false) &&  (Math.abs(moveObjects[i].centerObjZ)>=maxObjCenterZ)){
          maxObjCenterZ = Math.abs(moveObjects[i].centerObjZ);
        }
      }

      //Zの最大値のオブジェクトを探す
      for(let i=0;i<moveObjects.length;i++){
         if((moveObjects[i].isDraw == false) &&  (Math.abs(moveObjects[i].centerObjZ)>=maxObjCenterZ)){
          drawObjectNum = i;
          break;
        }
      }
       while(true){
        let i=0;
        for(;i<moveObjects.length;i++){
          if(drawObjectNum != i){
            if((moveObjects[i].isDraw == false) && upDownSerch(moveObjects[drawObjectNum],moveObjects[i]) 
                 && (Math.abs(moveObjects[i].orgObject.centerObjY-Cy)>Math.abs(moveObjects[drawObjectNum].orgObject.centerObjY-Cy))){
              drawObjectNum = i;
              break;
            }
          } 
         }
        if(i>=moveObjects.length){
          objectCounter += 1;
          moveObjects[drawObjectNum].isDraw = true;
         break;
        }
      }
    }

    for(let i=0;i<moveObjects[drawObjectNum].polygonNum;i++){
      //-の方がこちらに近くなる座標軸だから
      if(moveObjects[drawObjectNum].backCullingFlag == true){
        if(moveObjects[drawObjectNum].polygonList[i].crossZ<0){
          moveObjects[drawObjectNum].polygonList[i].draw(ctx);
        } 
      }else{
          moveObjects[drawObjectNum].polygonList[i].draw(ctx);
      }
    }
    
    maxObjCenterX = -99999;
    maxObjCenterZ = -99999;
    
    if(objectCounter>=moveObjects.length){
      break;
    }
  }
  
let renderZBuffer = bufferInit(SCREEN_SIZE_H,SCREEN_SIZE_W);

let upCatUV = [
       0, 0,
       1, 0,
       0, 1
      ]
let Xs = 200;
let Ys = 50;

let Xs1= 400;
let Ys1= 0;

let trianglePoint = [];
trianglePoint.push(Xs);
trianglePoint.push(Ys);

let trianglePoint1 = [];
trianglePoint1.push(Xs1);
trianglePoint1.push(Ys1);
let Xs3 = 350;
let Ys3 = 400;
let trianglePoint3 = [];
trianglePoint3.push(Xs3);
trianglePoint3.push(Ys3);

let triangleVerts = [];
triangleVerts.push(trianglePoint);
triangleVerts.push(trianglePoint1);
triangleVerts.push(trianglePoint3);

triangleToBuffer(renderZBuffer,1,1,catPixelImage,
        [
         triangleVerts[0][0], triangleVerts[0][1],
         triangleVerts[1][0], triangleVerts[1][1],
         triangleVerts[2][0], triangleVerts[2][1],
        //各Z座標
        1, 1,1,
        ],
        [
         0,0,
         1,0,
         0,1,
        ]
        );

Xs = 500;
Ys = 140;

Xs1= 300;
Ys1= 0;

trianglePoint = [];
trianglePoint.push(Xs);
trianglePoint.push(Ys);

trianglePoint1 = [];
trianglePoint1.push(Xs1);
trianglePoint1.push(Ys1);
Xs3 = 250;
Ys3 = 400;
trianglePoint3 = [];
trianglePoint3.push(Xs3);
trianglePoint3.push(Ys3);

triangleVerts = [];
triangleVerts.push(trianglePoint);
triangleVerts.push(trianglePoint1);
triangleVerts.push(trianglePoint3);

triangleToBuffer(renderZBuffer,2,1,catPixelImage,
        [
         triangleVerts[0][0], triangleVerts[0][1],
         triangleVerts[1][0], triangleVerts[1][1],
         triangleVerts[2][0], triangleVerts[2][1],
        //各Z座標
        1, 1,1,
        ],
        [
         0,0,
         1,0,
         0,1,
        ]
        );
//lengthが高さ、length[0]が横

//レンダリングバッファ作画
for(let j=0;j<SCREEN_SIZE_H;j++){
	for(let i=0;i<SCREEN_SIZE_W;i++){
	let getPixel = renderZBuffer[j][i].get().getPixel();
		if(getPixel.z < 99999){
			dotPaint(j,i,getPixel.r,getPixel.g,getPixel.b,getPixel.a,ctx)
		}
	}
}
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