import {M22, drawTriangle} from './texture.mjs';

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
    Cy = 0,
    Cz = 0,
 
    cOffsetX = SCREEN_SIZE_W/2,
    cOffsetY = SCREEN_SIZE_H/2,
   
    offset = [],
    N = [],
    Extension = [],
    CzOnly = [],
    CxCy = [],
    Rx = [],
    Ry = [],
    Rz = [],
    G = [];

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
    this.ZPosition = this.moveVertices[0][2]/3 + this.moveVertices[1][2]/3 + this.moveVertices[2][2]/3;
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
//Directx等左手系座標(Zが大きくなるほど奥に行く)、頂点時計回り配置
let orgPlaneVerts =
    [
      [
        [ -1 ],
        [ -1 ],
        [ 0 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ -1 ],
        [ 0 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ 1 ],
        [ 0 ],
        [ 1 ]
      ],
      [
        [ -1 ],
        [ 1 ],
        [ 0 ],
        [ 1 ]
      ]
    ]

let orgCubeVerts =
    [
      [
        [ -1 ],
        [ -1 ],
        [ -0.1 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ -1 ],
        [ -0.1 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ 1 ],
        [ -0.1 ],
        [ 1 ]
      ],
      [
        [ -1 ],
        [ 1 ],
        [ -0.1 ],
        [ 1 ]
      ],
      [
        [ -1 ],
        [ -1 ],
        [ 0.1 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ -1 ],
        [ 0.1 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ 1 ],
        [ 0.1 ],
        [ 1 ]
      ],
      [
        [ -1 ],
        [ 1 ],
        [ 0.1],
        [ 1 ]
      ]
    ];

class Object{
  
  constructor(verts,x,y,z,Gx,Gy,Gz,RotX,RotY,RotZ,extensionX,extensionY,imgName){
    
    this.objX = x;
    this.objY = y;
    this.objZ = z;
        
    this.Gx = Gx;
    this.Gy = Gy;
    this.Gz = Gz;
      
    this.objRotX = RotX;
    this.objRotY = RotY;
    this.objRotZ = RotZ;

    this.extensionX = extensionX,
    this.extensionY = extensionY,
      
    this.image = new Image();
    this.image.src = imgName;
    
    this.verts = JSON.parse(JSON.stringify(verts));
  }
}

