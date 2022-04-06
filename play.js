//new Point(30,30,0,0,20,20);
let x1=new Line(100,200,500,500);
document.addEventListener("click",function(e){
    new Point(e.clientX,e.clientY,0,0,20,20,0,0.8);
})
document.addEventListener("keydown",function(e){
    if(e.keyCode==37)x1.alpha=-0.005;
    if(e.keyCode==39)x1.alpha=0.005;
    
});
document.addEventListener("keyup",function(e){
    if(e.keyCode==37)x1.alpha=0.0;
    if(e.keyCode==39)x1.alpha=0.0;
    
})