//４行目は使わないので消去しました
//行列計算ループアンローリング
//演算結果をreturnsしてその結果をもう一回関数に入れると重たくなるみたい。
import {setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize,round} from './vector.js';
import {sinLut,cosLut} from './camera.js';
//一次元配列
export function matRound4X4(mat){
    mat[0] = round( mat[0]);
    mat[4] = round( mat[4]);
    mat[8] = round( mat[8]);
    //mat[12] = round( mat[12]);

    mat[1] = round( mat[1]);
    mat[5] = round( mat[5]);
    mat[9] = round( mat[9]);
    //mat[13] = round( mat[13]);

    mat[2] = round( mat[2]);
    mat[6] = round( mat[6]);
    mat[10] = round( mat[10]);
    //mat[14] = round( mat[14]);

    mat[3] = round( mat[3]);
    mat[7] = round( mat[7]);
    mat[11] = round( mat[11]);
    //mat[15] = round( mat[15]);
}

export function matIdentity(){
        let identityMatrix = 
        [
         1, 0, 0, 0,
         0, 1, 0, 0,
         0, 0, 1, 0];
         //0, 0, 0, 1];
    
    return identityMatrix;
    }
export function maketranslateMatrix(x,y,z){
    let translateMatrix = 
    [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z];
        //0, 0, 0, 1];

return translateMatrix;
}
export function makeScalingMatrix(x,y,z){
    let scalingMatrix = 
    [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0];
        //0, 0, 0, 1];

return scalingMatrix;
} 
export function mulMatTranslate(m,x,y,z){
        m[3] += m[0] * x + m[1] * y + m[2] * z;
        m[7] += m[4] * x + m[5] * y + m[6] * z;
        m[11] += m[8] * x + m[9] * y + m[10] * z;
    }
export function mulMatScaling(m,x,y,z){
        m[0] *= x;    m[1] *= y;    m[2] *= z;
        m[4] *= x;    m[5] *= y;    m[6] *= z;
        m[8] *= x;    m[9] *= y;    m[10] *= z;
    }
export function matPlus(m1,m2) {
    let tmp = matIdentity();

    tmp[0] = m1[0] + m2[0];
    tmp[1] = m1[1] + m2[1];
    tmp[2] = m1[2] + m2[2];
    tmp[3] = m1[3] + m2[3];

    tmp[4] = m1[4] + m2[4];
    tmp[5] = m1[5] + m2[5];
    tmp[6] = m1[6] + m2[6];
    tmp[7] = m1[7] + m2[7];

    tmp[8] = m1[8] + m2[8];
    tmp[9] = m1[9] + m2[9];
    tmp[10] = m1[10] + m2[10];
    tmp[11] = m1[11] + m2[11];

    //tmp[12] = m1[12] + m2[12];
    //tmp[13] = m1[13] + m2[13];
    //tmp[14] = m1[14] + m2[14];
    //tmp[15] = m1[15] + m2[15];

    return tmp;
}
export function matWaight(m,w) {
    let tmp = matIdentity();

    tmp[0] = m[0] * w;
    tmp[1] = m[1] * w;
    tmp[2] = m[2] * w;
    tmp[3] = m[3] * w;

    tmp[4] = m[4] * w;
    tmp[5] = m[5] * w;
    tmp[6] = m[6] * w;
    tmp[7] = m[7] * w;

    tmp[8] = m[8] * w;
    tmp[9] = m[9] * w;
    tmp[10] = m[10] * w;
    tmp[11] = m[11] * w;

    //tmp[12] = m[12] * w;
    //tmp[13] = m[13] * w;
    //tmp[14] = m[14] * w;
    //tmp[15] = m[15] * w;

    return tmp;
}
//４行目は0,0,0,1なので出力3,7,11は最後そのまま足す。
export function matMul(m1,m2) {
        let tmp = matIdentity();
    
        tmp[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8];// +m1[3] * m2[12];
        tmp[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8];// +m1[7] * m2[12];
        tmp[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8];// +m1[11] * m2[12];
        //tmp[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] +m1[15] * m2[12];
    
        tmp[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9];// +m1[3] * m2[13];
        tmp[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9];// +m1[7] * m2[13];
        tmp[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9];// +m1[11] * m2[13];
        //tmp[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] +m1[15] * m2[13];
    
        tmp[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10];// + m1[3] * m2[14];
        tmp[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10];// + m1[7] * m2[14];
        tmp[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10];// + m1[11] * m2[14];
        //tmp[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14];
    
        tmp[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3];// * m2[15];
        tmp[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7];// * m2[15];
        tmp[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11];// * m2[15];
        //tmp[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];
    
        return tmp;
    }
    //計算後新しく生成する
export function matVecMul(m,v){
    let tmp =  [0,0,0];
    tmp[0] = m[0]*v[0] + m[1]*v[1] + m[2]*v[2] + m[3];
    tmp[1] = m[4]*v[0] + m[5]*v[1] + m[6]*v[2] + m[7];
    tmp[2] = m[8]*v[0] + m[9]*v[1] + m[10]*v[2] + m[11];
    /*
    //projとの掛け算
    if (m[14] < 0) {//応用がきかないが、これでproj matと判断
        return tmp / (v[2] < 0 ? -v[2] : v[2]);
    }
    */
    //proj以外の掛け算
    return tmp;
}

