//頂点にクラスを使うと重たくなる頂点演算のせい？
//classをjsonに置き換え中インスタンス製造じゃなくてただの文字列になるため軽くなると思われるから。
import {setVector2,setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize, round, roundVector2} from './vector.js';
import {matIdentity,mulMatTranslate,mulMatScaling, matMul,matVecMul,matPers,matCamera,mulMatRotateX,mulMatRotatePointX,mulMatRotateY,mulMatRotatePointY,mulMatRotateZ,mulMatRotatePointZ,getInverseMatrix, matRound4X4, protMatVecMul, CalInvMat4x4, matWaight, matPlus} from './matrix.js';
import {waistVerts,spineVerts,headVerts,orgPlaneVerts, orgCubeVerts, RightLeg1Verts, RightLeg2Verts, LeftLeg1Verts, LeftLeg2Verts, rightArm1Verts, rightArm2Verts, leftArm1Verts, leftArm2Verts} from './orgverts.js';
import {setPixelZ,setPixel,renderBuffer,pixel,bufferPixelInit,bufferInit,pictureToPixelMap,dotPaint,dotLineBufferRegister,triangleRasterize,textureTransform,triangleToBuffer,sort_index,branch} from './paint.js';

export const SCREEN_SIZE_W = 1000;
export const SCREEN_SIZE_H = 800;

function getAllChildNodesDepth(childrenLength,element,tempResult,result,bonesNameList) {
  let boneHit = false;
    for(let i=0;i<childrenLength;i++){
    let currentElement = element[i];
    //boneElement
    for(let index = 0;index<bonesNameList.length;index++){
      let boneName = bonesNameList[index][0];
      if(currentElement.getAttribute("sid") == boneName){
        tempResult.unshift(bonesNameList[index][1]);
        let length = currentElement.children.length;
        getAllChildNodesDepth(length,currentElement.children,tempResult,result,bonesNameList);
        boneHit = true;
        tempResult.shift();
      }
    }
  }
  //leafNoBone
  if(boneHit == false){
    result.push(tempResult.slice(0,tempResult.length));
    return;
  }
}

let steveLoadPack = {};

daeLoader("dice3.dae",steveLoadPack);

function daeLoader(fileName,daeLoadPack){
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", fileName);
  xmlhttp.send();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        //var elem = document.getElementById("asset");

        //elem.innerHTML += "----- getElementsByTagName -----<br/>";
        var docelem = xmlhttp.responseXML.documentElement;
        //mesh
        var meshData = docelem.getElementsByTagName("mesh");
        let loadMeshVerts = [];
        let loadMeshIndex = [];
        let loadMeshUV = [];
        for(let i=0;i<meshData[0].children.length;i++){
          if(meshData[0].children[i].id.indexOf('positions') != -1){
            if(meshData[0].children[i].children[0].textContent[meshData[0].children[i].children[0].textContent.length-1] != ' '){
              //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
              meshData[0].children[i].children[0].textContent += ' ';
            }
            loadMeshVerts.push(meshData[0].children[i].children[0].textContent);
          }

          if(meshData[0].children[i].id.indexOf('map') != -1){
            if(meshData[0].children[i].children[0].textContent[meshData[0].children[i].children[0].textContent.length-1] != ' '){
              //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
              meshData[0].children[i].children[0].textContent += ' ';
            }
            loadMeshUV.push(meshData[0].children[i].children[0].textContent);
          }

          if(meshData[0].children[i].getAttribute('material')  != null && meshData[0].children[i].getAttribute('material').indexOf('material') != -1){
            if(meshData[0].children[i].children[3].textContent[meshData[0].children[i].children[3].textContent.length-1] != ' '){
              //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
              meshData[0].children[i].children[3].textContent += ' ';
            }
            loadMeshIndex.push(meshData[0].children[i].children[3].textContent);
          }
        }
        //meshData
        let verts = [];
        let char = [];
        let meshVerts = [];
        for(let j=0;j<loadMeshVerts.length;j++){
          for(let i=0;i<loadMeshVerts[j].length;i++){
            let tempChar = loadMeshVerts[j][i];
            if(char.length == 0 && loadMeshVerts[j][i] != " "){
              char = tempChar;
              continue;
            }else{
              if(loadMeshVerts[j][i] != " "){
                  char += tempChar;
              }else{
                let tempInt = parseFloat(char)
                verts.push(tempInt);
                char = [];
                if(verts.length %3 == 0){
                  meshVerts.push(verts);
                  verts = [];
                }
              }
            }
          }
        }
        daeLoadPack.meshVerts = meshVerts;
        //meshIndex
        char = [];
        verts = [];
        let tempVertsIndex = [];
        let meshVertsIndex = [];
        let normalIndex= [];
        let UVIndex = [];
        //1index,2normal,3uv
        let readNow = 1;
        for(let j=0;j<loadMeshIndex.length;j++){
          for(let i=0;i<loadMeshIndex[j].length;i++){
            let tempChar = loadMeshIndex[j][i];
            if(char.length == 0 && loadMeshIndex[j][i] != " "){
              char = tempChar;
              continue;
            }else{
              if(loadMeshIndex[j][i] != " "){
                  char += tempChar;
              }else{
                let tempInt = parseInt(char)
                if(readNow == 1){
                  tempVertsIndex.unshift(tempInt);
                  char = [];
                  if(tempVertsIndex.length %3 == 0){
                    meshVertsIndex.push(tempVertsIndex);
                    tempVertsIndex = [];
                  }
                  readNow = 2;
                }else if(readNow == 2){
                  //tempVertsIndex.push(tempInt);
                  char = [];
                  readNow = 3;
                }else if(readNow == 3){
                  //tempVertsIndex.push(tempInt);
                  char = [];
                  readNow = 1;
                }
              }
            }
          }
        }
        daeLoadPack.meshVertsIndex = meshVertsIndex;
        //uv
        let tempUV = [];
        let meshUV = [];
        let u = 0;
        let v = 0;
        let readFlag = 0;//0:u,1:v,2:tempUV
        char = [];
        for(let j=0;j<loadMeshUV.length;j++){
          for(let i=0;i<loadMeshUV[j].length;i++){
            let tempChar = loadMeshUV[j][i];
            if(char.length == 0 && loadMeshUV[j][i] != " "){
              char = tempChar;
              continue;
            }else{
              if(loadMeshUV[j][i] != " "){
                  char += tempChar;
              }else{
                let tempFloat = parseFloat(char)
                if(readFlag == 0){
                  u = tempFloat;
                  char = [];
                  readFlag = 1;
                }else if(readFlag == 1){
                  v = tempFloat;
                  v = (v < 0) ? v * -1 : 1 - v;
                  char = [];
                  let uv = {"u":u,"v":v};
                  tempUV.unshift(uv);
                  if(tempUV.length %3 == 0){
                    meshUV.push(tempUV);
                    tempUV = [];
                  }
                  u = 0;
                  v = 0;
                  readFlag = 0;
                }
              }
            }
          }              
        }
        daeLoadPack.meshUV = meshUV;
        //armature
        var armatures = docelem.getElementsByTagName("library_controllers");
        if(armatures.length != 0){
          daeLoadPack.armatures = true;
          //boneNameList
          var boneName = docelem.getElementsByTagName("Name_array");
          let bonesNameList = [];
          let boneNumber = 0;
          char = [];
          boneName[0].textContent += ' ';
          for(let i=0;i<boneName[0].textContent.length;i++){
            if(boneName[0].textContent[i] != ' '){
            char += boneName[0].textContent[i];
            }else{
              let tempboneNameList = [char,boneNumber];
              char = [];
              boneNumber += 1;
              bonesNameList.push(tempboneNameList);
            }
          }
          daeLoadPack.bonesNameList = bonesNameList;
          //dataLoad
          let loadBindPose = [];
          let loadSkinWaight = [];
          let vertsBlendNumbers = [];
          let vertsBlendMatrixNumbers = [];

          for(let i=0;i<armatures[0].children[0].children[0].children.length;i++){
            if(armatures[0].children[0].children[0].children[i].id.indexOf('bind_poses') != -1){
              if(armatures[0].children[0].children[0].children[i].children[0].textContent[armatures[0].children[0].children[0].children[i].children[0].textContent.length-1] != ' '){
                //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                armatures[0].children[0].children[0].children[i].children[0].textContent += ' ';
              }
              loadBindPose.push(armatures[0].children[0].children[0].children[i].children[0].textContent);
            }
            if(armatures[0].children[0].children[0].children[i].id.indexOf('skin-weights') != -1){
              if(armatures[0].children[0].children[0].children[i].children[0].textContent[armatures[0].children[0].children[0].children[i].children[0].textContent.length-1] != ' '){
                //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                armatures[0].children[0].children[0].children[i].children[0].textContent += ' ';
              }
              loadSkinWaight.push(armatures[0].children[0].children[0].children[i].children[0].textContent);
            }
            if(armatures[0].children[0].children[0].children[i].tagName.indexOf('vertex_weights') != -1){
              //vertsBlendNumbers
              if(armatures[0].children[0].children[0].children[i].children[2].textContent[armatures[0].children[0].children[0].children[i].children[2].textContent.length-1] != ' '){
                //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                armatures[0].children[0].children[0].children[i].children[2].textContent += ' ';
              }
              vertsBlendNumbers.push(armatures[0].children[0].children[0].children[i].children[2].textContent);
              //vertsBlendMatrixNumbers
              if(armatures[0].children[0].children[0].children[i].children[3].textContent[armatures[0].children[0].children[0].children[i].children[3].textContent.length-1] != ' '){
                //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                armatures[0].children[0].children[0].children[i].children[3].textContent += ' ';
              }
              vertsBlendMatrixNumbers.push(armatures[0].children[0].children[0].children[i].children[3].textContent);
            }
          }
          
          //bindPose
          let tempBind = [];
          let bindPosePack = [];
          for(let i=0;i<loadBindPose[0].length;i++){
            let tempChar = loadBindPose[0][i];
            if(char.length == 0 && loadBindPose[0][i] != " "){
              char = tempChar;
              continue;
            }else{
              if(loadBindPose[0][i] != " "){
                  char += tempChar;
              }else{
                let tempFloat = parseFloat(char);
                char = [];
                tempBind.push(tempFloat)
                if(tempBind.length >= 4*4){
                  let boneContents = {};
                  let inverseBindPose = matIdentity();
                  CalInvMat4x4(tempBind,inverseBindPose);
                  boneContents.bindPose = tempBind.concat();
                  boneContents.inverseBindPose = inverseBindPose;
                  boneContents.copyInverseBindPose = inverseBindPose.concat();
                  bindPosePack.push(boneContents);
                  tempBind = [];  
          
                }
              }
            }  
          }
          daeLoadPack.bindPosePack = bindPosePack;
          //vertsBoneBlendNumber
          let vertsBoneBlendFloatNumber = [];
          for(let i=0;i<vertsBlendNumbers[0].length;i++){
            let tempChar = vertsBlendNumbers[0][i];
            if(char.length == 0 && vertsBlendNumbers[0][i] != " "){
              char = tempChar;
              continue;
            }else{
              if(vertsBlendNumbers[0][i] != " "){
                  char += tempChar;
              }else{
                let tempFloat = parseFloat(char);
                char = [];
                vertsBoneBlendFloatNumber.push(tempFloat)
              }
            }  
          }
          console.log(vertsBoneBlendFloatNumber)
          //vertsBoneBlendMmatrixNumber
          let currentVerts = 0;
          let vertsBlend = true;
          let tempVertsBlend = [];
          let blendBoneIndex = [];
          for(let i=0;i<vertsBlendMatrixNumbers[0].length;i++){
            let tempChar = vertsBlendMatrixNumbers[0][i];
            if(char.length == 0 && vertsBlendMatrixNumbers[0][i] != " "){
              char = tempChar;
              continue;
            }else{
              if(vertsBlendMatrixNumbers[0][i] != " "){
                  char += tempChar;
              }else{
                if(vertsBlend == true){
                let tempFloat = parseFloat(char);
                char = [];
                tempVertsBlend.push(tempFloat);
                if(tempVertsBlend.length >= vertsBoneBlendFloatNumber[currentVerts]){
                  blendBoneIndex.push(tempVertsBlend);
                  tempVertsBlend = [];
                  currentVerts += 1;
                }
                vertsBlend = false;
                }else{
                  vertsBlend = true;
                  char = [];
                }
              }
            }  
          }
          console.log(blendBoneIndex)
          daeLoadPack.blendBoneIndex = blendBoneIndex;
          //boneWeight
          let tempBoneWeight = [];
          let vertsNumber = 0;
          let bonesWeight = [];
          let nowReadVertsNumber = vertsBoneBlendFloatNumber[vertsNumber];
          for(let i=0;i<loadSkinWaight[0].length;i += 1){
            let tempChar = loadSkinWaight[0][i];
            if(char.length == 0 && loadSkinWaight[0][i] != " "){
              char = tempChar;
              continue;
            }else{
              if(loadSkinWaight[0][i] != " "){
                  char += tempChar;
              }else{
                let tempFloat = parseFloat(char);
                char = [];
                tempBoneWeight.push(tempFloat)
                if(tempBoneWeight.length >= nowReadVertsNumber){
                  bonesWeight.push(tempBoneWeight);
                  tempBoneWeight = [];
                  vertsNumber += 1;
                  nowReadVertsNumber = vertsBoneBlendFloatNumber[vertsNumber]; 
                }
              }
            }  
          }
          console.log(bonesWeight)
          daeLoadPack.bonesWeight = bonesWeight;
          //どのボーンが親が調べる
          var boneJointList = docelem.getElementsByTagName("node");
          let  tempResult = [];
          let boneParentRelation = [];
          getAllChildNodesDepth(boneJointList[0].children.length, boneJointList[0].children,tempResult,boneParentRelation,bonesNameList);
          console.log(boneParentRelation);
          daeLoadPack.boneParentRelation = boneParentRelation;
        }
        daeLoadPack.daeLoad = true;

      } else {
        alert("status = " + xmlhttp.status);
      }
    }
  }
}

 
// ルックアップテーブルを生成しておく
export const sinLut = [];
export const cosLut = [];
const DEG_TO_RAD = Math.PI / 180;
//const RAD_TO_DEG = 180 / Math.PI;
for(let i = 0; i < 360; i++) {
  sinLut.push(Math.sin(i * DEG_TO_RAD));
  cosLut.push(Math.cos(i * DEG_TO_RAD));
}
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
c.width = SCREEN_SIZE_W;
c.height = SCREEN_SIZE_H;

