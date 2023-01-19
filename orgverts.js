//並び順は左上、右上、左上、左下
export let orgPlaneVerts = {
  "vertsPosition":[
      [-0.25 ,-0.1,-0.25,1],
      [0.25,-0.1,-0.25,1],
      [0.25,0.1,-0.25,1],
      [-0.25,0.1,-0.25,1],
      [-0.25,-0.1,0.25,1],
      [0.25,-0.1,0.25,1],
      [0.25,0.1,0.25,1],
      [-0.25,0.1,0.25,1]
    ],
    "bonesIndex":[
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    "bonesWaight":[
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }   
export let orgCubeVerts = {
  "vertsPosition":[
      [-0.25 ,-0.25,-0.25,1],
      [0.25,-0.25,-0.25,1],
      [0.25,0.25,-0.25,1],
      [-0.25,0.25,-0.25,1],
      [-0.25,-0.25,0.25,1],
      [0.25,-0.25,0.25,1],
      [0.25,0.25,0.25,1],
      [-0.25,0.25,0.25,1]
    ],
    "bonesIndex":[
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    "bonesWaight":[
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }
export let waistVerts = {
  "vertsPosition":[
    [-0.25 ,-1.5,-0.25,1],
    [0,-1.5,-0.25,1],
    [0,-1,-0.25,1],
    [-0.25,-1,-0.25,1],
    [-0.25,-1.5,0.25,1],
    [0,-1.5,0.25,1],
    [0,-1,0.25,1],
    [-0.25,-1,0.25,1],

    [0,-1.5,-0.25,1],
    [0.25,-1.5,-0.25,1],
    [0.25,-1,-0.25,1],
    [0,-1,-0.25,1],
    [0,-1.5,0.25,1],
    [0.25,-1.5,0.25,1],
    [0.25,-1,0.25,1],
    [0,-1,0.25,1]
    ],
    "bonesIndex":[
      [0,5],//up
      [0,5],
      [0,1],//down
      [0,1],
      [0,5],
      [0,5],
      [0,1],
      [0,1],

      [0,5],//up
      [0,5],
      [0,3],//down
      [0,3],
      [0,5],
      [0,5],
      [0,3],
      [0,3],
    ],
    "bonesWaight":[
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],

      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],

      [8,9,11],
      [10,11,9],
      [12,13,8],
      [9,8,13],
      [13,12,14],
      [15,14,4],
      [11,10,15],
      [14,15,10],
      [12,8,15],
      [11,15,8],
      [9,13,10],
      [14,10,13],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":0.5,"v":0},{"u":0,"v":1}],
      [{"u":0.5,"v":1},{"u":0,"v":1},{"u":0.5,"v":0}],
      [{"u":0,"v":0},{"u":0.5,"v":0},{"u":0,"v":1}],
      [{"u":0.5,"v":1},{"u":0,"v":1},{"u":0.5,"v":0}],
      [{"u":0,"v":0},{"u":0.5,"v":0},{"u":0,"v":1}],
      [{"u":0.5,"v":1},{"u":0,"v":1},{"u":0.5,"v":0}],
      [{"u":0,"v":0},{"u":0.5,"v":0},{"u":0,"v":1}],
      [{"u":0.5,"v":1},{"u":0,"v":1},{"u":0.5,"v":0}],
      [{"u":0,"v":0},{"u":0.5,"v":0},{"u":0,"v":1}],
      [{"u":0.5,"v":1},{"u":0,"v":1},{"u":0.5,"v":0}],
      [{"u":0,"v":0},{"u":0.5,"v":0},{"u":0,"v":1}],
      [{"u":0.5,"v":1},{"u":0,"v":1},{"u":0.5,"v":0}],

      [{"u":0.5,"v":0},{"u":1,"v":0},{"u":0.5,"v":1}],
      [{"u":1,"v":1},{"u":0.5,"v":1},{"u":1,"v":0}],
      [{"u":0.5,"v":0},{"u":1,"v":0},{"u":0.5,"v":1}],
      [{"u":1,"v":1},{"u":0.5,"v":1},{"u":1,"v":0}],
      [{"u":0.5,"v":0},{"u":1,"v":0},{"u":0.5,"v":1}],
      [{"u":1,"v":1},{"u":0.5,"v":1},{"u":1,"v":0}],
      [{"u":0.5,"v":0},{"u":1,"v":0},{"u":0.5,"v":1}],
      [{"u":1,"v":1},{"u":0.5,"v":1},{"u":1,"v":0}],
      [{"u":0.5,"v":0},{"u":1,"v":0},{"u":0.5,"v":1}],
      [{"u":1,"v":1},{"u":0.5,"v":1},{"u":1,"v":0}],
      [{"u":0.5,"v":0},{"u":1,"v":0},{"u":0.5,"v":1}],
      [{"u":1,"v":1},{"u":0.5,"v":1},{"u":1,"v":0}],
    ]
  }
export let RightLeg1Verts = {
    "vertsPosition":[
      [-0.25,-1,-0.25,1],
      [0,-1,-0.25,1],
      [0,-0.5,-0.25,1],
      [-0.25,-0.5,-0.25,1],
      [-0.25,-1,0.25,1],
      [0,-1,0.25,1],
      [0,-0.5,0.25,1],
      [-0.25,-0.5,0.25,1]
    ],
    "bonesIndex":[
      [0,1],//up
      [0,1],
      [1,2],//down
      [1,2],
      [0,1],
      [0,1],
      [1,2],
      [1,2],
    ],
    "bonesWaight":[
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }
export let RightLeg2Verts = {
  "vertsPosition":[
      [-0.25,-0.5,-0.25,1],
      [0,-0.5,-0.25,1],
      [ 0,0,-0.25,1],
      [-0.25,0,-0.25,1],
      [-0.25,-0.5,0.25,1],
      [0,-0.5,0.25,1],
      [0,0,0.25,1],
      [-0.25,0,0.25,1]
    ],
    "bonesIndex":[
      [1,2],//up
      [1,2],//
      [2],
      [2],
      [1,2],//
      [1,2],//
      [2],
      [2],
    ],
    "bonesWaight":[
      [0.5,0.5],
      [0.5,0.5],
      [1],
      [1],
      [0.5,0.5],
      [0.5,0.5],
      [1],
      [1],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }
export let LeftLeg1Verts = {
  "vertsPosition":[
      [0 ,-1,-0.25,1],
      [0.25,-1,-0.25,1],
      [0.25,-0.5,-0.25,1],
      [0,-0.5,-0.25,1],
      [0,-1,0.25,1],
      [0.25,-1,0.25,1],
      [0.25,-0.5,0.25,1],
      [0,-0.5,0.25,1]
    ],
    "bonesIndex":[
      [0,3],//up
      [0,3],
      [3,4],//down
      [3,4],
      [0,3],
      [0,3],
      [3,4],
      [3,4],
    ],
    "bonesWaight":[
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }
export let LeftLeg2Verts = {
  "vertsPosition":[
      [0 ,-0.5,-0.25,1],
      [0.25,-0.5,-0.25,1],
      [0.25,0,-0.25,1],
      [0,0,-0.25,1],
      [0,-0.5,0.25,1],
      [0.25,-0.5,0.25,1],
      [0.25,0,0.25,1],
      [0,0,0.25,1]
    ],
    "bonesIndex":[
      [3,4],//up
      [3,4],//
      [4],
      [4],
      [3,4],//
      [3,4],//
      [4],
      [4],
    ],
    "bonesWaight":[
      [0.5,0.5],
      [0.5,0.5],
      [1],
      [1],
      [0.5,0.5],
      [0.5,0.5],
      [1],
      [1],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }
export let spineVerts = {
  "vertsPosition":[
      [-0.25 ,-2,-0.25,1],
      [0.25,-2,-0.25,1],
      [0.25,-1.75,-0.25,1],
      [-0.25,-1.75,-0.25,1],
      [-0.25,-2,0.25,1],
      [0.25,-2,0.25,1],
      [0.25,-1.75,0.25,1],
      [-0.25,-1.75,0.25,1],

      [-0.25 ,-1.75,-0.25,1],
      [0.25,-1.75,-0.25,1],
      [0.25,-1.5,-0.25,1],
      [-0.25,-1.5,-0.25,1],
      [-0.25,-1.75,0.25,1],
      [0.25,-1.75,0.25,1],
      [0.25,-1.5,0.25,1],
      [-0.25,-1.5,0.25,1]
    ],
    "bonesIndex":[
      [5,6],//right
      [5,8],//left
      [5,8],
      [5,6],
      [5,6],
      [5,8],
      [5,8],
      [5,6],

      [5,6],//right
      [5,8],//left
      [0,5],//down
      [0,5],//
      [5,6],
      [5,8],
      [0,5],//
      [0,5],//
    ],
    "bonesWaight":[
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],

      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],

      [8,9,11],
      [10,11,9],
      [12,13,8],
      [9,8,13],
      [13,12,14],
      [15,14,4],
      [11,10,15],
      [14,15,10],
      [12,8,15],
      [11,15,8],
      [9,13,10],
      [14,10,13],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":0.5}],
      [{"u":1,"v":0.5},{"u":0,"v":0.5},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":0.5}],
      [{"u":1,"v":0.5},{"u":0,"v":0.5},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":0.5}],
      [{"u":1,"v":0.5},{"u":0,"v":0.5},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":0.5}],
      [{"u":1,"v":0.5},{"u":0,"v":0.5},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":0.5}],
      [{"u":1,"v":0.5},{"u":0,"v":0.5},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":0.5}],
      [{"u":1,"v":0.5},{"u":0,"v":0.5},{"u":1,"v":0}],

      [{"u":0,"v":0.5},{"u":1,"v":0.5},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0.5}],
      [{"u":0,"v":0.5},{"u":1,"v":0.5},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0.5}],
      [{"u":0,"v":0.5},{"u":1,"v":0.5},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0.5}],
      [{"u":0,"v":0.5},{"u":1,"v":0.5},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0.5}],
      [{"u":0,"v":0.5},{"u":1,"v":0.5},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0.5}],
      [{"u":0,"v":0.5},{"u":1,"v":0.5},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0.5}]
    ]
  }
export let rightArm1Verts = {
  "vertsPosition":[
      [-0.75 ,-2,-0.15,1],
      [-0.25,-2,-0.15,1],
      [-0.25,-1.75,-0.15,1],
      [-0.75,-1.75,-0.15,1],
      [-0.75,-2,0.15,1],
      [-0.25,-2,0.15,1],
      [-0.25,-1.75,0.15,1],
      [-0.75,-1.75,0.15,1]
    ],
    "bonesIndex":[
      [6,7],//right
      [5,6],//left
      [5,6],//
      [6,7],
      [6,7],
      [5,6],
      [5,6],
      [6,7],
    ],
    "bonesWaight":[
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }  
export let rightArm2Verts = {
  "vertsPosition":[
      [-1.25 ,-2,-0.15,1],
      [-0.75,-2,-0.15,1],
      [-0.75,-1.75,-0.15,1],
      [-1.25,-1.75,-0.15,1],
      [-1.25,-2,0.15,1],
      [-0.75,-2,0.15,1],
      [-0.75,-1.75,0.15,1],
      [-1.25,-1.75,0.15,1]
    ],
    "bonesIndex":[
      [7],//right
      [6,7],//left
      [6,7],
      [7],
      [7],
      [6,7],
      [6,7],
      [7],
    ],
    "bonesWaight":[
      [1],
      [0.5,0.5],
      [0.5,0.5],
      [1],
      [1],
      [0.5,0.5],
      [0.5,0.5],
      [1],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  } 
export let leftArm1Verts = {
  "vertsPosition":[
      [0.25 ,-2,-0.15,1],
      [0.75,-2,-0.15,1],
      [0.75,-1.75,-0.15,1],
      [0.25,-1.75,-0.15,1],
      [0.25,-2,0.15,1],
      [0.75,-2,0.15,1],
      [0.75,-1.75,0.15,1],
      [0.25,-1.75,0.15,1]
    ],
    "bonesIndex":[
      [5,8],//right
      [8,9],//left
      [8,9],
      [5,8],
      [5,8],
      [8,9],
      [8,9],
      [5,8]
    ],
    "bonesWaight":[
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
      [0.5,0.5],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  } 
export let leftArm2Verts = {
  "vertsPosition":[
      [0.75 ,-2,-0.15,1],
      [1.25 ,-2,-0.15,1],
      [1.25 ,-1.75,-0.15,1],
      [0.75,-1.75,-0.15,1],
      [0.75,-2,0.15,1],
      [1.25 ,-2,0.15,1],
      [1.25 ,-1.75,0.15,1],
      [0.75,-1.75,0.15,1]
    ],
    "bonesIndex":[
      [8,9],//right
      [9],//left
      [9],
      [8,9],
      [8,9],
      [9],
      [9],
      [8,9],
    ],
    "bonesWaight":[
      [0.5,0.5],
      [1],
      [1],
      [0.5,0.5],
      [0.5,0.5],
      [1],
      [1],
      [0.5,0.5],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }
export let headVerts = {
  "vertsPosition":[
      [-0.25 ,-2.25,-0.15,1],
      [0.25,-2.25,-0.15,1],
      [0.25,-2,-0.15,1],
      [-0.25,-2,-0.15,1],
      [-0.25,-2.25,0.15,1],
      [0.25,-2.25,0.15,1],
      [0.25,-2,0.15,1],
      [-0.25,-2,0.15,1]
    ],
    "bonesIndex":[
      [10],
      [10],
      [5,10],//down
      [5,10],//
      [10],
      [10],
      [5,10],//
      [5,10],//
    ],
    "bonesWaight":[
      [1],
      [1],
      [0.5,0.5],
      [0.5,0.5],
      [1],
      [1],
      [0.5,0.5],
      [0.5,0.5],
    ],
    "faceIndex":[
      [0,1,3],
      [2,3,1],
      [4,5,0],
      [1,0,5],
      [5,4,6],
      [7,6,4],
      [3,2,7],
      [6,7,2],
      [4,0,7],
      [3,7,0],
      [1,5,2],
      [6,2,5],
    ],
    "uv":[
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
      [{"u":0,"v":0},{"u":1,"v":0},{"u":0,"v":1}],
      [{"u":1,"v":1},{"u":0,"v":1},{"u":1,"v":0}],
    ]
  }