//直接計算する
export function protMatVecMul(m,v){
        let x = m[0]*v[0] + m[1]*v[1] + m[2]*v[2] + m[3];
        let y = m[4]*v[0] + m[5]*v[1] + m[6]*v[2] + m[7];
        let z = m[8]*v[0] + m[9]*v[1] + m[10]*v[2] + m[11];
        v[0] = x;
        v[1] = y;
        v[2] = z;
        /*
        ///projとの掛け算
        if (m[14] < 0) {//応用がきかないが、これでproj matと判断
            return tmp / (v[2] < 0 ? -v[2] : v[2]);
        }*/
        //proj以外の掛け算
        //return tmp;
    }
export function matPers(z) {
        //float s = 1.0f / tan(angle * 0.5f);
        //float a = f / (-f + n);
        //float b = a * n;
        let Matrix = 
        [
         1/z, 0, 0, 0,
         0, 1/z, 0, 0,
         0, 0,   1, 0];
        // 0, 0,   0, 1];
    
    return Matrix;
    /*
    m[0] = 1/z;          m[1] = 0;        m[2] = 0;            m[3] = 0;
    m[4] = 0;            m[5] = 1/z;      m[6] = 0;            m[7] = 0;
    m[8] = 0;            m[9] = 0;        m[10] = 1;            m[11] = 0;
    m[12] = 0;            m[13] = 0;        m[14] = 0;            m[15] = 1;
    */
    }
export function matCamera(m,camPos,lookat,up) {
        //カメラのローカル軸座標を求める(正規直交ベクトル)
        let z = culVecNormalize(vecMinus(lookat,camPos));
        let x = culVecNormalize(culVecCross(up, z));
        let y = culVecCross(z, x);
        m[0] = x[0];    m[1] = x[1];    m[2] = x[2];    m[3] = x[0] * -camPos[0] + x[1] * -camPos[1] + x[2] * -camPos[2];
        m[4] = y[0];    m[5] = y[1];    m[6] = y[2];    m[7] = y[0] * -camPos[0] + y[1] * -camPos[1] + y[2] * -camPos[2];
        m[8] = z[0];    m[9] = z[1];    m[10] = z[2];    m[11] = z[0] * -camPos[0] + z[1] * -camPos[1] + z[2] * -camPos[2];
        //m[12] = 0;      m[13] = 0;      m[14] = 0;      m[15] = 1;
    }
export function mulMatRotateX(m,r) {
        let c = 0;
        let s = 0;
        if(r<0){
            r = 360 + r;
            c = cosLut[r];
            s = sinLut[r];        
        }else{
        c = cosLut[r];
        s = sinLut[r]; 
        }
        let tmp;
        //1行目
        tmp = m[1] * c + m[2] * s;
        m[2] = m[1] * -s + m[2] * c;
        m[1] = tmp;
        //2行目
        tmp = m[5] * c + m[6] * s;
        m[6] = m[5] * -s + m[6] * c;
        m[5] = tmp;
        //3行目
        tmp = m[9] * c + m[10] * s;
        m[10] = m[9] * -s + m[10] * c;
        m[9] = tmp;
    }
export function mulMatRotatePointX(m,r,x,y,z) {
    let c = 0;
    let s = 0;
    if(r<0){
        r = 360 + r;
        c = cosLut[r];
        s = sinLut[r];        
    }else{
    c = cosLut[r];
    s = sinLut[r]; 
    }
    let tmp;
    let subTmp;
    //1行目
    tmp = m[1] * c + m[2] * s;
    m[2] = m[1] * -s + m[2] * c;
    m[3] = m[3] * x;
    m[1] = tmp;
    //2行目
    tmp = m[5] * c + m[6] * s;
    subTmp = m[5] * -s + m[6] * c;
    m[7] = m[5] * (y-y*c+z*s) + m[6] * (z-y*s-z*c);
    m[6] = subTmp;
    m[5] = tmp;
    //3行目
    tmp = m[9] * c + m[10] * s;
    subTmp = m[9] * -s + m[10] * c;
    m[11] = m[9] * (y-y*c+z*s) + m[10] * (z-y*s-z*c);
    m[10] = subTmp;
    m[9] = tmp;
}
export function mulMatRotateY(m,r) {
        let c = 0;
        let s = 0;
        if(r<0){
            r = 360 + r;
            c = cosLut[r];
            s = sinLut[r];        
        }else{
        c = cosLut[r];
        s = sinLut[r]; 
        }
        let tmp;
        //1行目
        tmp = m[0] * c - m[2] * s;
        m[2] = m[0] * s + m[2] * c;
        m[0] = tmp;
        //2行目
        tmp = m[4] * c - m[6] * s;
        m[6] = m[4] * s + m[6] * c;
        m[4] = tmp;
        //3行目
        tmp = m[8] * c - m[10] * s;
        m[10] = m[8] * s + m[10] * c;
        m[8] = tmp;
    }
