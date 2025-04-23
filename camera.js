//頂点にクラスを使うと重たくなる頂点演算のせい？
//javascriptのクラス、関数を使うと重くなりがち、いっそ自分で作れるものは作る。Ｃ言語みたいになってくる。
import {setVector2,setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize, round,round100,NewtonMethod, cul3dVecLength, XYRound, minCul, maxCul, minXCul, maxXCul, minYCul, maxYCul, vec3CrossZMinus, mul1000Round, minXPosCul, maxXPosCul, minYPosCul, maxYPosCul, affineRound} from './vector.js';
import {matIdentity,matDirectMul,mulMatScaling, matMul,matVecMul,matPers,matCamera,mulMatRotateX,mulMatRotatePointX,mulMatRotateY,mulMatRotatePointY,mulMatRotateZ,mulMatRotatePointZ,getInverseMatrix, matRound4X4, protMatVecMul, CalInvMat4x4, matWaight, matPlus, matCopy, getInvert2, matMulVertsZCamera, matMulVertsXYZCamera, makeScalingMatrix, matWaightAndPlus, matRound, getTextureInvert, matShadowCamera} from './matrix.js';
import {waistVerts,spineVerts,headVerts,orgPlaneVerts, orgCubeVerts, RightLeg1Verts, RightLeg2Verts, LeftLeg1Verts, LeftLeg2Verts, rightArm1Verts, rightArm2Verts, leftArm1Verts, leftArm2Verts} from './orgverts.js';
import {setPixel,renderBuffer,pixel,bufferPixelInit,bufferInit,pictureToPixelMap,dotPaint,branch, vertsCopy, top_int, sort_YPoint, scan_ShadowVertical, scan_vertical} from './paint.js';
import {pixel_B, pixel_SunCosin, pixel_G, pixel_R, pixel_Z,SUNCOSIN, position_X, position_Y, position_Z, rot_X, rot_Y, rot_Z, scale_X, scale_Y, scale_Z, obj_Image, poly_List,obj_BackCulling_Flag, pixel_shadow_Flag, obj_Shadow_Flag, obj_LightShadow_Flag, PT, PM, PB, AFFINE_A, AFFINE_C, AFFINE_B, AFFINE_D, AFFINE_F, AFFINE_E } from './enum.js';
export const SCREEN_SIZE_W = 1000;
export const SCREEN_SIZE_H = 800;

const Image_Height = 1;
const Image_Width = 2;

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
let cube1LoadPack = {};
let sphere1LoadPack = {};
let sandLoadPack = {};

let steve1Loadpack = [];
let cube1Loadpack = [];
let sphere1Loadpack = [];
let sandLoadpack = [];

daeLoader("car.dae",cube1LoadPack,cube1Loadpack);
daeLoader("sphere.dae",sphere1LoadPack,sphere1Loadpack);
daeLoader("dice3.dae",steve1LoadPack,steve1Loadpack);
daeLoader("sand.dae",sandLoadPack,sandLoadpack);

