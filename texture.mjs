// |a,b| |_11,_12|
// |c,d| |_21,_22|

export class M22
{
  constroctor(){
    this._11 = 1;  //a
    this._12 = 0;  //b
    this._21 = 0;  //c
    this._22 = 1;  //d 
  }
  getInvert(){
    var out = new M22();
    //逆行列の公式 ad - bc の部分
    var det = this._11 * this._22 - this._12 * this._21;
    if (det > -0.0001 && det < 0.0001)
      return null;

    //逆行列の公式 det=(ad - bc) で各値(a,b,c,d)を割る
    out._11 = this._22 / det;  // a = d / det
    out._22 = this._11 / det;  // d = a / det

    out._12 = -this._12 / det; // b = -b / det
    out._21 = -this._21 / det; // c = -c / det

    return out;
  }
}

export function drawTriangle(g, img, vertex_list, uv_list)
{
  //各点のZ座標がこれより下なら作画しない。
  if (vertex_list[6] > 0.6 && vertex_list[7] > 0.6 && vertex_list[8] > 0.6) {
    var _Ax = vertex_list[2] - vertex_list[0];
    var _Ay = vertex_list[3] - vertex_list[1];
    var _Bx = vertex_list[4] - vertex_list[0];
    var _By = vertex_list[5] - vertex_list[1];

    var Ax = (uv_list[2] - uv_list[0]) * img.width;
    var Ay = (uv_list[3] - uv_list[1]) * img.height;
    var Bx = (uv_list[4] - uv_list[0]) * img.width;
    var By = (uv_list[5] - uv_list[1]) * img.height;

    //逆行列を求める
    var m = new M22();
    m._11 = Ax;
    m._12 = Ay;
    m._21 = Bx;
    m._22 = By;
    var mi = m.getInvert();
    if (!mi) return;

    //マトリックス変換値を求める
    var a, b, c, d;
    a = mi._11 * _Ax + mi._12 * _Bx;
    c = mi._21 * _Ax + mi._22 * _Bx;

    b = mi._11 * _Ay + mi._12 * _By;
    d = mi._21 * _Ay + mi._22 * _By;
    g.fillStyle = "blue"

    g.save();
    g.beginPath();
    g.moveTo(vertex_list[0], vertex_list[1]);
    g.lineTo(vertex_list[2], vertex_list[3]);
    g.lineTo(vertex_list[4], vertex_list[5]);
    g.clip(); //三角形に切り取る

    //平行移動を追加済み        
    g.transform(a, b, c, d,
      vertex_list[0] - (a * uv_list[0] * img.width + c * uv_list[1] * img.height),
      vertex_list[1] - (b * uv_list[0] * img.width + d * uv_list[1] * img.height));
    g.drawImage(img, 0, 0);
    g.restore();  
  }

}