export function mulMatRotatePointY(m,r,x,y,z) {
    let c = 0;
    let s = 0;
    if(r<0){
        r = 360 + r;
        c = cosLut[r];
        s = sinLut[r];        
    }else{
    c = cosLut[r];
    s = sinLut[r]; 
    }
    let tmp;
    let subTmp;
    //1行目
    tmp = m[0] * c - m[2] * s;
    subTmp = m[0] * s + m[2] * c;
    m[3] = m[0] * (x-x*c-z*s) + m[2] * (z+x*s-z*c);
    m[0] = tmp;
    m[2] = subTmp
    //2行目
    tmp = m[4] * c - m[6] * s;
    subTmp = m[4] * s + m[6] * c;
    m[7] = m[7] * y;
    m[6] = subTmp;
    m[4] = tmp;
    //3行目
    tmp = m[8] * c - m[10] * s;
    subTmp= m[8] * s + m[10] * c;
    m[11] = m[8] * (x-x*c-z*s) + m[10] * (z+x*s-z*c);
    m[8] = tmp;
    m[10] = subTmp;
}
export function mulMatRotateZ(m,r) {
        let c = 0;
        let s = 0;
        if(r<0){
            r = 360 + r;
            c = cosLut[r];
            s = sinLut[r];        
        }else{
        c = cosLut[r];
        s = sinLut[r]; 
        }
        let tmp;
        //1行目
        tmp = m[0] * c + m[1] * s;
        m[1] = m[0] * -s + m[1] * c;
        m[0] = tmp;
        //2行目
        tmp = m[4] * c + m[5] * s;
        m[5] = m[4] * -s + m[5] * c;
        m[4] = tmp;
        //3行目
        tmp = m[8] * c + m[9] * s;
        m[9] = m[8] * -s + m[9] * c;
        m[8] = tmp;
    }
export function mulMatRotatePointZ(m,r,x,y,z) {
    let c = 0;
    let s = 0;
    if(r<0){
        r = 360 + r;
        c = cosLut[r];
        s = sinLut[r];        
    }else{
    c = cosLut[r];
    s = sinLut[r]; 
    }
    let tmp;
    let subTmp;
    //1行目
    tmp = m[0] * c + m[1] * s;
    subTmp = m[0] * -s + m[1] * c;
    m[3] = m[0] * (x-x*c+y*s) + m[1] * (y-x*s-y*c);
    m[0] = tmp;
    m[1] = subTmp;
    //2行目
    tmp = m[4] * c + m[5] * s;
    subTmp = m[4] * -s + m[5] * c;
    m[7] = m[4] * (x-x*c+y*s) + m[5] * (y-x*s-y*c);
    m[4] = tmp;
    m[5] = subTmp;
    //3行目
    tmp = m[8] * c + m[9] * s;
    subTmp = m[8] * -s + m[9] * c;
    m[11] = m[11] * z;
    m[8] = tmp;
    m[9] = subTmp;
}

/*!
 * 4x4行列の行列式の計算
 *  | m[0]  m[1]  m[2]  m[3]  |
 *  | m[4]  m[5]  m[6]  m[7]  |
 *  | m[8]  m[9]  m[10] m[11] |
 *  | m[12] m[13] m[14] m[15] |
 * @param[in] m 元の行列
 * @return 行列式の値
 */
function CalDetMat4x4(m)
{
    return m[0]*m[5]*m[10]
          +m[1]*m[6]*m[8]
          +m[2]*m[4]*m[9]
          -m[0]*m[6]*m[9]
          -m[1]*m[4]*m[10]
          -m[2]*m[5]*m[8];
}
/*
function CalDetMat4x4(m)
{
    return m[0]*m[5]*m[10]*m[15]+m[0]*m[6]*m[11]*m[13]+m[0]*m[7]*m[9]*m[14]
          +m[1]*m[4]*m[11]*m[14]+m[1]*m[6]*m[8]*m[15]+m[1]*m[7]*m[10]*m[12]
          +m[2]*m[4]*m[9]*m[15]+m[2]*m[5]*m[11]*m[12]+m[2]*m[7]*m[8]*m[13]
          +m[3]*m[4]*m[10]*m[13]+m[3]*m[5]*m[8]*m[14]+m[3]*m[6]*m[9]*m[12]
          -m[0]*m[5]*m[11]*m[14]-m[0]*m[6]*m[9]*m[15]-m[0]*m[7]*m[10]*m[13]
          -m[1]*m[4]*m[10]*m[15]-m[1]*m[6]*m[11]*m[12]-m[1]*m[7]*m[8]*m[14]
          -m[2]*m[4]*m[11]*m[13]-m[2]*m[5]*m[8]*m[15]-m[2]*m[7]*m[9]*m[12]
          -m[3]*m[4]*m[9]*m[14]-m[3]*m[5]*m[10]*m[12]-m[3]*m[6]*m[8]*m[13];
}*/
/*!
 * 4x4行列の行列式の計算
 *  | m[0]  m[1]  m[2]  m[3]  |
 *  | m[4]  m[5]  m[6]  m[7]  |
 *  | m[8]  m[9]  m[10] m[11] |
 *  | m[12] m[13] m[14] m[15] |
 * @param[in] m 元の行列
 * @param[out] invm 逆行列
 * @return 逆行列の存在
 */