function daeLoadCopy(daeLoadPack){
  let copyDae = {};
  copyDae.objectNumber = JSON.parse(JSON.stringify(daeLoadPack.objectNumber));
  copyDae.meshVerts = JSON.parse(JSON.stringify(daeLoadPack.meshVerts));
  copyDae.meshVertsFaceIndex = JSON.parse(JSON.stringify(daeLoadPack.meshVertsFaceIndex));
  //テクスチャは使いまわすから参照型
  copyDae.faceIndexMeshUV = daeLoadPack.faceIndexMeshUV;
  copyDae.textureImage = daeLoadPack.textureImage;
  copyDae.UVVector = JSON.parse(JSON.stringify(daeLoadPack.UVVector));
  copyDae.backCullingFlag = daeLoadPack.backCullingFlag;
  copyDae.shadowFlag = daeLoadPack.shadowFlag;
  copyDae.lightShadowFlag = daeLoadPack.lightShadowFlag;
  copyDae.armatures = daeLoadPack.armatures;
    if(daeLoadPack.armatures == true){
      copyDae.bonesNameList = JSON.parse(JSON.stringify(daeLoadPack.bonesNameList));
      copyDae.bindPosePack = JSON.parse(JSON.stringify(daeLoadPack.bindPosePack));
      copyDae.blendBoneIndex = JSON.parse(JSON.stringify(daeLoadPack.blendBoneIndex));
      copyDae.bonesWeight = JSON.parse(JSON.stringify(daeLoadPack.bonesWeight));
      copyDae.boneParentRelation = JSON.parse(JSON.stringify(daeLoadPack.boneParentRelation));
      let bones = [];
      for(let i=0;i<daeLoadPack.bonesNameList.length;i++){
        let boneContents = {};
        boneContents.skinmeshBone = null;
        boneContents.position = setVector3(daeLoadPack.bones[0].position[position_X],daeLoadPack.bones[0].position[position_Y],daeLoadPack.bones[0].position[position_Z]);
        boneContents.rotXYZ = setVector3(daeLoadPack.bones[0].rotXYZ[position_X],daeLoadPack.bones[0].rotXYZ[position_Y],daeLoadPack.bones[0].rotXYZ[position_Z]);
        boneContents.scaleXYZ = setVector3(daeLoadPack.bones[0].scaleXYZ[position_X],daeLoadPack.bones[0].scaleXYZ[position_Y],daeLoadPack.bones[0].scaleXYZ[position_Z]);
        bones.push(boneContents);
      }
      copyDae.bones = bones; 
    }else{
      let bones = [];
      let boneContents = {};
      boneContents.position = setVector3(daeLoadPack.bones[0].position[position_X],daeLoadPack.bones[0].position[position_Y],daeLoadPack.bones[0].position[position_Z]);
      boneContents.rotXYZ = setVector3(daeLoadPack.bones[0].rotXYZ[position_X],daeLoadPack.bones[0].rotXYZ[position_Y],daeLoadPack.bones[0].rotXYZ[position_Z]);
      boneContents.scaleXYZ = setVector3(daeLoadPack.bones[0].scaleXYZ[position_X],daeLoadPack.bones[0].scaleXYZ[position_Y],daeLoadPack.bones[0].scaleXYZ[position_Z]);
      bones.push(boneContents);
      copyDae.bones = bones; 
    }
   return copyDae;
}
function daeLoadcopy(daeLoadPack){
  let copyDae = [];
  for(let i=0;i<daeLoadPack[0].objectNumber;i++){
    let object = daeLoadPack[i];
    let tempCopyDae = {};
    tempCopyDae.objectNumber = JSON.parse(JSON.stringify(object.objectNumber));
    tempCopyDae.meshVerts = JSON.parse(JSON.stringify(object.meshVerts));
    tempCopyDae.meshVertsFaceIndex = JSON.parse(JSON.stringify(object.meshVertsFaceIndex));
    //テクスチャは使いまわすから参照型
    tempCopyDae.faceIndexMeshUV = object.faceIndexMeshUV;
    tempCopyDae.textureImage = object.textureImage;
    tempCopyDae.textureImageHeight = object.textureImageHeight
    tempCopyDae.textureImageWidth = object.textureImageWidth
    tempCopyDae.UVVector = JSON.parse(JSON.stringify(object.UVVector));
    tempCopyDae.backCullingFlag = object.backCullingFlag;
    tempCopyDae.shadowFlag = object.shadowFlag;
    tempCopyDae.lightShadowFlag = object.lightShadowFlag;
    tempCopyDae.armatures = object.armatures;
    if(daeLoadPack[0].armatures == true){
      tempCopyDae.bonesNameList = JSON.parse(JSON.stringify(object.bonesNameList));
      tempCopyDae.bindPosePack = JSON.parse(JSON.stringify(object.bindPosePack));
      tempCopyDae.blendBoneIndex = JSON.parse(JSON.stringify(object.blendBoneIndex));
      tempCopyDae.bonesWeight = JSON.parse(JSON.stringify(object.bonesWeight));
      tempCopyDae.boneParentRelation = JSON.parse(JSON.stringify(object.boneParentRelation));
      let bones = [];
      for(let i=0;i<object.bonesNameList.length;i++){
        let boneContents = {};
        boneContents.skinmeshBone = null;
        boneContents.position = setVector3(object.bones[0].position[position_X],object.bones[0].position[position_Y],object.bones[0].position[position_Z]);
        boneContents.rotXYZ = setVector3(object.bones[0].rotXYZ[position_X],object.bones[0].rotXYZ[position_Y],object.bones[0].rotXYZ[position_Z]);
        boneContents.scaleXYZ = setVector3(object.bones[0].scaleXYZ[position_X],object.bones[0].scaleXYZ[position_Y],object.bones[0].scaleXYZ[position_Z]);
        bones.push(boneContents);
      }
      tempCopyDae.bones = bones;
    }else{
      let bones = [];
      let boneContents = {};
      boneContents.position = setVector3(object.bones[0].position[position_X],object.bones[0].position[position_Y],object.bones[0].position[position_Z]);
      boneContents.rotXYZ = setVector3(object.bones[0].rotXYZ[position_X],object.bones[0].rotXYZ[position_Y],object.bones[0].rotXYZ[position_Z]);
      boneContents.scaleXYZ = setVector3(object.bones[0].scaleXYZ[position_X],object.bones[0].scaleXYZ[position_Y],object.bones[0].scaleXYZ[position_Z]);
      bones.push(boneContents);
      tempCopyDae.bones = bones; 
    }
    copyDae.push(tempCopyDae); 
  }
  return copyDae;
}
function daeLoader(fileName,daeLoadPack,daeLoadpack){
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
          let loadMeshUV = [];
          let loadMeshIndex = [];

          for(let j=0;j<meshData.length;j++){
            let tempLoadMeshVerts = [];
            let tempLoadMeshUV = [];
            let tempLoadMeshIndex = [];
            for(let i=0;i<meshData[j].children.length;i++){
              if(meshData[j].children[i].id.indexOf('positions') != -1){
                if(meshData[j].children[i].children[0].textContent[meshData[j].children[i].children[0].textContent.length-1] != ' '){
                  //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                  meshData[j].children[i].children[0].textContent += ' ';
                }
                tempLoadMeshVerts.push(meshData[j].children[i].children[0].textContent);
              }
              if(meshData[j].children[i].id.indexOf('map') != -1){
                if(meshData[j].children[i].children[0].textContent[meshData[j].children[i].children[0].textContent.length-1] != ' '){
                  //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                  meshData[j].children[i].children[0].textContent += ' ';   
                }
                tempLoadMeshUV.push(meshData[j].children[i].children[0].textContent);
              }
              if(meshData[j].children[i].getAttribute('material')  != null && meshData[j].children[i].getAttribute('material').indexOf('material') != -1){
                if(meshData[j].children[i].children[3].textContent[meshData[j].children[i].children[3].textContent.length-1] != ' '){
                  //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                  meshData[j].children[i].children[3].textContent += ' ';
                }
                tempLoadMeshIndex.push(meshData[j].children[i].children[3].textContent)
              }
            }
            loadMeshVerts.push(tempLoadMeshVerts);
            loadMeshUV.push(tempLoadMeshUV);
            loadMeshIndex.push(tempLoadMeshIndex);
          }
          // for(let i=0;i<meshData[0].children.length;i++){
          //   if(meshData[0].children[i].id.indexOf('positions') != -1){
          //     if(meshData[0].children[i].children[0].textContent[meshData[0].children[i].children[0].textContent.length-1] != ' '){
          //       //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
          //       //meshData[0].children[i].children[0].textContent += ' ';
          //     }
          //     //loadMeshVerts.push(meshData[0].children[i].children[0].textContent);
          //   }
  
          //   if(meshData[0].children[i].id.indexOf('map') != -1){
          //     if(meshData[0].children[i].children[0].textContent[meshData[0].children[i].children[0].textContent.length-1] != ' '){
          //       //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
          //       //meshData[0].children[i].children[0].textContent += ' ';
          //     }
          //     //loadMeshUV.push(meshData[0].children[i].children[0].textContent);
          //   }
  
          //   if(meshData[0].children[i].getAttribute('material')  != null && meshData[0].children[i].getAttribute('material').indexOf('material') != -1){
          //     if(meshData[0].children[i].children[3].textContent[meshData[0].children[i].children[3].textContent.length-1] != ' '){
          //       //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
          //       meshData[0].children[i].children[3].textContent += ' ';
          //     }
          //     loadMeshIndex.push(meshData[0].children[i].children[3].textContent);
          //   }
          // }
          //meshData
          let verts = [];
          let char = [];
          let meshVerts = [];
          daeLoadPack.objectNumber = loadMeshVerts.length;
          for(let i=0;i<daeLoadPack.objectNumber;i++){
            let objectDae = {};
            daeLoadpack.push(objectDae);
          }
          daeLoadpack[0].objectNumber = loadMeshVerts.length;
          for(let j=0;j<daeLoadPack.objectNumber;j++){
            let tempMeshVerts = [];
            for(let i=0;i<loadMeshVerts[j][0].length;i++){
              let tempChar = loadMeshVerts[j][0][i];
              if(char.length == 0 && loadMeshVerts[j][0][i] != " "){
                char = tempChar;
                continue;
              }else{
                if(loadMeshVerts[j][0][i] != " "){
                    char += tempChar;
                }else{
                  let tempInt = parseFloat(char);
                  //vertsを丸める。影響のない小数点は切り捨てる。
                  tempInt = tempInt;
                  verts.push(tempInt);
                  char = [];
                  if(verts.length %3 == 0){
                    tempMeshVerts.push(verts);
                    verts = [];
                  }
                }
              }
            }
            meshVerts.push(tempMeshVerts);
          }
          for(let i=0;i<daeLoadPack.objectNumber;i++){
            daeLoadpack[i].meshVerts = meshVerts[i];
          }
          //meshIndex
          char = [];
          verts = [];
          let tempVertsIndex = [];
          let meshVertsFaceIndex = [];
          let normalIndex= [];
          let UVIndex = [];
          //1index,2normal,3uv
          let readNow = 1;
          for(let j=0;j<daeLoadPack.objectNumber;j++){
            let tempMeshVertsFaceIndex = [];
            for(let i=0;i<loadMeshIndex[j][0].length;i++){
              let tempChar = loadMeshIndex[j][0][i];
              if(char.length == 0 && loadMeshIndex[j][0][i] != " "){
                char = tempChar;
                continue;
              }else{
                if(loadMeshIndex[j][0][i] != " "){
                    char += tempChar;
                }else{
                  let tempInt = parseInt(char)
                  if(readNow == 1){
                    tempVertsIndex.unshift(tempInt);
                    char = [];
                    if(tempVertsIndex.length %3 == 0){
                      tempMeshVertsFaceIndex.push(tempVertsIndex);
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
            meshVertsFaceIndex.push(tempMeshVertsFaceIndex);
          }
          for(let i=0;i<daeLoadPack.objectNumber;i++){
            daeLoadpack[i].meshVertsFaceIndex = meshVertsFaceIndex[i];
          }
          //uv
          let tempUV = [];
          let meshUV = [];
          let objectMeshUV = [];
          let u = 0;
          let v = 0;
          let readFlag = 0;//0:u,1:v,2:tempUV
          char = [];
          for(let j=0;j<daeLoadPack.objectNumber;j++){
            for(let i=0;i<loadMeshUV[j][0].length;i++){
              let tempChar = loadMeshUV[j][0][i];
              if(char.length == 0 && loadMeshUV[j][0][i] != " "){
                char = tempChar;
                continue;
              }else{
                if(loadMeshUV[j][0][i] != " "){
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
            objectMeshUV.push(meshUV);
            meshUV = [];             
          }
          let faceIndexMeshUV = [];
          for(let j=0;j<daeLoadPack.objectNumber;j++){
            let tempFaceIndexMeshUV = [];
            let meshVertsFaceIndex_Length = meshVertsFaceIndex[j].length;
            for(let i=0;i<meshVertsFaceIndex_Length;i++){
              let tempMeshUV = [
                objectMeshUV[j][i][0].u, objectMeshUV[j][i][0].v,
                objectMeshUV[j][i][1].u, objectMeshUV[j][i][1].v,
                objectMeshUV[j][i][2].u, objectMeshUV[j][i][2].v,
                    ]
              tempFaceIndexMeshUV.push(tempMeshUV);
            }
            faceIndexMeshUV.push(tempFaceIndexMeshUV);
          }
          for(let i=0;i<daeLoadPack.objectNumber;i++){
            daeLoadpack[i].faceIndexMeshUV = faceIndexMeshUV[i];
          }
          daeLoadPack.armatures = false;
          daeLoadpack[0].armatures = false;
        //armatureボーンを入れるなら1ファイルすべてのオブジェクトに入れる。
        let armatures = docelem.getElementsByTagName("library_controllers");
        if(armatures.length != 0){
          daeLoadPack.armatures = true;
          daeLoadpack[0].armatures = true;
          //boneNameList ボーンの名前を数字に置き換えるための配列
          let boneName = docelem.getElementsByTagName("Name_array");
          let bonesNameList = [];
          char = [];
          for(let j=0;j<boneName.length;j++){
             let boneNumber = 0;
            let tempBonesNameList = [];
            boneName[j].textContent += ' ';
            for(let i=0;i<boneName[j].textContent.length;i++){
              if(boneName[j].textContent[i] != ' '){
              char += boneName[j].textContent[i];
              }else{
                let tempboneName = [char,boneNumber];
                char = [];
                boneNumber += 1;
                tempBonesNameList.push(tempboneName);
              }
            }
            bonesNameList.push(tempBonesNameList);
          }
          ////////////////////////////
          daeLoadPack.bonesNameList = bonesNameList[0];
          for(let i=0;i<armatures.length;i++){
            daeLoadpack[i].bonesNameList = bonesNameList[i];

          }
          //dataLoad
          let loadBindPose = [];
          let vertsBlendNumbers = [];
          let vertsBlendMatrixNumbers = [];
          let loadSkinWaight = [];
          for(let j=0;j<armatures.length;j++){
            let tempLoadBindPose = [];
            let tempVertsBlendNumbers = [];
            let tempVertsBlendMatrixNumbers = [];
            let tempLoadSkinWaight = [];
            for(let i=0;i<armatures[j].children[0].children[0].children.length;i++){
              if(armatures[j].children[0].children[0].children[i].id.indexOf('bind_poses') != -1){
                if(armatures[j].children[0].children[0].children[i].children[0].textContent[armatures[j].children[0].children[0].children[i].children[0].textContent.length-1] != ' '){
                  //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                  armatures[j].children[0].children[0].children[i].children[0].textContent += ' ';
                }
                tempLoadBindPose.push(armatures[j].children[0].children[0].children[i].children[0].textContent);
              }
              if(armatures[j].children[0].children[0].children[i].tagName.indexOf('vertex_weights') != -1){
                //vertsBlendNumbers
                if(armatures[j].children[0].children[0].children[i].children[2].textContent[armatures[j].children[0].children[0].children[i].children[2].textContent.length-1] != ' '){
                  //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                  armatures[j].children[0].children[0].children[i].children[2].textContent += ' ';
                }
                tempVertsBlendNumbers.push(armatures[j].children[0].children[0].children[i].children[2].textContent);
                //vertsBlendMatrixNumbers
                if(armatures[j].children[0].children[0].children[i].children[3].textContent[armatures[j].children[0].children[0].children[i].children[3].textContent.length-1] != ' '){
                  //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                  armatures[j].children[0].children[0].children[i].children[3].textContent += ' ';
                }
                tempVertsBlendMatrixNumbers.push(armatures[j].children[0].children[0].children[i].children[3].textContent);
              }
              if(armatures[j].children[0].children[0].children[i].id.indexOf('skin-weights') != -1){
                if(armatures[j].children[0].children[0].children[i].children[0].textContent[armatures[j].children[0].children[0].children[i].children[0].textContent.length-1] != ' '){
                  //空白を最後にわざと付ける。空白でデータを区切れる。番兵。
                  armatures[j].children[0].children[0].children[i].children[0].textContent += ' ';
                }
                tempLoadSkinWaight.push(armatures[j].children[0].children[0].children[i].children[0].textContent);
              }
            }
            loadBindPose.push(tempLoadBindPose);
            vertsBlendNumbers.push(tempVertsBlendNumbers);
            vertsBlendMatrixNumbers.push(tempVertsBlendMatrixNumbers);
            loadSkinWaight.push(tempLoadSkinWaight);
          }
          //bindPose
          let tempBind = [];
          let bindPosePack = [];
          for(let j=0;j<armatures.length;j++){
            let tempBindPosePack = [];
            for(let i=0;i<loadBindPose[j][0].length;i++){
              let tempChar = loadBindPose[j][0][i];
              if(char.length == 0 && loadBindPose[j][0][i] != " "){
                char = tempChar;
                continue;
              }else{
                if(loadBindPose[j][0][i] != " "){
                    char += tempChar;
                }else{
                  let tempFloat = parseFloat(char);
                  char = [];
                  tempBind.push(tempFloat)
                  if(tempBind.length >= 4*4){
                    let boneContents = {};
                    boneContents.bindPose = tempBind;
                    boneContents.inverseBindPose = CalInvMat4x4(tempBind);
                    tempBindPosePack.push(boneContents);
                    tempBind = [];  
            
                  }
                }
              }  
            }
            bindPosePack.push(tempBindPosePack)         
          }
          for(let i=0;i<armatures.length;i++){
            daeLoadpack[i].bindPosePack = bindPosePack[i];
          }
          //vertsBoneBlendNumber１頂点にいくつの頂点の重みを加えるか。２なら２頂点。
          let vertsBoneBlendFloatNumber = [];
          for(let j=0;j<armatures.length;j++){
            let tempVertsBoneBlendFloatNumber = [];
            for(let i=0;i<vertsBlendNumbers[j][0].length;i++){
              let tempChar = vertsBlendNumbers[j][0][i];
              if(char.length == 0 && vertsBlendNumbers[j][0][i] != " "){
                char = tempChar;
                continue;
              }else{
                if(vertsBlendNumbers[j][0][i] != " "){
                    char += tempChar;
                }else{
                  let tempFloat = parseFloat(char);
                  char = [];
                  tempVertsBoneBlendFloatNumber.push(tempFloat)
                }
              }  
            }
            vertsBoneBlendFloatNumber.push(tempVertsBoneBlendFloatNumber);
          }

          //vertsBoneBlendMmatrixNumber２頂点ならどの頂点か？
          let currentVerts = 0;
          let vertsBlend = true;
          let tempVertsBlend = [];
          let blendBoneIndex = [];
          for(let j=0;j<armatures.length;j++){
            let tempBlendBoneIndex = [];
            for(let i=0;i<vertsBlendMatrixNumbers[j][0].length;i++){
              let tempChar = vertsBlendMatrixNumbers[j][0][i];
              if(char.length == 0 && vertsBlendMatrixNumbers[j][0][i] != " "){
                char = tempChar;
                continue;
              }else{
                if(vertsBlendMatrixNumbers[j][0][i] != " "){
                    char += tempChar;
                }else{
                  if(vertsBlend == true){
                  let tempFloat = parseFloat(char);
                  char = [];
                  tempVertsBlend.push(tempFloat);
                  //文字列は配列とみなしている可能性あり
                  if(tempVertsBlend.length >= vertsBoneBlendFloatNumber[j][currentVerts]){
                    tempBlendBoneIndex.push(tempVertsBlend);
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
            blendBoneIndex.push(tempBlendBoneIndex);          
          }
          for(let i=0;i<armatures.length;i++){
            daeLoadpack[i].blendBoneIndex = blendBoneIndex[i];
          }
          //boneWeightそれぞれの頂点の重み
          let bonesWeight = [];
          for(let j=0;j<armatures.length;j++){
            let vertsNumber = 0;
            let nowReadVertsNumber = vertsBoneBlendFloatNumber[j][vertsNumber];
            let tempBoneWeight = [];
            let tempBonesWeight = [];
            for(let i=0;i<loadSkinWaight[j][0].length;i++){
              let tempChar = loadSkinWaight[j][0][i];
              if(char.length == 0 && loadSkinWaight[j][0][i] != " "){
                char = tempChar;
                continue;
              }else{
                if(loadSkinWaight[j][0][i] != " "){
                    char += tempChar;
                }else{
                  let tempFloat = parseFloat(char);
                  char = [];
                  tempBoneWeight.push(tempFloat)
                  if(tempBoneWeight.length >= nowReadVertsNumber){
                    tempBonesWeight.push(tempBoneWeight);
                    tempBoneWeight = [];
                    vertsNumber += 1;
                    nowReadVertsNumber = vertsBoneBlendFloatNumber[j][vertsNumber];
                  }
                }
              }  
            }
            bonesWeight.push(tempBonesWeight);
          }
          for(let i=0;i<armatures.length;i++){
            daeLoadpack[i].bonesWeight = bonesWeight[i];
          }
          let boneParentRelation = [];
          //どのボーンが親が調べる
          for(let j=0;j<armatures.length;j++){
            let boneJointList = docelem.getElementsByTagName("node");
            let  tempResult = [];
            let tempBoneParentRelation = [];
            getAllChildNodesDepth(boneJointList[j].children.length, boneJointList[j].children,tempResult,tempBoneParentRelation,daeLoadPack.bonesNameList);
            boneParentRelation.push(tempBoneParentRelation);
          }
          for(let i=0;i<armatures.length;i++){
            daeLoadpack[i].boneParentRelation = boneParentRelation[i];
          }
          //bonesInit
          let bones = [];
          for(let j=0;j<armatures.length;j++){
            let tempBones = [];
            for(let i=0;i<daeLoadPack.bonesNameList.length;i++){
              let boneContents = {};
              boneContents.skinmeshBone = null;
              boneContents.position = setVector3(0,0,0);
              boneContents.rotXYZ = setVector3(0,0,0);
              boneContents.scaleXYZ = setVector3(1,1,1);
              tempBones.push(boneContents);
            }
            bones.push(tempBones);     
          }
          for(let i=0;i<armatures.length;i++){
            daeLoadpack[i].bones = bones[i];
          }
        }else{
          let bones = [];
          let boneContents = {};
          boneContents.position = setVector3(0,0,0);
          boneContents.rotXYZ = setVector3(0,0,0);
          boneContents.scaleXYZ = setVector3(1,1,1);
          bones.push(boneContents);
          daeLoadPack.bones = bones;
          for(let i=0;i<daeLoadPack.objectNumber;i++){
            let bones = [];
            let boneContents = {};
            boneContents.position = setVector3(0,0,0);
            boneContents.rotXYZ = setVector3(0,0,0);
            boneContents.scaleXYZ = setVector3(1,1,1);
            bones.push(boneContents);
            daeLoadpack[i].bones = bones;
          }
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
const PI = Math.PI;
const DEG_TO_RAD = PI / 180;
//const RAD_TO_DEG = 180 / PI;
for(let i = 0; i < 360; i++) {
  sinLut.push(round(Math.sin(i * DEG_TO_RAD)));
  cosLut.push(round(Math.cos(i * DEG_TO_RAD)));
}
sinLut[30] = 0.5;
cosLut[60] = 0.5;
sinLut[150] = 0.5;
cosLut[120] = -0.5;
sinLut[210] = -0.5;
cosLut[240] = -0.5;
sinLut[330] = -0.5;
cosLut[300] = 0.5;

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
   SCREEN_SIZE_W, 0, 0, SCREEN_SIZE_W/2,
   0, SCREEN_SIZE_H, 0, SCREEN_SIZE_H/2,
   0, 0, 1, 0,
   0, 0, 0, 1
];
let inverseViewPortMatrix = getInverseMatrix(viewPortMatrix);

let viewMatrix;
let inverseViewMatrix;
let sunViewMatrix;
// Camera
let cameraPos = setVector3(0.0,-3,-5);
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
    this.shadowFlag = true;
    this.meshVerts = verts.vertsPosition.concat();
    this.meshVertsFaceIndex = verts.faceIndex;
    this.bonesIndex = verts.bonesIndex;
    this.bonesWaight = verts.bonesWaight;

    let faceIndexMeshUV = [];
    //エラーはmonkey
    let meshVertsFaceIndex_Length = this.meshVertsFaceIndex.length;
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
      let Ax = (this.UV[i][2] - this.UV[i][0]) * this.textureImage[Image_Width];
      let Ay = (this.UV[i][3] - this.UV[i][1]) * this.textureImage[Image_Height];
      let Bx = (this.UV[i][4] - this.UV[i][0]) * this.textureImage[Image_Width];
      let By = (this.UV[i][5] - this.UV[i][1]) * this.textureImage[Image_Height];
      let mi = getInvert2(Ax,Ay,Bx,By);
      if (!mi) return;
      let preUV_List0 = this.UV[i][0] * this.textureImage[Image_Width];
      mi.push(preUV_List0);
      let preUV_List1 = this.UV[i][1] * this.textureImage[Image_Height];
      mi.push(preUV_List1);
      UVVector.push(mi);
    }
    this.UVVector = UVVector;
  }
}

//ポリゴン製造
function setPolygon(pos1,pos2,pos3,UVVector){
  
  //sortするのはY座標のみ
	let polygonElement = sort_YPoint(pos1,pos2,pos3);
  	//基底変換　プロジェクションバーティックス＝＞テクスチャ
	//A=テクスチャ側、_A=プロジェクションバーティックス側
	//Ax = a*_Ax + c*_Ay	|Ax| = |_Ax _Ay| |a|		|_Ax _Ay|^-1 |Ax| = |a|
	//Bx = a*_Bx + c*_By 	|Bx|   |_Bx _By| |c|		|_Bx _By|    |Bx|   |c|
	//b,dも考え方同じ
	let _Ax = pos2[0] - pos1[0];
	let _Ay = pos2[1] - pos1[1];
	let _Bx = pos3[0] - pos1[0];
	let _By = pos3[1] - pos1[1];
	let invMat = getTextureInvert(_Ax,_Ay,_Bx,_By);
  //ちっちゃな数はいらない
	polygonElement[AFFINE_A] = affineRound(invMat[0] * UVVector[4] + invMat[1] * UVVector[6]);
	polygonElement[AFFINE_C] = affineRound(invMat[2] * UVVector[4] + invMat[3] * UVVector[6]);
	polygonElement[AFFINE_B] = affineRound(invMat[0] * UVVector[5] + invMat[1] * UVVector[7]);
	polygonElement[AFFINE_D] = affineRound(invMat[2] * UVVector[5] + invMat[3] * UVVector[7]);

  // テクスチャy = b * vertsx + d * vertsy + f アフィン変換の変形
  polygonElement[AFFINE_F] = affineRound(UVVector[1] - (polygonElement[AFFINE_B] * pos1[0] + polygonElement[AFFINE_D] * pos1[1]));
  polygonElement[AFFINE_E] = affineRound(UVVector[0] - (polygonElement[AFFINE_A] * pos1[0] + polygonElement[AFFINE_C] * pos1[1]));

  return polygonElement;
}
function setLightShadow(worldPos1,worldPos2,worldPos3,sunVec){
    //ライトシミュレーション用
    let Va = vecMinus(worldPos1,worldPos2);
    let Vb = vecMinus(worldPos3,worldPos1);
    let polyWorldCross = culVecCross(Va,Vb);
    culVecNormalize(polyWorldCross);
    let sunCosin = culVecDot(sunVec, polyWorldCross)*1.5;//1.5掛けるのは明るさの調節
    sunCosin = ((sunCosin * 100)|0) / 100;
  
    return sunCosin;
}
function polygonDecisionShadowFlagAndLightShadowFlagBackCullingOn(object,zBuffering,shadowMap,projectedVerts,worldVerts,shadowProjectedVerts,meshVertsFaceIndex_Length,
  objectUVVector,sunVec,screen_size_h,screen_size_w){
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    let pos1 = projectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    let pos2 = projectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    let pos3 = projectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    let triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    let triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    let triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    let triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    let Va = vec3CrossZMinus(pos1,pos2);
    let Vb = vec3CrossZMinus(pos3,pos1);
    let crossZ = culVecCrossZ(Va,Vb);
    //zが-の方がこちらに近くなる座標軸だから
    if(crossZ<0){
      let polygonElement = setPolygon(pos1,pos2,pos3,objectUVVector[i]);
      let sunCosin = setLightShadow(worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],
      worldVerts[triangleFaceIndex[2]],sunVec);
      let currentTextureImage = object.textureImage;
      let imageHeight = object.textureImageHeight;
      let imageWidth = object.textureImageWidth;
      scan_vertical(zBuffering,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],polygonElement[PB],
      polygonElement[AFFINE_A],polygonElement[AFFINE_C],polygonElement[AFFINE_B],
      polygonElement[AFFINE_D],polygonElement[AFFINE_F],polygonElement[AFFINE_E],
      currentTextureImage,imageHeight,imageWidth,true,sunCosin); 
    }

    pos1 = shadowProjectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    pos2 = shadowProjectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    pos3 = shadowProjectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    Va = vec3CrossZMinus(pos1,pos2);
    Vb = vec3CrossZMinus(pos3,pos1);
    crossZ = culVecCrossZ(Va,Vb);
    //シャドウマップ用ポリゴン製造3点をYでソートした情報だけていける。
    if(crossZ<0){
      let polygonElement = sort_YPoint(pos1,pos2,pos3);
      scan_ShadowVertical(shadowMap,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],
      polygonElement[PB]);
    }    
  }
}
function polygonDecisionShadowFlagAndLightShadowFlag(object,zBuffering,shadowMap,projectedVerts,worldVerts,shadowProjectedVerts,meshVertsFaceIndex_Length,
  objectUVVector,sunVec,screen_size_h,screen_size_w){
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    let pos1 = projectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    let pos2 = projectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    let pos3 = projectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    let triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    let triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    let triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    let triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    let polygonElement = setPolygon(pos1,pos2,pos3,objectUVVector[i]);
    let sunCosin = setLightShadow(worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],
    worldVerts[triangleFaceIndex[2]],sunVec);
    let currentTextureImage = object.textureImage;
    let imageHeight = object.textureImageHeight;
    let imageWidth = object.textureImageWidth;
    scan_vertical(zBuffering,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],polygonElement[PB],
    polygonElement[AFFINE_A],polygonElement[AFFINE_C],polygonElement[AFFINE_B],
    polygonElement[AFFINE_D],polygonElement[AFFINE_F],polygonElement[AFFINE_E],
    currentTextureImage,imageHeight,imageWidth,true,sunCosin); 

    pos1 = shadowProjectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    pos2 = shadowProjectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    pos3 = shadowProjectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    polygonElement = sort_YPoint(pos1,pos2,pos3);
    scan_ShadowVertical(shadowMap,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],
    polygonElement[PB]);        
  }
}

function polygonDecisionShadowFlagBackCullingOn(object,zBuffering,shadowMap,projectedVerts,shadowProjectedVerts,meshVertsFaceIndex_Length,objectUVVector,screen_size_h,screen_size_w){
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    let pos1 = projectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    let pos2 = projectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    let pos3 = projectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    let triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    let triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    let triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    let triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    let Va = vec3CrossZMinus(pos1,pos2);
    let Vb = vec3CrossZMinus(pos3,pos1);
    let crossZ = culVecCrossZ(Va,Vb);
    //zが-の方がこちらに近くなる座標軸だから
    if(crossZ<0){
      let polygonElement = setPolygon(pos1,pos2,pos3,objectUVVector[i]);
      let currentTextureImage = object.textureImage;
      let imageHeight = object.textureImageHeight;
      let imageWidth = object.textureImageWidth;
      scan_vertical(zBuffering,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],polygonElement[PB],
        polygonElement[AFFINE_A],polygonElement[AFFINE_C],polygonElement[AFFINE_B],
        polygonElement[AFFINE_D],polygonElement[AFFINE_F],polygonElement[AFFINE_E],
        currentTextureImage,imageHeight,imageWidth,true,null); 
    }

    pos1 = shadowProjectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    pos2 = shadowProjectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    pos3 = shadowProjectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    Va = vec3CrossZMinus(pos1,pos2);
    Vb = vec3CrossZMinus(pos3,pos1);
    crossZ = culVecCrossZ(Va,Vb);
    //シャドウマップ用ポリゴン製造3点をYでソートした情報だけていける。
    if(crossZ<0){
      let polygonElement = sort_YPoint(pos1,pos2,pos3);
      scan_ShadowVertical(shadowMap,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],
      polygonElement[PB]);
    }         
  }
}
function polygonDecisionShadowFlag(object,zBuffering,shadowMap,projectedVerts,shadowProjectedVerts,meshVertsFaceIndex_Length,objectUVVector,screen_size_h,screen_size_w){
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    let pos1 = projectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    let pos2 = projectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    let pos3 = projectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    let triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    let triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    let triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    let triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    let polygonElement = setPolygon(pos1,pos2,pos3,objectUVVector[i]);
    let currentTextureImage = object.textureImage;
    let imageHeight = object.textureImageHeight;
    let imageWidth = object.textureImageWidth;
    scan_vertical(zBuffering,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],polygonElement[PB],
      polygonElement[AFFINE_A],polygonElement[AFFINE_C],polygonElement[AFFINE_B],
      polygonElement[AFFINE_D],polygonElement[AFFINE_F],polygonElement[AFFINE_E],
      currentTextureImage,imageHeight,imageWidth,true,null); 
  
    pos1 = shadowProjectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    pos2 = shadowProjectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    pos3 = shadowProjectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    polygonElement = sort_YPoint(pos1,pos2,pos3);
    scan_ShadowVertical(shadowMap,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],
    polygonElement[PB]);   
  }
}
function polygonDecisionLightShadowFlagBackCullingOn(object,zBuffering,projectedVerts,worldVerts,meshVertsFaceIndex_Length,objectUVVector,sunVec,screen_size_h,screen_size_w){
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    let pos1 = projectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    let pos2 = projectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    let pos3 = projectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    let triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    let triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    let triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    let triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    let Va = vec3CrossZMinus(pos1,pos2);
    let Vb = vec3CrossZMinus(pos3,pos1);
    let crossZ = culVecCrossZ(Va,Vb);
    //zが-の方がこちらに近くなる座標軸だから
    if(crossZ<0){
      let polygonElement = setPolygon(pos1,pos2,pos3,objectUVVector[i]);
      let sunCosin = setLightShadow(worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],
      worldVerts[triangleFaceIndex[2]],sunVec);
      let currentTextureImage = object.textureImage;
      let imageHeight = object.textureImageHeight;
      let imageWidth = object.textureImageWidth;
      scan_vertical(zBuffering,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],polygonElement[PB],
      polygonElement[AFFINE_A],polygonElement[AFFINE_C],polygonElement[AFFINE_B],
      polygonElement[AFFINE_D],polygonElement[AFFINE_F],polygonElement[AFFINE_E],
      currentTextureImage,imageHeight,imageWidth,false,sunCosin); 
    }        
  }
}

