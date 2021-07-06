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
    
    distance_from_Obj_to_Camera = [];

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
  
  constructor(verts,x,y,z,RotX,RotY,RotZ,backGroundFlag,imgName){
    
    this.objX = x;
    this.objY = y;
    this.objZ = z;
      
    this.objRotX = RotX;
    this.objRotY = RotY;
    this.objRotZ = RotZ;
      
    this.image = new Image();
    this.image.src = imgName;
    
    this.backGroundFlag = backGroundFlag;
    //文字列になってる
    this.verts = JSON.parse(JSON.stringify(verts));
  }
}
class moveObject{
  
  constructor(objInfo,polyList){
    
    this.moveObjinfo = objInfo;
    let tempobjX = 0;
    for(let i=0;i<this.moveObjinfo.length;i++){
      tempobjX += parseFloat(this.moveObjinfo[i][0]);
    }
    let tempobjY = 0;
    for(let i=0;i<this.moveObjinfo.length;i++){
      tempobjY += parseFloat(this.moveObjinfo[i][1]);
    }
    let tempobjZ = 0;
    for(let i=0;i<this.moveObjinfo.length;i++){
      tempobjZ += parseFloat(this.moveObjinfo[i][2]);
    }

    this.centerObjX = tempobjX/this.moveObjinfo.length;
    this.centerObjY = tempobjY/this.moveObjinfo.length;;
    this.centerObjZ = tempobjZ/this.moveObjinfo.length;;
    
    this.objectNum = parseInt(this.moveObjinfo.objectNum);
    
    this.polygonList = polyList;

    this.polygonNum = this.polygonList.length;
    
    this.backGroundFlag = this.moveObjinfo.backGroundFlag;
    this.isDraw = false;
  }
}
class collisionObject{
  
  constructor(centerX,centerY,centerZ,maxX,minX,maxY,minY,maxZ,minZ){
    this.centerX=centerX;
    this.centerY=centerY;
    this.centerz=centerZ;
    this.maxX=maxX;
    this.minX=minX;
    this.maxY=maxY;
    this.minY=minY;
    this.maxZ=maxZ;
    this.minZ=minZ;
  }
  AABBcollision(cube){
    if(this == cube){
      return null;
    }else{
      return (this.minX <= cube.maxX && this.maxX >= cube.minX) &&
        (this.minY <= cube.maxY && this.maxY >= cube.minY) &&
       (this.minZ <= cube.maxZ  && this.maxZ  >= cube.minZ)
     }
  }
}