export function CalInvMat4x4(m,invm)
{
    let det = CalDetMat4x4(m);
    if(det == 0){
        return false;
    }
    else{
        let  inv_det = 1.0/det;
 
        invm[0]  = inv_det*(m[5]*m[10]-m[6]*m[9]);
        invm[1]  = inv_det*(m[2]*m[9]-m[1]*m[10]);
        invm[2]  = inv_det*(m[1]*m[6]-m[2]*m[5]);
        invm[3]  = inv_det*(m[1]*m[7]*m[10]+m[2]*m[5]*m[11]+m[3]*m[6]*m[9]-m[1]*m[6]*m[11]-m[2]*m[7]*m[9]-m[3]*m[5]*m[10]);
 
        invm[4]  = inv_det*(m[6]*m[8]-m[4]*m[10]);
        invm[5]  = inv_det*(m[0]*m[10]-m[2]*m[8]);
        invm[6]  = inv_det*(m[2]*m[4]-m[0]*m[6]);
        invm[7]  = inv_det*(m[0]*m[6]*m[11]+m[2]*m[7]*m[8]+m[3]*m[4]*m[10]-m[0]*m[7]*m[10]-m[2]*m[4]*m[11]-m[3]*m[6]*m[8]);
 
        invm[8]  = inv_det*(m[4]*m[9]-m[5]*m[8]);
        invm[9]  = inv_det*(m[1]*m[8]-m[0]*m[9]);
        invm[10]  = inv_det*(m[0]*m[5]-m[1]*m[4]);
        invm[11]  = inv_det*(m[0]*m[7]*m[9]+m[1]*m[4]*m[11]+m[3]*m[5]*m[8]-m[0]*m[5]*m[11]-m[1]*m[7]*m[8]-m[3]*m[4]*m[9]);

        return true;
    }
}
/*
export function CalInvMat4x4(m,invm)
{
    let det = CalDetMat4x4(m);
    if(det == 0){
        return false;
    }
    else{
        let  inv_det = 1.0/det;
 
        invm[0]  = inv_det*(m[5]*m[10]*m[15]+m[6]*m[11]*m[13]+m[7]*m[9]*m[14]-m[5]*m[11]*m[14]-m[6]*m[9]*m[15]-m[7]*m[10]*m[13]);
        invm[1]  = inv_det*(m[1]*m[11]*m[14]+m[2]*m[9]*m[15]+m[3]*m[10]*m[13]-m[1]*m[10]*m[15]-m[2]*m[11]*m[13]-m[3]*m[9]*m[14]);
        invm[2]  = inv_det*(m[1]*m[6]*m[15]+m[2]*m[7]*m[13]+m[3]*m[5]*m[14]-m[1]*m[7]*m[14]-m[2]*m[5]*m[15]-m[3]*m[6]*m[13]);
        invm[3]  = inv_det*(m[1]*m[7]*m[10]+m[2]*m[5]*m[11]+m[3]*m[6]*m[9]-m[1]*m[6]*m[11]-m[2]*m[7]*m[9]-m[3]*m[5]*m[10]);
 
        invm[4]  = inv_det*(m[4]*m[11]*m[14]+m[6]*m[8]*m[15]+m[7]*m[10]*m[12]-m[4]*m[10]*m[15]-m[6]*m[11]*m[12]-m[7]*m[8]*m[14]);
        invm[5]  = inv_det*(m[0]*m[10]*m[15]+m[2]*m[11]*m[12]+m[3]*m[8]*m[14]-m[0]*m[11]*m[14]-m[2]*m[8]*m[15]-m[3]*m[10]*m[12]);
        invm[6]  = inv_det*(m[0]*m[7]*m[14]+m[2]*m[4]*m[15]+m[3]*m[6]*m[12]-m[0]*m[6]*m[15]-m[2]*m[7]*m[12]-m[3]*m[4]*m[14]);
        invm[7]  = inv_det*(m[0]*m[6]*m[11]+m[2]*m[7]*m[8]+m[3]*m[4]*m[10]-m[0]*m[7]*m[10]-m[2]*m[4]*m[11]-m[3]*m[6]*m[8]);
 
        invm[8]  = inv_det*(m[4]*m[9]*m[15]+m[5]*m[11]*m[12]+m[7]*m[8]*m[13]-m[4]*m[11]*m[13]-m[5]*m[8]*m[15]-m[7]*m[9]*m[12]);
        invm[9]  = inv_det*(m[0]*m[11]*m[13]+m[1]*m[8]*m[15]+m[3]*m[9]*m[12]-m[0]*m[9]*m[15]-m[1]*m[11]*m[12]-m[3]*m[8]*m[13]);
        invm[10]  = inv_det*(m[0]*m[5]*m[15]+m[1]*m[7]*m[12]+m[3]*m[4]*m[13]-m[0]*m[7]*m[13]-m[1]*m[4]*m[15]-m[3]*m[5]*m[12]);
        invm[11]  = inv_det*(m[0]*m[7]*m[9]+m[1]*m[4]*m[11]+m[3]*m[5]*m[8]-m[0]*m[5]*m[11]-m[1]*m[7]*m[8]-m[3]*m[4]*m[9]);
 
        invm[12]  = inv_det*(m[4]*m[10]*m[13]+m[5]*m[8]*m[14]+m[6]*m[9]*m[12]-m[4]*m[9]*m[14]-m[5]*m[10]*m[12]-m[6]*m[8]*m[13]);
        invm[13]  = inv_det*(m[0]*m[9]*m[14]+m[1]*m[10]*m[12]+m[2]*m[8]*m[13]-m[0]*m[10]*m[13]-m[1]*m[8]*m[14]-m[2]*m[9]*m[12]);
        invm[14]  = inv_det*(m[0]*m[6]*m[13]+m[1]*m[4]*m[14]+m[2]*m[5]*m[12]-m[0]*m[5]*m[14]-m[1]*m[6]*m[12]-m[2]*m[4]*m[13]);
        invm[15]  = inv_det*(m[0]*m[5]*m[10]+m[1]*m[6]*m[8]+m[2]*m[4]*m[9]-m[0]*m[6]*m[9]-m[1]*m[4]*m[10]-m[2]*m[5]*m[8]);
 
        return true;
    }
}*/
export function getInvert2(_11,_12,_21,_22){
    var out = [[1,0],
				[0,1]]
    //逆行列の公式 ad - bc の部分
    var det = _11 * _22 - _12 * _21;
    if (det > -0.0001 && det < 0.0001)
      return null;

    //逆行列の公式 det=(ad - bc) で各値(a,b,c,d)を割る
    out[0][0] = _22 / det;  // a = d / det
    out[1][1] = _11 / det;  // d = a / det

    out[0][1] = -_12 / det; // b = -b / det
    out[1][0]= -_21 / det; // c = -c / det

    return out;
  }