function polygonDecisionLightShadowFlag(object,zBuffering,projectedVerts,worldVerts,meshVertsFaceIndex_Length,objectUVVector,sunVec,screen_size_h,screen_size_w){
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    let pos1 = projectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    let pos2 = projectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    let pos3 = projectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    let triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    let triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    let triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    let triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    let polygonElement = setPolygon(pos1,pos2,pos3,objectUVVector[i]);
    let sunCosin = setLightShadow(worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],
    worldVerts[triangleFaceIndex[2]],sunVec);
    let currentTextureImage = object.textureImage;
    let imageHeight = object.textureImageHeight;
    let imageWidth = object.textureImageWidth;
    scan_vertical(zBuffering,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],polygonElement[PB],
    polygonElement[AFFINE_A],polygonElement[AFFINE_C],polygonElement[AFFINE_B],
    polygonElement[AFFINE_D],polygonElement[AFFINE_F],polygonElement[AFFINE_E],
    currentTextureImage,imageHeight,imageWidth,false,sunCosin);      
  }
}

function polygonDecisionBackCullingOn(object,zBuffering,projectedVerts,meshVertsFaceIndex_Length,objectUVVector,screen_size_h,screen_size_w){
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    let pos1 = projectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    let pos2 = projectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    let pos3 = projectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    let triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    let triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    let triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    let triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    let Va = vec3CrossZMinus(pos1,pos2);
    let Vb = vec3CrossZMinus(pos3,pos1);
    let crossZ = culVecCrossZ(Va,Vb);
    //zが-の方がこちらに近くなる座標軸だから
    if(crossZ<0){
      let polygonElement = setPolygon(pos1,pos2,pos3,objectUVVector[i]);
      let currentTextureImage = object.textureImage;
      let imageHeight = object.textureImageHeight;
      let imageWidth = object.textureImageWidth;
      scan_vertical(zBuffering,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],polygonElement[PB],
        polygonElement[AFFINE_A],polygonElement[AFFINE_C],polygonElement[AFFINE_B],
        polygonElement[AFFINE_D],polygonElement[AFFINE_F],polygonElement[AFFINE_E],
        currentTextureImage,imageHeight,imageWidth,false,null); 
    } 
  }
}
function polygonDecision(object,zBuffering,projectedVerts,meshVertsFaceIndex_Length,objectUVVector,screen_size_h,screen_size_w){
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    let pos1 = projectedVerts[triangleFaceIndex[0]];
    if(pos1 == null) continue;
    let pos2 = projectedVerts[triangleFaceIndex[1]];
    if(pos2 == null) continue;
    let pos3 = projectedVerts[triangleFaceIndex[2]];
    if(pos3 == null) continue;
    let triangleXMin = minXPosCul(pos1,pos2,pos3);
    if(triangleXMin>=screen_size_w) continue;
    let triangleXMax = maxXPosCul(pos1,pos2,pos3);
    if(triangleXMax<0) continue;
    let triangleYMin = minYPosCul(pos1,pos2,pos3);
    if(triangleYMin >= screen_size_h) continue;
    let triangleYMax = maxYPosCul(pos1,pos2,pos3);
    if(triangleYMax < 0) continue;
    let polygonElement = setPolygon(pos1,pos2,pos3,objectUVVector[i]);
    let currentTextureImage = object.textureImage;
    let imageHeight = object.textureImageHeight;
    let imageWidth = object.textureImageWidth;
    scan_vertical(zBuffering,screen_size_h,screen_size_w,polygonElement[PT],polygonElement[PM],polygonElement[PB],
      polygonElement[AFFINE_A],polygonElement[AFFINE_C],polygonElement[AFFINE_B],
      polygonElement[AFFINE_D],polygonElement[AFFINE_F],polygonElement[AFFINE_E],
      currentTextureImage,imageHeight,imageWidth,false,null); 
  }
}

