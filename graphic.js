let can=document.querySelector("#display");
can.width=window.innerWidth;
can.height=window.innerHeight;
let maxw=can.width;
let maxh=can.height;
ctx=can.getContext("2d");
function draw_line(x0,y0,x1,y1,color="black"){
ctx.beginPath();
ctx.moveTo(x0, y0);
ctx.lineTo(x1,y1);
ctx.strokeStyle=color;
ctx.stroke();
ctx.closePath();
}
function draw_circle(x0,y0,radius,color="black"){
ctx.beginPath();
ctx.arc(x0,y0,radius, 0, 2 * Math.PI);
ctx.fillStyle=color;
ctx.fill();
ctx.closePath();
}
function mainLoop(){
    ctx.clearRect(0, 0, can.clientWidth, can.clientHeight);
    worldp.forEach((b, index) => {
        b.coll_res_boundary();
        worldl.forEach((l, index) => {
            l.coll_res_point(b);
        });
        for(let i=index+1;i<worldp.length;i++)b.coll_res_point(worldp[i]);
        b.render();
        b.run();

    });
    worldl.forEach((l)=>{l.run();l.render()});
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);