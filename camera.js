//頂点にクラスを使うと重たくなる頂点演算のせい？
//javascriptのクラス、関数を使うと重くなりがち、いっそ自分で作れるものは作る。Ｃ言語みたいになってくる。
import {setVector2,setVector3,vecMul,vecDiv, vecPlus,vecMinus,culVecCross,culVecCrossZ,culVecDot,culVecNormalize, round, roundVector2, NewtonMethod, cul3dVecLength} from './vector.js';
import {matIdentity,mulMatTranslate,mulMatScaling, matMul,matVecMul,matPers,matCamera,mulMatRotateX,mulMatRotatePointX,mulMatRotateY,mulMatRotatePointY,mulMatRotateZ,mulMatRotatePointZ,getInverseMatrix, matRound4X4, protMatVecMul, CalInvMat4x4, matWaight, matPlus, matCopy, getInvert2} from './matrix.js';
import {waistVerts,spineVerts,headVerts,orgPlaneVerts, orgCubeVerts, RightLeg1Verts, RightLeg2Verts, LeftLeg1Verts, LeftLeg2Verts, rightArm1Verts, rightArm2Verts, leftArm1Verts, leftArm2Verts} from './orgverts.js';
import {setPixel,renderBuffer,pixel,bufferPixelInit,bufferInit,pictureToPixelMap,dotPaint,dotLineBufferRegister,triangleRasterize,textureTransform,triangleToBuffer,sort_index,branch, triangleToShadowBuffer, vertsCopy, top_int} from './paint.js';
import { cross_Z, pixel_B, pixel_SunCosin, pixel_G, pixel_R, pixel_Z,poly_Cross_World_Vector3, position_X, position_Y, position_Z, projected_Verts, rot_X, rot_Y, rot_Z, scale_X, scale_Y, scale_Z, obj_Image, poly_List,obj_BackCulling_Flag, UV_Vector, pixel_A, pixel_shadow_Flag, obj_Shadow_Flag, obj_LightShadow_Flag, pixel_LightShadow_Flag } from './enum.js';
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
                  tempInt = round(tempInt);
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
          daeLoadPack.meshVerts = meshVerts[0];
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
          daeLoadPack.meshVertsFaceIndex = meshVertsFaceIndex[0];
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
          daeLoadPack.faceIndexMeshUV = faceIndexMeshUV[0];
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
                    boneContents.inverseBindPose = CalInvMat4x4(tempBind);;
                    tempBindPosePack.push(boneContents);
                    tempBind = [];  
            
                  }
                }
              }  
            }
            bindPosePack.push(tempBindPosePack)         
          }
          daeLoadPack.bindPosePack = bindPosePack[0];
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
          console.log(blendBoneIndex)
          daeLoadPack.blendBoneIndex = blendBoneIndex[0];
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
          daeLoadPack.bonesWeight = bonesWeight[0];
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
          daeLoadPack.boneParentRelation = boneParentRelation[0];
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
          daeLoadPack.bones = bones[0];
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
const DEG_TO_RAD = Math.PI / 180;
//const RAD_TO_DEG = 180 / Math.PI;
for(let i = 0; i < 360; i++) {
  sinLut.push(round(Math.sin(i * DEG_TO_RAD)));
  cosLut.push(round(Math.cos(i * DEG_TO_RAD)));
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
  projectedObject[obj_BackCulling_Flag] = orgObject.backCullingFlag;
  projectedObject[obj_Image] = orgObject.textureImage;
  projectedObject[obj_Shadow_Flag] = orgObject.shadowFlag;
  projectedObject[obj_LightShadow_Flag] = orgObject.lightShadowFlag;

  return projectedObject;
}
//projectedObject
function makeShaddowProjectedObject(orgObject,polyList){
  let projectedObject = [];
  projectedObject[poly_List] = polyList;
  projectedObject[obj_BackCulling_Flag] = orgObject.backCullingFlag;
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
 
  let poly = [];
  let shadowPoly = [];
  let meshVertsFaceIndex_Length = object.meshVertsFaceIndex.length;
  for(let i=0;i<meshVertsFaceIndex_Length;i++){
    let triangleFaceIndex = object.meshVertsFaceIndex[i];
    poly[i] = setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
      worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],object.UVVector[i]);
    shadowPoly[i] = setShadowPolygon(shadowProjectedVerts[triangleFaceIndex[0]],shadowProjectedVerts[triangleFaceIndex[1]],shadowProjectedVerts[triangleFaceIndex[2]]);
  }

  //ｚソート
  objectZsort(projectedObjects,object,poly);
  objectShadowZsort(shadowPprojectedObjects,object,shadowPoly);

  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
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
          //クォータニオン
          let quaternionOut = [];
          slerpQuaternionArray(quaternionOut,daeLoadPack.bones[boneParentRelation].quaternionTime,daeLoadPack.bones[boneParentRelation].quaternion,daeLoadPack.bones[boneParentRelation].quaternionTime.length,daeLoadPack.bones[boneParentRelation].currentTime);
          //slerpQuaternion(quaternionOut,daeLoadPack.bones[boneParentRelation].preQuaternion,daeLoadPack.bones[boneParentRelation].afterQuaternion,daeLoadPack.bones[boneParentRelation].currentTime);
          let quaternionMatrix = makeQuaternionMatrix(quaternionOut);
          quaternionMatrixTranstation(quaternionMatrix,daeLoadPack.bones[boneParentRelation].position[0],daeLoadPack.bones[boneParentRelation].position[1],daeLoadPack.bones[boneParentRelation].position[2]);
          quaternionMatrixScaling(quaternionMatrix,daeLoadPack.bones[boneParentRelation].scaleXYZ[0],daeLoadPack.bones[boneParentRelation].scaleXYZ[1],daeLoadPack.bones[boneParentRelation].scaleXYZ[2]);
          copyInverseBindPose = matMul(copyInverseBindPose,quaternionMatrix);
          //オイラー角
          // mulMatTranslate(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].position[0],
          // daeLoadPack.bones[boneParentRelation].position[1],daeLoadPack.bones[boneParentRelation].position[2]);
          // mulMatRotateX(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[0]);
          // mulMatRotateY(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[1]);
          // mulMatRotateZ(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].rotXYZ[2]);
          // mulMatScaling(copyInverseBindPose,daeLoadPack.bones[boneParentRelation].scaleXYZ[0],
          // daeLoadPack.bones[boneParentRelation].scaleXYZ[1],daeLoadPack.bones[boneParentRelation].scaleXYZ[2]);  
          daeLoadPack.bones[boneParentRelation].skinmeshBone = matMul(copyInverseBindPose,daeLoadPack.bindPosePack[boneParentRelation].bindPose);
        }
      }else{
      if(daeLoadPack.bones[boneParentRelation].skinmeshBone  == null){
          let parentCrossBone = matMul(daeLoadPack.bones[daeLoadPack.boneParentRelation[j][i-1]].skinmeshBone,daeLoadPack.bindPosePack[boneParentRelation].inverseBindPose);
          //クォータニオン
          let quaternionOut = [];
          slerpQuaternionArray(quaternionOut,daeLoadPack.bones[boneParentRelation].quaternionTime,daeLoadPack.bones[boneParentRelation].quaternion,daeLoadPack.bones[boneParentRelation].quaternionTime.length,daeLoadPack.bones[boneParentRelation].currentTime);
          //slerpQuaternion(quaternionOut,daeLoadPack.bones[boneParentRelation].preQuaternion,daeLoadPack.bones[boneParentRelation].afterQuaternion,daeLoadPack.bones[boneParentRelation].currentTime);
          let QuaternionMatrix = makeQuaternionMatrix(quaternionOut);
          let QuaternionParentCrossBone = matMul(parentCrossBone,QuaternionMatrix);
          //オイラー角
          // mulMatRotateX(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[0]);
          // mulMatRotateY(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[1]);
          // mulMatRotateZ(parentCrossBone,daeLoadPack.bones[boneParentRelation].rotXYZ[2]);
          daeLoadPack.bones[boneParentRelation].skinmeshBone = matMul(QuaternionParentCrossBone,daeLoadPack.bindPosePack[boneParentRelation].bindPose);
        }
      }
    }
  }
}
//ボーンなしシャドウマップ付き
function objectPolygonPush(object,worldTranslation,projectedObjects,shadowPprojectedObjects,viewMatrix,shadowViewMatrix,screen_size_h,screen_size_w){

  let worldVerts = [];
  let projectedVerts = [];
  let shadowProjectedVerts = [];

  // let verts = setVector3(object.meshVerts[i][0]+worldMatrix[0].position[0],object.meshVerts[i][1]+worldMatrix[0].position[1],object.meshVerts[i][2]+worldMatrix[0].position[2]);
  // verts = Vector3QuaternionMul(worldMatrix[1],verts);
  // verts = setVector3(object.meshVerts[i][0]*worldMatrix[2].scaleXYZ[0],object.meshVerts[i][1]*worldMatrix[2].scaleXYZ[1],object.meshVerts[i][2]*worldMatrix[2].scaleXYZ[2]);

  let meshVerts_Length = object.meshVerts.length;
  for (let i = 0; i < meshVerts_Length; i++) {
    let verts = setVector3(object.meshVerts[i][0]*worldTranslation.scaleXYZ[position_X],object.meshVerts[i][1]*worldTranslation.scaleXYZ[position_Y],object.meshVerts[i][2]*worldTranslation.scaleXYZ[position_Z]);
    verts = Vector3QuaternionMul(worldTranslation.quaternion,verts);
    verts = setVector3(verts[0]+worldTranslation.position[position_X],verts[1]+worldTranslation.position[position_Y],verts[2]+worldTranslation.position[position_Z]);
    //let verts =  matVecMul(worldMatrix,object.meshVerts[i]);
    let nomalVerts = vertsCopy(verts);
    let shadowVerts = vertsCopy(verts);
    worldVerts.push(verts);
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

    projectedVerts.push(nomalVerts);
    shadowProjectedVerts.push(shadowVerts);  
  }
  let poly = [];
  let shadowPoly = [];
      let meshVertsFaceIndex_Length = object.meshVertsFaceIndex.length;
     for(let i=0;i<meshVertsFaceIndex_Length;i++){
      let triangleFaceIndex = object.meshVertsFaceIndex[i];
      poly.push(setPolygon(projectedVerts[triangleFaceIndex[0]],projectedVerts[triangleFaceIndex[1]],projectedVerts[triangleFaceIndex[2]],
        worldVerts[triangleFaceIndex[0]],worldVerts[triangleFaceIndex[1]],worldVerts[triangleFaceIndex[2]],object.UVVector[i]));
      shadowPoly.push(setShadowPolygon(shadowProjectedVerts[triangleFaceIndex[0]],shadowProjectedVerts[triangleFaceIndex[1]],shadowProjectedVerts[triangleFaceIndex[2]]));
    } 

  //ｚソート
  projectedObjects.push(makeProjectedObject(object,poly));
  objectShadowZsort(shadowPprojectedObjects,object,shadowPoly);
  //moveCubeInfo.backGroundFlag = object.backGroundFlag;
    /*
    if(moveCubeInfo.backGroundFlag == true){
      backGroundCounter += 1;
    }
    */
}

