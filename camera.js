//頂点にクラスを使うと重たくなる頂点演算のせい？
//javascriptのクラス、関数を使うと重くなりがち、いっそ自分で作れるものは作る。Ｃ言語みたいになってくる。
import {setVector2,setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize, round, roundVector2} from './vector.js';
import {matIdentity,mulMatTranslate,mulMatScaling, matMul,matVecMul,matPers,matCamera,mulMatRotateX,mulMatRotatePointX,mulMatRotateY,mulMatRotatePointY,mulMatRotateZ,mulMatRotatePointZ,getInverseMatrix, matRound4X4, protMatVecMul, CalInvMat4x4, matWaight, matPlus, matCopy, getInvert2} from './matrix.js';
import {waistVerts,spineVerts,headVerts,orgPlaneVerts, orgCubeVerts, RightLeg1Verts, RightLeg2Verts, LeftLeg1Verts, LeftLeg2Verts, rightArm1Verts, rightArm2Verts, leftArm1Verts, leftArm2Verts} from './orgverts.js';
import {setPixel,renderBuffer,pixel,bufferPixelInit,bufferInit,pictureToPixelMap,dotPaint,dotLineBufferRegister,triangleRasterize,textureTransform,triangleToBuffer,sort_index,branch, triangleToShadowBuffer, vertsCopy} from './paint.js';
import { cross_Z, pixel_B, pixel_Cross_World_Vector3, pixel_G, pixel_R, pixel_Z,poly_Cross_World_Vector3, position_X, position_Y, position_Z, projected_Verts, rot_X, rot_Y, rot_Z, scale_X, scale_Y, scale_Z, obj_Image, poly_List,obj_backCulling_Flag, UV_Vector } from './enum.js';
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
        tempResult.push(bonesNameList[index][1]);
        let length = currentElement.children.length;
        getAllChildNodesDepth(length,currentElement.children,tempResult,result,bonesNameList);
        boneHit = true;
        tempResult.pop();
      }
    }
  }
  //leafNoBone
  if(boneHit == false){
    result.push(tempResult.slice(0,tempResult.length));
    return;
  }
}

let steve1LoadPack = {};
let steve2LoadPack = {};
let cube1LoadPack = {};

daeLoader("dice3.dae",steve1LoadPack);
daeLoader("dice3.dae",steve2LoadPack);
daeLoader("cube.dae",cube1LoadPack);

function daeLoader(fileName,daeLoadPack){
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", fileName);
  xmlhttp.send();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        //let elem = document.getElementById("asset");

        //elem.innerHTML += "----- getElementsByTagName -----<br/>";
        let docelem = xmlhttp.responseXML.documentElement;
        //mesh
        let meshData = docelem.getElementsByTagName("mesh");
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
                let tempInt = parseFloat(char);
                //vertsを丸める。影響のない小数点は切り捨てる。
                tempInt = round(tempInt);
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
        let meshVertsFaceIndex = [];
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
                    meshVertsFaceIndex.push(tempVertsIndex);
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
        daeLoadPack.meshVertsFaceIndex = meshVertsFaceIndex;
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
        let faceIndexMeshUV = [];
        let meshVertsFaceIndex_Length = meshVertsFaceIndex.length;
        for(let i=0;i<meshVertsFaceIndex_Length;i++){
          let tempMeshUV = [
                meshUV[i][0].u, meshUV[i][0].v,
                meshUV[i][1].u, meshUV[i][1].v,
                meshUV[i][2].u, meshUV[i][2].v,
                ]
          faceIndexMeshUV.push(tempMeshUV);
        }
        daeLoadPack.faceIndexMeshUV = faceIndexMeshUV;
        //armature
        let armatures = docelem.getElementsByTagName("library_controllers");
        if(armatures.length != 0){
          daeLoadPack.armatures = true;
          //boneNameList
          let boneName = docelem.getElementsByTagName("Name_array");
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
                  boneContents.bindPose = tempBind;
                  boneContents.inverseBindPose = CalInvMat4x4(tempBind);;
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
          let boneJointList = docelem.getElementsByTagName("node");
          let  tempResult = [];
          let boneParentRelation = [];
          getAllChildNodesDepth(boneJointList[0].children.length, boneJointList[0].children,tempResult,boneParentRelation,bonesNameList);
          console.log(boneParentRelation);
          daeLoadPack.boneParentRelation = boneParentRelation;

          //bonesInit
          let bones = [];
          for(let i in daeLoadPack.bonesNameList){
            let boneContents = {};
            boneContents.skinmeshBone = null;
            boneContents.position = setVector3(0,0,0);
            boneContents.rotXYZ = setVector3(0,0,0);
            boneContents.scaleXYZ = setVector3(1,1,1);
            bones.push(boneContents);
          }
          daeLoadPack.bones = bones;
        }else{
          let boneContents = {};
          boneContents.position = setVector3(0,0,0);
          boneContents.rotXYZ = setVector3(0,0,0);
          boneContents.scaleXYZ = setVector3(1,1,1);
          daeLoadPack.bones = boneContents;
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
let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");
c.width = SCREEN_SIZE_W;
c.height = SCREEN_SIZE_H;

let canvas = document.getElementById('backmyCanvas');
let backCtx = canvas.getContext('2d',{willReadFrequently: true});
canvas.width = SCREEN_SIZE_W*5;
canvas.height = SCREEN_SIZE_H*7;
//viewPortMat
let viewPortMatrix = [
  [ SCREEN_SIZE_W, 0, 0, SCREEN_SIZE_W/2],
  [ 0, SCREEN_SIZE_H, 0, SCREEN_SIZE_H/2],
  [ 0, 0, 1, 0],
  [ 0, 0, 0, 1]
];
let inverseViewPortMatrix = CalInvMat4x4(viewPortMatrix);

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
        let x = new XMLHttpRequest();

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

    this.textureImage = img;
    
    this.backGroundFlag = backGroundFlag;
    this.backCullingFlag = true;//backCullingFlag;
    
    this.verts = verts.vertsPosition.concat();
    this.faceIndex = verts.faceIndex;
    this.bonesIndex = verts.bonesIndex;
    this.bonesWaight = verts.bonesWaight;

    let faceIndexMeshUV = [];
    //エラーはmonkey
    let meshVertsFaceIndex_Length = this.faceIndex.length;
    for(let i=0;i<meshVertsFaceIndex_Length;i++){
      let tempMeshUV = [
            verts.uv[i][0].u, verts.uv[i][0].v,
            verts.uv[i][1].u, verts.uv[i][1].v,
            verts.uv[i][2].u, verts.uv[i][2].v,
            ]
      faceIndexMeshUV.push(tempMeshUV);
    }
    this.UV = faceIndexMeshUV;
    let faceIndexMeshUV_Length = this.UV.length;
    let UVVector = [];
    for(let i=0;i<faceIndexMeshUV_Length;i++){
      let Ax = (this.UV[i][2] - this.UV[i][0]) * this.textureImage.width;
      let Ay = (this.UV[i][3] - this.UV[i][1]) * this.textureImage.height;
      let Bx = (this.UV[i][4] - this.UV[i][0]) * this.textureImage.width;
      let By = (this.UV[i][5] - this.UV[i][1]) * this.textureImage.height;
      let mi = getInvert2(Ax,Ay,Bx,By);
      if (!mi) return;
      let preUV_List0 = this.UV[i][0] * this.textureImage.width;
      mi.push(preUV_List0);
      let preUV_List1 = this.UV[i][1] * this.textureImage.height;
      mi.push(preUV_List1);
      UVVector.push(mi);
    }
    this.UVVector = UVVector;
  }
}

