# Benchmark of a React/Redux performance sensitive web application with high data update frequency

## Why ?
This benchmark aims to quantify the performance impact of a minimal React/Redux setup on a performance sensitive mobile web application.

It follows a discussion on Hacker News with [markerikson](https://github.com/markerikson) about what I called the "Redux performance tax". He kindly mentioned the issues I faced in a [pull request in the react-redux repository](https://github.com/reduxjs/react-redux/pull/898#issuecomment-403169527).

## What is this about ?
When you use Redux, registering a lot of external data updates per second (like in collaborative applications, multiplayer games etc) in your data store can lead to a very noticeable performance drop. Some applications like stock market apps can heavily batch their updates to bypass those issues whereas in gaming-like apps you want the data out of your server and into your user data store as fast as possible to reduce lag between users.

Is this performance drop real, and is it caused by our React/Redux couple ? The test I proposed in HN to prove the impact is the following

> A good way to test it would be to make a simple websocket server that simulate n users each sending n' fake xyz position and rotation data per second. This data updates a Redux store in a React app made with Aframe (HTML wrapper around ThreeJS). You make n cubes move and rotate along the data in the store. Compare the fps you get against the fps you get with a vanilla solution. Also check what happens on the performance tab of chrome

So this is what I am implementing here with two differences

1) I don't simulate rotation but only position.

2) Due to lack of time I won't implement a vanilla (either React without Redux, or plain JS) alternative but it is fair to assume that since [most middle-end smartphones can render thousands of cubes in WebGL consistently above 40FPS](https://threejs.org/examples/?q=cubes#webgl_interactive_cubes) 5 cubes can move in a middle-end mobile WebGL context at a consistent 60FPS.

## How do I try it ?

To install the benchmark you have to clone the repo

```
git clone git@github.com:Kalkut/redux-data-frequency-benchmark.git
cd redux-data-frequency-benchmark
npm install
```

Then launch `node index.js` in one tab and `npm start` in another. Connect to your dev server at http://your.personal.computer.ip:3000 from a phone in the same local network than your dev machine.

## What are your results

### Hardware
I tried the benchmark on a Motorola Moto Z/Lenovo XT1650. It is a daydream ready phone with a Qualcomm Snapdragon 820 and 4 Go of RAM priced a bit above $300 on the biggest online retailer.

### Test case
I ran the default test with 5 synthetic users sending 4 data updates per second.

### Framerate
Framerate went as high as 55 fps and as low as 30 fps most of the time it was above 45.

### Performance profile
I ran Chrome Performance Profiler for 61630 ms

![Benchmark duration](https://image.ibb.co/gVph6o/test_time.png)

And ended up with this call tree

![Call Tree](https://image.ibb.co/jpTLsT/stack_trace.png)

### What is happening here ?

We see that **computations subsequent to calls to `dispatch` takes 25.3% of all the computation time**. This is consistent with the fact that our framerate is generally above 45fps instead of a solid 60fps. We also see that `dispatch` by itself is really inexpensive, it takes below 0.1% of our computation time. **_What is really costly is the fact that calling `dispatch` is basically the same thing than calling `this.setState` and that is followed by a lot of scripts that batches, parse, update and render our data updates_**.

Whether Redux is used or not `this.setState` is where performance is lost

## Conclusion

React and Redux are great abstractions that give higher productivity to developers and a better separation of concerns when building interfaces. With them and their functional inspirations (that I advise everyone to try !) comes a best practice : **immutability**. Immutability is clean and I am a  clear proponent of this practice. It is enforced by things such as the React state (a.k.a. don't mutate data) and Components where DOM manipulations are rightfully advised against.

In reality in tricky cases you may have to dirty yourself a bit with the DOM (at least to read data from it), this is basically why we have "refs". Applications with both high frequency of data updates and performance hungry rendering are in this uncomfortable position. **How you implement your data store has no importance, the problem is about how to render frequent data updates without triggering a React render with an expensive  `this.setState` call**. You then get torn between :

1) Accepting that it is slow and moving on (quite sad for your users)

2) Keeping React for this real-time feature and abusing mutating refs properties. You then have to keep those properties in memory before any occasional React render so that your can apply them in the new render or everything is lost. (It works but it is very hacky)

3) Accepting that even if you need React for the rest of your application (a good example here would be a web game user interface for a game made with [A-Frame](https://aframe.io/)) **you don't need React nor Redux for your real-time features**. You setup your own store and you mutate what is needed to preserve both computation time and memory. Then **you wrap it all in a React Component so that you can integrate it with your React App**.

**The choice 3 is the sanest** and the best example of that is [the way BabylonJS deals with this](https://doc.babylonjs.com/resources/babylonjs_and_reactjs) and it is interesting to notice that [after 2.5 years of work ngokevin (co-creator of A-Frame) gave up on aframe-react](https://github.com/ngokevin/aframe-react) he said :

> I recommend using vanilla A-Frame and aframe-state-component with static templating over aframe-react. React wastes a lot of cycles and incurs a lot of memory garbage. aframe-react is often abused where it is too easy to place 3D/real-time logic at the React layer, causing poor performance (e.g., doing React renders on ticks). aframe-react applications frequently ignore the prescribed ECS framework of A-Frame. Internally, React does tons of computation to compute what changed, and flushes it to the entire application. It is apparent React ecosystem does not care much about memory as most examples allocate functions and objects in the render method, and where immutables are popular. With only ~10ms per frame to do all computation, there is little room for React's massive system.

One last thing. Since `this.setState` is costly, you may prefer to be aware of when it is called by calling it by yourself rather than delegating those calls to a Flux library. I prefer to do so and it allows me to avoid a lot of boilerplate code, but Redux is a powerful abstraction that does a lot with just a few concepts and a very compact source code.

I hope it helps, don't hesitate to fork it and play with it to make your own mind !
