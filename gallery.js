document.addEventListener('DOMContentLoaded', function(){
  function openDB(){
    return new Promise(function(resolve,reject){
      var req = indexedDB.open('BookingsDB', 2);
      req.onupgradeneeded = function(e){
        var db = e.target.result;
        if(!db.objectStoreNames.contains('photos')){
          var store = db.createObjectStore('photos',{ keyPath:'id' });
          store.createIndex('category','category',{ unique:false });
          store.createIndex('createdAt','createdAt',{ unique:false });
        }
      };
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error); };
    });
  }
  function listPhotos(){
    return openDB().then(function(db){
      return new Promise(function(resolve,reject){
        var tx = db.transaction('photos','readonly');
        var store = tx.objectStore('photos');
        var req = store.getAll();
        req.onsuccess = function(){ resolve(req.result || []); };
        req.onerror = function(){ reject(req.error); };
        tx.oncomplete = function(){ db.close(); };
      });
    });
  }
  function render(){
    listPhotos().then(function(photos){
      var sections = document.querySelectorAll('.gallery-section');
      sections.forEach(function(sec){
        var cat = sec.getAttribute('data-category');
        var strip = sec.querySelector('.scroll-strip');
        var items = photos.filter(function(p){ return p.category === cat; });
        if(items.length === 0){ return; }
        strip.innerHTML = '';
        items.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
        items.forEach(function(p){
          var fig = document.createElement('figure');
          var img = document.createElement('img');
          img.src = p.dataUrl; img.alt = p.title || cat + ' photo';
          var cap = document.createElement('figcaption');
          cap.textContent = p.title || '';
          fig.appendChild(img); fig.appendChild(cap);
          strip.appendChild(fig);
        });
      });
    });
  }
  render();
});


