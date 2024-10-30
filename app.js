import problems from "./problems.js"

function hide(id) {
  document.getElementById(id).classList.add("hidden")
  update();
}

function show(id){
  document.getElementById(id).classList.remove("hidden") 
  update();
}

function update() {
  document.getElementById("handle_display").textContent = localStorage.getItem("handle")
  document.getElementById("rating_display").textContent = "" + localStorage.getItem("rating")
}

function is_logged_in() {
  if(localStorage.getItem("handle")) { 
    hide("login"); 
    show("navbar");
    show("game-setup");
  }
  else { 
    show("login"); 
    hide("navbar"); 
    hide("game-setup");
  }
  hide("game-screen")
}

function logout() {
  localStorage.setItem("handle", "");
  is_logged_in();
}

function probablity(a, b) {
  return 1 / (1 + Math.pow(10, (b - a) / 400.0));
}

function handle_submit(e) {
  e.preventDefault()
  let handle = document.getElementById("handle").value;
  localStorage.setItem("handle", handle);
  localStorage.setItem("rating", 800.00)
  is_logged_in();
}
document.getElementById("login").onsubmit = handle_submit
document.getElementById("logout").onclick = logout

function get_selected_problem(rating) {
  let l = problems.length;
  let threshold = 0.0
  while(true) {
    let i = Math.floor(Math.random() * l);
    let difficulty = 0.5 - (document.getElementById("difficulty").value / 100.0);
    console.log(difficulty)
    if(Math.abs(probablity(rating, problems[i]["rating"]) - difficulty) < threshold) {
      return problems[i];
    }
    threshold += 0.005
  } 
}

let timer = undefined


function handle_start(e) {
  e.preventDefault()

  let rating = +localStorage.getItem("rating");
  let problem = get_selected_problem(rating);

  document.getElementById("problem-link").href = `https://codeforces.com/contest/${problem["contestId"]}/problem/${problem["index"]}`
  document.getElementById("rating-descent").innerHTML = "-" + Math.round(32 * probablity(rating, problem["rating"]))
  document.getElementById("rating-ascent").innerHTML = "+" + Math.round(32 * probablity(problem["rating"], rating))

  localStorage.setItem("last_problem", JSON.stringify({
    problem, 
    startTime: Date.now(), 
    duration: 600
  }));
  console.log(localStorage.getItem("last_problem"))

  hide("login"); 
  show("game-screen")
  show("navbar");
  hide("game-setup");

  startTimer(600);
}

document.getElementById("start").onclick = handle_start
is_logged_in();

let timerInterval;
let secondsRemaining;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.textContent = formatTime(secondsRemaining);
}

function startTimer(seconds) {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Initialize timer
    secondsRemaining = seconds;
    updateDisplay();
    
    // Start countdown
    timerInterval = setInterval(() => {
        secondsRemaining--;
        updateDisplay();
        
        if (secondsRemaining <= 0) {
            endTimer();
        }
    }, 1000);
}

function endTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    hide("login"); 
    show("navbar");
    show("game-setup");
    hide("game-screen")
}

document.getElementById("solved").onclick = solved
function solved() {
  let last_problem = JSON.parse(localStorage.getItem("last_problem"))
  let problem = last_problem["problem"]
  console.log(last_problem)
  if(Date.now() - last_problem["start_time"] > last_problem["duration"]) {
    gave_up(); 
    return;
  }
  let rating = +localStorage.getItem("rating");
  rating += Math.round(32 * probablity(problem["rating"], rating))
  localStorage.setItem("rating", rating);
  endTimer()
}

document.getElementById("give-up").onclick = gave_up
function gave_up() {
  let last_problem = JSON.parse(localStorage.getItem("last_problem"))
  let problem = last_problem["problem"]
  let rating = +localStorage.getItem("rating"); 
  rating -= Math.round(32 * probablity(rating, problem["rating"]))
  localStorage.setItem("rating", rating);
  endTimer()
}
