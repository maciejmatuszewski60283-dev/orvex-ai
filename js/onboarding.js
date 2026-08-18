document.addEventListener('DOMContentLoaded', () => {
  const dayPicker = document.getElementById('day-picker');
  const monthPicker = document.getElementById('month-picker');
  const yearPicker = document.getElementById('year-picker');
  const form = document.getElementById('onboarding-form');

  /**
   * Funkcja pomocnicza do tworzenia elementów listy
   * @param {HTMLElement} container
   * @param {number} start
   * @param {number} end
   * @param {boolean} [isMonth]
   */
  function populatePicker(container, start, end, isMonth = false) {
    const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    
    // Na górze już jest spacer zdefiniowany w HTML, więc tylko dodajemy wartości
    for (let i = start; i <= end; i++) {
      const div = document.createElement('div');
      div.className = 'picker-item';
      div.dataset.value = i;
      
      if (isMonth) {
        div.innerText = months[i - 1];
      } else {
        div.innerText = i < 10 ? `0${i}` : i; // Dodaje zero z przodu
      }
      
      container.insertBefore(div, container.lastElementChild); // Wstawia przed dolnym spacerem
    }
  }

  // Generowanie danych
  const currentYear = new Date().getFullYear();
  populatePicker(dayPicker, 1, 31);
  populatePicker(monthPicker, 1, 12, true);
  populatePicker(yearPicker, currentYear - 100, currentYear);

  // Ustawienie domyślnych wartości (np. środek listy) - wymusza scroll na środek
  setTimeout(() => {
    yearPicker.scrollTop = (currentYear - 2000) * 40; // Przewija w okolice rocznika 2000
    updateActiveItem(dayPicker);
    updateActiveItem(monthPicker);
    updateActiveItem(yearPicker);
  }, 100);

  /**
   * Funkcja wykrywająca, który element jest na środku nakładki
   * @param {HTMLElement} container
   */
  function updateActiveItem(container) {
    const items = container.querySelectorAll('.picker-item');
    const containerCenter = container.scrollTop + (container.clientHeight / 2);

    items.forEach(item => {
      const itemCenter = item.offsetTop + (item.clientHeight / 2);
      if (Math.abs(containerCenter - itemCenter) < 20) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Nasłuchiwanie przewijania na kolumnach
  [dayPicker, monthPicker, yearPicker].forEach(picker => {
    picker.addEventListener('scroll', () => {
      updateActiveItem(picker);
    });
  });

  // Obsługa wysłania formularza
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    
    // Pobieranie zaznaczonych wartości
    const activeDay = dayPicker.querySelector('.picker-item.active').dataset.value;
    const activeMonth = monthPicker.querySelector('.picker-item.active').dataset.value;
    const activeYear = yearPicker.querySelector('.picker-item.active').dataset.value;

    const birthDate = new Date(activeYear, activeMonth - 1, activeDay);
    const today = new Date();
    
    // Obliczanie wieku
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const isAdult = age >= 18;

    // Zapisywanie profilu do localStorage (symulacja bazy danych na ten moment)
    const userProfile = {
      firstName: firstName,
      lastName: lastName || null,
      birthDate: `${activeYear}-${activeMonth}-${activeDay}`,
      age: age,
      isAdult: isAdult,
      profileComplete: true
    };

    localStorage.setItem('orvex_user_profile', JSON.stringify(userProfile));

    // Przekierowanie do głównego interfejsu AI
    window.location.href = 'index.html';
  });
});
