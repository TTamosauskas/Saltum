/* Saltum — versioned local persistence for campaign + discoveries. */
(function(){
  'use strict';

  const KEY='sopaPrimordialSaveV1';
  const VERSION=1;

  function safeParse(raw){
    try{return raw?JSON.parse(raw):null}catch(_error){return null}
  }

  function normalize(raw){
    if(!raw||raw.version!==VERSION||typeof raw!=='object') return null;
    return {
      version:VERSION,
      updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:'',
      campaign:raw.campaign&&typeof raw.campaign==='object'?raw.campaign:null,
      discoveries:raw.discoveries&&typeof raw.discoveries==='object'?raw.discoveries:null
    };
  }

  function load(){
    try{return normalize(safeParse(localStorage.getItem(KEY)))}catch(_error){return null}
  }

  function save({campaign,discoveries}){
    try{
      const payload={version:VERSION,updatedAt:new Date().toISOString(),campaign,discoveries};
      localStorage.setItem(KEY,JSON.stringify(payload));
      return payload;
    }catch(_error){
      return null;
    }
  }

  function clear(){
    try{localStorage.removeItem(KEY);return true}catch(_error){return false}
  }

  window.SopaPersistence=Object.freeze({KEY,VERSION,load,save,clear});
})();