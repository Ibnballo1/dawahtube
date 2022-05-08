// First select the slide's wrapper
// which the select element

let slideShows = document.querySelectorAll('[data-slides = "slideBody"]');
slideShows.forEach(beginSlideShow);

function beginSlideShow(slideshow) {
    let slides = document.querySelectorAll(`#${slideshow.id} [role="list"] .slide`);

    let index = 0, time = 5000;
    slides[index].classList.add('active');

    setInterval(()=> {
        slides[index].classList.remove('active');
    
        index++;
        if (index === slides.length) {
            index = 0;
        }
        slides[index].classList.add('active');
    }, time);
    //console.log(slides);
}
