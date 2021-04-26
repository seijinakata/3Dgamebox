const SCREEN_SIZE_W = 1000;
const SCREEN_SIZE_H = 1000;

let can = document.getElementById("can");
let con = can.getContext("2d");

can.width = SCREEN_SIZE_W;
can.height = SCREEN_SIZE_H;

let playermoveX = 0;
let playermoveY = 0;
let playermoveZ = 0;

class POS{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
class Polygon{
  //左上、左下、右下、右上の順
  constructor(Pos1,Pos2,Pos3,Pos4,col){
    this.isdraw = false;
    this.moveVertices = [];
    this.moveVertices.push(Pos1);
    this.moveVertices.push(Pos2);
    this.moveVertices.push(Pos3);
    this.moveVertices.push(Pos4);
    this.color = col
    this.ZPosition = this.moveVertices[0].z + this.moveVertices[1].z + this.moveVertices[2].z + this.moveVertices[3].z;
  }
  draw(){
    con.fillStyle=this.color;
    con.beginPath();
    con.moveTo(this.moveVertices[0].x,this.moveVertices[0].y);
    con.lineTo(this.moveVertices[1].x,this.moveVertices[1].y);
    con.lineTo(this.moveVertices[2].x,this.moveVertices[2].y);
    con.lineTo(this.moveVertices[3].x,this.moveVertices[3].y);
    con.fill();
  }
}
class Cube{
  
  constructor(x,y,z,extension,deg,num,state){
    this.x = x;
    this.y = y;
    this.z = z;
    this.extension = extension;
    this.deg = deg;
    this.num = num;
    this.state = state;
    this.dotOriginPos = [];
    //すべて距離の長さ1で統一後で計算後拡大する
    this.dotOriginPos.push(new POS(-1,1,-1));
    this.dotOriginPos.push(new POS(-1,-1,-1));
    this.dotOriginPos.push(new POS(1,-1,-1));
    this.dotOriginPos.push(new POS(1,1,-1));

    this.dotOriginPos.push(new POS(-1,1,1));
    this.dotOriginPos.push(new POS(-1,-1,1));
    this.dotOriginPos.push(new POS(1,-1,1));
    this.dotOriginPos.push(new POS(1,1,1));
    
    //変化後格納
    this.dotMovePos = [];
    for(let i=0;i<8;i++){
      this.dotMovePos.push(new POS(0,0,0));     
    }
  }
  turnupdate(moveX,moveY,moveZ){
  //当たり判定のための一時的な格納
  this.tempDotMovePosX = [];
  this.tempDotMovePosY = [];
  this.tempDotMovePosZ = [];
  this.collision = false;
    
  let c = Math.cos(this.deg*Math.PI/180);
	let s = Math.sin(this.deg*Math.PI/180);
  this.deg++;
  if(this.deg>360){
    this.deg = 0;
    this.state += 1;
    this.state %= 2;
  }
    //8つの頂点の回転計算
    //動いていない位置からの相対変化なのでstateの切り替えで変化前のオブジェクトの位置は記憶されていない
    for(let i=0;i<this.num;i++){
      if(this.state == 0){
      this.dotMovePos[i].x = this.dotOriginPos[i].x*c + this.dotOriginPos[i].z * (-s);
      this.dotMovePos[i].y = this.dotOriginPos[i].y;
      this.dotMovePos[i].z = this.dotOriginPos[i].x*s + this.dotOriginPos[i].z * (c);
      }else{
      this.dotMovePos[i].x = this.dotOriginPos[i].x;
      this.dotMovePos[i].y = this.dotOriginPos[i].y*c + this.dotOriginPos[i].z * (-s);
      this.dotMovePos[i].z = this.dotOriginPos[i].y*s + this.dotOriginPos[i].z * (c);
      }
      //dotMovePos[i].y = dotOriginPos[i].y;
      //dotMovePos[i].z = dotOriginPos[i].z;
      this.dotMovePos[i].z+= this.z;
      //dotMovePos[i].z = 5;


      //outrunでも使った奥行きを付加したx,yの座標
      this.dotMovePos[i].x/= this.dotMovePos[i].z;
      this.dotMovePos[i].y/= this.dotMovePos[i].z;
      //拡大
      this.dotMovePos[i].x *= this.extension;
      this.dotMovePos[i].y *= this.extension;
      //移動
      this.dotMovePos[i].x += this.x;
      this.dotMovePos[i].y += this.y;
      
      this.tempDotMovePosX[i] = this.dotMovePos[i].x  + moveX;
      this.tempDotMovePosY[i] = this.dotMovePos[i].y  + moveY;
      this.tempDotMovePosZ[i] = this.dotMovePos[i].z  + moveZ;
    }
    this.collisionAABBMinX = Math.min(...this.tempDotMovePosX);
    this.collisionAABBMaxX = Math.max(...this.tempDotMovePosX);
    this.collisionAABBMinY = Math.min(...this.tempDotMovePosY);
    this.collisionAABBMaxY = Math.max(...this.tempDotMovePosY);
    this.collisionAABBMinZ = Math.min(...this.tempDotMovePosZ);
    this.collisionAABBMaxZ = Math.max(...this.tempDotMovePosZ);
  }
  move(moveX,moveY,moveZ){
    this.x += moveX;
    this.y += moveY;
    this.z += moveZ;
  }
   AABBcollision(cube){
    if(this == cube){
      return false;
    }else{
      return (this.collisionAABBMinX <= cube.collisionAABBMaxX && this.collisionAABBMaxX >= cube.collisionAABBMinX) &&
        (this.collisionAABBMinY <= cube.collisionAABBMaxY && this.collisionAABBMaxY >= cube.collisionAABBMinY) &&
       (this.collisionAABBMinZ <= cube.collisionAABBMaxZ  && this.collisionAABBMaxZ  >= cube.collisionAABBMinZ)
     }
  }
}

let cubes = [];
cubes.push(new Cube(500,150,5,350,0,8,0));
cubes.push(new Cube(150,150,7,250,0,8,0));
cubes.push(new Cube(700,700,3,250,0,8,0));

setInterval(mainLoop,1000/60);