//projectedObject
function makeProjectedObject(orgObject,polyList){
  let projectedObject = [];
  projectedObject[poly_List] = polyList;
  projectedObject[obj_backCulling_Flag] = orgObject.backCullingFlag;
  projectedObject[obj_Image] = orgObject.textureImage;
  return projectedObject;
}
//projectedObject
function makeShaddowProjectedObject(orgObject,polyList){
  let projectedObject = [];
  projectedObject[poly_List] = polyList;
  projectedObject[obj_backCulling_Flag] = orgObject.backCullingFlag;
  return projectedObject;
}
//ポリゴン製造
function setPolygon(pos1,pos2,pos3,worldPos1,worldPos2,worldPos3,UVVector){
  let polygonElement = [];
  let projectedVertices =   [[pos1[position_X],pos1[position_Y],pos1[position_Z]],
                            [pos2[position_X],pos2[position_Y],pos2[position_Z]],
                            [pos3[position_X],pos3[position_Y],pos3[position_Z]]];

  let Va = vecMinus(pos1,pos2);
  let Vb = vecMinus(pos3,pos1);
  polygonElement[cross_Z] = culVecCrossZ(Va,Vb);
  polygonElement[projected_Verts] = projectedVertices;
  polygonElement[UV_Vector] = UVVector;
  //ライトシミュレーション用
  Va = vecMinus(worldPos1,worldPos2);
  Vb = vecMinus(worldPos3,worldPos1);
  polygonElement[poly_Cross_World_Vector3] = culVecNormalize(culVecCross(Va,Vb));
  return polygonElement;
}

//シャドウマップ用ポリゴン製造
function setShadowPolygon(pos1,pos2,pos3){
  let polygonElement = [];

  let Va = vecMinus(pos1,pos2);
  let Vb = vecMinus(pos3,pos1);
  polygonElement[cross_Z] = culVecCrossZ(Va,Vb);

  let projectedVertices =   [[pos1[position_X],pos1[position_Y],pos1[position_Z]],
                            [pos2[position_X],pos2[position_Y],pos2[position_Z]],
                            [pos3[position_X],pos3[position_Y],pos3[position_Z]]];

  polygonElement[projected_Verts] = projectedVertices;

  return polygonElement;
}

