const showAnswer = (elem) => {
  elem.style.display = "block";
  window.setTimeout(() => {
    elem.classList.remove("bw-hidden");
    elem.classList.add("bw-visible");
  }, 100);
};

const hideAnswer = (elem) => {
  elem.classList.remove("bw-visible");
  elem.classList.add("bw-hidden");
  window.setTimeout(() => {
    elem.style.display = "none";
  }, 100);
};

// setTimeout(() => {
//   const a1Answer = document.querySelector("#a1-answer");
//   showAnswer(a1Answer);
//   const a2Answer = document.querySelector("#a2-answer");
//   showAnswer(a2Answer);
// }, 3000);

const callback = (entries, observer) => {
  entries.forEach((entry) => {
    const intersecting = entry.isIntersecting;
    const answerBottom = entry.boundingClientRect.bottom;
    const pageTopPortion = document.documentElement.clientHeight * 0.50;
    const answerHalfHeight = entry.boundingClientRect.height * 0.5
    const id = entry.target.id;
    console.table({ id, intersecting, answerBottom, pageTopPortion });

    if (intersecting == true) {
      console.log("it is visible");
      if(answerBottom < pageTopPortion){
        console.log("i am at top of page");
        // don't show if item is no longer visible
        const itemBox = entry.target.getBoundingClientRect();
        if(itemBox.bottom > 20){
          console.log("the bottom of meta point is still visible");
          const answerElement = document.querySelector(
            `#${entry.target.id}-answer`
          );
          setTimeout(() => {
            showAnswer(answerElement);
          }, 100);
        }

      }
    }
    // if (entry.isIntersecting) {
    //   console.log("item is visible");
    //   if (
    //     entry.boundingClientRect.bottom <
    //     document.documentElement.clientHeight * 0.15
    //   ) {
    //     console.log(
    //       "item is at top of page: ",
    //       entry.isIntersecting,
    //       entry.boundingClientRect.height
    //     );
    //     const answerElement = document.querySelector(
    //       `#${entry.target.id}-answer`
    //     );
    //     showAnswer(answerElement);
    //     // if (
    //     //   entry.boundingClientRect.bottom <
    //     //   entry.boundingClientRect.height * 0.5
    //     // ) {
    //     //   console.log("item bottom is less than 50% of its height");
    //
    //     // }
    //   }
    // }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
  };
  let observer = new IntersectionObserver(callback, options);
  const a1 = document.querySelector("#a1");
  const a2 = document.querySelector("#a2");
  observer.observe(a1);
  observer.observe(a2);

  const handleSkip = (evt) => {
    console.log("in handleSkip with: ", evt.target);
    const answerBox = evt.target.closest(".answer-box");
    window.scrollTo({
      top: answerBox.clientHeight + answerBox.offsetTop,
      behavior: "smooth",
    });
  };
  const skipButtons = [...document.querySelectorAll(".skipButton")];
  skipButtons.forEach((elem) => {
    elem.addEventListener("click", handleSkip);
  });

  const handleClose = (evt) => {
    console.log("in handleClose with: ", evt.target);
    const answerBox = evt.target.closest(".answer-box");
    hideAnswer(answerBox);
  };
  const closeButtons = [...document.querySelectorAll(".closeButton")];
  closeButtons.forEach((elem) => {
    elem.addEventListener("click", handleClose);
  });
});