//スキンメッシュ用シャドウマップ付き
function objectSkinMeshPolygonPush(object,zBuffering,shadowMap,viewMatrix,shadowViewMatrix,sunVec,screen_size_h,screen_size_w){
  let worldVerts = [];
  let projectedVerts = [];
  let shadowProjectedVerts = [];

  let objectMeshVerts = object.meshVerts;
  let meshVerts_Length = objectMeshVerts.length;
  let shadowFlag = object.shadowFlag;
  let objectBones = object.bones;
  let objectBonesWeight = object.bonesWeight;
  let objectBlendBoneIndex = object.blendBoneIndex;
  if(shadowFlag == true){
    for (let i=0; i < meshVerts_Length; i++) {
      let objectBlendBoneIndex_i  = objectBlendBoneIndex[i];
      let blendBoneIndex_Length = objectBlendBoneIndex_i.length;
      let mixMatrix =  matCopy(objectBones[objectBlendBoneIndex_i[0]].skinmeshBone);
      matWaight(mixMatrix,objectBonesWeight[i][0]);
      //頂点のboneの影響度
      for(let j=1;j<blendBoneIndex_Length;j++){
        matWaightAndPlus(mixMatrix,objectBones[objectBlendBoneIndex_i[j]].skinmeshBone,objectBonesWeight[i][j])
      }
      let boneWeightVerts = matVecMul(mixMatrix,objectMeshVerts[i]);

      let shadowViewZ = matMulVertsZCamera(shadowViewMatrix,boneWeightVerts);
      if(shadowViewZ > 0){
          let shadowProjectionMatrix =  matPers(shadowViewZ);
          let shadowVerts = matMulVertsXYZCamera(shadowViewMatrix,boneWeightVerts,shadowViewZ);
          protMatVecMul(shadowProjectionMatrix,shadowVerts); 
          shadowVerts[0] = ((shadowVerts[0] + 0.5)*screen_size_w)|0;
          shadowVerts[1] = ((shadowVerts[1] + 0.5)*screen_size_h)|0;   
        shadowProjectedVerts[i] = shadowVerts;   
      }else{
        shadowProjectedVerts[i] = null;
      }

      let viewZ = matMulVertsZCamera(viewMatrix,boneWeightVerts);
      if(viewZ <= 0){
        //ラスタライズしないのでnull、ポリゴンのuv値を合わせたいので飛ばさない。
        projectedVerts[i] = null;
        worldVerts[i] = null;
        continue;
      }
      worldVerts[i] = boneWeightVerts;
      let projectionMatrix =  matPers(viewZ);
      let cameraBoneWeightVerts = matMulVertsXYZCamera(viewMatrix,boneWeightVerts,viewZ);
      protMatVecMul(projectionMatrix,cameraBoneWeightVerts);
      //boneWeightVerts = matVecMul(viewPortMatrix,boneWeightVerts);
      cameraBoneWeightVerts[0] = ((cameraBoneWeightVerts[0] + 0.5)*screen_size_w)|0;
      cameraBoneWeightVerts[1] = ((cameraBoneWeightVerts[1] + 0.5)*screen_size_h)|0;
      projectedVerts[i] = cameraBoneWeightVerts;
    }
  }else{
    for (let i=0; i < meshVerts_Length; i++) {
      let objectBlendBoneIndex_i  = objectBlendBoneIndex[i];
      let blendBoneIndex_Length = objectBlendBoneIndex_i.length;
      let mixMatrix =  matCopy(objectBones[objectBlendBoneIndex_i[0]].skinmeshBone);
      matWaight(mixMatrix,objectBonesWeight[i][0]);
      //頂点のboneの影響度
      for(let j=1;j<blendBoneIndex_Length;j++){
        matWaightAndPlus(mixMatrix,objectBones[objectBlendBoneIndex_i[j]].skinmeshBone,objectBonesWeight[i][j])
      }
      let boneWeightVerts = matVecMul(mixMatrix,objectMeshVerts[i]);
      let viewZ = matMulVertsZCamera(viewMatrix,boneWeightVerts);
      if(viewZ <= 0){
        //ラスタライズしないのでnull、ポリゴンのuv値を合わせたいので飛ばさない。
        projectedVerts[i] = null;
        worldVerts[i] = null;
        continue;   
      }
      worldVerts[i] = boneWeightVerts;
      let projectionMatrix =  matPers(viewZ);
      let cameraBoneWeightVerts = matMulVertsXYZCamera(viewMatrix,boneWeightVerts,viewZ);
      protMatVecMul(projectionMatrix,cameraBoneWeightVerts);
      //boneWeightVerts = matVecMul(viewPortMatrix,boneWeightVerts);
      cameraBoneWeightVerts[0] = ((cameraBoneWeightVerts[0] + 0.5)*screen_size_w)|0;
      cameraBoneWeightVerts[1] = ((cameraBoneWeightVerts[1] + 0.5)*screen_size_h)|0;
      projectedVerts[i] = cameraBoneWeightVerts;
    }
  }
  
  let meshVertsFaceIndex_Length = object.meshVertsFaceIndex.length;
  let backCullingFlag = object.backCullingFlag;
  let objectUVVector = object.UVVector
  let lightShadowFlag = object.lightShadowFlag;
  
  if(shadowFlag == true && lightShadowFlag == true){
    if(backCullingFlag == true){
      polygonDecisionShadowFlagAndLightShadowFlagBackCullingOn(object,zBuffering,shadowMap,projectedVerts,worldVerts,shadowProjectedVerts,
        meshVertsFaceIndex_Length,objectUVVector,sunVec,screen_size_h,screen_size_w); 
    }else{
      polygonDecisionShadowFlagAndLightShadowFlag(object,zBuffering,shadowMap,projectedVerts,worldVerts,shadowProjectedVerts,
      meshVertsFaceIndex_Length,objectUVVector,sunVec,screen_size_h,screen_size_w);  
    }
  }else if(shadowFlag == true){
    if(backCullingFlag == true){
      polygonDecisionShadowFlagBackCullingOn(object,zBuffering,shadowMap,projectedVerts,shadowProjectedVerts,meshVertsFaceIndex_Length,
        objectUVVector,screen_size_h,screen_size_w); 
    }else{
       polygonDecisionShadowFlag(object,zBuffering,shadowMap,projectedVerts,shadowProjectedVerts,meshVertsFaceIndex_Length,
      objectUVVector,screen_size_h,screen_size_w); 
    }
  }else if(lightShadowFlag == true){
    if(backCullingFlag == true){
      polygonDecisionLightShadowFlagBackCullingOn(object,zBuffering,projectedVerts,worldVerts,meshVertsFaceIndex_Length,
        objectUVVector,sunVec,screen_size_h,screen_size_w);
    }else{
      polygonDecisionLightShadowFlag(object,zBuffering,projectedVerts,worldVerts,meshVertsFaceIndex_Length,
        objectUVVector,sunVec,screen_size_h,screen_size_w);
    }
  }else{
    if(backCullingFlag == true){
      polygonDecisionBackCullingOn(object,zBuffering,projectedVerts,meshVertsFaceIndex_Length,objectUVVector,screen_size_h,screen_size_w); 
    }else{
      polygonDecision(object,zBuffering,projectedVerts,meshVertsFaceIndex_Length,objectUVVector,screen_size_h,screen_size_w);  
    }
  }
}

