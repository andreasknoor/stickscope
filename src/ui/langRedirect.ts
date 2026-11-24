/**
 * Runs in <body> before the first paint and sends the visitor to their language.
 * 1. A language chosen explicitly (saved in the settings as `lang`) wins on every page.
 * 2. Without a choice, the browser language decides, but only on the English home page `/` (a German browser goes to `/de`).
 *    Other pages are never redirected by the browser language, so crawlers and shared links see the page they point to.
 * The path of the other language: `/de` + path, or the path without its `/de` prefix. Hash and query stay.
 * Must match the key in settings.ts; anything unexpected leaves the page alone.
 */
export const LANG_SCRIPT =
  '(function(){try{var l=document.documentElement.lang,p=location.pathname,s=null;' +
  'try{s=JSON.parse(localStorage.getItem("stickscope.settings")||"{}").lang}catch(e){}' +
  'var n=(navigator.languages&&navigator.languages[0])||navigator.language||"";' +
  'var w=s==="de"||s==="en"?s:(p==="/"&&/^de/i.test(n)?"de":null);' +
  'if(!w||w===l)return;' +
  'var t=w==="de"?"/de"+(p==="/"?"":p):(p.replace(/^\\/de(?=\\/|$)/,"")||"/");' +
  'location.replace(t+location.search+location.hash)}catch(e){}})()';