//おなじにすると作画が変になる。
let cube1 = new Object(orgCubeVerts,0.5,-1,5,0,0,0,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube2 = new Object(orgCubeVerts,-0.5,-1,5,0,0,0,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube3 = new Object(orgCubeVerts,1.0,0,7,0,0,0,false,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');

let plane1 = new Object(orgPlaneVerts,0,0,4,-90,0,0,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane2 = new Object(orgPlaneVerts,0,0,6,-90,0,0,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');
let plane3 = new Object(orgPlaneVerts,0,0,8,-90,0,0,true,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');

let cubes = [];
cubes.push(cube1);
cubes.push(cube2);
//cubes.push(cube3);

let planes = [];
planes.push(plane1);
planes.push(plane2);
planes.push(plane3);

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
    let distance_from_Obj_to_Camera = 
      [
      [ 1, 0, 0, (object.objX-Cx)],
      [ 0, 1, 0, (object.objY-Cy)],
      [ 0, 0, 1, (object.objZ-Cz)],
      [ 0, 0, 0, 1 ]
    ];

  projectionList.offset = offset;
  projectionList.Extension = Extension;
  
  projectionList.ORx = ORx;
  projectionList.ORy = ORy;
  projectionList.ORz = ORz;
  
  projectionList.CRx = CRx;
  projectionList.CRy = CRy;
  projectionList.CRz = CRz;
  
  projectionList.distance_from_Obj_to_Camera = distance_from_Obj_to_Camera;

  return projectionList;
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
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let maxX = 0;
    let minX = 0;
    let cubeVertsX = [];
    for(let i=0;i<moveCubeVerts.length;i++){
      cubeVertsX.push(moveCubeVerts[i][0]);
      maxX = Math.max(...cubeVertsX);
      minX =  Math.min(...cubeVertsX);
    }
    let maxY = 0;
    let minY = 0;
    let cubeVertsY = [];
    for(let i=0;i<moveCubeVerts.length;i++){
      cubeVertsY.push(moveCubeVerts[i][1]);
      maxY = Math.max(...cubeVertsY);
      minY =  Math.min(...cubeVertsY);
    }    

    let maxZ = 0;
    let minZ = 0;
    let cubeVertsZ = [];
    for(let i=0;i<moveCubeVerts.length;i++){
      cubeVertsZ.push(moveCubeVerts[i][2]);
      maxZ = Math.max(...cubeVertsZ);
      minZ =  Math.min(...cubeVertsZ);
    }
    let collisionCube = new collisionObject(centerX,centerY,centerZ,maxX,minX,maxY,minY,maxZ,minZ)
    collisionCubes.push(collisionCube);
  }
  
  let cubeCollision = false;
  for(let j=0;j<collisionCubes.length;j++){
    let collisionCube = collisionCubes[j];
     for(let i=0;i<collisionPlanes.length;i++){
      cubeCollision = collisionCube.AABBcollision(collisionPlanes[i]);
      if(cubeCollision==null){
        continue;
      }
      if(cubeCollision== true){
        console.log("collision")
         break;
      }else{
          cubes[j].objY += 0.01;
        console.log("notcollision")
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
    moveplaneInfo.objectNum = num;
    moveplaneInfo.image = plane.image;
    moveplaneInfo.backGroundFlag = plane.backGroundFlag;
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
    moveCubeInfo.objectNum = num;
    moveCubeInfo.image = cube.image;
    moveCubeInfo.backGroundFlag = cube.backGroundFlag;
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
  
  let maxObjCenterZ = -99999;
  let objectCounter = 0;
  
  //背景作画
  while(true){
    let drawObjectNum = -1;
    //Zの最大値を探す
    for(let i=0;i<moveObjects.length;i++){
      if((moveObjects[i].backGroundFlag == true) && (moveObjects[i].isDraw == false) && (moveObjects[i].centerObjZ>=maxObjCenterZ)){
        maxObjCenterZ = moveObjects[i].centerObjZ;
      }
    }
    //Zの最大値のオブジェクトを探す
    for(let i=0;i<moveObjects.length;i++){
       if((moveObjects[i].backGroundFlag == true) && (moveObjects[i].isDraw == false) && (moveObjects[i].centerObjZ>=maxObjCenterZ)){
        drawObjectNum = i;
        objectCounter += 1;
        moveObjects[drawObjectNum].isDraw = true;
        break;
      }
    }
    for(let i=0;i<moveObjects[drawObjectNum].polygonNum;i++){
      //-の方がこちらに近くなる座標軸だから
        if(moveObjects[drawObjectNum].polygonList[i].crossZ<0){
          moveObjects[drawObjectNum].polygonList[i].draw(ctx)
          //drawPolygon(Polygones[i]);
        }
    }

    maxObjCenterZ = -99999;
    if(objectCounter>=backGroundCounter){
      break;
    }
  }
  maxObjCenterZ = -99999;
  //作画
  while(true){
    let drawObjectNum = -1;
    //Zの最大値を探す
    for(let i=0;i<moveObjects.length;i++){
      if((moveObjects[i].isDraw == false) && (moveObjects[i].centerObjZ>=maxObjCenterZ)){
        maxObjCenterZ = moveObjects[i].centerObjZ;
      }
    }
    //Zの最大値のオブジェクトを探す
    for(let i=0;i<moveObjects.length;i++){
       if((moveObjects[i].isDraw == false) && (moveObjects[i].centerObjZ>=maxObjCenterZ)){
        drawObjectNum = i;
        objectCounter += 1;
        moveObjects[drawObjectNum].isDraw = true;
        break;
      }
    }
    for(let i=0;i<moveObjects[drawObjectNum].polygonNum;i++){
      //-の方がこちらに近くなる座標軸だから
        if(moveObjects[drawObjectNum].polygonList[i].crossZ<0){
          moveObjects[drawObjectNum].polygonList[i].draw(ctx)
          //drawPolygon(Polygones[i]);
        }
    }

    maxObjCenterZ = -99999;
    if(objectCounter>=moveObjects.length){
      break;
    }
  }
}, 1000/60);

document.addEventListener('keydown',e => {
  switch(e.key){
    case 'ArrowLeft':
      Cx -= 1;
      break;
    case 'ArrowRight':
      Cx += 1;
      break;
    case 'ArrowUp':
      Cy -= 1;
      break;
    case 'ArrowDown':
      Cy += 1;
      break;
    case 'u':
      Cz += 0.2;
      break;   
    case 'd':
      Cz -= 0.2;
      break;
    case '1':
      CRotX += 5;
      break;
    case '2':
      CRotX -= 5;
      break;
    case '3':
      CRotY += 5;
      break;
    case '4':
      CRotY -= 5;
      break;
    case '5':
      CRotZ += 5;
      break;
    case '6':
      CRotZ -= 5;
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