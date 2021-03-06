import {setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize} from './vector.js';
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
    
        tmp[0][0] = m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2] * m2[2][0] +m1[0][3] * m2[3][0];
        tmp[1][0] = m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2] * m2[2][0] +m1[1][3] * m2[3][0];
        tmp[2][0] = m1[2][0] * m2[0][0] + m1[2][1] * m2[1][0] + m1[2][2] * m2[2][0] +m1[2][3] * m2[3][0];
        tmp[3][0] = m1[3][0] * m2[0][0] + m1[3][1] * m2[1][0] + m1[3][2] * m2[2][0] +m1[3][3] * m2[3][0];
    
        tmp[0][1] = m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2] * m2[2][1] +m1[0][3] * m2[3][1];
        tmp[1][1] = m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2] * m2[2][1] +m1[1][3] * m2[3][1];
        tmp[2][1] = m1[2][0] * m2[0][1] + m1[2][1] * m2[1][1] + m1[2][2] * m2[2][1] +m1[2][3] * m2[3][1];
        tmp[3][1] = m1[3][0] * m2[0][1] + m1[3][1] * m2[1][1] + m1[3][2] * m2[2][1] +m1[3][3] * m2[3][1];
    
        tmp[0][2] = m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2] * m2[2][2] + m1[0][3] * m2[3][2];
        tmp[1][2] = m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2] * m2[2][2] + m1[1][3] * m2[3][2];
        tmp[2][2] = m1[2][0] * m2[0][2] + m1[2][1] * m2[1][2] + m1[2][2] * m2[2][2] + m1[2][3] * m2[3][2];
        tmp[3][2] = m1[3][0] * m2[0][2] + m1[3][1] * m2[1][2] + m1[3][2] * m2[2][2] + m1[3][3] * m2[3][2];
    
        tmp[0][3] = m1[0][0] * m2[0][3] + m1[0][1] * m2[1][3] + m1[0][2] * m2[2][3] + m1[0][3] * m2[3][3];
        tmp[1][3] = m1[1][0] * m2[0][3] + m1[1][1] * m2[1][3] + m1[1][2] * m2[2][3] + m1[1][3] * m2[3][3];
        tmp[2][3] = m1[2][0] * m2[0][3] + m1[2][1] * m2[1][3] + m1[2][2] * m2[2][3] + m1[2][3] * m2[3][3];
        tmp[3][3] = m1[3][0] * m2[0][3] + m1[3][1] * m2[1][3] + m1[3][2] * m2[2][3] + m1[3][3] * m2[3][3];
    
        return tmp;
    }    
export function matVecMul(m,v){
        let tmp = []
        tmp.push(m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2] + m[0][3]);
        tmp.push(m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2] + m[1][3]);
        tmp.push(m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2] + m[2][3]);
            //proj???????????????
        if (m[3][2] < 0) {//????????????????????????????????????proj mat?????????
            return tmp / (v[2] < 0 ? -v[2] : v[2]);
        }
        //proj??????????????????
        return tmp;
    }
export function matPers(m,z) {
        //float s = 1.0f / tan(angle * 0.5f);
        //float a = f / (-f + n);
        //float b = a * n;
        m[0][0] = 1/z;   m[0][1] = 0;        m[0][2] = 0;            m[0][3] = 0;
        m[1][0] = 0;            m[1][1] = 1/z;        m[1][2] = 0;            m[1][3] = 0;
        m[2][0] = 0;            m[2][1] = 0;        m[2][2] = 1;            m[2][3] = 0;
        m[3][0] = 0;            m[3][1] = 0;        m[3][2] = 0;           m[3][3] = 1;
    }
export function matCamera(m,camPos,lookat,up) {
        //?????????????????????????????????????????????(????????????????????????)
        let z = culVecNormalize(vecMinus(lookat,camPos));
        let x = culVecNormalize(culVecCross(up, z));
        let y = culVecCross(z, x);
        m[0][0] = x[0];    m[0][1] = x[1];    m[0][2] = x[2];    m[0][3] = x[0] * -camPos[0] + x[1] * -camPos[1] + x[2] * -camPos[2];
        m[1][0] = y[0];    m[1][1] = y[1];    m[1][2] = y[2];    m[1][3] = y[0] * -camPos[0] + y[1] * -camPos[1] + y[2] * -camPos[2];
        m[2][0] = z[0];    m[2][1] = z[1];    m[2][2] = z[2];    m[2][3] = z[0] * -camPos[0] + z[1] * -camPos[1] + z[2] * -camPos[2];
        m[3][0] = 0;      m[3][1] = 0;      m[3][2] = 0;      m[3][3] = 1;
    }
export function mulMatRotateX(m,r) {
        let r360 = r*Math.PI/180;
        let c = Math.cos(r360);
        let s = Math.sin(r360);
        let tmp;
        //1??????
        tmp = m[0][1] * c + m[0][2] * s;
        m[0][2] = m[0][1] * -s + m[0][2] * c;
        m[0][1] = tmp;
        //2??????
        tmp = m[1][1] * c + m[1][2] * s;
        m[1][2] = m[1][1] * -s + m[1][2] * c;
        m[1][1] = tmp;
        //3??????
        tmp = m[2][1] * c + m[2][2] * s;
        m[2][2] = m[2][1] * -s + m[2][2] * c;
        m[2][1] = tmp;
    }
export function mulMatRotateY(m,r) {
        let r360 = r*Math.PI/180;
        let c = Math.cos(r360);
        let s = Math.sin(r360);
        let tmp;
        //1??????
        tmp = m[0][0] * c - m[0][2] * s;
        m[0][2] = m[0][0] * s + m[0][2] * c;
        m[0][0] = tmp;
        //2??????
        tmp = m[1][0] * c - m[1][2] * s;
        m[1][2] = m[1][0] * s + m[1][2] * c;
        m[1][0] = tmp;
        //3??????
        tmp = m[2][0] * c - m[2][2] * s;
        m[2][2] = m[2][0] * s + m[2][2] * c;
        m[2][0] = tmp;
    }
export function mulMatRotateZ(m,r) {
        let r360 = r*Math.PI/180;
        let c = Math.cos(r360);
        let s = Math.sin(r360);
        let tmp;
        //1??????
        tmp = m[0][0] * c + m[0][1] * s;
        m[0][1] = m[0][0] * -s + m[0][1] * c;
        m[0][0] = tmp;
        //2??????
        tmp = m[1][0] * c + m[1][1] * s;
        m[1][1] = m[1][0] * -s + m[1][1] * c;
        m[1][0] = tmp;
        //3??????
        tmp = m[2][0] * c + m[2][1] * s;
        m[2][1] = m[2][0] * -s + m[2][1] * c;
        m[2][0] = tmp;
    }
export function getInverseMatrix(matrix){

    let a  = [];
    for (const line of matrix) {
        a.push([...line]);
    }
    let inv_a = matIdentity(); //???????????????????????????(????????????)
    let buf; //?????????????????????????????????
    let i,j,k; //????????????
    let n=4;  //???????????????

   //???????????????
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