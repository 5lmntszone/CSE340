document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger')
    const navContainer = document.querySelector('.nav-container')
  
    hamburger.addEventListener('click', function () {
      navContainer.classList.toggle('active')
    })
  })

document.addEventListener("DOMContentLoaded", () => {
    const pwd = document.getElementById("account_password")
    const toggle = document.getElementById("showPassword")
    if (pwd && toggle) {
      toggle.addEventListener("change", () => {
        pwd.type = toggle.checked ? "text" : "password"
      })
    }
  })
  
  
  