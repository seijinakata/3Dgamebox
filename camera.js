import {M22, drawTriangle} from './texture.mjs';
import {rgCubeVerts,orgPlaneVerts, orgCubeVerts} from './orgverts.mjs';

const SCREEN_SIZE_W = 1500;
const SCREEN_SIZE_H = 1000;

var c = document.getElementById("myCanvas");
c.width = SCREEN_SIZE_W;
c.height = SCREEN_SIZE_H;

var ctx = c.getContext("2d");

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
 
    Extension = 
      [
      [ (f * SCREEN_SIZE_W) / (2 * Px), skew,  0, 0 ],
      [ 0, (f * SCREEN_SIZE_H) / (2 * Py),  0, 0 ],
      [ 0, 0,  1,  0 ],
      [ 0, 0, 0, 1 ]
      ],
        
    //outrunであった、奥行きでX,Y値を割るための行列
    N = [],
    
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
  
  constructor(verts,x,y,z,RotX,RotY,RotZ,backGroundFlag,backCullingFlag,imgName){
    
    this.centerObjX = x;
    this.centerObjY = y;
    this.centerObjZ = z;
      
    this.objRotX = RotX;
    this.objRotY = RotY;
    this.objRotZ = RotZ;
      
    this.image = new Image();
    this.image.src = imgName;
    
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
let cube1 = new Object(orgCubeVerts,-0.5,-1,4.9,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube2 = new Object(orgCubeVerts,0.5,-2,5.0,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube3 = new Object(orgCubeVerts,0,-3,5.0,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube4 = new Object(orgCubeVerts,-0.2,-4.4,5.4,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube5 = new Object(orgCubeVerts,0,-5,5,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');

let plane1 = new Object(orgPlaneVerts,0,0,4.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane2 = new Object(orgPlaneVerts,0,0,4.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane3 = new Object(orgPlaneVerts,0,0,5.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane4 = new Object(orgPlaneVerts,0.0,0,5.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane5 = new Object(orgPlaneVerts,-0.5,0,4.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane6 = new Object(orgPlaneVerts,-0.5,0,4.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane7 = new Object(orgPlaneVerts,-0.5,0,5.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane8 = new Object(orgPlaneVerts,-0.5,0,5.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane9 = new Object(orgPlaneVerts,0.5,0,4.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane10 = new Object(orgPlaneVerts,0.5,0,4.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane11 = new Object(orgPlaneVerts,0.5,0,5.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane12 = new Object(orgPlaneVerts,0.5,0,5.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');

let cubes = [];
cubes.push(cube1);
cubes.push(cube2);
cubes.push(cube3);
cubes.push(cube4);
cubes.push(cube5);

let planes = [];

planes.push(plane1);
planes.push(plane2);
planes.push(plane3);
planes.push(plane4);
planes.push(plane5);
planes.push(plane6);
planes.push(plane7);
planes.push(plane8);
planes.push(plane9);
planes.push(plane10);
planes.push(plane11);
planes.push(plane12);
function cameraModel(data,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset){
  var result = [];
  for (var i = 0; i < data.verts.length; i++) {
    result[i] = multiplyMatrix (ORz ,data.verts[i]);
    result[i] = multiplyMatrix (ORy ,result[i]);
    result[i] = multiplyMatrix (ORx ,result[i]);
    
    result[i] = multiplyMatrix (distance_from_Obj_to_Camera ,result[i]);
    
    result[i] = multiplyMatrix (CRz ,result[i]);
    result[i] = multiplyMatrix (CRy ,result[i]);
    result[i] = multiplyMatrix (CRx ,result[i]);
    
    N = 
      [
      [ 1/(result[i][2]) , 0, 0, 0 ],
      [ 0, 1/(result[i][2])  , 0, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
    
    result[i] = multiplyMatrix (N ,result[i]);
    result[i] = multiplyMatrix (Extension ,result[i]);
    result[i] = multiplyMatrix (offset ,result[i]);
  }
  
  return result;
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

function setProjectionMatrix(object,Cz,Cx,Cy,CRotZ,CRotX,CRotY){
  
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
  
    cameraRotMatrix = cameraRotMatritx(CRotZ,CRotX,CRotY);

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
  
  projectionList.CRx = cameraRotMatrix.CRx;
  projectionList.CRy = cameraRotMatrix.CRy;
  projectionList.CRz = cameraRotMatrix.CRz;
  
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
      if(object != moveObject[i]){
        if(object.centerObjY<moveObjects[i].centerObjY){
          object.preGravityCollision = AABBcollision(object,moveObjects[i]);
            if(object.preGravityCollision == true){
              let upIndex = j;
              let downIndex = i;
              let twoCollisionVerts = [];
              let upObjectY = Math.floor(moveObjects[downIndex].centerObjY*10)/10;
              let projectionList  = setProjectionMatrix(object1[upIndex],Cz,Cx,upObjectY,CRotZ,CRotX,CRotY);

              ORx = projectionList.ORx;
              ORy = projectionList.ORy;
              ORz = projectionList.ORz;

              CRx = projectionList.CRx;
              CRy = projectionList.CRy;
              CRz = projectionList.CRz;
              distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;
              let moveCubeInfo = cameraModel(object1[upIndex],distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);

              let maxminObject = vertsCulMaxMinCenter(moveCubeInfo);
              moveCubeInfo.maxX = maxminObject.maxX;
              moveCubeInfo.minX = maxminObject.minX;
              moveCubeInfo.maxY = maxminObject.maxY;
              moveCubeInfo.minY = maxminObject.minY;  
              moveCubeInfo.maxZ = maxminObject.maxZ;
              moveCubeInfo.minZ = maxminObject.minZ;

              let moveCube = new moveObject(moveCubeInfo);

              twoCollisionVerts.push(moveCube)
              projectionList = setProjectionMatrix(object2[downIndex-object1Length],Cz,Cx,upObjectY,CRotZ,CRotX,CRotY);

              ORx = projectionList.ORx;
              ORy = projectionList.ORy;
              ORz = projectionList.ORz;

              CRx = projectionList.CRx;
              CRy = projectionList.CRy;
              CRz = projectionList.CRz;
              distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;
              moveCubeInfo = cameraModel(object2[downIndex-object1Length],distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);

              maxminObject = vertsCulMaxMinCenter(moveCubeInfo);
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
  //画面を黒でクリア
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle="rgb(0,0,0)";
	ctx.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);
  
  let backGroundCounter = 0;

  //移動後の情報格納
  let moveObjects = [];
    
  //Directx等左手系座標(Zが大きくなるほど奥に行く)、
  //頂点時計回り配置起点から見て左のベクトルの方が先、前面を軸にどのように面が動くかで各面の初期頂点を配置
  let Polygones = [];
  
  //総オブジェクト数計算
  let num = 0;
  
  //cuberegister
  for(;num<cubes.length;num++){
    
    let cube = cubes[num];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(cube,Cz,Cx,Cy,CRotZ,CRotX,CRotY);
    
    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;
    
    CRx = projectionList.CRx;
    CRy = projectionList.CRy;
    CRz = projectionList.CRz;
    
    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

    var moveCubeInfo = [];
    moveCubeInfo = cameraModel(cube,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);
    let maxminObject = [];
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let maxX = 0;
    let minX = 0;
    let maxY = 0;
    let minY = 0;
    let maxZ = 0;
    let minZ = 0;
    maxminObject = vertsCulMaxMinCenter(moveCubeInfo);
    moveCubeInfo.objectNum = num;
    moveCubeInfo.orgObject = cubes[num];
    moveCubeInfo.image = cube.image;
    moveCubeInfo.maxX = maxminObject.maxX;
    moveCubeInfo.minX = maxminObject.minX;
    moveCubeInfo.maxY = maxminObject.maxY;
    moveCubeInfo.minY = maxminObject.minY;  
    moveCubeInfo.maxZ = maxminObject.maxZ;
    moveCubeInfo.minZ = maxminObject.minZ;
    moveCubeInfo.centerObjX = cube.centerObjX;
    moveCubeInfo.centerObjY = cube.centerObjY;
    moveCubeInfo.centerObjZ = cube.centerObjZ;
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
  for(;num<planes.length+cubes.length;num++){
    
    let plane = planes[num-cubes.length];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(plane,Cz,Cx,Cy,CRotZ,CRotX,CRotY);
    
    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;
    
    CRx = projectionList.CRx;
    CRy = projectionList.CRy;
    CRz = projectionList.CRz;
    
    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

    var moveplaneInfo = [];
    moveplaneInfo = cameraModel(plane,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension,offset);
    let maxminObject = [];
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let maxX = 0;
    let minX = 0;
    let maxY = 0;
    let minY = 0;
    let maxZ = 0;
    let minZ = 0;
    maxminObject = vertsCulMaxMinCenter(moveplaneInfo);
    moveplaneInfo.objectNum = num;
    moveplaneInfo.orgObject = planes[num-cubes.length];
    moveplaneInfo.image = plane.image;
    moveplaneInfo.maxX = maxminObject.maxX;
    moveplaneInfo.minX = maxminObject.minX;
    moveplaneInfo.maxY = maxminObject.maxY;
    moveplaneInfo.minY = maxminObject.minY;  
    moveplaneInfo.maxZ = maxminObject.maxZ;
    moveplaneInfo.minZ = maxminObject.minZ;
    moveplaneInfo.centerObjX = plane.centerObjX;
    moveplaneInfo.centerObjY = plane.centerObjY;
    moveplaneInfo.centerObjZ = plane.centerObjZ;
    moveplaneInfo.backGroundFlag = plane.backGroundFlag;
    moveplaneInfo.backCullingFlag = plane.backCullingFlag;
    
    if(moveplaneInfo.backGroundFlag == true){
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
    Poly.push(new Polygon(moveplaneInfo[0],moveplaneInfo[1],moveplaneInfo[3],upUV,moveplaneInfo.image));
    Poly.push(new Polygon(moveplaneInfo[2],moveplaneInfo[3],moveplaneInfo[1],downUV,moveplaneInfo.image));

    let movePlane = new moveObject(moveplaneInfo,Poly);
    moveObjects.push(movePlane);
  }
  
  const cubeStart = 0;
  cubeDrawAdjuster(cubes,planes,cubeStart,moveObjects);
  cubeDrawAdjuster(cubes,cubes,cubeStart,moveObjects);

  for(let i=0;i<cubes.length;i++){
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
      if((moveObjects[i].backGroundFlag == true) && (moveObjects[i].isDraw == false) && (Math.abs(moveObjects[i].centerObjZ-Cz)>=maxObjCenterZ)){
        maxObjCenterZ = Math.abs(moveObjects[i].centerObjZ-Cz);
      }
    }
    //Zの最大値のオブジェクトを探す
    for(let i=0;i<moveObjects.length;i++){
       if((moveObjects[i].backGroundFlag == true) && (moveObjects[i].isDraw == false) && (Math.abs(moveObjects[i].centerObjZ-Cz)>=maxObjCenterZ)){
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
    let drawObjectNum = -1;
    if((40<=CRotY && CRotY<=120) || (220<=CRotY && CRotY<=320)){
      //Xの最大値を探す
      for(let i=0;i<moveObjects.length;i++){
        if((moveObjects[i].isDraw == false) &&  (Math.abs(moveObjects[i].centerObjX-Cx)>=maxObjCenterX)){
          maxObjCenterX = Math.abs(moveObjects[i].centerObjX-Cx);
        }
      }
      //Xの最大値のオブジェクトを探す
      for(let i=0;i<moveObjects.length;i++){
         if((moveObjects[i].isDraw == false) &&  (Math.abs(moveObjects[i].centerObjX-Cx)>=maxObjCenterX)){
          drawObjectNum = i;
          break;
        }
      }
      while(true){
        let i=0;
        for(;i<moveObjects.length;i++){
          if(drawObjectNum != i){
            if((moveObjects[i].isDraw == false) && upDownSerch(moveObjects[drawObjectNum],moveObjects[i]) 
                 && (Math.abs(moveObjects[i].centerObjY-Cy)>Math.abs(moveObjects[drawObjectNum].centerObjY-Cy))){
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
     }else{
      //Zの最大値を探す
      for(let i=0;i<moveObjects.length;i++){
        if((moveObjects[i].isDraw == false) &&  (Math.abs(moveObjects[i].centerObjZ-Cz)>=maxObjCenterZ)){
          maxObjCenterZ = Math.abs(moveObjects[i].centerObjZ-Cz);
        }
      }

      //Zの最大値のオブジェクトを探す
      for(let i=0;i<moveObjects.length;i++){
         if((moveObjects[i].isDraw == false) &&  (Math.abs(moveObjects[i].centerObjZ-Cz)>=maxObjCenterZ)){
          drawObjectNum = i;
          break;
        }
      }
       while(true){
        let i=0;
        for(;i<moveObjects.length;i++){
          if(drawObjectNum != i){
            if((moveObjects[i].isDraw == false) && upDownSerch(moveObjects[drawObjectNum],moveObjects[i]) 
                 && (Math.abs(moveObjects[i].centerObjY-Cy)>Math.abs(moveObjects[drawObjectNum].centerObjY-Cy))){
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
}, 1000/60);

document.addEventListener('keydown',e => {
  let cameraRotMatrix = [];

  switch(e.key){
    case 'ArrowLeft':
      moveVecCamera = 
       [
        [ 0.25 ],
        [ 0 ],
        [ 0 ],
        [ 1 ]
        ];
      cameraRotMatrix = cameraRotMatritx(CRotZ,CRotX,CRotY);
      CRx = cameraRotMatrix.CRx;
      CRy = cameraRotMatrix.CRy;
      CRz = cameraRotMatrix.CRz;
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
      cameraRotMatrix = cameraRotMatritx(CRotZ,CRotX,CRotY);
      CRx = cameraRotMatrix.CRx;
      CRy = cameraRotMatrix.CRy;
      CRz = cameraRotMatrix.CRz;
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
      cameraRotMatrix = cameraRotMatritx(CRotZ,CRotX,CRotY);
      CRx = cameraRotMatrix.CRx;
      CRy = cameraRotMatrix.CRy;
      CRz = cameraRotMatrix.CRz;
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
      cameraRotMatrix = cameraRotMatritx(CRotZ,CRotX,CRotY);
      CRx = cameraRotMatrix.CRx;
      CRy = cameraRotMatrix.CRy;
      CRz = cameraRotMatrix.CRz;
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
      cameraRotMatrix = cameraRotMatritx(CRotZ,CRotX,CRotY);
      CRx = cameraRotMatrix.CRx;
      CRy = cameraRotMatrix.CRy;
      CRz = cameraRotMatrix.CRz;
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
      cameraRotMatrix = cameraRotMatritx(CRotZ,CRotX,CRotY);
      CRx = cameraRotMatrix.CRx;
      CRy = cameraRotMatrix.CRy;
      CRz = cameraRotMatrix.CRz;
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