var canvas = document.getElementById('backmyCanvas');
var backCtx = canvas.getContext('2d',{willReadFrequently: true});
canvas.width = SCREEN_SIZE_W*5;
canvas.height = SCREEN_SIZE_H*7;
//viewPortMat
let viewPortMatrix = [
  [ SCREEN_SIZE_W, 0, 0, SCREEN_SIZE_W/2],
  [ 0, SCREEN_SIZE_H, 0, SCREEN_SIZE_H/2],
  [ 0, 0, 1, 0],
  [ 0, 0, 0, 1]
];
let inverseViewPortMatrix = matIdentity();
CalInvMat4x4(viewPortMatrix,inverseViewPortMatrix);
let viewMatrix = matIdentity();
let inverseViewMatrix = matIdentity();
let sunViewMatrix = matIdentity();
// Camera
let cameraPos = setVector3(0,-1,-4);
let lookat = setVector3(0.0,-1,1);
let sunPos = setVector3(0,-3,-2);
let sunLookat = setVector3(0.0,-0.0,0);
let up = setVector3(0,1,0);
let lookatIndex = 0;


// index、三角形の結び順格納
function setFaceIndex(v0,v1,v2){
	let faceIndex = [v0,v1,v2];
	return faceIndex;
}
//ロードしたデータ格納
class ModelLoadData{
	
	constructor(mainObject){
		this.mainObject = mainObject;
	}
	// モデルJSONデータ読み込み
    JSONLoader(file, callback) {
        var x = new XMLHttpRequest();

        x.open('GET', file);
        x.onreadystatechange = () => {
            if (x.readyState == 4) {
                this.json = JSON.parse(x.responseText);
                // 読込完了コールバック
                callback();
            }
        }
        x.send();
    }
    