let cube1 = new Object(orgCubeVerts,-4,0,3,0,0,0,0,0,0,150,150,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');
let cube2 = new Object(orgCubeVerts,4,0,3,0,0,0,0,0,0,150,150,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541');

let plane1 = new Object(orgPlaneVerts,0,0,2,0,0,0,0,0.0,0,150,150,'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F60a394aea133b1704cfd2d6e5db73daf.jpg?v=1623199958814');


let cubes = [];
cubes.push(cube1);
cubes.push(cube2);

let planes = [];
planes.push(plane1);

function cameraModel(data,G,Rz,Ry,Rx,CzOnly,CxCy,Extension) {
  var result = [];
  for (var i = 0; i < data.verts.length; i++) {
    result[i] = multiplyMatrix (G ,data.verts[i]);
    result[i] = multiplyMatrix (Rz ,result[i]);
    result[i] = multiplyMatrix (Ry ,result[i]);
    result[i] = multiplyMatrix (Rx ,result[i]);
    result[i] = multiplyMatrix (CzOnly ,result[i]);
    N = 
      [
      [ 1/(result[i][2]) , 0, 0, 0 ],
      [ 0, 1/(result[i][2])  , 0, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
    result[i] = multiplyMatrix (N ,result[i]);
    result[i] = multiplyMatrix (CxCy ,result[i]);
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

function setProjectionMatrix(object,offsetX,offsetY,Cz,Cx,Cy){
  let projectionList = [];
    let offset = 
      [
      [ 1, 0, 0, offsetX ],
      [ 0, 1, 0, offsetY ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];
  
    let Extension = 
      [
      [ object.extensionX,0,  0, 0 ],
      [ 0, object.extensionY,  0, 0 ],
      [ 0, 0,  1,  0 ],
      [ 0, 0, 0, 1 ]
    ];
    //cameraZはここで付加する。
    let CzOnly = 
      [
      [ 1, 0, 0, object.objX ],
      [ 0, 1, 0, object.objY ],
      [ 0, 0, 1, object.objZ-Cz ],
      [ 0, 0, 0, 1 ]
    ];

    let CxCy = 
      [
      [ 1, 0, 0, -Cx ],
      [ 0, 1, 0, -Cy ],
      [ 0, 0, 1, 0  ],
      [ 0, 0, 0, 1 ]
    ];


    let Rx = 
      [
      [ 1, 0, 0, 0 ],
      [ 0, Math.cos(object.objRotX), - Math.sin(object.objRotX), 0 ],
      [ 0, Math.sin(object.objRotX), Math.cos(object.objRotX), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let Ry = 
      [
      [ Math.cos(object.objRotY), 0, Math.sin(object.objRotY), 0 ],
      [ 0, 1, 0, 0 ],
      [ - Math.sin(object.objRotY), 0, Math.cos(object.objRotY), 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let Rz = 
      [
      [ Math.cos(object.objRotZ), - Math.sin(object.objRotZ), 0, 0 ],
      [ Math.sin(object.objRotZ), Math.cos(object.objRotZ), 0, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 0, 1 ]
    ];

    let G = 
      [
      [ 1, 0, 0, -object.Gx ],
      [ 0, 1, 0, -object.Gy ],
      [ 0, 0, 1, -object.Gz ],
      [ 0, 0, 0, 1 ]
    ];

  projectionList.offset = offset;
  projectionList.Extension = Extension;
  projectionList.CzOnly = CzOnly;
  projectionList.CxCy = CxCy;
  projectionList.Rx = Rx;
  projectionList.Ry = Ry;
  projectionList.Rz = Rz;
  projectionList.G = G;

  return projectionList;
}

var mainLoopId = setInterval(function(){
  //画面を黒でクリア
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle="rgb(0,0,0)";
	ctx.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);
  
  //plane
  let movePlanes = [];

  for(let num=0;num<planes.length;num++){
    
    let plane = planes[num];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(plane,cOffsetX,cOffsetY,Cz,Cx,Cy);
    offset = projectionList.offset;
    Extension = projectionList.Extension;
    CzOnly = projectionList.CzOnly;
    CxCy = projectionList.CxCy;
    Rx = projectionList.Rx;
    Ry = projectionList.Ry;
    Rz = projectionList.Rz;
    G = projectionList.G;

    var moveplaneInfo = [];
    moveplaneInfo = cameraModel(plane,G,Rz,Ry,Rx,CzOnly,CxCy,Extension)
    moveplaneInfo.objectNum = num;
    moveplaneInfo.image = plane.image;
    
    movePlanes.push(moveplaneInfo);
  }

  //cube
  let moveCubes = [];

  for(let num=0;num<cubes.length;num++){
    
    let cube = cubes[num];
    
    let projectionList = [];
    projectionList = setProjectionMatrix(cube,cOffsetX,cOffsetY,Cz,Cx,Cy);
    offset = projectionList.offset;
    Extension = projectionList.Extension;
    CzOnly = projectionList.CzOnly;
    CxCy = projectionList.CxCy;
    Rx = projectionList.Rx;
    Ry = projectionList.Ry;
    Rz = projectionList.Rz;
    G = projectionList.G;

    var moveCubeInfo = [];
    moveCubeInfo = cameraModel(cube,G,Rz,Ry,Rx,CzOnly,CxCy,Extension)
    moveCubeInfo.objectNum = num;
    moveCubeInfo.image = cube.image;
    
    moveCubes.push(moveCubeInfo);
  }
  
  //Directx等左手系座標(Zが大きくなるほど奥に行く)、
  //頂点時計回り配置起点から見て左のベクトルの方が先、前面を軸にどのように面が動くかで各面の初期頂点を配置
  let Polygones = [];
  
  //planes
  for(let num=0;num<movePlanes.length;num++){
    
    let movePlane = movePlanes[num];  
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
    Polygones.push(new Polygon(movePlane[0],movePlane[1],movePlane[3],upUV,movePlane.image));
    Polygones.push(new Polygon(movePlane[2],movePlane[3],movePlane[1],downUV,movePlane.image)); 
  }
  console.log(Polygones[0])
  //cubes
  for(let num=0;num<moveCubes.length;num++){
    
    let moveCube = moveCubes[num];  
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
    Polygones.push(new Polygon(moveCube[0],moveCube[1],moveCube[3],upUV,moveCube.image));
    Polygones.push(new Polygon(moveCube[2],moveCube[3],moveCube[1],downUV,moveCube.image)); 
    //後面
    Polygones.push(new Polygon(moveCube[5],moveCube[4],moveCube[6],upUV,moveCube.image));
    Polygones.push(new Polygon(moveCube[7],moveCube[6],moveCube[4],downUV,moveCube.image));
    //上面
    Polygones.push(new Polygon(moveCube[4],moveCube[5],moveCube[0],upUV,moveCube.image));
    Polygones.push(new Polygon(moveCube[1],moveCube[0],moveCube[5],downUV,moveCube.image));
    //下面
    Polygones.push(new Polygon(moveCube[3],moveCube[2],moveCube[7],upUV,moveCube.image));
    Polygones.push(new Polygon(moveCube[6],moveCube[7],moveCube[2],downUV,moveCube.image));
    //左側面
    Polygones.push(new Polygon(moveCube[4],moveCube[0],moveCube[7],upUV,moveCube.image));
    Polygones.push(new Polygon(moveCube[3],moveCube[7],moveCube[0],downUV,moveCube.image));
    //右側面
    Polygones.push(new Polygon(moveCube[1],moveCube[5],moveCube[2],upUV,moveCube.image));
    Polygones.push(new Polygon(moveCube[6],moveCube[2],moveCube[5],downUV,moveCube.image));
  }
      console.log(Polygones[0]);

  let tempZposition = -99999;
  let paintcounter = 0;
  //作画
  while(true){
    for(let i=0;i<Polygones.length;i++){
      if(!(Polygones[i].isdraw) && Polygones[i].ZPosition>=tempZposition){
        tempZposition = Polygones[i].ZPosition;
      }
    }
    for(let i=0;i<Polygones.length;i++){
      if(!(Polygones[i].isdraw) && Polygones[i].ZPosition>=tempZposition){
        Polygones[i].isdraw = true;
        //-の方がこちらに近くなる座標軸だから
      if(Polygones[i].crossZ<0){
        Polygones[i].draw(ctx)
        //drawPolygon(Polygones[i]);
      }
       break;
      }
    }
    
    paintcounter += 1;
    tempZposition = -99999;
    
    if(paintcounter>=Polygones.length){
      break;
    }
  }
  //plane1.objRotY += 0.02;

  //cube1.objRotY += 0.02;
  //cube2.objRotY += 0.02;
  
  //cube3.objRotX += 0.02;
  //cube1.objRotX += 0.02;
  //cube1.objRotZ += 0.02;

}, 1000/60);

document.addEventListener('keydown',e => {
  switch(e.key){
    case 'ArrowLeft':
      Cx -= 0.1;
      break;
    case 'ArrowRight':
      Cx += 0.1;
      break;
    case 'ArrowUp':
      Cy -= 0.1;
      break;
    case 'ArrowDown':
      Cy += 0.1;
      break;
    case 'u':
      Cz += 0.1;
      break;   
    case 'd':
      Cz -= 0.1;
      break;
  }
});

function drawPolygon(Polygon) {
    if (Polygon.moveVertices[0][2] > 0.6 && Polygon.moveVertices[1][2] > 0.6 && Polygon.moveVertices[2][2] > 0.6) {
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.moveTo(Polygon.moveVertices[0][0],(Polygon.moveVertices[0][1]));
      ctx.lineTo(Polygon.moveVertices[1][0],(Polygon.moveVertices[1][1]));
      ctx.lineTo(Polygon.moveVertices[2][0],(Polygon.moveVertices[2][1]));
      ctx.closePath();

      ctx.fill();
    }
}