  let circleTurnDeg = 0;
  let circlestate = 0;

function mainLoop(){
  //画面を黒でクリア
	con.globalCompositeOperation = 'source-over';
	con.fillStyle="rgb(0,0,0)";
	con.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);
  
  //球
  let numCorners = 8;
  let numRings = 1;
  //numVertices分入れる
  let dotOriginPos = [];
  let dotMovePos = [];
  let numVertices = numCorners * numRings;
  let circleDeg = 360/numCorners;
  for(let i=0;i<numCorners;i++){
    let x = Math.sin(circleDeg * i*Math.PI/180);
    let y = Math.cos(circleDeg * i*Math.PI/180);
    let z = 0;
    dotOriginPos.push(new POS(x,y,z));
  }
  for(let i=0;i<numCorners;i++){
    dotMovePos.push(new POS(0,0,0));
  }
  circleTurnDeg++;     
  let circlec = Math.cos(circleTurnDeg*Math.PI/180);
	let circles = Math.sin(circleTurnDeg*Math.PI/180);
  if(circleTurnDeg>360){
    circleTurnDeg = 0;
    circlestate += 1;
    circlestate %= 2;
  }
  //頂点の回転計算
  //動いていない位置からの相対変化なのでstateの切り替えで変化前のオブジェクトの位置は記憶されていない
  for(let i=0;i<numVertices;i++){
    if(circlestate == 0){
    dotMovePos[i].x = dotOriginPos[i].x*circlec + dotOriginPos[i].z * (-circles);
    dotMovePos[i].y = dotOriginPos[i].y;
    dotMovePos[i].z = dotOriginPos[i].x*circles + dotOriginPos[i].z * (circlec);
    }else{
    dotMovePos[i].x = dotOriginPos[i].x;
    dotMovePos[i].y = dotOriginPos[i].y*circlec + dotOriginPos[i].z * (-circles);
    dotMovePos[i].z = dotOriginPos[i].y*circles + dotOriginPos[i].z * (circlec);
    }
    //dotMovePos[i].y = dotOriginPos[i].y;
    //dotMovePos[i].z = dotOriginPos[i].z;
    dotMovePos[i].z+= 5;
    //dotMovePos[i].z = 5;

    //outrunでも使った奥行きを付加したx,yの座標
    dotMovePos[i].x/= dotMovePos[i].z;
    dotMovePos[i].y/= dotMovePos[i].z;
    //拡大
    dotMovePos[i].x *= 450;
    dotMovePos[i].y *= 450;
    //移動
    dotMovePos[i].x += 500;
    dotMovePos[i].y += 500;

    //this.tempDotMovePosX[i] = this.dotMovePos[i].x  + moveX;
    //this.tempDotMovePosY[i] = this.dotMovePos[i].y  + moveY;
    //this.tempDotMovePosZ[i] = this.dotMovePos[i].z  + moveZ;
  }
  for(let i=0;i<numVertices;i++){
    con.fillStyle="blue";
    con.fillRect(dotMovePos[i].x,dotMovePos[i].y,10,10);
  }
  