//ｚソート
function objectZsort(projectedObjects,object,poly){
    let projectedObjectLength = projectedObjects.length;
    if(projectedObjectLength == 0){
      projectedObjects[0] = makeProjectedObject(object,poly);
    }else{
      let loopEndFlag = false;
      for(let j=0;j<projectedObjectLength;j++){
        if(projectedObjects[j][poly_List][0][projected_Verts][0][position_Z]>poly[0][projected_Verts][0][position_Z]){
          for(let i=projectedObjectLength-1;j<=i;i--){
            projectedObjects[i+1] = projectedObjects[i]
          }
          projectedObjects[j] = makeProjectedObject(object,poly);
          loopEndFlag = true;
          break;
        }
      }
      if(loopEndFlag == false){
        projectedObjects[projectedObjectLength] = makeProjectedObject(object,poly);
      }
    }
}
function objectShadowZsort(shadowPprojectedObjects,object,shadowPoly){
  let shadowPprojectedObjectsLength = shadowPprojectedObjects.length;
  if(shadowPprojectedObjectsLength == 0){
    shadowPprojectedObjects[0] = makeShaddowProjectedObject(object,shadowPoly);
  }else{
    let loopEndFlag = false;
    for(let j=0;j<shadowPprojectedObjectsLength;j++){
      if(shadowPprojectedObjects[j][poly_List][0][projected_Verts][0][position_Z]>shadowPoly[0][projected_Verts][0][position_Z]){
        for(let i=shadowPprojectedObjectsLength-1;j<=i;i--){
          shadowPprojectedObjects[i+1] = shadowPprojectedObjects[i]
        }
        shadowPprojectedObjects[j] = makeShaddowProjectedObject(object,shadowPoly);
        loopEndFlag = true;
        break;
      }
    }
    if(loopEndFlag == false){
      shadowPprojectedObjects[shadowPprojectedObjectsLength] = makeShaddowProjectedObject(object,shadowPoly);
    }
  }
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
  for(let j=0;j<daeLoadPack.objectNumber;j++){
    let faceIndexMeshUV_Length = daeLoadPack.faceIndexMeshUV[j].length;
    let tempUVVector = [];
    for(let i=0;i<faceIndexMeshUV_Length;i++){
      let Ax = (daeLoadPack.faceIndexMeshUV[j][i][2] - daeLoadPack.faceIndexMeshUV[j][i][0]) * daeLoadPack.textureImage.width;
      let Ay = (daeLoadPack.faceIndexMeshUV[j][i][3] - daeLoadPack.faceIndexMeshUV[j][i][1]) * daeLoadPack.textureImage.height;
      let Bx = (daeLoadPack.faceIndexMeshUV[j][i][4] - daeLoadPack.faceIndexMeshUV[j][i][0]) * daeLoadPack.textureImage.width;
      let By = (daeLoadPack.faceIndexMeshUV[j][i][5] - daeLoadPack.faceIndexMeshUV[j][i][1]) * daeLoadPack.textureImage.height;
      let mi = getInvert2(Ax,Ay,Bx,By);
      if (!mi) return;
      let preUV_List0 = daeLoadPack.faceIndexMeshUV[j][i][0] * daeLoadPack.textureImage.width;
      mi.push(preUV_List0);
      let preUV_List1 = daeLoadPack.faceIndexMeshUV[j][i][1] * daeLoadPack.textureImage.height;
      mi.push(preUV_List1);
      tempUVVector.push(mi);
    }
    UVVector.push(tempUVVector);
  }
  daeLoadPack.UVVector = UVVector;
}
function culUVvector(daeLoadPack){
  let UVVector = [];
  let faceIndexMeshUV_Length = daeLoadPack.faceIndexMeshUV.length;
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
function Quaternion(x,y, z, w){
  return [x,y,z,w];
}
/// 共役Quaternion
function Conjugated(x,y,z,w){
  return Quaternion(-x, -y, -z, w);
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
function Vector3QuaternionMul(a,b){
  // ベクトルをQuaternionに変換 q * p * q^-1 でベクトルを回転。w=0とおいて、最後wを無視する。
  let bQuaternion = Quaternion(b[0], b[1], b[2],0);
  //同じクォータニオンでもp(b)が元の頂点、q(a)が回転させたい軸、出力が回転させた結果
  let aConjugated = Conjugated(a[0],a[1],a[2],a[3]);
  let abQuaternion = QuaternionMul(a,bQuaternion);
  var pos = QuaternionMul(abQuaternion,aConjugated);
  return setVector3(pos[0], pos[1], pos[2]);
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
  let quaternionx = quaternionXRoll(XAngle);
  let quaterniony = quaternionYRoll(YAngle);
  let quaternionz = quaternionZRoll(ZAngle);
  let quaternionxy = QuaternionMul(quaternionx,quaterniony);
  return QuaternionMul(quaternionxy,quaternionz)
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
  let pow2qx = 2*q[0]*q[0];
  let qxqy = 2*q[0]*q[1];
  let qxqz = 2*q[0]*q[2];
  let qxqw = 2*q[0]*q[3];
  let pow2qy = 2*q[1]*q[1];
  let qyqz = 2*q[1]*q[2];
  let qyqw = 2*q[1]*q[3];
  let pow2qz = 2*q[2]*q[2];
  let qzqw = 2*q[2]*q[3];
  let pow2qw = 2*q[3]*q[3];
  
   return [pow2qw+pow2qx-1,qxqy-qzqw,qxqz+qyqw,0,
          qxqy+qzqw,pow2qw+pow2qy-1,qyqz-qxqw,0,
          qxqz-qyqw,qyqz+qxqw,pow2qw+pow2qz-1,0];
}
/*
** 複数のクォータニオン間の球面線形補間（折れ線）
**   out ← t[i] におけるクォータニオン q[i], 0 <= i < tNum に対する
**        u における補間値
**        
*/
function slerpQuaternionArray(out,t,q,tNum,currentTime){
  let i = 0, j = tNum - 1;

  /* u を含む t の区間 [t[i], t[i+1]) を二分法で求める */
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
  //sin2+cos2 = 1^2
  let pow2Sin = 1.0 - dot * dot, sin;
  if (pow2Sin <= 0.0 || (sin = Math.sqrt(pow2Sin)) == 0.0) {
    out[0] = q1[0];
    out[1] = q1[1];
    out[2] = q1[2];
    out[3] = q1[3];
  }else{
    let  angle = Math.acos(dot);
    let  anglet = angle * t;
    let  t1 = Math.sin(anglet) / sin;
    let  t0 = Math.sin(angle - anglet) / sin;
    
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
let sands = [];
const screen_size_h = SCREEN_SIZE_H;
const screen_size_w = SCREEN_SIZE_W;

const invScreen_size_h = 1/screen_size_h;
const invScreen_size_w = 1/screen_size_w;

//baseRGBA,viewPortをあらかじめ計算しておく。
let shadowViewPortY = [];
let shadowViewPortX = [];
let basearray = [];

for (let pixelY=0; pixelY<screen_size_h;pixelY++) {
  basearray[pixelY] = [];
  //inverseViewPort
  let tmpShadowViewPortY = (pixelY*invScreen_size_h  - 0.5);
  shadowViewPortY.push(tmpShadowViewPortY);
  for (let pixelX=0;pixelX<screen_size_w;pixelX++) {
    let baseRGBA = {};
    let tmpBase = (pixelY * screen_size_w + pixelX) * 4;
    baseRGBA.r = tmpBase + 0;
    baseRGBA.g = tmpBase + 1;
    baseRGBA.b = tmpBase + 2;
    baseRGBA.a = tmpBase + 3;
    basearray[pixelY][pixelX] = baseRGBA;
    //inverseViewPort
    let tmpShadowViewPortX = (pixelX*invScreen_size_w  - 0.5);
    shadowViewPortX.push(tmpShadowViewPortX);   
  }
}
//zBufferInit
let shadowMap = [];
shdowBufferInit(shadowMap,screen_size_h,screen_size_w);
let zBuffering = [];
renderBufferInit(zBuffering,screen_size_h,screen_size_w);
let myImageData = ctx.createImageData(screen_size_w, screen_size_h);
let Sands = [];
let steves = [];

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
  if(sandPixelImageLoad == true && sandLoadPack.daeLoad == true && sandLoad == false){
    for(let i=0;i<sandLoadpack[0].objectNumber;i++){
      sandLoadpack[i].textureImage = sandPixelImage;
      sandLoadpack[i].backCullingFlag = true;
      sandLoadpack[i].shadowFlag = true;
      sandLoadpack[i].lightShadowFlag = false;
      sandLoadpack[i].bones[0].position[position_Z] = 2;
      sandLoadpack[i].bones[0].position[position_Y] = 2;
      //sandLoadpack[i].bones[0].scaleXYZ = setVector3(0.1,0.1,0.1)
      // sandLoadpack[i].bones[0].rotXYZ[position_X] = 180;
      // sandLoadpack[i].bones[0].rotXYZ[position_Y] = 180;
      culUVvector(sandLoadpack[i]); 
    }
    let Sand1 = daeLoadcopy(sandLoadpack);
    Sand1[0].bones[0].position[position_Z] += 0.75;
    let Sand2 = daeLoadcopy(sandLoadpack);
    Sand2[0].bones[0].position[position_Z] += 1.5;
    let Sand3 = daeLoadcopy(sandLoadpack);
    Sand3[0].bones[0].position[position_X] += -0.75;

    let Sand4 = daeLoadcopy(Sand3);
    Sand4[0].bones[0].position[position_Z] += 0.75;
    let Sand5 = daeLoadcopy(Sand3);
    Sand5[0].bones[0].position[position_Z] += 1.5;
    let Sand6 = daeLoadcopy(sandLoadpack);
    Sand6[0].bones[0].position[position_X] += 0.75;

    let Sand7 = daeLoadcopy(Sand6);
    Sand7[0].bones[0].position[position_Z] += 0.75;
    let Sand8 = daeLoadcopy(Sand6);
    Sand8[0].bones[0].position[position_Z] += 1.5;
    Sands.push(sandLoadpack);
    Sands.push(Sand1);
    Sands.push(Sand2);
    Sands.push(Sand3);
    Sands.push(Sand4);
    Sands.push(Sand5);
    Sands.push(Sand6);
    Sands.push(Sand7);
    Sands.push(Sand8);
    
    sandLoad = true;
  }
  if(skyPixelImageLoad == true && cubePixelImageLoad == true && cube1LoadPack.daeLoad == true && cube1Load == false){
    for(let i=0;i<cube1Loadpack[0].objectNumber;i++){
      cube1Loadpack[i].textureImage = cubePixelImage;
      cube1Loadpack[i].backCullingFlag = true;
      cube1Loadpack[i].shadowFlag = true;
      cube1Loadpack[i].lightShadowFlag = true;
      cube1Loadpack[i].bones[0].position[position_Y] = 0;
      cube1Loadpack[i].bones[0].position[position_Z] = 2.5;
      cube1Loadpack[i].bones[0].scaleXYZ = setVector3(0.1,0.1,0.1)
      cube1Loadpack[i].bones[0].rotXYZ[position_X] = 180;
      cube1Loadpack[i].bones[0].rotXYZ[position_Y] = 180;
      culUVvector(cube1Loadpack[i]); 
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
      culUVvector(sphere1Loadpack[i]); 
    }
    dices.push(sphere1Loadpack) ;
    sphere1Load = true;
  }
  if(dicePixelImageLoad == true && steve1LoadPack.daeLoad == true && steve1Load == false){
    for(let i=0;i<steve1Loadpack[0].objectNumber;i++){
      steve1Loadpack[i].textureImage = dicePixelImage;
      steve1Loadpack[i].backCullingFlag = true;
      steve1Loadpack[i].shadowFlag = true;
      steve1Loadpack[i].lightShadowFlag = true;
      // steve1Loadpack[i].bones[0].position[position_Y] = 0;
      // steve1Loadpack[i].bones[0].position[position_Z] = 1.5;
      // steve1Loadpack[i].bones[0].scaleXYZ = setVector3(20,20,20);
      // steve1Loadpack[i].bones[0].rotXYZ[position_X] = 90;
      //steve1Loadpack[i].bones[0].rotXYZ[position_Y] = 90;
      // steve1Loadpack.bones[0].scaleXYZ[scale_Y] = 10;
      // steve1Loadpack.bones[0].scaleXYZ[scale_Z] = 10;
      culUVvector(steve1Loadpack[i]); 
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
  for(let i=0;i<objects[0].objectNumber;i++){
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

//makeBones
for(let j=0;j<steves.length;j++){
  let objects = steves[j];
  for(let i=0;i<objects[0].objectNumber;i++){
    let object = objects[i];
    daeMekeSkinMeshBone(object);
  }
}

  //プロジェクション
  //シャドウの投影後の情報格納
  let shadowProjectedObjects = [];
  //投影後の情報格納
  let projectedObjects = [];

  viewMatrix = matCamera(cameraPos,lookat,up);
  matRound4X4(viewMatrix);
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

  inverseViewMatrix = CalInvMat4x4(viewMatrix);
  matRound4X4(inverseViewMatrix);

  sunViewMatrix = matCamera(sunPos,sunLookat,up);
  matRound4X4(sunViewMatrix);

  //dicesregister
  for(let Object of dices){
    // let worldMatrix = matIdentity();
    // mulMatTranslate(worldMatrix,object.bones[0].position[position_X],object.bones[0].position[position_Y],object.bones[0].position[position_Z]);  
    // mulMatRotateX(worldMatrix,object.bones[0].rotXYZ[rot_X]);
    // mulMatRotateY(worldMatrix,object.bones[0].rotXYZ[rot_Y]);
    // mulMatRotateZ(worldMatrix,object.bones[0].rotXYZ[rot_Z]); 
    // mulMatScaling(worldMatrix,object.bones[0].scaleXYZ[scale_X],object.bones[0].scaleXYZ[scale_Y],object.bones[0].scaleXYZ[scale_Z]);
    for(let i=0;i<Object[0].objectNumber;i++){
    let object = Object[i];
    let worldTranslation = {};
    worldTranslation.quaternion = quaternionXYZRoll(object.bones[0].rotXYZ[0],object.bones[0].rotXYZ[1],object.bones[0].rotXYZ[2]);
    worldTranslation.position = object.bones[0].position;
    worldTranslation.scaleXYZ = object.bones[0].scaleXYZ;
    objectPolygonPush(object,worldTranslation,projectedObjects,shadowProjectedObjects,viewMatrix,sunViewMatrix,screen_size_h,screen_size_w);
    }
  }
  //cuberegister
  for(let Object of Sands){
    // let worldMatrix = matIdentity();
    // mulMatTranslate(worldMatrix,object.bones[0].position[position_X],object.bones[0].position[position_Y],object.bones[0].position[position_Z]);  
    // mulMatRotateX(worldMatrix,object.bones[0].rotXYZ[rot_X]);
    // mulMatRotateY(worldMatrix,object.bones[0].rotXYZ[rot_Y]);
    // mulMatRotateZ(worldMatrix,object.bones[0].rotXYZ[rot_Z]); 
    // mulMatScaling(worldMatrix,object.bones[0].scaleXYZ[scale_X],object.bones[0].scaleXYZ[scale_Y],object.bones[0].scaleXYZ[scale_Z]);
    for(let i=0;i<Object[0].objectNumber;i++){
    let object = Object[i];
    let worldTranslation = {};
    worldTranslation.quaternion = quaternionXYZRoll(object.bones[0].rotXYZ[0],object.bones[0].rotXYZ[1],object.bones[0].rotXYZ[2]);
    worldTranslation.position = object.bones[0].position;
    worldTranslation.scaleXYZ = object.bones[0].scaleXYZ;
    objectPolygonPush(object,worldTranslation,projectedObjects,shadowProjectedObjects,viewMatrix,sunViewMatrix,screen_size_h,screen_size_w);
    }
  }
  //steves
  for(let j=0;j<steves.length;j++){
    for(let i=0;i<steves[j].length;i++){
      let object = steves[j][i];
      objectSkinMeshPolygonPush(object,projectedObjects,shadowProjectedObjects,viewMatrix,sunViewMatrix,screen_size_h,screen_size_w);
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

//ピクセル処理がボトルネック、ラスタライズ
setZmaxShdowBufferInit(shadowMap,screen_size_h,screen_size_w);
setZmaxRenderBuffer(zBuffering,screen_size_h,screen_size_w);
let sunVec = culVecNormalize(vecMinus(sunPos,sunLookat));
//camera
let projectedObjectsLength  = projectedObjects.length;
for(let j=0;j<projectedObjectsLength;j++){
  let currentProjectedObject = projectedObjects[j];
  let projectedObjects_j_polygonNum = currentProjectedObject[poly_List].length;
	for(let projectedPolyNum=0;projectedPolyNum<projectedObjects_j_polygonNum;projectedPolyNum++){
	  //-の方がこちらに近くなる座標軸だから
	  if(currentProjectedObject[obj_BackCulling_Flag] == true){
      if(currentProjectedObject[poly_List][projectedPolyNum][cross_Z]<0){
        triangleToBuffer(zBuffering,currentProjectedObject[obj_Image],currentProjectedObject[poly_List][projectedPolyNum][projected_Verts],currentProjectedObject[poly_List][projectedPolyNum][poly_Cross_World_Vector3],
            currentProjectedObject[poly_List][projectedPolyNum][UV_Vector],sunVec,currentProjectedObject[obj_Shadow_Flag],currentProjectedObject[obj_LightShadow_Flag]
           ,screen_size_h,screen_size_w);
	    } 
	  }else{
      triangleToBuffer(zBuffering,currentProjectedObject[obj_Image],currentProjectedObject[poly_List][projectedPolyNum][projected_Verts],currentProjectedObject[poly_List][projectedPolyNum][poly_Cross_World_Vector3],
        currentProjectedObject[poly_List][projectedPolyNum][UV_Vector],sunVec,currentProjectedObject[obj_Shadow_Flag],currentProjectedObject[obj_LightShadow_Flag]
       ,screen_size_h,screen_size_w);
	  }
  }  
}
//shadowMap
let shadowProjectedObjectsLength  = shadowProjectedObjects.length;
for(let j=0;j<shadowProjectedObjectsLength;j++){
  let currentshadowProjectedObject = shadowProjectedObjects[j];
  if(currentshadowProjectedObject[obj_Shadow_Flag] == false){
    continue;
  }
  let shadowProjectedObjects_j_polygonNum = currentshadowProjectedObject[poly_List].length;
	for(let projectedPolyNum=0;projectedPolyNum<shadowProjectedObjects_j_polygonNum;projectedPolyNum++){
	  //-の方がこちらに近くなる座標軸だから
	  if(currentshadowProjectedObject[obj_BackCulling_Flag] == true){
	    if(currentshadowProjectedObject[poly_List][projectedPolyNum][cross_Z]<0){
        triangleToShadowBuffer(shadowMap,currentshadowProjectedObject[poly_List][projectedPolyNum][projected_Verts],screen_size_h,screen_size_w);
      }
	  }else{
      triangleToShadowBuffer(shadowMap,currentshadowProjectedObject[poly_List][projectedPolyNum][projected_Verts],screen_size_h,screen_size_w);
	  }
  }  
}
//作画
let shadowMat = matMul(sunViewMatrix,inverseViewMatrix);
for (let pixelY=0; pixelY<screen_size_h;pixelY++) {
  let basearrayY = basearray[pixelY];
  let zBufferingY = zBuffering[pixelY];
  for (let pixelX=0;pixelX<screen_size_w;pixelX++) {
    let base = basearrayY[pixelX];
    let pixel = zBufferingY[pixelX];
    let pixelZ = pixel[pixel_Z];
    if(pixelZ<99999){
      if(pixel[pixel_shadow_Flag] == true){
        let pixelR = pixel[pixel_R];
        let pixelG = pixel[pixel_G];
        let pixelB = pixel[pixel_B];
        //let pixela = pixel[4];
        //シャドウマップに照らし合わせる。
        //camera
        //let pixelVector3 = setVector3(pixelX,pixelY,pixelZ);
        //inverseViewPort and inverseProjection
        let shadowPixelY = shadowViewPortY[pixelY] * pixelZ;
        let shadowPixelX = shadowViewPortX[pixelX] * pixelZ;
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
        let shadowMatrixPixelY = shadowMat[4]*shadowPixelX + shadowMat[5]*shadowPixelY + shadowMat[6]*pixelZ + shadowMat[7];
        let shadowMatrixPixelX = shadowMat[0]*shadowPixelX + shadowMat[1]*shadowPixelY + shadowMat[2]*pixelZ + shadowMat[3];
        pixelZ = shadowMat[8]*shadowPixelX + shadowMat[9]*shadowPixelY + shadowMat[10]*pixelZ + shadowMat[11];
        //let invPixelZ = 1/pixelZ;

        //projectionMatrix = matPers(pixelVector3[2]);
        //pixelVector3 = matVecMul(projectionMatrix,pixelVector3);
    
        //projection
        shadowMatrixPixelY /= pixelZ;
        shadowMatrixPixelX /= pixelZ;
        
        //viewPort
        shadowMatrixPixelY += 0.5;
        shadowMatrixPixelX += 0.5;
        shadowMatrixPixelY *= screen_size_h;
        shadowMatrixPixelX *= screen_size_w;
        shadowMatrixPixelY |= 0;
        shadowMatrixPixelX |= 0;  
        /*代入あり
        shadowMatrixPixelY = ((shadowMatrixPixelY  + 0.5)*screen_size_h)|0;
        shadowMatrixPixelX = ((shadowMatrixPixelX  + 0.5)*screen_size_w)|0;
        */
        if(shadowMatrixPixelY>0 && shadowMatrixPixelY<screen_size_h){
          if(shadowMatrixPixelX>0 && shadowMatrixPixelX<screen_size_w){ 
            if(shadowMap[shadowMatrixPixelY][shadowMatrixPixelX]+0.5<pixelZ){
              pixelR *= 0.5;
              pixelG *= 0.5;
              pixelB *= 0.5;	
            }
          }
        }
        if(pixel[pixel_LightShadow_Flag] == true){
          //ライトシミュレーション
          let sunCosin = pixel[pixel_SunCosin];
          pixelR *= sunCosin;
          pixelG *= sunCosin;
          pixelB *= sunCosin; 
        }
        myImageData.data[base.r] = pixelR;  // Red
        myImageData.data[base.g] = pixelG;  // Green
        myImageData.data[base.b] = pixelB;  // Blue
        myImageData.data[base.a] = 255; // Alpha  
      }else{
        myImageData.data[base.r] = pixel[pixel_R];  // Red
        myImageData.data[base.g] = pixel[pixel_G];  // Green
        myImageData.data[base.b] = pixel[pixel_B]; // Blue
        //let pixela = pixel[4];
        myImageData.data[base.a] = 255; // Alpha        
      }
    //dotPaint(j,i,getPixel.r,getPixel.g,getPixel.b,getPixel.a,ctx);    
    }else{
      //何もないところは黒
      //dotPaint(j,i,0,0,0,255,ctx);
      myImageData.data[base.r] = 0;  // Red
      myImageData.data[base.g] = 0;  // Green
      myImageData.data[base.b] = 0;  // Blue
      myImageData.data[base.a] = 255; // Alpha
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