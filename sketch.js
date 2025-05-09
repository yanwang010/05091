// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX = 320; // 圓的初始位置
let circleY = 240;
let circleSize = 100;
let isDragging = false; // 是否正在拖動圓
let trail = []; // 儲存圓心的軌跡
let thumbTrail = []; // 儲存大拇指的軌跡

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

  // Draw the trails
  noFill();
  strokeWeight(10);
  for (let i = 1; i < trail.length; i++) {
    stroke(trail[i].color);
    line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
  }

  for (let i = 1; i < thumbTrail.length; i++) {
    stroke(thumbTrail[i].color);
    line(thumbTrail[i - 1].x, thumbTrail[i - 1].y, thumbTrail[i].x, thumbTrail[i].y);
  }

  // Draw the circle
  fill(0, 255, 0, 150);
  noStroke();
  circle(circleX, circleY, circleSize);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    isDragging = false; // Reset dragging state
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Draw lines for keypoint groups
        drawKeypointLines(hand, [0, 1, 2, 3, 4]); // Thumb
        drawKeypointLines(hand, [5, 6, 7, 8]);   // Index finger
        drawKeypointLines(hand, [13, 14, 15, 16]); // Ring finger
        drawKeypointLines(hand, [17, 18, 19, 20]); // Pinky finger

        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];

        // Check if the index finger touches the circle
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

        if (dIndex < circleSize / 2) {
          // Move the circle with the index finger
          circleX = indexFinger.x;
          circleY = indexFinger.y;
          trail.push({ x: circleX, y: circleY, color: 'red' });
          isDragging = true;
        }

        // Check if the thumb touches the circle
        if (dThumb < circleSize / 2) {
          circleX = thumb.x;
          circleY = thumb.y;
          thumbTrail.push({ x: circleX, y: circleY, color: hand.handedness === "Left" ? 'green' : 'red' });
          isDragging = true;
        }

        // Check if both index finger and thumb touch the circle
        if (dIndex < circleSize / 2 && dThumb < circleSize / 2) {
          fill(hand.handedness === "Left" ? 'green' : 'red');
          circle(circleX, circleY, circleSize);
        }
      }
    }
  }

  // Stop recording trail if not dragging
  if (!isDragging) {
    trail = [];
    thumbTrail = [];
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