   	onJSONLoaded() {
   		//verticesLoad;
   		let mainvertices = [];
   		let loadVertices = this.json.data.attributes.position.array;
   		for(let i=0;i<this.json.data.attributes.position.array.length;i+=this.json.data.attributes.position.itemSize){
			let tempVertices = [loadVertices[i],loadVertices[i+1],loadVertices[i+2]];
			mainvertices.push(tempVertices);
   		}
   		this.mainObject.verts = mainvertices;
   		
   		//uvLoad
   		let loadTempUV = [];
   		let loadUV = this.json.data.attributes.uv.array;
   		for(let i=0;i<this.json.data.attributes.uv.array.length;i+=this.json.data.attributes.uv.itemSize){
   			let u = loadUV[i] %1.0;
   			let v = loadUV[i+1] %1.0;
	        u = (u < 0) ? 1 + u : u;
	        v = (v < 0) ? v * -1 : 1 - v;
   			let tempUV = [u,v];
   			loadTempUV.push(tempUV);  		
   		}
   		//this.mainObject.UV = mainUV;
   		//indexLoad頂点の結び順外積負の向き
   		let mainFaceIndex = [];
   		let loadFaceIndexVertices = this.json.data.index.array;
   		const triangleIndex = 3;
   		for(let i=0;i<this.json.data.index.array.length;i+=triangleIndex){
   		  let tempFaceInde = setFaceIndex(loadFaceIndexVertices[i],loadFaceIndexVertices[i+2],loadFaceIndexVertices[i+1]);
   			mainFaceIndex.push(tempFaceInde);
   		}
      let triangleIndexUV = [];
      for(let i=0;i<this.json.data.index.array.length;i+=triangleIndex){
        let u1 = loadTempUV[loadFaceIndexVertices[i]][0];
        let v1 = loadTempUV[loadFaceIndexVertices[i]][1];
        let u2 = loadTempUV[loadFaceIndexVertices[i+2]][0];
        let v2 = loadTempUV[loadFaceIndexVertices[i+2]][1];
        let u3 = loadTempUV[loadFaceIndexVertices[i+1]][0];
        let v3 = loadTempUV[loadFaceIndexVertices[i+1]][1];
        let tempUV =  [{"u":u1,"v":v1},{"u":u2,"v":v2},{"u":u3,"v":v3}];
        triangleIndexUV.push(tempUV);
      }
      this.mainObject.UV = triangleIndexUV
   		this.mainObject.faceIndex = mainFaceIndex;
   		this.loadFinish = true;
   	
   	}
    getLoadFinish(){
    	return this.loadFinish;
    }
    getThisClass(){
    	return this;
    }
}

class Object{
  
  constructor(verts,x,y,z,RotX,RotY,RotZ,scalex,scaley,scalez,numCorners,backGroundFlag,backCullingFlag,img){
    
    this.centerObjX = x;
    this.centerObjY = y;
    this.centerObjZ = z;
      
    this.objRotX = RotX;
    this.objRotY = RotY;
    this.objRotZ = RotZ;
    
    this.numCorners = numCorners;
    
    this.scaleX = scalex;
    this.scaleY = scaley;
    this.scaleZ = scalez;

    this.image = img;
    
    this.backGroundFlag = backGroundFlag;
    this.backCullingFlag = backCullingFlag;
    
    //文字列になってる
    this.verts = JSON.parse(JSON.stringify(verts.vertsPosition));
    this.faceIndex = verts.faceIndex;
    this.bonesIndex = verts.bonesIndex;
    this.bonesWaight = verts.bonesWaight;
    this.UV = verts.uv;
    this.faceUV = [];
  }
}

class moveObject{ 
  constructor(orgObject,worldMatrix,polyList){
    this.orgObject = orgObject;
    this.worldMatrix = worldMatrix;
    if(polyList!=undefined){
      this.polygonList = polyList;
      this.polygonNum = this.polygonList.length; 
    } 
    this.gravityCollision = false;
  }
}
//jsonポリゴン製造
function setPolygon(Pos1,Pos2,Pos3,worldPos1,worldPos2,worldPos3,UV,image){
  let polygonElement = {};
  let moveVertices =   [[0,0,0],
                        [0,0,0],
                        [0,0,0]];
  //[0]=x,[1]=y,[2]=z
  moveVertices[0][0] = Pos1[0];
  moveVertices[0][1] = Pos1[1];
  moveVertices[0][2] = Pos1[2];

  moveVertices[1][0] = Pos2[0];
  moveVertices[1][1] = Pos2[1];
  moveVertices[1][2] = Pos2[2];

  moveVertices[2][0] = Pos3[0];
  moveVertices[2][1] = Pos3[1];
  moveVertices[2][2] = Pos3[2];

  polygonElement.moveVertices = moveVertices;
  polygonElement.image = image;
  polygonElement.UV = UV;
  let Va = vecMinus(Pos1,Pos2);
  let Vb = vecMinus(Pos3,Pos1);
  polygonElement.crossZ = culVecCrossZ(Va,Vb);
  //ライトシミュレーション用
  Va = vecMinus(worldPos1,worldPos2);
  Vb = vecMinus(worldPos3,worldPos1);
  polygonElement.crossWorldVector3 = culVecNormalize(culVecCross(Va,Vb));
  return polygonElement;
}
//jsonシャドウマップ用ポリゴン製造
function setShadowPolygon(Pos1,Pos2,Pos3){
  let polygonElement = {};
  let moveVertices =   [[0,0,0],
                        [0,0,0],
                        [0,0,0]];
  //[0]=x,[1]=y,[2]=z
  moveVertices[0][0] = Pos1[0];
  moveVertices[0][1] = Pos1[1];
  moveVertices[0][2] = Pos1[2];

  moveVertices[1][0] = Pos2[0];
  moveVertices[1][1] = Pos2[1];
  moveVertices[1][2] = Pos2[2];

  moveVertices[2][0] = Pos3[0];
  moveVertices[2][1] = Pos3[1];
  moveVertices[2][2] = Pos3[2];

  polygonElement.moveVertices = moveVertices;
  let Va = vecMinus(Pos1,Pos2);
  let Vb = vecMinus(Pos3,Pos1);
  polygonElement.crossZ = culVecCrossZ(Va,Vb);
  return polygonElement;
}
//スキンメッシュ用
function objectSkinMeshPolygonPush(objects,bones,objectNumber,projectedObjects,viewMatrix){
  let worldVerts = [];
  let projectedVerts = [];
  let mixMatrix = [];
  let object = objects[objectNumber];

  for (var i = 0; i < object.verts.length; i++) {
    let mixMatrix = [0,0,0,0,
                    0,0,0,0,
                    0,0,0,0,
                    0,0,0,0];
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);
    for(let j=0;j<object.bonesIndex[i].length;j++){
      let bonesMatrix = bones[object.bonesIndex[i][j]].bone;
      let matrixWaight = object.bonesWaight[i][j];
      let waightMatrix = matWaight(bonesMatrix,matrixWaight);
      mixMatrix = matPlus(mixMatrix,waightMatrix); 
    }
    let verts = matVecMul(mixMatrix,object.verts[i])
    worldVerts.push(verts);
    projectedVerts.push(matVecMul(viewMatrix,verts));     
    let projectionMatrix =  matPers(projectedVerts[i][2]);
    protMatVecMul(projectionMatrix,projectedVerts[i]);
    //projectedVerts[i] = matVecMul(viewPortMatrix,projectedVerts[i]);
    projectedVerts[i][0] = Math.floor((projectedVerts[i][0] + 0.5)*SCREEN_SIZE_W);
    projectedVerts[i][1] = Math.floor((projectedVerts[i][1] + 0.5)*SCREEN_SIZE_H);
  }
 
  let Poly = []
  for(let i=0;i<object.faceIndex.length;i++){
    let triangleFaceIndex = object.faceIndex[i];
    let UV = [
          object.UV[i][0].u, object.UV[i][0].v,
          object.UV[i][1].u, object.UV[i][1].v,
          object.UV[i][2].u, object.UV[i][2].v,
          ]
    Poly.push(setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],UV,object.image));
  }

  let tempMoveObject = new moveObject(object,mixMatrix,Poly);
  projectedObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
//シャドウマップ用ポリゴン格納
function objectShadowMapSkinMeshPolygonPush(objects,bones,objectNumber,projectedObjects,viewMatrix){
  let projectedVerts = [];
  let object = objects[objectNumber];
  let mixMatrix = [];
  for (var i = 0; i < object.verts.length; i++) {
    mixMatrix = [0,0,0,0,
                  0,0,0,0,
                  0,0,0,0,
                  0,0,0,0];
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);
    for(let j=0;j<object.bonesIndex[i].length;j++){
      let bonesMatrix = bones[object.bonesIndex[i][j]].bone;
      let matrixWaight = object.bonesWaight[i][j];
      let waightMatrix = matWaight(bonesMatrix,matrixWaight);
      mixMatrix = matPlus(mixMatrix,waightMatrix); 
    }
    let verts = matVecMul(mixMatrix,object.verts[i])
    projectedVerts.push(matVecMul(viewMatrix,verts));     
    let projectionMatrix =  matPers(projectedVerts[i][2]);
    protMatVecMul(projectionMatrix,projectedVerts[i]);
    //projectedVerts[i] = matVecMul(viewPortMatrix,projectedVerts[i]);
    projectedVerts[i][0] = Math.floor((projectedVerts[i][0] + 0.5)*SCREEN_SIZE_W);
    projectedVerts[i][1] = Math.floor((projectedVerts[i][1] + 0.5)*SCREEN_SIZE_H);
  }
 
  let Poly = []
  for(let i=0;i<object.faceIndex.length;i++){
    let triangleFaceIndex = object.faceIndex[i]; 
    Poly.push(setShadowPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]]));
  }
  let tempMoveObject = new moveObject(object,mixMatrix,Poly);
  projectedObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