//スキンメッシュ用シャドウマップ付き
function objectSkinMeshPolygonPush(object,projectedObjects,shadowPprojectedObjects,viewMatrix,shadowViewMatrix,screen_size_h,screen_size_w){
  let worldVerts = [];
  let projectedVerts = [];
  let shadowProjectedVerts = [];

  let meshVets_Length = object.meshVerts.length;
  for (let i = 0; i < meshVets_Length; i++) {
    let mixMatrix = [0,0,0,0,
                    0,0,0,0,
                    0,0,0,0,
                    0,0,0,0];
    let blendBoneIndex_Length = object.blendBoneIndex[i].length;
    for(let j=0;j<blendBoneIndex_Length;j++){
      let bonesMatrix = object.bones[object.blendBoneIndex[i][j]].skinmeshBone;
      let matrixWaight = object.bonesWeight[i][j];
      let waightMatrix = matWaight(bonesMatrix,matrixWaight);
      matPlus(mixMatrix,waightMatrix); 
    }
    let boneWeightVerts = matVecMul(mixMatrix,object.meshVerts[i]);
    let nomalBoneWeightVerts = vertsCopy(boneWeightVerts); 
    let boneShadowWeightVerts = vertsCopy(boneWeightVerts);

    worldVerts[i] = boneWeightVerts;
    protMatVecMul(viewMatrix,nomalBoneWeightVerts);
    protMatVecMul(shadowViewMatrix,boneShadowWeightVerts);

    let projectionMatrix =  matPers(nomalBoneWeightVerts[2]);
    let shadowProjectionMatrix =  matPers(boneShadowWeightVerts[2]);
    protMatVecMul(projectionMatrix,nomalBoneWeightVerts);
    protMatVecMul(shadowProjectionMatrix,boneShadowWeightVerts);

    //boneWeightVerts = matVecMul(viewPortMatrix,boneWeightVerts);
    nomalBoneWeightVerts[0] = ((nomalBoneWeightVerts[0] + 0.5)*screen_size_w)|0;
    nomalBoneWeightVerts[1] = ((nomalBoneWeightVerts[1] + 0.5)*screen_size_h)|0;
    boneShadowWeightVerts[0] = ((boneShadowWeightVerts[0] + 0.5)*screen_size_w)|0;
    boneShadowWeightVerts[1] = ((boneShadowWeightVerts[1] + 0.5)*screen_size_h)|0;

    projectedVerts[i] = nomalBoneWeightVerts;
    shadowProjectedVerts[i] = boneShadowWeightVerts;
  }
 
  let Poly = [];
  let shadowPoly = [];
  let meshVertsFaceIndex_Length = object.meshVertsFaceIndex.length;
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    Poly[i] = setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],object.UVVector[i]);
    shadowPoly[i] = setShadowPolygon(shadowProjectedVerts[triangleFaceIndex[0]],shadowProjectedVerts[triangleFaceIndex[1]],shadowProjectedVerts[triangleFaceIndex[2]]);
  }

  let tempMoveObject = makeProjectedObject(object,Poly);
  //projectedObjects.push(tempMoveObject);
  //ｚソート
  if(projectedObjects.length == 0){
    projectedObjects[0] = tempMoveObject;
  }else{
    let loopEndFlag = false;
    for(let j=0;j<projectedObjects.length;j++){
      if(projectedObjects[j][poly_List][0][projected_Verts][0][position_Z]>Poly[0][projected_Verts][0][position_Z]){
        for(let i=projectedObjects.length-1;j<=i;i--){
          projectedObjects[i+1] = projectedObjects[i]
        }
        projectedObjects[j] = tempMoveObject;
        loopEndFlag = true;
        break;
      }
    }
    if(loopEndFlag == false){
      projectedObjects[projectedObjects.length] = tempMoveObject;
    }
  }

  let tempShadowMoveObject = makeShaddowProjectedObject(object,shadowPoly);
  //shadowPprojectedObjects.push(tempShadowMoveObject);
  //ｚソート
  if(shadowPprojectedObjects.length == 0){
    shadowPprojectedObjects[0] = tempShadowMoveObject;
  }else{
    let loopEndFlag = false;
    for(let j=0;j<shadowPprojectedObjects.length;j++){
      if(shadowPprojectedObjects[j][poly_List][0][projected_Verts][0][position_Z]>shadowPoly[0][projected_Verts][0][position_Z]){
        for(let i=shadowPprojectedObjects.length-1;j<=i;i--){
          shadowPprojectedObjects[i+1] = shadowPprojectedObjects[i]
        }
        shadowPprojectedObjects[j] = tempMoveObject;
        loopEndFlag = true;
        break;
      }
    }
    if(loopEndFlag == false){
      shadowPprojectedObjects[shadowPprojectedObjects.length] = tempMoveObject;
    }
  }

  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
