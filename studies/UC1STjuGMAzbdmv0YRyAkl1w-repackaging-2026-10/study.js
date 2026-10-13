const cards=[...document.querySelectorAll('.comparison')];
const filters=[...document.querySelectorAll('[data-filter]')];
const search=document.querySelector('#search');
let selected='all';
function applyFilters(){
 const term=search.value.trim().toLowerCase();
 let count=0;
 for(const card of cards){const show=(selected==='all'||selected===card.dataset.group)&&card.dataset.search.toLowerCase().includes(term);card.hidden=!show;if(show)count++;}
 document.querySelector('#result-count').textContent=`${count} of ${cards.length} videos`;
 document.querySelector('#empty').hidden=count!==0;
 for(const button of filters)button.setAttribute('aria-pressed',String(button.dataset.filter===selected));
}
filters.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.filter;applyFilters();}));
search.addEventListener('input',applyFilters);
document.querySelector('#reset').addEventListener('click',()=>{selected='all';search.value='';applyFilters();search.focus();});
const tiles=[...document.querySelectorAll('.data-tile')];
const toggle=document.querySelector('#toggle-data');
function syncToggle(){toggle.textContent=tiles.every(x=>x.open)?'Collapse all data':'Expand all data';}
tiles.forEach(tile=>tile.addEventListener('toggle',syncToggle));
toggle.addEventListener('click',()=>{const expand=!tiles.every(x=>x.open);tiles.forEach(x=>{x.open=expand;});syncToggle();});
document.querySelector('#toolbar').hidden=false;
toggle.hidden=false;
