const output = document.getElementById("output");

function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";

function startListening() {
  recognition.start();
  output.innerText = "Listening...";
}

recognition.onresult = function (event) {
  const command = event.results[0][0].transcript.toLowerCase();
  output.innerText = "You said: " + command;

  if (command.includes("hello")) {
    speak("Hello Roshan, how can I help you?");
  }

  else if (command.includes("time")) {
    const time = new Date().toLocaleTimeString();
    speak("The time is " + time);
  }

  else if (command.includes("open google")) {
    speak("Opening Google");
    window.open("https://www.google.com", "_blank");
  }

  else if (command.includes("open youtube")) {
    speak("Opening YouTube");
    window.open("https://www.youtube.com", "_blank");
  }

  else {
    speak("Sorry, I did not understand that");
  }
};

recognition.onerror = function () {
  speak("Sorry, there was an error. Please try again.");
};
