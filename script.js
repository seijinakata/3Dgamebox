import {M22, drawTriangle} from './texture.mjs';

const SCREEN_SIZE_W = 1000;
const SCREEN_SIZE_H = 1000;

let can = document.getElementById("can");
let con = can.getContext("2d");

can.width = SCREEN_SIZE_W;
can.height = SCREEN_SIZE_H;

var img = new Image();
img.src = 'https://cdn.glitch.com/6efb404c-071d-4250-b26b-2bdeba7c6ed2%2F0473fc3d55a213710b0b024a2fdc3a51.jpg?v=1620968464541';

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
  constructor(Pos1,Pos2,Pos3,Pos4,num,col){
    this.isdraw = false;
    this.moveVertices = [];
    this.moveVertices.push(Pos1);
    this.moveVertices.push(Pos2);
    this.moveVertices.push(Pos3);
    this.moveVertices.push(Pos4);
    this.color = col
    if(num == 4){
        this.ZPosition = (this.moveVertices[0].z + this.moveVertices[1].z + this.moveVertices[2].z + this.moveVertices[3].z)/num;
    }
    if(num == 3){
        this.ZPosition = (this.moveVertices[0].z + this.moveVertices[1].z + this.moveVertices[2].z)/num;
    }
  }
  draw(){
    drawTriangle(con, img, 
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
    drawTriangle(con, img, 
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
    //0,1,2,3の順
    this.dotOriginPos.push(new POS(-1,-1,-1));
    this.dotOriginPos.push(new POS(-1,1,-1));
    this.dotOriginPos.push(new POS(1,1,-1));
    this.dotOriginPos.push(new POS(1,-1,-1));

    this.dotOriginPos.push(new POS(-1,-1,1));
    this.dotOriginPos.push(new POS(-1,1,1));
    this.dotOriginPos.push(new POS(1,1,1));
    this.dotOriginPos.push(new POS(1,-1,1));
    
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
      this.dotMovePos[i].y = this.dotOriginPos[i].y*c + this.dotOriginPos[i].z * (s);
      this.dotMovePos[i].z = -this.dotOriginPos[i].y*s + this.dotOriginPos[i].z * (c);
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

class Shpere{
  
  constructor(x,y,z,extension,numCorners,turnDeg,turnState){
    //numVertices分入れる
    this.x = x;
    this.y = y;
    this.z = z;
    this.extension = extension;
    this.dotOriginPos = [];
    this.dotMovePos = [];
    this.numCorners = numCorners;
    this.turnDeg = turnDeg;
    this.turnState = turnState;
    
    let numRings = numCorners/2+1;
    
    this.numVertices = this.numCorners * numRings;
    
    let circleDeg = 360/numCorners;
    
    for(let j=0;j<numRings;j++){
      let r = Math.sin(circleDeg * j*Math.PI/180);
      let z = Math.cos(circleDeg * j*Math.PI/180);
      for(let i=0;i<this.numCorners;i++){
        let orginX = Math.sin(circleDeg * i*Math.PI/180) * r;
        let orginY = Math.cos(circleDeg * i*Math.PI/180) * r;
        let orginZ = z//1.0 - 2.0/(numRings-1)*j;//zを0.5刻みにする
        this.dotOriginPos.push(new POS(orginX,orginY,orginZ));
      }
    }
    for(let i=0;i<numRings*this.numCorners;i++){
      this.dotMovePos.push(new POS(0,0,0));
    }
  }
  
  turnupdate(moveX,moveY,moveZ){
    this.turnDeg++;     
    let circlec = Math.cos(this.turnDeg*Math.PI/180);
    let circles = Math.sin(this.turnDeg*Math.PI/180);
    if(this.turnDeg>360){
      this.turnDeg = 0;
      this.turnState += 1;
      this.turnState %= 2;
    }
    //頂点の回転計算
    //動いていない位置からの相対変化なのでstateの切り替えで変化前のオブジェクトの位置は記憶されていない
    for(let i=0;i<this.numVertices;i++){
      if(this.turnState == 0){
      this.dotMovePos[i].x = this.dotOriginPos[i].x*circlec + this.dotOriginPos[i].z * (-circles);
      this.dotMovePos[i].y = this.dotOriginPos[i].y;
      this.dotMovePos[i].z = this.dotOriginPos[i].x*circles + this.dotOriginPos[i].z * (circlec);
      }else{
      this.dotMovePos[i].x = this.dotOriginPos[i].x;
      this.dotMovePos[i].y = this.dotOriginPos[i].y*circlec + this.dotOriginPos[i].z * (-circles);
      this.dotMovePos[i].z = this.dotOriginPos[i].y*circles + this.dotOriginPos[i].z * (circlec);
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

      //this.tempDotMovePosX[i] = this.dotMovePos[i].x  + moveX;
      //this.tempDotMovePosY[i] = this.dotMovePos[i].y  + moveY;
      //this.tempDotMovePosZ[i] = this.dotMovePos[i].z  + moveZ;
    }
  }
}

setInterval(mainLoop,1000/60);

let cubes = [];
cubes.push(new Cube(500,150,5,350,0,8,0));
cubes.push(new Cube(150,150,7,250,0,8,0));
cubes.push(new Cube(700,700,3,250,0,8,0));

//頂点数は偶数で
let spheres = [];
spheres.push(new Shpere(400,500,5,350,12,0,0));
spheres.push(new Shpere(500,150,4,350,24,0,0));

function mainLoop(){
  //画面を黒でクリア
	con.globalCompositeOperation = 'source-over';
	con.fillStyle="rgb(0,0,0)";
	con.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);
  /*
  con.strokeStyle = "white";
  for(let i=0;i<numVertices;i++){
    let j = i+1;
    if(j % numCorners == 0)j -= numCorners;
      con.moveTo(dotMovePos[i].x,dotMovePos[i].y);
      con.lineTo(dotMovePos[j].x,dotMovePos[j].y);
      con.stroke();
    if(i<numVertices - numCorners){
      j = i + numCorners;
      con.moveTo(dotMovePos[i].x,dotMovePos[i].y);
      con.lineTo(dotMovePos[j].x,dotMovePos[j].y);
      con.stroke();
      
    }
  }*/

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
  spheres[0].turnupdate(0,0,0);
  spheres[1].turnupdate(0,0,0);
  draw(cubes,spheres);
}

function draw(cubes,spheres){
  
  let Polygones = []
  let tempZposition = -99999;
  let paintcounter = 0;
  
  //四角
  for(let num = 0;num<cubes.length;num++){
    let cube = cubes[num];
        //上面
    Polygones.push(new Polygon(cube.dotMovePos[7],cube.dotMovePos[4],cube.dotMovePos[0],cube.dotMovePos[3],4,"rgb(255,255,0)"));
    //前面
    Polygones.push(new Polygon(cube.dotMovePos[0],cube.dotMovePos[1],cube.dotMovePos[2],cube.dotMovePos[3],4,"rgb(0,0,255)"));
    //後面
    Polygones.push(new Polygon(cube.dotMovePos[4],cube.dotMovePos[5],cube.dotMovePos[6],cube.dotMovePos[7],4,"rgb(0,255,255)"));
    //左側面
    Polygones.push(new Polygon(cube.dotMovePos[4],cube.dotMovePos[5],cube.dotMovePos[1],cube.dotMovePos[0],4,"rgb(255,0,255)"));
    //右側面
    Polygones.push(new Polygon(cube.dotMovePos[7],cube.dotMovePos[6],cube.dotMovePos[2],cube.dotMovePos[3],4,"rgb(160,200,255)"));
    //下面
    Polygones.push(new Polygon(cube.dotMovePos[5],cube.dotMovePos[1],cube.dotMovePos[2],cube.dotMovePos[6],4,"rgb(255,255,255)"));
  }

  /*
  //球
  for(let num =0;num<spheres.length;num++){
    for(let i= 0;i<spheres[num].numCorners*spheres[num].numCorners/2;i++){
      let color = "blue"
      if(i%2 != 0){
        color = 'yellow'
      }
    let  j = i + spheres[num].numCorners;
    let p = i+spheres[num].numCorners+1; 
    if(p % spheres[num].numCorners == 0) p -= spheres[num].numCorners;
    let k = i + 1;
    if(k % spheres[num].numCorners == 0) k -= spheres[num].numCorners;
    Polygones.push(new Polygon(spheres[num].dotMovePos[i],spheres[num].dotMovePos[j],spheres[num].dotMovePos[p],spheres[num].dotMovePos[k],4,color));
    }
  }*/
  
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