function daeMekeSkinMeshBone(daeLoadPack){
  //rootBone
  let copyInverseBindPose = matCopy(daeLoadPack.bindPosePack[0].inverseBindPose);
  //クォータニオン
  let quaternionOut = [];
  slerpQuaternionArray(quaternionOut,daeLoadPack.bones[0].quaternionTime,daeLoadPack.bones[0].quaternion,daeLoadPack.bones[0].quaternionTime.length,daeLoadPack.bones[0].currentTime);
  //slerpQuaternion(quaternionOut,daeLoadPack.bones[boneParentRelation].preQuaternion,daeLoadPack.bones[boneParentRelation].afterQuaternion,daeLoadPack.bones[boneParentRelation].currentTime);
  let quaternionMatrix = makeQuaternionMatrix(quaternionOut);
  quaternionMatrixTranstation(quaternionMatrix,daeLoadPack.bones[0].position[0],daeLoadPack.bones[0].position[1],daeLoadPack.bones[0].position[2]);
  quaternionMatrixScaling(quaternionMatrix,daeLoadPack.bones[0].scaleXYZ[0],daeLoadPack.bones[0].scaleXYZ[1],daeLoadPack.bones[0].scaleXYZ[2]);
  matDirectMul(copyInverseBindPose,quaternionMatrix);
  //オイラー角
  // mulMatTranslate(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].position[0],
  // daeLoadPack.bones[boneParentRelation].position[1],daeLoadPack.bones[boneParentRelation].position[2]);
  // mulMatRotateX(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[0]);
  // mulMatRotateY(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[1]);
  // mulMatRotateZ(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[2]);
  // mulMatScaling(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].scaleXYZ[0],
  // daeLoadPack.bones[boneParentRelation].scaleXYZ[1],daeLoadPack.bones[boneParentRelation].scaleXYZ[2]);  
  matDirectMul(copyInverseBindPose,daeLoadPack.bindPosePack[0].bindPose);
  daeLoadPack.bones[0].skinmeshBone = copyInverseBindPose;

  let boneParentRelationRow = daeLoadPack.boneParentRelation.length;
  for(let j=0;j<boneParentRelationRow;j++){
    let boneParentRelationCol = daeLoadPack.boneParentRelation[j].length;
    //i=0,rootBone
    for(let i=1;i<boneParentRelationCol;i++){
      let boneParentRelation = daeLoadPack.boneParentRelation[j][i];
      if(daeLoadPack.bones[boneParentRelation].skinmeshBone  == null){
        let parentCrossBone = matMul(daeLoadPack.bones[daeLoadPack.boneParentRelation[j][i-1]].skinmeshBone,daeLoadPack.bindPosePack[boneParentRelation].inverseBindPose);
        //クォータニオン
        let quaternionOut = [];
        slerpQuaternionArray(quaternionOut,daeLoadPack.bones[boneParentRelation].quaternionTime,daeLoadPack.bones[boneParentRelation].quaternion,daeLoadPack.bones[boneParentRelation].quaternionTime.length,daeLoadPack.bones[boneParentRelation].currentTime);
        //slerpQuaternion(quaternionOut,daeLoadPack.bones[boneParentRelation].preQuaternion,daeLoadPack.bones[boneParentRelation].afterQuaternion,daeLoadPack.bones[boneParentRelation].currentTime);
        let QuaternionMatrix = makeQuaternionMatrix(quaternionOut);
        matDirectMul(parentCrossBone,QuaternionMatrix);
        //オイラー角
        // mulMatRotateX(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[0]);
        // mulMatRotateY(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[1]);
        // mulMatRotateZ(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[2]);
        matDirectMul(parentCrossBone,daeLoadPack.bindPosePack[boneParentRelation].bindPose);
        daeLoadPack.bones[boneParentRelation].skinmeshBone = parentCrossBone;
       }
    }
  }
}
//ボーンなしシャドウマップ付き
function objectPolygonPush(object,zBuffering,shadowMap,viewMatrix,shadowViewMatrix,sunVec,screen_size_h,screen_size_w){

  let worldVerts = [];
  let projectedVerts = [];
  let shadowProjectedVerts = [];

  let objectMeshVerts = object.meshVerts;
  let meshVerts_Length = objectMeshVerts.length;
  let shadowFlag = object.shadowFlag;

  let worldTranslationScaleXYZ = object.bones[0].scaleXYZ;
  let worldTranslationSQuaternion = quaternionXYZRoll(object.bones[0].rotXYZ[0],object.bones[0].rotXYZ[1],object.bones[0].rotXYZ[2]);
  let worldTranslationPosition = object.bones[0].position;
  if(shadowFlag == true){
    for (let i=0; i < meshVerts_Length; i++) {
      //w=0は意味なしクォータニオンの計算するため
      let verts = Quaternion(objectMeshVerts[i][0]*worldTranslationScaleXYZ[position_X],objectMeshVerts[i][1]*worldTranslationScaleXYZ[position_Y],
        objectMeshVerts[i][2]*worldTranslationScaleXYZ[position_Z],0);
      Vector3QuaternionMul(worldTranslationSQuaternion,verts);
      vecPlus(verts,worldTranslationPosition);
      //let verts =  matVecMul(worldMatrix,object.meshVerts[i]);

      let shadowViewZ = matMulVertsZCamera(shadowViewMatrix,verts);
      if(shadowViewZ > 0){
        let shadowProjectionMatrix =  matPers(shadowViewZ);
        let shadowVerts = matMulVertsXYZCamera(shadowViewMatrix,verts,shadowViewZ);
        protMatVecMul(shadowProjectionMatrix,shadowVerts); 
        shadowVerts[0] = ((shadowVerts[0] + 0.5)*screen_size_w)|0;
        shadowVerts[1] = ((shadowVerts[1] + 0.5)*screen_size_h)|0;   
        shadowProjectedVerts[i] = shadowVerts;   
      }else{
        shadowProjectedVerts[i] = null;
      }

      let viewZ = matMulVertsZCamera(viewMatrix,verts);
      if(viewZ <= 0){
        //ラスタライズしないのでnull、ポリゴンのuv値を合わせたいので飛ばさない。
        projectedVerts[i] = null;
        worldVerts[i] = null;
        continue;      
      }
      worldVerts[i] = verts;
      let projectionMatrix =  matPers(viewZ);
      let cameraVerts = matMulVertsXYZCamera(viewMatrix,verts,viewZ);
      protMatVecMul(projectionMatrix,cameraVerts);
      //normalVerts = matVecMul(viewPortMatrix,normalVerts);
      cameraVerts[0] = ((cameraVerts[0] + 0.5)*screen_size_w)|0;
      cameraVerts[1] = ((cameraVerts[1] + 0.5)*screen_size_h)|0;
      projectedVerts[i] = cameraVerts;    
    }
  }else{
    for (let i=0; i < meshVerts_Length; i++) {
      //w=0は意味なしクォータニオンの計算するため
      let verts = Quaternion(objectMeshVerts[i][0]*worldTranslationScaleXYZ[position_X],objectMeshVerts[i][1]*worldTranslationScaleXYZ[position_Y],
        objectMeshVerts[i][2]*worldTranslationScaleXYZ[position_Z],0);
      Vector3QuaternionMul(worldTranslationSQuaternion,verts);
      vecPlus(verts,worldTranslationPosition);
      //let verts =  matVecMul(worldMatrix,object.meshVerts[i]);

      let viewZ = matMulVertsZCamera(viewMatrix,verts);
      if(viewZ <= 0){
        //ラスタライズしないのでnull、ポリゴンのuv値を合わせたいので飛ばさない。
        projectedVerts[i] = null;
        worldVerts[i] = null;
        continue;
      }
      worldVerts[i] = verts;
      let projectionMatrix =  matPers(viewZ);
      let cameraVerts = matMulVertsXYZCamera(viewMatrix,verts,viewZ);
      protMatVecMul(projectionMatrix,cameraVerts);
      //normalVerts = matVecMul(viewPortMatrix,normalVerts);
      cameraVerts[0] = ((cameraVerts[0] + 0.5)*screen_size_w)|0;
      cameraVerts[1] = ((cameraVerts[1] + 0.5)*screen_size_h)|0;
      projectedVerts[i] = cameraVerts;
    }
  }

  let meshVertsFaceIndex_Length = object.meshVertsFaceIndex.length;
  let backCullingFlag = object.backCullingFlag;
  let objectUVVector = object.UVVector
  let lightShadowFlag = object.lightShadowFlag;
  
  if(shadowFlag == true && lightShadowFlag == true){
    if(backCullingFlag == true){
      polygonDecisionShadowFlagAndLightShadowFlagBackCullingOn(object,zBuffering,shadowMap,projectedVerts,worldVerts,shadowProjectedVerts,
        meshVertsFaceIndex_Length,objectUVVector,sunVec,screen_size_h,screen_size_w); 
    }else{
      polygonDecisionShadowFlagAndLightShadowFlag(object,zBuffering,shadowMap,projectedVerts,worldVerts,shadowProjectedVerts,
      meshVertsFaceIndex_Length,objectUVVector,sunVec,screen_size_h,screen_size_w);  
    }
  }else if(shadowFlag == true){
    if(backCullingFlag == true){
      polygonDecisionShadowFlagBackCullingOn(object,zBuffering,shadowMap,projectedVerts,shadowProjectedVerts,meshVertsFaceIndex_Length,
        objectUVVector,screen_size_h,screen_size_w); 
    }else{
       polygonDecisionShadowFlag(object,zBuffering,shadowMap,projectedVerts,shadowProjectedVerts,meshVertsFaceIndex_Length,
      objectUVVector,screen_size_h,screen_size_w); 
    }
  }else if(lightShadowFlag == true){
    if(backCullingFlag == true){
      polygonDecisionLightShadowFlagBackCullingOn(object,zBuffering,projectedVerts,worldVerts,meshVertsFaceIndex_Length,
        objectUVVector,sunVec,screen_size_h,screen_size_w);
    }else{
      polygonDecisionLightShadowFlag(object,zBuffering,projectedVerts,worldVerts,meshVertsFaceIndex_Length,
        objectUVVector,sunVec,screen_size_h,screen_size_w);
    }
  }else{
    if(backCullingFlag == true){
      polygonDecisionBackCullingOn(object,zBuffering,projectedVerts,meshVertsFaceIndex_Length,objectUVVector,screen_size_h,screen_size_w); 
    }else{
      polygonDecision(object,zBuffering,projectedVerts,meshVertsFaceIndex_Length,objectUVVector,screen_size_h,screen_size_w);  
    }
  }
}