//ボーンなしシャドウマップ付き
function objectDaePolygonPush(object,worldMatrix,projectedObjects,shadowPprojectedObjects,viewMatrix,shadowViewMatrix,screen_size_h,screen_size_w){
  let worldVerts = [];
  let projectedVerts = [];
  let shadowProjectedVerts = [];

  let object_meshVerts_length = object.meshVerts.length;
  for (let i = 0; i < object_meshVerts_length; i++) {
    let verts = matVecMul(worldMatrix,object.meshVerts[i]);
    let nomalVerts = vertsCopy(verts);
    let shadowVerts = vertsCopy(verts);
    worldVerts[i] = verts;
    protMatVecMul(viewMatrix,nomalVerts);
    protMatVecMul(shadowViewMatrix,shadowVerts);
   
    let projectionMatrix =  matPers(nomalVerts[2]);
    let shadowProjectionMatrix =  matPers(shadowVerts[2]);

    protMatVecMul(projectionMatrix,nomalVerts);
    protMatVecMul(shadowProjectionMatrix,shadowVerts);

    //nomalVerts = matVecMul(viewPortMatrix,nomalVerts);
    nomalVerts[0] = ((nomalVerts[0] + 0.5)*screen_size_w)|0;
    nomalVerts[1] = ((nomalVerts[1] + 0.5)*screen_size_h)|0;
    shadowVerts[0] = ((shadowVerts[0] + 0.5)*screen_size_w)|0;
    shadowVerts[1] = ((shadowVerts[1] + 0.5)*screen_size_h)|0;

    projectedVerts[i] = nomalVerts;
    shadowProjectedVerts[i] = shadowVerts;  
  }
 
  let Poly = [];
  let shadowPoly = [];
  let object_meshVertsFaceIndex_length = object.meshVertsFaceIndex.length;
  for(let i=0;i<object_meshVertsFaceIndex_length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    Poly[i] = setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],object.UVVector[i]);
    shadowPoly[i] = setShadowPolygon(shadowProjectedVerts[triangleFaceIndex[0]],shadowProjectedVerts[triangleFaceIndex[1]],shadowProjectedVerts[triangleFaceIndex[2]]);
  }

  let tempMoveObject = makeProjectedObject(object,Poly);
  projectedObjects.push(tempMoveObject);
  let tempShadowMoveObject = makeShaddowProjectedObject(object,shadowPoly);
  shadowPprojectedObjects.push(tempShadowMoveObject);
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
  for (let i = 0; i < object.verts.length; i++) {
    mixMatrix = [0,0,0,0,
                  0,0,0,0,
                  0,0,0,0,
                  0,0,0,0];
    roundVector2(object.verts[i][0],object.verts[i][1]);
    object.verts[i][2] = round(object.verts[i][2]);
    for(let j=0;j<object.bonesIndex[i].length;j++){
      let bonesMatrix = bones[object.bonesIndex[i][j]].skinmeshBone;
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
  let tempMoveObject = makeProjectedObject(object,mixMatrix,Poly);
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
function daeMekeSkinMeshBone(daeLoadPack){
  let boneParentRelationRow = daeLoadPack.boneParentRelation.length;
  for(let j=0;j<boneParentRelationRow;j++){
    let boneParentRelationCol = daeLoadPack.boneParentRelation[j].length;
    for(let i=0;i<boneParentRelationCol;i++){
       let boneParentRelation = daeLoadPack.boneParentRelation[j][i];
      if(i == 0){
        if(daeLoadPack.bones[boneParentRelation].skinmeshBone == null){
          let copyInverseBindPose = matCopy(daeLoadPack.bindPosePack[boneParentRelation].inverseBindPose);
          mulMatTranslate(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].position[0],
            daeLoadPack.bones[boneParentRelation].position[1],daeLoadPack.bones[boneParentRelation].position[2]);  
          mulMatRotateX(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[0]);
          mulMatRotateY(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[1]);
          mulMatRotateZ(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[2]);
          mulMatScaling(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].scaleXYZ[0],
            daeLoadPack.bones[boneParentRelation].scaleXYZ[1],daeLoadPack.bones[boneParentRelation].scaleXYZ[2]);  
          daeLoadPack.bones[boneParentRelation].skinmeshBone = matMul(copyInverseBindPose,daeLoadPack.bindPosePack[boneParentRelation].bindPose);
        }
      }else{
      if(daeLoadPack.bones[boneParentRelation].skinmeshBone  == null){
          let parentCrossBone = matMul(daeLoadPack.bones[daeLoadPack.boneParentRelation[j][i-1]].skinmeshBone,daeLoadPack.bindPosePack[boneParentRelation].inverseBindPose);
          mulMatRotateX(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[0]);
          mulMatRotateY(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[1]);
          mulMatRotateZ(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[2]);
          daeLoadPack.bones[boneParentRelation].skinmeshBone = matMul(parentCrossBone,daeLoadPack.bindPosePack[boneParentRelation].bindPose);
        }
      }
    }
  }
}
//ボーンなしシャドウマップ付き
function objectPolygonPush(object,worldMatrix,projectedObjects,shadowPprojectedObjects,viewMatrix,shadowViewMatrix,screen_size_h,screen_size_w){
  let worldVerts = [];
  let projectedVerts = [];
  let shadowProjectedVerts = [];

  let meshVerts_Length = object.verts.length;
  for (let i = 0; i < meshVerts_Length; i++) {
    let verts = matVecMul(worldMatrix,object.verts[i]);
    let nomalVerts = vertsCopy(verts);
    let shadowVerts = vertsCopy(verts);
    worldVerts[i] = verts;
    protMatVecMul(viewMatrix,nomalVerts);
    protMatVecMul(shadowViewMatrix,shadowVerts);
   
    let projectionMatrix =  matPers(nomalVerts[2]);
    let shadowProjectionMatrix =  matPers(shadowVerts[2]);

    protMatVecMul(projectionMatrix,nomalVerts);
    protMatVecMul(shadowProjectionMatrix,shadowVerts);

    //nomalVerts = matVecMul(viewPortMatrix,nomalVerts);
    nomalVerts[0] = ((nomalVerts[0] + 0.5)*screen_size_w)|0;
    nomalVerts[1] = ((nomalVerts[1] + 0.5)*screen_size_h)|0;
    shadowVerts[0] = ((shadowVerts[0] + 0.5)*screen_size_w)|0;
    shadowVerts[1] = ((shadowVerts[1] + 0.5)*screen_size_h)|0;

    projectedVerts[i] = nomalVerts;
    shadowProjectedVerts[i] = shadowVerts;  
  }
 
  let Poly = [];
  let shadowPoly = [];
  let meshVertsFaceIndex_Length = object.faceIndex.length;
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.faceIndex[i];
    Poly[i] = setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],object.UVVector[i]);
    shadowPoly[i] = setShadowPolygon(shadowProjectedVerts[triangleFaceIndex[0]],shadowProjectedVerts[triangleFaceIndex[1]],shadowProjectedVerts[triangleFaceIndex[2]]);
  }

  let tempMoveObject = makeProjectedObject(object,Poly);
  projectedObjects.push(tempMoveObject);
  let tempShadowMoveObject = makeShaddowProjectedObject(object,shadowPoly);
  shadowPprojectedObjects.push(tempShadowMoveObject);
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
  for (let i = 0; i < object.verts.length; i++) {
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
  let tempMoveObject = makeProjectedObject(object,worldMatrix,Poly);
  projectedObjects.push(tempMoveObject);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}
