export function maxCul(t,i){
	let tmpMax = t[0][i]
    if(t[1][i]>tmpMax)tmpMax = t[1][i];
    if(t[2][i]>tmpMax)tmpMax = t[2][i];
    return tmpMax;
}
export function minCul(t,i){
	let tmpMin = t[0][i]
    if(t[1][i]<tmpMin)tmpMin = t[1][i];
    if(t[2][i]<tmpMin)tmpMin = t[2][i];
    return tmpMin;
}
export function maxXCul(t){
	let tmpMax = t[0][0]
    if(t[1][0]>tmpMax)tmpMax = t[1][0];
    if(t[2][0]>tmpMax)tmpMax = t[2][0];
    return tmpMax;
}
export function minXCul(t){
	let tmpMin = t[0][0]
    if(t[1][0]<tmpMin)tmpMin = t[1][0];
    if(t[2][0]<tmpMin)tmpMin = t[2][0];
    return tmpMin;
}
export function maxXPosCul(pos1,pos2,pos3){
	let tmpMax = pos1[0];
    if(pos2[0]>tmpMax)tmpMax = pos2[0];
    if(pos3[0]>tmpMax)tmpMax = pos3[0];
    return tmpMax;
}
export function minXPosCul(pos1,pos2,pos3){
	let tmpMin = pos1[0];
    if(pos2[0]<tmpMin)tmpMin = pos2[0];
    if(pos3[0]<tmpMin)tmpMin = pos3[0];
    return tmpMin;
}
export function maxYCul(t){
	let tmpMax = t[0][1]
    if(t[1][1]>tmpMax)tmpMax = t[1][1];
    if(t[2][1]>tmpMax)tmpMax = t[2][1];
    return tmpMax;
}
export function minYCul(t){
	let tmpMin = t[0][1]
    if(t[1][1]<tmpMin)tmpMin = t[1][1];
    if(t[2][1]<tmpMin)tmpMin = t[2][1];
    return tmpMin;
}
export function maxYPosCul(pos1,pos2,pos3){
	let tmpMax = pos1[1];
    if(pos2[1]>tmpMax)tmpMax = pos2[1];
    if(pos3[1]>tmpMax)tmpMax = pos3[1];
    return tmpMax;
}
export function minYPosCul(pos1,pos2,pos3){
	let tmpMin = pos1[1];
    if(pos2[1]<tmpMin)tmpMin = pos2[1];
    if(pos3[1]<tmpMin)tmpMin = pos3[1];
    return tmpMin;
}
export function maxZCul(t){
	let tmpMax = t[0][2]
    if(t[1][2]>tmpMax)tmpMax = t[1][2];
    if(t[2][2]>tmpMax)tmpMax = t[2][2];
    return tmpMax;
}
export function minZCul(t){
	let tmpMin = t[0][2]
    if(t[1][2]<tmpMin)tmpMin = t[1][2];
    if(t[2][2]<tmpMin)tmpMin = t[2][2];
    return tmpMin;
}
export function maxZPosCul(pos1,pos2,pos3){
	let tmpMax = pos1[2];
    if(pos2[2]>tmpMax)tmpMax = pos2[2];
    if(pos3[2]>tmpMax)tmpMax = pos3[2];
    return tmpMax;
}
export function minZPosCul(pos1,pos2,pos3){
	let tmpMin = pos1[2];
    if(pos2[2]<tmpMin)tmpMin = pos2[2];
    if(pos3[2]<tmpMin)tmpMin = pos3[2];
    return tmpMin;
}
export function round(orgValue){
    return ((orgValue * 1000)|0) / 1000;
}
export function affineRound(orgValue){
    return ((orgValue * 10000)|0) / 10000;
}
export function mul1000Round(orgValue){
    return ((orgValue * 1000)|0);
}
export function round100(orgValue){
    return ((orgValue * 100)|0) / 100;
}
export function XRound(X){
    X[0] = ((X[0] * 1000)|0) / 1000;
}
export function XYRound(XY){
    XY[0] = ((XY[0] * 1000)|0) / 1000;
    XY[1] = ((XY[1] * 1000)|0) / 1000;
}

export function setVector2(x,y){
    return [x,y];
}
export function setVector3(x,y,z){
    return [x,y,z];
}
export function setVector4(x,y,z,w){
    return [x,y,z,w];
}
    