function makeSkinMeshBones(bonesJoinIndex,bones,bodys,masterXYZ,masterRotXYZ,masterScalingXYZ){
  let masterMatrix = matIdentity();
  mulMatTranslate(masterMatrix,masterXYZ[0],masterXYZ[1],masterXYZ[2]);  
  mulMatRotateX(masterMatrix,masterRotXYZ[0]);
  mulMatRotateY(masterMatrix,masterRotXYZ[1]);
  mulMatRotateZ(masterMatrix,masterRotXYZ[2]);
  mulMatScaling(masterMatrix,masterScalingXYZ[0],masterScalingXYZ[1],masterScalingXYZ[2]);

  let firstBoneMatrix = matIdentity();
  mulMatTranslate(firstBoneMatrix,bodys[0].centerObjX,bodys[0].centerObjY,bodys[0].centerObjZ);  
  mulMatRotateX(firstBoneMatrix,bodys[0].objRotX);
  mulMatRotateY(firstBoneMatrix,bodys[0].objRotY);
  mulMatRotateZ(firstBoneMatrix,bodys[0].objRotZ);
  mulMatScaling(firstBoneMatrix,bodys[0].scaleX,bodys[0].scaleY,bodys[0].scaleZ);
  //これが原点移動のボーンオフセット行列
  mulMatTranslate(firstBoneMatrix,-bodys[0].centerObjX,-bodys[0].centerObjY,-bodys[0].centerObjZ);  
  
  firstBoneMatrix = matMul(masterMatrix,firstBoneMatrix);
  bones.push(firstBoneMatrix);

  for(let boneNumber = 1;boneNumber<bodys.length;boneNumber++){
    let bonesMatrix = matIdentity();
    mulMatTranslate(bonesMatrix,bodys[boneNumber].centerObjX,bodys[boneNumber].centerObjY,bodys[boneNumber].centerObjZ);  
    mulMatRotateX(bonesMatrix,bodys[boneNumber].objRotX);
    mulMatRotateY(bonesMatrix,bodys[boneNumber].objRotY);
    mulMatRotateZ(bonesMatrix,bodys[boneNumber].objRotZ);
    mulMatScaling(bonesMatrix,bodys[boneNumber].scaleX,bodys[boneNumber].scaleY,bodys[boneNumber].scaleZ);
    mulMatTranslate(bonesMatrix,-bodys[boneNumber].centerObjX,-bodys[boneNumber].centerObjY,-bodys[boneNumber].centerObjZ);
    let mixBoneMatrix = matMul(bones[bonesJoinIndex[boneNumber-1]],bonesMatrix);
    bones.push(mixBoneMatrix);
  }
}
function skinmeshSPolygonAndShadowMapnPush(shadowProjectedObjects,projectedObjects,bodys,bones,sunViewMatrix,viewMatrix){
  for(let objectNumber = 0;objectNumber<bodys.length;objectNumber++){
    objectShadowMapSkinMeshPolygonPush(bodys,bones,objectNumber,shadowProjectedObjects,sunViewMatrix);
    objectSkinMeshPolygonPush(bodys,bones,objectNumber,projectedObjects,viewMatrix);
  }
}
//ボーンなし
function objectPolygonPush(objects,worldMatrix,objectNumber,projectedObjects,viewMatrix){
  let worldVerts = [];
  let projectedVerts = [];
  let object = objects[objectNumber];

  for (var i = 0; i < object.verts.length; i++) {
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);
    let verts = matVecMul(worldMatrix,object.verts[i])
    worldVerts.push(verts);
    projectedVerts.push(matVecMul(viewMatrix,verts));     
    let projectionMatrix =  matPers(projectedVerts[i][2]);
    protMatVecMul(projectionMatrix,projectedVerts[i]);
    //projectedVerts[i] = matVecMul(viewPortMatrix,projectedVerts[i]);
    projectedVerts[i][0] = Math.floor((projectedVerts[i][0] + 0.5)*SCREEN_SIZE_W);
    projectedVerts[i][1] = Math.floor((projectedVerts[i][1] + 0.5)*SCREEN_SIZE_H);
  }
 
  let Poly = []
  for(let i=0;i<object.faceIndex.length;i++){
    let triangleFaceIndex = object.faceIndex[i];
    let UV = [
          object.UV[i][0].u, object.UV[i][0].v,
          object.UV[i][1].u, object.UV[i][1].v,
          object.UV[i][2].u, object.UV[i][2].v,
          ]
    Poly.push(setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],UV,object.image));
  }

  let tempMoveObject = new moveObject(object,worldMatrix,Poly);
  projectedObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
//シャドウマップ用ポリゴン格納
function objectShadowMapPolygonPush(objects,worldMatrix,objectNumber,projectedObjects,viewMatrix){
  let projectedVerts = [];
  let object = objects[objectNumber];
  let worldViewMatrix = matMul(viewMatrix,worldMatrix);
  for (var i = 0; i < object.verts.length; i++) {
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);
    projectedVerts.push(matVecMul(worldViewMatrix,object.verts[i]));
    let projectionMatrix =  matPers(projectedVerts[i][2]);
    protMatVecMul(projectionMatrix,projectedVerts[i]);
    //projectedVerts[i] = matVecMul(viewPortMatrix,projectedVerts[i]);
    projectedVerts[i][0] = Math.floor((projectedVerts[i][0] + 0.5)*SCREEN_SIZE_W);
    projectedVerts[i][1] = Math.floor((projectedVerts[i][1] + 0.5)*SCREEN_SIZE_H);
  }
 
  let Poly = []
  for(let i=0;i<object.faceIndex.length;i++){
    let triangleFaceIndex = object.faceIndex[i]; 
    Poly.push(setShadowPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]]));
  }
  let tempMoveObject = new moveObject(object,worldMatrix,Poly);
  projectedObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
function renderbufferInit(buffer,pixelY,pixelX){
  for(let y=0;y<pixelY;y++){
    let pixelColumn = [];
    for(let x=0;x<pixelX;x++){
      let pixel = [];
      pixel.push({z:99999});
      pixelColumn.push(pixel);
    }
    buffer.push(pixelColumn);
  }
}
function makeSphereVerts(numCorners,radius){
  let sphereVerts = []

  let numRings = numCorners/2+1;
  let circleDeg = 360/numCorners;

  for(let j=0;j<numRings;j++){
    let r = Math.sin(circleDeg * j*Math.PI/180);
    let z = Math.cos(circleDeg * j*Math.PI/180);
    for(let i=0;i<numCorners;i++){
      let verts = [];
      let orginX = Math.sin(circleDeg * i*Math.PI/180) * r;
      let orginY = Math.cos(circleDeg * i*Math.PI/180) * r;
      let orginZ = z//1.0 - 2.0/(numRings-1)*j;//zを0.5刻みにする
      let vertsX = [orginX*radius];
      let vertsY = [orginY*radius];
      let vertsZ = [orginZ*radius];
      let verts1 = [1];
      verts.push(vertsX);
      verts.push(vertsY);
      verts.push(vertsZ);
      verts.push(verts1);

      sphereVerts.push(verts);
    }
  }
  return sphereVerts;
}

function AABBcollision(obj1,obj2){
  if(obj1 == obj2){
    return null;
  }else{
    return (obj1.minX <= obj2.maxX && obj1.maxX >= obj2.minX) &&
    (obj1.minY <= obj2.maxY && obj1.maxY >= obj2.minY) &&
    (obj1.minZ <= obj2.maxZ  && obj1.maxZ  >= obj2.minZ)
   }
}

