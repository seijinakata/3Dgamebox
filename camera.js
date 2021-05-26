import {M22, drawTriangle} from './texture.mjs';


const SCREEN_SIZE_W = 1000;
const SCREEN_SIZE_H = 1000;

var c = document.getElementById("myCanvas");
c.width = SCREEN_SIZE_W;
c.height = SCREEN_SIZE_H;

var ctx = c.getContext("2d");

// Camera
let  Gx = 0,
    Gy = 0,
    Gz = 1.5,

    CRotX = 0,
    CRotY = 0,
    CRotZ = 0,

    Cx = 0,
    Cy = 0,
    Cz = -5,
 
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
  constructor(Pos1,Pos2,Pos3,image){
    this.isdraw = false;
    this.moveVertices = [];
    this.moveVertices.push(Pos1);
    this.moveVertices.push(Pos2);
    this.moveVertices.push(Pos3);
    this.image = image;
    this.ZPosition = this.moveVertices[0][2]/3 + this.moveVertices[1][2]/3 + this.moveVertices[2][2]/3;
    this.crossX,this.crossY,this.crossZ = culVecCross(Pos1,Pos2,Pos3);
  }
  
  draw(con){
    drawTriangle(con, this.image, 
      [
       this.moveVertices[0].x, this.moveVertices[0].y,
       this.moveVertices[3].x, this.moveVertices[3].y,
       this.moveVertices[1].x, this.moveVertices[1].y,
      ],
      [
       0, 0,
       1, 0,
       0, 1
      ]
    );
    drawTriangle(con, this.image, 
      [
       this.moveVertices[1].x, this.moveVertices[1].y,
       this.moveVertices[2].x, this.moveVertices[2].y,
       this.moveVertices[3].x, this.moveVertices[3].y,
      ],
      [
       0   , 1,
       1   , 1,
       1   , 0
      ]
    );
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
let orgCubeVerts =
    [
      [
        [ -1 ],
        [ -1 ],
        [ -1 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ -1 ],
        [ -1 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ 1 ],
        [ -1 ],
        [ 1 ]
      ],
      [
        [ -1 ],
        [ 1 ],
        [ -1 ],
        [ 1 ]
      ],
      [
        [ -1 ],
        [ -1 ],
        [ 1 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ -1 ],
        [ 1 ],
        [ 1 ]
      ],
      [
        [ 1 ],
        [ 1 ],
        [ 1 ],
        [ 1 ]
      ],
      [
        [ -1 ],
        [ 1 ],
        [ 1 ],
        [ 1 ]
      ]
    ];

class Cube{
  
  constructor(verts,x,y,z,RotX,RotY,RotZ,extensionX,extensionY){
    
    this.objX = x;
    this.objY = y;
    this.objZ = z;
    
    this.objRotX = RotX;
    this.objRotY = RotY;
    this.objRotZ = RotZ;
    
    this.extensionX = extensionX,
    this.extensionY = extensionY,
   
    this.verts = JSON.parse(JSON.stringify(verts));
  }
}

let cube1 = new Cube(orgCubeVerts,0,0,4,0,0,0,150,150);

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

function drawPolygon(Polygon) {
    if (Polygon.moveVertices[0][2] > 0 && Polygon.moveVertices[1][2] > 0 && Polygon.moveVertices[2][2] > 0) {
      ctx.fillStyle = Polygon.image;
      ctx.beginPath();
      ctx.moveTo(Polygon.moveVertices[0][0],(Polygon.moveVertices[0][1]));
      ctx.lineTo(Polygon.moveVertices[1][0],(Polygon.moveVertices[1][1]));
      ctx.lineTo(Polygon.moveVertices[2][0],(Polygon.moveVertices[2][1]));
      ctx.closePath();

      ctx.fill();
    }
}

var mainLoopId = setInterval(function(){
  //画面を黒でクリア
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle="rgb(0,0,0)";
	ctx.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);

  offset = 
    [
    [ 1, 0, 0, cOffsetX ],
    [ 0, 1, 0, cOffsetY ],
    [ 0, 0, 1, 0 ],
    [ 0, 0, 0, 1 ]
  ];

  Extension = 
    [
    [ cube1.extensionX,0,  0, 0 ],
    [ 0, cube1.extensionY,  0, 0 ],
    [ 0, 0,  1,  0 ],
    [ 0, 0, 0, 1 ]
  ];

  CzOnly = 
    [
    [ 1, 0, 0, 0 ],
    [ 0, 1, 0, 0 ],
    [ 0, 0, 1, cube1.objZ ],
    [ 0, 0, 0, 1 ]
  ];
  
  CxCy = 
    [
    [ 1, 0, 0, cube1.objX ],
    [ 0, 1, 0, cube1.objY ],
    [ 0, 0, 1, 0 ],
    [ 0, 0, 0, 1 ]
  ];

  Rx = 
    [
    [ 1, 0, 0, 0 ],
    [ 0, Math.cos(cube1.objRotX), - Math.sin(cube1.objRotX), 0 ],
    [ 0, Math.sin(cube1.objRotX), Math.cos(cube1.objRotX), 0 ],
    [ 0, 0, 0, 1 ]
  ];

  Ry = 
    [
    [ Math.cos(cube1.objRotY), 0, Math.sin(cube1.objRotY), 0 ],
    [ 0, 1, 0, 0 ],
    [ - Math.sin(cube1.objRotY), 0, Math.cos(cube1.objRotY), 0 ],
    [ 0, 0, 0, 1 ]
  ];

  Rz = 
    [
    [ Math.cos(cube1.objRotZ), - Math.sin(cube1.objRotZ), 0, 0 ],
    [ Math.sin(cube1.objRotZ), Math.cos(cube1.objRotZ), 0, 0 ],
    [ 0, 0, 1, 0 ],
    [ 0, 0, 0, 1 ]
  ];

  G = 
    [
    [ 1, 0, 0, -Gx ],
    [ 0, 1, 0, -Gy ],
    [ 0, 0, 1, -Gz ],
    [ 0, 0, 0, 1 ]
  ];

  var cubes = [];
  cubes = cameraModel(cube1,G,Rz,Ry,Rx,CzOnly,CxCy,Extension)
  
  //Directx等左手系座標(Zが大きくなるほど奥に行く)、
  //頂点時計回り配置起点から見て左のベクトルの方が先、前面を軸にどのように面が動くかで各面の初期頂点を配置
  let Polygones = [];
    //前面
  Polygones.push(new Polygon(cubes[0],cubes[1],cubes[3],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[2],cubes[3],cubes[1],'rgb(255,0,0)')); 
  //後面
  Polygones.push(new Polygon(cubes[5],cubes[4],cubes[6],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[7],cubes[6],cubes[4],'rgb(255,0,255)'));
  //上面
  Polygones.push(new Polygon(cubes[4],cubes[5],cubes[0],'rgb(255,100,0)'));
  Polygones.push(new Polygon(cubes[1],cubes[0],cubes[5],'rgb(255,0,0)'));
  //下面
  Polygones.push(new Polygon(cubes[3],cubes[2],cubes[7],'rgb(255,255,100)'));
  Polygones.push(new Polygon(cubes[6],cubes[7],cubes[2],'rgb(255,0,0)'));
  //左側面
  Polygones.push(new Polygon(cubes[4],cubes[0],cubes[7],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[3],cubes[7],cubes[0],'rgb(255,0,100)'));
  //右側面
  Polygones.push(new Polygon(cubes[1],cubes[5],cubes[2],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[6],cubes[2],cubes[5],'rgb(255,111,0)'));
  
  let tempZposition = -99999;
  let paintcounter = 0;
  console.log(Polygones[0].crossZ)
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
      if(Polygones[i].crossZ<0){
        drawPolygon(Polygones[i]);
      }
        paintcounter += 1;
        tempZposition = -99999;
          break;
      }
    }
    if(paintcounter>=Polygones.length){
      break;
    }
  }

  cube1.objRotY += 0.02;
  cube1.objRotX += 0.02;
  //cube1.objRotZ += 0.02;

}, 1000/60);