export function getInverseMatrix(matrix){

    let a  = [];
    for (const line of matrix) {
        a.push([...line]);
    }
    let inv_a = matIdentity(); //ここに逆行列が入る(単位行列)
    let buf; //一時的なデータを蓄える
    let i,j,k; //カウンタ
    let n=4;  //配列の次数

   //掃き出し法
   for(i=0;i<n;i++){
    buf=1/a[i][i];
        for(j=0;j<n;j++){
            a[i][j]*=buf;
            inv_a[i][j]*=buf;
        }
    for(j=0;j<n;j++){
        if(i!=j){
            buf=a[j][i];
            for(k=0;k<n;k++){
                a[j][k]-=a[i][k]*buf;
                inv_a[j][k]-=inv_a[i][k]*buf;
            }
        }
    }
   }
    return inv_a;
}
/*//二次元配列
export function matRound4X4(mat){
    mat[0][0] = round( mat[0][0]);
    mat[1][0] = round( mat[1][0]);
    mat[2][0] = round( mat[2][0]);
    mat[3][0] = round( mat[3][0]);

    mat[0][1] = round( mat[0][1]);
    mat[1][1] = round( mat[1][1]);
    mat[2][1] = round( mat[2][1]);
    mat[3][1] = round( mat[3][1]);

    mat[0][2] = round( mat[0][2]);
    mat[1][2] = round( mat[1][2]);
    mat[2][2] = round( mat[2][2]);
    mat[3][2] = round( mat[3][2]);

    mat[0][3] = round( mat[0][3]);
    mat[1][3] = round( mat[1][3]);
    mat[2][3] = round( mat[2][3]);
    mat[3][3] = round( mat[3][3]);
}

export function getInvert2(_11,_12,_21,_22){
    var out = [[1,0],
				[0,1]]
    //逆行列の公式 ad - bc の部分
    var det = _11 * _22 - _12 * _21;
    if (det > -0.0001 && det < 0.0001)
      return null;

    //逆行列の公式 det=(ad - bc) で各値(a,b,c,d)を割る
    out[0][0] = _22 / det;  // a = d / det
    out[1][1] = _11 / det;  // d = a / det

    out[0][1] = -_12 / det; // b = -b / det
    out[1][0]= -_21 / det; // c = -c / det

    return out;
  }
export function matIdentity(){
        let identityMatrix = 
        [
        [ 1, 0, 0, 0],
        [ 0, 1, 0, 0],
        [ 0, 0, 1, 0],
        [ 0, 0, 0, 1]
    ];
    
    return identityMatrix;
    }
  
export function mulMatTranslate(m,x,y,z){
        m[0][3] += m[0][0] * x + m[0][1] * y + m[0][2] * z;
        m[1][3] += m[1][0] * x + m[1][1] * y + m[1][2] * z;
        m[2][3] += m[2][0] * x + m[2][1] * y + m[2][2] * z;
    }
export function mulMatScaling(m,x,y,z){
        m[0][0] *= x;    m[0][1] *= y;    m[0][2] *= z;
        m[1][0] *= x;    m[1][1] *= y;    m[1][2] *= z;
        m[2][0] *= x;    m[2][1] *= y;    m[2][2] *= z;
    }
export function matMul(m1,m2) {
        let tmp = matIdentity();
    
        tmp[0][0] = m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2] * w[0] +m1[0][3] * m2[3][0];
        tmp[1][0] = m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2] * w[0] +m1[1][3] * m2[3][0];
        tmp[2][0] = m1[2][0] * m2[0][0] + m1[2][1] * m2[1][0] + m1[2][2] * w[0] +m1[2][3] * m2[3][0];
        tmp[3][0] = m1[3][0] * m2[0][0] + m1[3][1] * m2[1][0] + m1[3][2] * w[0] +m1[3][3] * m2[3][0];
    
        tmp[0][1] = m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2] * w[1] +m1[0][3] * m2[3][1];
        tmp[1][1] = m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2] * w[1] +m1[1][3] * m2[3][1];
        tmp[2][1] = m1[2][0] * m2[0][1] + m1[2][1] * m2[1][1] + m1[2][2] * w[1] +m1[2][3] * m2[3][1];
        tmp[3][1] = m1[3][0] * m2[0][1] + m1[3][1] * m2[1][1] + m1[3][2] * w[1] +m1[3][3] * m2[3][1];
    
        tmp[0][2] = m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2] * w[2] + m1[0][3] * m2[3][2];
        tmp[1][2] = m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2] * w[2] + m1[1][3] * m2[3][2];
        tmp[2][2] = m1[2][0] * m2[0][2] + m1[2][1] * m2[1][2] + m1[2][2] * w[2] + m1[2][3] * m2[3][2];
        tmp[3][2] = m1[3][0] * m2[0][2] + m1[3][1] * m2[1][2] + m1[3][2] * w[2] + m1[3][3] * m2[3][2];
    
        tmp[0][3] = m1[0][0] * m2[0][3] + m1[0][1] * m2[1][3] + m1[0][2] * w[3] + m1[0][3] * m2[3][3];
        tmp[1][3] = m1[1][0] * m2[0][3] + m1[1][1] * m2[1][3] + m1[1][2] * w[3] + m1[1][3] * m2[3][3];
        tmp[2][3] = m1[2][0] * m2[0][3] + m1[2][1] * m2[1][3] + m1[2][2] * w[3] + m1[2][3] * m2[3][3];
        tmp[3][3] = m1[3][0] * m2[0][3] + m1[3][1] * m2[1][3] + m1[3][2] * w[3] + m1[3][3] * m2[3][3];
    
        return tmp;
    }
    //計算後新しく生成する
export function matVecMul(m,v){
    let tmp =  [0,0,0];
    tmp[0] = m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2] + m[0][3];
    tmp[1] = m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2] + m[1][3];
    tmp[2] = m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2] + m[2][3];
    /*
    //projとの掛け算
    if (m[3][2] < 0) {//応用がきかないが、これでproj matと判断
        return tmp / (v[2] < 0 ? -v[2] : v[2]);
    }
    */
   /*
    //proj以外の掛け算
    return tmp;
}

//直接計算する
export function protMatVecMul(m,v){
        let x = m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2] + m[0][3];
        let y = m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2] + m[1][3];
        let z = m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2] + m[2][3];
        v[0] = x;
        v[1] = y;
        v[2] = z;
        /*
        ///projとの掛け算
        if (m[3][2] < 0) {//応用がきかないが、これでproj matと判断
            return tmp / (v[2] < 0 ? -v[2] : v[2]);
        }*/
        //proj以外の掛け算
        //return tmp;
