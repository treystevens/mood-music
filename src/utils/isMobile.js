function isMobile() {
  const logoContainer = document.querySelector('.logo-container');
  const cssProp = window
    .getComputedStyle(logoContainer, null)
    .getPropertyValue('position');
  let isMobile;

  if (cssProp == 'fixed') {
    const genreModalCloseBtn = Array.from(
      document.querySelectorAll('.close-modal-btn')
    );
    logoContainer.classList.toggle('show__elem');
    isMobile = true;

    // Remove Modal Close Button on phones
    if (genreModalCloseBtn.length > 0) {
      genreModalCloseBtn.forEach(element => {
        element.remove();
      });
    }
  } else {
    isMobile = false;
  }
  return isMobile;
}

export default isMobile;
