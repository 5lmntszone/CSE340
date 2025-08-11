document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger')
    const navContainer = document.querySelector('.nav-container')
  
    hamburger.addEventListener('click', function () {
      navContainer.classList.toggle('active')
    })
  })

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-toggle='password']").forEach(wrapper => {
      const pwd = wrapper.querySelector("input[type='password'], input[type='text']")
      const toggle = wrapper.querySelector("input[type='checkbox']")
      if (pwd && toggle) {
        toggle.addEventListener("change", () => {
          pwd.type = toggle.checked ? "text" : "password"
        })
      }
    })
  })
  
  
  
  