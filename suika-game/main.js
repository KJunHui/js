import {Bodies,Body, Collision, Engine,Events, Render,Runner,World } from "matter-js";
import {FRUITS} from "./fruits.js";



const engine =  Engine.create(); //엔진 스타트
const render = Render.create({
  engine,
  element : document.body,
  options : {
    wireframes: false,
    background:"#F7F4C8",
    width:800,
    height: 850

  }
});

const world = engine.world;

const leftwall = Bodies.rectangle(15,395,30,790,{
  isStatic:true, //벽 고정 (물리엔진)
  render:{ fillStyle:"#E68143"}
})

const rightwall = Bodies.rectangle(605,395,30,790,{
  isStatic:true, //벽 고정 (물리엔진)
  render:{ fillStyle:"#E68143"}
})


const ground = Bodies.rectangle(310,820,620,60,{
  isStatic:true, //벽 고정 (물리엔진)
  render:{ fillStyle:"#E68143"}
})

const topline = Bodies.rectangle(310,150,620,2,{
  name: "topline",
  isStatic:true, //벽 고정 (물리엔진)
  isSensor:true, // 과일이 선에 걸리는지 감지
  render:{ fillStyle:"#E68143"}
})




World.add(world,[leftwall,rightwall,ground,topline]);
Render.run(render);
Runner.run(engine);

let currentBody = null; // 나중에 다시 쓸거기 때문에 전역변수로 설정
let currentfruit = null; // 나중에 다시 쓸거기 때문에 전역변수로 설정
let disableAction = false; // 조작 가능 여부
let interval = null; // 부드럽게 움직이기 위한 준비
let num_suika=0; // 수박의 개수 
let score = 0; // 점수 
let next = 0; //다음 과일 인덱스
let check = 0;

function addFruit() {
  
  if(check == 0){
  const index = Math.floor(Math.random()*5);
  const fruit = FRUITS[index];
  
  const body = Bodies.circle(300, 50, fruit.radius,{
    index: index,
    isSleeping: true, // 바로 떨어지지 않고 대기 
    render:{
    sprite: { texture: `${fruit.name}.png`}
  },
   restitution: 0.2,
  });

  currentBody = body;
  currentfruit = fruit;
  nextfruit();
 
  World.add(world,body);
}
else{
  const fruit = FRUITS[next];
  
  const body = Bodies.circle(300, 50, fruit.radius,{
    index: next,
    isSleeping: true, // 바로 떨어지지 않고 대기 
    render:{
    sprite: { texture: `${fruit.name}.png`}
  },
   restitution: 0.2,
  });

  currentBody = body;
  currentfruit = fruit;
  nextfruit();
 
  World.add(world,body);
}

}


function nextfruit(){
  next = Math.floor(Math.random()*5);
  const nextfruit = FRUITS[next];

  const body = Bodies.circle(700, 50, nextfruit.radius,{
    index: next,
    isSleeping: true,
    render:{
    sprite: { texture: `${nextfruit.name}.png`}
  },
  });
  World.add(world,body);
}



function removeFromworld(){
  World.remove(world,this.body);
}

window.onkeydown = (event) => {

  if (disableAction){
    return;
  }
  switch (event.code){
    case "KeyA":
      if(interval)
        return;
      interval = setInterval(() => {
        if(currentBody.position.x - currentfruit.radius > 30)
        Body.setPosition(currentBody,{
          x: currentBody.position.x -1,
          y: currentBody.position.y
      });
      },5);
      break;


      case "KeyD":
        if(interval)
          return;
        interval = setInterval(() =>{
          if(currentBody.position.x + currentfruit.radius < 590)
          Body.setPosition(currentBody,{
            x: currentBody.position.x +1,
            y: currentBody.position.y
      });
        },5);
      break;


      case "KeyS":
        currentBody.isSleeping = false;
        disableAction = true;
        setTimeout(() => {
          addFruit();
          disableAction = false;
          check = 1;
        },1000); //과일이 시간차를 두고 생성됨
        
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code){
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine,"collisionActive",(event)=> {
  event.pairs.forEach((Collision) => {
    if(Collision.bodyA.index === Collision.bodyB.index){
      const index = Collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        num_suika++;
        return;
      }
// index === FRUITS.length - 1 과일 인덱스 길이 11, 수박 인덱스 10 

      World.remove(world,[Collision.bodyA,Collision.bodyB]);

      const newFruit = FRUITS[index + 1];
      const newBody = Bodies.circle(
        Collision.collision.supports[0].x,
        Collision.collision.supports[0].y,
        newFruit.radius,
        {
          render:{
            sprite: { texture: `${newFruit.name}.png`}
          },
          index:  index + 1, 
        }
      );
        World.add(world,newBody);

       
      
    }
    if(
      !disableAction &&
      (Collision.bodyA.name === "topline" || Collision.bodyB.name ==="topline"))
      {
      alert("Game over");
    }
    if(num_suika >= 2){
      alert("two watermelon!! you win");
      disableAction = true;
    }

    
  });

});


addFruit();





