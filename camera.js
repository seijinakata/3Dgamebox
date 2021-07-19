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
    CRotY = 330,
    CRotZ = 0,

    Cx = -2.5,
    Cy = -0.5,
    Cz = 0,
 
    cOffsetX = SCREEN_SIZE_W/2,
    cOffsetY = SCREEN_SIZE_H/2,
   
    f = 0.1,
    Px = 0.06,
    Py = 0.048,
    skew = 0,

    offset = [],
    N = [],
    Extension = [],
    
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
    
    this.moveObjinfo = objInfo;

    this.centerObjX = this.moveObjinfo.centerObjX;
    this.centerObjY = this.moveObjinfo.centerObjY;;
    this.centerObjZ = this.moveObjinfo.centerObjZ;;
    this.maxX=this.moveObjinfo.maxX;
    this.minX=this.moveObjinfo.minX;
    this.maxY=this.moveObjinfo.maxY;
    this.minY=this.moveObjinfo.minY;
    this.maxZ=this.moveObjinfo.maxZ;
    this.minZ=this.moveObjinfo.minZ;
    this.objectNum = parseInt(this.moveObjinfo.objectNum);
    
    this.polygonList = polyList;

    this.polygonNum = this.polygonList.length;
    
    this.backGroundFlag = this.moveObjinfo.backGroundFlag;
    this.backCullingFlag = this.moveObjinfo.backCullingFlag;

    this.isDraw = false;
  }
}
class collisionObject{
  