//ループに入る前に生成 z = 99999;pushを使わないようにするため
function renderBufferInit(buffer,pixelY,pixelX){
  for(let y=0;y<pixelY;y++){
    buffer[y] = [];
    for(let x=0;x<pixelX;x++){
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
    let r = Math.sin(circleDeg * j*PI/180);
    let z = Math.cos(circleDeg * j*PI/180);
    for(let i=0;i<numCorners;i++){
      let verts = [];
      let orginX = Math.sin(circleDeg * i*PI/180) * r;
      let orginY = Math.cos(circleDeg * i*PI/180) * r;
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
	// monkeys.push(new Object(monkeyVerts,0.0,-0.6,0,180,0,0,0.5,0.5,0.5,0,false,true,monkeyPixelImage));
	// monkeyLoad.push(new ModelLoadData(monkeys[0]));
	// monkeyLoad[0].JSONLoader("cube.json", (() => monkeyLoad[0].onJSONLoaded()));	
}, true);	
//sky
let sphereVerts8 = makeSphereVerts(16,10);
let spheres = [];
let skyImage = new Image();
skyImage.src = 'sky.png';

let skyPixelImage = [];

skyImage.addEventListener("load", function() {
	skyPixelImage = pictureToPixelMap(backCtx,skyImage);
	//spheres.push(new Object(sphereVerts8,0.0,0.0,5,0,0,0,16,true,false,skyPixelImage));
}, true);

//box
let cubes = [];
let cubeImage = new Image();
cubeImage.src = 'tire.png';

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
  let UVVector = [];
  let faceIndexMeshUV_Length = daeLoadPack.faceIndexMeshUV.length;
  let imageHeight = daeLoadPack.textureImage.length;
  let imageWidth = daeLoadPack.textureImage[1].length;
  for(let i=0;i<faceIndexMeshUV_Length;i++){
    let Ax = (daeLoadPack.faceIndexMeshUV[i][2] - daeLoadPack.faceIndexMeshUV[i][0]) * imageWidth;
    let Ay = (daeLoadPack.faceIndexMeshUV[i][3] - daeLoadPack.faceIndexMeshUV[i][1]) * imageHeight;
    let Bx = (daeLoadPack.faceIndexMeshUV[i][4] - daeLoadPack.faceIndexMeshUV[i][0]) * imageWidth;
    let By = (daeLoadPack.faceIndexMeshUV[i][5] - daeLoadPack.faceIndexMeshUV[i][1]) * imageHeight;
    let mi = [];
    let u = daeLoadPack.faceIndexMeshUV[i][0] * imageWidth;
    let v = daeLoadPack.faceIndexMeshUV[i][1] * imageHeight;
    let preUV_List0 = round100(u);
    mi.push(preUV_List0);
    let preUV_List1 = round100(v);
    mi.push(preUV_List1);
    let uMin = top_int(u);
    if(uMin<0) uMin = 0;
    if(uMin>imageWidth-1) uMin = imageWidth-1;
    let vMin = top_int(v);
    if(vMin<0) vMin = 0;
    if(vMin>imageHeight-1) vMin = imageHeight-1;
    mi.push(uMin);
    mi.push(vMin);
    mi.push(Ax);
    mi.push(Ay);
    mi.push(Bx);
    mi.push(By);
    UVVector.push(mi);
  }
  daeLoadPack.UVVector = UVVector;
}
function Quaternion(x,y, z, w){
  return [x,y,z,w];
}
/// 共役Quaternion
function Conjugated(x,y,z,w){
  return Quaternion(-x, -y, -z, w);
}
function vector3QuaternionMul(a,b)
{
  // Quaternion同士の積の計算verts(b)の[3]=0
  let b0 = b[0];
  let b1 = b[1];
  let b2 = b[2];
    b[0] =  a[3] * b0 - a[2] * b1 + a[1] * b2,
    b[1] =  a[2] * b0 + a[3] * b1 - a[0] * b2,
    b[2] = - a[1] * b0 + a[0] * b1 + a[3] * b2,
    b[3] = - a[0] * b0 - a[1] * b1 - a[2] * b2
}
function QuaternionMul(a,b)
{
  // Quaternion同士の積の計算
  return Quaternion(
      a[0] * b[3] + a[3] * b[0] - a[2] * b[1] + a[1] * b[2],
      a[1] * b[3] + a[2] * b[0] + a[3] * b[1] - a[0] * b[2],
      a[2] * b[3] - a[1] * b[0] + a[0] * b[1] + a[3] * b[2],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
  );
}

function outputVector3QuaternionMul(a,b)
{
  // Quaternion同士の積の計算w=a[3]は無視
  let a0 = a[0];
  let a1 = a[1];
    a[0] =  a0 * b[3] + a[3] * b[0] - a[2] * b[1] + a1 * b[2];
    a[1] =  a1 * b[3] + a[2] * b[0] + a[3] * b[1] - a0 * b[2];
    a[2] =  a[2] * b[3] - a1 * b[0] + a0 * b[1] + a[3] * b[2];
}
function Vector3QuaternionMul(a,b){
  // ベクトルをQuaternionに変換 q * p * q^-1 でベクトルを回転。w=0とおいて、最後wを無視する。
  //同じクォータニオンでもp(b)が元の頂点、q(a)が回転させたい軸、出力が回転させた結果
  let aConjugated = Conjugated(a[0],a[1],a[2],a[3]);
  vector3QuaternionMul(a,b);
  outputVector3QuaternionMul(b,aConjugated);
}

/// 回転角度と回転軸からQuaternionを作成する
function QuaternionAngleAxis(angle,axis){
  let  halfRad = top_int(angle * 0.5);
  let sin;
  let cos;
  if(halfRad<0){
    halfRad = 360 + halfRad;
    cos = cosLut[halfRad];
    sin = sinLut[halfRad];        
  }else{
    cos = cosLut[halfRad];
    sin = sinLut[halfRad]; 
  }
  culVecNormalize(axis);
  return Quaternion(axis[0] * sin, axis[1] * sin, axis[2] * sin, cos);
}
function quaternionXRoll(angle){
  let  halfRad = top_int(angle * 0.5);
  let sin;
  let cos;
  if(halfRad<0){
    halfRad = 360 + halfRad;
    cos = cosLut[halfRad];
    sin = sinLut[halfRad];        
  }else{
    cos = cosLut[halfRad];
    sin = sinLut[halfRad]; 
  }
  return Quaternion(sin,0,0,cos);
}
function quaternionYRoll(angle){
  let  halfRad = top_int(angle * 0.5);
  let sin;
  let cos;
  if(halfRad<0){
    halfRad = 360 + halfRad;
    cos = cosLut[halfRad];
    sin = sinLut[halfRad];        
  }else{
    cos = cosLut[halfRad];
    sin = sinLut[halfRad]; 
  }
  return Quaternion(0,sin,0,cos);
}
function quaternionXYRoll(angleX,angleY){
  let  halfRad = top_int(angleX * 0.5);
  let sinX;
  let cosX;
  if(halfRad<0){
    halfRad = 360 + halfRad;
    cosX = cosLut[halfRad];
    sinX = sinLut[halfRad];        
  }else{
    cosX = cosLut[halfRad];
    sinX = sinLut[halfRad]; 
  }
  halfRad = top_int(angleY * 0.5);
  let sinY;
  let cosY;
  if(halfRad<0){
    halfRad = 360 + halfRad;
    cosY = cosLut[halfRad];
    sinY = sinLut[halfRad];        
  }else{
    cosY = cosLut[halfRad];
    sinY = sinLut[halfRad]; 
  }
  return Quaternion(sinX*cosY,cosX*sinY,sinX*sinY,cosX*cosY);
  //０をはじいた
  // Quaternion同士の積の計算
  //  Quaternion(
  //   a[0] * b[3],
  //   a[3] * b[1],
  //   a[0] * b[1],
  //   a[3] * b[3]
  // );
}
function QuaternionXYZRollMul(a,b)
{
  //０をはじいた
  // Quaternion同士の積の計算
  return Quaternion(
      a[0] * b[3] + a[1] * b[2],
      a[1] * b[3] - a[0] * b[2],
      a[2] * b[3] + a[3] * b[2],
      a[3] * b[3] - a[2] * b[2]
  );
}
function quaternionZRoll(angle){
  let  halfRad = top_int(angle * 0.5);
  let sin;
  let cos;
  if(halfRad<0){
    halfRad = 360 + halfRad;
    cos = cosLut[halfRad];
    sin = sinLut[halfRad];        
  }else{
    cos = cosLut[halfRad];
    sin = sinLut[halfRad]; 
  }
  return Quaternion(0,0,sin,cos);
}
function quaternionXYZRoll(XAngle,YAngle,ZAngle){
  let quaternionxy = quaternionXYRoll(XAngle,YAngle);
  let quaternionz = quaternionZRoll(ZAngle);
  return QuaternionXYZRollMul(quaternionxy,quaternionz)
}

function quaternionMatrixTranstation(quaternionMatrix,x,y,z){
  quaternionMatrix[3] = x;
  quaternionMatrix[7] = y;
  quaternionMatrix[11] = z;
}
function quaternionMatrixScaling(quaternionMatrix,x,y,z){
  quaternionMatrix[0] *= x;
  quaternionMatrix[5] *= y;
  quaternionMatrix[10] *= z;
}

//回転行列を元に作られたQuaternion行列
function makeQuaternionMatrix(q){
  let mul2q0 = 2*q[0];
  let pow2qx = mul2q0*q[0];
  let qxqy = mul2q0*q[1];
  let qxqz = mul2q0*q[2];
  let qxqw = mul2q0*q[3];
  let mul2q1 = 2*q[1];
  let pow2qy = mul2q1*q[1];
  let qyqz = mul2q1*q[2];
  let qyqw = mul2q1*q[3];
  let mul2q2 = 2*q[2];
  let pow2qz = mul2q2*q[2];
  let qzqw = mul2q2*q[3];
  let pow2qwMinus1 = 2*q[3]*q[3]-1;
  
   return [pow2qwMinus1+pow2qx,qxqy-qzqw,qxqz+qyqw,0,
          qxqy+qzqw,pow2qwMinus1+pow2qy,qyqz-qxqw,0,
          qxqz-qyqw,qyqz+qxqw,pow2qwMinus1+pow2qz,0];
}
//original
//   let pow2qx = 2*q[0]*q[0];
//   let qxqy = 2*q[0]*q[1];
//   let qxqz = 2*q[0]*q[2];
//   let qxqw = 2*q[0]*q[3];
//   let pow2qy = 2*q[1]*q[1];
//   let qyqz = 2*q[1]*q[2];
//   let qyqw = 2*q[1]*q[3];
//   let pow2qz = 2*q[2]*q[2];
//   let qzqw = 2*q[2]*q[3];
//   let pow2qw = 2*q[3]*q[3];
  
//    return [pow2qw+pow2qx-1,qxqy-qzqw,qxqz+qyqw,0,
//           qxqy+qzqw,pow2qw+pow2qy-1,qyqz-qxqw,0,
//           qxqz-qyqw,qyqz+qxqw,pow2qw+pow2qz-1,0];
// }
/*
** 複数のクォータニオン間の球面線形補間（折れ線）
**   out ← t[i] におけるクォータニオン q[i], 0 <= i < tNum に対する
**        u における補間値
**        
*/
function slerpQuaternionArray(out,t,q,tNum,currentTime){
  let i = 0, j = tNum - 1;

  /* currentTime を含む t の区間 [t[i], t[i+1]) を二分法で求める */
  while (i < j) {
    let k = ((i + j) * 0.5)|0;
    if (t[k] < currentTime)
      i = k + 1;
    else
      j = k;
  }
  if (i > 0) --i;
  slerpQuaternion(out, q[i], q[i + 1], (currentTime - t[i]) / (t[i + 1] - t[i]));
}

// クォータニオン球面線形補間
function slerpQuaternion(out,q1,q2,t) {
  // 角度算出
  let dot = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];
  let angle = Math.acos(dot);
  let sin = Math.sin(angle);
  if (sin <= 0.0) {
    out[0] = q1[0];
    out[1] = q1[1];
    out[2] = q1[2];
    out[3] = q1[3];
    return;
  }else{
    //０で割らせないようにする。
    if(sin == 0){
      out[0] = q1[0];
      out[1] = q1[1];
      out[2] = q1[2];
      out[3] = q1[3];
      return;
    }
    let  anglet = angle * t;
    let angleMinusAnglet = angle-anglet;
    let angleMinusAngletSin;
    if(angleMinusAnglet<0){
      angleMinusAnglet = (((angleMinusAnglet * 180 /PI)|0)) + 360;
      angleMinusAngletSin = sinLut[angleMinusAnglet];
    }else{
      angleMinusAnglet = (angleMinusAnglet * 180 /PI)|0
      angleMinusAngletSin = sinLut[angleMinusAnglet];
    }
    let angletSin;
    if(anglet<0){
      anglet = ((anglet * 180 /PI)|0) + 360;
      angletSin = sinLut[anglet];
    }else{
      anglet = (anglet * 180 /PI)|0
      angletSin = sinLut[anglet];
    }
    let  t1 = angletSin / sin;
    let  t0 = angleMinusAngletSin / sin;
    
    out[0] = q1[0] * t0 + q2[0] * t1;
    out[1] = q1[1] * t0 + q2[1] * t1;
    out[2] = q1[2] * t0 + q2[2] * t1;
    out[3] = q1[3] * t0 + q2[3] * t1;
  }
}