/*    }
export function matPers(z) {
        //float s = 1.0f / tan(angle * 0.5f);
        //float a = f / (-f + n);
        //float b = a * n;
        let Matrix = 
        [
        [ 1/z, 0, 0, 0],
        [ 0, 1/z, 0, 0],
        [ 0, 0,   1, 0],
        [ 0, 0,   0, 1]
        ];
    
    return Matrix;
    /*
    m[0][0] = 1/z;          m[0][1] = 0;        m[0][2] = 0;            m[0][3] = 0;
    m[1][0] = 0;            m[1][1] = 1/z;      m[1][2] = 0;            m[1][3] = 0;
    m[2][0] = 0;            m[2][1] = 0;        m[2][2] = 1;            m[2][3] = 0;
    m[3][0] = 0;            m[3][1] = 0;        m[3][2] = 0;            m[3][3] = 1;
    */
/*    }
export function matCamera(m,camPos,lookat,up) {
        //カメラのローカル軸座標を求める(正規直交ベクトル)
        let z = culVecNormalize(vecMinus(lookat,camPos));
        let x = culVecNormalize(culVecCross(up, z));
        let y = culVecCross(z, x);
        m[0][0] = x[0];    m[0][1] = x[1];    m[0][2] = x[2];    m[0][3] = x[0] * -camPos[0] + x[1] * -camPos[1] + x[2] * -camPos[2];
        m[1][0] = y[0];    m[1][1] = y[1];    m[1][2] = y[2];    m[1][3] = y[0] * -camPos[0] + y[1] * -camPos[1] + y[2] * -camPos[2];
        m[2][0] = z[0];    m[2][1] = z[1];    m[2][2] = z[2];    m[2][3] = z[0] * -camPos[0] + z[1] * -camPos[1] + z[2] * -camPos[2];
        m[3][0] = 0;      m[3][1] = 0;      m[3][2] = 0;      m[3][3] = 1;
    }
export function mulMatRotateX(m,r) {
        let r360 = Math.floor(r*Math.PI/180);
        let c = 0;
        let s = 0;
        if(r360<0){
            r360 *= -1;
            c = -1*cosLut[r360];
            s = -1*sinLut[r360];        
        }else{
        c = cosLut[r360];
        s = sinLut[r360]; 
        }
        let tmp;
        //1行目
        tmp = m[0][1] * c + m[0][2] * s;
        m[0][2] = m[0][1] * -s + m[0][2] * c;
        m[0][1] = tmp;
        //2行目
        tmp = m[1][1] * c + m[1][2] * s;
        m[1][2] = m[1][1] * -s + m[1][2] * c;
        m[1][1] = tmp;
        //3行目
        tmp = m[2][1] * c + m[2][2] * s;
        m[2][2] = m[2][1] * -s + m[2][2] * c;
        m[2][1] = tmp;
    }
export function mulMatRotateY(m,r) {
    let r360 = Math.floor(r*Math.PI/180);
    let c = 0;
    let s = 0;
    if(r360<0){
        r360 *= -1;
        c = -1*cosLut[r360];
        s = -1*sinLut[r360];        
    }else{
    c = cosLut[r360];
    s = sinLut[r360]; 
    }
    let tmp;
        //1行目
        tmp = m[0][0] * c - m[0][2] * s;
        m[0][2] = m[0][0] * s + m[0][2] * c;
        m[0][0] = tmp;
        //2行目
        tmp = m[1][0] * c - m[1][2] * s;
        m[1][2] = m[1][0] * s + m[1][2] * c;
        m[1][0] = tmp;
        //3行目
        tmp = m[2][0] * c - m[2][2] * s;
        m[2][2] = m[2][0] * s + m[2][2] * c;
        m[2][0] = tmp;
    }
export function mulMatRotateZ(m,r) {
    let r360 = Math.floor(r*Math.PI/180);
    let c = 0;
    let s = 0;
    if(r360<0){
        r360 *= -1;
        c = -1*cosLut[r360];
        s = -1*sinLut[r360];        
    }else{
    c = cosLut[r360];
    s = sinLut[r360]; 
    }
    let tmp;
        //1行目
        tmp = m[0][0] * c + m[0][1] * s;
        m[0][1] = m[0][0] * -s + m[0][1] * c;
        m[0][0] = tmp;
        //2行目
        tmp = m[1][0] * c + m[1][1] * s;
        m[1][1] = m[1][0] * -s + m[1][1] * c;
        m[1][0] = tmp;
        //3行目
        tmp = m[2][0] * c + m[2][1] * s;
        m[2][1] = m[2][0] * -s + m[2][1] * c;
        m[2][0] = tmp;
    }
/*!
 * 4x4行列の行列式の計算
 *  | m[0][0]  m[0][1]  m[0][2]  m[0][3]  |
 *  | m[1][0]  m[1][1]  m[1][2]  m[1][3]  |
 *  | m[2][0]  m[2][1]  m[2][2] m[2][3] |
 *  | m[3][0] m[3][1] m[3][2] m[3][3] |
 * @param[in] m 元の行列
 * @return 行列式の値
 */