  constructor(centerObjX,centerObjY,centerObjZ,maxX,minX,maxY,minY,maxZ,minZ){
    this.centerObjX=centerObjX;
    this.centerObjY=centerObjY;
    this.centerObjZ=centerObjZ;
    this.maxX=maxX;
    this.minX=minX;
    this.maxY=maxY;
    this.minY=minY;
    this.maxZ=maxZ;
    this.minZ=minZ;
  }
  AABBcollision(cube){
    if(this == cube){
      //return null;
    }else{
      return (this.minX <= cube.maxX && this.maxX >= cube.minX) &&
        (this.minY <= cube.maxY && this.maxY >= cube.minY) &&
       (this.minZ <= cube.maxZ  && this.maxZ  >= cube.minZ)
     }
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
let cube1 = new Object(orgCubeVerts,0,0,5.6,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube2 = new Object(orgCubeVerts,0,-0.5,5.4,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube3 = new Object(orgCubeVerts,0,0.5,5.5,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube4 = new Object(orgCubeVerts,0,1,5.3,0,0,0,false,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');

let plane1 = new Object(orgPlaneVerts,0,0,4.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane2 = new Object(orgPlaneVerts,0,0,4.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane3 = new Object(orgPlaneVerts,0,0,5.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane4 = new Object(orgPlaneVerts,0.0,0,5.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane5 = new Object(orgPlaneVerts,-0.5,0,4.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane6 = new Object(orgPlaneVerts,-0.5,0,4.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane7 = new Object(orgPlaneVerts,-0.5,0,5.0,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane8 = new Object(orgPlaneVerts,-0.5,0,5.5,-90,0,0,false,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');

let cubes = [];
cubes.push(cube1);
cubes.push(cube2);
cubes.push(cube3);
cubes.push(cube4);

let planes = [];
/*
planes.push(plane1);
planes.push(plane2);
planes.push(plane3);
planes.push(plane4);
planes.push(plane5);
planes.push(plane6);
planes.push(plane7);
planes.push(plane8);
*/




function cameraModel(data,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension){
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

function setProjectionMatrix(object,offsetX,offsetY,Cz,Cx,Cy,CRotZ,CRotX,CRotY){
  
  let projectionList = [];
  let cameraRotMatrix = [];

    //スクリーン画像への配置
    let offset = 
      [
      [ 1, 0, 0, offsetX ],
      [ 0, 1, 0, offsetY ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
  
    let Extension = 
      [
      [ (f * SCREEN_SIZE_W) / (2 * Px), skew,  0, 0 ],
      [ 0, (f * SCREEN_SIZE_H) / (2 * Py),  0, 0 ],
      [ 0, 0,  1,  0 ],
      [ 0, 0, 0, 1 ]
      ];

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
      [ - Math.sin(object.objRotY*Math.PI/180), 0, Math.cos(object.objRotY*Math.PI/180), 0 ],
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

  projectionList.offset = offset;
  projectionList.Extension = Extension;
  
  projectionList.ORx = ORx;
  projectionList.ORy = ORy;
  projectionList.ORz = ORz;
  
  projectionList.CRx = cameraRotMatrix.CRx;
  projectionList.CRy = cameraRotMatrix.CRy;
  projectionList.CRz = cameraRotMatrix.CRz;
  
  projectionList.distance_from_Obj_to_Camera = distance_from_Obj_to_Camera;

  return projectionList;
}

function cameraRotMatritx(CRotZ,CRotX,CRotY){
  
  let cameraRotMatrix = [];

     let CRx = 
      [
      [ 1, 0, 0, 0 ],
      [ 0, Math.cos(CRotX*Math.PI/180), - Math.sin(CRotX*Math.PI/180), 0 ],
      [ 0, Math.sin(CRotX*Math.PI/180), Math.cos(CRotX*Math.PI/180), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let CRy = 
      [
      [ Math.cos(CRotY*Math.PI/180), 0, Math.sin(CRotY*Math.PI/180), 0 ],
      [ 0, 1, 0, 0 ],
      [ - Math.sin(CRotY*Math.PI/180), 0, Math.cos(CRotY*Math.PI/180), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let CRz = 
      [
      [ Math.cos(CRotZ*Math.PI/180), - Math.sin(CRotZ*Math.PI/180), 0, 0 ],
      [ Math.sin(CRotZ*Math.PI/180), Math.cos(CRotZ*Math.PI/180), 0, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
  
  cameraRotMatrix.CRx = CRx;
  cameraRotMatrix.CRy = CRy;
  cameraRotMatrix.CRz = CRz;
  
  return cameraRotMatrix;
}
function vertsCulMaxMin(moveplaneVerts){
    let maxminObject = [];
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let maxX = 0;
    let minX = 0;
    let planeVertsX = [];
    for(let i=0;i<moveplaneVerts.length;i++){
      planeVertsX.push(moveplaneVerts[i][0]);
      maxX = Math.max(...planeVertsX);
      minX =  Math.min(...planeVertsX);
    }
    let maxY = 0;
    let minY = 0;
    let planeVertsY = [];
    for(let i=0;i<moveplaneVerts.length;i++){
      planeVertsY.push(moveplaneVerts[i][1]);
      maxY = Math.max(...planeVertsY);
      minY =  Math.min(...planeVertsY);

    }    
    let maxZ = 0;
    let minZ = 0;
    let planeVertsZ = [];
    for(let i=0;i<moveplaneVerts.length;i++){
      planeVertsZ.push(moveplaneVerts[i][2]);
      maxZ = Math.max(...planeVertsZ);
      minZ =  Math.min(...planeVertsZ);
    }
  maxminObject.maxX = maxX;
  maxminObject.minX = minX;
  maxminObject.maxY = maxY;
  maxminObject.minY = minY;  
  maxminObject.maxZ = maxZ;
  maxminObject.minZ = minZ;

  return maxminObject;
}
var mainLoopId = setInterval(function(){
  //画面を黒でクリア
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle="rgb(0,0,0)";
	ctx.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);
  
  let backGroundCounter = 0;
  
  //コリジョン用の情報格納
  //cameraを無視して当たり判定を考える。
  let collisionPlanes = [];
  let collisionCubes = [];
  //plane
  for(let num=0;num<planes.length;num++){
    
    let plane = planes[num];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(plane,cOffsetX,cOffsetY,0,0,0,0,0,0);
    
    offset = projectionList.offset;
    Extension = projectionList.Extension;

    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;
        
    CRx = projectionList.CRx;
    CRy = projectionList.CRy;
    CRz = projectionList.CRz;
    
    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

    let moveplaneVerts = [];
    moveplaneVerts = cameraModel(plane,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension);
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
    maxminObject = vertsCulMaxMin(moveplaneVerts);
    maxX = maxminObject.maxX;
    minX = maxminObject.minX;
    maxY = maxminObject.maxY;
    minY = maxminObject.minY;  
    maxZ = maxminObject.maxZ;
    minZ = maxminObject.minZ;
    let collisionPlane = new collisionObject(centerX,centerY,centerZ,maxX,minX,maxY,minY,maxZ,minZ)
    collisionPlanes.push(collisionPlane);
  }

  //cube
  for(let num=0;num<cubes.length;num++){
    
    let cube = cubes[num];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(cube,cOffsetX,cOffsetY,0,0,0,0,0,0);
    
    offset = projectionList.offset;
    Extension = projectionList.Extension;

    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;
    
    CRx = projectionList.CRx;
    CRy = projectionList.CRy;
    CRz = projectionList.CRz;
    
    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

    let moveCubeVerts = [];
    moveCubeVerts = cameraModel(cube,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension);
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
    maxminObject = vertsCulMaxMin(moveCubeVerts);
    maxX = maxminObject.maxX;
    minX = maxminObject.minX;
    maxY = maxminObject.maxY;
    minY = maxminObject.minY;  
    maxZ = maxminObject.maxZ;
    minZ = maxminObject.minZ;
    let collisionCube = new collisionObject(centerX,centerY,centerZ,maxX,minX,maxY,minY,maxZ,minZ)
    collisionCubes.push(collisionCube);
  }
  
  let cubeCollision = false;
  for(let j=0;j<collisionCubes.length;j++){
    let collisionCube = collisionCubes[0];
     for(let i=0;i<collisionPlanes.length;i++){
      cubeCollision = collisionCube.AABBcollision(collisionPlanes[i]);
       console.log(cubeCollision)
      if(cubeCollision==null){
        continue;
      }
      if(cubeCollision== true){
        console.log("collision")
         break;
      }else{
        //cubes[0].centerObjY += 0.01;
        //console.log("notcollision")
        break;
      }
    } 
  }

    //移動後の情報格納
  let moveObjects = [];
    
  //Directx等左手系座標(Zが大きくなるほど奥に行く)、
  //頂点時計回り配置起点から見て左のベクトルの方が先、前面を軸にどのように面が動くかで各面の初期頂点を配置
  let Polygones = [];
  
  //総オブジェクト数計算
  let num = 0;
  //drawplanes
  for(;num<planes.length;num++){
    
    let plane = planes[num];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(plane,cOffsetX,cOffsetY,Cz,Cx,Cy,CRotZ,CRotX,CRotY);
    
    offset = projectionList.offset;
    Extension = projectionList.Extension;

    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;
    
    CRx = projectionList.CRx;
    CRy = projectionList.CRy;
    CRz = projectionList.CRz;
    
    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

    var moveplaneInfo = [];
    moveplaneInfo = cameraModel(plane,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension);
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
    maxminObject = vertsCulMaxMin(moveplaneInfo);
    moveplaneInfo.objectNum = num;
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
    //前面
    Polygones.push(new Polygon(moveplaneInfo[0],moveplaneInfo[1],moveplaneInfo[3],upUV,moveplaneInfo.image));
    Polygones.push(new Polygon(moveplaneInfo[2],moveplaneInfo[3],moveplaneInfo[1],downUV,moveplaneInfo.image));
    
    let Poly = [];
    
    //前面
    Poly.push(new Polygon(moveplaneInfo[0],moveplaneInfo[1],moveplaneInfo[3],upUV,moveplaneInfo.image));
    Poly.push(new Polygon(moveplaneInfo[2],moveplaneInfo[3],moveplaneInfo[1],downUV,moveplaneInfo.image));

    let movePlane = new moveObject(moveplaneInfo,Poly);
    moveObjects.push(movePlane);

  }

  //drawcube
  for(;num<cubes.length+planes.length;num++){
    
    let cube = cubes[num-planes.length];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(cube,cOffsetX,cOffsetY,Cz,Cx,Cy,CRotZ,CRotX,CRotY);
    
    offset = projectionList.offset;
    Extension = projectionList.Extension;

    ORx = projectionList.ORx;
    ORy = projectionList.ORy;
    ORz = projectionList.ORz;
    
    CRx = projectionList.CRx;
    CRy = projectionList.CRy;
    CRz = projectionList.CRz;
    
    distance_from_Obj_to_Camera = projectionList.distance_from_Obj_to_Camera;

    var moveCubeInfo = [];
    moveCubeInfo = cameraModel(cube,distance_from_Obj_to_Camera,ORz,ORy,ORx,CRz,CRy,CRx,Extension);
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
    maxminObject = vertsCulMaxMin(moveCubeInfo);
    moveCubeInfo.objectNum = num;
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
          
    //前面
    Polygones.push(new Polygon(moveCubeInfo[0],moveCubeInfo[1],moveCubeInfo[3],upUV,moveCubeInfo.image));
    Polygones.push(new Polygon(moveCubeInfo[2],moveCubeInfo[3],moveCubeInfo[1],downUV,moveCubeInfo.image));
    //後面
    Polygones.push(new Polygon(moveCubeInfo[5],moveCubeInfo[4],moveCubeInfo[6],upUV,moveCubeInfo.image));
    Polygones.push(new Polygon(moveCubeInfo[7],moveCubeInfo[6],moveCubeInfo[4],downUV,moveCubeInfo.image));
    //上面
    Polygones.push(new Polygon(moveCubeInfo[4],moveCubeInfo[5],moveCubeInfo[0],upUV,moveCubeInfo.image));
    Polygones.push(new Polygon(moveCubeInfo[1],moveCubeInfo[0],moveCubeInfo[5],downUV,moveCubeInfo.image));
    //下面
    Polygones.push(new Polygon(moveCubeInfo[3],moveCubeInfo[2],moveCubeInfo[7],upUV,moveCubeInfo.image));
    Polygones.push(new Polygon(moveCubeInfo[6],moveCubeInfo[7],moveCubeInfo[2],downUV,moveCubeInfo.image));
    //左側面
    Polygones.push(new Polygon(moveCubeInfo[4],moveCubeInfo[0],moveCubeInfo[7],upUV,moveCubeInfo.image));
    Polygones.push(new Polygon(moveCubeInfo[3],moveCubeInfo[7],moveCubeInfo[0],downUV,moveCubeInfo.image));
    //右側面
    Polygones.push(new Polygon(moveCubeInfo[1],moveCubeInfo[5],moveCubeInfo[2],upUV,moveCubeInfo.image));
    Polygones.push(new Polygon(moveCubeInfo[6],moveCubeInfo[2],moveCubeInfo[5],downUV,moveCubeInfo.image));
    
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
  
  let maxObjCenterX = -99999;
  let maxObjCenterY = -99999;
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
    maxObjCenterY = -99999;
    maxObjCenterZ = -99999;
    
    if(objectCounter>=backGroundCounter){
      break;
    }
  }
  maxObjCenterX = -99999;
  maxObjCenterY = -99999;
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
    maxObjCenterY = -99999;
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
        [ 0.5 ],
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
        [ -0.5 ],
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
        [ -0.5 ],
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
        [ 0.5 ],
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