let rot = 0;
let rotPlus = 5;
///線形補間
let t = 0;
let tPuls = 0.1;
const gravity = 0.01;
let theta = 0;

let dataLoad = false;
let skyPixelImageLoad = false;
let cubePixelImageLoad = false;
let roadPixelImageLoad = false;
let sandPixelImageLoad = false;
let dicePixelImageLoad = false;
let steve1Load = false;
let cube1Load = false;
let sphere1Load = false;
let sandLoad = false;

const screen_size_h = SCREEN_SIZE_H;
const screen_size_w = SCREEN_SIZE_W;

const invScreen_size_h = 1/screen_size_h;
const invScreen_size_w = 1/screen_size_w;

const RED = 0;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;

//baseRGBA,viewPortをあらかじめ計算しておく。
let shadowViewPortY = [];
let shadowViewPortX = [];
let basearray = [];

for (let pixelY=0; pixelY<screen_size_h;pixelY++) {
  basearray[pixelY] = [];
  //inverseViewPort
  let tmpShadowViewPortY = (pixelY*invScreen_size_h  - 0.5);
  shadowViewPortY[pixelY] = tmpShadowViewPortY;
  for (let pixelX=0;pixelX<screen_size_w;pixelX++) {
    let baseRGBA = [];
    let tmpBase = (pixelY * screen_size_w + pixelX) * 4;
    baseRGBA[RED] = tmpBase + 0;
    baseRGBA[GREEN] = tmpBase + 1;
    baseRGBA[BLUE] = tmpBase + 2;
    baseRGBA[ALPHA] = tmpBase + 3;
    basearray[pixelY][pixelX] = baseRGBA;
    //inverseViewPort
    let tmpShadowViewPortX = (pixelX*invScreen_size_w  - 0.5);
    shadowViewPortX[pixelX] = tmpShadowViewPortX;
  }
}