  cubes[0].turnupdate(playermoveX,playermoveY,playermoveZ);
  let cube0Collision = false;
  for(let i=0;i<cubes.length;i++){
    cube0Collision = cubes[0].AABBcollision(cubes[i]);
    if(cube0Collision== true){
      console.log("collision")
       break;
    }
  }
  
  if(cube0Collision == false){
  cubes[0].move(playermoveX,playermoveY,playermoveZ);
  }

  playermoveX = 0;
  playermoveY = 0;
  playermoveZ = 0;
  cubes[1].turnupdate(0,0,0); 
  cubes[2].turnupdate(0,0,0); 
  draw(cubes);
}

function draw(cubes){
  let Polygones = []
  let tempZposition = -99999;
  let paintcounter = 0;
  //前面
  cubes.forEach(cube=>{
  Polygones.push(new Polygon(cube.dotMovePos[0],cube.dotMovePos[1],cube.dotMovePos[2],cube.dotMovePos[3],"rgb(0,0,255)"));
  //後面
  Polygones.push(new Polygon(cube.dotMovePos[4],cube.dotMovePos[5],cube.dotMovePos[6],cube.dotMovePos[7],"rgb(0,255,255)"));
  //左側面
  Polygones.push(new Polygon(cube.dotMovePos[4],cube.dotMovePos[5],cube.dotMovePos[1],cube.dotMovePos[0],"rgb(255,0,255)"));
  //上面
  Polygones.push(new Polygon(cube.dotMovePos[3],cube.dotMovePos[7],cube.dotMovePos[4],cube.dotMovePos[0],"rgb(255,255,0)"));
  //右側面
  Polygones.push(new Polygon(cube.dotMovePos[3],cube.dotMovePos[2],cube.dotMovePos[6],cube.dotMovePos[7],"rgb(160,200,255)"));
  //下面
  Polygones.push(new Polygon(cube.dotMovePos[1],cube.dotMovePos[5],cube.dotMovePos[6],cube.dotMovePos[2],"rgb(255,255,255)"));
  });
  while(true){
    for(let i=0;i<Polygones.length;i++){
      if(!(Polygones[i].isdraw) && Polygones[i].ZPosition>=tempZposition){
        tempZposition = Polygones[i].ZPosition;
      }
    }
    for(let i=0;i<Polygones.length;i++){
      if(!(Polygones[i].isdraw) && Polygones[i].ZPosition>=tempZposition){
        Polygones[i].isdraw = true;
        Polygones[i].draw(); 
        paintcounter += 1;
        tempZposition = -99999;
          break;
      }
    }
    if(paintcounter>=Polygones.length){
      break;
    }
  }
}
  
document.addEventListener('keydown',e => {
  switch(e.key){
    case 'ArrowLeft':
      playermoveX -= 10;
      break;
    case 'ArrowRight':
      playermoveX += 10;
      break;
    case 'ArrowUp':
      playermoveY -= 10;
      break;
    case 'ArrowDown':
      playermoveY += 10;
      break;
    case 'u':
      playermoveZ += 1;
      break;   
    case 'd':
      playermoveZ -= 1;
      break;
  }
});