export function vec2Plus(Va,Vb){
    Va[0] += Vb[0];
    Va[1] += Vb[1];
}

export function vec2Minus(Va,Vb){
    let vx = Va[0] - Vb[0];
    let vy = Va[1] - Vb[1];
    return [vx,vy];
}
export function vec2OffsetMulAfterMinus(Va,Vb,offset){
    Va[0] -= (offset * Vb[0]);
    Va[1] -= (offset * Vb[1]);
}
export function vec2Mul(Va,Vb){
    let vx = Va[0] * Vb[0];
    let vy = Va[1] * Vb[1];
    return [vx,vy];
}
export function vec2Div(Va,Vb){
    let vx = Va[0] / Vb[0];
    let vy = Va[1] / Vb[1];
    return [vx,vy];
}

export function vecMul(Va,Vb){
    let vx = Va[0] * Vb[0];
    let vy = Va[1] * Vb[1];
    let vz = Va[2] * Vb[2];
    return [vx,vy,vz];
}
export function vecDiv(Va,Vb){
    let vx = Va[0] / Vb[0];
    let vy = Va[1] / Vb[1];
    let vz = Va[2] / Vb[2];
    return [vx,vy,vz];
}
export function vecPlus(Va,Vb){
    Va[0] += Vb[0];
    Va[1] += Vb[1];
    Va[2] += Vb[2];
}
export function vecMinus(Va,Vb){
    let vx = Va[0] - Vb[0];
    let vy = Va[1] - Vb[1];
    let vz = Va[2] - Vb[2];
    return [vx,vy,vz];
}
//crossZ用
export function vec3CrossZMinus(Va,Vb){
    let vx = Va[0] - Vb[0];
    let vy = Va[1] - Vb[1];
    return [vx,vy];
}
export function vec3notYMinus(Va,Vb){
    let vx = Va[0] - Vb[0];
    let vz = Va[2] - Vb[2];
    return [vx,vz];
}
export function vec2NoYVec3Minus(Vec2,Vec3){
    let vx = Vec2[0] - Vec3[0];
    let vz = Vec2[1] - Vec3[2];
    return [vx,vz];
}
export function vec3NoYVec2Minus(Vec3,Vec2){
    let vx = Vec3[0] - Vec2[0];
    let vz = Vec3[2] - Vec2[1];
    return [vx,vz];
}
export function culVecCross(Va,Vb){
    let crossx = Va[1] * Vb[2] - Va[2] * Vb[1];
    let crossy = Va[2] * Vb[0] - Va[0] * Vb[2];
    let crossz = Va[0] * Vb[1] - Va[1] * Vb[0];
    return [crossx,crossy,crossz];
}
    
export function culVecCrossZ(Va,Vb){
    return Va[0] * Vb[1] - Va[1] * Vb[0];
}
export function culVecDot(Va,Vb){
    return Va[0] * Vb[0] + Va[1] * Vb[1] + Va[2] * Vb[2];
    }

function fx(x,param){
    return x * x - param;
}
//x*xを微分したやつ
function dfx(x){
    return x*2;
}
export function NewtonMethod(x,param){
const TOLERANCE =  0.00001
let  beforeX = x;
/* Newton's Method. */
while(true){
    let nextX = beforeX - fx(beforeX,param)/dfx(beforeX);
    let nextBeforeX = nextX - beforeX;
        if (0 <= nextBeforeX && nextBeforeX < TOLERANCE) {
            return nextX;
        }else{
            beforeX = nextX;
        } 
    }
}
export function cul3dVecLength(vector3){
    let distance = vector3[0] * vector3[0] + vector3[1] * vector3[1] + vector3[2] * vector3[2];
    //２乗計算は必ず＋になる。
    //let absDistance = (distance)>0 ? (distance) : -(distance);
    let length = NewtonMethod(1,distance);
    return length;
}
 export function culVecNormalize(vector3){
    let distance = vector3[0] * vector3[0] + vector3[1] * vector3[1] + vector3[2] * vector3[2];
    let invLength = 1/NewtonMethod(1,distance);
    vector3[0] = vector3[0] * invLength;
    vector3[1] = vector3[1] * invLength;
    vector3[2] = vector3[2] * invLength;
}