/*function CalDetMat4x4(m)
{
    return m[0][0]*m[1][1]*m[2][2]*m[3][3]+m[0][0]*m[1][2]*m[2][3]*m[3][1]+m[0][0]*m[1][3]*m[2][1]*m[3][2]
          +m[0][1]*m[1][0]*m[2][3]*m[3][2]+m[0][1]*m[1][2]*m[2][0]*m[3][3]+m[0][1]*m[1][3]*m[2][2]*m[3][0]
          +m[0][2]*m[1][0]*m[2][1]*m[3][3]+m[0][2]*m[1][1]*m[2][3]*m[3][0]+m[0][2]*m[1][3]*m[2][0]*m[3][1]
          +m[0][3]*m[1][0]*m[2][2]*m[3][1]+m[0][3]*m[1][1]*m[2][0]*m[3][2]+m[0][3]*m[1][2]*m[2][1]*m[3][0]
          -m[0][0]*m[1][1]*m[2][3]*m[3][2]-m[0][0]*m[1][2]*m[2][1]*m[3][3]-m[0][0]*m[1][3]*m[2][2]*m[3][1]
          -m[0][1]*m[1][0]*m[2][2]*m[3][3]-m[0][1]*m[1][2]*m[2][3]*m[3][0]-m[0][1]*m[1][3]*m[2][0]*m[3][2]
          -m[0][2]*m[1][0]*m[2][3]*m[3][1]-m[0][2]*m[1][1]*m[2][0]*m[3][3]-m[0][2]*m[1][3]*m[2][1]*m[3][0]
          -m[0][3]*m[1][0]*m[2][1]*m[3][2]-m[0][3]*m[1][1]*m[2][2]*m[3][0]-m[0][3]*m[1][2]*m[2][0]*m[3][1];
}
 
/*!
 * 4x4行列の行列式の計算
 *  | m[0][0]  m[0][1]  m[0][2]  m[0][3]  |
 *  | m[1][0]  m[1][1]  m[1][2]  m[1][3]  |
 *  | m[2][0]  m[2][1]  m[2][2] m[2][3] |
 *  | m[3][0] m[3][1] m[3][2] m[3][3] |
 * @param[in] m 元の行列
 * @param[out] invm 逆行列
 * @return 逆行列の存在
 */