function vertsCulAABBMaxMinCenter(orgObject,worldMatrix,offsetX,offsetY,offsetZ){

  let cubesSelectWorldMatrix = worldMatrix;
  let objectOrgVerts = [];
  for (var i = 0; i < orgObject.verts.length; i++) {
    objectOrgVerts[i] = matVecMul(cubesSelectWorldMatrix,orgObject.verts[i]);
   }
  let maxminCenterObject = [];
  
  let vertsX = [];
  let vertsY = [];
  let vertsZ = [];

  for(let i=0;i<orgObject.verts.length;i++){
    vertsX.push(objectOrgVerts[i][0]);
    vertsY.push(objectOrgVerts[i][1]);
    vertsZ.push(objectOrgVerts[i][2]);
  }
  let maxX = Math.max(...vertsX);
  let minX = Math.min(...vertsX);
  let maxY = Math.max(...vertsY);
  let minY = Math.min(...vertsY);
  let maxZ = Math.max(...vertsZ);
  let minZ = Math.min(...vertsZ);
  let centerX = vertsX.reduce((sum, element) => sum + element, 0)/orgObject.length;
  let centerY = vertsY.reduce((sum, element) => sum + element, 0)/orgObject.length;
  let centerZ = vertsZ.reduce((sum, element) => sum + element, 0)/orgObject.length;

  maxminCenterObject.maxX = maxX;
  maxminCenterObject.minX = minX;
  maxminCenterObject.maxY = maxY;
  maxminCenterObject.minY = minY;  
  maxminCenterObject.maxZ = maxZ;
  maxminCenterObject.minZ = minZ;
  maxminCenterObject.centerObjX = centerX;
  maxminCenterObject.centerObjY = centerY;
  maxminCenterObject.centerObjZ = centerZ;
  return maxminCenterObject;
}
//blenderLoad
let monkeys = [];
let monkeysImage = new Image();
monkeysImage.src = 'box.jpg';
let monkeyPixelImage = [];
let monkeyLoad = [];
let monkeyLoad1 = [];
monkeysImage.addEventListener("load", function() {
	monkeyPixelImage = pictureToPixelMap(backCtx,monkeysImage);
	let monkeyVerts = {};
  monkeyVerts.vertsPosition = [];
	monkeys.push(new Object(monkeyVerts,0.0,-0.6,0,180,0,0,0.5,0.5,0.5,0,false,true,monkeyPixelImage));
	monkeyLoad.push(new ModelLoadData(monkeys[0]));
	monkeyLoad[0].JSONLoader("cube.json", (() => monkeyLoad[0].onJSONLoaded()));	
}, true);	
//sky
let sphereVerts8 = makeSphereVerts(16,10);
let spheres = [];
let skyImage = new Image();
skyImage.src = 'sky.jpg';

let skyPixelImage = [];

skyImage.addEventListener("load", function() {
	skyPixelImage = pictureToPixelMap(backCtx,skyImage);
	//spheres.push(new Object(sphereVerts8,0.0,0.0,5,0,0,0,16,true,false,skyPixelImage));
}, true);

//box
let cubes = [];
let cubeImage = new Image();
cubeImage.src = 'box.jpg';

let cubePixelImage = [];

let planeFaceIndex = [];
//上面
planeFaceIndex.push(setFaceIndex(4,5,0));
planeFaceIndex.push(setFaceIndex(1,0,5));

let bodys = [];
let bodys1 = [];