//ループに入る前に生成 z = 99999;pushを使わないようにするため
function renderBufferInit(buffer,pixelY,pixelX){
  for(let y=0;y<pixelY;y++){
    buffer[y] = [];
    for(let x=0;x<pixelX;x++){
      buffer[y][x] = [];
      buffer[y][x] = [99999];
    }
  }
}
function shdowBufferInit(buffer,pixelY,pixelX){
  for(let y=0;y<pixelY;y++){
    buffer[y] = [];
    for(let x=0;x<pixelX;x++){
      buffer[y][x] = 99999;
    }
  }
}
//ループに入った後に初期化
function setZmaxRenderBuffer(buffer,pixelY,pixelX){
  for(let y=0;y<pixelY;y++){
    for(let x=0;x<pixelX;x++){
        buffer[y][x][0] = 99999;
    }
  }
}
function setZmaxShdowBufferInit(buffer,pixelY,pixelX){
  for(let y=0;y<pixelY;y++){
    for(let x=0;x<pixelX;x++){
      buffer[y][x] = 99999;
    }
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
  for (let i = 0; i < orgObject.verts.length; i++) {
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
let a = [];
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
cubeImage.src = 'dice.png';

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
let steves = [];
let diceImage = new Image();
diceImage.src = "steve.png";
let dicePixelImage = [];
diceImage.addEventListener("load", function() {
  dicePixelImage = pictureToPixelMap(backCtx,diceImage);
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

function culUVVector(daeLoadPack){
  let faceIndexMeshUV_Length = daeLoadPack.faceIndexMeshUV.length;
  let UVVector = [];
  for(let i=0;i<faceIndexMeshUV_Length;i++){
    let Ax = (daeLoadPack.faceIndexMeshUV[i][2] - daeLoadPack.faceIndexMeshUV[i][0]) * daeLoadPack.textureImage.width;
    let Ay = (daeLoadPack.faceIndexMeshUV[i][3] - daeLoadPack.faceIndexMeshUV[i][1]) * daeLoadPack.textureImage.height;
    let Bx = (daeLoadPack.faceIndexMeshUV[i][4] - daeLoadPack.faceIndexMeshUV[i][0]) * daeLoadPack.textureImage.width;
    let By = (daeLoadPack.faceIndexMeshUV[i][5] - daeLoadPack.faceIndexMeshUV[i][1]) * daeLoadPack.textureImage.height;
    let mi = getInvert2(Ax,Ay,Bx,By);
    if (!mi) return;
    let preUV_List0 = daeLoadPack.faceIndexMeshUV[i][0] * daeLoadPack.textureImage.width;
    mi.push(preUV_List0);
    let preUV_List1 = daeLoadPack.faceIndexMeshUV[i][1] * daeLoadPack.textureImage.height;
    mi.push(preUV_List1);
    UVVector.push(mi);
  }
  daeLoadPack.UVVector = UVVector;
}

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
let steve1Load = false;
let steve2Load = false;
let cube1Load = false;

const screen_size_h = SCREEN_SIZE_H;
const screen_size_w = SCREEN_SIZE_W;

const invScreen_size_h = 1/screen_size_h;
const invScreen_size_w = 1/screen_size_w;

//zBufferInit
let shadowMap = [];
shdowBufferInit(shadowMap,screen_size_h,screen_size_w);
let zBuffering = [];
renderBufferInit(zBuffering,screen_size_h,screen_size_w);
let myImageData = ctx.createImageData(screen_size_w, screen_size_h);

let mainLoopId = setInterval(function(){
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
  if(cubePixelImageLoad == true && cube1LoadPack.daeLoad == true && cube1Load == false){
    cube1LoadPack.textureImage = cubePixelImage;
    cube1LoadPack.backCullingFlag = true;
    cube1LoadPack.bones.position[position_Y] = -1;
    cube1LoadPack.bones.position[position_Z] = 1;
    cube1LoadPack.bones.scaleXYZ[scale_X] = 2;
    cube1LoadPack.bones.scaleXYZ[scale_Z] = 0.5;
    culUVVector(cube1LoadPack)
    dices.push(cube1LoadPack) 
    cube1Load = true;
  }
  if(dicePixelImageLoad == true && steve1LoadPack.daeLoad == true && steve1Load == false){
    steve1LoadPack.textureImage = dicePixelImage;
    steve1LoadPack.backCullingFlag = true;
    culUVVector(steve1LoadPack)
    steves.push(steve1LoadPack);
    steve1Load = true;
  }
  if(dicePixelImageLoad == true && steve2LoadPack.daeLoad == true && steve1Load == true && steve2Load == false){
    steve2LoadPack.textureImage = dicePixelImage;
    steve2LoadPack.backCullingFlag = true;
    culUVVector(steve2LoadPack)

    steves.push(steve2LoadPack); 
    steve2Load = true;
  }
  if(skyPixelImageLoad && cubePixelImageLoad && roadPixelImageLoad && sandPixelImageLoad && dicePixelImageLoad && steve1Load && steve2Load && cube1Load){
    dataLoad = true;
  }
  ctx.font = '50pt Arial';
  ctx.fillStyle = 'rgba(0, 0, 255)';
  ctx.fillText("now loding", screen_size_w/2, screen_size_h/2);
  return;
}

const start = performance.now();

//lookat = setVector3(shadowProjectedObjects[lookatIndex].orgObject.centerObjX,shadowProjectedObjects[lookatIndex].orgObject.centerObjY,shadowProjectedObjects[lookatIndex].orgObject.centerObjZ);

if(rot>80){
  rotPlus = -5;
}else if(rot<0){
  rotPlus = 5;
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

//bonesReset
let steves_length = steves.length;
for(let j=0;j<steves_length;j++){
  let steves_bonesNameList_length = steves[j].bonesNameList.length;
  let currentStave = steves[j];
  for(let i=0;i<steves_bonesNameList_length;i++){
    currentStave.bones[i].skinmeshBone = null;
  }
}
steves[0].bones[0].position = setVector3(0,0,0);
steves[0].bones[0].rotXYZ = setVector3(0,0,0);

steves[0].bones[4].rotXYZ = setVector3(0,0,rot);
steves[0].bones[6].rotXYZ = setVector3(0,0,-1*rot);

steves[0].bones[8].rotXYZ = setVector3(0,0,-1*rot);
steves[0].bones[10].rotXYZ = setVector3(0,0,rot);

steves[0].bones[11].rotXYZ = setVector3(-1* rot,0,0);
steves[0].bones[12].rotXYZ = setVector3(rot,0,0);

steves[1].bones[0].position = setVector3(-0.1,0,0.5);
steves[1].bones[0].rotXYZ = setVector3(0,0,0);
steves[1].bones[0].scaleXYZ = setVector3(0.7,0.7,0.7);

steves[1].bones[4].rotXYZ = setVector3(0,0,rot);
steves[1].bones[6].rotXYZ = setVector3(0,0,-1*rot);

steves[1].bones[8].rotXYZ = setVector3(0,0,-1*rot);
steves[1].bones[10].rotXYZ = setVector3(0,0,rot);

steves[1].bones[11].rotXYZ = setVector3(-1* rot,0,0);
steves[1].bones[12].rotXYZ = setVector3(rot,0,0);

//makeBones
for(let i in steves){
  daeMekeSkinMeshBone(steves[i]);
}
/*
let rowCounter = -1;
for(let row of steveLoadPack.boneParentRelation){
  rowCounter += 1;
  let colCounter = -1;
  for(let boneParentRelation of row){
    colCounter += 1;
    if(colCounter == 0){
      if(diceBones[boneParentRelation].skinmeshBone == undefined){
        mulMatTranslate(steveLoadPack.bindPosePack[boneParentRelation].copyInverseBindPose,diceBones[boneParentRelation].position[0],
          diceBones[boneParentRelation].position[1],diceBones[boneParentRelation].position[2]);  
        mulMatRotateX(steveLoadPack.bindPosePack[boneParentRelation].copyInverseBindPose,diceBones[boneParentRelation].rotXYZ[0]);
        mulMatRotateY(steveLoadPack.bindPosePack[boneParentRelation].copyInverseBindPose,diceBones[boneParentRelation].rotXYZ[1]);
        mulMatRotateZ(steveLoadPack.bindPosePack[boneParentRelation].copyInverseBindPose,diceBones[boneParentRelation].rotXYZ[2]);
        diceBones[boneParentRelation].skinmeshBone = matMul(steveLoadPack.bindPosePack[boneParentRelation].copyInverseBindPose,steveLoadPack.bindPosePack[boneParentRelation].bindPose);
        steveLoadPack.bindPosePack[boneParentRelation].copyInverseBindPose = steveLoadPack.bindPosePack[boneParentRelation].inverseBindPose.concat();
      }
    }else{
     if(diceBones[boneParentRelation].parentCrossBone  == undefined){
        diceBones[boneParentRelation].parentCrossBone = matMul(diceBones[steveLoadPack.boneParentRelation[rowCounter][colCounter-1]].skinmeshBone,steveLoadPack.bindPosePack[boneParentRelation].inverseBindPose);
        diceBones[boneParentRelation].copyParentCrossBone = diceBones[boneParentRelation].parentCrossBone.concat();
        mulMatRotateX(diceBones[boneParentRelation].copyParentCrossBone,diceBones[boneParentRelation].rotXYZ[0]);
        mulMatRotateY(diceBones[boneParentRelation].copyParentCrossBone,diceBones[boneParentRelation].rotXYZ[1]);
        mulMatRotateZ(diceBones[boneParentRelation].copyParentCrossBone,diceBones[boneParentRelation].rotXYZ[2]);
        diceBones[boneParentRelation].skinmeshBone = matMul(diceBones[boneParentRelation].copyParentCrossBone,steveLoadPack.bindPosePack[boneParentRelation].bindPose);
        diceBones[boneParentRelation].copyParentCrossBone = diceBones[boneParentRelation].parentCrossBone.concat();
      }
    }
  }
}

steveLoadPack.skinmeshBones = diceBones;
*/
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
  /*
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
  }*/
  //makeSkinMeshBones(bonesJoinIndex,boxHuman1Bones,bodys1,masterXYZ,masterRotXYZ,masterScalingXYZ);

  //skinmeshSPolygonAndShadowMapnPush(shadowProjectedObjects,projectedObjects,bodys1,boxHuman1Bones,sunViewMatrix,viewMatrix);
  
  //シャドウの投影後の情報格納
  let shadowProjectedObjects = [];
  //投影後の情報格納
  let projectedObjects = [];

  viewMatrix = matCamera(cameraPos,lookat,up);
  matRound4X4(viewMatrix);

  inverseViewMatrix = CalInvMat4x4(viewMatrix);
  matRound4X4(inverseViewMatrix);

  sunViewMatrix = matCamera(sunPos,sunLookat,up);
  matRound4X4(sunViewMatrix);
  /*
	//cuberegister
  for(let object of cubes){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,object.centerObjX,object.centerObjY,object.centerObjZ);  
    mulMatRotateX(worldMatrix,object.objRotX);
    mulMatRotateY(worldMatrix,object.objRotY);
    mulMatRotateZ(worldMatrix,object.objRotZ); 
    mulMatScaling(worldMatrix,object.scaleX,object.scaleY,object.scaleZ);
    objectPolygonPush(object,worldMatrix,projectedObjects,shadowProjectedObjects,viewMatrix,sunViewMatrix);
	}*/
  	//dicesregister
  for(let object of dices){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,object.bones.position[position_X],object.bones.position[position_Y],object.bones.position[position_Z]);  
    mulMatRotateX(worldMatrix,object.bones.rotXYZ[rot_X]);
    mulMatRotateY(worldMatrix,object.bones.rotXYZ[rot_Y]);
    mulMatRotateZ(worldMatrix,object.bones.rotXYZ[rot_Z]); 
    mulMatScaling(worldMatrix,object.bones.scaleXYZ[scale_X],object.bones.scaleXYZ[scale_Y],object.bones.scaleXYZ[scale_Z]);
    //objectDaePolygonPush(object,worldMatrix,projectedObjects,shadowProjectedObjects,viewMatrix,sunViewMatrix,screen_size_h,screen_size_w);
  }
  //steve
  for(let object of steves){
    objectSkinMeshPolygonPush(object,projectedObjects,shadowProjectedObjects,viewMatrix,sunViewMatrix,screen_size_h,screen_size_w);
	}
	//planesregister
  for(let object of planes){
    let worldMatrix = matIdentity();
    mulMatTranslate(worldMatrix,object.centerObjX,object.centerObjY,object.centerObjZ);  
    mulMatRotateX(worldMatrix,object.objRotX);
    mulMatRotateY(worldMatrix,object.objRotY);
    mulMatRotateZ(worldMatrix,object.objRotZ); 
    mulMatScaling(worldMatrix,object.scaleX,object.scaleY,object.scaleZ);
    //objectPolygonPush(object,worldMatrix,projectedObjects,shadowProjectedObjects,viewMatrix,sunViewMatrix,screen_size_h,screen_size_w);
  }
  console.log(projectedObjects)
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

//ピクセル処理がボトルネック
setZmaxShdowBufferInit(shadowMap,screen_size_h,screen_size_w);
setZmaxRenderBuffer(zBuffering,screen_size_h,screen_size_w);
//shadowと元々のポリゴン数は同じ
let projectedObjectsLength  = projectedObjects.length;
for(let j=0;j<projectedObjectsLength;j++){
  let projectedObjects_j_polygonNum = projectedObjects[j][poly_List].length;
	for(let projectedPolyNum=0;projectedPolyNum<projectedObjects_j_polygonNum;projectedPolyNum++){
	  //-の方がこちらに近くなる座標軸だから
	  if(shadowProjectedObjects[j][obj_backCulling_Flag] == true){
	    if(shadowProjectedObjects[j][poly_List][projectedPolyNum][cross_Z]<0){
        triangleToShadowBuffer(shadowMap,shadowProjectedObjects[j][poly_List][projectedPolyNum][projected_Verts],screen_size_h,screen_size_w);
      }
      if(projectedObjects[j][poly_List][projectedPolyNum][cross_Z]<0){
        triangleToBuffer(zBuffering,projectedObjects[j][obj_Image],projectedObjects[j][poly_List][projectedPolyNum][projected_Verts],projectedObjects[j][poly_List][projectedPolyNum][poly_Cross_World_Vector3],
            projectedObjects[j][poly_List][projectedPolyNum][UV_Vector]
           ,screen_size_h,screen_size_w);
	    } 
	  }else{
      triangleToShadowBuffer(shadowMap,shadowProjectedObjects[j][poly_List][projectedPolyNum][projected_Verts],screen_size_h,screen_size_w);
      triangleToBuffer(zBuffering,projectedObjects[j][obj_Image],projectedObjects[j][poly_List][projectedPolyNum][projected_Verts],projectedObjects[j][poly_List][projectedPolyNum][poly_Cross_World_Vector3],
        projectedObjects[j][poly_List][projectedPolyNum][UV_Vector]
       ,screen_size_h,screen_size_w);
	  }
  }  
}
//Zバッファ pixel = [z,r,g,b,a,crossWorldVector3]で送られてくる。
let sunVec = culVecNormalize(vecMinus(sunPos,sunLookat));
let shadowMat = matMul(sunViewMatrix,inverseViewMatrix);
for (let pixelY=0; pixelY<screen_size_h;pixelY++) {
  for (let pixelX=0;pixelX<screen_size_w;pixelX++) {
    let base = (pixelY * screen_size_w + pixelX) * 4;
    let pixel = zBuffering[pixelY][pixelX];
    if(pixel[pixel_Z]<99999){
      let pixelZ = pixel[pixel_Z];
      let pixelR = pixel[pixel_R];
      let pixelG = pixel[pixel_G];
      let pixelB = pixel[pixel_B];
      //let pixela = pixel[4];
      let pixelcrossWorldVector3 = pixel[pixel_Cross_World_Vector3];
      //シャドウマップに照らし合わせる。
      let shadowPixelX = pixelX;
      let shadowPixelY = pixelY;
      //camera
      //let pixelVector3 = setVector3(pixelX,pixelY,pixelZ);

      //inverseViewPort and inverseProjection
      shadowPixelX = (shadowPixelX*invScreen_size_w  - 0.5) * pixelZ;
      shadowPixelY = (shadowPixelY*invScreen_size_h  - 0.5) * pixelZ;

      /*
      //inverseViewPort
      shadowPixelX /= screen_size_w;
      shadowPixelY /= screen_size_h;
      shadowPixelX -= 0.5;
      shadowPixelY -= 0.5;
      
      shadowPixelX = shadowPixelX/screen_size_w  - 0.5;
      shadowPixelY = shadowPixelY/screen_size_h  - 0.5;

      //inverseProjection
      shadowPixelX *= pixelZ;
      shadowPixelY *= pixelZ;
      */
      //view
      //shadowMatrixmul
      let shadowMatrixPixelX = shadowMat[0]*shadowPixelX + shadowMat[1]*shadowPixelY + shadowMat[2]*pixelZ + shadowMat[3];
      let shadowMatrixPixelY = shadowMat[4]*shadowPixelX + shadowMat[5]*shadowPixelY + shadowMat[6]*pixelZ + shadowMat[7];
      pixelZ = shadowMat[8]*shadowPixelX + shadowMat[9]*shadowPixelY + shadowMat[10]*pixelZ + shadowMat[11];
      let invPixelZ = 1/pixelZ;

      //projectionMatrix = matPers(pixelVector3[2]);
      //pixelVector3 = matVecMul(projectionMatrix,pixelVector3);
   
      //projection
      shadowMatrixPixelX *= invPixelZ;
      shadowMatrixPixelY *= invPixelZ;
      /*
      //viewPort
      shadowPixelX += 0.5;
      shadowPixelY += 0.5;
      shadowPixelX *= screen_size_w;
      shadowPixelY *= screen_size_h;
      shadowPixelX |= 0;
      shadowPixelY |= 0;
      */
      shadowMatrixPixelX = ((shadowMatrixPixelX  + 0.5)*screen_size_w)|0;
      shadowMatrixPixelY = ((shadowMatrixPixelY  + 0.5)*screen_size_h)|0;
      if(shadowMatrixPixelX>0 && shadowMatrixPixelX<screen_size_w){
        if(shadowMatrixPixelY>0 && shadowMatrixPixelY<screen_size_h){
          if(shadowMap[shadowMatrixPixelY][shadowMatrixPixelX]+0.25<pixelZ){
            pixelR *= 0.5;
            pixelG *= 0.5;
            pixelB *= 0.5;	
          }
        }
      }
      //ライトシミュレーション
      let sunCosin = culVecDot(sunVec,pixelcrossWorldVector3);
      sunCosin *= 1.5;
      pixelR *= sunCosin;
      pixelG *= sunCosin;
      pixelB *= sunCosin;      
      myImageData.data[base + 0] = pixelR;  // Red
      myImageData.data[base + 1] = pixelG;  // Green
      myImageData.data[base + 2] = pixelB;  // Blue
      myImageData.data[base + 3] = 255; // Alpha
    //dotPaint(j,i,getPixel.r,getPixel.g,getPixel.b,getPixel.a,ctx);    
    }else{
      //何もないところは黒
      //dotPaint(j,i,0,0,0,255,ctx);
      myImageData.data[base + 0] = 0;  // Red
      myImageData.data[base + 1] = 0;  // Green
      myImageData.data[base + 2] = 0;  // Blue
      myImageData.data[base + 3] = 255; // Alpha
    }
  }
}

ctx.putImageData(myImageData, 0, 0);
const end = performance.now();
console.log(`実行時間: ${end - start} ミリ秒`);
}, 1000/60);

document.addEventListener('keydown',e => {

  switch(e.key){
    case 'ArrowLeft':
      cameraPos[position_X] -= 0.1;
      break;
    case 'ArrowRight':
      cameraPos[position_X]  += 0.1;
      break;
    case 'ArrowUp': 
      cameraPos[position_Y]  -= 0.1;
      break;
    case 'ArrowDown':
      cameraPos[position_Y]  += 0.1;
      break;
    case 'u':
      cameraPos[position_Z]  += 0.1;
      break;   
    case 'd':
      cameraPos[position_Z]  -= 0.1;
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