/*export function CalInvMat4x4(m,invm)
{
    let det = CalDetMat4x4(m);
    if(det == 0){
        return false;
    }
    else{
        let  inv_det = 1.0/det;
 
        invm[0][0]  = inv_det*(m[1][1]*m[2][2]*m[3][3]+m[1][2]*m[2][3]*m[3][1]+m[1][3]*m[2][1]*m[3][2]-m[1][1]*m[2][3]*m[3][2]-m[1][2]*m[2][1]*m[3][3]-m[1][3]*m[2][2]*m[3][1]);
        invm[0][1]  = inv_det*(m[0][1]*m[2][3]*m[3][2]+m[0][2]*m[2][1]*m[3][3]+m[0][3]*m[2][2]*m[3][1]-m[0][1]*m[2][2]*m[3][3]-m[0][2]*m[2][3]*m[3][1]-m[0][3]*m[2][1]*m[3][2]);
        invm[0][2]  = inv_det*(m[0][1]*m[1][2]*m[3][3]+m[0][2]*m[1][3]*m[3][1]+m[0][3]*m[1][1]*m[3][2]-m[0][1]*m[1][3]*m[3][2]-m[0][2]*m[1][1]*m[3][3]-m[0][3]*m[1][2]*m[3][1]);
        invm[0][3]  = inv_det*(m[0][1]*m[1][3]*m[2][2]+m[0][2]*m[1][1]*m[2][3]+m[0][3]*m[1][2]*m[2][1]-m[0][1]*m[1][2]*m[2][3]-m[0][2]*m[1][3]*m[2][1]-m[0][3]*m[1][1]*m[2][2]);
 
        invm[1][0]  = inv_det*(m[1][0]*m[2][3]*m[3][2]+m[1][2]*m[2][0]*m[3][3]+m[1][3]*m[2][2]*m[3][0]-m[1][0]*m[2][2]*m[3][3]-m[1][2]*m[2][3]*m[3][0]-m[1][3]*m[2][0]*m[3][2]);
        invm[1][1]  = inv_det*(m[0][0]*m[2][2]*m[3][3]+m[0][2]*m[2][3]*m[3][0]+m[0][3]*m[2][0]*m[3][2]-m[0][0]*m[2][3]*m[3][2]-m[0][2]*m[2][0]*m[3][3]-m[0][3]*m[2][2]*m[3][0]);
        invm[1][2]  = inv_det*(m[0][0]*m[1][3]*m[3][2]+m[0][2]*m[1][0]*m[3][3]+m[0][3]*m[1][2]*m[3][0]-m[0][0]*m[1][2]*m[3][3]-m[0][2]*m[1][3]*m[3][0]-m[0][3]*m[1][0]*m[3][2]);
        invm[1][3]  = inv_det*(m[0][0]*m[1][2]*m[2][3]+m[0][2]*m[1][3]*m[2][0]+m[0][3]*m[1][0]*m[2][2]-m[0][0]*m[1][3]*m[2][2]-m[0][2]*m[1][0]*m[2][3]-m[0][3]*m[1][2]*m[2][0]);
 
        invm[2][0]  = inv_det*(m[1][0]*m[2][1]*m[3][3]+m[1][1]*m[2][3]*m[3][0]+m[1][3]*m[2][0]*m[3][1]-m[1][0]*m[2][3]*m[3][1]-m[1][1]*m[2][0]*m[3][3]-m[1][3]*m[2][1]*m[3][0]);
        invm[2][1]  = inv_det*(m[0][0]*m[2][3]*m[3][1]+m[0][1]*m[2][0]*m[3][3]+m[0][3]*m[2][1]*m[3][0]-m[0][0]*m[2][1]*m[3][3]-m[0][1]*m[2][3]*m[3][0]-m[0][3]*m[2][0]*m[3][1]);
        invm[2][2]  = inv_det*(m[0][0]*m[1][1]*m[3][3]+m[0][1]*m[1][3]*m[3][0]+m[0][3]*m[1][0]*m[3][1]-m[0][0]*m[1][3]*m[3][1]-m[0][1]*m[1][0]*m[3][3]-m[0][3]*m[1][1]*m[3][0]);
        invm[2][3]  = inv_det*(m[0][0]*m[1][3]*m[2][1]+m[0][1]*m[1][0]*m[2][3]+m[0][3]*m[1][1]*m[2][0]-m[0][0]*m[1][1]*m[2][3]-m[0][1]*m[1][3]*m[2][0]-m[0][3]*m[1][0]*m[2][1]);
 
        invm[3][0]  = inv_det*(m[1][0]*m[2][2]*m[3][1]+m[1][1]*m[2][0]*m[3][2]+m[1][2]*m[2][1]*m[3][0]-m[1][0]*m[2][1]*m[3][2]-m[1][1]*m[2][2]*m[3][0]-m[1][2]*m[2][0]*m[3][1]);
        invm[3][1]  = inv_det*(m[0][0]*m[2][1]*m[3][2]+m[0][1]*m[2][2]*m[3][0]+m[0][2]*m[2][0]*m[3][1]-m[0][0]*m[2][2]*m[3][1]-m[0][1]*m[2][0]*m[3][2]-m[0][2]*m[2][1]*m[3][0]);
        invm[3][2]  = inv_det*(m[0][0]*m[1][2]*m[3][1]+m[0][1]*m[1][0]*m[3][2]+m[0][2]*m[1][1]*m[3][0]-m[0][0]*m[1][1]*m[3][2]-m[0][1]*m[1][2]*m[3][0]-m[0][2]*m[1][0]*m[3][1]);
        invm[3][3]  = inv_det*(m[0][0]*m[1][1]*m[2][2]+m[0][1]*m[1][2]*m[2][0]+m[0][2]*m[1][0]*m[2][1]-m[0][0]*m[1][2]*m[2][1]-m[0][1]*m[1][0]*m[2][2]-m[0][2]*m[1][1]*m[2][0]);
 
        return true;
    }
}
export function getInverseMatrix(matrix){

    let a  = [];
    for (const line of matrix) {
        a.push([...line]);
    }
    let inv_a = matIdentity(); //ここに逆行列が入る(単位行列)
    let buf; //一時的なデータを蓄える
    let i,j,k; //カウンタ
    let n=4;  //配列の次数

   //掃き出し法
   for(i=0;i<n;i++){
    buf=1/a[i][i];
        for(j=0;j<n;j++){
            a[i][j]*=buf;
            inv_a[i][j]*=buf;
        }
    for(j=0;j<n;j++){
        if(i!=j){
            buf=a[j][i];
            for(k=0;k<n;k++){
                a[j][k]-=a[i][k]*buf;
                inv_a[j][k]-=inv_a[i][k]*buf;
            }
        }
    }
   }
    return inv_a;
}*/