//一番下は-0.27から積み重ねる場合+0.5,-0.27
cubeImage.addEventListener("load", function() {
	cubePixelImage = pictureToPixelMap(backCtx,cubeImage);
  //waist
	bodys.push(new Object(waistVerts,0,-1.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //RightLeg1Verts
	bodys.push(new Object(RightLeg1Verts,0,-1,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //RightLeg2Verts
	bodys.push(new Object(RightLeg2Verts,0,-0.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //LeftLeg1Verts
	bodys.push(new Object(LeftLeg1Verts,0,-1,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //LeftLeg2Verts
	bodys.push(new Object(LeftLeg2Verts,0,-0.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));

  //spine
	bodys.push(new Object(spineVerts,0,-1.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //rightArm1
  bodys.push(new Object(rightArm1Verts,-0.25,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //rightArm2
  bodys.push(new Object(rightArm2Verts,-0.75,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //leftArm1
  bodys.push(new Object(leftArm1Verts,0.25,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //leftArm2
  bodys.push(new Object(leftArm2Verts,0.75,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //head
	bodys.push(new Object(headVerts,0,-2,0,0,0,0,1,1,1,0,false,true,cubePixelImage));

    //waist
	bodys1.push(new Object(waistVerts,0,-1.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //RightLeg1Verts
	bodys1.push(new Object(RightLeg1Verts,0,-1,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //RightLeg2Verts
	bodys1.push(new Object(RightLeg2Verts,0,-0.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //LeftLeg1Verts
	bodys1.push(new Object(LeftLeg1Verts,0,-1,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //LeftLeg2Verts
	bodys1.push(new Object(LeftLeg2Verts,0,-0.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));

  //spine
	bodys1.push(new Object(spineVerts,0,-1.5,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //rightArm1
  bodys1.push(new Object(rightArm1Verts,-0.25,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //rightArm2
  bodys1.push(new Object(rightArm2Verts,-0.75,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //leftArm1
  bodys1.push(new Object(leftArm1Verts,0.25,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //leftArm2
  bodys1.push(new Object(leftArm2Verts,0.75,-1.92,0,0,0,0,1,1,1,0,false,true,cubePixelImage));
  //head
	bodys1.push(new Object(headVerts,0,-2,0,0,0,0,1,1,1,0,false,true,cubePixelImage));

	//cubes.push(new Object(orgCubeVerts,0.6,-0.90,1,0,0,0,1,1,1,0,false,true,cubePixelImage));
  cubes.push(new Object(orgCubeVerts,0.5,-1.35,0.5,0,0,0,1,1,1,0,false,true,cubePixelImage));
	cubes.push(new Object(orgCubeVerts,-0.5,-1.35,1,0,0,0,1,1,1,0,false,true,cubePixelImage));
}, true);

//dice
let dices = [];
let diceImage = new Image();
diceImage.src = "steve.png";
let dicePixelImage = [];
diceImage.addEventListener("load", function() {
  dicePixelImage = pictureToPixelMap(backCtx,diceImage);
  dices.push(new Object(orgCubeVerts,0.0,0,0,0,0,0,1,1,1,0,false,true,dicePixelImage));

},true);
let tempDiceUV = [
  [{"u":0.625,"v":0.5},{"u":0.625,"v":0.75},{"u":0.875,"v":0.5}],
  [{"u":0.375,"v":0.75},{"u":0.375,"v":1},{"u":0.625,"v":0.75}],
  [{"u":0.375,"v":0},{"u":0.375,"v":0.25},{"u":0.625,"v":0}],
  [{"u":0.125,"v":0.5},{"u":0.125,"v":0.75},{"u":0.375,"v":0.5}],
  [{"u":0.375,"v":0.5},{"u":0.375,"v":0.75},{"u":0.625,"v":0.5}],
  [{"u":0.375,"v":0.25},{"u":0.375,"v":0.5},{"u":0.625,"v":0.25}],
  [{"u":0.625,"v":0.75},{"u":0.875,"v":0.75},{"u":0.875,"v":0.5}],
  [{"u":0.375,"v":1},{"u":0.625,"v":1},{"u":0.625,"v":0.75}],
  [{"u":0.375,"v":0.25},{"u":0.625,"v":0.25},{"u":0.625,"v":0}],
  [{"u":0.125,"v":0.75},{"u":0.375,"v":0.75},{"u":0.375,"v":0.5}],
  [{"u":0.375,"v":0.75},{"u":0.625,"v":0.75},{"u":0.625,"v":0.5}],
  [{"u":0.375,"v":0.5},{"u":0.625,"v":0.5},{"u":0.625,"v":0.25}],
];

let diceUV = [];
for(let i=0;i<tempDiceUV.length;i++){
  let readUV = tempDiceUV[i];
  let uv = []
  for(let j=0;j<readUV.length;j++){
    let u = readUV[j].u;
    let v = readUV[j].v;
    u = (u < 0) ? 1 + u : u;
    v = (v < 0) ? v * -1 : 1 - v;
    uv.push({"u":u,"v":v});
  }
  diceUV.push(uv);
}
//ground
let planes = [];
let roadImage = new Image();
roadImage.src = 'road.png';

let roadPixelImage = [];

roadImage.addEventListener("load", function() {
	roadPixelImage = pictureToPixelMap(backCtx,roadImage);
  planes.push(new Object(orgPlaneVerts,0,0,0.0,0,0,0,2.5,1,3,0,false,false,roadPixelImage));
  planes.push(new Object(orgPlaneVerts,0,0,1.5,0,0,0,2.5,1,3,0,false,false,roadPixelImage));
  planes.push(new Object(orgPlaneVerts,0,0,3.0,0,0,0,2.5,1,3,0,false,false,roadPixelImage));

}, true);

let groundImage = new Image();
groundImage.src = 'sand.jpg';

let sandPixelImage = [];

groundImage.addEventListener("load", function() {
	sandPixelImage = pictureToPixelMap(backCtx,groundImage);
  planes.push(new Object(orgPlaneVerts,-1.25,0,0.0,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,-1.25,0,1.5,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,-1.25,0,3.0,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,0.0,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,1.5,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
  planes.push(new Object(orgPlaneVerts,1.25,0,3.0,0,0,0,2.5,1,3,0,false,false,sandPixelImage));
}, true);

let diceBoneIndex = [[0,1], [0,1],[0,1], [0 ,1],[0,1],[0,1],[0,1],[0,1],[0 ,1],[0,1],[0,1],[0,1]];
//mulMatRotateZ(inversebind1,45)
let rot = 0;
let rotPlus = 5;

const gravity = 0.01;
let theta = 0;

let dataLoad = false;
let skyPixelImageLoad = false;
let cubePixelImageLoad = false;
let roadPixelImageLoad = false;
let sandPixelImageLoad = false;
let dicePixelImageLoad = false;
let steveLoad = false;

var mainLoopId = setInterval(function(){
//dataLoad
if(dataLoad == false){
  if(skyPixelImage.length != 0 && skyPixelImageLoad == false){
    skyPixelImageLoad = true;
  }
  if(cubePixelImage.length != 0 && cubePixelImageLoad == false){
    cubePixelImageLoad = true;
  }
  if(roadPixelImage.length != 0 && roadPixelImageLoad == false){
    roadPixelImageLoad = true;
  }
  if(sandPixelImage.length != 0 && sandPixelImageLoad == false){
    sandPixelImageLoad = true;
  }
  if(dicePixelImage.length != 0 && dicePixelImageLoad == false){
    dicePixelImageLoad = true;
  }
  if(dicePixelImageLoad == true && steveLoadPack.daeLoad == true && steveLoad == false){
    dices[0].verts = steveLoadPack.meshVerts;
    dices[0].faceIndex = steveLoadPack.meshVertsIndex;
    dices[0].UV = steveLoadPack.meshUV;
    dices[0].bonesWaight = steveLoadPack.bonesWeight;
    dices[0].bonesIndex =  steveLoadPack.blendBoneIndex;
    steveLoad = true;
  }
  if(skyPixelImageLoad && cubePixelImageLoad && roadPixelImageLoad && sandPixelImageLoad && dicePixelImageLoad && steveLoad){
    dataLoad = true;
  }
  ctx.font = '50pt Arial';
  ctx.fillStyle = 'rgba(0, 0, 255)';
  ctx.fillText("now loding", SCREEN_SIZE_W/2, SCREEN_SIZE_H/2);
  return;
}

let newDate = new Date();
let newsecond = newDate.getMilliseconds();
//lookat = setVector3(shadowProjectedObjects[lookatIndex].orgObject.centerObjX,shadowProjectedObjects[lookatIndex].orgObject.centerObjY,shadowProjectedObjects[lookatIndex].orgObject.centerObjZ);
  viewMatrix = matIdentity();
  matCamera(viewMatrix,cameraPos,lookat,up);
  matRound4X4(viewMatrix);

  inverseViewMatrix = matIdentity();
  CalInvMat4x4(viewMatrix,inverseViewMatrix);
  matRound4X4(inverseViewMatrix);

  sunViewMatrix = matIdentity();
  matCamera(sunViewMatrix,sunPos,sunLookat,up);
  matRound4X4(sunViewMatrix);

  //シャドウの投影後の情報格納
  let shadowProjectedObjects = [];
  //投影後の情報格納
  let projectedObjects = [];

if(rot>80){
  rotPlus = -15;
}else if(rot<0){
  rotPlus = 15;
}
rot += rotPlus;

/*
mulMatRotateZ(bones[steveLoadPack.boneParentRelation[0][2]].copyInverseBindPose,0);
bones[steveLoadPack.boneParentRelation[0][2]].bone = matMul(bones[steveLoadPack.boneParentRelation[0][2]].copyInverseBindPose,bones[steveLoadPack.boneParentRelation[0][2]].bindPose);
//bones[0].copyInverseBindPose = bones[0].inverseBindPose.concat();
dicebones.push(bones[steveLoadPack.boneParentRelation[0][2]].bone);  

if(bones[steveLoadPack.boneParentRelation[0][1]].parentCrossBone  == null){
  bones[steveLoadPack.boneParentRelation[0][1]].parentCrossBone = matMul(bones[steveLoadPack.boneParentRelation[0][2]].bone,bones[steveLoadPack.boneParentRelation[0][1]].inverseBindPose);
  bones[steveLoadPack.boneParentRelation[0][1]].copyParentCrossBone = bones[steveLoadPack.boneParentRelation[0][1]].parentCrossBone.concat();
}
mulMatRotateZ(bones[steveLoadPack.boneParentRelation[0][1]].copyParentCrossBone,0);
bones[steveLoadPack.boneParentRelation[0][1]].bone = matMul(bones[steveLoadPack.boneParentRelation[0][1]].copyParentCrossBone,bones[steveLoadPack.boneParentRelation[0][1]].bindPose);
bones[steveLoadPack.boneParentRelation[0][1]].copyParentCrossBone = bones[steveLoadPack.boneParentRelation[0][1]].parentCrossBone.concat();
dicebones.push(bones[steveLoadPack.boneParentRelation[0][1]].bone);
*/

let diceBones = [];
//bonesInit
for(let i=0;i<steveLoadPack.bonesNameList.length;i++){
  let boneContents = {};
  boneContents.rotXYZ = setVector3(0,0,0);
  diceBones.push(boneContents);
}
diceBones[4].rotXYZ = setVector3(0,0,rot);
diceBones[6].rotXYZ = setVector3(0,0,-1*rot);

diceBones[8].rotXYZ = setVector3(0,0,-1*rot);
diceBones[10].rotXYZ = setVector3(0,0,rot);

diceBones[11].rotXYZ = setVector3(-1* rot,0,0);
diceBones[12].rotXYZ = setVector3(rot,0,0);

//makeBones
for(let j=0;j<steveLoadPack.boneParentRelation.length;j++){
  for(let i=steveLoadPack.boneParentRelation[j].length-1;i>=0;i--){
    //ルートボーン
    if(i == steveLoadPack.boneParentRelation[j].length-1){
      if(diceBones[steveLoadPack.boneParentRelation[j][i]].bone == undefined){
        mulMatRotateX(steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].copyInverseBindPose,diceBones[steveLoadPack.boneParentRelation[j][i]].rotXYZ[0]);
        mulMatRotateY(steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].copyInverseBindPose,diceBones[steveLoadPack.boneParentRelation[j][i]].rotXYZ[1]);
        mulMatRotateZ(steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].copyInverseBindPose,diceBones[steveLoadPack.boneParentRelation[j][i]].rotXYZ[2]);
        diceBones[steveLoadPack.boneParentRelation[j][i]].bone = matMul(steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].copyInverseBindPose,steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].bindPose);
        steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].copyInverseBindPose = steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].inverseBindPose.concat();
      }
    }else{
     if(diceBones[steveLoadPack.boneParentRelation[j][i]].parentCrossBone  == undefined){
        diceBones[steveLoadPack.boneParentRelation[j][i]].parentCrossBone = matMul(diceBones[steveLoadPack.boneParentRelation[j][i+1]].bone,steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].inverseBindPose);
        diceBones[steveLoadPack.boneParentRelation[j][i]].copyParentCrossBone = diceBones[steveLoadPack.boneParentRelation[j][i]].parentCrossBone.concat();
        mulMatRotateX(diceBones[steveLoadPack.boneParentRelation[j][i]].copyParentCrossBone,diceBones[steveLoadPack.boneParentRelation[j][i]].rotXYZ[0]);
        mulMatRotateY(diceBones[steveLoadPack.boneParentRelation[j][i]].copyParentCrossBone,diceBones[steveLoadPack.boneParentRelation[j][i]].rotXYZ[1]);
        mulMatRotateZ(diceBones[steveLoadPack.boneParentRelation[j][i]].copyParentCrossBone,diceBones[steveLoadPack.boneParentRelation[j][i]].rotXYZ[2]);
        diceBones[steveLoadPack.boneParentRelation[j][i]].bone = matMul(diceBones[steveLoadPack.boneParentRelation[j][i]].copyParentCrossBone,steveLoadPack.bindPosePack[steveLoadPack.boneParentRelation[j][i]].bindPose);
        diceBones[steveLoadPack.boneParentRelation[j][i]].copyParentCrossBone = diceBones[steveLoadPack.boneParentRelation[j][i]].parentCrossBone.concat();
      }
    } 
  }
}
  //sphereregister
  /*
  for(let num =0;num<spheres.length;num++){
    let sphere = spheres[num];
   
    if(moveSphereInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    
    let Poly = [];
    for(let i= 0;i<sphere.numCorners*sphere.numCorners/2;i++){
    let  j = i + sphere.numCorners;
    let p = i+sphere.numCorners+1; 
    if(p % sphere.numCorners == 0) p -= sphere.numCorners;
    let k = i + 1;
    if(k % sphere.numCorners == 0) k -= sphere.numCorners;
    let upUV = [
       0, 0,
       1, 0,
       0, 1
      ]
    let downUV = [
       0, 1,
       1, 1,
       1, 0
      ]
      Poly.push(new Polygon(moveSphereInfo[i],moveSphereInfo[j],moveSphereInfo[k],upUV,moveSphereInfo.image));
    //    Polygones.push(new Polygon(spheres[num].dotMovePos[i],spheres[num].dotMovePos[j],spheres[num].dotMovePos[p],spheres[num].dotMovePos[k],4,sphereImage));
      Poly.push(new Polygon(moveSphereInfo[j],moveSphereInfo[p],moveSphereInfo[k],downUV,moveSphereInfo.image));
    }
    let movesphere = new moveObject(moveSphereInfo,Poly);
    shadowProjectedObjects.push(movesphere);
  }*/
	//blender2.7xjsonload
  /*
	for(let num=0;num<monkeys.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,monkeys[num].centerObjX,monkeys[num].centerObjY,monkeys[num].centerObjZ);  
    mulMatRotateX(worldMatrix,monkeys[num].objRotX);
    mulMatRotateY(worldMatrix,monkeys[num].objRotY);
    mulMatRotateZ(worldMatrix,monkeys[num].objRotZ); 
    mulMatScaling(worldMatrix,monkeys[num].scaleX,monkeys[num].scaleY,monkeys[num].scaleZ);
    //objectShadowMapPolygonPush(monkeys,worldMatrix,num,shadowProjectedObjects,sunViewMatrix);
    //objectPolygonPush(monkeys,worldMatrix,num,projectedObjects,viewMatrix);	
  }*/
  
  let s = Math.sin(theta);
  let ns = s<0 ? -s : s;
  bodys[1].objRotX =  Math.floor(60 * s);
  bodys[2].objRotX =  Math.floor(-60 * s);

  bodys[3].objRotX =  Math.floor(-60 * s);
  bodys[4].objRotX =  Math.floor(60 * s);

  bodys[5].objRotX =  Math.floor(60 * ns);

  bodys[6].objRotY =  Math.floor(-60 * s);
  bodys[7].objRotY =  Math.floor(-60 * s);

  bodys[8].objRotY =  Math.floor(-60 * s);
  bodys[9].objRotY =  Math.floor(-60 * s);

  bodys[10].objRotX =  Math.floor(60 * ns);

  bodys1[1].objRotX =  Math.floor(-60 * s);
  bodys1[2].objRotX =  Math.floor(60 * s);

  bodys1[3].objRotX =  Math.floor(60 * s);
  bodys1[4].objRotX =  Math.floor(-60 * s);

  bodys1[5].objRotX =  Math.floor(60 * ns);

  bodys1[6].objRotY =  Math.floor(-60 * s);
  bodys1[7].objRotY =  Math.floor(-60 * s);

  bodys1[8].objRotY =  Math.floor(60 * s);
  bodys1[9].objRotY =  Math.floor(60 * s);

  bodys1[10].objRotX =  Math.floor(-60 * ns);

  //bodys[0].objRotZ += 10;
  theta += 0.4;
  if(theta >=2000){
    theta = 0;
  }

  let masterXYZ = setVector3(1,-0.2,0);
  let masterRotXYZ = setVector3(0,0,0);
  let masterScalingXYZ = setVector3(0.7,0.7,0.7);
  let boxHumanBones = [];
   //親のボーンにアクセス
  //rightLeg,leftLeg,spain,rightArm,leftArm,head
  let bonesJoinIndex = [0,1, 0,3, 0, 5,6, 5,8, 5];

  //makeSkinMeshBones(bonesJoinIndex,boxHumanBones,bodys,masterXYZ,masterRotXYZ,masterScalingXYZ);

  //skinmeshSPolygonAndShadowMapnPush(shadowProjectedObjects,projectedObjects,bodys,boxHumanBones,sunViewMatrix,viewMatrix);

  masterXYZ = setVector3(-1,-0.2,0);

  let boxHuman1Bones = [];

  
  //makeSkinMeshBones(bonesJoinIndex,boxHuman1Bones,bodys1,masterXYZ,masterRotXYZ,masterScalingXYZ);

  //skinmeshSPolygonAndShadowMapnPush(shadowProjectedObjects,projectedObjects,bodys1,boxHuman1Bones,sunViewMatrix,viewMatrix);

	//cuberegister
	for(let num=0;num<cubes.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,cubes[num].centerObjX,cubes[num].centerObjY,cubes[num].centerObjZ);  
    mulMatRotateX(worldMatrix,cubes[num].objRotX);
    mulMatRotateY(worldMatrix,cubes[num].objRotY);
    mulMatRotateZ(worldMatrix,cubes[num].objRotZ); 
    mulMatScaling(worldMatrix,cubes[num].scaleX,cubes[num].scaleY,cubes[num].scaleZ);
    objectShadowMapPolygonPush(cubes,worldMatrix,num,shadowProjectedObjects,sunViewMatrix);
    objectPolygonPush(cubes,worldMatrix,num,projectedObjects,viewMatrix);
	}
  //dice
  for(let num=0;num<dices.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,dices[num].centerObjX,dices[num].centerObjY,dices[num].centerObjZ);  
    mulMatRotateX(worldMatrix,dices[num].objRotX);
    mulMatRotateY(worldMatrix,dices[num].objRotY);
    mulMatRotateZ(worldMatrix,dices[num].objRotZ); 
    mulMatScaling(worldMatrix,dices[num].scaleX,dices[num].scaleY,dices[num].scaleZ);
    objectShadowMapSkinMeshPolygonPush(dices,diceBones,num,shadowProjectedObjects,sunViewMatrix);
    //objectShadowMapPolygonPush(dices,worldMatrix,num,shadowProjectedObjects,sunViewMatrix);
    //objectPolygonPush(dices,worldMatrix,num,projectedObjects,viewMatrix);
    objectSkinMeshPolygonPush(dices,diceBones,num,projectedObjects,viewMatrix);
	}
	//planesregister
	for(let num=0;num<planes.length;num++){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,planes[num].centerObjX,planes[num].centerObjY,planes[num].centerObjZ);  
    mulMatRotateX(worldMatrix,planes[num].objRotX);
    mulMatRotateY(worldMatrix,planes[num].objRotY);
    mulMatRotateZ(worldMatrix,planes[num].objRotZ); 
    mulMatScaling(worldMatrix,planes[num].scaleX,planes[num].scaleY,planes[num].scaleZ);
    objectShadowMapPolygonPush(planes,worldMatrix,num,shadowProjectedObjects,sunViewMatrix);
    objectPolygonPush(planes,worldMatrix,num,projectedObjects,viewMatrix);
  }
  
  /*
  lookat = setVector3(shadowProjectedObjects[lookatIndex].orgObject.centerObjX,shadowProjectedObjects[lookatIndex].orgObject.centerObjY,shadowProjectedObjects[lookatIndex].orgObject.centerObjZ);
  for(let i = spheres.length;i<spheres.length+monkeys.length+cubes.length;i++){
  	let currentObject = shadowProjectedObjects[i];
  	let currentMaxMinCenter = vertsCulAABBMaxMinCenter(currentObject.orgObject,currentObject.worldMatrix,0,gravity,0);
  	for(let j = spheres.length;j<spheres.length+monkeys.length+cubes.length+planes.length;j++){
  		let gravityUnderMaxMinCenter = vertsCulAABBMaxMinCenter(shadowProjectedObjects[j].orgObject,shadowProjectedObjects[j].worldMatrix,0,0,0);
  	  if(AABBcollision(currentMaxMinCenter,gravityUnderMaxMinCenter) == true && (currentObject.orgObject.centerObjY<shadowProjectedObjects[j].orgObject.centerObjY)){
        currentObject.gravityCollision = true;
        break;
	    }
	  }
  }
  for(let i = spheres.length;i<spheres.length+monkeys.length+cubes.length;i++){
  	if(shadowProjectedObjects[i].gravityCollision == false){
  		shadowProjectedObjects[i].orgObject.centerObjY += gravity;
  	}
  }*/
let shadowMap = [];
renderbufferInit(shadowMap,SCREEN_SIZE_H,SCREEN_SIZE_W);
for(let j=0;j<shadowProjectedObjects.length;j++){
	for(let i=0;i<shadowProjectedObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(shadowProjectedObjects[j].orgObject.backCullingFlag == true){
	    if(shadowProjectedObjects[j].polygonList[i].crossZ<0){
        let image = null;
        let crossWorldVector3 = null;
        let UV = null;
       triangleToBuffer(shadowMap,null,1,image,shadowProjectedObjects[j].polygonList[i].moveVertices,crossWorldVector3,UV);
        } 
	  }else{
      let image = null;
      let crossWorldVector3 = null;
      let UV = null;
     triangleToBuffer(shadowMap,null,1,image,shadowProjectedObjects[j].polygonList[i].moveVertices,crossWorldVector3,UV);
	  }
	}
}
let zBuffering = [];
renderbufferInit(zBuffering,SCREEN_SIZE_H,SCREEN_SIZE_W);
for(let j=0;j<projectedObjects.length;j++){
	for(let i=0;i<projectedObjects[j].polygonNum;i++){
	  //-の方がこちらに近くなる座標軸だから
	  if(projectedObjects[j].orgObject.backCullingFlag == true){
	    if(projectedObjects[j].polygonList[i].crossZ<0){
        triangleToBuffer(zBuffering,shadowMap,1,projectedObjects[j].polygonList[i].image,projectedObjects[j].polygonList[i].moveVertices,projectedObjects[j].polygonList[i].crossWorldVector3,
          [
            projectedObjects[j].polygonList[i].UV[0], projectedObjects[j].polygonList[i].UV[1],
            projectedObjects[j].polygonList[i].UV[2], projectedObjects[j].polygonList[i].UV[3],
            projectedObjects[j].polygonList[i].UV[4], projectedObjects[j].polygonList[i].UV[5]
          ]
           );
	    } 
	  }else{
      triangleToBuffer(zBuffering,shadowMap,1,projectedObjects[j].polygonList[i].image,projectedObjects[j].polygonList[i].moveVertices,projectedObjects[j].polygonList[i].crossWorldVector3,
        [
          projectedObjects[j].polygonList[i].UV[0], projectedObjects[j].polygonList[i].UV[1],
          projectedObjects[j].polygonList[i].UV[2], projectedObjects[j].polygonList[i].UV[3],
          projectedObjects[j].polygonList[i].UV[4], projectedObjects[j].polygonList[i].UV[5]
        ]
         );
	  }
	}
}
var myImageData = ctx.createImageData(SCREEN_SIZE_W, SCREEN_SIZE_H);

//レンダリングZバッファ作画
//ライトシミュレーション
for(let j=0;j<SCREEN_SIZE_H;j++){
	for(let i=0;i<SCREEN_SIZE_W;i++){
	let base = (j * SCREEN_SIZE_W + i) * 4;
		if(zBuffering[j][i][0].z < 99999){
      let getPixel = zBuffering[j][i][0];
      let sunVec = culVecNormalize(vecMinus(sunPos,sunLookat));
      let sunCosin = culVecDot(sunVec,zBuffering[j][i][0].crossWorldVector3);
      getPixel.r = getPixel.r*sunCosin*1.2;
      getPixel.g = getPixel.g*sunCosin*1.2;
      getPixel.b = getPixel.b*sunCosin*1.2;
    }
  }
}
for(let j=0;j<SCREEN_SIZE_H;j++){
	for(let i=0;i<SCREEN_SIZE_W;i++){
	let base = (j * SCREEN_SIZE_W + i) * 4;
		if(zBuffering[j][i][0].z < 99999){
      let getPixel = zBuffering[j][i][0];
          //シャドウマップ
      		//camera
					let pixelVector3 = setVector3(i,j,getPixel.z);
					//pixelVector3 = matVecMul(inverseViewPortMatrix,pixelVector3);
					pixelVector3[0] = pixelVector3[0]/SCREEN_SIZE_W  - 0.5;
					pixelVector3[1] = pixelVector3[1]/SCREEN_SIZE_H  - 0.5;
					//let projectionMatrix = matPers(pixelVector3[2]);
					//let inverseProjectionMatrix = matIdentity();
					//CalInvMat4x4(projectionMatrix,inverseProjectionMatrix);
					//getInverseMatrix(projectionMatrix);
					//pixelVector3 = matVecMul(inverseProjectionMatrix,pixelVector3);
					pixelVector3[0] *= pixelVector3[2];
					pixelVector3[1] *= pixelVector3[2];
					protMatVecMul(inverseViewMatrix,pixelVector3);
					//view
					protMatVecMul(sunViewMatrix,pixelVector3);
					//projectionMatrix = matPers(pixelVector3[2]);
					//pixelVector3 = matVecMul(projectionMatrix,pixelVector3);
					pixelVector3[0] /= pixelVector3[2];
					pixelVector3[1] /= pixelVector3[2];
					pixelVector3[0] = Math.floor((pixelVector3[0]  + 0.5)*SCREEN_SIZE_W);
					pixelVector3[1] = Math.floor((pixelVector3[1]  + 0.5)*SCREEN_SIZE_H);
					//pixelVector3 = matVecMul(viewPortMatrix,pixelVector3);
					//pixelVector3[0] = Math.floor(pixelVector3[0] + 0.5);
					//pixelVector3[1] = Math.floor(pixelVector3[1] + 0.5);
					if(pixelVector3[0]>0 && pixelVector3[0]<SCREEN_SIZE_W){
						if(pixelVector3[1]>0 && pixelVector3[1]<SCREEN_SIZE_H){
							if(shadowMap[pixelVector3[1]][pixelVector3[0]][0].z+0.2<pixelVector3[2]){
								getPixel.r = getPixel.r/2.2;
								getPixel.g = getPixel.g/2.2;
								getPixel.b = getPixel.b/2.2;	
              }
						}
					}
      //let getPixel = renderZBuffer[j][i].get();
			myImageData.data[base + 0] = getPixel.r;  // Red
		    myImageData.data[base + 1] = getPixel.g;  // Green
		    myImageData.data[base + 2] = getPixel.b  // Blue
		    myImageData.data[base + 3] = 255 * getPixel.a; // Alpha
		//dotPaint(j,i,getPixel.r,getPixel.g,getPixel.b,getPixel.a,ctx);    
		}else{
			//何もないところは黒
			//dotPaint(j,i,0,0,0,255,ctx);
			myImageData.data[base + 0] =0;  // Red
		    myImageData.data[base + 1] = 0;  // Green
		    myImageData.data[base + 2] = 0  // Blue
		    myImageData.data[base + 3] = 255; // Alpha
		}
	}
}
newDate = new Date();
let aftersecond = newDate.getMilliseconds();
let result = aftersecond - newsecond;
//console.log(result);
ctx.putImageData(myImageData, 0, 0);

}, 1000/60);

document.addEventListener('keydown',e => {

  switch(e.key){
    case 'ArrowLeft':
      cameraPos[0] -= 0.1;
      break;
    case 'ArrowRight':
      cameraPos[0]  += 0.1;
      break;
    case 'ArrowUp': 
      cameraPos[1]  -= 0.1;
      break;
    case 'ArrowDown':
      cameraPos[1]  += 0.1;
      break;
    case 'u':
      cameraPos[2]  += 0.1;
      break;   
    case 'd':
      cameraPos[2]  -= 0.1;
      break;
    case '1':
      lookatIndex += 1;
      if(lookatIndex>1){
        lookatIndex = 0
      }
      break;
    case '2':

      break;
    case '3':

      break;
    case '4':
 
      break;
    case '5':

      break;
    case '6':

      break;
    case 'a':
      break;
  }
});

function drawPolygon(Polygon) {
    if (Polygon.moveVertices[0][2] > 0.5 && Polygon.moveVertices[1][2] > 0.5 && Polygon.moveVertices[2][2] > 0.5) {
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.moveTo(Polygon.moveVertices[0][0],(Polygon.moveVertices[0][1]));
      ctx.lineTo(Polygon.moveVertices[1][0],(Polygon.moveVertices[1][1]));
      ctx.lineTo(Polygon.moveVertices[2][0],(Polygon.moveVertices[2][1]));
      ctx.closePath();

      ctx.fill();
    }
}