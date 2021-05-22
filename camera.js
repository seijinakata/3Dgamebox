import {M22, drawTriangle} from './texture.mjs';

var width = 1200,
    height = 960;

var c = document.getElementById("myCanvas");
c.width = width;
c.height = height;

var ctx = c.getContext("2d");

// Camera
let  Gx = 0,
    Gy = 0,
    Gz = 1,

    CRotX = 0,
    CRotY = 0,
    CRotZ = 0,

    Cx = 0,
    Cy = 0,
    Cz = -3,
 
    cOffsetX = width/2,
    cOffsetY = height/2,
   
    offset = [],
    N = [],
    Extension = [],
    CzOnly = [],
    CxCy = [],
    Rx = [],
    Ry = [],
    Rz = [],
    G = [];

var pix = 12;


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
let cube1 = new Cube(orgCubeVerts,0,0,3,0,0,0,50,50);

var edges =
    [
      [ 
        [ 0 ], 
        [ 1 ] 
      ],
      [ 
        [ 1 ], 
        [ 2 ] 
      ],
      [ 
        [ 2 ], 
        [ 3 ] 
      ],
      [ 
        [ 0 ], 
        [ 4 ] 
      ],
      [ 
        [ 4 ], 
        [ 7 ] 
      ],
      [ 
        [ 7 ], 
        [ 3 ] 
      ],
      [ 
        [ 1 ], 
        [ 4 ] 
      ],
      [ 
        [ 3 ], 
        [ 7 ] 
      ],
      [ 
        [ 4 ], 
        [ 5 ] 
      ],
      [ 
        [ 4 ], 
        [ 5 ] 
      ],
      [ 
        [ 5 ], 
        [ 6 ] 
      ],
      [ 
        [ 6 ], 
        [ 7 ] 
      ]
    ];

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

function displayData(points,lines) {
  drawLines(points, lines);
}
function drawLines(points, lines) {
  for (var i = 0; i < lines.length; i++) {
    var j = lines[i][0];
    var k = lines[i][1];
    if (points[j][2] > 0 && points[k][2] > 0) {
      ctx.beginPath();
      ctx.moveTo(points[j][0],(points[j][1]));
      ctx.lineTo(points[k][0],(points[k][1]));
      ctx.stroke();
    }
  }
}

var mainLoopId = setInterval(function(){
  ctx.clearRect(0, 0, width, height);

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
  
    Cx = -1;

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

  var camera = [];
  camera = cameraModel(cube1,G,Rz,Ry,Rx,CzOnly,CxCy,Extension) 
  displayData(camera, edges);

  cube1.objRotZ += 0.02;
  cube1.objRotX += 0.02;
}, 1000/60);