//zBufferInit
let shadowMap = [];
shdowBufferInit(shadowMap,screen_size_h,screen_size_w);
let zBuffering = [];
renderBufferInit(zBuffering,screen_size_h,screen_size_w);
let myImageData = ctx.createImageData(screen_size_w, screen_size_h);
//アクセス用
let myImageDataDataImage = myImageData.data;
for (let pixelY=0; pixelY<screen_size_h;pixelY++) {
  let basearrayY = basearray[pixelY];
  for (let pixelX=0;pixelX<screen_size_w;pixelX++) {
    let base = basearrayY[pixelX];
    myImageDataDataImage[base[ALPHA]] = 255; // Alpha
  }
}
let sands = [];
let steves = [];
setInterval(function(){
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
  if(sandPixelImageLoad == true && sandLoadPack.daeLoad == true && sandLoad == false){
    for(let i=0;i<sandLoadpack[0].objectNumber;i++){
      sandLoadpack[i].textureImage = sandPixelImage;
      sandLoadpack[i].textureImageHeight = sandPixelImage.length;
      sandLoadpack[i].textureImageWidth = sandPixelImage[0].length;
      sandLoadpack[i].backCullingFlag = true;
      sandLoadpack[i].shadowFlag = true;
      sandLoadpack[i].lightShadowFlag = false;
      sandLoadpack[i].bones[0].position[position_Z] = 2;
      sandLoadpack[i].bones[0].position[position_Y] = 2;
      //sandLoadpack[i].bones[0].scaleXYZ = setVector3(0.1,0.1,0.1)
      // sandLoadpack[i].bones[0].rotXYZ[position_X] = 180;
      // sandLoadpack[i].bones[0].rotXYZ[position_Y] = 180;
      culUVVector(sandLoadpack[i]); 
    }
    let sand1 = daeLoadcopy(sandLoadpack);
    sand1[0].bones[0].position[position_Z] += 0.75;
    let sand2 = daeLoadcopy(sandLoadpack);
    sand2[0].bones[0].position[position_Z] += 1.5;
    let sand3 = daeLoadcopy(sandLoadpack);
    sand3[0].bones[0].position[position_X] += -0.75;

    let sand4 = daeLoadcopy(sand3);
    sand4[0].bones[0].position[position_Z] += 0.75;
    let sand5 = daeLoadcopy(sand3);
    sand5[0].bones[0].position[position_Z] += 1.5;
    let sand6 = daeLoadcopy(sandLoadpack);
    sand6[0].bones[0].position[position_X] += 0.75;

    let sand7 = daeLoadcopy(sand6);
    sand7[0].bones[0].position[position_Z] += 0.75;
    let sand8 = daeLoadcopy(sand6);
    sand8[0].bones[0].position[position_Z] += 1.5;
    sands.push(sandLoadpack);
    sands.push(sand1);
    sands.push(sand2);
    sands.push(sand3);
    sands.push(sand4);
    sands.push(sand5);
    sands.push(sand6);
    sands.push(sand7);
    sands.push(sand8);
    
    sandLoad = true;
  }
  if(skyPixelImageLoad == true && cubePixelImageLoad == true && cube1LoadPack.daeLoad == true && cube1Load == false){
    for(let i=0;i<cube1Loadpack[0].objectNumber;i++){
      cube1Loadpack[i].textureImage = cubePixelImage;
      cube1Loadpack[i].textureImageHeight = cubePixelImage.length;
      cube1Loadpack[i].textureImageWidth = cubePixelImage[0].length;
      cube1Loadpack[i].backCullingFlag = true;
      cube1Loadpack[i].shadowFlag = true;
      cube1Loadpack[i].lightShadowFlag = true;
      cube1Loadpack[i].bones[0].position[position_X] = 0;
      cube1Loadpack[i].bones[0].position[position_Y] = 0;
      cube1Loadpack[i].bones[0].position[position_Z] = 2.5;
      cube1Loadpack[i].bones[0].scaleXYZ = setVector3(0.1,0.1,0.1)
      cube1Loadpack[i].bones[0].rotXYZ[position_X] = 180;
      cube1Loadpack[i].bones[0].rotXYZ[position_Y] = 180;
      culUVVector(cube1Loadpack[i]); 
    }
    let cube2 = daeLoadcopy(cube1Loadpack);
    cube2[0].bones[0].position[position_Y] = 1;
    dices.push(cube1Loadpack);
    //dices.push(cube2);
    cube1Load = true;
  }
  if(skyPixelImageLoad == true && sphere1LoadPack.daeLoad == true && sphere1Load == false){
    for(let i=0;i<sphere1Loadpack[0].objectNumber;i++){
      sphere1Loadpack[i].textureImage = skyPixelImage;
      sphere1Loadpack[i].textureImageHeight = skyPixelImage.length;
      sphere1Loadpack[i].textureImageWidth = skyPixelImage[0].length;
      sphere1Loadpack[i].backCullingFlag = false;
      sphere1Loadpack[i].shadowFlag = false;
      sphere1Loadpack[i].lightShadowFlag = false;
      // sphere1Loadpack[i].bones[0].position[position_Y] = 0;
      // sphere1Loadpack[i].bones[0].position[position_Z] = 1.5;
      sphere1Loadpack[i].bones[0].scaleXYZ = setVector3(20,20,20);
      sphere1Loadpack[i].bones[0].rotXYZ[position_X] = 90;
      //sphere1Loadpack[i].bones[0].rotXYZ[position_Y] = 90;
      // sphere1Loadpack.bones[0].scaleXYZ[scale_Y] = 10;
      // sphere1Loadpack.bones[0].scaleXYZ[scale_Z] = 10;
      culUVVector(sphere1Loadpack[i]); 
    }
    dices.push(sphere1Loadpack);
    sphere1Load = true;
  }
  if(dicePixelImageLoad == true && steve1LoadPack.daeLoad == true && steve1Load == false){
    for(let i=0;i<steve1Loadpack[0].objectNumber;i++){
      steve1Loadpack[i].textureImage = dicePixelImage;
      steve1Loadpack[i].textureImageHeight = dicePixelImage.length;
      steve1Loadpack[i].textureImageWidth = dicePixelImage[0].length;
      steve1Loadpack[i].backCullingFlag = true;
      steve1Loadpack[i].shadowFlag = false;
      steve1Loadpack[i].lightShadowFlag = true;
      // steve1Loadpack[i].bones[0].position[position_Y] = 0;
      // steve1Loadpack[i].bones[0].position[position_Z] = 1.5;
      // steve1Loadpack[i].bones[0].scaleXYZ = setVector3(20,20,20);
      // steve1Loadpack[i].bones[0].rotXYZ[position_X] = 90;
      //steve1Loadpack[i].bones[0].rotXYZ[position_Y] = 90;
      // steve1Loadpack.bones[0].scaleXYZ[scale_Y] = 10;
      // steve1Loadpack.bones[0].scaleXYZ[scale_Z] = 10;
      culUVVector(steve1Loadpack[i]); 
    }
    let steve1 = daeLoadcopy(steve1Loadpack);
    for(let i=0;i<steve1.length;i++){
     steves.push(steve1);
    }
     let steve2 = daeLoadcopy(steve1Loadpack);
    for(let i=0;i<steve1.length;i++){
     steves.push(steve2);
    }

    for(let j=0;j<steves.length;j++){
      for(let i=0;i<steves[0][0].bones.length;i++){
        steves[j][0].bones[i].preQuaternion = quaternionXYZRoll(0,0,0);
        steves[j][0].bones[i].afterQuaternion = quaternionXYZRoll(0,0,0);
        steves[j][0].bones[i].quaternion = [];
        steves[j][0].bones[i].quaternion.push(quaternionXYZRoll(0,0,0));
        steves[j][0].bones[i].quaternion.push(quaternionXYZRoll(0,0,0));
        steves[j][0].bones[i].quaternionTime = [];
        steves[j][0].bones[i].quaternionTime.push(0);
        steves[j][0].bones[i].quaternionTime.push(1);
        steves[j][0].bones[i].currentTime = 0;
      }  
    }

    for(let i=0;i<steves.length;i++){
      steves[i][0].bones[4].quaternion[1] = quaternionXYZRoll(0,0,80);
      steves[i][0].bones[6].quaternion[1] = quaternionXYZRoll(0,0,-80);
      steves[i][0].bones[8].quaternion[1] = quaternionXYZRoll(0,0,-80);
      steves[i][0].bones[10].quaternion[1] = quaternionXYZRoll(0,0,80);
      steves[i][0].bones[11].quaternion[1] = quaternionXYZRoll(-80,0,0);
      steves[i][0].bones[12].quaternion[1] = quaternionXYZRoll(80,0,0); 
    }

    steve1Load = true;
  }
  if(sphere1Load && steve1Load && cube1Load && sandLoad){
    dataLoad = true;
  }
  ctx.font = '50pt Arial';
  ctx.fillStyle = 'rgba(0, 0, 255)';
  ctx.fillText("now loding", screen_size_w/2, screen_size_h/2);
  return;
}

const start = performance.now();

//スキンメッシュ
if(t>1){
  tPuls = -0.1;
}
if(t<0){
  tPuls = 0.1;
}
t += tPuls;

let steves_length = steves.length;
for(let j=0;j<steves_length;j++){
  let objects = steves[j];
  let object_Number = objects[0].objectNumber;
  for(let i=0;i<object_Number;i++){
    let object = objects[i];
    let bones_length = object.bones.length;
    let bonesNameList_length = object.bonesNameList.length;
    for(let k=0;k<bones_length;k++){
      object.bones[k].currentTime = t; 
    }
    for(let k=0;k<bonesNameList_length;k++){
      object.bones[k].skinmeshBone = null;
    }
  }
}

// steves[0][0].bones[0].position = setVector3(0.0,0,0);
steves[0][0].bones[0].position = setVector3(-0.5,0,0.5);
let tmpDaeMekeSkinMeshBone = daeMekeSkinMeshBone;
//makeBones
for(let j=0;j<steves.length;j++){
  let objects = steves[j];
  let object_Number = objects[0].objectNumber;
  for(let i=0;i<object_Number;i++){
    let object = objects[i];
    tmpDaeMekeSkinMeshBone(object);
  }
}

  //プロジェクション
  viewMatrix = matCamera(cameraPos,lookat,up);
  inverseViewMatrix = getInverseMatrix(viewMatrix);
  // let cameraSort = [];
  // let current = 0;
  // if(cameraSort.length == 0){
  //   let cameraVec = vecMinus(cameraPos,Sands[current].bones[0].position);
  //   let length = cul3dVecLength(cameraVec);
  //   cameraSort[0] = Sands[current];
  //   cameraSort[0].cameraLength = length;
  //   current++;
  // }
  // for(;current<Sands.length;current++){
  //   let cameraVec = vecMinus(cameraPos,Sands[current].bones[0].position);
  //   let length = cul3dVecLength(cameraVec);
  //   let j=0;
  //   for(;j<cameraSort.length;j++){
  //     if(cameraSort[j].cameraLength>length){
  //       let i=cameraSort.length;
  //       for(;i>j;i--){
  //         cameraSort[i] = cameraSort[i-1];
  //       }
  //       cameraSort[i] = Sands[current];
  //       cameraSort[i].cameraLength = length;
  //       break;
  //     }
  //   }
  //   if(j >= cameraSort.length){
  //     cameraSort[j] = Sands[current];
  //     cameraSort[j].cameraLength = length;
  //   }
  // }
  //inverseViewMatrix = CalInvMat4x4(viewMatrix);

  let sunVec = vecMinus(sunPos,sunLookat);
  culVecNormalize(sunVec);
  round100(sunVec[0]);
  round100(sunVec[1]);
  sunViewMatrix = matShadowCamera(sunPos,sunVec,up);
  //ピクセル処理がボトルネック、ラスタライズ
  setZmaxShdowBufferInit(shadowMap,screen_size_h,screen_size_w);
  setZmaxRenderBuffer(zBuffering,screen_size_h,screen_size_w);
  var tmpQbjectPolygonPush = objectPolygonPush;
  //dicesregister
  for(let Object of dices){
    // let worldMatrix = matIdentity();
    // mulMatTranslate(worldMatrix,object.bones[0].position[position_X],object.bones[0].position[position_Y],object.bones[0].position[position_Z]);  
    // mulMatRotateX(worldMatrix,object.bones[0].rotXYZ[rot_X]);
    // mulMatRotateY(worldMatrix,object.bones[0].rotXYZ[rot_Y]);
    // mulMatRotateZ(worldMatrix,object.bones[0].rotXYZ[rot_Z]); 
    // mulMatScaling(worldMatrix,object.bones[0].scaleXYZ[scale_X],object.bones[0].scaleXYZ[scale_Y],object.bones[0].scaleXYZ[scale_Z]);
    // for(let i=0;i<Object[0].objectNumber;i++){
    //   tmpQbjectPolygonPush(Object[i],zBuffering,shadowProjectedObjects,viewMatrix,sunViewMatrix,sunVec,screen_size_h,screen_size_w);
    // }
    for(let i=0;i<Object[0].objectNumber;i++){
      tmpQbjectPolygonPush(Object[i],zBuffering,shadowMap,viewMatrix,sunViewMatrix,sunVec,screen_size_h,screen_size_w);
    }
  }
  // //cuberegister
  for(let Object of sands){
    // let worldMatrix = matIdentity();
    // mulMatTranslate(worldMatrix,object.bones[0].position[position_X],object.bones[0].position[position_Y],object.bones[0].position[position_Z]);  
    // mulMatRotateX(worldMatrix,object.bones[0].rotXYZ[rot_X]);
    // mulMatRotateY(worldMatrix,object.bones[0].rotXYZ[rot_Y]);
    // mulMatRotateZ(worldMatrix,object.bones[0].rotXYZ[rot_Z]); 
    // mulMatScaling(worldMatrix,object.bones[0].scaleXYZ[scale_X],object.bones[0].scaleXYZ[scale_Y],object.bones[0].scaleXYZ[scale_Z]);
    for(let i=0;i<Object[0].objectNumber;i++){
      tmpQbjectPolygonPush(Object[i],zBuffering,shadowMap,viewMatrix,sunViewMatrix,sunVec,screen_size_h,screen_size_w);
    }
  }
  var tmpQbjectSkinMeshPolygonPush = objectSkinMeshPolygonPush;
  //steves
  for(let j=0;j<steves.length;j++){
    for(let i=0;i<steves[j].length;i++){
      let object = steves[j][i];
      tmpQbjectSkinMeshPolygonPush(object,zBuffering,shadowMap,viewMatrix,sunViewMatrix,sunVec,screen_size_h,screen_size_w);
    }
  }
  //AABB
  /*
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

//cameraView => sunView 合成関数shadowMap用
//行列をかけ合わせると合成される意味。
//(x',y') = A*(x,y)
//(x'',y'') = B*(x',y')
//(x'',y'') = B*{A*(x,y)}
//(x'',y'') = {B*A}*(x,y)
//B行列とA行列を掛けると合成される。　後に掛けるものB行列を先に置くのはこのため。
//ピクセル時の処理A,Bが2X2処理ピクセルが(x,y)だと(4*2+4*2)*縦(640)*横(480)=4915200掛け算
//あらかじめ合成すると 16+(4*2)*縦(640)*横(480)=2457616掛け算、処理が半減する。
matDirectMul(sunViewMatrix,inverseViewMatrix);
for (let pixelY=0; pixelY<screen_size_h;pixelY++) {
  let basearrayY = basearray[pixelY];
  let zBufferingY = zBuffering[pixelY];
  let shadowPixelY = shadowViewPortY[pixelY];
  let sunViewMatrix9MulShadowViewPortY = sunViewMatrix[9] * shadowPixelY + sunViewMatrix[10];
  let sunViewMatrix5MulShadowViewPortY = sunViewMatrix[5] * shadowPixelY + sunViewMatrix[6];
  let sunViewMatrix1MulShadowViewPortY = sunViewMatrix[1] * shadowPixelY + sunViewMatrix[2];
  for (let pixelX=0;pixelX<screen_size_w;pixelX++) {
    let base = basearrayY[pixelX];
    let pixel = zBufferingY[pixelX];
    let pixelZ = pixel[pixel_Z];
    if(pixelZ<99999){
      let pixelR = pixel[pixel_R];
      let pixelG = pixel[pixel_G];
      let pixelB = pixel[pixel_B];
      if(pixel[pixel_SunCosin] != null){
        //ライトシミュレーション色はIntだから深い小数点演算は意味ない
        let sunCosin = pixel[pixel_SunCosin];
        pixelR *= sunCosin;
        pixelG *= sunCosin;
        pixelB *= sunCosin;
      }
      if(pixel[pixel_shadow_Flag] == true){
        //let pixela = pixel[4];
        //シャドウマップに照らし合わせる。
        //camera=>world
        //inverseViewPort and inverseProjection
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
        //let shadowPixelY = shadowViewPortY[pixelY] * pixelZ;
        //let shadowPixelX = shadowViewPortX[pixelX] * pixelZ;
        
        //world=>shadowView
        //sunViewMatrixrixmul and projection(/shadowPixelZ) and viewPort (+ 0.5)*screen_size_wh)|0;
        //シャドウマップに照らし合わせるために製造した合成関数行列の掛け算のアンローリングの変形
        // original let shadowPixelZ = (sunViewMatrix[8]*shadowPixelX + sunViewMatrix[9]*shadowPixelY + sunViewMatrix[10]*pixelZ + sunViewMatrix[11] * 1000)/1000000;
        //0.5はビューポートの中央に寄せる値
        let shadowPixelX = shadowViewPortX[pixelX];
        let shadowPixelZ = ((sunViewMatrix[8] * shadowPixelX + sunViewMatrix9MulShadowViewPortY)*pixelZ + sunViewMatrix[11]);
        let shadowMatrixPixelY = ((((((sunViewMatrix[4] * shadowPixelX + sunViewMatrix5MulShadowViewPortY)*pixelZ + sunViewMatrix[7]))/shadowPixelZ) + 0.5) * screen_size_h)|0;
        if(shadowMatrixPixelY>=0 && shadowMatrixPixelY<screen_size_h){
          let shadowMatrixPixelX = ((((((sunViewMatrix[0] * shadowPixelX + sunViewMatrix1MulShadowViewPortY)*pixelZ + sunViewMatrix[3]))/shadowPixelZ) + 0.5) * screen_size_w)|0;
          if(shadowMatrixPixelX>=0 && shadowMatrixPixelX<screen_size_w){
            //0.5はシャドウマップのバイアス値
            if((shadowMap[shadowMatrixPixelY][shadowMatrixPixelX]+0.5)<shadowPixelZ){
              pixelR *= 0.5;
              pixelG *= 0.5;
              pixelB *= 0.5;	
            }
          }
        }
      } 
      myImageDataDataImage[base[RED]] = pixelR;  // Red
      myImageDataDataImage[base[GREEN]] = pixelG;  // Green
      myImageDataDataImage[base[BLUE]] = pixelB;  // Blue
      //myImageDataDataImage[base[ALPHA]] = 255; // Alpha  
    }else{
      //何もないところは黒
      myImageDataDataImage[base[RED]] = 0;  // Red
      myImageDataDataImage[base[GREEN]] = 0;  // Green
      myImageDataDataImage[base[BLUE]] = 0;  // Blue
      //myImageDataDataImage[base[ALPHA]] = 255; // Alpha
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