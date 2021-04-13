const SCREEN_SIZE_W = 1000;
const SCREEN_SIZE_H = 1000;

let can = document.getElementById("can");
let con = can.getContext("2d");

can.width = SCREEN_SIZE_W;
can.height = SCREEN_SIZE_H;

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

let deg = 0;
const num = 8;
let state = 0;

const dotOriginPos = [];

//すべて距離の長さ1で統一後で計算後拡大する
dotOriginPos.push(new POS(-1,1,-1));
dotOriginPos.push(new POS(-1,-1,-1));
dotOriginPos.push(new POS(1,-1,-1));
dotOriginPos.push(new POS(1,1,-1));

dotOriginPos.push(new POS(-1,1,1));
dotOriginPos.push(new POS(-1,-1,1));
dotOriginPos.push(new POS(1,-1,1));
dotOriginPos.push(new POS(1,1,1));

//変化後格納
let dotMovePos = [];
for(let i=0;i<8;i++){
  dotMovePos.push(new POS(0,0,0));
}

setInterval(mainLoop,1000/60);

function mainLoop(){
  //画面を黒でクリア
	con.globalCompositeOperation = 'source-over';
	con.fillStyle="rgb(0,0,0)";
	con.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);
  
  let s = Math.cos(deg*Math.PI/180);
	let c = Math.sin(deg*Math.PI/180);
  deg++;
  if(deg>360){
    deg = 0;
    state += 1;
    state %= 2;
  }
  //8つの頂点の回転計算
  //動いていない位置からの相対変化なのでstateの切り替えで変化前のオブジェクトの位置は記憶されていない
  for(let i=0;i<num;i++){
    if(state == 0){
    dotMovePos[i].x = dotOriginPos[i].x*c + dotOriginPos[i].z * (-s);
    dotMovePos[i].y = dotOriginPos[i].y;
    dotMovePos[i].z = dotOriginPos[i].x*s + dotOriginPos[i].z * (c);
    }else{
    dotMovePos[i].x = dotOriginPos[i].x;
    dotMovePos[i].y = dotOriginPos[i].y*c + dotOriginPos[i].z * (-s);
    dotMovePos[i].z = dotOriginPos[i].y*s + dotOriginPos[i].z * (c);
    }
    //dotMovePos[i].y = dotOriginPos[i].y;
    //dotMovePos[i].z = dotOriginPos[i].z;
    dotMovePos[i].z+= 5;
    //dotMovePos[i].z = 5;


    //outrunでも使った奥行きを付加したx,yの座標
    dotMovePos[i].x/= dotMovePos[i].z;
    dotMovePos[i].y/= dotMovePos[i].z;
    //拡大
    dotMovePos[i].x *= 350
    dotMovePos[i].y *= 350
    //移動
    dotMovePos[i].x += 500
    dotMovePos[i].y += 500
  }

  let Polygones = []
  let tempZposition = -99999;
  let paintcounter = 0;

  //前面
  Polygones.push(new Polygon(dotMovePos[0],dotMovePos[1],dotMovePos[2],dotMovePos[3],"rgb(0,0,255)"));
  //後面
  Polygones.push(new Polygon(dotMovePos[4],dotMovePos[5],dotMovePos[6],dotMovePos[7],"rgb(0,255,255)"));
  //左側面
  Polygones.push(new Polygon(dotMovePos[4],dotMovePos[5],dotMovePos[1],dotMovePos[0],"rgb(255,0,255)"));
  //上面
  Polygones.push(new Polygon(dotMovePos[3],dotMovePos[7],dotMovePos[4],dotMovePos[0],"rgb(255,255,0)"));
  //右側面
  Polygones.push(new Polygon(dotMovePos[3],dotMovePos[2],dotMovePos[6],dotMovePos[7],"rgb(160,200,255)"));
  //下面
  Polygones.push(new Polygon(dotMovePos[1],dotMovePos[5],dotMovePos[6],dotMovePos[2],"rgb(255,255,255)"));
  while(true){
    for(let i=0;i<6;i++){
      if(!(Polygones[i].isdraw) && Polygones[i].ZPosition>=tempZposition){
        tempZposition = Polygones[i].ZPosition;
      }
    }
    for(let i=0;i<6;i++){
      if(!(Polygones[i].isdraw) && Polygones[i].ZPosition>=tempZposition){
        Polygones[i].isdraw = true;
        Polygones[i].draw(); 
        paintcounter += 1;
        tempZposition = -99999;
          break;
      }
    }
    if(paintcounter>=6){
      console.log(1);
      break;
    }
  }
}
