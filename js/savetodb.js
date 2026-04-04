let db;
const request = indexedDB.open("MyassetsDB",1);
request.onupgradeneeded=function(event){
    db=event.target.result;
    db.createObjectStore("imagesStore",{autoIncrement: true})
}
request.onsuccess=function(event){
    db=event.target.result
}
let input10_assetImage = document.getElementById("input10_assetImage");

const file = fileInput.files[0];
const reader = new FileReader();
reader.onload=function(event){
    const base64Image = event.target.result;
    const assetdata={
        userId:1,
        image:base64Image
    }
    const transaction = db.transaction(["imagesStore"], "readwrite");
    const store = transaction.objectStore("imagesStore");
    store.add(assetdata);
}
