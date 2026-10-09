import {initialState,normalize} from './engine.mjs';
export const KEY='graybird:universe:v1';
export function load(storage){try{const raw=storage.getItem(KEY);return {state:raw?normalize(JSON.parse(raw)):initialState(),warning:''};}catch(e){return {state:initialState(),warning:'存档不可读取，已进入临时模式。原存档未覆盖；确认重置后可重新保存。'};}}
export function save(storage,state){try{storage.setItem(KEY,JSON.stringify(state));return true;}catch(e){return false;}}
