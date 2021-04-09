import {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Vector,
  Events,
  MouseConstraint,
  Mouse,
  Composite,
} from "matter-js";

const PIPE_GAP = 125;
const PIPE_SPEED = 2;
const PIPE_GENERATION_SPPED = 4;
const gravity = Vector.create(0, 0.001);
const WORLD_WIDTH = 288;
const WORLD_HEIGHT = 512;
const PIPE_WIDTH = 52;
const PIPE_HEIGHT = 320;
const PIPE_DISTANCE = 100;

const main = () => {
  console.log("Begins flappy bird demo ...");
  // create engine
  let engine = Engine.create(),
    world = engine.world;
  engine.world.gravity.y = 0;

  // create renderer
  let render = Render.create({
    element: document.getElementById("canvas-container"),
    engine: engine,
    options: {
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      wireframes: false,
      background: "./assets/sprites/background-day.png",
    },
  });
  let mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, { mouse });
  let runner = Runner.create();
  Render.run(render);
  Runner.run(runner, engine);

  const createBird = (): Body =>
    Bodies.rectangle(PIPE_DISTANCE, WORLD_HEIGHT / 2, 32, 24, {
      label: "bird",
      density: 0.005,
      render: {
        sprite: {
          texture: "./assets/sprites/bluebird-midflap.png",
          xScale: 1,
          yScale: 1,
        },
      },
    });

  const createStartButton = (): Body =>
    Bodies.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 184, 267, {
      label: "start-button",
      isStatic: true,
      render: {
        sprite: {
          texture: "./assets/sprites/message.png",
          xScale: 1,
          yScale: 1,
        },
      },
    });

  const createPipe = (): Composite => {
    const _pipe = Composite.create();
    const up = Bodies.rectangle(0, 0, PIPE_WIDTH, PIPE_HEIGHT, {
      label: "pipe",
      isStatic: true,
      render: {
        opacity: 1,
        sprite: {
          texture: "./assets/sprites/pipe-green.png",
          xScale: 1,
          yScale: 1,
        },
      },
    });
    const down = Bodies.rectangle(
      0,
      PIPE_HEIGHT + PIPE_GAP,
      PIPE_WIDTH,
      PIPE_HEIGHT,
      {
        label: "pipe",
        isStatic: true,
        render: {
          sprite: {
            texture: "./assets/sprites/pipe-green.png",
            xScale: 1,
            yScale: 1,
          },
        },
      }
    );
    Composite.add(_pipe, down);
    Composite.add(_pipe, up);
    Body.rotate(up, Math.PI);
    return _pipe;
  };

  const createPipeStack = () => {
    let _pipeStack: Composite[] = [];
    new Array(4).fill(0).forEach((d, i) => {
      const pipe = createPipe();
      _pipeStack.push(pipe);
    });
    return _pipeStack;
  };

  let pipeStack: Composite[] = createPipeStack();

  const placePipeStack = (pipeStack) => {
    pipeStack.forEach((pipe, i) => {
      pipe.bodies.forEach((body) =>
        Body.setPosition(body, Vector.create(0, body.position.y))
      );
      Composite.translate(
        pipe,
        Vector.create(3 * PIPE_DISTANCE + (PIPE_WIDTH + PIPE_DISTANCE) * i, 0)
      );
    });
  };

  let bird: Body = createBird();
  let startButton: Body = createStartButton();

  const initialize = () => {
    World.add(world, startButton);
    //  World.add(world, mouseConstraint);
    Events.on(mouseConstraint, "mousedown", (e) => {
      mouseConstraint.body &&
        mouseConstraint.body.label === "start-button" &&
        startGame();
    });
  };

  const isOutOfWorld = ({ bounds: { min, max } }: Body): boolean => {
    if (
      min.x <= 0 ||
      min.y <= 0 ||
      max.x >= WORLD_WIDTH ||
      max.y >= WORLD_HEIGHT
    ) {
      return true;
    } else return false;
  };

  const startGame = () => {
    World.remove(world, startButton);
    World.add(world, [bird]);
    World.add(world, pipeStack);
    placePipeStack(pipeStack);
    Events.on(engine, "afterUpdate", loop);
    Events.on(engine, "collisionStart", refreshGame);
  };

  const loop = () => {
    if (isOutOfWorld(bird)) {
      refreshGame();
    } else {
      Body.applyForce(bird, bird.position, {
        x: bird.mass * gravity.x,
        y: bird.mass * gravity.y,
      });
      // pipeStack.forEach(_pipe => Body.setVelocity(_pipe, Vector.create(PIPE_SPEED, 0)))
      pipeStack.forEach((_pipe) =>
        Composite.translate(_pipe, Vector.create(-1, 0))
      );
    }
  };

  const refreshGame = () => {
    Events.off(engine, "afterUpdate", loop);
    Events.off(engine, "collisionStart", refreshGame);
    Body.setPosition(bird, Vector.create(PIPE_DISTANCE, WORLD_HEIGHT / 2));
    Body.setVelocity(bird, Vector.create(0, 0));
    // Body.setPosition(pipe, Vector.create(0, 0));
    // World.remove(world, pipe);
    World.remove(world, bird);
    pipeStack.forEach((pipe) => World.remove(world, pipe));
    World.add(world, startButton);
  };

  initialize();

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    switch (e.code) {
      case "Space":
        Body.applyForce(bird, bird.position, Vector.create(0, -0.15));
    }
  });
};

window.onload = main;
