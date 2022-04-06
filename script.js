let worldp=[];
let worldl=[];
let friction=0.05;
class Vector{
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
    add(v){
        return new Vector(this.x+v.x,this.y+v.y);
    }
    sub(v){
        return new Vector(this.x-v.x,this.y-v.y);
    }
    dot(v){
        return this.x*v.x+this.y*v.y;
    }
    mag(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    unit(){
        return new Vector(this.x/this.mag(),this.y/this.mag());
    }
    mult(n){
        return new Vector(this.x*n,this.y*n);
    }
    draw(pos){
        draw_line(pos.x,pos.y,this.x,this.y,"black");
    }
}
class Matrix{
    constructor(rows,cols){
        this.rows=rows;
        this.cols=cols;
        this.data=[];
        for(let i=0;i<this.rows;i++){
            this.data[i]=[];
            for(let j=0;j<this.cols;j++){
                this.data[i][j]=0;
            }
        }
    }
    mulvec(vec){
        let result=new Vector(0,0);
        result.x=this.data[0][0]*vec.x+this.data[0][1]*vec.y;
        result.y=this.data[1][0]*vec.x+this.data[1][1]*vec.y;
        return result;

    }

}
function rotateMx(angle){
    let mx=new Matrix(2,2);
    mx.data[0][0]=Math.cos(angle);
    mx.data[0][1]=-Math.sin(angle);
    mx.data[1][0]=Math.sin(angle);
    mx.data[1][1]=Math.cos(angle);
    return mx;
}
class Point{
    constructor(x,y,vx,vy,radius=10,mass=10,ax=0,ay=0,e=0.9){
        this.pos=new Vector(x,y);
        this.vel=new Vector(vx,vy);
        this.acc=new Vector(ax,ay);
        this.radius=radius;
        this.e=e;
        this.mass=mass;
        this.type="point"
        worldp.push(this);
        this.color="black";
    }

    run(){
        this.vel=this.vel.mult(1-friction);
        this.vel=this.vel.add(this.acc);
        this.pos=this.pos.add(this.vel);
    }
    render(){
        draw_circle(this.pos.x,this.pos.y,this.radius,this.color);
    }
    coll_res_boundary(){
        if(this.pos.x+this.radius>maxw){
            this.pos.x=maxw-this.radius;
            this.vel.x*=-this.e;

        }
        if(this.pos.x<this.radius){
            this.pos.x=this.radius;
            this.vel.x*=-this.e;
        }
        if(this.pos.y+this.radius>maxh){
            this.pos.y=maxh-this.radius;
            this.vel.y*=-this.e;
        }
        if(this.pos.y<this.radius){
            this.pos.y=this.radius;
            this.vel.y*=-this.e;
        }
    }
    coll_detect_point(b){
        if(this.radius+b.radius>=this.pos.sub(b.pos).mag()){return true};
        return false;
    }
    pen_res_point(b){
        if(this.coll_detect_point(b)){
            let k=this.radius+b.radius-this.pos.sub(b.pos).mag();
            let vect=this.pos.sub(b.pos).unit();
            this.pos=this.pos.add(vect.mult(k*(b.mass/(this.mass+b.mass))));
            b.pos=b.pos.add(vect.mult(-k*(this.mass/(this.mass+b.mass))));
        }
    }
    coll_res_point(b){
        if(this.coll_detect_point(b)){
            this.pen_res_point(b);
            let normal = this.pos.sub(b.pos).unit();
            let relVel = this.vel.sub(b.vel);
            let sepVel = relVel.dot(normal);
            let new_sepVel = -sepVel * Math.min(this.e, b.e);
            let vsep_diff = new_sepVel - sepVel;
            let impulse = vsep_diff / ((1/this.mass) + (1/b.mass));
            let impulseVec = normal.mult(impulse);        
            this.vel = this.vel.add(impulseVec.mult(1/this.mass));
            b.vel = b.vel.add(impulseVec.mult(-1/b.mass));
        }
    }
}
class Line{
    constructor(x0,y0,x1,y1,omega=0,alpha=0){
        this.start=new Vector(x0,y0);
        this.end=new Vector(x1,y1);
        this.omega=omega;
        this.alpha=alpha;
        this.color="black";
        worldl.push(this);
    }
    lunit(){
        return this.end.sub(this.start).unit();
    }
    render(){
        draw_line(this.start.x,this.start.y,this.end.x,this.end.y,this.color);
    }
    run(){
        this.omega*=(1-friction);
        this.omega+=this.alpha;
        this.pos=this.rotate(this.omega);
    }
    closest_point_ball(b){
        let st = this.start.sub(b.pos);
        if(this.lunit().dot(st) > 0){
            return this.start;
        }
    
        let end = b.pos.sub(this.end);
        if(this.lunit().dot(end) > 0){
            return this.end;
        }
    
        let closestDist = this.lunit().dot(st);
        let closestVect = this.lunit().mult(closestDist);
        return this.start.sub(closestVect);


    }
    coll_detect_point(b){
        if(this.closest_point_ball(b).sub(b.pos).mag()<=b.radius)return true;
        return false;
    }
    coll_res_point(b){
        if(this.coll_detect_point(b)){
           let penvec=b.pos.sub(this.closest_point_ball(b));
           b.pos=b.pos.add(penvec.unit().mult(b.radius-penvec.mag())); 
           let normal = b.pos.sub(this.closest_point_ball(b)).unit();
           let sepVel = normal.dot(b.vel);
           let new_sepVel = -sepVel * b.e;
           let vsep_diff = sepVel - new_sepVel;
           b.vel = b.vel.add(normal.mult(-vsep_diff));
    }
}
 rotate(angle){
     let m1=rotateMx(angle);
     let center=this.end.add(this.start).mult(0.5);
     let nstart=m1.mulvec(this.start.sub(center));
     let nend=m1.mulvec(this.end.sub(center));
     this.start=nstart.add(center);
     this.end=nend.add(center);
 }
}
