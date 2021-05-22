import {M22, drawTriangle} from './texture.mjs';

var width = 6000,
    height = 4800;

var c = document.getElementById("myCanvas");
c.width = width;
c.height = height;

var ctx = c.getContext("2d");

// Camera
let  Gx = 0,
    Gy = 0,
    Gz = 1,

    RotX = 0,
    RotY = 0,
    RotZ = 0,

    Cx = 0,
    Cy = -2,
    Cz = -3,
    
    extensionX = 50,
    extensionY = 50,
    
    offsetX = 500,
    offsetY = 500,

    
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
  
  constructor(verts){
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
let cube1 = new Cube(orgCubeVerts);

let cube2 = new Cube(orgCubeVerts);

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
    [ 1, 0, 0, offsetX ],
    [ 0, 1, 0, offsetY ],
    [ 0, 0, 1, 0 ],
    [ 0, 0, 0, 1 ]
  ];

  Extension = 
    [
    [ extensionX,0,  0, 0 ],
    [ 0, extensionY,  0, 0 ],
    [ 0, 0,  1,  0 ],
    [ 0, 0, 0, 1 ]
  ];

  CzOnly = 
    [
    [ 1, 0, 0, 0 ],
    [ 0, 1, 0, 0 ],
    [ 0, 0, 1, -Cz ],
    [ 0, 0, 0, 1 ]
  ];
  
    Cx = -1;

  CxCy = 
    [
    [ 1, 0, 0, -Cx ],
    [ 0, 1, 0, -Cy ],
    [ 0, 0, 1, 0 ],
    [ 0, 0, 0, 1 ]
  ];

  Rx = 
    [
    [ 1, 0, 0, 0 ],
    [ 0, Math.cos(RotX), - Math.sin(RotX), 0 ],
    [ 0, Math.sin(RotX), Math.cos(RotX), 0 ],
    [ 0, 0, 0, 1 ]
  ];

  Ry = 
    [
    [ Math.cos(RotY), 0, Math.sin(RotY), 0 ],
    [ 0, 1, 0, 0 ],
    [ - Math.sin(RotY), 0, Math.cos(RotY), 0 ],
    [ 0, 0, 0, 1 ]
  ];

  Rz = 
    [
    [ Math.cos(RotZ), - Math.sin(RotZ), 0, 0 ],
    [ Math.sin(RotZ), Math.cos(RotZ), 0, 0 ],
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

  var camera1 = [];
  Cx = -4;
  CxCy = 
    [
    [ 1, 0, 0, -Cx ],
    [ 0, 1, 0, -Cy ],
    [ 0, 0, 1, 0 ],
    [ 0, 0, 0, 1 ]
  ];
  camera1 = cameraModel(cube2,G,Rz,Ry,Rx,CzOnly,CxCy,Extension) 
  displayData(camera1, edges);

  RotY += 0.02;
  //RotX += 0.02;
}, 1000/60);