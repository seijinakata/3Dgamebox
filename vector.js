export function round(orgValue){
    let newFloorValue = Math.floor(orgValue * 1000) / 1000;
    return newFloorValue;
}

export function roundVector2(vector2){
    round(vector2[0]);
    round(vector2[1]);
}

export function setVector2(x,y){
    let vector2 = [x,y];
    return vector2;
}
export function vec2Plus(Va,Vb){
    let vx = Va[0] + Vb[0];
    let vy = Va[1] + Vb[1];
    let vector2 = setVector2(vx,vy);
    return vector2;
}
export function vec2Minus(Va,Vb){
    let vx = Va[0] - Vb[0];
    let vy = Va[1] - Vb[1];
    let vector2 = setVector2(vx,vy);
    return vector2;
}
export function vec2Mul(Va,Vb){
    let vx = Va[0] * Vb[0];
    let vy = Va[1] * Vb[1];
    let vector2 = setVector2(vx,vy);
    return vector2;
}
export function vec2Div(Va,Vb){
    let vx = Va[0] / Vb[0];
    let vy = Va[1] / Vb[1];
    let vector2 = setVector2(vx,vy);
    return vector2;
}
export function setVector3(x,y,z){
    let vector3 = [x,y,z];
    return vector3;
    }
export function vecMul(Va,Vb){
    let vx = Va[0] * Vb[0];
    let vy = Va[1] * Vb[1];
    let vz = Va[2] * Vb[2];
    let vector3 = setVector3(vx,vy,vz);
    return vector3
    }
export function vecDiv(Va,Vb){
    let vx = Va[0] / Vb[0];
    let vy = Va[1] / Vb[1];
    let vz = Va[2] / Vb[2];
    let vector3 = setVector3(vx,vy,vz);
    return vector3;
    }
export function vecPlus(Va,Vb){
    let vx = Va[0] + Vb[0];
    let vy = Va[1] + Vb[1];
    let vz = Va[2] + Vb[2];
    let vector3 = setVector3(vx,vy,vz);
    return vector3;
    }
export function vecMinus(Va,Vb){
    let vx = Va[0] - Vb[0];
    let vy = Va[1] - Vb[1];
    let vz = Va[2] - Vb[2];
    let vector3 = setVector3(vx,vy,vz);
    return vector3;
    }
  
export function culVecCross(Va,Vb){
    let crossx = Va[1] * Vb[2] - Va[2] * Vb[1];
    let crossy = Va[2] * Vb[0] - Va[0] * Vb[2];
    let crossz = Va[0] * Vb[1] - Va[1] * Vb[0];
    let crossVector3 = setVector3(crossx,crossy,crossz);
    return crossVector3;
    }
    
export function culVecCrossZ(Va,Vb){
    return Va[0] * Vb[1] - Va[1] * Vb[0];
    }
export function culVecDot(Va,Vb){
    return Va[0] * Vb[0] + Va[1] * Vb[1] + Va[2] * Vb[2];
    }
  /*
export   function culVecCross(ver1,ver2,ver3){
    let N_x = (ver1[1]-ver2[1])*(ver2[2]-ver1[2])-(ver1[2]-ver2[2])*(ver3[1]-ver2[1]);
    let N_y = (ver1[2]-ver2[2])*(ver3[0]-ver2[0])-(ver1[0]-ver2[0])*(ver3[2]-ver2[2]);
    let N_z = (ver1[0]-ver2[0])*(ver3[1]-ver2[1])-(ver1[1]-ver2[1])*(ver3[0]-ver2[0]);
    let length = Math.sqrt(N_x * N_x + N_y * N_y + N_z * N_z);
    N_x /= length;
    N_y /= length;
    N_z /= length;
    return N_x,N_y,N_z;
  }
  */
 export function culVecNormalize(vector3){
    let length = Math.sqrt(vector3[0] * vector3[0] + vector3[1] * vector3[1] + vector3[2] * vector3[2]);
    let normalizeVector3x =  vector3[0] /= length;
    let normalizeVector3y =  vector3[1] /= length;
    let normalizeVector3z =  vector3[2] /= length;
    let normalizeVector3 = setVector3(normalizeVector3x,normalizeVector3y,normalizeVector3z);
    return normalizeVector3;
    }