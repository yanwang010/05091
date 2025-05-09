// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX = 320; // 圓的初始位置
let circleY = 240;
let circleSize = 100;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // Draw the circle
  fill(0, 255, 0, 150);
  noStroke();
  circle(circleX, circleY, circleSize);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Draw lines for keypoint groups
        drawKeypointLines(hand, [0, 1, 2, 3, 4]); // Thumb
        drawKeypointLines(hand, [5, 6, 7, 8]);   // Index finger
        drawKeypointLines(hand, [13, 14, 15, 16]); // Ring finger
        drawKeypointLines(hand, [17, 18, 19, 20]); // Pinky finger

        // Check if the left hand's index finger (keypoint 8) touches the circle
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];

        if (hand.handedness === "Left") {
          let d = dist(indexFinger.x, indexFinger.y, circleX, circleY);
          if (d < circleSize / 2) {
            // Move the circle with the index finger
            circleX = indexFinger.x;
            circleY = indexFinger.y;
          }

          // Check if both index finger and thumb touch the circle
          let dThumb = dist(thumb.x, thumb.y, circleX, circleY);
          if (d < circleSize / 2 && dThumb < circleSize / 2) {
            fill(255, 0, 0, 150); // Change circle color to red
            circle(circleX, circleY, circleSize);
          }
        }
      }
    }
  }
}

function drawKeypointLines(hand, indices) {
  for (let i = 0; i < indices.length - 1; i++) {
    let kp1 = hand.keypoints[indices[i]];
    let kp2 = hand.keypoints[indices[i + 1]];
    stroke(0, 255, 0);
    strokeWeight(2);
    line(kp1.x, kp1.y, kp2.x, kp2.y);
  }
}
