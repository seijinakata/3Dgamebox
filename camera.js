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

let orgCubeVerts =
    [
      [
        [ -1 ],
        [ -1 ],
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
        [ 1 ],
        [ 1 ],
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
        [ -1 ],
        [ -1 ],
        [ 1 ],
        [ 1 ]
      ],
      [
        [ -1 ],
        [ 1 ],
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
        [ 1 ],
        [ -1 ],
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
  
  let Polygones = []; 
  //上面
  Polygones.push(new Polygon(cubes[4],cubes[7],cubes[0],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[0],cubes[3],cubes[7],'rgb(255,0,0)'));
  //Polygones.push(new Polygon(cube.dotMovePos[4],cube.dotMovePos[0],cube.dotMovePos[3],cube.dotMovePos[7],4,cube.image));
  //下面
  Polygones.push(new Polygon(cubes[5],cubes[6],cubes[1],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[1],cubes[2],cubes[6],'rgb(255,0,0)'));
  //Polygones.push(new Polygon(cube.dotMovePos[5],cube.dotMovePos[1],cube.dotMovePos[2],cube.dotMovePos[6],4,cube.image));
  //後面
  Polygones.push(new Polygon(cubes[4],cubes[7],cubes[5],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[5],cubes[6],cubes[7],'rgb(255,0,255)'));
  //Polygones.push(new Polygon(cube.dotMovePos[4],cube.dotMovePos[5],cube.dotMovePos[6],cube.dotMovePos[7],4,cube.image));
  //左側面
  Polygones.push(new Polygon(cubes[4],cubes[0],cubes[5],'rgb(255,255,111)'));
  Polygones.push(new Polygon(cubes[5],cubes[1],cubes[0],'rgb(255,0,0)'));
  //Polygones.push(new Polygon(cube.dotMovePos[4],cube.dotMovePos[5],cube.dotMovePos[1],cube.dotMovePos[0],4,cube.image));
  //右側面
  Polygones.push(new Polygon(cubes[7],cubes[3],cubes[6],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[6],cubes[2],cubes[3],'rgb(255,0,0)'));
  //Polygones.push(new Polygon(cube.dotMovePos[7],cube.dotMovePos[6],cube.dotMovePos[2],cube.dotMovePos[3],4,cube.image));
  //前面
  Polygones.push(new Polygon(cubes[0],cubes[3],cubes[1],'rgb(255,255,0)'));
  Polygones.push(new Polygon(cubes[1],cubes[2],cubes[3],'rgb(255,0,0)'));
  //Polygones.push(new Polygon(cube.dotMovePos[0],cube.dotMovePos[1],cube.dotMovePos[2],cube.dotMovePos[3],4,cube.image));

  
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
     drawPolygon(Polygones[i]);
        paintcounter += 1;
        tempZposition = -99999;
          break;
      }
    }
    if(paintcounter>=Polygones.length){
      break;
    }
  }

  cube1.objRotZ += 0.02;
  cube1.objRotX += 0.02;
}, 1000/60);